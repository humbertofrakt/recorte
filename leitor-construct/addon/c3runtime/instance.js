// SPDX-License-Identifier: Apache-2.0
// O objeto Recorte no JOGO (rodadas K1, K2, K4, K5, K6 e K7, 05/10/2026).
//
// Ele só faz a ponte com o Construct. Toda conta é do pacote
// (globalThis.RecorteRuntime, em recorte-runtime.js), testado no Node:
//   carregarBoneco  lê o .bone, o atlas e os aninhados da pasta Files
//   Tocador         toca a animação e anda o tempo
//   pecasDoQuadro e montarLotes   viram a pose nas listas do drawMesh
//
// SUPOSIÇÕES sobre o Construct r449 (a página não abriu: verificação de robô).
// Lidas no r495 (definições do plugin do Spine, GitHub) e no exemplo oficial
// "drawingPlugin" do SDK v2 que pedia r401:
//   - renderer.drawMesh(posições x,y,z; uv; índices Uint16; cores RGBA)
//     https://www.construct.net/en/make-games/manuals/addon-sdk/reference/graphics-interfaces/irenderer
//   - renderer.setBlendMode("normal" | "additive" | "multiply" | "screen")
//   - renderer.createDynamicTexture + updateTexture(..., { premultiplyAlpha })
//   - runtime.assets.getProjectFileUrl + fetchArrayBuffer / fetchBlob
//   - a cor dos vértices vai MULTIPLICADA pelo alpha (o Construct desenha assim)
// Se uma delas não existir no r449, o console diz qual, com "[Recorte]".

const C3 = globalThis.C3;

// A ordem das propriedades do plugin.js (do editor).
const PROP_ARQUIVO = 0;
const PROP_ANIMACAO = 1;
const PROP_EM_LACO = 2;
const PROP_ESCALA = 3;
const PROP_SKINS = 4;

C3.Plugins.Recorte_Leitor.Instance = class RecorteInstance extends globalThis.ISDKWorldInstanceBase
{
	constructor()
	{
		super();

		const p = this._getInitProperties() || [];
		this._arquivo = String(p[PROP_ARQUIVO] ?? "");
		this._animacaoInicial = String(p[PROP_ANIMACAO] ?? "");
		this._emLacoInicial = p[PROP_EM_LACO] !== false;
		const escala = Number(p[PROP_ESCALA]);
		this._escala = Number.isFinite(escala) && escala !== 0 ? escala : 1;

		this._R = globalThis.RecorteRuntime;
		this._avisos = this._R ? new this._R.Avisos() : null;
		this._tocador = null;
		this._imagens = new Map();		// página → ImageBitmap
		this._texturas = new Map();		// página → textura do Construct
		this._premultiplicada = new Map();	// página → a imagem já vem multiplicada?
		this._pendente = null;			// "Tocar" pedido antes de o boneco carregar
		this._skinsPendentes = [];		// "Vestir"/"Tirar" pedidos antes de carregar, na ordem
		this._config = { velocidade: 1, pausado: false };	// vale antes e depois de carregar
		this._espelhado = false;
		this._ocorrencia = null;		// o que o gatilho da vez olha (Ao terminar, Ao evento)
		this._ultimoEvento = null;		// para EventoNome, EventoInteiro, EventoNumero, EventoTexto
		this._ultimoEncaixe = null;		// para SlotDoEncaixe
		this._filaConexao = [];			// Encaixar, Desencaixar, Animar...: na ordem, esperando a peça carregar
		this._drenando = false;
		this._pedidas = new Map();		// peça → a leitura dela em andamento (uma por peça)
		this._erro = "";

		if (!this._R)
		{
			this._falhar("o pacote recorte-runtime.js não carregou (globalThis.RecorteRuntime não existe).");
			return;
		}
		if (this._animacaoInicial !== "")
			this._pendente = { nome: this._animacaoInicial, emLaco: this._emLacoInicial };
		// "Skins iniciais": vestidas na ordem, como se fosse a ação Vestir.
		for (const nome of this._R.skinsDaPropriedade(String(p[PROP_SKINS] ?? "")))
			this._skinsPendentes.push(["vestir", nome]);

		this._setTicking(true);
		this._carregar();
	}

	_release()
	{
		this._soltarTexturas();
		for (const img of this._imagens.values())
			if (img && typeof img.close === "function") img.close();
		this._imagens.clear();
		super._release();
	}

	// --- carregar ----------------------------------------------------------

	async _ler(caminho)
	{
		try
		{
			const url = await this.runtime.assets.getProjectFileUrl(caminho);
			const buf = await this.runtime.assets.fetchArrayBuffer(url);
			return new Uint8Array(buf);
		}
		catch (e)
		{
			return null;
		}
	}

	async _carregar()
	{
		const R = this._R;
		try
		{
			const boneco = await R.carregarBoneco(this._arquivo, (c) => this._ler(c));
			for (const a of boneco.avisos)
				this._avisos.avisar("carregar:" + a, a);

			await this._carregarImagens(boneco);

			this._tocador = new R.Tocador(boneco.arquivo.data, this._avisos);
			const barra = this._arquivo.lastIndexOf("/");
			this._tocador.pasta = barra < 0 ? "" : this._arquivo.slice(0, barra + 1);
			// As contas das partículas, guardadas entre um quadro e outro (só velocidade:
			// o desenho é o mesmo sem elas).
			this._particulas = new R.ParticleCache();
			const caixa = R.caixaDaInstancia(boneco.arquivo.data.meta, this._escala);
			this.setSize(caixa.largura, caixa.altura);

			for (const [gesto, nome] of this._skinsPendentes)
				gesto === "vestir" ? this._tocador.vestir(nome) : this._tocador.tirar(nome);
			this._skinsPendentes = [];
			this._tocador.velocidade = this._config.velocidade;
			this._tocador.pausado = this._config.pausado;

			if (this._pendente)
			{
				this._tocador.tocar(this._pendente.nome, this._pendente.emLaco);
				this._pendente = null;
			}
		}
		catch (e)
		{
			this._falhar(e && e.message ? e.message : String(e));
		}
		this._mostrarAvisos();
		this._redesenhar();
		// Os encaixes pedidos antes de o boneco carregar.
		if (this._tocador) await this._drenarConexao();
	}

	/** As imagens de cada página do atlas, da pasta Files (as que ainda não estão aqui). */
	async _carregarImagens(boneco)
	{
		const paginas = new Map();
		for (const atlas of boneco.arquivo.atlases)
			for (const pg of atlas.pages) paginas.set(pg.name, pg);
		for (const [nome, caminho] of boneco.imagens)
		{
			if (this._imagens.has(nome)) continue;
			try
			{
				const url = await this.runtime.assets.getProjectFileUrl(caminho);
				const blob = await this.runtime.assets.fetchBlob(url);
				const pg = paginas.get(nome);
				const jaMultiplicada = !!(pg && pg.premultiplied);
				const img = await createImageBitmap(blob, { premultiplyAlpha: jaMultiplicada ? "none" : "premultiply" });
				this._imagens.set(nome, img);
				this._premultiplicada.set(nome, jaMultiplicada);
			}
			catch (e)
			{
				this._avisos.avisar("imagem:" + caminho, `A imagem "${caminho}" não abriu (página "${nome}" do atlas): ${e && e.message ? e.message : e}`);
			}
		}
	}

	// --- a conexão (K5) -------------------------------------------------------

	/**
	 * Um gesto de conexão, na ordem em que o jogo pediu. "precisa" são as peças
	 * que ele usa: a que ainda não foi lida da pasta Files é lida antes, e os
	 * gestos de depois esperam (Encaixar e, no mesmo evento, Animar a peça).
	 * Sem nada a ler, o gesto acontece na hora, dentro da ação.
	 */
	_conexao(precisa, fazer)
	{
		this._filaConexao.push({ precisa, fazer });
		this._drenarConexao();
	}

	async _drenarConexao()
	{
		if (this._drenando || !this._tocador) return;
		this._drenando = true;
		while (this._filaConexao.length > 0)
		{
			const gesto = this._filaConexao[0];
			for (const caminho of gesto.precisa)
				if (!this._tocador.temEntidade(caminho)) await this._carregarEntidade(caminho);
			this._filaConexao.shift();
			gesto.fazer(this._tocador);
		}
		this._drenando = false;
		this._mostrarAvisos();
		this._redesenhar();
	}

	/** Lê uma peça da pasta Files, com as imagens dela. Falhou: avisa, e o Encaixar avisa de novo. */
	_carregarEntidade(caminho)
	{
		let p = this._pedidas.get(caminho);
		if (p) return p;
		p = (async () =>
		{
			try
			{
				const boneco = await this._R.carregarBoneco(caminho, (c) => this._ler(c));
				for (const a of boneco.avisos)
					this._avisos.avisar("carregar:" + caminho + ":" + a, `${caminho}: ${a}`);
				await this._carregarImagens(boneco);
				this._tocador.registrarEntidade(caminho, boneco.arquivo.data);
			}
			catch (e)
			{
				this._avisos.avisar("peca:" + caminho, `A peça "${caminho}" não abriu: ${e && e.message ? e.message : e}`);
			}
			this._pedidas.delete(caminho);
		})();
		this._pedidas.set(caminho, p);
		return p;
	}

	_falhar(texto)
	{
		this._erro = texto;
		if (this._avisos) this._avisos.avisar("erro", texto);
		console.error("[Recorte] " + texto);
	}

	/** Os avisos novos vão para o console, uma vez cada (regra 21). */
	_mostrarAvisos()
	{
		if (!this._avisos) return;
		for (const a of this._avisos.novos())
			console.warn("[Recorte] " + a);
	}

	_redesenhar()
	{
		const sdk = this.runtime.sdk;
		if (sdk && typeof sdk.updateRender === "function") sdk.updateRender();
	}

	// --- o tempo -----------------------------------------------------------

	_tick()
	{
		if (!this._tocador) return;
		this._tocador.avancar(this.runtime.dt);
		// O que aconteceu neste passo vira gatilho, um de cada vez, na ordem.
		const Cnds = C3.Plugins.Recorte_Leitor.Cnds;
		for (const o of this._tocador.tirarOcorrencias())
		{
			this._ocorrencia = o;
			if (o.tipo === "evento")
			{
				this._ultimoEvento = o;
				this._trigger(Cnds.AoEvento);
			}
			else if (o.tipo === "encaixou")
			{
				this._ultimoEncaixe = o;
				this._trigger(Cnds.AoEncaixar);
			}
			else
			{
				this._trigger(Cnds.AoTerminar);
			}
		}
		this._ocorrencia = null;
		this._mostrarAvisos();
		this._redesenhar();
	}

	/** Velocidade e pausa: guardadas aqui, e passadas ao boneco (agora, ou ao carregar). */
	_mudar(chave, valor)
	{
		if (chave === "velocidade" && (!Number.isFinite(valor) || valor < 0))
		{
			this._avisos.avisar("velocidade:" + valor, `Velocidade ${valor} não serve (tem de ser um número de 0 para cima): fica ${this._config.velocidade}.`);
			this._mostrarAvisos();
			return;
		}
		this._config[chave] = valor;
		if (this._tocador) this._tocador[chave] = valor;
	}

	// --- o desenho -----------------------------------------------------------

	_textura(renderer, pagina)
	{
		let t = this._texturas.get(pagina.name);
		if (t) return t;
		const img = this._imagens.get(pagina.name);
		if (!img) return null;
		const suave = pagina.minFilter !== "nearest";
		t = renderer.createDynamicTexture(img.width, img.height, {
			wrapX: "clamp-to-edge",
			wrapY: "clamp-to-edge",
			defaultSampling: suave ? "bilinear" : "nearest",
			mipMap: false
		});
		renderer.updateTexture(img, t, { premultiplyAlpha: !this._premultiplicada.get(pagina.name) });
		this._texturas.set(pagina.name, t);
		return t;
	}

	_soltarTexturas()
	{
		const r = this.runtime && this.runtime.renderer;
		for (const t of this._texturas.values())
			if (r && typeof r.deleteTexture === "function") r.deleteTexture(t);
		this._texturas.clear();
	}

	_onRendererContextLost()
	{
		this._texturas.clear();		// as imagens ficam; as texturas renascem no próximo desenho
	}

	_draw(renderer)
	{
		if (!this._tocador || !this.isVisible) return;
		const R = this._R;

		const vista = this._vista();
		const pecas = R.pecasDoQuadro(this._tocador.esqueleto, this._avisos, { particulas: this._particulas });
		const lotes = R.montarLotes(pecas, vista);

		renderer.setTextureFillMode();
		for (const lote of lotes)
		{
			const t = this._textura(renderer, lote.pagina);
			if (!t)
			{
				this._avisos.avisar("textura:" + lote.pagina.name, `A página "${lote.pagina.name}" do atlas não tem imagem carregada: ${lote.pecas.length} peça(s) não desenhada(s).`);
				continue;
			}
			this._mistura(renderer, lote.mistura);
			renderer.setTexture(t);
			renderer.drawMesh(lote.posicoes, lote.uvs, lote.indices, lote.cores);
		}
		renderer.setBlendMode("normal");
	}

	/** Onde a instância está no layout, e como o boneco cabe nela (o desenho e o OssoX usam a mesma). */
	_vista()
	{
		const cor = this.colorRgb;
		return {
			x: this.x,
			y: this.y,
			angulo: this.angle,
			escalaX: this._espelhado ? -this._escala : this._escala,
			escalaY: this._escala,
			z: this.totalZElevation || 0,
			cor: [cor ? cor[0] : 1, cor ? cor[1] : 1, cor ? cor[2] : 1, this.opacity]
		};
	}

	/**
	 * Um osso ("osso") ou o pino da peça de um slot ("slot"), no layout, com o Y
	 * do Construct: { x, y, angulo }. Antes de carregar, ou nome que não existe:
	 * a posição da instância e o ângulo dela (e o aviso, no segundo caso).
	 */
	_noLayout(tipo, nome)
	{
		const parado = { x: this.x, y: this.y, angulo: (this.angle * 180) / Math.PI };
		if (!this._tocador) return parado;
		const t = this._tocador;
		const m = tipo === "osso" ? t.matrizDoOsso(String(nome)) : t.matrizDoSlot(String(nome));
		this._mostrarAvisos();
		return m ? this._R.noLayout(this._vista(), m) : parado;
	}

	/**
	 * A mistura do lote (7.12): o brilho das partículas é a "additive". Se o
	 * Construct deste computador recusar o nome, o lote sai em "normal" e o
	 * leitor AVISA qual mistura faltou (regra 21) — não troca calado.
	 */
	_mistura(renderer, mistura)
	{
		const nome = this._R.MISTURA_DO_CONSTRUCT[mistura] || "normal";
		try
		{
			renderer.setBlendMode(nome);
		}
		catch (e)
		{
			this._avisos.avisar("mistura:" + nome, `O Construct recusou a mistura "${nome}" (${e && e.message ? e.message : e}): o que pede "${mistura}" sai em "normal".`);
			renderer.setBlendMode("normal");
		}
	}

	// --- o que os eventos usam ------------------------------------------------

	_tocar(nome, emLaco)
	{
		if (!this._tocador)
		{
			this._pendente = { nome, emLaco };
			return;
		}
		this._tocador.tocar(nome, emLaco);
		this._mostrarAvisos();
		this._redesenhar();
	}

	_skin(gesto, nome)
	{
		if (!this._tocador)
		{
			this._skinsPendentes.push([gesto, nome]);
			return;
		}
		if (gesto === "vestir") this._tocador.vestir(nome);
		else this._tocador.tirar(nome);
		this._mostrarAvisos();
		this._redesenhar();
	}

	_pilhaDeSkins()
	{
		if (this._tocador) return this._tocador.pilha;
		// Antes de carregar: a pilha que vai ficar, contando os pedidos.
		let pilha = ["default"];
		for (const [gesto, nome] of this._skinsPendentes)
		{
			pilha = pilha.filter((n) => n !== nome);
			if (gesto === "vestir") pilha.push(nome);
		}
		return pilha;
	}

	_nomeTocando()
	{
		if (!this._tocador) return this._pendente ? this._pendente.nome : "";
		return this._tocador.nomeTocando;
	}

	_textoDosAvisos()
	{
		return this._avisos ? this._avisos.todos().join("\n") : this._erro;
	}

	_saveToJson()
	{
		const t = this._tocador;
		return {
			// K5: os encaixes do jogo, na ordem em que foram feitos, e as ordens das peças.
			encaixes: t ? [...t.encaixesDoJogo].map(([slot, e]) => ({ slot, caminho: e.caminho, emVolta: e.emVolta || "" })) : [],
			pecas: t ? [...t.ordensDoJogo].map(([slot, o]) => ({ slot, animacao: o.animacao, laco: o.laco, relogio: o.relogio })) : [],
			animacao: this._nomeTocando(),
			emLaco: this._tocador ? this._tocador.emLacoTocando : (this._pendente ? this._pendente.emLaco : true),
			skins: this._pilhaDeSkins(),
			velocidade: this._config.velocidade,
			pausado: this._config.pausado,
			espelhado: this._espelhado
		};
	}

	_loadFromJson(o)
	{
		if (o && typeof o.velocidade === "number") this._mudar("velocidade", o.velocidade);
		if (o && typeof o.pausado === "boolean") this._mudar("pausado", o.pausado);
		if (o && typeof o.espelhado === "boolean") this._espelhado = o.espelhado;
		if (o && Array.isArray(o.skins) && this._tocador)
		{
			for (const nome of this._tocador.pilha) this._tocador.tirar(nome);
			for (const nome of o.skins) this._tocador.vestir(String(nome));
		}
		else if (o && Array.isArray(o.skins))
		{
			this._skinsPendentes = [["tirar", "default"], ...o.skins.map((n) => ["vestir", String(n)])];
		}
		if (o && typeof o.animacao === "string" && o.animacao !== "")
			this._tocar(o.animacao, o.emLaco !== false);
		// K5: tira os encaixes de agora e refaz os salvos, pela mesma fila das ações
		// (a peça que não está carregada é lida da pasta Files antes).
		if (o && Array.isArray(o.encaixes))
		{
			const agora = this._tocador ? [...this._tocador.encaixesDoJogo.keys()] : [];
			for (const slot of agora) this._conexao([], (t) => t.desencaixar(slot));
			for (const e of o.encaixes)
				this._conexao([String(e.caminho)], (t) => t.encaixar(String(e.slot), String(e.caminho), String(e.emVolta || "")));
		}
		if (o && Array.isArray(o.pecas))
		{
			for (const p of o.pecas)
			{
				if (p.animacao === null) this._conexao([], (t) => t.soltarPeca(String(p.slot)));
				else this._conexao([], (t) => t.animarPeca(String(p.slot), String(p.animacao), p.laco !== false, Number(p.relogio) || 0));
			}
		}
	}
};

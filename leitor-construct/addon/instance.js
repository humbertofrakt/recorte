// SPDX-License-Identifier: Apache-2.0
// O objeto Recorte no EDITOR de layout (rodada K7, 05/10/2026).
//
// Desenha o boneco PARADO (a pose de repouso, com as "Skins iniciais"), do
// tamanho certo, para posicionar na fase. A conta é a mesma do jogo, do mesmo
// pacote (globalThis.RecorteRuntime): pecasDoQuadro e montarLotes.
//
// SUPOSIÇÕES sobre o editor do Construct r449 (a página não abriu: verificação
// de robô). Lidas nas definições r495 do plugin do Spine (GitHub):
//   - this._inst.GetProject().GetProjectFileByExportPath(caminho), ou o antigo
//     GetProjectFileByName(nome); o arquivo dá GetBlob()
//   - iRenderer.CreateDynamicTexture / UpdateTexture / SetTexture / SetBlendMode
//     / SetTextureFillMode / DrawMesh(posições x,y,z; uv; índices; cores)
//   - iDrawParams.GetLayoutView().Refresh() redesenha a vista
//   - this._inst.GetX/GetY/GetAngle (radianos)/SetSize/GetPropertyValue
//     https://www.construct.net/en/make-games/manuals/addon-sdk/reference/sdk-interfaces/iworldinstance
// Se uma faltar, a caixa fica vermelha e o console diz qual, com "[Recorte]".

const SDK = globalThis.SDK;

const PLUGIN_CLASS = SDK.Plugins.Recorte_Leitor;

PLUGIN_CLASS.Instance = class RecorteInstance extends SDK.IWorldInstanceBase
{
	constructor(sdkType, inst)
	{
		super(sdkType, inst);
		this._tocador = null;
		this._imagens = new Map();		// página → ImageBitmap
		this._premultiplicada = new Map();
		this._texturas = new Map();		// página → textura do editor
		this._velhas = [];			// texturas a apagar no próximo desenho
		this._geracao = 0;			// cada recarga ganha um número; a velha não sobrescreve a nova
		this._erro = "";
		this._vista = null;			// a vista de layout, para pedir redesenho
	}

	Release()
	{
		for (const img of this._imagens.values())
			if (img && typeof img.close === "function") img.close();
	}

	OnCreate()
	{
		this._carregar();
	}

	OnPlacedInLayout()
	{
		this._carregar();
	}

	OnPropertyChanged(id, value)
	{
		if (id === "arquivo" || id === "skins" || id === "escala")
			this._carregar();
	}

	LoadC2Property(name, valueString)
	{
		return false;
	}

	// --- ler da pasta Files do projeto --------------------------------------

	_arquivoDoProjeto(caminho)
	{
		const projeto = this._inst.GetProject();
		let f = null;
		if (typeof projeto.GetProjectFileByExportPath === "function")
			f = projeto.GetProjectFileByExportPath(caminho);
		if (!f && typeof projeto.GetProjectFileByName === "function")
			f = projeto.GetProjectFileByName(caminho.split("/").pop());
		return f || null;
	}

	async _ler(caminho)
	{
		const f = this._arquivoDoProjeto(caminho);
		if (!f) return null;
		return new Uint8Array(await f.GetBlob().arrayBuffer());
	}

	async _carregar()
	{
		const geracao = ++this._geracao;
		const R = globalThis.RecorteRuntime;
		if (!R)
		{
			this._falhar("o pacote recorte-runtime.js não carregou no editor.");
			return;
		}
		const arquivo = String(this._inst.GetPropertyValue("arquivo") || "");
		const escala = Number(this._inst.GetPropertyValue("escala")) || 1;
		const skins = R.skinsDaPropriedade(String(this._inst.GetPropertyValue("skins") || ""));
		try
		{
			const boneco = await R.carregarBoneco(arquivo, (c) => this._ler(c));
			const paginas = new Map();
			for (const atlas of boneco.arquivo.atlases)
				for (const pg of atlas.pages) paginas.set(pg.name, pg);
			const imagens = new Map();
			const premult = new Map();
			for (const [nome, caminho] of boneco.imagens)
			{
				const f = this._arquivoDoProjeto(caminho);
				if (!f) continue;
				const pg = paginas.get(nome);
				const ja = !!(pg && pg.premultiplied);
				imagens.set(nome, await createImageBitmap(f.GetBlob(), { premultiplyAlpha: ja ? "none" : "premultiply" }));
				premult.set(nome, ja);
			}
			if (geracao !== this._geracao) return;	// uma recarga mais nova já começou

			const avisos = new R.Avisos();
			for (const a of boneco.avisos) avisos.avisar(a, a);
			const tocador = new R.Tocador(boneco.arquivo.data, avisos);
			for (const nome of skins) tocador.vestir(nome);

			for (const t of this._texturas.values()) this._velhas.push(t);
			this._texturas = new Map();
			this._imagens = imagens;
			this._premultiplicada = premult;
			this._tocador = tocador;
			this._erro = "";
			const caixa = R.caixaDaInstancia(boneco.arquivo.data.meta, escala);
			this._inst.SetSize(caixa.largura, caixa.altura);
			for (const a of avisos.novos()) console.warn("[Recorte] " + a);
		}
		catch (e)
		{
			if (geracao !== this._geracao) return;
			this._tocador = null;
			this._falhar(e && e.message ? e.message : String(e));
		}
		if (this._vista) this._vista.Refresh();
	}

	_falhar(texto)
	{
		this._erro = texto;
		console.warn("[Recorte] " + texto);
	}

	// --- o desenho no editor -------------------------------------------------

	_textura(iRenderer, pagina)
	{
		let t = this._texturas.get(pagina.name);
		if (t) return t;
		const img = this._imagens.get(pagina.name);
		if (!img) return null;
		t = iRenderer.CreateDynamicTexture(img.width, img.height, {
			wrapX: "clamp-to-edge",
			wrapY: "clamp-to-edge",
			defaultSampling: pagina.minFilter !== "nearest" ? "bilinear" : "nearest",
			mipMap: false
		});
		iRenderer.UpdateTexture(img, t, { premultiplyAlpha: !this._premultiplicada.get(pagina.name) });
		this._texturas.set(pagina.name, t);
		return t;
	}

	Draw(iRenderer, iDrawParams)
	{
		if (iDrawParams && typeof iDrawParams.GetLayoutView === "function")
			this._vista = iDrawParams.GetLayoutView();
		for (const t of this._velhas) iRenderer.DeleteTexture(t);
		this._velhas = [];

		const R = globalThis.RecorteRuntime;
		if (!this._tocador || !R)
		{
			// Ainda carregando (marrom), ou deu erro (vermelho): a caixa marca o lugar.
			iRenderer.SetAlphaBlend();
			iRenderer.SetColorFillMode();
			if (this._erro) iRenderer.SetColorRgba(0.4, 0, 0, 0.4);
			else iRenderer.SetColorRgba(0.35, 0.2, 0.05, 0.35);
			iRenderer.Quad(this._inst.GetQuad());
			return;
		}

		const escala = Number(this._inst.GetPropertyValue("escala")) || 1;
		let cor = [1, 1, 1, 1];
		const c = typeof this._inst.GetColor === "function" ? this._inst.GetColor() : null;
		if (c && typeof c.getR === "function") cor = [c.getR(), c.getG(), c.getB(), c.getA()];
		const opacidade = typeof this._inst.GetOpacity === "function" ? this._inst.GetOpacity() : 1;
		const vista = {
			x: this._inst.GetX(),
			y: this._inst.GetY(),
			angulo: this._inst.GetAngle(),
			escalaX: escala,
			escalaY: escala,
			cor: [cor[0], cor[1], cor[2], cor[3] * opacidade]
		};
		const lotes = R.montarLotes(R.pecasDoQuadro(this._tocador.esqueleto, this._tocador.avisos), vista);
		iRenderer.SetTextureFillMode();
		for (const lote of lotes)
		{
			const t = this._textura(iRenderer, lote.pagina);
			if (!t) continue;
			iRenderer.SetBlendMode(R.MISTURA_DO_CONSTRUCT[lote.mistura] || "normal");
			iRenderer.SetTexture(t);
			iRenderer.DrawMesh(lote.posicoes, lote.uvs, lote.indices, lote.cores);
		}
		iRenderer.SetBlendMode("normal");
		for (const a of this._tocador.avisos.novos()) console.warn("[Recorte] " + a);
	}
};

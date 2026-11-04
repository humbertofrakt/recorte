// SPDX-License-Identifier: Apache-2.0
const C3 = globalThis.C3;

// O último evento do .bone que disparou (para usar dentro do "Ao evento").
function evento(inst)
{
	const o = inst._ultimoEvento;
	return o || { nome: "", inteiro: 0, numero: 0, texto: "" };
}

C3.Plugins.Recorte_Leitor.Exps =
{
	// O nome da animação que está tocando ("" quando nenhuma).
	AnimacaoTocando()
	{
		return this._nomeTocando();
	},

	// A velocidade da animação (1 = normal).
	Velocidade()
	{
		return this._config.velocidade;
	},

	EventoNome()
	{
		return evento(this).nome;
	},

	EventoInteiro()
	{
		return evento(this).inteiro;
	},

	EventoNumero()
	{
		return evento(this).numero;
	},

	EventoTexto()
	{
		return evento(this).texto;
	},

	// A pilha de skins, de baixo para cima, separada por vírgula.
	Skins()
	{
		return this._pilhaDeSkins().join(",");
	},

	// Tudo o que o leitor avisou, uma linha por aviso (regra 21: o que ele não
	// entende, ele diz). Também sai no console, com "[Recorte]".
	Avisos()
	{
		return this._textoDosAvisos();
	},

	// Os slots do boneco, separados por vírgula ("" antes de carregar).
	Slots()
	{
		return this._tocador ? this._tocador.slots.join(",") : "";
	},

	// As peças que o jogo já carregou da pasta Files, separadas por vírgula.
	Entidades()
	{
		return this._tocador ? this._tocador.entidadesCarregadas.join(",") : "";
	},

	// O que o slot mostra agora: o arquivo da peça, o nome da imagem, ou "".
	PecaDoSlot(slot)
	{
		if (!this._tocador) return "";
		const r = this._tocador.pecaDoSlot(String(slot));
		this._mostrarAvisos();
		return r;
	},

	// O slot do último encaixe (para usar dentro do "Ao encaixar").
	SlotDoEncaixe()
	{
		return this._ultimoEncaixe ? this._ultimoEncaixe.slot : "";
	},

	// Um objeto do Construct seguindo um osso: a origem do osso no layout, e o
	// ângulo do eixo dele, em graus, como o Angle do Construct.
	OssoX(osso)
	{
		return this._noLayout("osso", osso).x;
	},

	OssoY(osso)
	{
		return this._noLayout("osso", osso).y;
	},

	OssoAngulo(osso)
	{
		return this._noLayout("osso", osso).angulo;
	},

	// O mesmo para a peça de um slot: o pino dela (onde a imagem ou a entidade está).
	SlotX(slot)
	{
		return this._noLayout("slot", slot).x;
	},

	SlotY(slot)
	{
		return this._noLayout("slot", slot).y;
	},

	SlotAngulo(slot)
	{
		return this._noLayout("slot", slot).angulo;
	}
};

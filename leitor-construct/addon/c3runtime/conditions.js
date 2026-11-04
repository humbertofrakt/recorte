// SPDX-License-Identifier: Apache-2.0
const C3 = globalThis.C3;

C3.Plugins.Recorte_Leitor.Cnds =
{
	// "Está tocando a animação": a que acabou (sem laço) não está mais tocando.
	Tocando(nome)
	{
		return this._tocador ? this._tocador.estaTocando(String(nome)) : false;
	},

	// Gatilho "Ao terminar a animação": nome vazio vale para qualquer uma.
	AoTerminar(nome)
	{
		const o = this._ocorrencia;
		return !!o && o.tipo === "terminou" && (nome === "" || o.animacao === String(nome));
	},

	// Gatilho "Ao evento": um evento do .bone passou. Nome vazio vale para qualquer um.
	AoEvento(nome)
	{
		const o = this._ocorrencia;
		return !!o && o.tipo === "evento" && (nome === "" || o.nome === String(nome));
	},

	// "Está vestindo a skin": a skin está na pilha, em qualquer altura.
	Vestindo(nome)
	{
		return this._pilhaDeSkins().includes(String(nome));
	},

	// "Está espelhado".
	Espelhado()
	{
		return this._espelhado;
	},

	// Gatilho "Ao encaixar": o jogo encaixou uma peça. Slot vazio vale para qualquer um.
	AoEncaixar(slot)
	{
		const o = this._ocorrencia;
		return !!o && o.tipo === "encaixou" && (slot === "" || o.slot === String(slot));
	},

	// "O slot mostra a peça": o arquivo da entidade, ou o nome da imagem (como PecaDoSlot).
	MostraPeca(slot, peca)
	{
		if (!this._tocador) return false;
		const r = this._tocador.pecaDoSlot(String(slot)) === String(peca);
		this._mostrarAvisos();
		return r;
	}
};

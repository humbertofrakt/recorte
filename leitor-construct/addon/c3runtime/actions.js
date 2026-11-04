// SPDX-License-Identifier: Apache-2.0
const C3 = globalThis.C3;

C3.Plugins.Recorte_Leitor.Acts =
{
	// "Tocar animação": o laço é o combo do aces.json — 0 = em laço, 1 = uma vez.
	Tocar(nome, laco)
	{
		this._tocar(String(nome), laco === 0);
	},

	// "Mudar a velocidade": 1 = a do editor.
	MudarVelocidade(velocidade)
	{
		this._mudar("velocidade", Number(velocidade));
	},

	// "Pausar": o tempo do boneco para; a pose fica.
	Pausar()
	{
		this._mudar("pausado", true);
	},

	// "Continuar": de onde parou.
	Continuar()
	{
		this._mudar("pausado", false);
	},

	// "Vestir skin": no topo da pilha, a de cima vence.
	Vestir(nome)
	{
		this._skin("vestir", String(nome));
	},

	// "Tirar skin": só aquela; as outras ficam.
	Tirar(nome)
	{
		this._skin("tirar", String(nome));
	},

	// "Espelhar": o combo do aces.json — 0 = espelhado, 1 = normal.
	Espelhar(lado)
	{
		this._espelhado = lado === 0;
		this._redesenhar();
	},

	// "Encaixar": a peça (um .bone da pasta Files) no slot. "meio" vazio = em
	// bloco; com o nome de um slot da peça = em volta do boneco (o "Este boneco").
	Encaixar(peca, slot, meio)
	{
		const caminho = String(peca);
		this._conexao([caminho], (t) => t.encaixar(String(slot), caminho, String(meio)));
	},

	// "Desencaixar": a imagem de antes volta.
	Desencaixar(slot)
	{
		this._conexao([], (t) => t.desencaixar(String(slot)));
	},

	// "Encaixar todas": todo slot que mostra "de" passa a mostrar "para" (as rodas).
	EncaixarTodas(de, para, meio)
	{
		const caminho = String(para);
		this._conexao([caminho], (t) => t.encaixarTodas(String(de), caminho, String(meio)));
	},

	// "Animar a peça": o combo do laço — 0 = em laço, 1 = uma vez.
	AnimarPeca(slot, animacao, laco)
	{
		this._conexao([], (t) => t.animarPeca(String(slot), String(animacao), laco === 0));
	},

	// "Soltar a peça": ninguém manda nela.
	SoltarPeca(slot)
	{
		this._conexao([], (t) => t.soltarPeca(String(slot)));
	}
};

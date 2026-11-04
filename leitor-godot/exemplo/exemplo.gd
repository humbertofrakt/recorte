# SPDX-License-Identifier: Apache-2.0
# O exemplo do leitor do Godot (rodada G2): o herói andando.
#
#   Espaço  ataca uma vez; no fim do golpe, volta a andar sozinho
#   W       anda
#   I       parado (o idle: o rosto respira)
#   A       veste a armadura (o cabelo some)      S  tira a armadura
#   F       liga e desliga as faíscas da mão (a skin "fogo", rodada G7)
#   E       troca a espada pelo capacete, e volta (encaixar, rodada G5)
#   Q       liga e desliga a aura rosa EM VOLTA do herói (rodada G5)
#   P       pausa      C  continua
#
# O boneco é o `heroi-fogo.bone`: o herói com a skin "fogo" a mais, e o slot
# "aura" (um ponto, que não se desenha: a tomada da tecla Q). O mesmo arquivo
# do exemplo do Construct, `leitor-construct/exemplo/`, de onde vieram também
# o `aura.bone` e o `capacete.bone`.
#
# O texto de cima mostra o último evento do `.bone` ("step" a cada passo, "hit"
# no golpe) e os avisos do leitor: o que ele ainda não desenha.
extends Node2D

@onready var heroi = $Heroi  # o nó Recorte
@onready var texto: Label = $Texto

const CAPACETE := "res://exemplo/capacete.bone"
const AURA := "res://exemplo/aura.bone"


func _ready() -> void:
	heroi.evento.connect(_ao_evento)
	heroi.terminou.connect(_ao_terminar)
	_mostrar("")


func _unhandled_input(e: InputEvent) -> void:
	if not e is InputEventKey or not e.pressed or e.echo:
		return
	match e.keycode:
		KEY_SPACE:
			heroi.tocar("attack", false)
		KEY_W:
			heroi.tocar("walk")
		KEY_I:
			heroi.tocar("idle")
		KEY_A:
			heroi.vestir("armadura")
		KEY_S:
			heroi.tirar_skin("armadura")
		KEY_F:
			if heroi.esta_vestindo("fogo"):
				heroi.tirar_skin("fogo")
			else:
				heroi.vestir("fogo")
		KEY_E:
			if heroi.peca_do_slot("weapon") == CAPACETE:
				heroi.desencaixar("weapon")
			else:
				heroi.encaixar("weapon", preload("res://exemplo/capacete.bone"))
				heroi.animar_peca("weapon", "piscar")
		KEY_Q:
			if heroi.peca_do_slot("aura") == AURA:
				heroi.desencaixar("aura")
			else:
				heroi.encaixar("aura", AURA, "meio")
				heroi.animar_peca("aura", "girar")
		KEY_P:
			heroi.pausar()
		KEY_C:
			heroi.continuar()
		_:
			return
	if get_viewport() != null:  # fora da árvore (o teste aperta a tecla à mão)
		get_viewport().set_input_as_handled()
	_mostrar("")


func _ao_evento(nome: String, _dados: Dictionary) -> void:
	_mostrar(nome)


func _ao_terminar(animacao: String) -> void:
	if animacao == "attack":
		heroi.tocar("walk")
	_mostrar("")


func _mostrar(ultimo_evento: String) -> void:
	var linhas := [
		"Tocando: %s%s" % [heroi.tocando, "  (pausado)" if heroi.pausado else ""],
		"Espaço: ataca · W: anda · I: parado · A: veste a armadura · S: tira · F: faíscas · E: espada/capacete · Q: aura em volta · P: pausa · C: continua",
		"Na mão: %s · Em volta: %s" % [heroi.peca_do_slot("weapon").get_file(), heroi.peca_do_slot("aura").get_file()],
		"Skins: " + " + ".join(heroi.skins()),
	]
	if ultimo_evento != "":
		linhas.append("Evento: " + ultimo_evento)
	if not heroi.avisos.is_empty():
		linhas.append("")
		linhas.append("O leitor avisa:")
		for a in heroi.avisos:
			linhas.append("· " + a)
	texto.text = "\n".join(linhas)

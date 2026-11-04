# SPDX-License-Identifier: Apache-2.0
# A medida da velocidade do leitor do Godot (rodada G8, 05/10/2026). Sem janela:
#
#   godot --headless --path leitor-godot --script res://testes/medir.gd
#
# Desde a G5 todo cenário traz a ESPADA (a entidade do arquivo, desenhada e
# posada pelo ator), e há cenários com a AURA encaixada em volta do herói.
#
# Não é teste (não passa nem falha): escreve números. Cada cenário anda 300
# quadros de 1/60 s depois de 30 de aquecimento, e diz a média, o quadro mais
# caro, e onde o quadro gasta: a animação, as regras e o mundo, as peças do
# desenho (com as partículas), e a entrega ao Godot.
#
# Sem janela o RenderingServer do Godot não desenha: a entrega mede montar as
# listas e chamar o servidor, NÃO o tempo da placa de vídeo.
extends SceneTree

const A := preload("res://addons/recorte/animacao.gd")
const Des := preload("res://addons/recorte/desenhador.gd")
const Ator := preload("res://addons/recorte/ator.gd")

const QUADROS := 300


func _initialize() -> void:
	print("Leitor do Godot — medida da velocidade (%s)" % Time.get_datetime_string_from_system())
	print("cenário | média ms/quadro | quadro mais caro ms | animação | regras+mundo | peças | entrega")
	_cenario("herói andando, com regras", 1, [], "walk")
	_cenario("herói andando, armadura vestida", 1, ["armadura"], "walk")
	_cenario("herói andando, com faíscas", 1, ["fogo"], "walk")
	_cenario("herói atacando, com faíscas", 1, ["fogo"], "attack")
	_cenario("dez heróis andando, com faíscas", 10, ["fogo"], "walk")
	_cenario("herói andando, aura em volta (G5)", 1, [], "walk", true)
	_cenario("herói andando, faíscas e aura em volta (G5)", 1, ["fogo"], "walk", true)
	_cenario("dez heróis andando, faíscas e aura em volta (G5)", 10, ["fogo"], "walk", true)
	quit(0)


func _cenario(nome: String, quantos: int, skins: Array, animacao: String, aura := false) -> void:
	var nos: Array = []
	for i in range(quantos):
		var no = load("res://addons/recorte/recorte.gd").new()
		root.add_child(no)
		no.carregar("res://exemplo/heroi-fogo.bone")
		for s in skins:
			no.vestir(s)
		no.tocar(animacao, animacao != "attack")
		if aura:
			no.encaixar("aura", "res://exemplo/aura.bone", "meio")
			no.animar_peca("aura", "girar")
		for _k in range(30 + i * 7):  # cada um num ponto diferente da animação
			no._process(1.0 / 60.0)
		nos.append(no)
	var total := 0.0
	var pior := 0.0
	for _q in range(QUADROS):
		var t0 := Time.get_ticks_usec()
		for no in nos:
			no._process(1.0 / 60.0)
		var dt := (Time.get_ticks_usec() - t0) / 1000.0
		total += dt
		pior = maxf(pior, dt)
	# Onde gasta: as mesmas etapas do `_posar`, cronometradas uma a uma, no
	# primeiro boneco, por mais 120 quadros.
	var no0 = nos[0]
	var partes := [0.0, 0.0, 0.0, 0.0]
	for _q in range(120):
		no0._tempo += 1.0 / 60.0
		var anim = no0._animacao
		var t := fposmod(no0._tempo, anim.duration) if no0._laco else minf(no0._tempo, anim.duration)
		var a0 := Time.get_ticks_usec()
		A.apply_animation(no0.esqueleto, anim, t)
		A.fire_physics_resets(no0.esqueleto, anim, no0._anterior, no0._tempo, no0._laco)
		no0._anterior = no0._tempo
		var a1 := Time.get_ticks_usec()
		no0.esqueleto.update_pose(no0._tempo)
		Ator.pose_nested(no0.esqueleto, anim, t, no0._tempo, no0._laco, no0._ator.ordens)
		no0.esqueleto.playing_animation = anim
		no0.esqueleto.playing_loop = no0._laco
		no0.esqueleto.playing_time = t if no0._laco else no0._tempo
		var a2 := Time.get_ticks_usec()
		var pecas := Des.pecas_do_quadro(no0.esqueleto, Des.Avisos.new())
		var a3 := Time.get_ticks_usec()
		no0._desenhar()
		var a4 := Time.get_ticks_usec()
		partes[0] += (a1 - a0) / 1000.0
		partes[1] += (a2 - a1) / 1000.0
		partes[2] += (a3 - a2) / 1000.0
		partes[3] += (a4 - a3) / 1000.0 - (a3 - a2) / 1000.0  # o `_desenhar` refaz as peças
	print("MEDIDA  %s | %.2f | %.2f | %.2f | %.2f | %.2f | %.2f" % [
		nome, total / QUADROS, pior, partes[0] / 120, partes[1] / 120, partes[2] / 120, maxf(0.0, partes[3] / 120)])
	for no in nos:
		no.free()

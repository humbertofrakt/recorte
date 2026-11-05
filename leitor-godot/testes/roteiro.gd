# SPDX-License-Identifier: Apache-2.0
# Os 15 passos do LEIA-ME.md, feitos POR CÓDIGO, sem janela (04/11/2026).
#
#   godot --headless --path leitor-godot --script res://testes/roteiro.gd
#
# A cena `exemplo/exemplo.tscn`, com as teclas apertadas à mão (o
# `_unhandled_input` do exemplo) e o tempo andando em quadros de 1/60 s.
# O que só o olho vê (a cor na tela, o navegador) fica para a mão: cada passo
# diz o que ESTE script prova e o que não prova.
#
# Sai com código 0 se todos passaram, 1 se algum falhou.
extends SceneTree

const Des := preload("res://addons/recorte/desenhador.gd")

const DT := 1.0 / 60.0
const ESPADA := "res://exemplo/espada.bone"
const CAPACETE := "res://exemplo/capacete.bone"
const AURA := "res://exemplo/aura.bone"

var _falhas := 0
var _total := 0
var cena
var heroi


func _initialize() -> void:
	_passo_1_abre()
	if heroi != null and heroi.esqueleto != null:
		_passo_2_parado_e_inspetor()
		_passo_3_escala()
		_passo_4_anda()
		_passo_5_ataca()
		_passo_6_armadura()
		_passo_7_faiscas()
		_passo_9_parado_pausa_continua()
		_passo_10_a_12_capacete()
		_passo_13_14_aura()
		_passo_15_web()
	if cena != null:
		cena.free()
	print("")
	print("%d de %d passos provados por código." % [_total - _falhas, _total])
	quit(0 if _falhas == 0 else 1)


func _ok(nome: String, condicao: bool, detalhe := "") -> void:
	_total += 1
	if condicao:
		print("PASSOU  " + nome)
	else:
		_falhas += 1
		print("FALHOU  " + nome + ("  — " + detalhe if detalhe != "" else ""))


func _apertar(tecla: Key) -> void:
	var e := InputEventKey.new()
	e.keycode = tecla
	e.pressed = true
	cena._unhandled_input(e)


func _quadros(n: int) -> void:
	for _i in range(n):
		heroi._process(DT)


func _pecas() -> Array:
	return Des.pecas_do_quadro(heroi.esqueleto, Des.Avisos.new())


func _nomes() -> Array:
	return _pecas().map(func(p): return p["nome"])


func _angulo(osso: String) -> float:
	var b = heroi.esqueleto.bone_by_name[osso]
	return rad_to_deg(atan2(b.c, b.a))


func _escala_do_osso(osso: String) -> float:
	var b = heroi.esqueleto.bone_by_name[osso]
	return sqrt(b.a * b.a + b.c * b.c)


## Quanto um ângulo varia em `n` quadros (o maior menos o menor).
func _variacao(osso: String, n: int) -> float:
	var menor := INF
	var maior := -INF
	for _i in range(n):
		_quadros(1)
		var a := _angulo(osso)
		menor = minf(menor, a)
		maior = maxf(maior, a)
	return maior - menor


func _faiscas() -> Array:
	return _pecas().filter(func(p): return p["tipo"] == "BONE_particle")


## Os cantos de todas as faíscas do quadro, numa lista só.
func _mundo_das_faiscas() -> Array:
	var out: Array = []
	for p in _faiscas():
		out.append_array(p["mundo"])
	return out


# 1 — abre sem erro vermelho
func _passo_1_abre() -> void:
	var pacote = load("res://exemplo/exemplo.tscn")
	_ok("1: a cena do exemplo carrega", pacote != null)
	if pacote == null:
		return
	cena = pacote.instantiate()
	root.add_child(cena)
	heroi = cena.get_node("Heroi")
	# Dentro do `_initialize` o `_ready` ainda não rodou: à mão, filho antes
	# do pai, como o Godot faz (e as `@onready` do exemplo, idem).
	if heroi.esqueleto == null:
		heroi._ready()
	cena.heroi = heroi
	cena.texto = cena.get_node("Texto")
	cena._ready()
	# O único aviso que o LEIA-ME espera: a cor escura do cabelo (falta shader).
	var outros: Array = heroi.avisos.filter(func(t): return not t.contains("cor escura"))
	_ok("1: o nó Heroi carrega o heroi-fogo.bone, sem aviso além da cor escura",
		heroi.esqueleto != null and outros.is_empty(), "\n".join(outros))


# 2 — o Inspetor (o "parado no editor" é o `Engine.is_editor_hint`: só a janela)
func _passo_2_parado_e_inspetor() -> void:
	var nomes: Array = []
	for p in heroi.get_property_list():
		if p["usage"] & PROPERTY_USAGE_EDITOR:
			nomes.append(p["name"])
	var faltam: Array = ["arquivo", "animacao_inicial", "em_laco", "escala", "skins_iniciais"].filter(
		func(n): return not nomes.has(n))
	_ok("2: o Inspetor mostra Arquivo, Animação inicial, Em laço, Escala e Skins iniciais",
		faltam.is_empty(), "faltam %s" % [faltam])


# 3 — a Escala muda o tamanho
func _passo_3_escala() -> void:
	var antes: float = heroi.escala
	heroi.escala = 1.0
	var um: Vector2 = heroi.slot_posicao("weapon")
	heroi.escala = 3.0
	var tres: Vector2 = heroi.slot_posicao("weapon")
	heroi.escala = antes
	_ok("3: com Escala 3 o pino da espada fica 3 vezes mais longe da origem",
		um.length() > 1.0 and tres.is_equal_approx(um * 3.0), "%s e %s" % [um, tres])


# 4 — F5: anda, com o rosto, a capa, o cabelo e a espada
func _passo_4_anda() -> void:
	_ok("4: começa tocando walk em laço", heroi.tocando == "walk", heroi.tocando)
	var nomes := _nomes()
	_ok("4: o rosto está no desenho", nomes.any(func(n): return n.begins_with("head/")), str(nomes))
	_ok("4: a espada está na mão (weapon = espada.bone, e é desenhada)",
		heroi.peca_do_slot("weapon") == ESPADA and nomes.any(func(n): return n.begins_with("weapon/")),
		heroi.peca_do_slot("weapon"))
	var tronco := _variacao("torso", 60)
	_ok("4: o corpo anda (o tronco gira %.2f° num segundo)" % tronco, tronco > 0.5)
	var capa := _variacao("cape2", 60)
	_ok("4: a capa ondula (cape2 varia %.2f°)" % capa, capa > 0.5)
	var cabelo := _variacao("hair", 60)
	_ok("4: o cabelo balança (hair varia %.2f°)" % cabelo, cabelo > 0.5)
	# A espada anda junto: a raiz dela fica no pino do slot em todo quadro.
	var junto := true
	for _i in range(30):
		_quadros(1)
		var raiz = heroi.esqueleto.nested_pool["weapon"].skeleton.bones[0]
		var pino: Vector2 = heroi.slot_posicao("weapon")
		if not Des.virar_y(raiz.world_x, raiz.world_y, heroi.escala).is_equal_approx(pino):
			junto = false
	_ok("4: a espada anda junto com a mão (30 quadros)", junto)


# 5 — Espaço: ataca, o braço estica, e volta a andar sozinho
func _passo_5_ataca() -> void:
	var fim: Array = []
	var cb := func(a): fim.append(a)
	heroi.terminou.connect(cb)
	_apertar(KEY_SPACE)
	_ok("5: Espaço toca attack", heroi.tocando == "attack", heroi.tocando)
	var estica := 0.0
	for _i in range(30):  # meio segundo: o attack dura 0,6
		_quadros(1)
		estica = maxf(estica, maxf(_escala_do_osso("arm"), _escala_do_osso("forearm")))
	_ok("5: o braço estica até o alvo (escala máxima %.4f)" % estica, estica > 1.001)
	_quadros(10)
	_ok("5: no fim do golpe, terminou(\"attack\") vem e ele volta a andar sozinho",
		fim == ["attack"] and heroi.tocando == "walk", "%s %s" % [fim, heroi.tocando])
	heroi.terminou.disconnect(cb)


# 6 — A veste a armadura (o cabelo some), S tira
func _passo_6_armadura() -> void:
	var tem_cabelo := func(): return _nomes().any(func(n): return n.begins_with("hair/"))
	var antes: bool = tem_cabelo.call()
	_apertar(KEY_A)
	_quadros(1)
	var vestido: bool = heroi.esta_vestindo("armadura")
	var com: bool = tem_cabelo.call()
	_apertar(KEY_S)
	_quadros(1)
	_ok("6: A veste a armadura e o cabelo some; S tira e o cabelo volta",
		antes and vestido and not com and not heroi.esta_vestindo("armadura") and tem_cabelo.call(),
		"antes %s, vestido %s, cabelo com armadura %s" % [antes, vestido, com])


# 7 — F: faíscas laranja que caem e somem; F de novo apaga
func _passo_7_faiscas() -> void:
	_ok("7: sem F, nenhuma faísca", _faiscas().is_empty())
	_apertar(KEY_F)
	_quadros(30)
	var f := _faiscas()
	_ok("7: F liga: saem faíscas (%d)" % f.size(), not f.is_empty())
	# A cor de cada faísca está nos vértices: [r, g, b, a] por canto.
	var cores: Array = []
	for p in f:
		var v: Array = p["cores_por_vertice"]
		for i in range(0, v.size(), 16):
			cores.append([v[i], v[i + 1], v[i + 2], v[i + 3]])
	var laranja := not cores.is_empty() and cores.all(func(c): return c[0] > 0.9 and c[0] > c[2] + 0.3)
	_ok("7: as faíscas são laranja (vermelho cheio, pouco azul; %d faíscas)" % cores.size(), laranja,
		str(cores.slice(0, 3)))
	_ok("7: brilham (o slot soma: additive)", not f.is_empty() and f.all(func(p): return p["mistura"] == "additive"),
		str(f[0]["mistura"]) if not f.is_empty() else "")
	var alfas: Array = cores.map(func(c): return float(c[3]))
	_ok("7: somem aos poucos (no mesmo quadro há faísca fraca e faísca forte)",
		not alfas.is_empty() and alfas.min() < 0.5 and alfas.max() > 0.5, str(alfas))
	# 8 — W com faíscas: as que já saíram ficam no ar (não seguem a mão).
	_apertar(KEY_W)
	_quadros(30)
	var r: Array = heroi.esqueleto.attachment_for(heroi.esqueleto.slot_by_name["fogo"])
	var emissor = r[0]
	_ok("8: o emissor das faíscas está no espaço do mundo (space = world)",
		emissor != null and emissor.space == "world", str(r))
	if emissor != null:
		# A mão anda 100 unidades AGORA, depois da pose. No mundo, a faísca
		# já saiu: nenhuma se move. A régua de controle (regra 26): o mesmo
		# emissor em `local` segue a mão, e as faíscas andam.
		var mundo := _mundo_das_faiscas()
		var antebraco = heroi.esqueleto.bone_by_name["forearm"]
		antebraco.world_x += 100.0
		var mundo_mao_longe := _mundo_das_faiscas()
		emissor.space = "local"
		var local_longe := _mundo_das_faiscas()
		antebraco.world_x -= 100.0
		var local_perto := _mundo_das_faiscas()
		emissor.space = "world"
		_ok("8: a mão anda 100 depois que a faísca saiu, e nenhuma faísca se move (%d números)" % mundo.size(),
			not mundo.is_empty() and mundo == mundo_mao_longe)
		_ok("8: controle — o mesmo emissor em local segue a mão (a régua de cima mede alguma coisa)",
			not local_perto.is_empty() and local_perto != local_longe)
	_apertar(KEY_F)
	_quadros(1)
	_ok("7: F de novo apaga", _faiscas().is_empty() and not heroi.esta_vestindo("fogo"), str(_faiscas().size()))


# 9 — I parado (o rosto respira), P congela, C continua de onde parou
func _passo_9_parado_pausa_continua() -> void:
	_apertar(KEY_I)
	_ok("9: I toca idle", heroi.tocando == "idle", heroi.tocando)
	var menor := INF
	var maior := -INF
	for _i in range(120):
		_quadros(1)
		var s := _escala_do_osso("head")
		menor = minf(menor, s)
		maior = maxf(maior, s)
	_ok("9: parado, o rosto respira (a escala da cabeça varia %.4f)" % (maior - menor), maior - menor > 0.001)
	_apertar(KEY_P)
	var tempo: float = heroi._tempo
	var a := _angulo("head")
	_quadros(30)
	_ok("9: P congela (o tempo e a cabeça não andam em 30 quadros)",
		heroi.pausado and heroi._tempo == tempo and _angulo("head") == a)
	_apertar(KEY_C)
	_quadros(1)
	_ok("9: C continua de onde parou (um quadro depois, não 31)",
		not heroi.pausado and is_equal_approx(heroi._tempo, tempo + DT), "%s → %s" % [tempo, heroi._tempo])


# 10 a 12 — W, E: capacete que pisca; Espaço não o tira; E volta a espada
func _passo_10_a_12_capacete() -> void:
	_apertar(KEY_W)
	_apertar(KEY_E)
	_ok("10: E põe o capacete na mão", heroi.peca_do_slot("weapon") == CAPACETE, heroi.peca_do_slot("weapon"))
	_ok("10: o texto de cima diz \"Na mão: capacete.bone\"", cena.texto.text.contains("Na mão: capacete.bone"), cena.texto.text)
	var cores := {}
	for _i in range(60):
		_quadros(1)
		for p in _pecas():
			if p["nome"].begins_with("weapon/luz/"):
				cores[str(p["cor"])] = true
	_ok("10: o capacete pisca (a luz troca de cor: %d cores num segundo)" % cores.size(), cores.size() > 1)
	_apertar(KEY_SPACE)
	var ficou := true
	for _i in range(45):
		_quadros(1)
		if heroi.peca_do_slot("weapon") != CAPACETE:
			ficou = false
	_ok("11: o golpe inteiro, e o capacete continua na mão", ficou and heroi.tocando == "walk", heroi.tocando)
	_apertar(KEY_E)
	_ok("12: E de novo volta a espada", heroi.peca_do_slot("weapon") == ESPADA, heroi.peca_do_slot("weapon"))


# 13 e 14 — Q: aura rosa em volta (uma bola atrás, outra na frente); Q tira
func _passo_13_14_aura() -> void:
	_apertar(KEY_Q)
	_quadros(1)
	var nomes := _nomes()
	_ok("13: Q põe a aura (aura.bone no slot aura)", heroi.peca_do_slot("aura") == AURA, heroi.peca_do_slot("aura"))
	_ok("13: uma bola passa atrás (a primeira peça) e outra na frente (a última)",
		not nomes.is_empty() and nomes[0].begins_with("aura/bola_tras") and nomes[-1].begins_with("aura/bola_frente"), str(nomes))
	var giro := 0.0
	var b = heroi.esqueleto.nested_pool["aura"].skeleton.bone_by_name["giro"]
	var a0 := atan2(b.c, b.a)
	_quadros(30)
	giro = absf(angle_difference(a0, atan2(b.c, b.a)))
	_ok("13: a aura gira (%.1f° em meio segundo)" % rad_to_deg(giro), giro > 0.01)
	_apertar(KEY_Q)
	_quadros(1)
	_ok("14: Q de novo tira a aura", not _nomes().any(func(n): return n.begins_with("aura/")), str(_nomes()))


# 15 — exportar para Web: não é deste script (precisa dos modelos de exportação)
func _passo_15_web() -> void:
	var tem := FileAccess.file_exists("res://export_presets.cfg")
	print("MEDIDA  15: export_presets.cfg %s; a exportação Web é feita fora deste script (--export-release)" % ("existe" if tem else "não existe"))

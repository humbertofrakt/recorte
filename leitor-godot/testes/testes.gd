# SPDX-License-Identifier: Apache-2.0
# Os testes do leitor do Godot (rodadas G1 a G4, G6 e G7, 05/10/2026). Rodam no Godot,
# sem janela; a suíte da casa (vitest) nem os vê:
#
#   godot --headless --path leitor-godot --script res://testes/testes.gd
#
# Sai com código 0 se todos passaram, 1 se algum falhou. Cada linha diz o nome
# do teste e PASSOU ou FALHOU. O que é MEDIDA e não prova sai como "MEDIDA".
extends SceneTree

const C := preload("res://addons/recorte/carregador.gd")
const E := preload("res://addons/recorte/esqueleto.gd")
const A := preload("res://addons/recorte/animacao.gd")
const Des := preload("res://addons/recorte/desenhador.gd")
const Corte := preload("res://addons/recorte/corte.gd")
const D := preload("res://addons/recorte/dump.gd")
const P := preload("res://addons/recorte/particulas.gd")
const ArqScript := preload("res://addons/recorte/arquivo_recorte.gd")
const Ator := preload("res://addons/recorte/ator.gd")

const EXEMPLO := "res://exemplo/"

var _falhas := 0
var _total := 0


func _initialize() -> void:
	_desenhador_bate_com_a_referencia_sem_regras()
	_desenhador_com_regras_medida()
	_desenhador_avisa_o_que_nao_desenha()
	_virar_y_num_lugar_so()
	_no_toca_e_avisa_eventos()
	_g3_quadros_cortados_batem_com_a_referencia()
	_g3_corte()
	_g4_pilhas_de_skin()
	_g6_quadros_com_regras_batem_com_a_referencia()
	_g6_mesmo_caminho_mesmo_desenho()
	_g6_regras_nao_avisam_mais()
	_g7_faiscas_batem_com_a_referencia()
	_g7_fumaca_particula_a_particula()
	_g7_mesmo_instante_mesmo_desenho()
	_g7_folha_de_quadros_a_mao()
	_g8_physics_dt_exato()
	_g8_misturas()
	_g8_importado_e_empacotado()
	_g5_lista_do_desenhador_e_a_draw_list()
	_g5_bloco_cortado_pela_mascara_do_pai()
	_g5_encaixar_e_desencaixar()
	_g5_as_armas_e_as_rodas()
	_g5_animar_e_soltar_a_peca()
	_g5_o_exemplo_e_e_q()
	_g9_caminho_bate_com_a_referencia()
	_g9_curva_que_nao_e_caminho_avisa()
	_g9_malha_em_world()
	_no_apagado_nao_fica_na_memoria()
	print("")
	print("%d de %d testes passaram." % [_total - _falhas, _total])
	quit(0 if _falhas == 0 else 1)


func _ok(nome: String, condicao: bool, detalhe := "") -> void:
	_total += 1
	if condicao:
		print("PASSOU  " + nome)
	else:
		_falhas += 1
		print("FALHOU  " + nome + ("  — " + detalhe if detalhe != "" else ""))


func _ler_json(caminho: String):
	return JSON.parse_string(FileAccess.get_file_as_string(caminho))


func _resolver(pasta: String) -> Callable:
	return func(uri: String):
		var p := pasta.path_join(uri)
		if not FileAccess.file_exists(p):
			return null
		return FileAccess.get_file_as_bytes(p)


## O herói do exemplo, parado. `sem_regras`: com o bloco `constraints` tirado,
## como a referência `heroi-parado-sem-regras.json` foi feita.
func _heroi_parado(sem_regras: bool):
	var doc = C.parse_text(FileAccess.get_file_as_bytes(EXEMPLO + "heroi.bone"))["doc"]
	if sem_regras:
		doc.erase("constraints")
	var r: Dictionary = C._finish(doc, _resolver(EXEMPLO))
	var esqueleto = E.Skeleton.new(r["dados"])
	esqueleto.update_pose(0.0)
	Ator.pose_nested(esqueleto, null, 0.0, 0.0, false)
	return esqueleto


## As peças do herói na referência. Desde a G5, com as do aninhado: a espada
## é desenhada, e entra na comparação peça a peça.
func _regioes_da_referencia(arquivo: String) -> Array:
	var ref = _ler_json("res://testes/referencia/" + arquivo)
	return _do_heroi(ref["pecas"])


## Até a G4 tirava as peças de profundidade 1 (a espada, que o Godot não
## desenhava). Desde a G5 devolve todas.
func _do_heroi(pecas: Array) -> Array:
	return pecas


## Compara uma peça do Godot com uma da referência. Devolve "" ou o primeiro defeito.
func _diferenca(g: Dictionary, r: Dictionary) -> String:
	for campo in ["slot", "anexo", "pagina", "mistura"]:
		if str(g[campo]) != str(r[campo]):
			return "%s: Godot %s, referência %s" % [campo, g[campo], r[campo]]
	var listas := {"mundo": 1e-3, "uvs": 1e-6, "cor": 1e-6, "triangulos": 0.0}
	for campo in listas:
		var a: Array = g[campo]
		var b: Array = r[campo]
		if a.size() != b.size():
			return "%s: %d números no Godot, %d na referência" % [campo, a.size(), b.size()]
		for i in range(a.size()):
			if absf(float(a[i]) - float(b[i])) > listas[campo]:
				return "%s[%d]: Godot %s, referência %s" % [campo, i, a[i], b[i]]
	return ""


func _desenhador_bate_com_a_referencia_sem_regras() -> void:
	var esqueleto = _heroi_parado(true)
	var pecas := Des.pecas_do_quadro(esqueleto, Des.Avisos.new(), false)
	var ref := _regioes_da_referencia("heroi-parado-sem-regras.json")
	_ok("herói parado sem regras: o mesmo número de peças que a referência (%d)" % ref.size(),
		pecas.size() == ref.size(), "Godot %d" % pecas.size())
	var primeira := ""
	for i in range(mini(pecas.size(), ref.size())):
		var d := _diferenca(pecas[i], ref[i])
		if d != "":
			primeira = "peça %d (%s): %s" % [i, pecas[i]["slot"], d]
			break
	_ok("herói parado sem regras: cada peça bate com a referência (ordem, lugar, uv, cor, mistura, triângulos)",
		primeira == "" and pecas.size() == ref.size(), primeira)


## G6: o herói como ele é, COM as regras, parado. Até a G5 isto era só uma
## medida (as regras não eram aplicadas); desde a G6 é teste.
func _desenhador_com_regras_medida() -> void:
	var esqueleto = _heroi_parado(false)
	var pecas := Des.pecas_do_quadro(esqueleto, Des.Avisos.new(), false)
	var ref := _regioes_da_referencia("heroi-parado.json")
	var diferentes: Array = []
	for i in range(mini(pecas.size(), ref.size())):
		if _diferenca(pecas[i], ref[i]) != "":
			diferentes.append(pecas[i]["slot"])
	_ok("G6: herói parado COM as regras: as %d peças batem com a referência" % ref.size(),
		diferentes.is_empty() and pecas.size() == ref.size(), "diferentes: " + ", ".join(diferentes))


## O nó, pelo caminho do Tocador do Construct: carrega (pose em 0), `tocar`
## (pose em 0), e `_process(1/den)` N vezes. Devolve o nó (quem chama o apaga).
func _no_pelo_caminho(animacao, den: int, passos: int):
	var no = load("res://addons/recorte/recorte.gd").new()
	root.add_child(no)
	no.carregar(EXEMPLO + "heroi.bone")
	if animacao != null:
		no.tocar(animacao, animacao != "attack")
	for _i in range(passos):
		no._process(1.0 / den)
	return no


## G6, a dívida da G1: o herói ANDANDO com as regras ligadas (o braço no alvo,
## a cabeça, a capa no caminho, o cabelo na física, o olhar no driver) bate
## peça a peça com o desenhador do Construct, em vários quadros das três
## animações, inclusive o quadro pulado (o tempo todo num passo só).
func _g6_quadros_com_regras_batem_com_a_referencia() -> void:
	var ref = _ler_json("res://testes/referencia/heroi-quadros.json")
	var slots_vistos := {}
	for q in ref["quadros"]:
		var no = _no_pelo_caminho(q["animacao"], int(q["den"]), int(q["passos"]))
		var pecas := Des.pecas_do_quadro(no.esqueleto, Des.Avisos.new())
		no.free()
		var esperadas := _do_heroi(q["pecas"])
		var primeira := ""
		if pecas.size() != esperadas.size():
			primeira = "Godot %d peças, referência %d" % [pecas.size(), esperadas.size()]
		for i in range(mini(pecas.size(), esperadas.size())):
			var d := _diferenca(pecas[i], esperadas[i])
			if d != "":
				primeira = "peça %d (%s): %s" % [i, pecas[i]["slot"], d]
				break
			slots_vistos[pecas[i]["slot"]] = true
		var rotulo: String = "parado" if q["animacao"] == null else "%s, %d passos de 1/%d s" % [q["animacao"], int(q["passos"]), int(q["den"])]
		_ok("G6: %s — %d peças com regras batem com a referência" % [rotulo, esperadas.size()], primeira == "", primeira)
	# Regra 28: o verde tem de ter passado pelas peças que as regras mexem.
	var regradas := ["arm", "forearm", "head", "cape_upper", "cape_lower", "hair"]
	var faltam: Array = []
	for s in regradas:
		if not slots_vistos.has(s):
			faltam.append(s)
	_ok("G6: os quadros passaram pelas peças das regras (%s)" % ", ".join(regradas), faltam.is_empty(), "faltam: " + str(faltam))


## G6: a física depende do caminho. O MESMO caminho de passos, pedido de novo
## num nó novo, dá EXATAMENTE o mesmo desenho; um caminho diferente até o mesmo
## instante pode dar outro (e o teste diz quanto).
func _g6_mesmo_caminho_mesmo_desenho() -> void:
	var a = _no_pelo_caminho("walk", 60, 37)
	var pa := Des.pecas_do_quadro(a.esqueleto, Des.Avisos.new())
	a.free()
	var b = _no_pelo_caminho("walk", 60, 37)
	var pb := Des.pecas_do_quadro(b.esqueleto, Des.Avisos.new())
	b.free()
	_ok("G6: o mesmo caminho (37 passos de 1/60 no walk) dá o mesmo desenho, número por número", str(pa) == str(pb))
	var c = _no_pelo_caminho("walk", 1, 0)
	c._process(37.0 / 60.0)
	var pc := Des.pecas_do_quadro(c.esqueleto, Des.Avisos.new())
	c.free()
	var maior := 0.0
	var onde := ""
	for i in range(mini(pa.size(), pc.size())):
		var m1: Array = pa[i]["mundo"]
		var m2: Array = pc[i]["mundo"]
		for k in range(mini(m1.size(), m2.size())):
			if absf(m1[k] - m2[k]) > maior:
				maior = absf(m1[k] - m2[k])
				onde = pa[i]["slot"]
	print("MEDIDA  walk em 37/60 s: em 37 passos ou num passo só, a maior diferença é %.4f px (no slot %s)" % [maior, onde])


## O `heroi-fogo.bone` do exemplo com o REMENDO de uma variante nos campos do
## emissor das faíscas (o mesmo que o gerador da referência aplicou).
func _bytes_do_fogo(remendo: Dictionary) -> PackedByteArray:
	var doc = C.parse_text(FileAccess.get_file_as_bytes(EXEMPLO + "heroi-fogo.bone"))["doc"]
	for skin in doc["skins"]:
		if skin["name"] == "fogo":
			var faisca: Dictionary = skin["attachments"]["fogo"]["faisca"]
			for k in remendo:
				faisca[k] = remendo[k]
	return JSON.stringify(doc).to_utf8_buffer()


func _no_do_fogo(remendo: Dictionary, animacao, den: int, passos: int):
	var no = load("res://addons/recorte/recorte.gd").new()
	root.add_child(no)
	no.carregar_bytes(_bytes_do_fogo(remendo), EXEMPLO, "heroi-fogo.bone")
	no.vestir("fogo")
	if animacao != null:
		no.tocar(animacao, true)
	for _i in range(passos):
		no._process(1.0 / den)
	return no


## Como `_diferenca`, e também a cor de CADA vértice (a das partículas).
func _diferenca_com_cores(g: Dictionary, r: Dictionary) -> String:
	var d := _diferenca(g, r)
	if d != "":
		return d
	if r.get("cores") == null:
		return "" if g.get("cores_por_vertice") == null else "o Godot tem cor por vértice e a referência não"
	var a: Array = g.get("cores_por_vertice", [])
	var b: Array = r["cores"]
	if a.size() != b.size():
		return "cores: %d números no Godot, %d na referência" % [a.size(), b.size()]
	for i in range(a.size()):
		if absf(float(a[i]) - float(b[i])) > 1e-6:
			return "cores[%d]: Godot %s, referência %s" % [i, a[i], b[i]]
	return ""


## G7: as faíscas da skin "fogo" (space world, brilho additive) batem PEÇA A
## PEÇA, e partícula a partícula dentro da peça (lugar, uv, cor de cada
## vértice), com o desenhador do Construct, em vários quadros e nas variantes
## do emissor: como é, folha de quadros por fps e pela vida, e muitas vivas.
func _g7_faiscas_batem_com_a_referencia() -> void:
	var ref = _ler_json("res://testes/referencia/faiscas.json")
	var com_particula := 0
	for v in ref["variantes"]:
		for q in v["quadros"]:
			var no = _no_do_fogo(v["remendo"], q["animacao"], int(q["den"]), int(q["passos"]))
			var avisos := Des.Avisos.new()
			var pecas := Des.pecas_do_quadro(no.esqueleto, avisos)
			var avisos_do_no: Array = no.avisos.duplicate()
			no.free()
			var esperadas := _do_heroi(q["pecas"])
			var primeira := ""
			if pecas.size() != esperadas.size():
				primeira = "Godot %d peças, referência %d" % [pecas.size(), esperadas.size()]
			var particulas := 0
			for i in range(mini(pecas.size(), esperadas.size())):
				var d := _diferenca_com_cores(pecas[i], esperadas[i])
				if d != "":
					primeira = "peça %d (%s): %s" % [i, pecas[i]["slot"], d]
					break
				if pecas[i]["tipo"] == "BONE_particle":
					particulas += pecas[i]["mundo"].size() / 8
					if pecas[i]["mistura"] != "additive":
						primeira = "as faíscas saíram com a mistura %s, não additive" % pecas[i]["mistura"]
			com_particula += 1 if particulas > 0 else 0
			var rotulo: String = "%s, %s" % [v["rotulo"], "parado" if q["animacao"] == null else "%s %d/%d s" % [q["animacao"], int(q["passos"]), int(q["den"])]]
			_ok("G7: faíscas %s — %d peças, %d partículas, batem com a referência" % [rotulo, esperadas.size(), particulas], primeira == "", primeira)
			if v["rotulo"] == "muitas":
				var texto := "\n".join(avisos.textos)
				_ok("G7: mais de 300 vivas: desenha todas (%d) e avisa com o número" % particulas,
					particulas > 300 and texto.contains("chegou a %d partículas" % particulas), texto)
			var cortadas := false
			for t in avisos_do_no:
				if t.contains("PARTICLE_NO_POSE"):
					cortadas = true
			_ok("G7: %s — o nó deu a pose do nascimento (sem PARTICLE_NO_POSE)" % rotulo, not cortadas, "\n".join(avisos_do_no))
	# Regra 28: os verdes têm de ter passado por partícula de verdade.
	_ok("G7: os quadros das faíscas tinham partícula (%d quadros com)" % com_particula, com_particula >= 10)


## G7: a fumaça do `particulas.bone`, partícula a partícula (flow, index,
## nascimento, vida, idade, x, y, ângulo, escala), contra o adaptador de
## referência da suíte (o runtime TypeScript), parada e em laço.
func _g7_fumaca_particula_a_particula() -> void:
	var ref = _ler_json("res://testes/referencia/fumaca.json")
	var r: Dictionary = C.load_skeleton_bytes(FileAccess.get_file_as_bytes("res://testes/particulas.bone"), Callable())
	var dados = r["dados"]
	var contadas := 0
	for s in ref["sondas"]:
		var dump := D.build_pose_dump(dados, s["sonda"])
		var primeira := ""
		for i in range(s["dump"]["samples"].size()):
			var esperado: Dictionary = s["dump"]["samples"][i]["particles"]
			var obtido: Dictionary = dump["samples"][i]["particles"]
			for chave in esperado:
				var le: Array = esperado[chave]
				var lo: Array = obtido.get(chave, [])
				if le.size() != lo.size():
					primeira = "t=%s %s: %d partículas na referência, %d no Godot" % [s["sonda"]["times"][i], chave, le.size(), lo.size()]
					break
				for k in range(le.size()):
					contadas += 1
					for campo in ["flow", "index", "birth", "life", "age", "x", "y", "angle", "scale"]:
						if absf(float(le[k][campo]) - float(lo[k][campo])) > 2e-6:
							primeira = "t=%s %s partícula %d, %s: referência %s, Godot %s" % [s["sonda"]["times"][i], chave, k, campo, le[k][campo], lo[k][campo]]
							break
					if primeira != "":
						break
				if primeira != "":
					break
			if primeira != "":
				break
		var rotulo: String = s["sonda"].get("animation", "parada") if s["sonda"].get("animation") != null else "parada"
		_ok("G7: fumaça %s, %d instantes — cada partícula bate com a referência" % [rotulo, s["sonda"]["times"].size()], primeira == "", primeira)
	_ok("G7: a fumaça teve partícula de verdade (%d comparadas)" % contadas, contadas >= 100)


## G7: partícula é função pura do tempo. O mesmo instante pedido de novo dá o
## mesmo desenho; e chegar a ele em 61 passos ou num salto só (o quadro pulado)
## dá as MESMAS faíscas.
func _g7_mesmo_instante_mesmo_desenho() -> void:
	var r: Dictionary = C.load_skeleton_bytes(FileAccess.get_file_as_bytes("res://testes/particulas.bone"), Callable())
	var dump := D.build_pose_dump(r["dados"], {"animation": "fumar", "loop": true, "measure": ["particles"], "times": [1.23, 2.71, 1.23]})
	_ok("G7: a fumaça em 1,23 s, pedida de novo depois de 2,71 s, sai igual",
		str(dump["samples"][0]["particles"]) == str(dump["samples"][2]["particles"]) and str(dump["samples"][0]["particles"]) != str(dump["samples"][1]["particles"]))
	var a = _no_do_fogo({}, "walk", 60, 61)
	var pa := Des.pecas_do_quadro(a.esqueleto, Des.Avisos.new())
	a.free()
	var b = _no_do_fogo({}, "walk", 1, 0)
	b._process(61.0 / 60.0)
	var pb := Des.pecas_do_quadro(b.esqueleto, Des.Avisos.new())
	b.free()
	var fa: Array = pa.filter(func(p): return p["tipo"] == "BONE_particle")
	var fb: Array = pb.filter(func(p): return p["tipo"] == "BONE_particle")
	var maior := 0.0
	var iguais := fa.size() == fb.size() and not fa.is_empty()
	for i in range(mini(fa.size(), fb.size())):
		var ma: Array = fa[i]["mundo"]
		var mb: Array = fb[i]["mundo"]
		if ma.size() != mb.size():
			iguais = false
			continue
		for k in range(ma.size()):
			maior = maxf(maior, absf(ma[k] - mb[k]))
	_ok("G7: as faíscas no walk em 61/60 s, em 61 passos ou num salto, saem iguais (maior diferença %s)" % maior,
		iguais and maior < 1e-9)


## G7, item 5: a folha de quadros, com a conta feita À MÃO antes (3 quadros).
##   fps 10, início fixo 1: idade 0,25 → floor(2,5) = 2 → (2 + 1) % 3 = 0
##                          idade 0,31 → floor(3,1) = 3 → 3 % 3 = 0 → 0 + 1 = 1
##   pela vida, 2 ciclos, início fixo 1: fração 0,5 → floor(3) = 3 % 3 = 0 → 1
##                                        fração 0,9 → floor(5,4) = 5 % 3 = 2 → 0
##   pela vida, início de 0 a 3 (sorteado no canal 9): o quadro fica em 0..2.
## O resto (o sorteio, a UV de cada quadro) é o teste das faíscas contra a referência.
func _g7_folha_de_quadros_a_mao() -> void:
	var e := C.ParticleAttachment.new()
	e.sequence = C.Sequence.new()
	e.sequence.count = 3
	e.frame_mode = "fps"
	e.fps = 10
	e.start_frame = [1.0, 1.0]
	var campos := P.Campos.new(e, {}, 0.0)
	var a := P.quadro(e, campos, 0, 0, 0.25, 0.0, 3)
	var b := P.quadro(e, campos, 0, 0, 0.31, 0.0, 3)
	e.frame_mode = "lifetime"
	e.cycles = 2
	var c := P.quadro(e, campos, 0, 0, 0.0, 0.5, 3)
	var d := P.quadro(e, campos, 0, 0, 0.0, 0.9, 3)
	_ok("G7: folha por fps, à mão: idade 0,25 → quadro 0; 0,31 → quadro 1", a == 0 and b == 1, "saiu %d e %d" % [a, b])
	_ok("G7: folha pela vida, à mão: fração 0,5 → quadro 1; 0,9 → quadro 0", c == 1 and d == 0, "saiu %d e %d" % [c, d])
	e.start_frame = [0.0, 3.0]
	var dentro := true
	for i in range(50):
		var q := P.quadro(e, P.Campos.new(e, {}, 0.0), 0, i, 0.0, 0.37, 3)
		if q < 0 or q > 2:
			dentro = false
	_ok("G7: com início sorteado de 0 a 3, o quadro fica sempre entre 0 e 2 (50 partículas)", dentro)


## G8, item 5: o JSON do Godot lê `0.016666666666666666` uma casa binária
## abaixo de 1/60, e o dump pulava passos da física. Primeiro o defeito (o
## JSON, e o cabelo do herói diferente), depois o conserto (`sonda_de_texto`).
func _g8_physics_dt_exato() -> void:
	var texto := "{\"animation\": \"idle\", \"loop\": true, \"physicsDt\": 0.016666666666666666, \"times\": [0, 0.37, 1.3], \"measure\": [\"bones\"]}"
	var pelo_json = JSON.parse_string(texto)
	var certa = D.sonda_de_texto(texto)
	_ok("G8: o defeito existe — o JSON do Godot lê 0.016666666666666666 diferente de 1/60",
		pelo_json["physicsDt"] != 1.0 / 60.0)
	_ok("G8: a sonda relida dá 1/60 exato, e os tempos certos",
		certa["physicsDt"] == 1.0 / 60.0 and certa["times"] == [0.0, 0.37, 1.3], str(certa))
	_ok("G8: o número exato: 0.1, 1e-3, -2.5e2, 0.008333333333333333 (1/120), 0.03333333333333333 (1/30)",
		D.numero_exato("0.1") == 0.1 and D.numero_exato("1e-3") == 0.001 and D.numero_exato("-2.5e2") == -250.0
		and D.numero_exato("0.008333333333333333") == 1.0 / 120.0 and D.numero_exato("0.03333333333333333") == 1.0 / 30.0)
	var dados = C._finish(C.parse_text(FileAccess.get_file_as_bytes(EXEMPLO + "heroi.bone"))["doc"], _resolver(EXEMPLO))["dados"]
	var exato := D.build_pose_dump(dados, {"animation": "idle", "loop": true, "physicsDt": 1.0 / 60.0, "times": [0.37, 1.3], "measure": ["bones"]})
	var pelo_texto := D.build_pose_dump(dados, certa.merged({"times": [0.37, 1.3]}, true))
	var torto := D.build_pose_dump(dados, pelo_json.merged({"times": [0.37, 1.3]}, true))
	var cabelo := func(d): return d["samples"][1]["bones"]["hair"]["arotation"]
	_ok("G8: o cabelo do herói (física) pela sonda relida = pelo 1/60 exato (%s)" % cabelo.call(exato),
		cabelo.call(pelo_texto) == cabelo.call(exato))
	_ok("G8: e pelo JSON do Godot sai outro (%s): era o defeito" % cabelo.call(torto),
		cabelo.call(torto) != cabelo.call(exato))


## G8, item 6: additive e multiply, que nenhum boneco do exemplo usava. O
## herói com o remendo de mistura da referência bate peça a peça (a mistura
## está na comparação), e o nó dá a cada uma o material certo do Godot.
func _g8_misturas() -> void:
	var ref = _ler_json("res://testes/referencia/misturas.json")
	var doc = C.parse_text(FileAccess.get_file_as_bytes(EXEMPLO + "heroi.bone"))["doc"]
	for s in doc["slots"]:
		if ref["remendo"].has(s["name"]):
			s["blend"] = ref["remendo"][s["name"]]
	var bytes := JSON.stringify(doc).to_utf8_buffer()
	var vistas := {}
	for q in ref["quadros"]:
		var no = load("res://addons/recorte/recorte.gd").new()
		root.add_child(no)
		no.carregar_bytes(bytes, EXEMPLO, "heroi.bone")
		if q["animacao"] != null:
			no.tocar(q["animacao"])
		for _i in range(int(q["passos"])):
			no._process(1.0 / int(q["den"]))
		var pecas := Des.pecas_do_quadro(no.esqueleto, Des.Avisos.new())
		var esperadas := _do_heroi(q["pecas"])
		var primeira := ""
		if pecas.size() != esperadas.size():
			primeira = "Godot %d peças, referência %d" % [pecas.size(), esperadas.size()]
		for i in range(mini(pecas.size(), esperadas.size())):
			var d := _diferenca(pecas[i], esperadas[i])
			if d != "":
				primeira = "peça %d (%s): %s" % [i, pecas[i]["slot"], d]
				break
			vistas[pecas[i]["mistura"]] = true
		_ok("G8: misturas, %s — %d peças batem com a referência, mistura incluída" % [
			"parado" if q["animacao"] == null else "walk %d/60 s" % int(q["passos"]), esperadas.size()], primeira == "", primeira)
		no.free()
	_ok("G8: os quadros passaram por additive e por multiply", vistas.has("additive") and vistas.has("multiply"), str(vistas.keys()))
	var no2 = load("res://addons/recorte/recorte.gd").new()
	root.add_child(no2)
	var add = no2._material("additive")
	var mul = no2._material("multiply")
	_ok("G8: o nó desenha additive com o material Add do Godot, e multiply com o Mul",
		add.blend_mode == CanvasItemMaterial.BLEND_MODE_ADD and mul.blend_mode == CanvasItemMaterial.BLEND_MODE_MUL
		and no2._material("normal") == null)
	no2._material("additive|pre")
	_ok("G8: additive numa página de alpha multiplicado avisa", no2.avisos.any(func(t): return t.contains("alpha multiplicado")))
	no2.free()


## G8, itens 1 e 2: os três empacotamentos entram pelo importador que SÓ
## GUARDA, e o nó os lê pelo recurso (o que vai junto no jogo exportado).
## Precisa do projeto importado uma vez (`godot --headless --path leitor-godot
## --import`); sem isso, o teste diz que não pôde provar, e não passa.
func _g8_importado_e_empacotado() -> void:
	var Rec = load("res://addons/recorte/recorte.gd")
	var importado := ResourceLoader.exists("res://exemplo/heroi.bone")
	_ok("G8: o projeto está importado (senão rode o --import antes)", importado)
	if not importado:
		return
	for caminho in ["res://exemplo/heroi.bone", "res://testes/zip501.bonez", "res://testes/bin401.boneb"]:
		var r = load(caminho)
		var do_disco := FileAccess.get_file_as_bytes(caminho)
		_ok("G8: %s virou recurso do Recorte, com os MESMOS bytes do arquivo (nada convertido)" % caminho.get_file(),
			r != null and r.get_script() == ArqScript and r.bytes == do_disco and r.formato == caminho.get_extension(),
			"tipo %s" % (r.get_class() if r != null else "nada"))
	for caminho in ["res://testes/zip501.bonez", "res://testes/bin401.boneb"]:
		var no = Rec.new()
		root.add_child(no)
		var ok: bool = no.carregar(caminho)
		_ok("G8: o nó abre o %s pelo recurso (%d ossos)" % [caminho.get_file(), no.dados.bones.size() if no.dados != null else 0],
			ok and no.esqueleto != null and no.dados.bones.size() > 0, "\n".join(no.avisos))
		no.free()
	_ok("G8: o atlas é recurso JSON do Godot e a imagem é textura importada: os dois vão junto ao exportar",
		load("res://exemplo/heroi.atlas.json") is JSON and load("res://exemplo/heroi.png") is Texture2D)
	_ok("G8: o .import do heroi.bone diz que quem o importa é o recorte.arquivo (o nosso importador)",
		ResourceLoader.load("res://exemplo/heroi.bone").resource_path == "res://exemplo/heroi.bone"
		and FileAccess.get_file_as_string("res://exemplo/heroi.bone.import").contains("recorte.arquivo"))


func _g6_regras_nao_avisam_mais() -> void:
	var no = load("res://addons/recorte/recorte.gd").new()
	root.add_child(no)
	no.carregar(EXEMPLO + "heroi.bone")
	no.tocar("walk")
	no._process(0.1)
	var regra := false
	for t in no.avisos:
		if t.contains("regra"):
			regra = true
	_ok("G6: o herói não avisa mais \"ainda nao aplico a regra\"", not regra, "\n".join(no.avisos))
	_ok("G6: o esqueleto do nó tem as 5 regras do herói", no.esqueleto.constraints.size() == 5, str(no.esqueleto.constraints.size()))
	no.free()


func _desenhador_avisa_o_que_nao_desenha() -> void:
	var esqueleto = _heroi_parado(true)
	var avisos := Des.Avisos.new()
	var pecas_da_espada: Array = []
	for p in Des.pecas_do_quadro(esqueleto, avisos):
		if p["profundidade"] == 1:
			pecas_da_espada.append(p["nome"])
	var texto := "\n".join(avisos.textos)
	_ok("G3: a malha e a máscara não avisam mais (agora desenham e cortam)",
		not texto.contains("malha") and not texto.contains("máscara"), texto)
	# G5: até aqui o teste era "avisa a entidade que não desenha". Agora a
	# espada é desenhada, e o aviso tem de ter sumido.
	_ok("G5: a espada é desenhada (%s) e não avisa mais" % ", ".join(pecas_da_espada),
		pecas_da_espada == ["weapon/lamina/lamina"] and not texto.contains("encaixad"), texto)
	_ok("avisa a cor escura do cabelo (tint black)", texto.contains("slot \"hair\" tem cor escura"), texto)


func _virar_y_num_lugar_so() -> void:
	var esqueleto = _heroi_parado(true)
	var pecas := Des.pecas_do_quadro(esqueleto, Des.Avisos.new())
	var godot := Des.para_godot(pecas, 2.0)
	var certo := true
	for i in range(pecas.size()):
		var mundo: Array = pecas[i]["mundo"]
		var pontos: PackedVector2Array = godot[i]["pontos"]
		for v in range(pontos.size()):
			var esperado := Vector2(mundo[2 * v] * 2.0, -mundo[2 * v + 1] * 2.0)
			if pontos[v].distance_to(esperado) > 1e-3:
				certo = false
	_ok("para o Godot: x vezes a escala, y vezes a escala com o sinal trocado", certo)
	var p0: Dictionary = godot[0]
	_ok("para o Godot: uma cor por vértice, índices e uv do mesmo tamanho",
		p0["cores"].size() == p0["pontos"].size() and p0["uv"].size() == p0["pontos"].size()
		and p0["indices"].size() == 6)


## G2: o nó toca, dá a volta, solta os eventos do `.bone` e avisa o fim.
func _no_toca_e_avisa_eventos() -> void:
	var no = load("res://addons/recorte/recorte.gd").new()
	root.add_child(no)
	# Dentro do `_initialize` o `_ready` só roda no quadro seguinte: carrega-se à mão.
	_ok("o nó carrega o herói", no.carregar(EXEMPLO + "heroi.bone") and no.dados != null, "\n".join(no.avisos))
	if no.dados == null:
		return
	_ok("o nó sabe as animações", Array(no.animacoes()) == ["idle", "walk", "attack"], str(no.animacoes()))
	_ok("tocar uma animação que não existe avisa e devolve false",
		not no.tocar("voar") and no.avisos.any(func(t): return t.contains("tocar(\"voar\")")))

	var eventos: Array = []
	no.evento.connect(func(nome, dados): eventos.append([nome, dados["time"]]))
	_ok("tocar(\"walk\") em laço", no.tocar("walk") and no.tocando == "walk" and no.esta_tocando("walk"))
	# Dois segundos e meio, em passos de 1/60: duas voltas e meia do walk (1 s).
	for _i in range(150):
		no._process(1.0 / 60.0)
	var nomes: Array = eventos.map(func(e): return e[0])
	var walk = no.dados.find_animation("walk")
	var esperados := A.fire_events(no.esqueleto, walk, -INF, 2.5, true)
	_ok("os eventos do walk saem a cada volta, na ordem (%d em 2,5 s)" % esperados.size(),
		nomes == esperados.map(func(e): return e["event"]) and not nomes.is_empty(),
		"saíram %s; a conta diz %s" % [nomes, esperados.map(func(e): return e["event"])])

	var fim: Array = []
	no.terminou.connect(func(nome): fim.append(nome))
	_ok("tocar(\"attack\", false): uma vez", no.tocar("attack", false))
	for _i in range(30):
		no._process(1.0 / 60.0)  # meio segundo: o attack dura 0,6
	_ok("antes do fim, o sinal terminou não veio", fim.is_empty(), str(fim))
	for _i in range(12):
		no._process(1.0 / 60.0)
	_ok("no fim do attack, o sinal terminou vem uma vez, com o nome", fim == ["attack"], str(fim))
	for _i in range(30):
		no._process(1.0 / 60.0)
	_ok("depois do fim, ele não repete", fim == ["attack"], str(fim))
	no.parar()
	_ok("parar(): nada tocando", no.tocando == "")
	no.free()


## G3: o herói sem regras, CORTADO pela máscara, parado e em seis quadros das
## três animações (o deform do rosto, a sequência da mão, a cor, a troca de
## imagem, a ordem). Cada peça bate com a do desenhador do Construct.
func _g3_quadros_cortados_batem_com_a_referencia() -> void:
	var ref = _ler_json("res://testes/referencia/heroi-quadros-sem-regras.json")
	var doc = C.parse_text(FileAccess.get_file_as_bytes(EXEMPLO + "heroi.bone"))["doc"]
	doc.erase("constraints")
	var dados = C._finish(doc, _resolver(EXEMPLO))["dados"]
	var malhas := 0
	var cortadas := 0
	for q in ref["quadros"]:
		var esqueleto = E.Skeleton.new(dados)
		var rotulo := "parado"
		if q["animacao"] != null:
			var animacao = dados.find_animation(q["animacao"])
			A.apply_animation(esqueleto, animacao, float(q["tempo"]))
			rotulo = "%s em %s s" % [q["animacao"], q["tempo"]]
		esqueleto.update_pose(float(q["tempo"]))
		Ator.pose_nested(esqueleto, dados.find_animation(q["animacao"]) if q["animacao"] != null else null,
			float(q["tempo"]), float(q["tempo"]), false)
		var pecas := Des.pecas_do_quadro(esqueleto, Des.Avisos.new())
		var esperadas := _do_heroi(q["pecas"])
		var primeira := ""
		if pecas.size() != esperadas.size():
			primeira = "Godot %d peças, referência %d" % [pecas.size(), esperadas.size()]
		for i in range(mini(pecas.size(), esperadas.size())):
			var d := _diferenca(pecas[i], esperadas[i])
			if d != "":
				primeira = "peça %d (%s): %s" % [i, pecas[i]["slot"], d]
				break
			if pecas[i]["tipo"] != "region":
				malhas += 1
			if not pecas[i]["recortes"].is_empty():
				cortadas += 1
		_ok("G3: %s — %d peças cortadas batem com a referência" % [rotulo, esperadas.size()], primeira == "", primeira)
	# Regra 28: o verde acima tem de ter passado POR malha e POR corte.
	_ok("G3: os quadros passaram por malha (%d peças) e por corte (%d peças)" % [malhas, cortadas],
		malhas >= 7 and cortadas >= 14)


func _g3_corte() -> void:
	# Um quadrado de 0 a 10, com uv de 0 a 1, cortado por um triângulo que cobre a metade de baixo-esquerda.
	var mundo := [0.0, 0.0, 10.0, 0.0, 10.0, 10.0, 0.0, 10.0]
	var uvs := [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0]
	var tri := [0, 1, 2, 0, 2, 3]
	var mascara: Array = Corte.triangular_mascara([0.0, 0.0, 10.0, 0.0, 0.0, 10.0])
	var dentro := Corte.cortar_peca(mundo, uvs, tri, [{"triangulos": mascara, "inverter": false}])
	var fora := Corte.cortar_peca(mundo, uvs, tri, [{"triangulos": mascara, "inverter": true}])
	_ok("corte: por dentro fica a metade (área 50)", absf(_area(dentro) - 50.0) < 1e-6, str(_area(dentro)))
	_ok("corte: invertido fica a outra metade (área 50), sem sobrepor", absf(_area(fora) - 50.0) < 1e-6, str(_area(fora)))
	var uv_certo := true
	for i in range(0, dentro["mundo"].size(), 2):
		if absf(dentro["uvs"][i] - dentro["mundo"][i] / 10.0) > 1e-9 or absf(dentro["uvs"][i + 1] - dentro["mundo"][i + 1] / 10.0) > 1e-9:
			uv_certo = false
	_ok("corte: o uv do vértice novo é a mistura das pontas", uv_certo)
	_ok("corte: máscara que se cruza (um oito) não triangula", Corte.triangular_mascara([0.0, 0.0, 10.0, 10.0, 10.0, 0.0, 0.0, 10.0]) == null)
	var concava: Array = Corte.triangular_mascara([0.0, 0.0, 10.0, 0.0, 10.0, 10.0, 5.0, 3.0, 0.0, 10.0])
	var soma := 0.0
	for t in concava:
		soma += Corte.area_com_sinal(t)
	_ok("corte: máscara côncava vira triângulos com a área dela (%s)" % soma,
		absf(soma - Corte.area_com_sinal([0.0, 0.0, 10.0, 0.0, 10.0, 10.0, 5.0, 3.0, 0.0, 10.0])) < 1e-9)


## Os dados de um exemplo; o herói sem o bloco `constraints` quando `sem_regras`.
func _dados(arquivo: String, sem_regras: bool):
	var doc = C.parse_text(FileAccess.get_file_as_bytes(EXEMPLO + arquivo))["doc"]
	if sem_regras:
		doc.erase("constraints")
	return C._finish(doc, _resolver(EXEMPLO))["dados"]


## G4: cada pilha que o Construct montou com `vestir` e `tirar`. O nó tem de
## chegar à MESMA pilha com `vestir` e `tirar_skin`, e o desenho dessa pilha
## tem de bater peça a peça com o do Construct.
func _g4_pilhas_de_skin() -> void:
	var ref = _ler_json("res://testes/referencia/skins-sem-regras.json")
	var cache := {}
	var pilhas_certas := true
	var detalhe_pilha := ""
	for q in ref["pilhas"]:
		var arquivo: String = q["arquivo"]
		# A pilha, pelo nó.
		var no = load("res://addons/recorte/recorte.gd").new()
		root.add_child(no)
		no.carregar(EXEMPLO + arquivo)
		for op in q["ops"]:
			if op[0] == "vestir":
				no.vestir(op[1])
			else:
				no.tirar_skin(op[1])
		if Array(no.skins()) != q["pilha"]:
			pilhas_certas = false
			detalhe_pilha = "%s %s: nó %s, Construct %s" % [arquivo, q["ops"], no.skins(), q["pilha"]]
		no.free()
		# O desenho, sem regras (as regras são a G6).
		if not cache.has(arquivo):
			cache[arquivo] = _dados(arquivo, arquivo == "heroi.bone")
		var dados = cache[arquivo]
		var esqueleto = E.Skeleton.new(dados)
		esqueleto.set_skins(q["pilha"])
		if q["animacao"] != null:
			A.apply_animation(esqueleto, dados.find_animation(q["animacao"]), float(q["tempo"]))
		esqueleto.update_pose(float(q["tempo"]))
		Ator.pose_nested(esqueleto, dados.find_animation(q["animacao"]) if q["animacao"] != null else null,
			float(q["tempo"]), float(q["tempo"]), false)
		var pecas := Des.pecas_do_quadro(esqueleto, Des.Avisos.new())
		var esperadas := _do_heroi(q["pecas"])
		var primeira := ""
		if pecas.size() != esperadas.size():
			primeira = "Godot %d peças, referência %d" % [pecas.size(), esperadas.size()]
		for i in range(mini(pecas.size(), esperadas.size())):
			var d := _diferenca(pecas[i], esperadas[i])
			if d != "":
				primeira = "peça %d (%s): %s" % [i, pecas[i]["slot"], d]
				break
		_ok("G4: %s %s pilha %s — %d peças batem" % [arquivo, q["animacao"] if q["animacao"] != null else "parado",
			"+".join(q["pilha"]), esperadas.size()], primeira == "", primeira)
	_ok("G4: o nó monta a mesma pilha que o Construct (vestir sobe ao topo, tirar tira só aquela)", pilhas_certas, detalhe_pilha)
	var no2 = load("res://addons/recorte/recorte.gd").new()
	root.add_child(no2)
	no2.carregar(EXEMPLO + "heroi.bone")
	_ok("G4: vestir uma skin que não existe avisa e devolve false",
		not no2.vestir("capa_de_chuva") and no2.avisos.any(func(t): return t.contains("vestir(\"capa_de_chuva\")")))
	_ok("G4: tirar uma skin que não está vestida não muda nada", no2.tirar_skin("armadura") and Array(no2.skins()) == ["default"])
	no2.free()


## Num jogo, bonecos nascem e morrem. O nó apagado não pode deixar o esqueleto
## na memória (osso e esqueleto se apontam: a contagem de referências do
## GDScript não acha esse laço sozinha).
func _no_apagado_nao_fica_na_memoria() -> void:
	var antes := Performance.get_monitor(Performance.OBJECT_COUNT)
	for _i in range(3):
		var no = load("res://addons/recorte/recorte.gd").new()
		root.add_child(no)
		no.carregar(EXEMPLO + "heroi.bone")
		no.vestir("armadura")
		no.tocar("walk")
		for _k in range(10):
			no._process(1.0 / 60.0)
		no.free()
	var depois := Performance.get_monitor(Performance.OBJECT_COUNT)
	_ok("três heróis criados, tocados e apagados não ficam na memória (objetos: %d antes, %d depois)" % [antes, depois],
		depois - antes < 20)


func _area(peca: Dictionary) -> float:
	var m: Array = peca["mundo"]
	var t: Array = peca["triangulos"]
	var a := 0.0
	for k in range(0, t.size(), 3):
		a += absf(Corte.area_com_sinal([m[t[k] * 2], m[t[k] * 2 + 1], m[t[k + 1] * 2], m[t[k + 1] * 2 + 1], m[t[k + 2] * 2], m[t[k + 2] * 2 + 1]]))
	return a


# ---------------------------------------------------------------------------
# G5: a entidade encaixada e o "em volta" (7.11, 7.13)
# ---------------------------------------------------------------------------

## A pasta de um caso da suíte, pelo código ("C-311"), em `conformidade/casos/`
## ou em `conformidade/casos-pendentes/`: os casos novos mudam de uma para a
## outra num fecho, e o teste tem de achar nas duas. "" quando não acha.
func _pasta_do_caso(codigo: String) -> String:
	var raiz := ProjectSettings.globalize_path("res://").path_join("../conformidade")
	for sub in ["casos", "casos-pendentes"]:
		var d := DirAccess.open(raiz.path_join(sub))
		if d == null:
			continue
		for nome in d.get_directories():
			if nome.begins_with(codigo + "-"):
				return raiz.path_join(sub).path_join(nome)
	return ""


## G5, item 2 da ficha: a lista do DESENHADOR (`pecas_do_quadro`, pela mesma
## volta que desenha) bate com a `drawList` feita à mão no `esperado.json` de
## cada caso do "Este boneco", peça a peça e máscara a máscara. Os casos não
## têm atlas: o desenhador vai em `so_lista` (não pula peça sem região).
func _g5_lista_do_desenhador_e_a_draw_list() -> void:
	var codigos := ["C-310", "C-311", "C-312", "C-313", "C-314", "C-315", "C-316", "C-317", "C-318", "C-319", "X-307"]
	var amostras := 0
	var cortes := 0
	var marcadas := 0
	for codigo in codigos:
		var pasta := _pasta_do_caso(codigo)
		if pasta == "":
			_ok("G5: %s — o caso existe (em casos/ ou casos-pendentes/)" % codigo, false)
			continue
		var r: Dictionary = C.load_skeleton_bytes(FileAccess.get_file_as_bytes(pasta.path_join("entrada.bone")), _resolver(pasta))
		var esperado = _ler_json(pasta.path_join("esperado.json"))
		var probe: Dictionary = esperado["probe"]
		var dados = r["dados"]
		var animacao = dados.find_animation(probe["animation"]) if typeof(probe.get("animation")) == TYPE_STRING else null
		var laco := bool(probe.get("loop", false))
		var ator = Ator.new(dados)
		if typeof(probe.get("skins")) == TYPE_ARRAY:
			ator.set_skins(C._strings(probe["skins"]))
		var primeira := ""
		for amostra in esperado["samples"]:
			var t := float(amostra["time"])
			var ta := t
			if animacao != null and laco and animacao.duration > 0:
				ta = fposmod(t, animacao.duration)
			ator.pose(animacao, ta, t, laco, -INF)
			var lista: Array = []
			for p in Des.pecas_do_quadro(ator.current, Des.Avisos.new(), false, true):
				lista.append({"piece": p["nome"], "clips": p["mascaras"]})
				if not p["mascaras"].is_empty():
					cortes += 1
			for e in amostra["drawList"]:
				if e["piece"].count("/") >= 2:
					marcadas += 1
			amostras += 1
			if JSON.stringify(lista) != JSON.stringify(amostra["drawList"]) and primeira == "":
				primeira = "t = %s: Godot %s, esperado %s" % [t, JSON.stringify(lista), JSON.stringify(amostra["drawList"])]
		ator.liberar()
		_ok("G5: %s — a lista do desenhador é a drawList do caso" % pasta.get_file(), primeira == "", primeira)
	# Regra 28: o verde tem de ter passado por máscara e por peça de filho.
	_ok("G5: as listas passaram por %d amostras, %d peças cortadas e %d peças de filho" % [amostras, cortes, marcadas],
		amostras >= 11 and cortes >= 2 and marcadas >= 10)


## G5, regra 26: nenhum caso da suíte tem um filho EM BLOCO dentro da máscara
## de quem o recebe (o estrago "o bloco perde a máscara do pai" passou verde
## em todos). Este teste fecha o buraco: o rig do C-319 SEM o `around`. A
## conta à mão, pela 7.7 e pelo leiame do C-319 ("sem a marca, a 7.7 corta o
## aninhado como um bloco"): as cinco peças da aura, `meio` incluído, no lugar
## do slot `aura`, todas com a máscara do herói.
func _g5_bloco_cortado_pela_mascara_do_pai() -> void:
	var pasta := _pasta_do_caso("C-319")
	if pasta == "":
		_ok("G5: o C-319 existe (em casos/ ou casos-pendentes/)", false)
		return
	var doc = C.parse_text(FileAccess.get_file_as_bytes(pasta.path_join("entrada.bone")))["doc"]
	doc["skins"][0]["attachments"]["aura"]["poder"].erase("around")
	var dados = C._finish(doc, _resolver(pasta))["dados"]
	var ator = Ator.new(dados)
	ator.pose(null, 0.0, 0.0, false, -INF)
	var lista: Array = []
	for p in Des.pecas_do_quadro(ator.current, Des.Avisos.new(), false, true):
		lista.append([p["nome"], p["mascaras"]])
	ator.liberar()
	var r := ["recorte/recorte"]
	var esperado := [["perna/perna", r], ["aura/bola_a/bola_a", r], ["aura/anel/anel", r],
		["aura/meio/meio", r], ["aura/brilho/brilho", r], ["aura/bola_b/bola_b", r], ["cabeca/cabeca", r]]
	_ok("G5: um filho em bloco dentro da máscara do pai é cortado por ela, peça a peça",
		JSON.stringify(lista) == JSON.stringify(esperado), JSON.stringify(lista))


## Os nomes das peças de entidade (profundidade 1 ou mais) do quadro do nó.
func _pecas_de_filho(no) -> Array:
	var out: Array = []
	for p in Des.pecas_do_quadro(no.esqueleto, Des.Avisos.new(), false, true):
		if p["profundidade"] >= 1:
			out.append(p["nome"])
	return out


func _avisou(no, trecho: String) -> bool:
	for a in no.avisos:
		if a.contains(trecho):
			return true
	return false


## G5, a API (`08`, seção 4): encaixar, o sinal, o pino, a chave que não
## desfaz, desencaixar, em volta, e o que não existe (regra 21).
func _g5_encaixar_e_desencaixar() -> void:
	var no = load("res://addons/recorte/recorte.gd").new()
	root.add_child(no)
	no.carregar(EXEMPLO + "heroi-fogo.bone")
	var sinais: Array = []
	no.encaixado.connect(func(s, p): sinais.append([s, p]))
	var espada := EXEMPLO + "espada.bone"
	var capacete := EXEMPLO + "capacete.bone"
	_ok("G5: o slot weapon mostra a espada do arquivo (%s)" % no.peca_do_slot("weapon"), no.peca_do_slot("weapon") == espada)
	_ok("G5: a lista dos slots tem weapon e aura", no.slots().has("weapon") and no.slots().has("aura"), str(no.slots()))
	_ok("G5: a lista das entidades tem a espada", no.entidades().has(espada), str(no.entidades()))

	# Encaixar pelo recurso, como o jogo faz com `preload`.
	var feito: bool = no.encaixar("weapon", load(capacete))
	var filhos := _pecas_de_filho(no)
	_ok("G5: encaixar o capacete no weapon troca a peça, e o sinal diz slot e peça",
		feito and no.peca_do_slot("weapon") == capacete and sinais == [["weapon", capacete]]
		and not filhos.is_empty() and filhos.all(func(n): return n.begins_with("weapon/")) and not filhos.has("weapon/lamina/lamina"),
		"%s %s %s %s" % [feito, no.peca_do_slot("weapon"), sinais, filhos])
	_ok("G5: a entidade nova entra na lista das entidades", no.entidades().has(capacete), str(no.entidades()))

	# O pino: a imagem de baixo é a espada do arquivo, com x = 35 (heroi.bone).
	# A raiz do capacete (em 0, 0) cai em quadro_do_osso(forearm) × T(35, 0).
	var forearm = no.esqueleto.slot_by_name["weapon"].bone
	var pino = E.Frame.of(forearm).times_trs(35, 0, 0, 1, 1)
	var raiz = no.esqueleto.nested_pool["weapon"].skeleton.bones[0]
	_ok("G5: a peça cai no pino da imagem que ela substitui (x = 35 no antebraço)",
		absf(raiz.world_x - pino.world_x) < 1e-9 and absf(raiz.world_y - pino.world_y) < 1e-9,
		"raiz (%s, %s), pino (%s, %s)" % [raiz.world_x, raiz.world_y, pino.world_x, pino.world_y])
	var sp: Vector2 = no.slot_posicao("weapon")
	_ok("G5: slot_posicao é o pino, no espaço do nó (Y para baixo)",
		sp.is_equal_approx(Vector2(pino.world_x, -pino.world_y) * no.escala), "%s" % sp)
	var op: Vector2 = no.osso_posicao("forearm")
	_ok("G5: osso_posicao é o osso, no espaço do nó, e osso_angulo é o giro dele com o sinal do Godot",
		op.is_equal_approx(Vector2(forearm.world_x, -forearm.world_y)) and is_equal_approx(no.osso_angulo("forearm"), -rad_to_deg(atan2(forearm.c, forearm.a))),
		"%s %s" % [op, no.osso_angulo("forearm")])

	# Nenhuma chave desfaz o encaixe: a animação inteira do golpe.
	no.tocar("attack", false)
	var ficou := true
	for _i in range(40):
		no._process(1.0 / 30.0)
		if no.peca_do_slot("weapon") != capacete:
			ficou = false
	_ok("G5: o golpe inteiro (que tem chaves no weapon) não desfaz o encaixe", ficou)

	# Peça que não existe, com o capacete encaixado: ele tem de ficar.
	_ok("G5: peça que não existe: avisa, devolve false, e o encaixe que havia fica",
		not no.encaixar("weapon", EXEMPLO + "nao-existe.bone") and no.peca_do_slot("weapon") == capacete and _avisou(no, "nao-existe.bone"),
		no.peca_do_slot("weapon"))

	# Desencaixar: a imagem de antes volta.
	_ok("G5: desencaixar devolve a espada do arquivo",
		no.desencaixar("weapon") and no.peca_do_slot("weapon") == espada, no.peca_do_slot("weapon"))

	# O que não existe: avisa, devolve false, e nada muda.
	var antes: String = no.peca_do_slot("weapon")
	_ok("G5: slot que não existe: avisa e devolve false",
		not no.encaixar("nao-existe", capacete) and _avisou(no, "não tem o slot \"nao-existe\""))
	_ok("G5: peça que não existe: avisa, devolve false, e o slot fica como estava",
		not no.encaixar("weapon", EXEMPLO + "nao-existe.bone") and no.peca_do_slot("weapon") == antes and _avisou(no, "nao-existe.bone"))
	_ok("G5: o sinal só saiu no encaixe que deu certo", sinais.size() == 1, str(sinais))

	# Em volta (o "Este boneco"): a aura em volta do herói, marcada em "meio".
	no.tocar("walk")
	no.encaixar("aura", EXEMPLO + "aura.bone", "meio")
	var todas: Array = []
	for p in Des.pecas_do_quadro(no.esqueleto, Des.Avisos.new(), false, true):
		todas.append(p["nome"])
	_ok("G5: em volta: a primeira e a última peça do quadro são da aura, e o herói fica no meio",
		todas.size() > 4 and todas[0].begins_with("aura/") and todas[-1].begins_with("aura/")
		and not todas[todas.size() / 2].begins_with("aura/") and not todas.has("aura/meio/meio"), str(todas))
	no.encaixar("aura", EXEMPLO + "aura.bone", "nao-tem")
	_ok("G5: em volta de um slot que a peça não tem: avisa, e ela entra em bloco",
		_avisou(no, "não tem o slot \"nao-tem\" para marcar o meio"), "\n".join(no.avisos))
	no.free()


## G5, o caso do Humberto (`03`, 07h33): as duas armas trocam SEPARADO, e as
## rodas trocam TODAS de uma vez. O herói com um segundo slot de arma, igual.
func _g5_as_armas_e_as_rodas() -> void:
	var doc = C.parse_text(FileAccess.get_file_as_bytes(EXEMPLO + "heroi.bone"))["doc"]
	doc["slots"].append({"name": "weapon2", "bone": "forearm", "attachment": "sword"})
	for skin in doc["skins"]:
		if skin["name"] == "default":
			skin["attachments"]["weapon2"] = skin["attachments"]["weapon"].duplicate(true)
	# Uma animação cuja chave TROCA a imagem do weapon por um placeholder que
	# nenhuma skin tem (o golpe do herói só esconde; este troca).
	doc["animations"].append({"name": "troca", "duration": 1.0, "timelines": [
		{"type": "slot", "target": "weapon", "property": "attachment", "keys": [{"time": 0, "value": "outra"}]}]})
	var no = load("res://addons/recorte/recorte.gd").new()
	root.add_child(no)
	no.carregar_bytes(JSON.stringify(doc).to_utf8_buffer(), EXEMPLO, "heroi com duas armas")
	var espada := EXEMPLO + "espada.bone"
	var capacete := EXEMPLO + "capacete.bone"
	no.encaixar("weapon", capacete)
	_ok("G5: as armas: encaixar num slot não mexe no outro igual",
		no.peca_do_slot("weapon") == capacete and no.peca_do_slot("weapon2") == espada,
		"%s %s" % [no.peca_do_slot("weapon"), no.peca_do_slot("weapon2")])
	no.tocar("troca")
	no._process(0.1)
	_ok("G5: a chave que troca a imagem do slot não desfaz o encaixe (a skin dos encaixes cobre o placeholder dela)",
		no.peca_do_slot("weapon") == capacete, no.peca_do_slot("weapon"))
	no.parar()
	no.desencaixar("weapon")
	no.tocar("troca")
	no._process(0.1)
	_ok("G5: sem o encaixe, a mesma chave esvazia o slot (a régua de cima mede alguma coisa)",
		no.peca_do_slot("weapon") == "", no.peca_do_slot("weapon"))
	no.parar()
	var n: int = no.encaixar_todas(espada, capacete)
	_ok("G5: as rodas: encaixar_todas troca os dois slots (%d)" % n,
		n == 2 and no.peca_do_slot("weapon") == capacete and no.peca_do_slot("weapon2") == capacete)
	_ok("G5: encaixar_todas de uma peça que ninguém mostra: avisa e devolve 0",
		no.encaixar_todas(espada, capacete) == 0 and _avisou(no, "nenhum slot mostra a peça"))
	no.free()


## G5: animar a peça, soltar a peça, e a chave do arquivo que manda.
func _g5_animar_e_soltar_a_peca() -> void:
	var no = load("res://addons/recorte/recorte.gd").new()
	root.add_child(no)
	no.carregar(EXEMPLO + "heroi.bone")
	no.tocar("walk")  # o walk não tem chave na peça do weapon
	var inst = func(): return no.esqueleto.nested_pool["weapon"]
	_ok("G5: animação que a peça não tem: avisa, devolve false, e nada muda",
		not no.animar_peca("weapon", "nao-tem") and _avisou(no, "não tem a animação \"nao-tem\"") and no._ordens.is_empty())
	_ok("G5: slot sem entidade: animar_peca avisa e devolve false",
		not no.animar_peca("hand", "idle") and _avisou(no, "não mostra entidade"))
	no.animar_peca("weapon", "brilho", false)
	for _i in range(6):
		no._process(0.05)
	var top = inst.call().layers.get("top")
	_ok("G5: animar_peca: a espada toca \"brilho\", do começo, no relógio dela (0,3 s)",
		top != null and top[0].name == "brilho" and absf(top[1] - 0.3) < 1e-9 and top[2] == false,
		str(top) if top == null else "%s %s %s" % [top[0].name, top[1], top[2]])
	no.soltar_peca("weapon")
	no._process(0.05)
	_ok("G5: soltar_peca: nenhuma animação por cima da espada", not inst.call().layers.has("top"), str(inst.call().layers.keys()))
	# O idle tem a chave nested/animation no weapon: ela manda, a ordem espera.
	no.animar_peca("weapon", "brilho")
	no.tocar("idle")
	no._process(0.05)
	top = inst.call().layers.get("top")
	_ok("G5: com a chave nested/animation, a animação do boneco manda e o leitor avisa",
		top != null and top[0].name != "brilho" and _avisou(no, "ORDEM_ESPERA"), "\n".join(no.avisos))
	no.free()


## G5: as teclas do exemplo, apertadas de verdade na cena `exemplo.tscn`.
func _g5_o_exemplo_e_e_q() -> void:
	var cena = load("res://exemplo/exemplo.tscn").instantiate()
	root.add_child(cena)
	var heroi = cena.get_node("Heroi")
	# Dentro do `_initialize` o `_ready` ainda não rodou: à mão, filho antes
	# do pai, como o Godot faz (e as `@onready` do exemplo, idem).
	if heroi.esqueleto == null:
		heroi._ready()
	cena.heroi = heroi
	cena.texto = cena.get_node("Texto")
	cena._ready()
	var apertar := func(tecla: Key):
		var e := InputEventKey.new()
		e.keycode = tecla
		e.pressed = true
		cena._unhandled_input(e)
	var espada: String = heroi.peca_do_slot("weapon")
	apertar.call(KEY_E)
	var com_capacete: String = heroi.peca_do_slot("weapon")
	var top = heroi.esqueleto.nested_pool["weapon"].layers.get("top")
	apertar.call(KEY_E)
	_ok("G5: no exemplo, E troca a espada pelo capacete (que pisca) e E de novo volta",
		com_capacete == "res://exemplo/capacete.bone" and top != null and top[0].name == "piscar"
		and heroi.peca_do_slot("weapon") == espada and espada == "res://exemplo/espada.bone",
		"%s %s %s" % [espada, com_capacete, heroi.peca_do_slot("weapon")])
	apertar.call(KEY_Q)
	var nomes: Array = []
	for p in Des.pecas_do_quadro(heroi.esqueleto, Des.Avisos.new()):
		nomes.append(p["nome"])
	apertar.call(KEY_Q)
	_ok("G5: no exemplo, Q põe a aura em volta (a primeira e a última peça desenhadas são dela) e Q de novo tira",
		not nomes.is_empty() and nomes[0].begins_with("aura/") and nomes[-1].begins_with("aura/")
		and heroi.peca_do_slot("aura") == "aura", str(nomes))
	cena.free()


# ---------------------------------------------------------------------------
# G9: as partículas ao longo de um caminho (9.4.2, 1.1 da extensão)
# ---------------------------------------------------------------------------

## G9: as faíscas com `shape: "path"` no caminho da capa (outro slot), em
## `world` e em `local`, batem PEÇA A PEÇA e partícula a partícula com o
## desenhador do Construct (`testes/referencia/caminho.json`).
func _g9_caminho_bate_com_a_referencia() -> void:
	var ref = _ler_json("res://testes/referencia/caminho.json")
	var com_particula := 0
	for v in ref["variantes"]:
		for q in v["quadros"]:
			var no = _no_do_fogo(v["remendo"], q["animacao"], int(q["den"]), int(q["passos"]))
			var pecas := Des.pecas_do_quadro(no.esqueleto, Des.Avisos.new())
			var avisos_do_no: Array = no.avisos.duplicate()
			no.free()
			var esperadas: Array = q["pecas"]
			var primeira := ""
			if pecas.size() != esperadas.size():
				primeira = "Godot %d peças, referência %d" % [pecas.size(), esperadas.size()]
			var particulas := 0
			for i in range(mini(pecas.size(), esperadas.size())):
				var d := _diferenca_com_cores(pecas[i], esperadas[i])
				if d != "":
					primeira = "peça %d (%s): %s" % [i, pecas[i]["slot"], d]
					break
				if pecas[i]["tipo"] == "BONE_particle":
					particulas += pecas[i]["mundo"].size() / 8
			com_particula += 1 if particulas > 0 else 0
			var rotulo: String = "%s, %s %d/%d s" % [v["rotulo"], q["animacao"], int(q["passos"]), int(q["den"])]
			_ok("G9: %s — %d peças, %d partículas, batem com a referência" % [rotulo, esperadas.size(), particulas], primeira == "", primeira)
			var curva := false
			for t in avisos_do_no:
				if t.contains("REF_PARTICLE_CURVE") or t.contains("PARTICLE_NO_POSE"):
					curva = true
			_ok("G9: %s — sem aviso de curva nem de pose" % rotulo, not curva, "\n".join(avisos_do_no))
	# Regra 28: os verdes têm de ter passado por partícula de verdade.
	_ok("G9: os quadros do caminho tinham partícula (%d de 5)" % com_particula, com_particula == 5)


## Um emissor de teste num osso girado 90 graus e levado a (100, 0), com a
## malha `pano` (quadrado de 10) no mesmo slot, e o caminho `trilha` em outro.
func _doc_do_emissor(campos: Dictionary) -> Dictionary:
	var emissor := {"type": "BONE_particle", "path": "fx/faisca", "seed": 42, "rate": 20, "lifetime": [2, 2],
		"speed": [0, 0], "direction": 90, "spread": 0, "gravity": [0, 0], "drag": 0, "angle": [0, 0],
		"angularVelocity": [0, 0], "scale": [1, 1], "looping": false, "maxParticles": 1000}
	for k in campos:
		emissor[k] = campos[k]
	return {"bone": {"version": "1.1", "minVersion": "1.0"}, "extensionsUsed": ["BONE_particles"],
		"bones": [{"name": "root"}, {"name": "emissor", "parent": "root", "x": 100, "y": 0, "rotation": 90}],
		"slots": [{"name": "fx", "bone": "emissor", "attachment": "jato"}, {"name": "rastro", "bone": "root"}],
		"skins": [{"name": "default", "attachments": {
			"fx": {"jato": emissor, "pano": {"type": "mesh", "vertices": [0, 0, 10, 0, 10, 10, 0, 10],
				"uvs": [0, 0, 1, 0, 1, 1, 0, 1], "triangles": [0, 1, 2, 0, 2, 3], "hull": 4}},
			"rastro": {"trilha": {"type": "path", "closed": false, "vertices": [0, 0, 0, 0, 0, 0, 10, 0, 10, 0, 10, 0]}}}}]}


## G9, regra 21: `curve` ausente, que não é caminho, ou de um slot que não
## existe — o emissor não se desenha e avisa uma vez. Nunca cai para `point`.
func _g9_curva_que_nao_e_caminho_avisa() -> void:
	var casos := [["sem curve", {"shape": "path"}, "sem curve"],
		["curve numa malha", {"shape": "path", "curve": "fx/pano"}, "nao e um anexo path"],
		["curve sem barra", {"shape": "path", "curve": "trilha"}, "ausente ou sem"],
		["slot que não existe", {"shape": "path", "curve": "nada/trilha"}, "o slot \"nada\""]]
	for c in casos:
		var dados = C._finish(_doc_do_emissor(c[1]), Callable())["dados"]
		var ator = Ator.new(dados)
		ator.pose(null, 0.3, 0.3, false, -INF)
		var esq = ator.current
		var slot = esq.slot_by_name["fx"]
		var achado: Array = esq.attachment_for(slot)
		var vivas: Array = P.vivas(esq, slot, achado[0], achado[1], 0.3, null, 0.0, false, func(_b): return esq)
		var aviso := ""
		for w in esq.warnings:
			if w.contains("REF_PARTICLE_CURVE"):
				aviso = w
		ator.liberar()
		_ok("G9: %s — o emissor não se desenha e avisa" % c[0], vivas.is_empty() and aviso.contains(c[2]), aviso)
	# A régua de cima mede alguma coisa: com o caminho certo, nascem partículas.
	var dados2 = C._finish(_doc_do_emissor({"shape": "path", "curve": "rastro/trilha"}), Callable())["dados"]
	var dump := D.build_pose_dump(dados2, {"times": [0.3], "measure": ["particles"]})
	var lista: Array = dump["samples"][0]["particles"]["fx/jato"]
	var no_caminho := not lista.is_empty()
	for p in lista:
		# A trilha vai de (0, 0) a (10, 0) no root: y = 0 e x entre 0 e 10.
		if absf(p["y"]) > 1e-6 or p["x"] < -1e-6 or p["x"] > 10 + 1e-6:
			no_caminho = false
	_ok("G9: com a curve certa (outro slot), %d partículas nascem EM CIMA da trilha" % lista.size(), no_caminho, str(lista))


## G9, o passo 7 da 9.4.2 na MALHA: em `world` o ponto da malha nasce no
## esqueleto e volta ao referencial do emissor antes de a 7.2 o levar de volta.
## Conta à mão: o osso do emissor girado 90 e em (100, 0) leva o vértice
## (x, y) a (100 − y, x); com velocidade 0, cada partícula fica EM CIMA de um
## dos quatro: (100, 0), (100, 10), (90, 10), (90, 0). Quem leva duas vezes
## (o Python de 05/10) põe a de (100, 10) em (90, 100).
func _g9_malha_em_world() -> void:
	var dados = C._finish(_doc_do_emissor({"shape": "mesh", "mesh": "pano", "meshMode": "vertex", "space": "world"}), Callable())["dados"]
	var dump := D.build_pose_dump(dados, {"times": [0.3], "measure": ["particles"]})
	var lista: Array = dump["samples"][0]["particles"]["fx/jato"]
	var cantos := [[100.0, 0.0], [100.0, 10.0], [90.0, 10.0], [90.0, 0.0]]
	var em_cima := not lista.is_empty()
	for p in lista:
		var perto := false
		for c in cantos:
			if absf(p["x"] - c[0]) < 1e-6 and absf(p["y"] - c[1]) < 1e-6:
				perto = true
		if not perto:
			em_cima = false
	_ok("G9: malha em world — as %d partículas nascem em cima dos vértices da malha" % lista.size(), em_cima, str(lista))

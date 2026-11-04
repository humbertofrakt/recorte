# SPDX-License-Identifier: Apache-2.0
# O desenhador do leitor do Godot (rodada G1; malha e máscara na G3, 05/10/2026).
#
# Não vem do Python (o runtime Python não desenha). A forma vem do desenhador
# do Construct (`leitor-construct/src/desenhador.ts`), que por sua vez segue o
# desenhador do editor (`runtime/src/render/canvas.ts`).
#
# FUNÇÃO PURA: recebe um esqueleto já posado e devolve as listas que o
# `RenderingServer.canvas_item_add_triangle_array` pede — pontos, uv, índices,
# cores —, uma peça por anexo desenhado, na ordem de desenho (7.13). Não toca
# em nó, textura nem janela: quem chama o RenderingServer é o `recorte.gd`.
# Por isso se testa sem janela.
#
# Em duas etapas, para a prova poder olhar a do meio:
#   1. `pecas_do_quadro` — cada peça no espaço do ESQUELETO (Y para cima), com
#      a cor final (7.12), a mistura, e JÁ CORTADA pelas máscaras (7.7; a
#      conta está em `corte.gd`);
#   2. `para_godot` — a peça levada ao espaço do nó do Godot (Y para BAIXO).
#      A virada do eixo Y mora NUM LUGAR SÓ: a função `virar_y` (§3.3).
#
# Desenha: região, malha e linkedmesh (com pesos, deform, morph e o quadro da
# sequência), cortadas pela máscara, com a cor e a mistura do slot. E, desde a
# G7, o emissor de partículas (`BONE_particles`): todas as partículas seguidas
# da mesma página numa peça só, com a cor de cada uma nos vértices. E, desde a
# G5, a entidade encaixada (`skeleton`, 7.11): o filho no lugar dele, em bloco,
# ou em volta de quem o recebe (`around`: atrás · o boneco · na frente), com
# a cor herdada (`inheritColor`). Entidade que não carregou, ou `around` com
# um slot que o filho não tem, AVISA.
#
# O que ainda não desenha AVISA (regra 21), nunca improvisa em silêncio:
#   - máscara que se cruza (7.7 proíbe) ............ a peça sai sem aquele corte
#   - cor escura (tint black, 7.12) ................ precisa de shader: sai só a cor clara
#   - mistura `screen`: o Godot 2D não tem; sai `normal` e avisa (7.12 manda assim)
@tool
extends RefCounted

const C := preload("carregador.gd")
const Corte := preload("corte.gd")
const P := preload("particulas.gd")
const M := preload("mat.gd")

## Os quatro cantos de uma região em dois triângulos (o `REGION_TRIANGLES` do runtime).
const REGION_TRIANGLES := [0, 1, 2, 0, 2, 3]

## Acima disto, num emissor, o leitor AVISA o peso e desenha todas (o
## `TETO_DE_PARTICULAS` do Construct).
const TETO_DE_PARTICULAS := 300


## Junta os avisos do desenho, cada um uma vez (o desenho roda a cada quadro).
class Avisos:
	var textos: Array = []
	var _vistos := {}
	var _lidos := 0

	func avisar(chave: String, texto: String) -> void:
		if _vistos.has(chave):
			return
		_vistos[chave] = true
		textos.append(texto)

	## Só os que chegaram desde a última chamada (para o console).
	func novos() -> Array:
		var n := textos.slice(_lidos)
		_lidos = textos.size()
		return n


static func _unit(v: float) -> float:
	return 0.0 if v < 0 else (1.0 if v > 1 else v)


## As peças de um quadro, na ordem de desenho de 7.13. Espaço do esqueleto
## (Y para cima). Cada peça é um Dictionary:
##   slot, anexo, tipo, pagina (o nome da imagem da página do atlas),
##   premultiplicada, mistura, mundo (Array x,y), uvs (Array u,v; v = 0 é o alto
##   da imagem), triangulos (Array de índices), cor (Array RGBA de 0 a 1),
##   recortes (os nomes dos anexos das máscaras que cortaram a peça),
##   nome (`slot/anexo`, com o slot do pai na frente a cada nível: o `piece`
##   da `drawList`), mascaras (os nomes das máscaras do mesmo jeito: os
##   `clips` da `drawList`), profundidade (0 = o boneco de fora).
## O esqueleto já tem de estar posado (`update_pose` chamado, e as entidades
## por `Ator.pose_nested`). `cortar = false` devolve as peças INTEIRAS (só a
## prova usa, para comparar com o editor). `so_lista = true` (só a prova):
## cada peça só com nome e máscaras, sem pular a que não tem região no atlas
## nem a transparente, e uma por emissor — a `drawList` de 12.4, pela MESMA
## volta (`_grupos`) que desenha. É assim que os casos sem atlas da suíte
## (C-310 a C-319) medem o desenhador.
##
## G5: os três grupos de 7.11, pela MESMA volta da `lista_desenho.gd` (a
## `draw_list.py`): primeiro se junta a lista, cada peça com as máscaras dela
## de fora para dentro; só no fim cada peça é cortada. Assim a máscara do
## filho viaja com a peça para o grupo em que ela cai (C-318), e a de quem
## recebe não corta a peça marcada (C-319).
static func pecas_do_quadro(skeleton, avisos: Avisos, cortar := true, so_lista := false) -> Array:
	var ctx := {"avisos": avisos, "cortar": cortar and not so_lista, "cache": {}, "lista": so_lista}
	var relogio := [skeleton.playing_animation, skeleton.playing_time, skeleton.playing_loop, skeleton.pose_em]
	var g := _grupos(skeleton, "", [1.0, 1.0, 1.0, 1.0], 0, relogio, ctx)
	var lista: Array = g[0].duplicate()
	for m in g[1]:
		lista.append(m[1])
	lista.append_array(g[2])
	var saida: Array = []
	for peca in lista:
		_cortar(peca, ctx, saida)
	return saida


## [atras, meio, frente] de um esqueleto (o `_groups` da `draw_list.py`).
## `meio` guarda [slot de S, peça]: é contra ele que um corte um nível acima
## mede "antes" e "depois". `luz` é o `light` que o pai passa ao filho
## (`inheritColor`, 7.11); `relogio` = [animação, tempo, laço, pose_em] das
## partículas deste esqueleto.
static func _grupos(skeleton, prefixo: String, luz: Array, profundidade: int, relogio: Array,
		ctx: Dictionary) -> Array:
	var avisos: Avisos = ctx["avisos"]
	var behind: Array = []
	var middle: Array = []
	var front: Array = []
	# A máscara em vigor (o `collectDrawables` do runtime, 7.7): null ou
	# {"anexo", "nome", "poligono", "end", "slots", "inverter"}.
	var clip = null
	for slot in skeleton.ordered_slots():
		var found: Array = skeleton.attachment_for(slot)
		var anexo = found[0]
		if anexo == null or not slot.visible:
			continue
		var nome: String = slot.name
		if anexo is C.ClippingAttachment:
			var fim = anexo.end if anexo.end != null and skeleton.slot_by_name.has(anexo.end) else null
			if anexo.slots == null and fim == null:
				clip = null  # não corta nada (o `clipsAnything` do runtime)
				continue
			clip = {"anexo": anexo, "nome": "%s%s/%s" % [prefixo, nome, anexo.name],
				"poligono": skeleton.world_vertices(slot, anexo, found[1]),
				"end": fim, "slots": anexo.slots, "inverter": anexo.invert}
			continue
		var corta: bool = clip != null and (clip["slots"] == null or clip["slots"].has(nome))
		var outer: Array = [clip] if corta else []

		if ctx["lista"] and (anexo is C.RegionAttachment or anexo is C.MeshAttachment
				or (anexo is C.ParticleAttachment and anexo.shape_ok)):
			middle.append([nome, {"slot": nome, "anexo": anexo.name, "nome": "%s%s/%s" % [prefixo, nome, anexo.name],
				"tipo": anexo.type, "profundidade": profundidade, "clips": outer}])
		elif anexo is C.RegionAttachment or anexo is C.MeshAttachment:
			var p = _peca(slot, anexo, found[1], skeleton, prefixo, luz, profundidade, avisos)
			if p != null:
				p["clips"] = outer
				middle.append([nome, p])
		elif anexo is C.ParticleAttachment:
			for p in _pecas_particulas(skeleton, slot, anexo, found[1], prefixo, luz, profundidade, relogio, avisos):
				p["clips"] = outer
				middle.append([nome, p])
		elif anexo is C.SkeletonAttachment:
			var filho = _filho(skeleton, slot, anexo, avisos)
			if filho != null:
				var luz_filho: Array = luz
				if anexo.inherit_color:
					# 7.11: o `light` do slot pai (slot × anexo, 7.12) multiplica o
					# de cada slot do filho; a cor escura não se herda.
					luz_filho = []
					for i in range(4):
						luz_filho.append(luz[i] * _unit(slot.color[i]) * _unit(anexo.color[i]))
				var relogio_filho := [null, relogio[1], false, _pose_em_do_filho(relogio[3], nome)]
				var cg := _grupos(filho, "%s%s/" % [prefixo, nome], luz_filho, profundidade + 1, relogio_filho, ctx)
				var mark = anexo.around
				if mark != null and not filho.slot_by_name.has(mark):
					# 2.5: um slot que o filho não tem — em bloco, como sem o
					# campo, e um aviso uma vez. Nunca um palpite.
					avisos.avisar("around:%s%s" % [prefixo, nome],
						"O slot \"%s\" não existe no esqueleto encaixado no slot \"%s\": ele é desenhado em bloco (7.11, 2.5)." % [mark, nome])
					mark = null
				if mark == null:
					var whole: Array = cg[0].duplicate()
					for m in cg[1]:
						whole.append(m[1])
					whole.append_array(cg[2])
					for piece in whole:
						piece["clips"] = outer + piece["clips"]
						middle.append([nome, piece])
				else:
					# Pela posição de `m` na ordem do filho no instante. Vazio,
					# escondido ou trocado, o slot guarda o lugar (C-317).
					var position := {}
					var ordered: Array = filho.ordered_slots()
					for i in range(ordered.size()):
						position[ordered[i].name] = i
					var at: int = position[mark]
					var before: Array = cg[0].duplicate()
					var after: Array = []
					for m in cg[1]:
						if position[m[0]] < at:
							before.append(m[1])
						elif position[m[0]] > at:
							after.append(m[1])
					after.append_array(cg[2])
					behind = before + behind
					front = front + after
		# point, boundingbox, path não se desenham (7.6, 7.8, 7.9), mas contam para o `end`.
		if clip != null and clip["slots"] == null and nome == clip["end"]:
			clip = null
	return [behind, middle, front]


## O esqueleto vivo que o slot mostra, ou null com o aviso (regra 21).
static func _filho(skeleton, slot, anexo, avisos: Avisos):
	if anexo.child == null:
		avisos.avisar("aninhado:" + anexo.name,
			"O esqueleto encaixado \"%s\" (slot \"%s\") não foi carregado: nada desenhado no lugar dele (7.11)." % [anexo.name, slot.name])
		return null
	var instance = skeleton.nested_pool.get(slot.name)
	if instance == null or instance.resolved != anexo.resolved:
		avisos.avisar("aninhado-sem-pose:" + anexo.name,
			"O esqueleto encaixado \"%s\" (slot \"%s\") não foi posado (falta o `Ator.pose_nested`): nada desenhado no lugar dele." % [anexo.name, slot.name])
		return null
	return instance.skeleton


## O mesmo `pose_em`, apontado para a entidade que mora em `slot_name` (o
## `_pose_em_do_filho` da `pose_dump.py`).
static func _pose_em_do_filho(pose_em, slot_name: String):
	if pose_em == null:
		return null
	return func(birth: float):
		# O nó guarda só a matriz dos slots com emissor (`_PoseFixa`), sem
		# entidades: então não há a pose do filho, e as vivas avisam.
		var posado = pose_em.call(birth)
		var pool = posado.get("nested_pool") if posado != null else null
		var instance = pool.get(slot_name) if pool != null else null
		return null if instance == null else instance.skeleton


## Uma região ou malha, inteira, no espaço do esqueleto. Null quando não há o
## que desenhar (sem região no atlas, que avisa; ou transparente).
static func _peca(slot, anexo, skin_name: String, skeleton, prefixo: String, luz: Array,
		profundidade: int, avisos: Avisos):
	var nome: String = slot.name
	var frame := _quadro(slot, anexo)
	var regiao = frame[0]
	if regiao == null or regiao.page == null:
		avisos.avisar("regiao:" + anexo.name,
			"O anexo \"%s\" (slot \"%s\") não tem região no atlas: não foi desenhado." % [anexo.name, nome])
		return null
	# 7.12: a cor clara final é a do slot vezes a do anexo, presa em [0, 1].
	var cor: Array = []
	for i in range(4):
		cor.append(_unit(slot.color[i]) * _unit(anexo.color[i]) * luz[i])
	if cor[3] <= 0:
		return null
	var mistura := _mistura(slot, avisos)
	# A malha leva o `skin_name`: é o endereço do deform e do morph (9.6).
	return {
		"slot": nome,
		"anexo": anexo.name,
		"nome": "%s%s/%s" % [prefixo, nome, anexo.name],
		"tipo": anexo.type,
		"pagina": regiao.page.image,
		"premultiplicada": regiao.page.premultiplied,
		"mistura": mistura,
		"mundo": skeleton.world_vertices(slot, anexo, skin_name),
		"uvs": frame[1],
		"triangulos": REGION_TRIANGLES.duplicate() if anexo is C.RegionAttachment else anexo.triangles.duplicate(),
		"cor": cor,
		"profundidade": profundidade,
	}


## A mistura do slot, e o aviso da cor escura (as duas, de toda peça).
static func _mistura(slot, avisos: Avisos) -> String:
	if slot.dark_color != null:
		avisos.avisar("escura:" + slot.name,
			"O slot \"%s\" tem cor escura (tint black, 7.12): o Godot ainda desenha só a cor clara dele." % slot.name)
	var mistura: String = slot.blend
	if mistura == "screen":
		avisos.avisar("screen:" + slot.name,
			"O slot \"%s\" pede a mistura screen, que o Godot 2D não tem: sai normal (7.12)." % slot.name)
		mistura = "normal"
	return mistura


## Corta a peça pelas máscaras dela, de fora para dentro, e a põe na saída.
## Um grupo de partículas (com `cores_por_vertice`) cortado vira uma peça por
## partícula: o corte muda os vértices de cada uma.
static func _cortar(peca: Dictionary, ctx: Dictionary, saida: Array) -> void:
	var clips: Array = peca["clips"]
	peca.erase("clips")
	var recortes: Array = []
	var nomes: Array = []
	for c in clips:
		recortes.append(c["anexo"].name)
		nomes.append(c["nome"])
	peca["recortes"] = recortes
	peca["mascaras"] = nomes
	if clips.is_empty() or not ctx["cortar"]:
		saida.append(peca)
		return
	var mascaras := _mascaras(clips, peca["slot"], ctx)
	if mascaras.is_empty():
		saida.append(peca)
		return
	if peca.has("cores_por_vertice"):
		var mundo: Array = peca["mundo"]
		var uvs: Array = peca["uvs"]
		var cores: Array = peca["cores_por_vertice"]
		for k in range(0, mundo.size() / 2, 4):
			var cortada := Corte.cortar_peca(mundo.slice(k * 2, k * 2 + 8), uvs.slice(k * 2, k * 2 + 8),
				REGION_TRIANGLES.duplicate(), mascaras)
			if cortada["triangulos"].is_empty():
				continue
			var rgba: Array = cores.slice(k * 4, k * 4 + 4)
			var cv: Array = []
			for _v in range(cortada["mundo"].size() / 2):
				cv.append_array(rgba)
			var uma: Dictionary = peca.duplicate()
			uma["mundo"] = cortada["mundo"]
			uma["uvs"] = cortada["uvs"]
			uma["triangulos"] = cortada["triangulos"]
			uma["cor"] = rgba
			uma["cores_por_vertice"] = cv
			saida.append(uma)
		return
	var c2 := Corte.cortar_peca(peca["mundo"], peca["uvs"], peca["triangulos"], mascaras)
	if c2["triangulos"].is_empty():
		return  # a máscara tirou tudo: nada a desenhar
	peca["mundo"] = c2["mundo"]
	peca["uvs"] = c2["uvs"]
	peca["triangulos"] = c2["triangulos"]
	saida.append(peca)


## Um emissor (`BONE_particles`), no lugar do slot dele na ordem de desenho:
## o `juntarParticulas` do Construct. Sem estado, função do tempo. Cada
## partícula é um quadrado da imagem, centrado no pivô, girado pelo ângulo dela
## e no tamanho dela. Todas as seguidas da mesma página viram UMA peça, com a
## cor de cada uma nos vértices (`cores_por_vertice`). O corte, se houver,
## vem depois, em `_cortar`, partícula a partícula.
static func _pecas_particulas(skeleton, slot, emissor, skin_name: String, prefixo: String, luz: Array,
		profundidade: int, relogio: Array, avisos: Avisos) -> Array:
	var saida: Array = []
	var nome: String = slot.name
	var animacao = relogio[0]
	var duracao: float = animacao.duration if animacao != null else 0.0
	var vivas: Array = P.particulas_do_slot(skeleton, slot, emissor, skin_name, relogio[1],
		animacao, duracao, relogio[2], relogio[3])
	if vivas.size() > TETO_DE_PARTICULAS:
		avisos.avisar("particula-peso:" + emissor.name,
			"O emissor \"%s\" (slot \"%s\") chegou a %d partículas vivas num quadro. O leitor avisa acima de %d. Todas foram desenhadas." % [
				emissor.name, nome, vivas.size(), TETO_DE_PARTICULAS])
	if vivas.is_empty():
		return saida

	var cor: Array = []
	for i in range(4):
		cor.append(_unit(slot.color[i]) * _unit(emissor.color[i]) * luz[i])
	var mistura := _mistura(slot, avisos)
	var base := {"slot": nome, "anexo": emissor.name, "nome": "%s%s/%s" % [prefixo, nome, emissor.name],
		"tipo": emissor.type, "mistura": mistura, "cor": cor, "profundidade": profundidade}

	# O grupo que está sendo juntado: uma página, várias partículas.
	var grupo := {"regiao": null, "mundo": [], "uvs": [], "cores": []}
	for p in vivas:
		# A região da partícula: o quadro da folha (9.8) ou, sem sequência, a
		# imagem do `path` (o `particleRegion` do runtime TypeScript).
		var quadro = null
		if emissor.sequence != null and p.frame >= 0:
			quadro = emissor.frames[p.frame] if p.frame < emissor.frames.size() else null
		elif not emissor.frames.is_empty():
			quadro = emissor.frames[0]
		if quadro == null or quadro[0] == null:
			avisos.avisar("regiao:" + emissor.name,
				"O emissor \"%s\" (slot \"%s\") não tem região no atlas: não foi desenhado." % [emissor.name, nome])
			_fechar_grupo(grupo, base, saida)
			return saida
		var regiao = quadro[0]
		var alpha: float = cor[3] * p.color[3]
		if alpha <= 0:
			continue
		var r: float = cor[0] * p.color[0]
		var g: float = cor[1] * p.color[1]
		var b: float = cor[2] * p.color[2]
		var q: Array = quadro[1]
		var quv: Array = quadro[2]
		var c: float = M.cosd(p.angle) * p.scale
		var s: float = M.sind(p.angle) * p.scale
		var canto: Array = []
		for i in range(0, 8, 2):
			canto.append(p.x + q[i] * c - q[i + 1] * s)
			canto.append(p.y + q[i] * s + q[i + 1] * c)
		if grupo["regiao"] != null and grupo["regiao"].page.name != regiao.page.name:
			_fechar_grupo(grupo, base, saida)
		grupo["regiao"] = regiao
		grupo["mundo"].append_array(canto)
		grupo["uvs"].append_array(quv)
		for _v in range(4):
			grupo["cores"].append_array([r, g, b, alpha])
	_fechar_grupo(grupo, base, saida)
	return saida


static func _fechar_grupo(grupo: Dictionary, base: Dictionary, saida: Array) -> void:
	if grupo["regiao"] == null or grupo["mundo"].is_empty():
		return
	var n: int = grupo["mundo"].size() / 2
	var tri: Array = []
	for k in range(0, n, 4):
		tri.append_array([k, k + 1, k + 2, k, k + 2, k + 3])
	var peca: Dictionary = base.duplicate()
	peca["cor"] = base["cor"].duplicate()
	peca["pagina"] = grupo["regiao"].page.image
	peca["premultiplicada"] = grupo["regiao"].page.premultiplied
	peca["mundo"] = grupo["mundo"]
	peca["uvs"] = grupo["uvs"]
	peca["triangulos"] = tri
	peca["cores_por_vertice"] = grupo["cores"]
	saida.append(peca)
	grupo["mundo"] = []
	grupo["uvs"] = []
	grupo["cores"] = []


## As máscaras prontas para cortar, de fora para dentro (a que se cruza fica
## de fora, com aviso).
static func _mascaras(clips: Array, nome: String, ctx: Dictionary) -> Array:
	var cache: Dictionary = ctx["cache"]
	var out: Array = []
	for clip in clips:
		var chave: String = clip["nome"]
		if not cache.has(chave):
			var tri = Corte.triangular_mascara(clip["poligono"])
			cache[chave] = null if tri == null else {"triangulos": tri, "inverter": clip["inverter"]}
		var m = cache[chave]
		if m == null:
			ctx["avisos"].avisar("mascara-cruza:" + chave,
				"A máscara \"%s\" se cruza (7.7 não deixa): o leitor não sabe cortar por ela, e \"%s\" sai sem esse corte." % [clip["anexo"].name, nome])
			continue
		out.append(m)
	return out


## [região, uvs da página] do quadro que o slot mostra (7.10: a sequência
## troca de quadro, e cada quadro tem o seu retângulo na página). Na região o
## quadro é [região, cantos, uvs]; na malha, [região, uvs]: o uv é o último.
static func _quadro(slot, anexo) -> Array:
	if anexo.sequence == null or anexo.frames.is_empty():
		return [anexo.region, anexo.page_uvs]
	var index = slot.sequence_index
	if index == null:
		index = anexo.sequence.setup
	if index < 0 or index >= anexo.frames.size():
		index = 0
	var f: Array = anexo.frames[index]
	return [f[0], f[-1]]


## A virada do eixo Y, num lugar só (§3.3): o esqueleto tem Y para cima, o
## Godot tem Y para baixo. `escala` é o tamanho do nó (1 = o tamanho do editor).
static func virar_y(x: float, y: float, escala: float) -> Vector2:
	return Vector2(x * escala, -y * escala)


## Leva as peças ao espaço do nó do Godot. Cada peça ganha:
##   pontos (PackedVector2Array), uv (PackedVector2Array),
##   indices (PackedInt32Array), cores (PackedColorArray, uma por vértice).
## Os triângulos ficam como estão: virar o Y inverte o giro dos triângulos,
## e o desenho 2D do Godot não descarta triângulo pelo giro.
static func para_godot(pecas: Array, escala: float) -> Array:
	var saida: Array = []
	for p in pecas:
		var mundo: Array = p["mundo"]
		var uvs: Array = p["uvs"]
		var pontos := PackedVector2Array()
		var uv := PackedVector2Array()
		var cores := PackedColorArray()
		var cor := Color(p["cor"][0], p["cor"][1], p["cor"][2], p["cor"][3])
		# Nas partículas cada vértice tem a cor da sua partícula (G7).
		var por_vertice = p.get("cores_por_vertice")
		for i in range(0, mundo.size(), 2):
			pontos.append(virar_y(mundo[i], mundo[i + 1], escala))
			uv.append(Vector2(uvs[i], uvs[i + 1]))
			if por_vertice != null:
				var k := i * 2
				cores.append(Color(por_vertice[k], por_vertice[k + 1], por_vertice[k + 2], por_vertice[k + 3]))
			else:
				cores.append(cor)
		var g: Dictionary = p.duplicate()
		g["pontos"] = pontos
		g["uv"] = uv
		g["indices"] = PackedInt32Array(p["triangulos"])
		g["cores"] = cores
		saida.append(g)
	return saida

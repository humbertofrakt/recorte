# SPDX-License-Identifier: Apache-2.0
# Copiado de runtime-python/recorte/actor.py (rodada G5, 05/10/2026).
#
# O ator de um projeto (9.10, 9.13) e o esqueleto aninhado (7.11).
#
# `pose` recebe o PROJETO, não um esqueleto: a animação diz, em cada `t`, qual
# corpo está vivo. Todo corpo que uma chave `body` cita é montado uma vez, na
# carga (`SkeletonData.bodies`), e a virada só troca qual deles é posado.
#
# Um anexo `skeleton` — a entidade — é um esqueleto inteiro dentro de um slot.
# A raiz dele toma `M_ossoDoSlot × T·R·S` do anexo como pai, e a pose dele vem
# em duas camadas: a `baseAnimation` embaixo, e por cima a animação escolhida
# pela tabela de precedência de 7.11.
#
# Diferenças que o GDScript obriga:
#   - o `Actor` do Python é ESTE arquivo (o script é a classe): classe
#     interna não chama função estática de fora, e o ator chama `pose_nested`;
#   - a tupla (animação, tempo, laço, escala) vira Array de quatro;
#   - laço de `RefCounted` vaza: o ator, as instâncias e os filhos têm
#     `liberar()` (não está no Python, onde o coletor acha os ciclos);
#   - `list.sort` do Python é estável e `sort_custom` não: os eventos dos
#     filhos levam a posição como desempate (em `dump.gd`).
#
# O que NÃO está no Python, e por quê: as ORDENS DO JOGO para a peça (`08`,
# seção 4: "animar a peça", "soltar a peça"). O Python só lê arquivo; o jogo
# precisa mandar na peça. A ordem entra na tabela de precedência de 7.11 logo
# abaixo da chave `nested/animation` (quem escolheu na faixa manda, `08` 6.2,
# como no leitor do Construct) e acima de `inheritAnimation` e `animation`.
# Sem ordem, a conta é a do Python, linha a linha.
@tool
extends RefCounted

const C := preload("carregador.gd")
const E := preload("esqueleto.gd")
const A := preload("animacao.gd")


static func _wrapped(animation, t: float, loop: bool) -> float:
	var duration: float = animation.duration
	if loop and duration > 0:
		return fposmod(t, duration)
	return t


## `==` do Python: tipos diferentes dão falso (no GDScript, erro).
static func _igual(a, b) -> bool:
	if C.is_number(a) and C.is_number(b):
		return float(a) == float(b)
	return typeof(a) == typeof(b) and a == b


## Desde quando o valor que vale em `t` começou a valer.
##
## Anda para trás pelas chaves de mesmo valor (ou que `same(antes, agora)`
## chama de iguais). Uma corrida que chega na primeira chave vale desde o
## começo da animação (9.10: antes da primeira chave, a primeira chave), e
## então começa em 0.
static func _run_start(keys: Array, t: float, same = null) -> float:
	var index := -1
	for i in range(keys.size()):
		if keys[i].time <= t:
			index = i
		else:
			break
	if index <= 0:
		return 0.0
	var value = keys[index].value
	while index > 0 and (_igual(keys[index - 1].value, value)
			or (same != null and same.call(keys[index - 1].value, value))):
		index -= 1
	return 0.0 if index == 0 else keys[index].time


## Apêndice C, 1 (desde 05/10/2026): uma chave que mostra, nas skins do
## instante, um anexo `skeleton` com a mesma `uri` resolvida do que está em
## vigor não reinicia o filho — mesmo com outro nome de placeholder.
static func _same_entity(skeleton, slot_name: String) -> Callable:
	return func(previous, current) -> bool:
		if typeof(previous) != TYPE_STRING or typeof(current) != TYPE_STRING:
			return false
		var before = skeleton.resolve_attachment(slot_name, previous)[0]
		var after = skeleton.resolve_attachment(slot_name, current)[0]
		return (before is C.SkeletonAttachment and after is C.SkeletonAttachment
				and before.child != null and after.child != null
				and before.resolved == after.resolved)


## Uma entidade viva: o esqueleto filho, e o que cada camada toca.
class NestedInstance:
	var resolved := ""
	var skeleton
	# nome da camada -> [animação, tempo do filho antes da volta, laço, escala]
	var layers := {}
	# nome da camada -> [animação, tempo do filho] na última amostra de eventos
	var event_clock := {}
	# nome da camada -> [animação, tempo do filho] na última pose: onde as
	# chaves `reset` de 9.8 foram procuradas, no relógio do próprio filho
	var reset_clock := {}

	func _init(attachment) -> void:
		resolved = attachment.resolved
		skeleton = E.Skeleton.new(attachment.child)
		if not attachment.skins.is_empty():
			skeleton.set_skins(attachment.skins.duplicate())

	## Solta o filho, e os filhos dele (não está no Python).
	func liberar() -> void:
		if skeleton == null:
			return
		for inner in skeleton.nested_pool.values():
			inner.liberar()
		skeleton.nested_pool.clear()
		skeleton.liberar()
		skeleton = null
		layers.clear()
		event_clock.clear()
		reset_clock.clear()


## Posa toda entidade que `skeleton` mostra, depois que o mundo dele está pronto.
## `ordens`: slot -> [nome da animação ou null, segundos desde a ordem, laço]
## (só no nível de cima; não está no Python, ver o topo).
static func pose_nested(skeleton, animation, anim_time: float, now: float, loop: bool,
		ordens: Dictionary = {}) -> void:
	var pool: Dictionary = skeleton.nested_pool
	var used := {}
	for slot in skeleton.slots:
		var attachment = skeleton.attachment_for(slot)[0]
		if not attachment is C.SkeletonAttachment or attachment.child == null:
			continue
		var instance = pool.get(slot.name)
		if instance == null or instance.resolved != attachment.resolved:
			if instance != null:
				skeleton.warn_once(
					"NESTED_REPLACED: o slot \"%s\" trocou de entidade; a nova começa em 0 (7.11)" % slot.name)
				instance.liberar()
			instance = NestedInstance.new(attachment)
			pool[slot.name] = instance
		used[slot.name] = true
		_pose_instance(skeleton, slot, attachment, instance, animation, anim_time, now, loop,
				ordens.get(slot.name))
	for name in pool.keys():
		if not used.has(name):
			skeleton.warn_once(
				"NESTED_GONE: a entidade do slot \"%s\" sumiu (o corpo ou o anexo não a mostram mais) (7.11, 9.13)" % name)
			pool[name].liberar()
			pool.erase(name)


static func _pose_instance(skeleton, slot, attachment, instance, animation,
		anim_time: float, now: float, loop: bool, ordem = null) -> void:
	var child_data = attachment.child
	var child = instance.skeleton
	var clock := anim_time if animation != null else now

	# O relógio do filho começa em 0 quando o anexo fica ativo: a chave
	# `slot/attachment` que o mostra, ou o começo da animação.
	var activation := 0.0
	var nested := {}
	if animation != null:
		for timeline in animation.timelines:
			if (timeline.type == "slot" and timeline.target == slot.name
					and timeline.property == "attachment"):
				activation = _run_start(timeline.keys, anim_time, _same_entity(skeleton, slot.name))
			elif timeline.type == "nested" and timeline.target == slot.name:
				nested[timeline.property if timeline.property != null else ""] = timeline
	var elapsed := maxf(0.0, clock - activation)

	var scale: float = attachment.time_scale
	if nested.has("timeScale"):
		var value = A.evaluate_keys(nested["timeScale"].keys, anim_time)
		if C.is_number(value):
			scale = float(value)

	# Qual animação toca por cima: 7.11, a fonte mais forte primeiro.
	var top = null
	if nested.has("animation"):
		var timeline = nested["animation"]
		var name = A.evaluate_keys(timeline.keys, anim_time)
		if typeof(name) == TYPE_STRING:
			var found = child_data.find_animation(name)
			if found == null:
				skeleton.warn_once(
					"NESTED_ANIMATION_MISSING: \"%s\" não existe no filho do slot \"%s\"" % [name, slot.name])
			else:
				var start := maxf(activation, _run_start(timeline.keys, anim_time))
				top = [found, maxf(0.0, clock - start) * scale, attachment.loop, scale]
		# `null` também vence: nenhuma animação por cima, e sem recurso (9.9).
		if ordem != null:
			skeleton.warn_once(
				"ORDEM_ESPERA: a animação escolhe a animação da peça do slot \"%s\" (chave nested/animation): ela manda, e a ordem do jogo espera (08, 6.2)" % slot.name)
	elif ordem != null:
		# Não está no Python: a ordem do jogo. `null` é "soltar a peça":
		# nenhuma animação por cima, a pose de repouso dela (e a base, se houver).
		if ordem[0] != null:
			var found = child_data.find_animation(ordem[0])
			if found == null:
				skeleton.warn_once(
					"NESTED_ANIMATION_MISSING: \"%s\" não existe na peça do slot \"%s\"; ela fica parada" % [ordem[0], slot.name])
			else:
				top = [found, maxf(0.0, ordem[1]) * scale, ordem[2], scale]
	elif (attachment.inherit_animation and animation != null
			and child_data.find_animation(animation.name) != null):
		top = [child_data.find_animation(animation.name), anim_time * scale, loop, scale]
	elif attachment.animation != null:
		var found = child_data.find_animation(attachment.animation)
		if found == null:
			skeleton.warn_once(
				"NESTED_ANIMATION_MISSING: \"%s\" não existe no filho do slot \"%s\"" % [attachment.animation, slot.name])
		else:
			top = [found, elapsed * scale, attachment.loop, scale]
	if top != null and nested.has("time"):
		var value = A.evaluate_keys(nested["time"].keys, anim_time)
		if C.is_number(value):
			top = [top[0], float(value), top[2], 1.0]

	var base = null
	if attachment.base_animation != null:
		var found = child_data.find_animation(attachment.base_animation)
		if found == null:
			skeleton.warn_once(
				"NESTED_ANIMATION_MISSING: baseAnimation \"%s\" não existe no filho do slot \"%s\"" % [attachment.base_animation, slot.name])
		else:
			# Relógio próprio, em laço; as três propriedades `nested` não o tocam.
			base = [found, elapsed * attachment.time_scale, true, attachment.time_scale]

	# Duas camadas, ordem fixa (7.11).
	child.set_to_setup_pose()
	if base != null:
		A.apply_animation(child, base[0], _wrapped(base[0], base[1], true), false)
	var top_time := 0.0
	if top != null:
		top_time = _wrapped(top[0], top[1], top[2])
		A.apply_animation(child, top[0], top_time, false)
	instance.layers = {}
	if base != null:
		instance.layers["base"] = base
	if top != null:
		instance.layers["top"] = top

	# 7.11: a animação do filho conta INTEIRA — as chaves `reset` também (9.8).
	# Disparam no relógio do filho, antes do `physicsApply` deste mesmo quadro
	# (o `update_pose` abaixo), como no nível de cima (C-262, C-326).
	for layer in instance.layers:
		var l: Array = instance.layers[layer]
		var previous = instance.reset_clock.get(layer)
		var previous_time := -INF
		if previous != null and previous[0] == l[0] and previous[1] <= l[1]:
			previous_time = previous[1]
		A.fire_physics_resets(child, l[0], previous_time, l[1], l[2])
		instance.reset_clock[layer] = [l[0], l[1]]
	for layer in instance.reset_clock.keys():
		if not instance.layers.has(layer):
			instance.reset_clock.erase(layer)

	# P = M × T(x, y)·R(rotation)·S(scaleX, scaleY). M é o quadro do slot: o
	# osso aplicado, com o `transform` de uma chave `slot/bone` (9.5).
	var frame = slot.frame()
	if not frame is E.Frame:
		frame = E.Frame.of(frame)
	child.parent_frame = frame.times_trs(attachment.x, attachment.y, attachment.rotation,
			attachment.scale_x, attachment.scale_y)
	child.update_pose(now)
	pose_nested(child, top[0] if top != null else null, top_time, now,
			top[2] if top != null else false)


## Os eventos de toda entidade desde a amostra anterior, com o nome
## `<slot>/<evento>`. O filho dispara no relógio dele; o tempo escrito no dump
## é o do pai, trazido de volta pela escala do filho.
static func nested_events(skeleton, sample_time: float, prefix: String = "") -> Array:
	var out: Array = []
	for slot_name in skeleton.nested_pool:
		var instance = skeleton.nested_pool[slot_name]
		for layer in instance.layers:
			var l: Array = instance.layers[layer]
			var animation = l[0]
			var time: float = l[1]
			var loop: bool = l[2]
			var scale: float = l[3]
			var previous = instance.event_clock.get(layer)
			var previous_time := -INF
			if previous != null and previous[0] == animation and previous[1] <= time:
				previous_time = previous[1]
			for event in A.fire_events(instance.skeleton, animation, previous_time, time, loop):
				var e: Dictionary = event.duplicate()
				e["time"] = sample_time - (time - float(e["time"])) / (scale if scale != 0 else 1.0)
				e["event"] = "%s%s/%s" % [prefix, slot_name, e["event"]]
				out.append(e)
			instance.event_clock[layer] = [animation, time]
		out.append_array(nested_events(instance.skeleton, sample_time, "%s%s/" % [prefix, slot_name]))
	return out


# ---------------------------------------------------------------------------
# O ator: um esqueleto por corpo, montado uma vez (9.13).
# ---------------------------------------------------------------------------

var data
var pool := {}
# corpo (null = o do arquivo) -> esqueleto
var skeletons := {}
var stack: Array = ["default"]
var body = null
var current
var _posed := {}
var warnings: Array = []
# Não está no Python: as ordens do jogo para as peças (ver o topo), e as
# skins que ficam SEMPRE no topo da pilha, mesmo depois de uma virada de
# corpo com `keepSkins: false` (a skin dos encaixes do jogo, `08` seção 4).
var ordens := {}
var topo: Array = []


func _init(data_) -> void:
	data = data_
	skeletons[null] = E.Skeleton.new(data)
	for uri in data.bodies:
		skeletons[uri] = E.Skeleton.new(data.bodies[uri])
	for skeleton in skeletons.values():
		# 9.13: a entidade continua no slot de mesmo nome, seja qual for o
		# corpo; as instâncias moram com o ator, não com o corpo.
		skeleton.nested_pool = pool
	current = skeletons[null]


var file_skeleton:
	get:
		return skeletons[null]


## Solta tudo: os corpos, as entidades e os filhos delas (não está no Python).
func liberar() -> void:
	for instance in pool.values():
		instance.liberar()
	pool.clear()
	for skeleton in skeletons.values():
		skeleton.nested_pool = {}
		skeleton.liberar()
	skeletons.clear()
	current = null


func warn_once(message: String) -> void:
	if not warnings.has(message):
		warnings.append(message)


func set_skins(names: Array) -> void:
	stack = names.duplicate()


## O `corpoEm` de 9.13, e a pilha de skins que as chaves cruzadas deixam.
## Devolve [corpo, pilha].
func body_at(animation, t: float) -> Array:
	var b = null
	var s: Array = stack.duplicate()
	if animation == null:
		return [b, s]
	for timeline in animation.timelines:
		if timeline.type != "body":
			continue
		for key in timeline.keys:
			if key.time > t:
				break
			var value = key.value if typeof(key.value) == TYPE_STRING else null
			if value != null and not skeletons.has(value):
				warn_once("BODY_MISSING: corpo %s não carregado; fica o de antes" % value)
				continue
			b = value
			if not key.keep_skins:
				s = ["default"]
	return [b, s]


func pose(animation, anim_time: float, now: float, loop: bool, previous_now: float):
	var found := body_at(animation, anim_time)
	var b = found[0]
	var s: Array = found[1] + topo
	var skeleton = skeletons[b]
	if skeleton.skin_names != s:
		var known := {}
		for skin in skeleton.data.skins:
			known[skin.name] = true
		for n in s:
			if not known.has(n):
				warn_once("BODY_SKIN_MISSING: o corpo %s não tem a pele %s; ignorada"
						% [b if b != null else "(o arquivo)", n])
		skeleton.set_skins(s)
	if b != body and _posed.has(b):
		# 9.13: o esqueleto que entra começa como no primeiro updatePose dele.
		for constraint in skeleton.constraints:
			if constraint.has_method("physics_reset"):
				constraint.physics_reset(now)
	body = b
	current = skeleton
	_posed[b] = true
	if animation != null:
		A.apply_animation(skeleton, animation, anim_time, true, b)
		A.fire_physics_resets(skeleton, animation, previous_now, now, loop)
	else:
		skeleton.set_to_setup_pose()
	skeleton.update_pose(now)
	pose_nested(skeleton, animation, anim_time, now, loop, ordens)
	return skeleton

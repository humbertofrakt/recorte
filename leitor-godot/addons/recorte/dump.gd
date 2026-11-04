# SPDX-License-Identifier: Apache-2.0
# Copiado de runtime-python/recorte/pose_dump.py, a parte `build_pose_dump`
# (rodadas G1 e G2, 05/10/2026). O `compare_pose_dump` não veio: quem compara
# é o executor oficial da suíte (`ferramentas/conformidade.mjs`).
#
# A sonda diz o que medir; o dump responde com uma amostra por tempo pedido.
# Os ângulos saem reduzidos a (-180, 180], como a seção pede.
#
# O `Actor` (corpos, 9.13), o aninhado (7.11), os eventos dos filhos e o
# canal `drawList` (7.13) vieram na rodada G5: `ator.gd` e `lista_desenho.gd`.
# Os objetos de um filho entram nos mesmos canais, com o nome do slot do pai
# na frente — prefixo dentro de prefixo (12.4).
#
# A física (`physicsDt`, rodada G6): o relógio anda em passos como manda o
# passo 4, e cada pose solta os `reset` cruzados desde a anterior.
@tool
extends RefCounted

const C := preload("carregador.gd")
const E := preload("esqueleto.gd")
const A := preload("animacao.gd")
const M := preload("mat.gd")
const P := preload("particulas.gd")
const Ator := preload("ator.gd")
const L := preload("lista_desenho.gd")

const DEFAULT_MEASURE := ["bones", "slots", "drawOrder", "vertices", "uvs", "events"]


# ---------------------------------------------------------------------------
# A sonda lida com os números CERTOS (rodada G8). Não está no Python: lá o
# `json.loads` já lê certo.
#
# O JSON do Godot lê `0.016666666666666666` uma casa binária ABAIXO de 1/60
# (medido na G6). A física decide passo a passo por `acumulado >= passo`, e
# com `physicsDt` exato de 1/60 o dump pulava passos. O conserto relê do TEXTO
# o `physicsDt` e os `times` pelo caminho rápido de Clinger: com o inteiro dos
# dígitos exato no double e o expoente até 22, UMA divisão (ou multiplicação)
# dá o double mais próximo — é a regra do IEEE. Fora disso, fica o do Godot.
# ---------------------------------------------------------------------------

## O double mais próximo do número escrito em `texto`, quando o caminho rápido
## garante; senão, o que o Godot lê.
static func numero_exato(texto: String) -> float:
	var s := texto.strip_edges()
	var re := RegEx.create_from_string("^(-?)(\\d*)(?:\\.(\\d*))?(?:[eE]([+-]?\\d+))?$")
	var m := re.search(s)
	if m == null:
		return s.to_float()
	var digitos := (m.get_string(2) + m.get_string(3)).lstrip("0")
	var expoente := -m.get_string(3).length()
	if m.get_string(4) != "":
		expoente += int(m.get_string(4))
	var sinal := -1.0 if m.get_string(1) == "-" else 1.0
	if digitos == "":
		return 0.0 * sinal
	if digitos.length() > 18:
		return s.to_float()
	var n := int(digitos)
	if int(float(n)) != n or expoente < -22 or expoente > 22:
		return s.to_float()
	var potencia := 1.0
	for _i in range(absi(expoente)):
		potencia *= 10.0  # 10^k é exato no double até k = 22
	return sinal * (float(n) * potencia if expoente >= 0 else float(n) / potencia)


## A sonda a partir do TEXTO dela: o JSON do Godot, e o `physicsDt` e os
## `times` relidos por `numero_exato`. Devolve o Dictionary, ou null.
static func sonda_de_texto(texto: String):
	if texto.strip_edges() == "":
		return {}
	var sonda = JSON.parse_string(texto)
	if typeof(sonda) != TYPE_DICTIONARY:
		return null
	var num := "(-?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)"
	var dt := RegEx.create_from_string("\"physicsDt\"\\s*:\\s*" + num).search(texto)
	if dt != null and C.is_number(sonda.get("physicsDt")):
		sonda["physicsDt"] = numero_exato(dt.get_string(1))
	var lista := RegEx.create_from_string("\"times\"\\s*:\\s*\\[([^\\]]*)\\]").search(texto)
	if lista != null and typeof(sonda.get("times")) == TYPE_ARRAY:
		var partes := lista.get_string(1).split(",", false)
		if partes.size() == sonda["times"].size():
			var times: Array = []
			for p in partes:
				times.append(numero_exato(p))
			sonda["times"] = times
	return sonda


static func _round(value: float) -> float:
	if not is_finite(value):
		return 0.0
	return value


## 12.4: os objetos de um filho aninhado entram nos mesmos canais, com o nome
## do slot do pai na frente. Devolve [[esqueleto filho, prefixo], ...].
static func _children(skeleton, prefix: String) -> Array:
	var out: Array = []
	for slot in skeleton.slots:
		var instance = skeleton.nested_pool.get(slot.name)
		if instance == null:
			continue
		var attachment = skeleton.attachment_for(slot)[0]
		if not attachment is C.SkeletonAttachment or attachment.resolved != instance.resolved:
			continue
		out.append([instance.skeleton, "%s%s/" % [prefix, slot.name]])
	return out


static func _bones_sample(skeleton, prefix: String = "", out: Dictionary = {}) -> Dictionary:
	for bone in skeleton.bones:
		var pose = bone.applied
		out[prefix + bone.name] = {
			"a": _round(bone.a), "b": _round(bone.b),
			"c": _round(bone.c), "d": _round(bone.d),
			"worldX": _round(bone.world_x), "worldY": _round(bone.world_y),
			"ax": _round(pose.x), "ay": _round(pose.y),
			"arotation": _round(M.normalized(pose.rotation)),
			"ascaleX": _round(pose.scale_x), "ascaleY": _round(pose.scale_y),
			"ashearX": _round(M.normalized(pose.shear_x)),
			"ashearY": _round(M.normalized(pose.shear_y)),
		}
	for c in _children(skeleton, prefix):
		_bones_sample(c[0], c[1], out)
	return out


static func _slots_sample(skeleton, prefix: String = "", out: Dictionary = {}) -> Dictionary:
	for slot in skeleton.slots:
		var attachment = skeleton.attachment_for(slot)[0]
		var colors: Array = []
		for c in slot.color:
			colors.append(_round(c))
		var entry := {
			"attachment": slot.attachment_name if attachment != null else null,
			"color": colors,
			"visible": bool(slot.visible),
		}
		# 12.4: todo campo da tabela do slot sai sempre, mesmo vazio.
		if slot.dark_color != null:
			var dark: Array = []
			for c in slot.dark_color:
				dark.append(_round(c))
			entry["darkColor"] = dark
		else:
			entry["darkColor"] = null
		var sequence = attachment.get("sequence") if attachment != null else null
		if sequence == null:
			entry["sequenceIndex"] = -1
		else:
			entry["sequenceIndex"] = sequence.setup if slot.sequence_index == null else int(slot.sequence_index)
		# 9.5: o osso APLICADO do slot.
		entry["bone"] = slot.bone.name
		out[prefix + slot.name] = entry
	for c in _children(skeleton, prefix):
		_slots_sample(c[0], c[1], out)
	return out


## UV da página do quadro que o slot mostra (7.10 + 10.4).
static func _frame_uvs(slot, attachment) -> Array:
	var frames: Array = attachment.frames
	if frames.is_empty() or attachment.sequence == null:
		return attachment.page_uvs.duplicate()
	var index = slot.sequence_index
	if index == null:
		index = attachment.sequence.setup
	if index < 0 or index >= frames.size():
		index = 0
	return frames[index][-1].duplicate()


## Devolve [vertices, uvs, points, boxes].
static func _geometry_sample(skeleton, prefix: String = "", channels: Array = []) -> Array:
	if channels.is_empty():
		channels.append_array([{}, {}, {}, {}])
	var vertices: Dictionary = channels[0]
	var uvs: Dictionary = channels[1]
	var points: Dictionary = channels[2]
	var boxes: Dictionary = channels[3]
	for slot in skeleton.slots:
		var found: Array = skeleton.attachment_for(slot)
		var attachment = found[0]
		var skin_name: String = found[1]
		if attachment == null:
			continue
		var key: String = prefix + slot.name + "/" + attachment.name
		if attachment is C.BoundingBoxAttachment:
			boxes[key] = _rounded(skeleton.bounding_box_world(slot, attachment))
		elif attachment is C.PointAttachment:
			var p: Array = skeleton.point_world(slot, attachment)
			points[key] = {"x": _round(p[0]), "y": _round(p[1]), "rotation": _round(M.normalized(p[2]))}
		elif attachment is C.RegionAttachment or attachment is C.MeshAttachment \
				or attachment is C.ClippingAttachment or attachment is C.PathAttachment:
			vertices[key] = _rounded(skeleton.world_vertices(slot, attachment, skin_name))
			if attachment is C.RegionAttachment or attachment is C.MeshAttachment:
				uvs[key] = _rounded(_frame_uvs(slot, attachment))
	for c in _children(skeleton, prefix):
		_geometry_sample(c[0], c[1], channels)
	return channels


## 14.1 da `BONE_particles`: seis casas, como o resto do dump.
static func _round6(value: float) -> float:
	if not is_finite(value):
		return 0.0
	return snappedf(value, 0.000001)


## 14.1 da `BONE_particles`: `measure: "particles"`. Uma entrada por emissor,
## `<slot>/<placeholder>`, com as vivas em ordem de desenho, já cortadas pelo
## `maxParticles`. Emissor sem ninguém vivo sai como lista VAZIA.
static func _particles_sample(skeleton, t: float, animation, duration: float, loop: bool, pose_em,
		prefix: String = "", out: Dictionary = {}) -> Dictionary:
	for slot in skeleton.ordered_slots():
		var found: Array = skeleton.attachment_for(slot)
		var attachment = found[0]
		if not attachment is C.ParticleAttachment:
			continue
		var lista: Array = []
		for p in P.particulas_do_slot(skeleton, slot, attachment, found[1], t, animation, duration, loop, pose_em):
			# 14.1: o ângulo sai COMO É, nunca dobrado para -180..180.
			lista.append({"flow": p.flow, "index": p.index,
				"birth": _round6(p.birth), "life": _round6(p.life), "age": _round6(p.age),
				"x": _round6(p.x), "y": _round6(p.y), "angle": _round6(p.angle), "scale": _round6(p.scale)})
		out[prefix + slot.name + "/" + attachment.name] = lista
	for c in _children(skeleton, prefix):
		var slot_name: String = c[1].substr(prefix.length(), c[1].length() - prefix.length() - 1)
		_particles_sample(c[0], t, null, 0.0, false, _pose_em_do_filho(pose_em, slot_name), c[1], out)
	return out


## O mesmo `pose_em`, apontado para a entidade que mora em `slot_name` (7.11).
static func _pose_em_do_filho(pose_em, slot_name: String):
	if pose_em == null:
		return null
	return func(birth: float):
		var instance = pose_em.call(birth).nested_pool.get(slot_name)
		# null quando a entidade não estava naquele slot no nascimento: as
		# vivas avisam e não desenham, em vez de adivinhar uma matriz.
		return null if instance == null else instance.skeleton


static func _rounded(values: Array) -> Array:
	var out: Array = []
	for v in values:
		out.append(_round(v))
	return out


## Roda a sonda e devolve o pose dump.
static func build_pose_dump(data, probe: Dictionary) -> Dictionary:
	var actor = Ator.new(data)
	if typeof(probe.get("skins")) == TYPE_ARRAY:
		actor.set_skins(C._strings(probe["skins"]))

	var animation = null
	var name = probe.get("animation")
	if typeof(name) == TYPE_STRING:
		animation = data.find_animation(name)
	var loop := bool(probe.get("loop", false))
	var measure = probe.get("measure")
	if typeof(measure) != TYPE_ARRAY or measure.is_empty():
		measure = DEFAULT_MEASURE
	var physics_dt := 0.0
	if C.is_number(probe.get("physicsDt")):
		physics_dt = float(probe["physicsDt"])
	var times: Array = []
	var raw_times = probe.get("times")
	if typeof(raw_times) == TYPE_ARRAY and not raw_times.is_empty():
		for t in raw_times:
			times.append(float(t))
	else:
		times = [0.0]

	# 7.2 da `BONE_particles`: `space: "world"` e `shape: "mesh"` pedem o osso
	# posado no instante do NASCIMENTO. Um segundo ator responde, e ele é
	# função pura de `t_i` — o cache só poupa trabalho, nunca muda resposta.
	var poses := {}
	var skins = probe.get("skins")
	var pose_em := func(birth: float):
		if poses.has(birth):
			return poses[birth].current
		var outro = Ator.new(data)
		if typeof(skins) == TYPE_ARRAY:
			outro.set_skins(C._strings(skins))
		var tempo := birth
		if animation != null and loop and animation.duration > 0:
			tempo = fposmod(birth, animation.duration)
		outro.pose(animation, tempo, birth, loop, -INF)
		poses[birth] = outro
		return outro.current

	var samples: Array = []
	var previous_time := -INF
	var steps := 0
	var started := false
	# O `clock["previous"]` do Python: o `now` da pose anterior, para o `reset`.
	var clock := [-INF]
	for time in times:
		if physics_dt > 0:
			if not started:
				_pose_at(actor, animation, loop, 0.0, clock)
				started = true
			var target := int(round(time / physics_dt))
			while steps < target:
				steps += 1
				_pose_at(actor, animation, loop, steps * physics_dt, clock)
		else:
			_pose_at(actor, animation, loop, time, clock)

		var skeleton = actor.current
		# 12.4: sempre presente; `null` é o corpo do arquivo.
		var sample := {"time": time, "body": actor.body}
		if "bones" in measure:
			sample["bones"] = _bones_sample(skeleton, "", {})
		if "slots" in measure:
			sample["slots"] = _slots_sample(skeleton, "", {})
		if "drawOrder" in measure:
			var names: Array = []
			for slot in skeleton.ordered_slots():
				names.append(slot.name)
			sample["drawOrder"] = names
		if "drawList" in measure:
			# 12.4: a lista de 7.13 já aberta, filho a filho.
			var lista: Array = []
			for piece in L.draw_list(skeleton):
				lista.append({"piece": piece[0], "clips": piece[1].duplicate()})
			sample["drawList"] = lista
		if "vertices" in measure or "uvs" in measure or "points" in measure or "boundingBoxes" in measure:
			var g := _geometry_sample(skeleton, "", [])
			if "vertices" in measure:
				sample["vertices"] = g[0]
			if "uvs" in measure:
				sample["uvs"] = g[1]
			if "points" in measure:
				sample["points"] = g[2]
			if "boundingBoxes" in measure:
				sample["boundingBoxes"] = g[3]
		# Os filhos disparam em toda amostra, medida ou não, e o relógio de
		# eventos deles segue as amostras (12.4: a janela é desde a última).
		var child_events := Ator.nested_events(skeleton, time)
		if "events" in measure:
			var events: Array = A.fire_events(actor.file_skeleton, animation, previous_time, time, loop) if animation != null else []
			events.append_array(child_events)
			# O `sort` do Python é estável; aqui, a posição desempata.
			var marcados: Array = []
			for i in range(events.size()):
				marcados.append([events[i]["time"], i, events[i]])
			marcados.sort_custom(func(x, y): return x[0] < y[0] or (x[0] == y[0] and x[1] < y[1]))
			events = []
			for m in marcados:
				events.append(m[2])
			sample["events"] = events
		if "particles" in measure:
			# A medida de 14.1. A partícula trabalha no tempo da ANIMAÇÃO: em
			# laço, `t` e `t + D` são o mesmo instante (6, caso P-003).
			var tempo: float = time
			var duracao := 0.0
			if animation != null:
				duracao = animation.duration
				if loop and duracao > 0:
					tempo = fposmod(time, duracao)
			sample["particles"] = _particles_sample(skeleton, tempo, animation, duracao, loop, pose_em, "", {})
		if "tags" in measure:
			sample["tags"] = skeleton.tags.duplicate()
		if "variables" in measure:
			sample["variables"] = skeleton.variables.duplicate()
		if "parameters" in measure:
			var params := {}
			for p in skeleton.data.parameters:
				params[p.name] = _round(A.parameter_value(skeleton, p))
			sample["parameters"] = params
		samples.append(sample)
		previous_time = time

	# Os esqueletos se apontam com os ossos: soltos à mão (ver `liberar`).
	for outro in poses.values():
		outro.liberar()
	actor.liberar()
	return {"version": "1.0", "samples": samples}


## Uma pose completa, do zero (passo 3 do `como-provar-conformidade.md`):
## o `pose_at` do Python, que chama o `Actor.pose`.
static func _pose_at(actor, animation, loop: bool, now: float, clock: Array) -> void:
	var animation_time := now
	if animation != null:
		var duration: float = animation.duration
		animation_time = fposmod(now, duration) if (loop and duration > 0) else now
	actor.pose(animation, animation_time, now, loop, clock[0])
	if animation != null:
		clock[0] = now

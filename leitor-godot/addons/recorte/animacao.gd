# SPDX-License-Identifier: Apache-2.0
# Copiado de runtime-python/recorte/animation.py (rodada G2, 05/10/2026).
#
# Timelines, curvas, eventos e a função `Pose`. Seções 8 e 9 da
# especificação. Uma timeline mexe numa propriedade de um alvo; propriedade
# sem timeline fica na pose de repouso. Antes da primeira chave vale a
# primeira; depois da última, a última.
#
# A timeline de regra, o `reset` da física e o driver (8.2) vieram na G6.
#
# AINDA NÃO, e onde:
#   - `nested` só guarda o valor no esqueleto; quem o usa é a G5
#   - `body` .......................................................... G5
#
# Diferenças que o GDScript obriga:
#   - `getattr(key, key_field)` vira `key.get(key_field)`, e o `key_field`
#     vem DEPOIS do `deform` (era assim que o G2 já chamava);
#   - `//` do Python vira divisão de inteiros com `int()`;
#   - `setattr(bone.local, campo, valor)` vira `bone.local.set(campo, valor)`.
@tool
extends RefCounted

const C := preload("carregador.gd")
const M := preload("mat.gd")

const _BONE_FIELDS := {
	"x": "x", "y": "y", "rotation": "rotation",
	"scaleX": "scale_x", "scaleY": "scale_y",
	"shearX": "shear_x", "shearY": "shear_y",
	"inheritRotation": "inherit_rotation",
	"inheritScale": "inherit_scale",
	"inheritReflection": "inherit_reflection",
}


# ---------------------------------------------------------------------------
# Curvas (9.3)
# ---------------------------------------------------------------------------

static func _cubic(p0: float, p1: float, p2: float, p3: float, s: float) -> float:
	var u := 1 - s
	return u * u * u * p0 + 3 * u * u * s * p1 + 3 * u * s * s * p2 + s * s * s * p3


## Acha s em [0, 1] com x(s) == t (9.3). A parada é em `s`, não em `x`.
static func bezier_param(t0: float, cx1: float, cx2: float, t1: float, t: float) -> float:
	var span := t1 - t0
	if span <= 0:
		return 0.0
	var epsilon := 1e-12
	var low := 0.0
	var high := 1.0
	var s := 0.5
	for _i in range(64):
		s = (low + high) / 2
		var x := _cubic(t0, cx1, cx2, t1, s)
		if x < t:
			low = s
		else:
			high = s
		if high - low <= epsilon:
			break
	return M.clamp_f(s, 0.0, 1.0)


static func _clamped_handles(curve: Array, j: int, t0: float, t1: float) -> Array:
	var cx1: float = curve[4 * j]
	var cy1: float = curve[4 * j + 1]
	var cx2: float = curve[4 * j + 2]
	var cy2: float = curve[4 * j + 3]
	cx1 = M.clamp_f(cx1, t0, t1)
	cx2 = M.clamp_f(cx2, cx1, t1)
	return [cx1, cy1, cx2, cy2]


static func _interpolable(value) -> bool:
	if typeof(value) == TYPE_BOOL or value == null:
		return false
	if C.is_number(value):
		return true
	if typeof(value) == TYPE_ARRAY:
		if value.is_empty():
			return false
		for v in value:
			if not C.is_number(v):
				return false
		return true
	return false


static func _sample_component(k, t: float, j: int, v0: float, v1: float, t0: float, t1: float) -> float:
	var curve = k.curve
	if typeof(curve) == TYPE_STRING and curve == "stepped":
		return v0
	if typeof(curve) != TYPE_ARRAY:
		if t1 == t0:
			return v0
		return v0 + (v1 - v0) * (t - t0) / (t1 - t0)
	var h := _clamped_handles(curve, j, t0, t1)
	var s := bezier_param(t0, h[0], h[2], t1, t)
	return _cubic(v0, h[1], h[3], v1, s)


## O valor de uma chave: o array alargado na chave de deform, senão `value`.
static func _key_value(key, deform: bool):
	if deform and key.expanded != null:
		return key.expanded
	return key.value


## Alarga cada chave de deform ao tamanho de 7.4, uma vez (9.6).
static func expand_deform_keys(keys: Array, length: int) -> void:
	if length <= 0:
		return
	for key in keys:
		if key.expanded == null or key.expanded.size() != length:
			key.expanded = _expand_deform(key.value, key.offset, length)


static func _is_stepped(curve) -> bool:
	return typeof(curve) == TYPE_STRING and curve == "stepped"


## Seção 9.10 `evaluate`; o driver o usa com `input` no lugar do tempo.
static func evaluate_keys(keys: Array, t: float, components: int = 1, deform: bool = false, key_field: String = "time"):
	if keys.is_empty():
		return null
	# G8: `.get(nome)` é busca por nome; o tempo (o caso de sempre) se lê direto.
	var por_tempo := key_field == "time"
	var first: float = keys[0].time if por_tempo else keys[0].get(key_field)
	if t <= first:
		return _key_value(keys[0], deform)
	var last: float = keys[-1].time if por_tempo else keys[-1].get(key_field)
	if t >= last:
		return _key_value(keys[-1], deform)

	var low := 0
	var high := keys.size() - 1
	while low < high:
		var middle := int((low + high + 1) / 2)
		var tm: float = keys[middle].time if por_tempo else keys[middle].get(key_field)
		if tm <= t:
			low = middle
		else:
			high = middle - 1
	var k = keys[low]
	var n = keys[low + 1]
	var t0: float = k.time if por_tempo else k.get(key_field)
	var t1: float = n.time if por_tempo else n.get(key_field)
	if _is_stepped(k.curve):
		return _key_value(k, deform)
	# A chave de deform é sempre interpolável depois de alargada (9.6).
	if not deform and (not _interpolable(k.value) or not _interpolable(n.value)):
		return k.value

	if deform:
		# Uma curva para todos os vértices: ela interpola um fator s (9.6).
		var factor: float
		if typeof(k.curve) == TYPE_ARRAY:
			var h := _clamped_handles(k.curve, 0, t0, t1)
			var s := bezier_param(t0, h[0], h[2], t1, t)
			factor = _cubic(0.0, h[1], h[3], 1.0, s)
		else:
			factor = (t - t0) / (t1 - t0) if t1 != t0 else 0.0
		# 9.6 alarga cada chave ANTES, cada uma com o seu `offset`, e só então
		# interpola elemento a elemento (ver o comentário do animation.py).
		var left = k.expanded
		var right = n.expanded
		if left == null or right == null:
			left = k.value if typeof(k.value) == TYPE_ARRAY else []
			right = n.value if typeof(n.value) == TYPE_ARRAY else []
		var size := maxi(left.size(), right.size())
		var out: Array = []
		for i in range(size):
			var a: float = left[i] if i < left.size() else 0.0
			var b: float = right[i] if i < right.size() else 0.0
			out.append(a + (b - a) * factor)
		return out

	if typeof(k.value) == TYPE_ARRAY:
		var out: Array = []
		for j in range(k.value.size()):
			var v1: float = n.value[j] if j < n.value.size() else k.value[j]
			out.append(_sample_component(k, t, mini(j, components - 1), k.value[j], v1, t0, t1))
		return out
	return _sample_component(k, t, 0, float(k.value), float(n.value), t0, t1)


# ---------------------------------------------------------------------------
# Ordem de desenho (9.5)
# ---------------------------------------------------------------------------

## Uma chave `parent` (9.4): null = o pai do arquivo. O ciclo é recusado pelo
## `Bone.set_parent`, e o esqueleto avisa uma vez (L2 PARENT_CYCLE).
static func apply_parent_key(skeleton, bone, value) -> void:
	var parent
	if value == null:
		parent = bone.setup_parent
	else:
		parent = skeleton.bone_by_name.get(C._str(value))
		if parent == null:
			return
	if not bone.set_parent(parent):
		var name: String = parent.name if parent != null else ""
		skeleton.warn_once("PARENT_CYCLE: \"%s\" não pode virar filho de \"%s\" (9.4); chave ignorada" % [bone.name, name])


## Uma chave `drawOrder` sobre a ordem BASE de 4.4 (a do array mais o
## `drawOrder` das skins ativas). `[]` = a ordem base. Caso C-280.
static func draw_order_from_offsets(skeleton, entries) -> Array:
	var pairs: Array = []
	if typeof(entries) == TYPE_ARRAY:
		for entry in entries:
			if typeof(entry) != TYPE_DICTIONARY:
				continue
			var slot = skeleton.slot_by_name.get(entry.get("slot"))
			if slot == null:
				continue
			var offset = entry.get("offset", 0)
			if not C.is_number(offset):
				offset = 0
			pairs.append([slot.index, int(offset)])
	return M.order_from_offsets(skeleton.base_draw_order.duplicate(), pairs)


# ---------------------------------------------------------------------------
# Sequências (9.6)
# ---------------------------------------------------------------------------

static func sequence_frame(sequence, mode: String, index: int, delay: float, key_time: float, t: float) -> int:
	var n: int = sequence.count
	if not mode in ["hold", "once", "loop", "pingpong", "onceReverse", "loopReverse", "pingpongReverse"]:
		mode = "hold"
	if mode == "hold" or delay == 0:
		return index
	var k := int(floor((t - key_time) / delay + 0.00001))
	if k < 0:
		k = 0
	if mode == "once":
		return mini(index + k, n - 1)
	if mode == "loop":
		return posmod(index + k, n)
	if mode == "pingpong":
		var p := 2 * n - 2
		if p == 0:
			return 0
		var frame := posmod(index + k, p)
		return p - frame if frame >= n else frame
	if mode == "onceReverse":
		return maxi(n - 1 - (index + k), 0)
	if mode == "loopReverse":
		return n - 1 - posmod(index + k, n)
	var p2 := 2 * n - 2
	if p2 == 0:
		return 0
	var frame2 := posmod(index + k + n - 1, p2)
	return p2 - frame2 if frame2 >= n else frame2


# ---------------------------------------------------------------------------
# Aplicar uma animação (9.10)
# ---------------------------------------------------------------------------

static func _deform_layout(skeleton, slot_name: String, _skin_name: String, attachment_name: String) -> int:
	var slot = skeleton.slot_by_name.get(slot_name)
	if slot == null:
		return 0
	var attachment = skeleton.resolve_attachment(slot_name, attachment_name)[0]
	if attachment == null:
		return 0
	var binding = attachment.get("binding")
	if binding != null:
		return 2 * binding.total()
	var count = attachment.get("vertex_count")
	return 2 * (count if count != null else 0)


static func _expand_deform(value, offset: int, length: int) -> Array:
	var out: Array = []
	out.resize(length)
	out.fill(0.0)
	if typeof(value) == TYPE_ARRAY:
		for i in range(value.size()):
			var index := offset + i
			if index >= 0 and index < length:
				out[index] = float(value[i])
	return out


# As timelines cujo `target` tem de existir no esqueleto posado (9.10).
# `drawOrder` e `tag` não têm alvo e passam direto.
const _TARGETED := {
	"bone": "bone", "slot": "slot", "deform": "slot", "weights": "slot",
	"sequence": "slot", "nested": "slot", "constraint": "constraint",
}


static func _target_exists(skeleton, timeline) -> bool:
	var kind = _TARGETED.get(timeline.type)
	if kind == null:
		return true
	var name: String = timeline.target if timeline.target != null else ""
	if kind == "bone":
		return skeleton.bone_by_name.has(name)
	if kind == "slot":
		return skeleton.slot_by_name.has(name)
	for c in skeleton.constraints:
		if c.data.name == name:
			return true
	return false


## `Pose` de 9.10, sem a volta das regras (ver `Skeleton.update_pose`).
## Com `reset = false` as timelines escrevem sobre a pose que já está lá.
static func apply_animation(skeleton, animation, t: float, reset: bool = true, body = null) -> void:
	if reset:
		skeleton.set_to_setup_pose()
	if animation == null:
		return
	skeleton.tags = animation.tags.duplicate()
	for timeline in animation.timelines:
		if timeline.type == "event" or timeline.type == "body" or timeline.property == "reset":
			continue
		if not _target_exists(skeleton, timeline):
			var turns := false
			for tl in animation.timelines:
				if tl.type == "body":
					turns = true
			var code := "BODY_UNMET" if turns else "TARGET_MISSING"
			skeleton.warn_once("%s: o corpo %s não tem %s %s; timeline ignorada" % [
				code, body if body != null else "(o arquivo)", timeline.type, C._str(timeline.target)])
			continue
		var deform: bool = timeline.type == "deform"
		if deform:
			expand_deform_keys(timeline.keys, _deform_layout(
				skeleton, timeline.target if timeline.target != null else "", timeline.skin,
				timeline.attachment if timeline.attachment != null else ""))
		var value
		if timeline.type == "weights":
			var keys := _weights_keys(skeleton, timeline)
			if keys.is_empty():
				continue
			value = evaluate_keys(keys, t, 1, true)
		else:
			value = evaluate_keys(timeline.keys, t, timeline.components, deform)
		_write(skeleton, timeline, value, t, animation)


static func _write(skeleton, timeline, value, t: float, animation) -> void:
	var kind: String = timeline.type
	if kind == "bone":
		var bone = skeleton.bone_by_name.get(timeline.target)
		if bone == null:
			return
		if timeline.property == "parent":
			apply_parent_key(skeleton, bone, value)
			return
		var field = _BONE_FIELDS.get(timeline.property if timeline.property != null else "")
		if field != null:
			bone.local.set(field, value)
		return
	if kind == "slot":
		var slot = skeleton.slot_by_name.get(timeline.target)
		if slot == null:
			return
		var prop = timeline.property
		if prop == "bone":
			_write_slot_bone(skeleton, slot, timeline, value, t)
		elif prop == "attachment":
			slot.attachment_name = value if typeof(value) == TYPE_STRING else null
		elif prop == "color" and typeof(value) == TYPE_ARRAY:
			slot.color = C._floats(value)
		elif prop == "darkColor":
			slot.dark_color = C._floats(value) if typeof(value) == TYPE_ARRAY else null
		elif prop == "visible":
			slot.visible = bool(value)
		return
	if kind == "drawOrder":
		skeleton.draw_order = draw_order_from_offsets(skeleton, value)
		return
	if kind == "deform":
		var slot_name: String = timeline.target if timeline.target != null else ""
		var attachment_name: String = timeline.attachment if timeline.attachment != null else ""
		var length := _deform_layout(skeleton, slot_name, timeline.skin, attachment_name)
		var expanded: Array
		if length > 0 and typeof(value) == TYPE_ARRAY and value.size() == length:
			# Já alargado por `expand_deform_keys`; alargar de novo deslocaria duas vezes.
			expanded = C._floats(value)
		else:
			var key = _active_key(timeline.keys, t)
			var offset: int = key.offset if key != null else 0
			expanded = _expand_deform(value, offset,
				length if length != 0 else (value.size() if typeof(value) == TYPE_ARRAY else 0))
		skeleton.deform[slot_name + "\n" + timeline.skin + "\n" + attachment_name] = expanded
		return
	if kind == "weights":
		if typeof(value) == TYPE_ARRAY:
			skeleton.weights[C._str(timeline.target if timeline.target != null else "") + "\n" + timeline.skin + "\n" + C._str(timeline.attachment if timeline.attachment != null else "")] = C._floats(value)
		return
	if kind == "sequence":
		var slot = skeleton.slot_by_name.get(timeline.target)
		if slot == null or typeof(value) != TYPE_DICTIONARY:
			return
		var attachment = skeleton.resolve_attachment(slot.name, timeline.attachment if timeline.attachment != null else "")[0]
		var sequence = attachment.get("sequence") if attachment != null else null
		if sequence == null:
			return
		var key = _active_key(timeline.keys, t)
		if key == null or t < timeline.keys[0].time:
			slot.sequence_index = sequence.setup
			return
		var mode = value.get("mode", "hold")
		var idx = value.get("index", 0)
		var delay = value.get("delay", 0)
		slot.sequence_index = sequence_frame(sequence, C._str(mode),
			int(idx) if C.is_number(idx) else 0, float(delay) if C.is_number(delay) else 0.0, key.time, t)
		return
	if kind == "constraint":
		for constraint in skeleton.constraints:
			if constraint.data.name == timeline.target:
				constraint.set_property(timeline.property if timeline.property != null else "", value)
		return
	if kind == "parameter":
		skeleton.parameters[timeline.target if timeline.target != null else ""] = value
		return
	if kind == "morph":
		skeleton.morph_weights[timeline.target if timeline.target != null else ""] = value
		return
	if kind == "variable":
		var variable = skeleton.data.find_variable(timeline.target if timeline.target != null else "")
		if variable == null:
			return
		if variable.type == "int" and C.is_number(value):
			value = int(value)
		skeleton.variables[variable.name] = value
		return
	if kind == "tag":
		var tags: Array = animation.tags.duplicate()
		if typeof(value) == TYPE_ARRAY:
			for tag in value:
				if not tags.has(tag):
					tags.append(C._str(tag))
		skeleton.tags = tags
		return
	if kind == "nested":
		var key2: String = timeline.target if timeline.target != null else ""
		if not skeleton.nested_state.has(key2):
			skeleton.nested_state[key2] = {}
		skeleton.nested_state[key2][timeline.property if timeline.property != null else ""] = value


## 9.5: o desenho troca de osso. `null` = o osso do arquivo; o `transform` da
## chave põe o anexo no osso novo; nada se converte.
static func _write_slot_bone(skeleton, slot, timeline, value, t: float) -> void:
	if value == null:
		slot.bone = slot.setup_bone
		slot.bone_transform = null
		return
	var bone = skeleton.bone_by_name.get(C._str(value))
	if bone == null:
		skeleton.warn_once("SLOT_BONE_UNMET: o slot \"%s\" pede o osso \"%s\", que este corpo não tem; vale o osso de antes (9.5)" % [slot.name, C._str(value)])
		return
	var key = _active_key(timeline.keys, t)
	if key == null:
		key = timeline.keys[0]
	slot.bone = bone
	slot.bone_transform = key.transform


## 9.6: chave de `weights` cujo tamanho não é a soma de `counts` é ignorada.
static func _weights_keys(skeleton, timeline) -> Array:
	var attachment = skeleton.resolve_attachment(
		timeline.target if timeline.target != null else "",
		timeline.attachment if timeline.attachment != null else "")[0]
	var source = attachment
	if attachment is C.MeshAttachment and attachment.deform_source != null:
		source = attachment.deform_source
	var binding = source.get("binding") if source != null else null
	if binding == null:
		skeleton.warn_once("ORDER_TIMELINE_TARGET: weights em %s/%s sem binding; timeline ignorada (9.6)" % [
			C._str(timeline.target), C._str(timeline.attachment)])
		return []
	var total: int = binding.total()
	var keys: Array = []
	for k in timeline.keys:
		if typeof(k.value) == TYPE_ARRAY and k.value.size() == total:
			keys.append(k)
	if keys.size() != timeline.keys.size():
		skeleton.warn_once("RANGE_WEIGHTS_SIZE: chave de weights em %s/%s com tamanho diferente de %d; chave ignorada (9.6)" % [
			C._str(timeline.target), C._str(timeline.attachment), total])
	return keys


static func _active_key(keys: Array, t: float):
	var active = null
	for key in keys:
		if key.time <= t:
			active = key
		else:
			break
	return active


# ---------------------------------------------------------------------------
# Eventos (8.6)
# ---------------------------------------------------------------------------

## Os eventos com tempo em (previous, now]. Com `loop`, a chave em `k` dispara
## em k, k + D, k + 2D... Entregues por ordem de tempo; empate mantém a ordem
## das chaves. Cada um: {"time", "event", "int", "float", "string", "volume", "balance"}.
static func fire_events(skeleton, animation, previous: float, now: float, loop: bool) -> Array:
	var fired: Array = []
	var duration: float = animation.duration
	var order := 0
	for timeline in animation.timelines:
		if timeline.type != "event":
			continue
		for key in timeline.keys:
			order += 1
			var definition = skeleton.data.find_event(key.event if key.event != null else "")
			var payload := {
				"int": definition.int_value if definition != null else 0,
				"float": definition.float_value if definition != null else 0.0,
				"string": definition.string_value if definition != null else "",
				"volume": definition.volume if definition != null else 1.0,
				"balance": definition.balance if definition != null else 0.0,
			}
			for k in key.payload:
				payload[k] = key.payload[k]
			if not loop or duration == 0:
				if previous < key.time and key.time <= now:
					fired.append([key.time, order, _event(key.time, key.event, payload)])
				continue
			var n := 0
			while true:
				var time: float = key.time + n * duration
				if time > now:
					break
				if previous < time:
					fired.append([time, order, _event(time, key.event, payload)])
				n += 1
				if n > 100000:
					break
	# Ordem por (tempo, ordem da chave); estável pela própria chave dupla.
	fired.sort_custom(func(x, y): return x[0] < y[0] or (x[0] == y[0] and x[1] < y[1]))
	var out: Array = []
	for f in fired:
		out.append(f[2])
	return out


static func _event(time: float, name, payload: Dictionary) -> Dictionary:
	var e := {"time": time, "event": name}
	for k in payload:
		e[k] = payload[k]
	return e


## Timeline `reset` de 9.8: cruzar uma chave chama `physicsReset` (6.5).
static func fire_physics_resets(skeleton, animation, previous: float, now: float, loop: bool) -> int:
	var fired := 0
	var duration: float = animation.duration
	for timeline in animation.timelines:
		if timeline.type != "constraint" or timeline.property != "reset":
			continue
		var constraints: Array = []
		for c in skeleton.constraints:
			if c.data.name == timeline.target:
				constraints.append(c)
		if constraints.is_empty():
			continue
		for key in timeline.keys:
			var crossed := false
			if not loop or duration == 0:
				crossed = previous < key.time and key.time <= now
			else:
				var n := 0
				while true:
					var time: float = key.time + n * duration
					if time > now:
						break
					if previous < time:
						crossed = true
						break
					n += 1
					if n > 100000:
						break
			if crossed:
				for constraint in constraints:
					if constraint.has_method("physics_reset"):
						constraint.physics_reset(now)
						fired += 1
	return fired


static func active_tags(animation, t: float) -> Array:
	var tags: Array = animation.tags.duplicate()
	for timeline in animation.timelines:
		if timeline.type != "tag":
			continue
		var value = evaluate_keys(timeline.keys, t)
		if typeof(value) == TYPE_ARRAY and t >= timeline.keys[0].time:
			for tag in value:
				if not tags.has(tag):
					tags.append(C._str(tag))
	return tags


# ---------------------------------------------------------------------------
# Parâmetros e drivers (8.1, 8.2)
# ---------------------------------------------------------------------------

static func _wrap(value: float, low: float, high: float) -> float:
	var span := high - low
	if span <= 0:
		return low
	return low + fposmod(fposmod(value - low, span) + span, span)


static func parameter_value(skeleton, parameter) -> float:
	var value: float
	if parameter.source != null:
		var bone = skeleton.bone_by_name.get(parameter.source.bone)
		if bone == null:
			return parameter.default
		var field = _BONE_FIELDS.get(parameter.source.property)
		if field == null:
			return parameter.default
		var raw := float(bone.applied.get(field))
		var span: float = parameter.source.to_value - parameter.source.from_value
		if span == 0:
			return parameter.default
		value = parameter.min + (raw - parameter.source.from_value) / span * (parameter.max - parameter.min)
	else:
		value = float(skeleton.parameters.get(parameter.name, parameter.default))
	if parameter.repeat:
		return _wrap(value, parameter.min, parameter.max)
	return M.clamp_f(value, parameter.min, parameter.max)


## O campo de `BoneData` que guarda a pose de repouso (os mesmos nomes da Pose).
static func _setup_of(skeleton, target):
	var kind: String = target.type
	if kind == "bone":
		var bone = skeleton.bone_by_name.get(target.target if target.target != null else "")
		var field = _BONE_FIELDS.get(target.property if target.property != null else "")
		if bone == null or field == null:
			return 0.0
		var v = bone.data.get(field)
		return v if v != null else 0.0
	if kind == "morph":
		var morph = skeleton.data.find_morph(target.target if target.target != null else "")
		return morph.weight if morph != null else 0.0
	if kind == "parameter":
		var parameter = skeleton.data.find_parameter(target.target if target.target != null else "")
		return parameter.default if parameter != null else 0.0
	if kind == "constraint":
		var constraint = skeleton.data.find_constraint(target.target if target.target != null else "")
		return constraint.mix if constraint != null else 0.0
	return 0.0


static func apply_driver_target(skeleton, target, value, mode: String, mix: float) -> void:
	if not _interpolable(value):
		if mix < 0.5:
			return
		_write_driver(skeleton, target, value)
		return
	var current = _read_driver(skeleton, target)
	var new_value
	if typeof(value) == TYPE_ARRAY:
		if typeof(current) != TYPE_ARRAY or current.size() != value.size():
			current = []
			current.resize(value.size())
			current.fill(0.0)
		var out: Array = []
		for i in range(value.size()):
			var c: float = current[i]
			var v: float = value[i]
			if mode == "replace":
				out.append(c + (v - c) * mix)
			else:
				out.append(c + v * mix)
		new_value = out
	else:
		var cur: float = float(current) if C.is_number(current) else 0.0
		if mode == "replace":
			new_value = cur + (float(value) - cur) * mix
		else:
			new_value = cur + (float(value) - float(_setup_of(skeleton, target))) * mix
	_write_driver(skeleton, target, new_value)


static func _read_driver(skeleton, target):
	var kind: String = target.type
	var name: String = target.target if target.target != null else ""
	if kind == "bone":
		var bone = skeleton.bone_by_name.get(name)
		var field = _BONE_FIELDS.get(target.property if target.property != null else "")
		if bone == null or field == null:
			return 0.0
		return bone.applied.get(field)
	if kind == "slot":
		var slot = skeleton.slot_by_name.get(name)
		if slot == null:
			return 0.0
		if target.property == "color":
			return slot.color
		if target.property == "darkColor":
			return slot.dark_color
		if target.property == "visible":
			return slot.visible
		return slot.attachment_name
	if kind == "constraint":
		for constraint in skeleton.constraints:
			if constraint.data.name == target.target:
				return constraint.values.get(target.property if target.property != null else "", 0.0)
		return 0.0
	if kind == "parameter":
		var parameter = skeleton.data.find_parameter(name)
		if parameter == null:
			return 0.0
		return skeleton.parameters.get(parameter.name, parameter.default)
	if kind == "morph":
		return skeleton.morph_weights.get(name, 0.0)
	if kind == "variable":
		return skeleton.variables.get(name, 0.0)
	if kind == "deform":
		return skeleton.deform.get(name + "\n" + target.skin + "\n" + C._str(target.attachment if target.attachment != null else ""))
	return 0.0


static func _write_driver(skeleton, target, value) -> void:
	var kind: String = target.type
	var name: String = target.target if target.target != null else ""
	if kind == "bone":
		var bone = skeleton.bone_by_name.get(name)
		if bone == null:
			return
		if target.property == "parent":
			apply_parent_key(skeleton, bone, value)
			bone.update_world()
			_update_descendants(bone)
			return
		var field = _BONE_FIELDS.get(target.property if target.property != null else "")
		if field != null:
			bone.applied.set(field, value)
			bone.update_world()
			_update_descendants(bone)
		return
	if kind == "slot":
		var slot = skeleton.slot_by_name.get(name)
		if slot == null:
			return
		if target.property == "color" and typeof(value) == TYPE_ARRAY:
			slot.color = C._floats(value)
		elif target.property == "darkColor":
			slot.dark_color = C._floats(value) if typeof(value) == TYPE_ARRAY else null
		elif target.property == "visible":
			slot.visible = bool(value)
		elif target.property == "attachment":
			slot.attachment_name = value if typeof(value) == TYPE_STRING else null
		return
	if kind == "drawOrder":
		skeleton.draw_order = draw_order_from_offsets(skeleton, value)
		return
	if kind == "constraint":
		for constraint in skeleton.constraints:
			if constraint.data.name == target.target:
				constraint.set_property(target.property if target.property != null else "", value)
		return
	if kind == "parameter":
		skeleton.parameters[name] = value
		return
	if kind == "morph":
		skeleton.morph_weights[name] = value
		return
	if kind == "variable":
		var variable = skeleton.data.find_variable(name)
		if variable == null:
			return
		if variable.type == "int" and C.is_number(value):
			value = int(value)
		skeleton.variables[variable.name] = value
		return
	if kind == "deform":
		var attachment_name: String = C._str(target.attachment if target.attachment != null else "")
		var length := _deform_layout(skeleton, name, target.skin, attachment_name)
		skeleton.deform[name + "\n" + target.skin + "\n" + attachment_name] = _expand_deform(
			value, 0, length if length != 0 else (value.size() if typeof(value) == TYPE_ARRAY else 0))
		return
	if kind == "nested":
		if not skeleton.nested_state.has(name):
			skeleton.nested_state[name] = {}
		skeleton.nested_state[name][target.property if target.property != null else ""] = value


static func _update_descendants(bone) -> void:
	for child in bone.children:
		child.update_world()
		_update_descendants(child)

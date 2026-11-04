# SPDX-License-Identifier: Apache-2.0
# Copiado de runtime-python/recorte/skeleton.py (rodada G1, 05/10/2026).
# As funções soltas do topo do skeleton.py estão em `mat.gd`.
#
# A pose de repouso, a matriz de mundo e a geometria dos anexos. Seções 3, 5 e
# 7 da especificação. Cada osso tem três estados: local (escrito pela pose de
# repouso e pelas animações), aplicado (cópia do local no começo de cada
# quadro; as regras escrevem nele) e mundo (sempre calculado do aplicado).
#
# As regras (seção 6) vieram na rodada G6: moram em `regras.gd`, e o
# `update_pose` as roda na ordem do arquivo.
#
# Diferenças que o GDScript obriga:
#   - a chave de tupla do Python (slot, skin, anexo) vira um texto só,
#     separado por "\n", e volta a três partes em `_by_address`;
#   - `id(objeto)` vira o próprio objeto como chave de dicionário;
#   - o par (x, y) do Python vira Array [x, y] de float (64 bits; o Vector2
#     do Godot é de 32 e mudaria a conta).
@tool
extends RefCounted

const C := preload("carregador.gd")
const M := preload("mat.gd")
const R := preload("regras.gd")


class Pose:
	var x := 0.0
	var y := 0.0
	var rotation := 0.0
	var scale_x := 1.0
	var scale_y := 1.0
	var shear_x := 0.0
	var shear_y := 0.0
	var inherit_rotation := true
	var inherit_scale := true
	var inherit_reflection := true

	func copy_from(other: Pose) -> void:
		x = other.x
		y = other.y
		rotation = other.rotation
		scale_x = other.scale_x
		scale_y = other.scale_y
		shear_x = other.shear_x
		shear_y = other.shear_y
		inherit_rotation = other.inherit_rotation
		inherit_scale = other.inherit_scale
		inherit_reflection = other.inherit_reflection


## Uma matriz de mundo solta: o que o slot dá quando a chave `slot/bone` traz
## um `transform` (9.5).
class Frame:
	var a := 1.0
	var b := 0.0
	var c := 0.0
	var d := 1.0
	var world_x := 0.0
	var world_y := 0.0

	static func make(a_: float, b_: float, c_: float, d_: float, wx: float, wy: float) -> Frame:
		var f := Frame.new()
		f.a = a_
		f.b = b_
		f.c = c_
		f.d = d_
		f.world_x = wx
		f.world_y = wy
		return f

	static func of(bone) -> Frame:
		return Frame.make(bone.a, bone.b, bone.c, bone.d, bone.world_x, bone.world_y)

	func local_to_world(lx: float, ly: float) -> Array:
		return [a * lx + b * ly + world_x, c * lx + d * ly + world_y]

	## self x T(x, y) . R(rotation) . S(scaleX, scaleY): T primeiro, depois R
	## (9.5, a ordem que o caso C-295 prende).
	func times_trs(x: float, y: float, rotation: float, scale_x: float, scale_y: float) -> Frame:
		var co := M.cosd(rotation)
		var si := M.sind(rotation)
		var la := co * scale_x
		var lb := -si * scale_y
		var lc := si * scale_x
		var ld := co * scale_y
		var w := local_to_world(x, y)
		return Frame.make(a * la + b * lc, a * lb + b * ld, c * la + d * lc, c * lb + d * ld, w[0], w[1])


## Um osso: pose local, pose aplicada e matriz de mundo.
class Bone:
	var data
	var name := ""
	var skeleton
	var parent = null
	# O pai escrito no arquivo (5.1); uma chave `parent` (9.4) move `parent`.
	var setup_parent = null
	var children: Array = []
	var local := Pose.new()
	var applied := Pose.new()
	var a := 1.0
	var b := 0.0
	var c := 0.0
	var d := 1.0
	var world_x := 0.0
	var world_y := 0.0
	# Sujeira de 5.6: um osso cujo mundo uma regra já escreveu NÃO é refeito
	# do aplicado, e os descendentes dele são.
	var dirty := true

	func _init(data_, skeleton_, parent_) -> void:
		data = data_
		name = data_.name
		skeleton = skeleton_
		parent = parent_
		setup_parent = parent_
		if parent_ != null:
			parent_.children.append(self)

	func length() -> float:
		return data.length

	## Chave `parent` (9.4). Recusa o ciclo (o pai novo é o próprio osso ou um
	## descendente) e devolve false; quem chama avisa uma vez (L2 PARENT_CYCLE).
	## Nada se converte: daí em diante o local se mede do pai novo, como no Spriter.
	func set_parent(new_parent) -> bool:
		if new_parent == parent:
			return true
		var p = new_parent
		while p != null:
			if p == self:
				return false
			p = p.parent
		if parent != null and parent.children.has(self):
			parent.children.erase(self)
		parent = new_parent
		if new_parent != null:
			new_parent.children.append(self)
		dirty = true
		skeleton.order_dirty = true
		return true

	func set_to_setup_pose() -> void:
		if parent != setup_parent:
			set_parent(setup_parent)
		var pose := local
		pose.x = data.x
		pose.y = data.y
		pose.rotation = data.rotation
		pose.scale_x = data.scale_x
		pose.scale_y = data.scale_y
		pose.shear_x = data.shear_x
		pose.shear_y = data.shear_y
		pose.inherit_rotation = data.inherit_rotation
		pose.inherit_scale = data.inherit_scale
		pose.inherit_reflection = data.inherit_reflection

	func mode() -> String:
		if parent == null and skeleton.parent_frame != null:
			# 7.11: a raiz de um esqueleto aninhado se calcula como `normal`.
			return M.MODE_NORMAL
		return M.mode_of(applied.inherit_rotation, applied.inherit_scale, applied.inherit_reflection)

	# -- seção 5.4 --------------------------------------------------------

	## A matriz deste osso vale; a dos filhos não.
	func mark_clean() -> void:
		dirty = false
		for child in children:
			child.dirty = true

	func update_world() -> void:
		mark_clean()
		var pose := applied
		var sx: float = skeleton.scale_x
		var sy: float = skeleton.scale_y

		var rot_y := pose.rotation + 90 + pose.shear_y
		var la := M.cosd(pose.rotation + pose.shear_x) * pose.scale_x
		var lb := M.cosd(rot_y) * pose.scale_y
		var lc := M.sind(pose.rotation + pose.shear_x) * pose.scale_x
		var ld := M.sind(rot_y) * pose.scale_y

		var par = parent if parent != null else skeleton.parent_frame
		if par == null:
			world_x = pose.x * sx + skeleton.x
			world_y = pose.y * sy + skeleton.y
			a = la * sx
			b = lb * sx
			c = lc * sy
			d = ld * sy
			return

		var pa: float = par.a
		var pb: float = par.b
		var pc: float = par.c
		var pd: float = par.d
		world_x = pa * pose.x + pb * pose.y + par.world_x
		world_y = pc * pose.x + pd * pose.y + par.world_y

		var m := mode()
		# F3: o reflexo da corrente, sem o espelho do esqueleto inteiro (o mesmo
		# teste que o noScale faz).
		var flip: bool = (pa * pd - pb * pc < 0) != ((sx < 0) != (sy < 0))
		if m == M.MODE_NORMAL or m == M.MODE_NO_REFLECTION:
			if m == M.MODE_NO_REFLECTION and flip:
				pb = -pb
				pd = -pd
			a = pa * la + pb * lc
			b = pa * lb + pb * ld
			c = pc * la + pd * lc
			d = pc * lb + pd * ld
			return

		if m == M.MODE_ONLY_TRANSLATION or m == M.MODE_ONLY_REFLECTION:
			if m == M.MODE_ONLY_REFLECTION and flip:
				lb = -lb
				ld = -ld
			a = la
			b = lb
			c = lc
			d = ld
		elif m == M.MODE_NO_ROTATION_OR_REFLECTION or m == M.MODE_NO_ROTATION:
			var s := pa * pa + pc * pc
			var prx: float
			if s > 0.0001:
				s = absf(pa * pd - pb * pc) / s
				if m == M.MODE_NO_ROTATION and flip:
					s = -s
				pa = pa / sx
				pc = pc / sy
				pb = pc * s
				pd = pa * s
				prx = M.atan2d(pc, pa)
			else:
				pa = 0.0
				pc = 0.0
				prx = 90 - M.atan2d(pd, pb)
			var rx := pose.rotation + pose.shear_x - prx
			var ry := pose.rotation + pose.shear_y - prx + 90
			la = M.cosd(rx) * pose.scale_x
			lb = M.cosd(ry) * pose.scale_y
			lc = M.sind(rx) * pose.scale_x
			ld = M.sind(ry) * pose.scale_y
			a = pa * la - pb * lc
			b = pa * lb - pb * ld
			c = pc * la + pd * lc
			d = pc * lb + pd * ld
		else:  # noScale e noScaleOrReflection
			var co := M.cosd(pose.rotation)
			var si := M.sind(pose.rotation)
			var za := (pa * co + pb * si) / sx
			var zc := (pc * co + pd * si) / sy
			var s := sqrt(za * za + zc * zc)
			if s > 0.00001:
				s = 1 / s
			za *= s
			zc *= s
			s = sqrt(za * za + zc * zc)
			if m == M.MODE_NO_SCALE and ((pa * pd - pb * pc < 0) != ((sx < 0) != (sy < 0))):
				s = -s
			var r := M.atan2r(zc, za) + PI / 2
			var zb := cos(r) * s
			var zd := sin(r) * s
			la = M.cosd(pose.shear_x) * pose.scale_x
			lb = M.cosd(90 + pose.shear_y) * pose.scale_y
			lc = M.sind(pose.shear_x) * pose.scale_x
			ld = M.sind(90 + pose.shear_y) * pose.scale_y
			a = za * la + zb * lc
			b = za * lb + zb * ld
			c = zc * la + zd * lc
			d = zc * lb + zd * ld

		a *= sx
		b *= sx
		c *= sy
		d *= sy

	# -- seção 5.5 --------------------------------------------------------

	func world_to_local(wx: float, wy: float) -> Array:
		var det := a * d - b * c
		if absf(det) <= 0.0001:
			return [0.0, 0.0]
		var x := wx - world_x
		var y := wy - world_y
		return [(x * d - y * b) / det, (y * a - x * c) / det]

	func local_to_world(lx: float, ly: float) -> Array:
		return [a * lx + b * ly + world_x, c * lx + d * ly + world_y]

	func applied_from_world() -> void:
		mark_clean()
		var pose := applied
		var par = parent if parent != null else skeleton.parent_frame
		var sx: float = skeleton.scale_x
		var sy: float = skeleton.scale_y

		if par == null:
			pose.x = M.safe((world_x - skeleton.x) / sx)
			pose.y = M.safe((world_y - skeleton.y) / sy)
			pose.rotation = M.atan2d(c, a)
			pose.scale_x = sqrt(a * a + c * c)
			pose.scale_y = sqrt(b * b + d * d)
			pose.shear_x = 0.0
			# O sinal aqui é o oposto do ramo com pai. Está assim em 5.5 de
			# propósito, com uma decisão aberta anotada.
			pose.shear_y = M.atan2d(a * b + c * d, a * d - b * c)
			return

		var pa: float = par.a
		var pb: float = par.b
		var pc: float = par.c
		var pd: float = par.d
		var det := pa * pd - pb * pc
		var pid := 0.0 if absf(det) <= 0.0001 else 1 / det
		var ia := pd * pid
		var ib := pb * pid
		var ic := pc * pid
		var idd := pa * pid
		var dx: float = world_x - par.world_x
		var dy: float = world_y - par.world_y
		pose.x = M.safe(dx * ia - dy * ib)
		pose.y = M.safe(dy * idd - dx * ic)

		var m := mode()
		var flip: bool = (pa * pd - pb * pc < 0) != ((sx < 0) != (sy < 0))
		var ra: float
		var rb: float
		var rc: float
		var rd: float
		if m == M.MODE_ONLY_TRANSLATION or m == M.MODE_ONLY_REFLECTION:
			ra = a
			rb = b
			rc = c
			rd = d
			if m == M.MODE_ONLY_REFLECTION and flip:
				rb = -rb
				rd = -rd
		else:
			if m == M.MODE_NO_REFLECTION:
				if flip:
					pb = -pb
					pd = -pd
					det = pa * pd - pb * pc
					pid = 0.0 if absf(det) <= 0.0001 else 1 / det
					ia = pd * pid
					ib = pb * pid
					ic = pc * pid
					idd = pa * pid
			elif m == M.MODE_NO_ROTATION_OR_REFLECTION or m == M.MODE_NO_ROTATION:
				var denominator := pa * pa + pc * pc
				var s := 0.0 if denominator <= 0.0001 else absf(pa * pd - pb * pc) / denominator
				if m == M.MODE_NO_ROTATION and flip:
					s = -s
				var sa := pa / sx
				var sc := pc / sy
				pb = -sc * s * sx
				pd = sa * s * sy
				det = pa * pd - pb * pc
				pid = 0.0 if det == 0 else 1 / det
				ia = pd * pid
				ib = pb * pid
			elif m == M.MODE_NO_SCALE or m == M.MODE_NO_SCALE_OR_REFLECTION:
				var co := M.cosd(pose.rotation)
				var si := M.sind(pose.rotation)
				pa = (pa * co + pb * si) / sx
				pc = (pc * co + pd * si) / sy
				var s := sqrt(pa * pa + pc * pc)
				if s > 0.00001:
					s = 1 / s
				pa *= s
				pc *= s
				s = sqrt(pa * pa + pc * pc)
				if m == M.MODE_NO_SCALE and ((pid < 0) != ((sx < 0) != (sy < 0))):
					s = -s
				var r := PI / 2 + M.atan2r(pc, pa)
				pb = cos(r) * s
				pd = sin(r) * s
				det = pa * pd - pb * pc
				pid = 0.0 if det == 0 else 1 / det
				ia = pd * pid
				ib = pb * pid
				ic = pc * pid
				idd = pa * pid
			ra = ia * a - ib * c
			rb = ia * b - ib * d
			rc = idd * c - ic * a
			rd = idd * d - ic * b

		pose.shear_x = 0.0
		pose.scale_x = sqrt(ra * ra + rc * rc)
		if pose.scale_x > 0.0001:
			var det2 := ra * rd - rb * rc
			pose.scale_y = M.safe(det2 / pose.scale_x)
			pose.shear_y = -M.atan2d(ra * rb + rc * rd, det2)
			pose.rotation = M.atan2d(rc, ra)
		else:
			pose.scale_x = 0.0
			pose.scale_y = sqrt(rb * rb + rd * rd)
			pose.shear_y = 0.0
			pose.rotation = 90 - M.atan2d(rd, rb)


## Um slot: o que mostra, em que cor, e o quadro da sequência.
class Slot:
	var data
	var name := ""
	var index := 0
	var bone
	var attachment_name = null
	var color: Array = []
	var dark_color = null
	var blend := "normal"
	var visible := true
	var sequence_index = null
	var sequence_key = null
	var sequence_time := 0.0
	# 9.5: o osso do arquivo, e o `transform` da chave `slot/bone` ativa, ou null.
	var setup_bone
	var bone_transform = null

	func _init(data_, bone_) -> void:
		data = data_
		name = data_.name
		index = data_.index
		bone = bone_
		setup_bone = bone_
		set_to_setup_pose()

	## A matriz de onde se mede um anexo sem pesos deste slot: o osso aplicado,
	## vezes o `transform` da chave (9.5).
	func frame():
		if bone_transform == null:
			return bone
		var t: Array = bone_transform
		return Frame.of(bone).times_trs(t[0], t[1], t[2], t[3], t[4])

	func set_to_setup_pose() -> void:
		bone = setup_bone
		bone_transform = null
		attachment_name = data.attachment
		color = data.color.duplicate()
		dark_color = data.dark_color.duplicate() if data.dark_color != null else null
		blend = data.blend
		visible = data.visible
		sequence_index = null
		sequence_key = null
		sequence_time = 0.0


## Uma instância posável de um SkeletonData.
class Skeleton:
	var data
	var scale_x := 1.0
	var scale_y := 1.0
	var x := 0.0
	var y := 0.0
	var time := 0.0
	# 7.11: só no esqueleto aninhado (rodada G5).
	var parent_frame = null

	var bones: Array = []
	var order_dirty := false
	var warnings: Array = []
	var bone_by_name := {}
	var update_order: Array = []
	var slots: Array = []
	var slot_by_name := {}

	# 4.4: o esqueleto nasce com a pilha ["default"]; nada é implícito.
	var skin_names: Array = ["default"]
	var _attachment_cache := {}
	# Ordem base de 4.4: a do array, mais o `drawOrder` das skins ativas.
	var base_draw_order: Array = []
	var draw_order: Array = []

	# Estado animado que não mora em osso nem slot.
	var deform := {}
	var weights := {}
	var morph_weights := {}
	var parameters := {}
	var variables := {}
	var tags: Array = []
	var constraint_values := {}
	var nested_state := {}
	var nested_pool := {}
	# As regras (seção 6), na ordem do arquivo. Rodada G6.
	var constraints: Array = []
	# Só do desenho das partículas (G7; não está no Python, que não desenha; é o
	# `playingAnimation`/`playingTime` do esqueleto do runtime TypeScript): o
	# que toca, o tempo da ANIMAÇÃO (com a volta do laço já tirada), se é em
	# laço, e quem dá a pose no instante de um nascimento (`Callable` ou null).
	# Quem posa (o nó Recorte) escreve; o desenhador só lê.
	var playing_animation = null
	var playing_time := 0.0
	var playing_loop := false
	var pose_em = null

	func _init(data_) -> void:
		data = data_
		var by_data := {}
		for bone_data in data.bones:
			var par = by_data.get(bone_data.parent) if bone_data.parent != null else null
			var bone := Bone.new(bone_data, self, par)
			by_data[bone_data] = bone
			bones.append(bone)
		for bone in bones:
			bone_by_name[bone.name] = bone
		update_order = bones.duplicate()
		for slot_data in data.slots:
			var bone = bone_by_name.get(slot_data.bone.name if slot_data.bone != null else "")
			slots.append(Slot.new(slot_data, bone if bone != null else bones[0]))
		for slot in slots:
			slot_by_name[slot.name] = slot
		base_draw_order = range(slots.size())
		draw_order = base_draw_order.duplicate()
		constraints = R.build_constraints(self)
		set_to_setup_pose()

	## Corta os laços osso ↔ esqueleto e pai ↔ filho. Não está no Python (lá o
	## coletor de lixo acha os ciclos); no GDScript a contagem de referências
	## não acha, e o esqueleto ficaria na memória para sempre. Chame quando o
	## esqueleto não for mais usado.
	func liberar() -> void:
		for bone in bones:
			bone.skeleton = null
			bone.parent = null
			bone.setup_parent = null
			bone.children.clear()
		for slot in slots:
			slot.bone = null
			slot.setup_bone = null
		# As regras também guardam o esqueleto e os ossos (G6).
		for constraint in constraints:
			constraint.liberar()
		constraints.clear()
		pose_em = null
		bones.clear()
		update_order.clear()
		bone_by_name.clear()
		slots.clear()
		slot_by_name.clear()

	# -- pose de repouso (5.1) --------------------------------------------

	func set_skins(names: Array) -> void:
		skin_names = names.duplicate()
		_attachment_cache.clear()
		_rebuild_base_draw_order()
		draw_order = base_draw_order.duplicate()

	## 4.4: a ordem do array, depois o `drawOrder` de cada skin ativa na ordem
	## de resolução (`default`, includes, a skin), cada um sobre a anterior.
	func _rebuild_base_draw_order() -> void:
		var order: Array = range(slots.size())
		for skin_name in _skin_chain():
			var skin = data.find_skin(skin_name)
			if skin == null or skin.draw_order.is_empty():
				continue
			var entries: Array = []
			for e in skin.draw_order:
				if slot_by_name.has(e[0]):
					entries.append([slot_by_name[e[0]].index, e[1]])
			order = M.order_from_offsets(order, entries)
		base_draw_order = order

	func set_to_setup_pose() -> void:
		for bone in bones:
			bone.set_to_setup_pose()
		for slot in slots:
			slot.set_to_setup_pose()
		draw_order = base_draw_order.duplicate()
		deform = {}
		weights = {}
		morph_weights = {}
		for m in data.morphs:
			morph_weights[m.name] = m.weight
		parameters = {}
		for p in data.parameters:
			parameters[p.name] = p.default
		variables = {}
		for v in data.variables:
			variables[v.name] = v.default
		tags = data.tags.duplicate()
		constraint_values = {}
		for constraint in constraints:
			constraint.set_to_setup_pose()
		nested_state = {}

	# -- qual anexo (4.4) -------------------------------------------------

	## 4.4: cada skin da pilha, de baixo para cima, com os includes antes dela.
	## Sem `default` a não ser que a pilha o cite.
	func skin_chain() -> Array:
		return _skin_chain()

	func _skin_chain() -> Array:
		var chain: Array = []
		var seen := {}
		for n in skin_names:
			_expand(n, chain, seen)
		return chain

	func _expand(n: String, chain: Array, seen: Dictionary) -> void:
		if seen.has(n):
			return
		seen[n] = true
		var skin = data.find_skin(n)
		if skin == null:
			return
		for included in skin.includes:
			_expand(included, chain, seen)
		chain.append(n)

	## Devolve [anexo ou null, nome da skin].
	func resolve_attachment(slot_name: String, placeholder: String) -> Array:
		var k := slot_name + "\n" + placeholder
		if _attachment_cache.has(k):
			return _attachment_cache[k]
		var result: Array = [null, "default"]
		var chain := _skin_chain()
		for i in range(chain.size() - 1, -1, -1):
			var skin = data.find_skin(chain[i])
			if skin == null:
				continue
			var bucket = skin.attachments.get(slot_name)
			if bucket != null and bucket.has(placeholder):
				result = [bucket[placeholder], chain[i]]
				break
		_attachment_cache[k] = result
		return result

	func attachment_for(slot) -> Array:
		if slot.attachment_name == null:
			return [null, "default"]
		return resolve_attachment(slot.name, slot.attachment_name)

	## O conjunto do Python vira dicionário de nome → true.
	func active_skin_bones() -> Dictionary:
		var names := {}
		for skin_name in _skin_chain():
			var skin = data.find_skin(skin_name)
			if skin != null:
				for n in skin.bones:
					names[n] = true
		return names

	func active_skin_constraints() -> Dictionary:
		var names := {}
		for skin_name in _skin_chain():
			var skin = data.find_skin(skin_name)
			if skin != null:
				for n in skin.constraints:
					names[n] = true
		return names

	# -- o quadro (5.6) ---------------------------------------------------

	## 12.2, item 9: um aviso do runtime, uma vez.
	func warn_once(message: String) -> void:
		if not warnings.has(message):
			warnings.append(message)

	## 5.6: pais antes dos filhos, a ordem do arquivo entre irmãos, andando
	## das raízes pelas listas de filhos de AGORA.
	func _rebuild_update_order() -> void:
		var out: Array = []
		for bone in bones:
			if bone.parent == null:
				_visit(bone, out)
		if out.size() != bones.size():
			for bone in bones:
				if not out.has(bone):
					out.append(bone)
		update_order = out
		order_dirty = false

	func _visit(bone, out: Array) -> void:
		out.append(bone)
		for child in bone.children:
			_visit(child, out)

	func update_world_transforms() -> void:
		if order_dirty:
			_rebuild_update_order()
		for bone in update_order:
			if bone.dirty:
				bone.update_world()

	func update_pose(now: float) -> void:
		if order_dirty:
			_rebuild_update_order()
		for bone in update_order:
			bone.applied.copy_from(bone.local)
			bone.dirty = true
		var active := active_skin_constraints()
		for constraint in constraints:
			if constraint.data.skin_required and not active.has(constraint.data.name):
				continue
			if constraint.mix() == 0:
				continue
			update_world_transforms()
			constraint.apply(now)
		update_world_transforms()

	# -- deform e morph (7.4, 8.3) ----------------------------------------

	func morph_sum(slot_name: String, _skin_name: String, attachment_name: String, length: int):
		var total = null
		for morph in data.morphs:
			var weight := M.clamp_f(morph_weights.get(morph.name, morph.weight), morph.min, morph.max)
			if weight == 0:
				continue
			for target in morph.targets:
				if target.slot != slot_name or target.attachment != attachment_name:
					continue
				if total == null:
					total = []
					total.resize(length)
					total.fill(0.0)
				for i in range(mini(length, target.offsets.size())):
					total[i] += weight * target.offsets[i]
		return total

	func deform_for(slot_name: String, skin_name: String, attachment_name: String):
		return _by_address(deform, slot_name, skin_name, attachment_name)

	## 9.6: o mesmo endereço de três partes, e a mesma busca, do `deform`.
	func weights_for(slot_name: String, skin_name: String, attachment_name: String):
		return _by_address(weights, slot_name, skin_name, attachment_name)

	func _by_address(table: Dictionary, slot_name: String, skin_name: String, attachment_name: String):
		var found = table.get(slot_name + "\n" + skin_name + "\n" + attachment_name)
		if found == null and skin_name != "default":
			found = table.get(slot_name + "\n" + "default" + "\n" + attachment_name)
		if found == null:
			# A timeline pode citar uma skin de onde o anexo não veio: vale a
			# primeira na ordem do array `skins` (9.6).
			var order := {}
			for i in range(data.skins.size()):
				order[data.skins[i].name] = i
			var best = null
			var best_rank := 1 << 30
			for k in table:
				var parts: PackedStringArray = k.split("\n")
				if parts[0] == slot_name and parts[2] == attachment_name:
					var rank: int = order.get(parts[1], order.size())
					if rank < best_rank:
						best_rank = rank
						best = table[k]
			return best
		return found

	## Seção 7.4, mais os quatro cantos de uma região (7.3).
	func world_vertices(slot, attachment, skin_name: String = "default") -> Array:
		if attachment is C.RegionAttachment:
			return _region_vertices(slot, attachment)
		var vertices = attachment.get("vertices")
		var binding = attachment.get("binding")
		var count = attachment.get("vertex_count")
		if count == null or count == 0:
			return []
		var source = attachment
		if attachment is C.MeshAttachment and attachment.deform_source != null:
			source = attachment.deform_source
		var layout: int = 2 * binding.total() if binding != null else 2 * count
		var def = deform_for(slot.name, skin_name, source.name)
		var frame_weights = weights_for(slot.name, skin_name, source.name) if binding != null else null
		var morph = morph_sum(slot.name, skin_name, source.name, layout)

		var out: Array = []
		if binding == null:
			var bone = slot.frame()
			for v in range(count):
				var lx: float = vertices[2 * v] + _delta(def, morph, 2 * v)
				var ly: float = vertices[2 * v + 1] + _delta(def, morph, 2 * v + 1)
				out.append_array(bone.local_to_world(lx, ly))
			return out

		var j := 0
		for v in range(count):
			var wx := 0.0
			var wy := 0.0
			for _k in range(binding.counts[v]):
				var bone = bones[binding.bones[j]]
				var px: float = binding.positions[2 * j] + _delta(def, morph, 2 * j)
				var py: float = binding.positions[2 * j + 1] + _delta(def, morph, 2 * j + 1)
				var weight: float = frame_weights[j] if frame_weights != null and j < frame_weights.size() else binding.weights[j]
				wx += (bone.a * px + bone.b * py + bone.world_x) * weight
				wy += (bone.c * px + bone.d * py + bone.world_y) * weight
				j += 1
			out.append(wx)
			out.append(wy)
		return out

	func _delta(def, morph, index: int) -> float:
		var value := 0.0
		if def != null and index < def.size():
			value += def[index]
		if morph != null and index < morph.size():
			value += morph[index]
		return value

	func _region_vertices(slot, attachment) -> Array:
		var bone = slot.frame()
		var co := M.cosd(attachment.rotation)
		var si := M.sind(attachment.rotation)
		var corners: Array = attachment.local_corners
		var out: Array = []
		for i in range(0, 8, 2):
			var px: float = corners[i]
			var py: float = corners[i + 1]
			var lx: float = px * attachment.scale_x * co - py * attachment.scale_y * si + attachment.x
			var ly: float = px * attachment.scale_x * si + py * attachment.scale_y * co + attachment.y
			out.append_array(bone.local_to_world(lx, ly))
		return out

	## Devolve [x, y, rotação].
	func point_world(slot, attachment) -> Array:
		var bone = slot.frame()
		var p: Array = bone.local_to_world(attachment.x, attachment.y)
		var co := M.cosd(attachment.rotation)
		var si := M.sind(attachment.rotation)
		var rotation := M.atan2d(co * bone.c + si * bone.d, co * bone.a + si * bone.b)
		return [p[0], p[1], rotation]

	# -- ordem de desenho (7.13) ------------------------------------------

	func ordered_slots() -> Array:
		var out: Array = []
		for i in draw_order:
			out.append(slots[i])
		return out

	## As caixas de colisão no mundo (7.6).
	func bounding_box_world(slot, attachment) -> Array:
		var bone = slot.frame()
		if attachment.shape == "rectangle" or attachment.shape == "ellipse":
			var half_w: float = attachment.width / 2
			var half_h: float = attachment.height / 2
			var co := M.cosd(attachment.rotation)
			var si := M.sind(attachment.rotation)
			var pts: Array = []
			if attachment.shape == "rectangle":
				pts = [[-half_w, -half_h], [half_w, -half_h], [half_w, half_h], [-half_w, half_h]]
			else:
				for step in range(16):
					var angle := TAU * step / 16
					pts.append([cos(angle) * half_w, sin(angle) * half_h])
			var out: Array = []
			for p in pts:
				var lx: float = p[0] * co - p[1] * si + attachment.x
				var ly: float = p[0] * si + p[1] * co + attachment.y
				out.append_array(bone.local_to_world(lx, ly))
			return out
		return world_vertices(slot, attachment)

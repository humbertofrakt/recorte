# SPDX-License-Identifier: Apache-2.0
# Copiado de runtime-python/recorte/constraints.py (rodada G6, 05/10/2026).
#
# As cinco regras: ik, transform, path, physics e driver. Seções 6 e 8.2 da
# especificação. Toda regra escreve na pose APLICADA e na matriz de mundo dos
# ossos que muda, nunca na pose local, e lê o estado como ele está quando a
# lista chega nela.
#
# Diferenças que o GDScript obriga:
#   - `ik1` e `ik2` são funções soltas no Python; aqui moram como estáticas
#     dentro de `IkConstraint`, e as da curva dentro de `PathGeometry`;
#   - `bone.length` é propriedade no Python e função aqui: `bone.length()`;
#   - o par e o trio do Python (x, y, ângulo) viram Array de float (64 bits;
#     o Vector2 do Godot é de 32 e mudaria a conta);
#   - `math.hypot` vira `sqrt(x*x + y*y)`;
#   - `isinstance(regra, ...)` vira `is`, e `hasattr` vira `has_method`.
@tool
extends RefCounted

const C := preload("carregador.gd")
const M := preload("mat.gd")
const A := preload("animacao.gd")


## O que é comum: os valores animáveis moram na instância.
class Constraint:
	const _SETUP_FIELD := {
		"mix": "mix", "softness": "softness", "bendPositive": "bend_positive",
		"compress": "compress", "stretch": "stretch", "uniform": "uniform",
		"mixRotation": "mix_rotation", "mixX": "mix_x", "mixY": "mix_y",
		"mixScaleX": "mix_scale_x", "mixScaleY": "mix_scale_y",
		"mixShearY": "mix_shear_y", "position": "position", "spacing": "spacing",
		"inertia": "inertia", "strength": "strength", "damping": "damping",
		"mass": "mass", "wind": "wind", "gravity": "gravity",
	}

	var data
	var skeleton
	var values := {}

	func _init(data_, skeleton_) -> void:
		data = data_
		skeleton = skeleton_
		set_to_setup_pose()

	func animatable() -> Array:
		return ["mix"]

	func set_to_setup_pose() -> void:
		values = {}
		for name in animatable():
			values[name] = data.get(_SETUP_FIELD[name])

	func set_property(name: String, value) -> void:
		if values.has(name):
			values[name] = value

	func mix() -> float:
		return float(values.get("mix", 1.0))

	func apply(_now: float) -> void:
		pass

	## Corta os laços com o esqueleto (ver `Skeleton.liberar`).
	func liberar() -> void:
		skeleton = null


# ---------------------------------------------------------------------------
# 6.2 ik
# ---------------------------------------------------------------------------

class IkConstraint extends Constraint:
	var bones: Array = []
	var target = null
	var broken := false

	func _init(data_, skeleton_) -> void:
		super(data_, skeleton_)
		for name in data_.bones:
			if skeleton_.bone_by_name.has(name):
				bones.append(skeleton_.bone_by_name[name])
		target = skeleton_.bone_by_name.get(data_.target)
		broken = bones.size() != data_.bones.size() or target == null

	func animatable() -> Array:
		return ["mix", "softness", "bendPositive", "compress", "stretch", "uniform"]

	func liberar() -> void:
		super()
		bones.clear()
		target = null

	func apply(_now: float) -> void:
		if broken or bones.is_empty():
			return
		var mx := mix()
		var tx: float = target.world_x
		var ty: float = target.world_y
		if bones.size() == 1:
			ik1(bones[0], tx, ty, bool(values["compress"]), bool(values["stretch"]),
				bool(values["uniform"]), mx)
		else:
			ik2(bones[0], bones[1], tx, ty, bool(values["bendPositive"]),
				bool(values["stretch"]), bool(values["uniform"]),
				float(values["softness"]), mx)

	static func ik1(bone, tx: float, ty: float, compress: bool, stretch: bool,
			uniform: bool, mx: float) -> void:
		var sk = bone.skeleton
		var sx: float = sk.scale_x
		var sy: float = sk.scale_y
		var parent = bone.parent
		if parent == null:
			return
		var pa: float = parent.a
		var pb: float = parent.b
		var pc: float = parent.c
		var pd: float = parent.d
		var applied = bone.applied
		var rot: float = -applied.shear_x - applied.rotation
		var mode: String = bone.mode()

		var lx := 0.0
		var ly := 0.0
		# F3: o reflexo da corrente, sem o espelho do esqueleto inteiro.
		var flip: bool = (pa * pd - pb * pc < 0) != ((sx < 0) != (sy < 0))
		if mode == M.MODE_ONLY_TRANSLATION or mode == M.MODE_ONLY_REFLECTION:
			# onlyReflection vira só o eixo Y; o eixo X da mira é o do
			# onlyTranslation.
			lx = (tx - bone.world_x) * RegrasMat.sign(sx)
			ly = (ty - bone.world_y) * RegrasMat.sign(sy)
		elif mode == M.MODE_NO_REFLECTION:
			if flip:
				pb = -pb
				pd = -pd
			var x: float = tx - bone.world_x
			var y: float = ty - bone.world_y
			var det := pa * pd - pb * pc
			if absf(det) <= 0.0001:
				lx = 0.0
				ly = 0.0
			else:
				lx = (x * pd - y * pb) / det
				ly = (y * pa - x * pc) / det
		else:
			if mode == M.MODE_NO_ROTATION_OR_REFLECTION or mode == M.MODE_NO_ROTATION:
				var s := absf(pa * pd - pb * pc) / maxf(0.0001, pa * pa + pc * pc)
				if mode == M.MODE_NO_ROTATION and flip:
					s = -s
				var sa := pa / sx
				var sc := pc / sy
				pb = -sc * s * sx
				pd = sa * s * sy
				rot += M.atan2d(sc, sa)
			var x: float = tx - parent.world_x
			var y: float = ty - parent.world_y
			var det := pa * pd - pb * pc
			if absf(det) <= 0.0001:
				lx = 0.0
				ly = 0.0
			else:
				lx = (x * pd - y * pb) / det - applied.x
				ly = (y * pa - x * pc) / det - applied.y

		rot += M.atan2d(ly, lx)
		if applied.scale_x < 0:
			rot += 180
		rot = M.normalized(rot)

		var scale_x: float = applied.scale_x
		var scale_y: float = applied.scale_y
		if compress or stretch:
			if mode == M.MODE_NO_SCALE or mode == M.MODE_NO_SCALE_OR_REFLECTION:
				lx = tx - bone.world_x
				ly = ty - bone.world_y
			var b: float = bone.length() * scale_x
			if b > 0.0001:
				var dd := lx * lx + ly * ly
				if (compress and dd < b * b) or (stretch and dd > b * b):
					var s := (sqrt(dd) / b - 1) * mx + 1
					scale_x *= s
					if uniform:
						scale_y *= s

		applied.rotation += rot * mx
		applied.scale_x = scale_x
		applied.scale_y = scale_y
		bone.update_world()

	static func ik2(parent_bone, child_bone, tx: float, ty: float, bend_positive: bool,
			stretch: bool, uniform: bool, softness: float, mx: float) -> void:
		var P = parent_bone
		var Cb = child_bone
		var bend_dir := 1.0 if bend_positive else -1.0
		var px: float = P.applied.x
		var py: float = P.applied.y
		var psx: float = P.applied.scale_x
		var psy: float = P.applied.scale_y
		var csx: float = Cb.applied.scale_x
		var sx_p := psx
		var sy_p := psy
		var os1 := 0.0
		var s2 := 1.0
		var os2 := 0.0
		if psx < 0:
			psx = -psx
			os1 = 180.0
			s2 = -1.0
		if psy < 0:
			psy = -psy
			s2 = -s2
		if csx < 0:
			csx = -csx
			os2 = 180.0

		var cx: float = Cb.applied.x
		var u := absf(psx - psy) <= 0.0001
		var cy: float
		var cwx: float
		var cwy: float
		if not u or stretch:
			cy = 0.0
			cwx = P.a * cx + P.world_x
			cwy = P.c * cx + P.world_y
		else:
			cy = Cb.applied.y
			cwx = P.a * cx + P.b * cy + P.world_x
			cwy = P.c * cx + P.d * cy + P.world_y

		var pp = P.parent
		var a: float
		var b: float
		var c: float
		var d: float
		var ppx: float
		var ppy: float
		if pp != null:
			a = pp.a
			b = pp.b
			c = pp.c
			d = pp.d
			ppx = pp.world_x
			ppy = pp.world_y
		else:
			a = 1.0
			b = 0.0
			c = 0.0
			d = 1.0
			ppx = 0.0
			ppy = 0.0
		var det := a * d - b * c
		var inv := 0.0 if absf(det) <= 0.0001 else 1 / det
		var x := cwx - ppx
		var y := cwy - ppy
		var dx := (x * d - y * b) * inv - px
		var dy := (y * a - x * c) * inv - py
		var l1 := sqrt(dx * dx + dy * dy)
		var l2: float = Cb.length() * csx

		if l1 < 0.0001:
			ik1(P, tx, ty, false, stretch, false, mx)
			Cb.applied.rotation = 0.0
			Cb.update_world()
			return

		x = tx - ppx
		y = ty - ppy
		var ttx := (x * d - y * b) * inv - px
		var tty := (y * a - x * c) * inv - py
		var dd := ttx * ttx + tty * tty

		if softness != 0:
			softness = softness * psx * (csx + 1) / 2
			var td := sqrt(dd)
			var sd := td - l1 - l2 * psx + softness
			if sd > 0:
				var pz := minf(1.0, sd / (softness * 2)) - 1
				pz = (sd - softness * (1 - pz * pz)) / td
				ttx -= pz * ttx
				tty -= pz * tty
				dd = ttx * ttx + tty * tty

		var a1 := 0.0
		var a2 := 0.0
		if u:
			l2 = l2 * psx
			var co := (dd - l1 * l1 - l2 * l2) / (2 * l1 * l2) if l1 * l2 != 0 else 0.0
			if co < -1:
				co = -1.0
				a2 = PI * bend_dir
			elif co > 1:
				co = 1.0
				a2 = 0.0
				if stretch:
					var k := (sqrt(dd) / (l1 + l2) - 1) * mx + 1
					sx_p *= k
					if uniform:
						sy_p *= k
			else:
				a2 = acos(co) * bend_dir
			var aa := l1 + l2 * co
			var bb := l2 * sin(a2)
			a1 = M.atan2r(tty * aa - ttx * bb, ttx * aa + tty * bb)
		else:
			# Como no Python, `a b c d x y` daqui para baixo são outros números.
			a = psx * l2
			b = psy * l2
			var aa := a * a
			var bb := b * b
			var ta := M.atan2r(tty, ttx)
			c = bb * l1 * l1 + aa * dd - aa * bb
			var c1 := -2 * bb * l1
			var c2 := bb - aa
			d = c1 * c1 - 4 * c2 * c
			var solved := false
			if d >= 0:
				var q := sqrt(d)
				if c1 < 0:
					q = -q
				q = -(c1 + q) / 2
				var r0 := q / c2 if c2 != 0 else 0.0
				var r1 := c / q if q != 0 else 0.0
				var r := r0 if absf(r0) < absf(r1) else r1
				r0 = dd - r * r
				if r0 >= 0:
					y = sqrt(r0) * bend_dir
					a1 = ta - M.atan2r(y, r)
					a2 = M.atan2r(y / psy, (r - l1) / psx)
					solved = true
			if not solved:
				var min_angle := PI
				var min_x := l1 - a
				var min_dist := min_x * min_x
				var min_y := 0.0
				var max_angle := 0.0
				var max_x := l1 + a
				var max_dist := max_x * max_x
				var max_y := 0.0
				c = -a * l1 / (aa - bb) if aa != bb else 2.0
				if c >= -1 and c <= 1:
					c = acos(c)
					x = a * cos(c) + l1
					y = b * sin(c)
					d = x * x + y * y
					if d < min_dist:
						min_angle = c
						min_dist = d
						min_x = x
						min_y = y
					if d > max_dist:
						max_angle = c
						max_dist = d
						max_x = x
						max_y = y
				if dd <= (min_dist + max_dist) / 2:
					a1 = ta - M.atan2r(min_y * bend_dir, min_x)
					a2 = min_angle * bend_dir
				else:
					a1 = ta - M.atan2r(max_y * bend_dir, max_x)
					a2 = max_angle * bend_dir

		var os := M.atan2r(cy, cx) * s2
		var r1b := M.normalized((a1 - os) * M.RAD2DEG + os1 - P.applied.rotation)
		P.applied.rotation += r1b * mx
		P.applied.scale_x = sx_p
		P.applied.scale_y = sy_p
		P.applied.shear_x = 0.0
		P.applied.shear_y = 0.0
		P.update_world()

		var r2 := M.normalized(((a2 + os) * M.RAD2DEG - Cb.applied.shear_x) * s2 + os2 - Cb.applied.rotation)
		Cb.applied.rotation += r2 * mx
		Cb.update_world()


## `_sign` do Python, ao alcance das classes internas.
class RegrasMat:
	static func sign(value: float) -> float:
		return -1.0 if value < 0 else 1.0


# ---------------------------------------------------------------------------
# 6.3 transform
# ---------------------------------------------------------------------------

class TransformConstraint extends Constraint:
	var bones: Array = []
	var target = null
	var broken := false

	func _init(data_, skeleton_) -> void:
		super(data_, skeleton_)
		for name in data_.bones:
			if skeleton_.bone_by_name.has(name):
				bones.append(skeleton_.bone_by_name[name])
		target = skeleton_.bone_by_name.get(data_.target)
		broken = bones.size() != data_.bones.size() or target == null

	func animatable() -> Array:
		return ["mix", "mixRotation", "mixX", "mixY", "mixScaleX", "mixScaleY", "mixShearY"]

	func liberar() -> void:
		super()
		bones.clear()
		target = null

	func _mixes() -> Array:
		var mx := mix()
		var v := values
		return [mx * v["mixRotation"], mx * v["mixX"], mx * v["mixY"],
			mx * v["mixScaleX"], mx * v["mixScaleY"], mx * v["mixShearY"]]

	func apply(_now: float) -> void:
		if broken:
			return
		var m := _mixes()
		if m[0] == 0 and m[1] == 0 and m[2] == 0 and m[3] == 0 and m[4] == 0 and m[5] == 0:
			return
		if data.local:
			_apply_local(m[0], m[1], m[2], m[3], m[4], m[5])
		elif data.relative:
			_apply_world_relative(m[0], m[1], m[2], m[3], m[4], m[5])
		else:
			_apply_world_absolute(m[0], m[1], m[2], m[3], m[4], m[5])

	func _apply_world_absolute(m_rot: float, m_x: float, m_y: float, m_sx: float, m_sy: float, m_sh: float) -> void:
		var t = target
		var ta: float = t.a
		var tb: float = t.b
		var tc: float = t.c
		var td: float = t.d
		var reflect: float = M.DEG2RAD if (ta * td - tb * tc > 0) else -M.DEG2RAD
		var off_r: float = data.offset_rotation * reflect
		var off_sh: float = data.offset_shear_y * reflect
		for bone in bones:
			if m_rot != 0:
				var a: float = bone.a
				var b: float = bone.b
				var cc: float = bone.c
				var d: float = bone.d
				var r := M.normalize(M.atan2r(tc, ta) - M.atan2r(cc, a) + off_r) * m_rot
				var co := cos(r)
				var si := sin(r)
				bone.a = co * a - si * cc
				bone.b = co * b - si * d
				bone.c = si * a + co * cc
				bone.d = si * b + co * d
			if m_x != 0 or m_y != 0:
				var w: Array = t.local_to_world(data.offset_x, data.offset_y)
				bone.world_x += (w[0] - bone.world_x) * m_x
				bone.world_y += (w[1] - bone.world_y) * m_y
			if m_sx != 0:
				var s: float = sqrt(bone.a * bone.a + bone.c * bone.c)
				if s != 0:
					s = (s + (sqrt(ta * ta + tc * tc) - s + data.offset_scale_x) * m_sx) / s
				bone.a *= s
				bone.c *= s
			if m_sy != 0:
				var s: float = sqrt(bone.b * bone.b + bone.d * bone.d)
				if s != 0:
					s = (s + (sqrt(tb * tb + td * td) - s + data.offset_scale_y) * m_sy) / s
				bone.b *= s
				bone.d *= s
			if m_sh > 0:
				var b: float = bone.b
				var d: float = bone.d
				var by := M.atan2r(d, b)
				var r := M.normalize(M.atan2r(td, tb) - M.atan2r(tc, ta) - (by - M.atan2r(bone.c, bone.a)))
				r = by + (r + off_sh) * m_sh
				var s := sqrt(b * b + d * d)
				bone.b = cos(r) * s
				bone.d = sin(r) * s
			bone.applied_from_world()

	func _apply_world_relative(m_rot: float, m_x: float, m_y: float, m_sx: float, m_sy: float, m_sh: float) -> void:
		var t = target
		var ta: float = t.a
		var tb: float = t.b
		var tc: float = t.c
		var td: float = t.d
		var reflect: float = M.DEG2RAD if (ta * td - tb * tc > 0) else -M.DEG2RAD
		var off_r: float = data.offset_rotation * reflect
		var off_sh: float = data.offset_shear_y * reflect
		for bone in bones:
			if m_rot != 0:
				var a: float = bone.a
				var b: float = bone.b
				var cc: float = bone.c
				var d: float = bone.d
				var r := M.normalize(M.atan2r(tc, ta) + off_r) * m_rot
				var co := cos(r)
				var si := sin(r)
				bone.a = co * a - si * cc
				bone.b = co * b - si * d
				bone.c = si * a + co * cc
				bone.d = si * b + co * d
			if m_x != 0 or m_y != 0:
				var w: Array = t.local_to_world(data.offset_x, data.offset_y)
				bone.world_x += w[0] * m_x
				bone.world_y += w[1] * m_y
			if m_sx != 0:
				var s: float = (sqrt(ta * ta + tc * tc) - 1 + data.offset_scale_x) * m_sx + 1
				bone.a *= s
				bone.c *= s
			if m_sy != 0:
				var s: float = (sqrt(tb * tb + td * td) - 1 + data.offset_scale_y) * m_sy + 1
				bone.b *= s
				bone.d *= s
			if m_sh > 0:
				var b: float = bone.b
				var d: float = bone.d
				var r := M.normalize(M.atan2r(td, tb) - M.atan2r(tc, ta))
				r = M.atan2r(d, b) + (r - PI / 2 + off_sh) * m_sh
				var s := sqrt(b * b + d * d)
				bone.b = cos(r) * s
				bone.d = sin(r) * s
			bone.applied_from_world()

	func _apply_local(m_rot: float, m_x: float, m_y: float, m_sx: float, m_sy: float, m_sh: float) -> void:
		var tq = target.applied
		for bone in bones:
			var q = bone.applied
			if data.relative:
				q.rotation += (tq.rotation + data.offset_rotation) * m_rot
				q.x += (tq.x + data.offset_x) * m_x
				q.y += (tq.y + data.offset_y) * m_y
				q.scale_x *= (tq.scale_x - 1 + data.offset_scale_x) * m_sx + 1
				q.scale_y *= (tq.scale_y - 1 + data.offset_scale_y) * m_sy + 1
				q.shear_y += (tq.shear_y + data.offset_shear_y) * m_sh
			else:
				q.rotation += (tq.rotation - q.rotation + data.offset_rotation) * m_rot
				q.x += (tq.x - q.x + data.offset_x) * m_x
				q.y += (tq.y - q.y + data.offset_y) * m_y
				q.scale_x += (tq.scale_x - q.scale_x + data.offset_scale_x) * m_sx
				q.scale_y += (tq.scale_y - q.scale_y + data.offset_scale_y) * m_sy
				q.shear_y += (tq.shear_y - q.shear_y + data.offset_shear_y) * m_sh
			bone.update_world()


# ---------------------------------------------------------------------------
# 6.4 path — a geometria da curva
# ---------------------------------------------------------------------------

## As curvas de um anexo `path` no mundo, com a tabela de comprimentos (6.4).
class PathGeometry:
	const SEGMENTS := 10

	var points: Array = []
	var anchors := 0
	var closed := false
	var constant_speed := true
	var curve_count := 0
	var segment_lengths: Array = []
	var prefix: Array = [0.0]
	var total := 0.0
	var setup_lengths: Array = []

	static func bezier_point(p: Array, t: float) -> Array:
		var u := 1 - t
		var uu := u * u
		var tt := t * t
		var w0 := uu * u
		var w1 := 3 * uu * t
		var w2 := 3 * u * tt
		var w3 := tt * t
		return [w0 * p[0] + w1 * p[2] + w2 * p[4] + w3 * p[6],
			w0 * p[1] + w1 * p[3] + w2 * p[5] + w3 * p[7]]

	static func bezier_tangent(p: Array, t: float) -> float:
		var u := 1 - t
		var dx: float = 3 * u * u * (p[2] - p[0]) + 6 * u * t * (p[4] - p[2]) + 3 * t * t * (p[6] - p[4])
		var dy: float = 3 * u * u * (p[3] - p[1]) + 6 * u * t * (p[5] - p[3]) + 3 * t * t * (p[7] - p[5])
		if dx == 0 and dy == 0:
			var p2 := bezier_point(p, minf(1.0, t + 1e-4))
			var p1 := bezier_point(p, maxf(0.0, t - 1e-4))
			dx = p2[0] - p1[0]
			dy = p2[1] - p1[1]
		return M.atan2r(dy, dx)

	func _init(world: Array, closed_: bool, constant_speed_: bool, setup_lengths_: Array) -> void:
		points = world
		anchors = int(world.size() / 6)
		closed = closed_
		constant_speed = constant_speed_
		curve_count = anchors if closed else maxi(0, anchors - 1)
		for k in range(curve_count):
			var control := control_points(k)
			var cumulative: Array = []
			var t_len := 0.0
			var px: float = control[0]
			var py: float = control[1]
			for step in range(1, SEGMENTS + 1):
				var q := bezier_point(control, float(step) / SEGMENTS)
				var ddx: float = q[0] - px
				var ddy: float = q[1] - py
				t_len += sqrt(ddx * ddx + ddy * ddy)
				cumulative.append(t_len)
				px = q[0]
				py = q[1]
			segment_lengths.append(cumulative)
			prefix.append(prefix[-1] + t_len)
		if constant_speed or setup_lengths_.is_empty():
			total = prefix[-1]
			setup_lengths = prefix.slice(1)
		else:
			setup_lengths = setup_lengths_.duplicate()
			total = setup_lengths_[-1] if not setup_lengths_.is_empty() else 0.0

	func control_points(k: int) -> Array:
		var anchor := 3 * k + 1
		var out_handle := 3 * k + 2
		var nxt := (k + 1) % anchors
		var in_handle := 3 * nxt
		var next_anchor := 3 * nxt + 1
		return [points[2 * anchor], points[2 * anchor + 1],
			points[2 * out_handle], points[2 * out_handle + 1],
			points[2 * in_handle], points[2 * in_handle + 1],
			points[2 * next_anchor], points[2 * next_anchor + 1]]

	## O índice da curva e o t para a distância q ao longo do caminho.
	func locate(q: float) -> Array:
		if curve_count == 0:
			return [0, 0.0]
		if constant_speed:
			for k in range(curve_count):
				if q <= prefix[k + 1] or k == curve_count - 1:
					var local: float = q - prefix[k]
					var cumulative: Array = segment_lengths[k]
					var previous := 0.0
					for j in range(cumulative.size()):
						var value: float = cumulative[j]
						if local <= value or j == SEGMENTS - 1:
							var span := value - previous
							var fraction := 0.0 if span <= 0 else (local - previous) / span
							fraction = M.clamp_f(fraction, 0.0, 1.0)
							return [k, (j + fraction) / SEGMENTS]
						previous = value
			return [curve_count - 1, 1.0]
		var prev := 0.0
		for k in range(curve_count):
			var end: float = setup_lengths[k] if k < setup_lengths.size() else prev
			if q <= end or k == curve_count - 1:
				var span2 := end - prev
				return [k, 0.0 if span2 <= 0 else M.clamp_f((q - prev) / span2, 0.0, 1.0)]
			prev = end
		return [curve_count - 1, 1.0]

	## O ponto e o ângulo da tangente na distância q, com extrapolação.
	func sample(q: float) -> Array:
		if closed and total > 0:
			q = fmod(q, total)
			if q < 0:
				q += total
		elif q < 0:
			return _extrapolate_before(q)
		elif q > total:
			return _extrapolate_after(q - total)
		var found := locate(q)
		if curve_count == 0:
			return [points[2], points[3], 0.0]
		var control := control_points(found[0])
		var p := bezier_point(control, found[1])
		return [p[0], p[1], bezier_tangent(control, found[1])]

	func _direction(from_x: float, from_y: float, to_x: float, to_y: float) -> Array:
		var dx := to_x - from_x
		var dy := to_y - from_y
		var length := sqrt(dx * dx + dy * dy)
		if length == 0:
			return [1.0, 0.0]
		return [dx / length, dy / length]

	func _extrapolate_before(q: float) -> Array:
		var ax: float = points[2]
		var ay: float = points[3]
		var dir := _direction(ax, ay, points[4], points[5])
		return [ax + dir[0] * q, ay + dir[1] * q, M.atan2r(dir[1], dir[0])]

	func _extrapolate_after(excess: float) -> Array:
		var last := anchors - 1
		var ax: float = points[2 * (3 * last + 1)]
		var ay: float = points[2 * (3 * last + 1) + 1]
		var hx: float = points[2 * (3 * last)]
		var hy: float = points[2 * (3 * last) + 1]
		var dir := _direction(hx, hy, ax, ay)
		return [ax + dir[0] * excess, ay + dir[1] * excess, M.atan2r(dir[1], dir[0])]


class PathConstraint extends Constraint:
	var bones: Array = []
	var slot = null
	var broken := false

	func _init(data_, skeleton_) -> void:
		super(data_, skeleton_)
		for name in data_.bones:
			if skeleton_.bone_by_name.has(name):
				bones.append(skeleton_.bone_by_name[name])
		slot = skeleton_.slot_by_name.get(data_.target)
		broken = bones.size() != data_.bones.size() or slot == null

	func animatable() -> Array:
		return ["mix", "mixRotation", "mixX", "mixY", "position", "spacing"]

	func liberar() -> void:
		super()
		bones.clear()
		slot = null

	func apply(_now: float) -> void:
		if broken or bones.is_empty():
			return
		var found: Array = skeleton.attachment_for(slot)
		var attachment = found[0]
		var skin_name: String = found[1]
		if not attachment is C.PathAttachment:
			return
		var mx := mix()
		var m_rot: float = mx * values["mixRotation"]
		var m_x: float = mx * values["mixX"]
		var m_y: float = mx * values["mixY"]
		if m_rot == 0 and m_x == 0 and m_y == 0:
			return

		var n := bones.size()
		var scale: bool = data.rotate_mode == "chainScale"
		var tangents: bool = data.rotate_mode == "tangent"
		var spaces: Array = []
		spaces.resize(n + 1)
		spaces.fill(0.0)
		var lengths: Array = []
		lengths.resize(n)
		lengths.fill(0.0)
		var spacing := float(values["spacing"])

		for i in range(n):
			var bone = bones[i]
			var setup_length: float = bone.length()
			var world_len: float = setup_length * sqrt(bone.a * bone.a + bone.c * bone.c)
			if scale:
				lengths[i] = 0.0 if setup_length < 0.00001 else world_len
			if data.spacing_mode == "percent":
				spaces[i + 1] = spacing
			elif data.spacing_mode == "fixed":
				spaces[i + 1] = spacing if setup_length < 0.00001 else spacing * world_len / setup_length
			elif data.spacing_mode == "length":
				spaces[i + 1] = spacing if setup_length < 0.00001 else (setup_length + spacing) * world_len / setup_length
			else:  # proportional
				spaces[i + 1] = spacing if setup_length < 0.00001 else world_len
		if data.spacing_mode == "proportional":
			var m := n if tangents else n + 1
			var sum := 0.0
			for i in range(1, n + 1):
				sum += spaces[i]
			if sum > 0:
				var k: float = m / sum * spacing
				for i in range(1, n + 1):
					spaces[i] *= k

		var world: Array = skeleton.world_vertices(slot, attachment, skin_name)
		var geometry := PathGeometry.new(world, attachment.closed, attachment.constant_speed,
			attachment.lengths)
		var total: float = geometry.total
		var position := float(values["position"])
		if data.position_mode == "percent":
			position *= total
		if data.spacing_mode == "percent":
			for i in range(1, n + 1):
				spaces[i] *= total

		var points: Array = []
		var angles: Array = []
		var pos := position
		for i in range(n + 1):
			pos += spaces[i]
			var s := geometry.sample(pos)
			points.append([s[0], s[1]])
			angles.append(s[2])

		var bx: float = points[0][0]
		var by: float = points[0][1]
		var off_r: float = data.offset_rotation
		var tip := false
		if off_r == 0:
			tip = data.rotate_mode == "chain"
		else:
			var pb = slot.bone
			off_r = off_r * (M.DEG2RAD if (pb.a * pb.d - pb.b * pb.c > 0) else -M.DEG2RAD)

		for i in range(n):
			var bone = bones[i]
			bone.world_x += (bx - bone.world_x) * m_x
			bone.world_y += (by - bone.world_y) * m_y
			var x: float = points[i + 1][0]
			var y: float = points[i + 1][1]
			var dx := x - bx
			var dy := y - by
			if scale and lengths[i] != 0:
				var s: float = (sqrt(dx * dx + dy * dy) / lengths[i] - 1) * m_rot + 1
				bone.a *= s
				bone.c *= s
			bx = x
			by = y
			if m_rot > 0:
				var a: float = bone.a
				var b: float = bone.b
				var cc: float = bone.c
				var d: float = bone.d
				var r: float
				if tangents:
					r = angles[i]
				elif spaces[i + 1] == 0:
					r = angles[i + 1]
				else:
					r = M.atan2r(dy, dx)
				r -= M.atan2r(cc, a)
				if tip:
					var co := cos(r)
					var si := sin(r)
					var length: float = bone.length()
					bx += (length * (co * a - si * cc) - dx) * m_rot
					by += (length * (si * a + co * cc) - dy) * m_rot
				else:
					r += off_r
				r = M.normalize(r) * m_rot
				var co2 := cos(r)
				var si2 := sin(r)
				bone.a = co2 * a - si2 * cc
				bone.b = co2 * b - si2 * d
				bone.c = si2 * a + co2 * cc
				bone.d = si2 * b + co2 * d
			bone.applied_from_world()


# ---------------------------------------------------------------------------
# 6.5 physics
# ---------------------------------------------------------------------------

class PhysicsConstraint extends Constraint:
	var bone = null
	var broken := false
	var x_offset := 0.0
	var x_velocity := 0.0
	var y_offset := 0.0
	var y_velocity := 0.0
	var rotate_offset := 0.0
	var rotate_velocity := 0.0
	var scale_offset := 0.0
	var scale_velocity := 0.0
	var remaining := 0.0
	var last_time = null
	var ux := 0.0
	var uy := 0.0
	var cx := 0.0
	var cy := 0.0
	var tx := 0.0
	var ty := 0.0
	var reset := true

	func _init(data_, skeleton_) -> void:
		super(data_, skeleton_)
		bone = skeleton_.bone_by_name.get(data_.bone)
		broken = bone == null
		reset_state()

	func animatable() -> Array:
		return ["mix", "inertia", "strength", "damping", "mass", "wind", "gravity"]

	func liberar() -> void:
		super()
		bone = null

	func reset_state() -> void:
		x_offset = 0.0
		x_velocity = 0.0
		y_offset = 0.0
		y_velocity = 0.0
		rotate_offset = 0.0
		rotate_velocity = 0.0
		scale_offset = 0.0
		scale_velocity = 0.0
		remaining = 0.0
		last_time = null
		ux = 0.0
		uy = 0.0
		cx = 0.0
		cy = 0.0
		tx = 0.0
		ty = 0.0
		reset = true

	func physics_reset(now: float) -> void:
		reset = true
		remaining = 0.0
		last_time = now
		x_offset = 0.0
		x_velocity = 0.0
		y_offset = 0.0
		y_velocity = 0.0
		rotate_offset = 0.0
		rotate_velocity = 0.0
		scale_offset = 0.0
		scale_velocity = 0.0

	func apply(now: float) -> void:
		if broken:
			return
		var mx := mix()
		if mx == 0:
			return
		var sx: float = skeleton.scale_x
		var sy: float = skeleton.scale_y
		var length: float = bone.length()
		var f: float = skeleton.data.reference_scale
		var step: float = 1.0 / data.fps if data.fps != 0 else 1.0 / 60
		var mass_inverse: float = 1.0 / values["mass"] if values["mass"] != 0 else 0.0
		var use_x: bool = data.x > 0
		var use_y: bool = data.y > 0
		var use_rot: bool = data.rotation > 0 or data.shear_x > 0
		var use_scale: bool = data.scale_x > 0

		if last_time == null:
			last_time = now
		var delta := maxf(now - last_time, 0.0)
		remaining += delta
		last_time = now
		var bx: float = bone.world_x
		var by: float = bone.world_y
		var co := 0.0
		var si := 0.0

		if reset:
			reset = false
			ux = bx
			uy = by
			remaining = 0.0
		else:
			var a := remaining
			var i: float = values["inertia"]
			var d := -1.0
			var qx: float = data.limit * delta
			var qy: float = qx * absf(sy)
			qx = qx * absf(sx)
			if use_x or use_y:
				if use_x:
					x_offset += M.clamp_f((ux - bx) * i, -qx, qx)
					ux = bx
				if use_y:
					y_offset += M.clamp_f((uy - by) * i, -qy, qy)
					uy = by
				if a >= step:
					d = pow(values["damping"], 60 * step)
					var m := mass_inverse * step
					var e: float = values["strength"]
					var w: float = values["wind"] * f
					var g: float = values["gravity"] * f
					while true:
						if use_x:
							x_velocity += (w - x_offset * e) * m
							x_offset += x_velocity * step
							x_velocity *= d
						if use_y:
							y_velocity -= (g + y_offset * e) * m
							y_offset += y_velocity * step
							y_velocity *= d
						a -= step
						if a < step:
							break
			if use_x:
				bone.world_x += x_offset * mx * data.x
			if use_y:
				bone.world_y += y_offset * mx * data.y

			if use_rot or use_scale:
				var ca := M.atan2r(bone.c, bone.a)
				var mr := 0.0
				var dx := M.clamp_f(cx - bone.world_x, -qx, qx)
				var dy := M.clamp_f(cy - bone.world_y, -qy, qy)
				if use_rot:
					mr = (data.rotation + data.shear_x) * mx
					var r := M.atan2r(dy + ty, dx + tx) - ca - rotate_offset * mr
					rotate_offset += (r - ceil(r / TAU - 0.5) * TAU) * i
					r = rotate_offset * mr + ca
					co = cos(r)
					si = sin(r)
					if use_scale:
						r = length * sqrt(bone.a * bone.a + bone.c * bone.c)
						if r > 0:
							scale_offset += (dx * co + dy * si) * i / r
				else:
					co = cos(ca)
					si = sin(ca)
					var r2: float = length * sqrt(bone.a * bone.a + bone.c * bone.c)
					if r2 > 0:
						scale_offset += (dx * co + dy * si) * i / r2
				a = remaining
				if a >= step:
					if d == -1:
						d = pow(values["damping"], 60 * step)
					var m := mass_inverse * step
					var e: float = values["strength"]
					var w: float = values["wind"]
					var g: float = values["gravity"]
					var h: float = length / f if f != 0 else 0.0
					while true:
						a -= step
						if use_scale:
							scale_velocity += (w * co - g * si - scale_offset * e) * m
							scale_offset += scale_velocity * step
							scale_velocity *= d
						if use_rot:
							rotate_velocity -= ((w * si + g * co) * h + rotate_offset * e) * m
							rotate_offset += rotate_velocity * step
							rotate_velocity *= d
							if a < step:
								break
							var r3 := rotate_offset * mr + ca
							co = cos(r3)
							si = sin(r3)
						elif a < step:
							break
			remaining = a
		cx = bone.world_x
		cy = bone.world_y

		if use_rot:
			var o: float = rotate_offset * mx
			if data.shear_x > 0:
				var r := 0.0
				if data.rotation > 0:
					r = o * data.rotation
					si = sin(r)
					co = cos(r)
					var b: float = bone.b
					bone.b = co * b - si * bone.d
					bone.d = si * b + co * bone.d
				r = r + o * data.shear_x
				si = sin(r)
				co = cos(r)
				var a2: float = bone.a
				bone.a = co * a2 - si * bone.c
				bone.c = si * a2 + co * bone.c
			else:
				o = o * data.rotation
				si = sin(o)
				co = cos(o)
				var a3: float = bone.a
				bone.a = co * a3 - si * bone.c
				bone.c = si * a3 + co * bone.c
				var b3: float = bone.b
				bone.b = co * b3 - si * bone.d
				bone.d = si * b3 + co * bone.d
		if use_scale:
			var s: float = 1 + scale_offset * mx * data.scale_x
			bone.a *= s
			bone.c *= s
		tx = length * bone.a
		ty = length * bone.c
		bone.applied_from_world()


# ---------------------------------------------------------------------------
# 8.2 driver
# ---------------------------------------------------------------------------

class DriverConstraint extends Constraint:
	func apply(_now: float) -> void:
		var sk = skeleton
		var parameter = sk.data.find_parameter(data.parameter)
		if parameter == null:
			return
		var value: float = A.parameter_value(sk, parameter)
		var mx := mix()

		if data.animation != null:
			var animation = sk.data.find_animation(data.animation)
			if animation == null:
				return
			var low: float = data.from_value if data.from_value != null else parameter.min
			var high: float = data.to_value if data.to_value != null else parameter.max
			if low == high:
				return
			var time_to: float = data.time_to if data.time_to != null else animation.duration
			var t: float = data.time_from + (value - low) / (high - low) * (time_to - data.time_from)
			t = M.clamp_f(t, minf(data.time_from, time_to), maxf(data.time_from, time_to))
			for timeline in animation.timelines:
				if timeline.type in ["event", "sequence", "tag"]:
					continue
				var sampled = A.evaluate_keys(timeline.keys, t, timeline.components)
				var target := C.DriverTarget.new()
				target.type = timeline.type
				target.target = timeline.target
				target.property = timeline.property
				target.skin = timeline.skin
				target.attachment = timeline.attachment
				target.mode = data.mode
				A.apply_driver_target(sk, target, sampled, data.mode, mx)
			return

		if data.targets == null:
			return
		for target in data.targets:
			var sampled = A.evaluate_keys(target.keys, value, 1, false, "input")
			A.apply_driver_target(sk, target, sampled, target.mode, mx)


# ---------------------------------------------------------------------------

static func build_constraints(skeleton) -> Array:
	var out: Array = []
	for data in skeleton.data.constraints:
		if data is C.IkConstraintData:
			out.append(IkConstraint.new(data, skeleton))
		elif data is C.TransformConstraintData:
			out.append(TransformConstraint.new(data, skeleton))
		elif data is C.PathConstraintData:
			out.append(PathConstraint.new(data, skeleton))
		elif data is C.PhysicsConstraintData:
			out.append(PhysicsConstraint.new(data, skeleton))
		elif data is C.DriverConstraintData:
			out.append(DriverConstraint.new(data, skeleton))
	return out

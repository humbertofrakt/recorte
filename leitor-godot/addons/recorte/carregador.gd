# SPDX-License-Identifier: Apache-2.0
# Copiado de runtime-python/recorte/loader.py (rodada G1, 05/10/2026).
#
# Lê um `.bone` para o modelo de dados. Seções 2 e 4 da especificação: regras
# do arquivo, cabeçalho, versões, extensões, caminhos, e os objetos. Valor
# desconhecido segue a tabela de 2.5: o arquivo sempre abre, menos quando
# `extensionsRequired` cita uma extensão que este leitor não tem (2.7).
#
# O que esta cópia AINDA NÃO lê, e avisa (regra 21) em vez de fingir:
#   (o `.boneb`, em `binario.gd`, e o `.bonez` vieram na G8)
#   (a skin e a animação de outro arquivo, `assets.skins/animations`, vieram na G4)
#   (a entidade encaixada, anexo `skeleton`, e a chave `body` vieram na G5:
#    `_load_children`, `_load_bodies`, o `ctx` e a `chain`; o `around` da 1.1)
#   (as regras, ik, transform, path, physics e driver, vieram na G6)
#   (a extensão `BONE_particles`, o anexo e a timeline dela, veio na G7)
#
# Diferenças que o GDScript obriga, uma por linha:
#   - não há exceção: quem falha devolve {"dados": null, "erro": "..."};
#   - o JSON do Godot lê todo número como float: inteiros passam por int();
#   - `Array.sort_custom` não é estável, e o `list.sort` do Python é: as
#     chaves se ordenam por `_ordenar_estavel`;
#   - tupla vira Array de dois inteiros (versão).
@tool
extends RefCounted

const AtlasJs := preload("atlas.gd")
const Bin := preload("binario.gd")

# 1.1: a única propriedade nova é `skeleton.around` (7.11), lida abaixo (G5).
const READER_VERSION := [1, 1]

# 12.6: até onde um filho pode ter filho (o `MAX_NESTING` do Python).
const MAX_NESTING := 8

# Extensões que este leitor implementa (2.7). `BONE_particles` é o módulo P,
# primeira fase: a taxa liga e desliga, e o ramo `linear` da integral da taxa
# (4.2) é segunda fase. Rodada G7.
const SUPPORTED_EXTENSIONS: Array = ["BONE_particles"]

const BONE_PROPERTIES := ["x", "y", "rotation", "scaleX", "scaleY", "shearX", "shearY"]
const INHERIT_PROPERTIES := ["inheritRotation", "inheritScale", "inheritReflection"]

const TIMELINE_TYPES := [
	"bone", "slot", "drawOrder", "deform", "weights", "sequence", "event",
	"constraint", "parameter", "morph", "variable", "tag", "nested", "body",
	# O tipo de timeline da extensão `BONE_particles` (9 dela). Também tem o
	# prefixo: um leitor sem a extensão o ignora pela regra de 2.5.
	"BONE_particle",
]

# 9 da extensão: os campos animáveis de um emissor, e quantos componentes cada
# um anima. Uma faixa `[min, max]` anima como valor de 2 componentes. Todos são
# **N** em 9: lidos no instante do NASCIMENTO e congelados na partícula.
# `lifetime` falta de propósito: 9.2 proíbe animá-lo.
const PARTICLE_PROPERTIES := {
	"emitting": 1, "rate": 1, "speed": 2, "direction": 1,
	"spread": 1, "radius": 1, "radiusThickness": 1, "arc": 1, "size": 2,
	"edge": 4, "gravity": 2, "drag": 1, "angle": 2, "angularVelocity": 2,
	"scale": 2, "startColor": 8, "startFrame": 2,
}

const CONSTRAINT_PROPERTIES := {
	"ik": ["mix", "softness", "bendPositive", "compress", "stretch", "uniform"],
	"transform": ["mix", "mixRotation", "mixX", "mixY", "mixScaleX", "mixScaleY", "mixShearY"],
	"path": ["mix", "mixRotation", "mixX", "mixY", "position", "spacing"],
	"physics": ["mix", "inertia", "strength", "damping", "mass", "wind", "gravity", "reset"],
	"driver": ["mix"],
}


## Junta os avisos que a especificação pede uma vez por arquivo.
class Warnings:
	var messages: Array = []
	var _seen := {}

	func add(message: String) -> void:
		if not _seen.has(message):
			_seen[message] = true
			messages.append(message)


# ---------------------------------------------------------------------------
# Objetos (seção 4)
# ---------------------------------------------------------------------------

class BoneData:
	var name := ""
	var index := 0
	var parent: BoneData = null
	var length := 0.0
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
	var skin_required := false


class SlotData:
	var name := ""
	var index := 0
	var bone: BoneData = null
	var attachment = null  # String ou null
	var color: Array = [1.0, 1.0, 1.0, 1.0]
	var dark_color = null  # Array ou null
	var blend := "normal"
	var visible := true


class SkinData:
	var name := ""
	var includes: Array = []
	var bones: Array = []
	var constraints: Array = []
	var attachments := {}  # slot -> {nome do placeholder -> Attachment ou null}
	# [nome do slot, offset] aplicados enquanto a skin está ativa (4.4).
	var draw_order: Array = []


class Sequence:
	var count := 1
	var frames = null  # Array de String ou null
	var start := 1
	var digits := 0
	var setup := 0

	func frame_name(path: String, index: int) -> String:
		if frames != null:
			if index >= 0 and index < frames.size():
				return frames[index]
			return path
		var number := start + index
		if digits > 0:
			return path + str(number).pad_zeros(digits)
		return path + str(number)


class Attachment:
	var type := ""
	var name := ""
	var path := ""
	var color: Array = [1.0, 1.0, 1.0, 1.0]
	var sequence: Sequence = null


class Binding:
	var counts: Array = []
	var bones: Array = []
	var positions: Array = []
	var weights: Array = []

	func total() -> int:
		return weights.size()


class RegionAttachment extends Attachment:
	var x := 0.0
	var y := 0.0
	var rotation := 0.0
	var scale_x := 1.0
	var scale_y := 1.0
	var width := 0.0
	var height := 0.0
	var region = null
	# Os quatro cantos locais e os UV da página, feitos ao carregar (7.3).
	var local_corners: Array = []
	var page_uvs: Array = []
	# Um por quadro da sequência (7.10): [região, cantos, uvs].
	var frames: Array = []


class MeshAttachment extends Attachment:
	var vertices: Array = []
	var binding: Binding = null
	var uvs: Array = []
	var triangles: Array = []
	var hull := 0
	var edges: Array = []
	var width := 0.0
	var height := 0.0
	var vertex_count := 0
	var region = null
	var page_uvs: Array = []
	# Um por quadro da sequência (7.10): [região, uvs].
	var frames: Array = []
	# Na linkedmesh, para o deform e o morph acharem os números do pai.
	var deform_source: MeshAttachment = null
	# Só na linkedmesh, para a volta que liga.
	var link_parent := ""
	var link_skin := "default"
	var inherit_deform := true


class BoundingBoxAttachment extends Attachment:
	var shape := "polygon"
	var vertices: Array = []
	var binding: Binding = null
	var x := 0.0
	var y := 0.0
	var width := 0.0
	var height := 0.0
	var rotation := 0.0
	var vertex_count := 0


class ClippingAttachment extends Attachment:
	var end = null
	var slots = null
	var invert := false
	var vertices: Array = []
	var binding: Binding = null
	var vertex_count := 0


class PathAttachment extends Attachment:
	var closed := false
	var constant_speed := true
	var lengths: Array = []
	var vertices: Array = []
	var binding: Binding = null
	var vertex_count := 0


class PointAttachment extends Attachment:
	var x := 0.0
	var y := 0.0
	var rotation := 0.0


## Uma rajada de um emissor (`BONE_particles` 4.3). Rodada G7.
class Burst:
	var time := 0.0
	var count := 1
	var cycles := 1
	var interval := 1.0
	var probability := 1.0


## O anexo `"type": "BONE_particle"` da extensão `BONE_particles`: um emissor
## num slot, preso ao osso do slot, como uma `region`. Os nomes e os padrões
## são os de 9 da extensão. `shape_ok` guarda o único recuo que NÃO é padrão:
## forma desconhecida = o emissor não se desenha (7.4).
class ParticleAttachment extends Attachment:
	# 9.1 emissão
	var emitting := true
	var rate := 10.0
	var bursts: Array = []
	var explosiveness := 0.0
	var duration := 1.0
	var randomness := 0.0
	var start_delay := 0.0
	# 9.2 vida e teto
	var lifetime: Array = [1.0, 1.0]
	var max_particles := 1000
	# 9.3 velocidade, direção, abertura
	var speed: Array = [100.0, 100.0]
	var direction := 90.0
	var spread := 0.0
	var spherize_direction := 0.0
	var align_to_velocity := false
	# 9.4 forma
	var shape := "point"
	var shape_ok := true
	var radius := 0.0
	var radius_thickness := 1.0
	var arc := 360.0
	var size: Array = [0.0, 0.0]
	var edge: Array = [0.0, 0.0, 0.0, 0.0]
	var mesh = null
	# 9.4.2 (1.1 da extensão, rodada G9): `shape: "path"` lê
	# `"<slot>/<placeholder>"`. O nome é `curve`, e não `path`, porque `path`
	# já é a imagem da partícula.
	var curve = null
	var mesh_mode := "vertex"
	# 9.5 forças
	var gravity: Array = [0.0, 0.0]
	var drag := 0.0
	# 9.6 giro e tamanho
	var angle: Array = [0.0, 0.0]
	var angular_velocity: Array = [0.0, 0.0]
	var scale: Array = [1.0, 1.0]
	var scale_over_lifetime = null
	# 9.7 cor
	var start_color: Array = [[1.0, 1.0, 1.0, 1.0], [1.0, 1.0, 1.0, 1.0]]
	var color_over_lifetime = null
	var alpha_over_lifetime = null
	# 9.8 imagem e folha de quadros
	var frame_mode := "lifetime"
	var cycles := 1.0
	var fps := 12.0
	var start_frame: Array = [0.0, 0.0]
	# 9.9 espaço, semente, laço, ordem
	var space := "local"
	var seed := 0
	var looping := true
	var prewarm := 0.0
	var sort_mode := "youngestInFront"
	# 9.10 onde o emissor fica: `M_emissor = M_osso x T(x, y) . R(rotation)`.
	var x := 0.0
	var y := 0.0
	var rotation := 0.0
	# Só do desenho (não está no Python, que não desenha): a região do atlas
	# de cada quadro da folha, na ordem da sequência; sem sequência, uma só.
	# Cada uma é [região, cantos, uvs], como o quadro de uma `region` (7.3).
	var frames: Array = []


## A entidade encaixada (7.11). O filho carregado e o caminho dele vieram na G5.
class SkeletonAttachment extends Attachment:
	var uri := ""
	var skins: Array = []
	var animation = null
	var loop := true
	var time_scale := 1.0
	var x := 0.0
	var y := 0.0
	var rotation := 0.0
	var scale_x := 1.0
	var scale_y := 1.0
	var inherit_color := true
	var inherit_animation := false
	var base_animation = null
	# 7.11, desde a 1.1: o slot DO FILHO que marca o meio. O que vem antes dele
	# é desenhado atrás de quem o recebe; o que vem depois, na frente.
	var around = null
	# O filho carregado (7.11), e o caminho a que ele se resolveu a partir do
	# arquivo aberto primeiro. Dois anexos com o mesmo `resolved` mostram a
	# mesma entidade: é assim que a 9.13 decide se uma instância continua.
	var child = null
	var resolved := ""


class EventDef:
	var name := ""
	var int_value := 0
	var float_value := 0.0
	var string_value := ""
	var audio = null
	var volume := 1.0
	var balance := 0.0


class ParameterSource:
	var bone := ""
	var property := ""
	var from_value := 0.0
	var to_value := 1.0


class ParameterData:
	var name := ""
	var min := 0.0
	var max := 1.0
	var default := 0.0
	var repeat := false
	var source: ParameterSource = null


class MorphTarget:
	var slot := ""
	var attachment := ""
	var skin := "default"
	var offsets: Array = []


class MorphData:
	var name := ""
	var weight := 0.0
	var min := 0.0
	var max := 1.0
	var targets: Array = []


class VariableData:
	var name := ""
	var type := "float"
	var default = 0.0


# ---------------------------------------------------------------------------
# Regras (seções 6 e 8). Rodada G6.
# ---------------------------------------------------------------------------

class ConstraintData:
	var type := ""
	var name := ""
	var mix := 1.0
	var skin_required := false


class IkConstraintData extends ConstraintData:
	var bones: Array = []
	var target := ""
	var bend_positive := true
	var compress := false
	var stretch := false
	var uniform := false
	var softness := 0.0


class TransformConstraintData extends ConstraintData:
	var bones: Array = []
	var target := ""
	var local := false
	var relative := false
	var offset_rotation := 0.0
	var offset_x := 0.0
	var offset_y := 0.0
	var offset_scale_x := 0.0
	var offset_scale_y := 0.0
	var offset_shear_y := 0.0
	var mix_rotation := 1.0
	var mix_x := 1.0
	var mix_y := 1.0
	var mix_scale_x := 1.0
	var mix_scale_y := 1.0
	var mix_shear_y := 1.0


class PathConstraintData extends ConstraintData:
	var bones: Array = []
	var target := ""
	var position_mode := "percent"
	var spacing_mode := "length"
	var rotate_mode := "tangent"
	var offset_rotation := 0.0
	var position := 0.0
	var spacing := 0.0
	var mix_rotation := 1.0
	var mix_x := 1.0
	var mix_y := 1.0


class PhysicsConstraintData extends ConstraintData:
	var bone := ""
	var x := 0.0
	var y := 0.0
	var rotation := 0.0
	var scale_x := 0.0
	var shear_x := 0.0
	var inertia := 0.5
	var strength := 100.0
	var damping := 1.0
	var mass := 1.0
	var wind := 0.0
	var gravity := 0.0
	var limit := 5000.0
	var fps := 60.0


## Uma chave de driver: `input` no lugar de `time`.
class DriverKey:
	var input := 0.0
	var value = null
	var curve = "linear"
	var offset := 0


class DriverTarget:
	var type := ""
	var target = null
	var property = null
	var skin := "default"
	var attachment = null
	var mode := "replace"
	var keys: Array = []


class DriverConstraintData extends ConstraintData:
	var parameter := ""
	var targets = null  # Array de DriverTarget, ou null
	var animation = null
	var from_value = null
	var to_value = null
	var time_from := 0.0
	var time_to = null
	var mode := "replace"


# ---------------------------------------------------------------------------
# Animações (seção 9)
# ---------------------------------------------------------------------------

## (`Key` no Python. Aqui `KeyData`: `Key` já é um nome do Godot, o das teclas.)
class KeyData:
	var time := 0.0
	var value = null
	var curve = "linear"  # "linear", "stepped" ou Array de 4·componentes
	var offset := 0
	var event = null
	var payload := {}
	# Só na chave `slot/bone` (9.5): [x, y, rotation, scaleX, scaleY].
	var transform = null
	# Só na chave `body` (9.13).
	var keep_skins := true
	# Só na chave `deform`: o `value` alargado ao tamanho de 7.4 (9.6).
	var expanded = null


class Timeline:
	var type := ""
	var target = null
	var property = null
	var skin := "default"
	var attachment = null
	var keys: Array = []
	var components := 1


class AnimationData:
	var name := ""
	var duration := 0.0
	var loop := false
	var blend := "replace"
	var default_mix = null
	var tags: Array = []
	var timelines: Array = []


class SkeletonData:
	var name := ""
	var fps := 30.0
	var reference_scale := 100.0
	var pixel_art := false
	var bones: Array = []
	var slots: Array = []
	var skins: Array = []
	var constraints: Array = []
	var events: Array = []
	var parameters: Array = []
	var morphs: Array = []
	var variables: Array = []
	var tags: Array = []
	var animations: Array = []
	var atlases: Array = []
	var warnings := Warnings.new()
	var skeletons_base := ""
	var rig := {}
	var bodies := {}
	var missing: Array = []

	func find_bone(n: String) -> BoneData:
		for b in bones:
			if b.name == n:
				return b
		return null

	func find_slot(n: String) -> SlotData:
		for s in slots:
			if s.name == n:
				return s
		return null

	func find_skin(n: String) -> SkinData:
		for s in skins:
			if s.name == n:
				return s
		return null

	func find_animation(n: String) -> AnimationData:
		for a in animations:
			if a.name == n:
				return a
		return null

	func find_constraint(n: String) -> ConstraintData:
		for c in constraints:
			if c.name == n:
				return c
		return null

	func find_event(n: String) -> EventDef:
		for e in events:
			if e.name == n:
				return e
		return null

	func find_parameter(n: String) -> ParameterData:
		for p in parameters:
			if p.name == n:
				return p
		return null

	func find_morph(n: String) -> MorphData:
		for m in morphs:
			if m.name == n:
				return m
		return null

	func find_variable(n: String) -> VariableData:
		for v in variables:
			if v.name == n:
				return v
		return null


# ---------------------------------------------------------------------------
# Leitores pequenos
# ---------------------------------------------------------------------------

static func is_number(value) -> bool:
	return typeof(value) == TYPE_FLOAT or typeof(value) == TYPE_INT


static func _number(source: Dictionary, key: String, default_value: float) -> float:
	var value = source.get(key, default_value)
	if not is_number(value):
		return default_value
	return float(value)


static func _integer(source: Dictionary, key: String, default_value: int) -> int:
	var value = source.get(key, default_value)
	if not is_number(value):
		return default_value
	return int(value)


static func _flag(source: Dictionary, key: String, default_value: bool) -> bool:
	var value = source.get(key, default_value)
	return value if typeof(value) == TYPE_BOOL else default_value


static func _text(source: Dictionary, key: String, default_value):
	var value = source.get(key, default_value)
	return value if typeof(value) == TYPE_STRING else default_value


static func _color(source: Dictionary, key: String, default_value):
	var value = source.get(key)
	if typeof(value) == TYPE_ARRAY:
		var out: Array = []
		for v in value:
			if not is_number(v):
				return default_value
			out.append(float(v))
		return out
	return default_value


static func _floats(value) -> Array:
	var out: Array = []
	if typeof(value) != TYPE_ARRAY:
		return out
	for v in value:
		if is_number(v):
			out.append(float(v))
	return out


static func _ints(value) -> Array:
	var out: Array = []
	if typeof(value) != TYPE_ARRAY:
		return out
	for v in value:
		if is_number(v):
			out.append(int(v))
	return out


static func _strings(value) -> Array:
	var out: Array = []
	if typeof(value) != TYPE_ARRAY:
		return out
	for v in value:
		out.append(_str(v))
	return out


## `str()` do Python: o número inteiro sai sem `.0`.
static func _str(v) -> String:
	if typeof(v) == TYPE_FLOAT and v == floor(v) and absf(v) < 1e15:
		return str(int(v))
	return str(v)


static func _list(value) -> Array:
	return value if typeof(value) == TYPE_ARRAY else []


static func _dict(value) -> Dictionary:
	return value if typeof(value) == TYPE_DICTIONARY else {}


static func _parse_version(text) -> Array:
	if typeof(text) != TYPE_STRING:
		return [0, 0]
	var parts: PackedStringArray = text.split(".")
	if not parts[0].is_valid_int():
		return [0, 0]
	if parts.size() > 1 and not parts[1].is_valid_int():
		return [0, 0]
	return [int(parts[0]), int(parts[1]) if parts.size() > 1 else 0]


## Compara duas versões [maior, menor]: -1, 0 ou 1 (a tupla do Python).
static func _version_cmp(a: Array, b: Array) -> int:
	if a[0] != b[0]:
		return -1 if a[0] < b[0] else 1
	if a[1] != b[1]:
		return -1 if a[1] < b[1] else 1
	return 0


static func _binding(raw) -> Binding:
	if typeof(raw) != TYPE_DICTIONARY:
		return null
	var b := Binding.new()
	b.counts = _ints(raw.get("counts"))
	b.bones = _ints(raw.get("bones"))
	b.positions = _floats(raw.get("positions"))
	b.weights = _floats(raw.get("weights"))
	return b


static func _sequence(raw) -> Sequence:
	if typeof(raw) != TYPE_DICTIONARY:
		return null
	var s := Sequence.new()
	var frames = raw.get("frames")
	var count := _integer(raw, "count", 1)
	if typeof(frames) == TYPE_ARRAY:
		s.frames = _strings(frames)
		count = s.frames.size()
	s.count = maxi(1, count)
	s.start = _integer(raw, "start", 1)
	s.digits = _integer(raw, "digits", 0)
	s.setup = _integer(raw, "setup", 0)
	return s


## Ordenação estável por um campo (o `list.sort` do Python é estável).
static func _ordenar_estavel(items: Array, campo: String) -> void:
	for i in range(1, items.size()):
		var item = items[i]
		var j := i - 1
		while j >= 0 and items[j].get(campo) > item.get(campo):
			items[j + 1] = items[j]
			j -= 1
		items[j + 1] = item


# ---------------------------------------------------------------------------
# Anexos (seção 7)
# ---------------------------------------------------------------------------

static func _vertex_count(vertices: Array, binding: Binding) -> int:
	if binding != null:
		return binding.counts.size()
	return vertices.size() / 2


static func _common(a: Attachment, kind: String, name: String, raw: Dictionary) -> Attachment:
	a.type = kind
	a.name = name
	var path = _text(raw, "path", name)
	a.path = path if path != null and path != "" else name
	a.color = _color(raw, "color", [1.0, 1.0, 1.0, 1.0])
	a.sequence = _sequence(raw.get("sequence"))
	return a


static func _load_attachment(name: String, raw: Dictionary, warnings: Warnings) -> Attachment:
	var kind: String = _text(raw, "type", "")
	if kind == "region":
		var r := RegionAttachment.new()
		_common(r, kind, name, raw)
		r.x = _number(raw, "x", 0)
		r.y = _number(raw, "y", 0)
		r.rotation = _number(raw, "rotation", 0)
		r.scale_x = _number(raw, "scaleX", 1)
		r.scale_y = _number(raw, "scaleY", 1)
		r.width = _number(raw, "width", 0)
		r.height = _number(raw, "height", 0)
		return r
	if kind == "mesh" or kind == "linkedmesh":
		var m := MeshAttachment.new()
		_common(m, kind, name, raw)
		m.vertices = _floats(raw.get("vertices"))
		m.binding = _binding(raw.get("binding"))
		m.uvs = _floats(raw.get("uvs"))
		m.triangles = _ints(raw.get("triangles"))
		m.hull = _integer(raw, "hull", 0)
		m.edges = _ints(raw.get("edges"))
		m.width = _number(raw, "width", 0)
		m.height = _number(raw, "height", 0)
		m.vertex_count = _vertex_count(m.vertices, m.binding)
		if kind == "linkedmesh":
			m.link_parent = _text(raw, "parent", "")
			m.link_skin = _text(raw, "skin", "default")
			m.inherit_deform = _flag(raw, "inheritDeform", true)
		return m
	if kind == "boundingbox":
		var shape: String = _text(raw, "shape", "polygon")
		if not shape in ["polygon", "rectangle", "ellipse"]:
			warnings.add("boundingbox com shape desconhecido: " + shape)
			return null
		var bb := BoundingBoxAttachment.new()
		_common(bb, kind, name, raw)
		bb.shape = shape
		bb.vertices = _floats(raw.get("vertices"))
		bb.binding = _binding(raw.get("binding"))
		bb.x = _number(raw, "x", 0)
		bb.y = _number(raw, "y", 0)
		bb.width = _number(raw, "width", 0)
		bb.height = _number(raw, "height", 0)
		bb.rotation = _number(raw, "rotation", 0)
		bb.vertex_count = _vertex_count(bb.vertices, bb.binding)
		return bb
	if kind == "clipping":
		var c := ClippingAttachment.new()
		_common(c, kind, name, raw)
		c.end = _text(raw, "end", null)
		var slots = raw.get("slots")
		c.slots = _strings(slots) if typeof(slots) == TYPE_ARRAY else null
		c.invert = _flag(raw, "invert", false)
		c.vertices = _floats(raw.get("vertices"))
		c.binding = _binding(raw.get("binding"))
		c.vertex_count = _vertex_count(c.vertices, c.binding)
		return c
	if kind == "path":
		var p := PathAttachment.new()
		_common(p, kind, name, raw)
		p.closed = _flag(raw, "closed", false)
		p.constant_speed = _flag(raw, "constantSpeed", true)
		p.lengths = _floats(raw.get("lengths"))
		p.vertices = _floats(raw.get("vertices"))
		p.binding = _binding(raw.get("binding"))
		p.vertex_count = _vertex_count(p.vertices, p.binding)
		return p
	if kind == "point":
		var pt := PointAttachment.new()
		_common(pt, kind, name, raw)
		pt.x = _number(raw, "x", 0)
		pt.y = _number(raw, "y", 0)
		pt.rotation = _number(raw, "rotation", 0)
		return pt
	if kind == "skeleton":
		var sk := SkeletonAttachment.new()
		_common(sk, kind, name, raw)
		var uri = _text(raw, "uri", "")
		sk.uri = uri if uri != null else ""
		sk.skins = _strings(raw.get("skins"))
		sk.animation = _text(raw, "animation", null)
		sk.loop = _flag(raw, "loop", true)
		sk.time_scale = _number(raw, "timeScale", 1)
		sk.x = _number(raw, "x", 0)
		sk.y = _number(raw, "y", 0)
		sk.rotation = _number(raw, "rotation", 0)
		sk.scale_x = _number(raw, "scaleX", 1)
		sk.scale_y = _number(raw, "scaleY", 1)
		sk.inherit_color = _flag(raw, "inheritColor", true)
		sk.inherit_animation = _flag(raw, "inheritAnimation", false)
		sk.base_animation = _text(raw, "baseAnimation", null)
		sk.around = _text(raw, "around", null)
		return sk
	if kind == "BONE_particle":
		var pa := ParticleAttachment.new()
		_common(pa, kind, name, raw)
		return _load_particle(pa, raw, warnings)
	# Seção 2.5: tipo de anexo desconhecido deixa o placeholder vazio.
	warnings.add("tipo de attachment desconhecido, placeholder vazio: " + kind)
	return null


static func _range(source: Dictionary, key: String, default_value: Array) -> Array:
	var value = source.get(key)
	if typeof(value) == TYPE_ARRAY and value.size() >= 2 and is_number(value[0]) and is_number(value[1]):
		return [float(value[0]), float(value[1])]
	return default_value.duplicate()


static func _vector(source: Dictionary, key: String, default_value: Array) -> Array:
	var value = source.get(key)
	var size := default_value.size()
	if typeof(value) == TYPE_ARRAY and value.size() >= size:
		var out: Array = []
		for i in range(size):
			if not is_number(value[i]):
				return default_value.duplicate()
			out.append(float(value[i]))
		return out
	return default_value.duplicate()


## 2.5 da extensão (7.4): valor desconhecido cai no padrão declarado E avisa.
static func _enum(source: Dictionary, key: String, allowed: Array, default_value: String,
		warnings: Warnings, where: String) -> String:
	var value = source.get(key)
	if value == null:
		return default_value
	var text := _str(value)
	if text in allowed:
		return text
	warnings.add("%s desconhecido, usando %s: %s" % [where, default_value, text])
	return default_value


## `scaleOverLifetime`, `colorOverLifetime`, `alphaOverLifetime` (9.6, 9.7): as
## chaves de 9.2-9.3, com `time` em 0..1 da vida no lugar de segundos.
static func _lifetime_keys(raw, components: int):
	if typeof(raw) != TYPE_ARRAY or raw.is_empty():
		return null
	var keys: Array = []
	for k in raw:
		if typeof(k) == TYPE_DICTIONARY:
			keys.append(_load_key(k, "BONE_particle", components))
	if keys.is_empty():
		return null
	_ordenar_estavel(keys, "time")
	return keys


## O anexo `BONE_particle` da extensão `BONE_particles`, 9.
static func _load_particle(p: ParticleAttachment, raw: Dictionary, warnings: Warnings) -> ParticleAttachment:
	for entry in _list(raw.get("bursts")):
		if typeof(entry) != TYPE_DICTIONARY:
			continue
		var b := Burst.new()
		b.time = _number(entry, "time", 0)
		b.count = maxi(1, _integer(entry, "count", 1))
		b.cycles = maxi(1, _integer(entry, "cycles", 1))
		b.interval = _number(entry, "interval", 1)
		b.probability = _number(entry, "probability", 1)
		p.bursts.append(b)

	var shape = _text(raw, "shape", "point")
	if shape == null or shape == "":
		shape = "point"
	p.shape = shape
	# `path` é a 1.1 da extensão (9.4.2): a forma "ao longo de um caminho" (G9).
	p.shape_ok = shape in ["point", "circle", "rectangle", "edge", "bone", "mesh", "path"]
	if not p.shape_ok:
		# 7.4: o ÚNICO recuo que não escolhe um padrão. Forma desconhecida
		# mudaria o desenho inteiro: o emissor não se desenha.
		warnings.add("forma de emissor desconhecida, emissor nao desenhado: " + _str(shape))

	var start_colors = raw.get("startColor")
	var cores_ok: bool = typeof(start_colors) == TYPE_ARRAY and start_colors.size() >= 2
	if cores_ok:
		for c in start_colors.slice(0, 2):
			if typeof(c) != TYPE_ARRAY or c.size() < 4:
				cores_ok = false
	if cores_ok:
		p.start_color = []
		for c in start_colors.slice(0, 2):
			p.start_color.append(_floats(c.slice(0, 4)))

	if _flag(raw, "looping", true) and _number(raw, "prewarm", 0) > 0:
		# 6: em laço as voltas já enchem o emissor; `prewarm` se ignora, e avisa.
		warnings.add("prewarm ignorado: so vale com looping false")

	p.emitting = _flag(raw, "emitting", true)
	p.rate = _number(raw, "rate", 10)
	p.explosiveness = _number(raw, "explosiveness", 0)
	p.duration = _number(raw, "duration", 1)
	p.randomness = _number(raw, "randomness", 0)
	p.start_delay = _number(raw, "startDelay", 0)
	p.lifetime = _range(raw, "lifetime", [1.0, 1.0])
	p.max_particles = maxi(1, _integer(raw, "maxParticles", 1000))
	p.speed = _range(raw, "speed", [100.0, 100.0])
	p.direction = _number(raw, "direction", 90)
	p.spread = _number(raw, "spread", 0)
	p.x = _number(raw, "x", 0)
	p.y = _number(raw, "y", 0)
	p.rotation = _number(raw, "rotation", 0)
	p.spherize_direction = _number(raw, "spherizeDirection", 0)
	p.align_to_velocity = _flag(raw, "alignToVelocity", false)
	p.radius = _number(raw, "radius", 0)
	p.radius_thickness = _number(raw, "radiusThickness", 1)
	p.arc = _number(raw, "arc", 360)
	p.size = _vector(raw, "size", [0.0, 0.0])
	p.edge = _vector(raw, "edge", [0.0, 0.0, 0.0, 0.0])
	p.mesh = _text(raw, "mesh", null)
	p.curve = _text(raw, "curve", null)
	p.mesh_mode = _enum(raw, "meshMode", ["vertex", "edge", "triangle"], "vertex", warnings, "meshMode de emissor")
	p.gravity = _vector(raw, "gravity", [0.0, 0.0])
	p.drag = _number(raw, "drag", 0)
	p.angle = _range(raw, "angle", [0.0, 0.0])
	p.angular_velocity = _range(raw, "angularVelocity", [0.0, 0.0])
	p.scale = _range(raw, "scale", [1.0, 1.0])
	p.scale_over_lifetime = _lifetime_keys(raw.get("scaleOverLifetime"), 1)
	p.color_over_lifetime = _lifetime_keys(raw.get("colorOverLifetime"), 4)
	p.alpha_over_lifetime = _lifetime_keys(raw.get("alphaOverLifetime"), 1)
	p.frame_mode = _enum(raw, "frameMode", ["lifetime", "fps"], "lifetime", warnings, "frameMode de emissor")
	p.cycles = _number(raw, "cycles", 1)
	p.fps = _number(raw, "fps", 12)
	p.start_frame = _range(raw, "startFrame", [0.0, 0.0])
	p.space = _enum(raw, "space", ["local", "world"], "local", warnings, "space de emissor")
	p.seed = _integer(raw, "seed", 0)
	p.looping = _flag(raw, "looping", true)
	p.prewarm = _number(raw, "prewarm", 0)
	p.sort_mode = _enum(raw, "sortMode", ["youngestInFront", "oldestInFront"], "youngestInFront", warnings, "sortMode de emissor")
	return p


# ---------------------------------------------------------------------------
# Cantos e UV da região (7.3 + 10.4)
# ---------------------------------------------------------------------------

## Os nomes de região que o anexo pode mostrar, na ordem dos quadros (7.10).
static func _frame_names(attachment: Attachment) -> Array:
	var sequence := attachment.sequence
	if sequence == null:
		return [attachment.path]
	var out: Array = []
	for i in range(sequence.count):
		out.append(sequence.frame_name(attachment.path, i))
	return out


static func _setup_frame(attachment: Attachment, total: int) -> int:
	var sequence := attachment.sequence
	if sequence == null:
		return 0
	return sequence.setup if sequence.setup >= 0 and sequence.setup < total else 0


static func _prepare_region(attachment: RegionAttachment, atlases: Array) -> void:
	var frames: Array = []
	for n in _frame_names(attachment):
		frames.append(_region_frame(attachment, AtlasJs.find_region(atlases, n)))
	attachment.frames = frames
	var f: Array = frames[_setup_frame(attachment, frames.size())]
	attachment.region = f[0]
	attachment.local_corners = f[1]
	attachment.page_uvs = f[2]


## Rodada G7, só do desenho (não está no `loader.py`; vem do `particleRegion` e
## do `computeRegionFrame` do runtime TypeScript): a imagem da partícula é uma
## região do atlas sem deslocamento, giro nem escala própria (9.6 da extensão).
## Um quadro por nome da sequência; quadro sem região fica [null, [], []] e o
## desenhador avisa.
static func _prepare_particle(attachment: ParticleAttachment, atlases: Array) -> void:
	var molde := RegionAttachment.new()
	var frames: Array = []
	for n in _frame_names(attachment):
		var region = AtlasJs.find_region(atlases, n)
		if region == null or region.page == null:
			frames.append([null, [], []])
		else:
			frames.append(_region_frame(molde, region))
	attachment.frames = frames


## Os cantos e os UV da página de um quadro (7.3 + 10.4).
static func _region_frame(attachment: RegionAttachment, region) -> Array:
	var x0: float
	var y0: float
	var x1: float
	var y1: float
	var page_uvs: Array = []
	if region != null and region.page != null:
		var scale: float = region.scale if region.scale != 0.0 else 1.0
		var original_w: float = region.original_width / scale
		var original_h: float = region.original_height / scale
		var width: float = attachment.width if attachment.width != 0.0 else original_w
		var height: float = attachment.height if attachment.height != 0.0 else original_h
		var rw: float = region.width / scale
		var rh: float = region.height / scale
		var ox: float = region.offset_x / scale
		var oy: float = region.offset_y / scale
		var kx: float = width / original_w if original_w != 0.0 else 1.0
		var ky: float = height / original_h if original_h != 0.0 else 1.0
		x0 = (-original_w / 2 + ox) * kx
		y0 = (-original_h / 2 + oy) * ky
		x1 = x0 + rw * kx
		y1 = y0 + rh * ky
		var ow: float = region.original_width
		var oh: float = region.original_height
		var u0: float = region.offset_x / ow if ow != 0.0 else 0.0
		var u1: float = (region.offset_x + region.width) / ow if ow != 0.0 else 1.0
		var v1: float = 1 - (region.offset_y / oh) if oh != 0.0 else 1.0
		var v0: float = 1 - ((region.offset_y + region.height) / oh) if oh != 0.0 else 0.0
		for uv in [[u0, v1], [u1, v1], [u1, v0], [u0, v0]]:
			page_uvs.append_array(region.uv(uv[0], uv[1]))
	else:
		# Sem atlas: a imagem inteira é a região, sem deslocamento (7.3).
		var width := attachment.width
		var height := attachment.height
		x0 = -width / 2
		y0 = -height / 2
		x1 = width / 2
		y1 = height / 2
		page_uvs = [0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0]
	return [region, [x0, y0, x1, y0, x1, y1, x0, y1], page_uvs]


static func _prepare_mesh(attachment: MeshAttachment, atlases: Array) -> void:
	var frames: Array = []
	for n in _frame_names(attachment):
		frames.append(_mesh_frame(attachment, AtlasJs.find_region(atlases, n)))
	attachment.frames = frames
	var f: Array = frames[_setup_frame(attachment, frames.size())]
	attachment.region = f[0]
	attachment.page_uvs = f[1]


## Os UV da página de um quadro de malha (10.4).
static func _mesh_frame(attachment: MeshAttachment, region) -> Array:
	var uvs := attachment.uvs
	if region != null and region.page != null:
		var out: Array = []
		var i := 0
		while i < uvs.size() - 1:
			out.append_array(region.uv(uvs[i], uvs[i + 1]))
			i += 2
		return [region, out]
	return [region, uvs.duplicate()]


# ---------------------------------------------------------------------------
# Timelines
# ---------------------------------------------------------------------------

const _COMPONENTS := {"color": 4, "darkColor": 3}
const _EVENT_FIELDS := ["int", "float", "string", "volume", "balance"]


static func _all_numbers(value) -> bool:
	if typeof(value) != TYPE_ARRAY:
		return false
	for v in value:
		if not is_number(v):
			return false
	return true


static func _curve(raw: Dictionary, components: int, value):
	var curve = raw.get("curve")
	# Uma lista VAZIA conta como número (9.6: no `deform`, `value: []` é
	# "sem deform", uma fileira de zeros). Ver o comentário do loader.py.
	var interpolable: bool = is_number(value) or _all_numbers(value)
	if curve == null:
		return "linear" if interpolable else "stepped"
	if typeof(curve) == TYPE_STRING:
		if curve == "stepped":
			return "stepped"
		if curve == "linear":
			return "linear" if interpolable else "stepped"
		# Seção 2.5: curva desconhecida é linear, ou stepped para não-números.
		return "linear" if interpolable else "stepped"
	if typeof(curve) == TYPE_ARRAY and curve.size() == 4 * components and interpolable:
		return _floats(curve)
	return "linear" if interpolable else "stepped"


static func _load_key(raw: Dictionary, kind: String, components: int) -> KeyData:
	var key := KeyData.new()
	key.time = _number(raw, "time", 0)
	key.offset = _integer(raw, "offset", 0)
	if kind == "event":
		key.event = _text(raw, "event", null)
		for n in _EVENT_FIELDS:
			if raw.has(n):
				key.payload[n] = raw[n]
		key.curve = "stepped"
		return key
	key.value = raw.get("value")
	key.curve = _curve(raw, components, key.value)
	if kind == "slot/bone":
		# 9.5: sempre stepped; `transform` vale a identidade quando falta.
		key.curve = "stepped"
		var raw_transform = raw.get("transform")
		if typeof(raw_transform) == TYPE_DICTIONARY and key.value != null:
			key.transform = [
				_number(raw_transform, "x", 0), _number(raw_transform, "y", 0),
				_number(raw_transform, "rotation", 0),
				_number(raw_transform, "scaleX", 1), _number(raw_transform, "scaleY", 1),
			]
	elif kind == "body":
		# 9.13: só stepped; `keepSkins` vale true.
		key.curve = "stepped"
		key.keep_skins = _flag(raw, "keepSkins", true)
	return key


static func _load_timeline(raw: Dictionary, data: SkeletonData, warnings: Warnings) -> Timeline:
	var kind: String = _text(raw, "type", "")
	if not kind in TIMELINE_TYPES:
		warnings.add("tipo de timeline desconhecido, ignorada: " + kind)
		return null
	var prop = _text(raw, "property", null)
	var target = _text(raw, "target", null)

	if kind == "bone":
		if not prop in BONE_PROPERTIES and not prop in INHERIT_PROPERTIES and prop != "parent":
			warnings.add("propriedade de osso desconhecida, timeline ignorada: " + _str(prop))
			return null
		if prop == "parent":
			# 9.4: nome de osso ou null, stepped; nome desconhecido é L1 e a
			# timeline é ignorada (4.7).
			for raw_key in _list(raw.get("keys")):
				var value = raw_key.get("value") if typeof(raw_key) == TYPE_DICTIONARY else null
				if value != null and data.find_bone(_str(value)) == null:
					warnings.add("chave parent aponta para osso inexistente, timeline ignorada: " + _str(value))
					return null
	elif kind == "slot":
		if not prop in ["attachment", "color", "darkColor", "visible", "bone"]:
			warnings.add("propriedade de slot desconhecida, timeline ignorada: " + _str(prop))
			return null
	elif kind == "constraint":
		var constraint := data.find_constraint(target if target != null else "")
		if constraint == null:
			return null
		var allowed: Array = CONSTRAINT_PROPERTIES.get(constraint.type, [])
		if not prop in allowed:
			warnings.add("propriedade fora do tipo da constraint, ignorada: " + _str(prop))
			return null
	elif kind == "parameter" or kind == "morph":
		if not prop in ["value", "weight"]:
			return null
	elif kind == "nested":
		if not prop in ["animation", "time", "timeScale"]:
			return null
	elif kind == "BONE_particle":
		if not prop in PARTICLE_PROPERTIES:
			warnings.add("propriedade de emissor desconhecida, timeline ignorada: " + _str(prop))
			return null
		if prop == "rate":
			# 4.1: na primeira fase `rate` é número fixo, e o que anima é
			# `emitting`. Animá-lo pede o ramo `linear` da integral (4.2).
			warnings.add("rate animado e de 2a fase: fica o numero do anexo")
			return null

	var components: int
	if kind == "BONE_particle":
		components = PARTICLE_PROPERTIES[prop]
	else:
		components = _COMPONENTS.get(prop if prop != null else "", 1)
	var keys_raw = raw.get("keys")
	if typeof(keys_raw) != TYPE_ARRAY or keys_raw.is_empty():
		return null
	var key_kind := "slot/bone" if (kind == "slot" and prop == "bone") else kind
	var keys: Array = []
	for k in keys_raw:
		if typeof(k) == TYPE_DICTIONARY:
			keys.append(_load_key(k, key_kind, components))
	if keys.is_empty():
		return null
	_ordenar_estavel(keys, "time")
	var tl := Timeline.new()
	tl.type = kind
	tl.target = target
	tl.property = prop
	var skin = _text(raw, "skin", "default")
	tl.skin = skin if skin != null and skin != "" else "default"
	tl.attachment = _text(raw, "attachment", null)
	tl.keys = keys
	tl.components = components
	return tl


static func _load_animation(raw: Dictionary, data: SkeletonData, warnings: Warnings) -> AnimationData:
	var animation := AnimationData.new()
	var name = _text(raw, "name", "")
	animation.name = name if name != null else ""
	animation.loop = _flag(raw, "loop", false)
	var blend = _text(raw, "blend", "replace")
	animation.blend = blend if blend != null and blend != "" else "replace"
	animation.tags = _strings(raw.get("tags"))
	if raw.has("defaultMix"):
		animation.default_mix = _number(raw, "defaultMix", 0)
	for raw_timeline in _list(raw.get("timelines")):
		if typeof(raw_timeline) != TYPE_DICTIONARY:
			continue
		var timeline := _load_timeline(raw_timeline, data, warnings)
		if timeline != null:
			animation.timelines.append(timeline)
	var longest := 0.0
	for timeline in animation.timelines:
		for key in timeline.keys:
			longest = maxf(longest, key.time)
	animation.duration = _number(raw, "duration", longest) if raw.has("duration") else longest
	return animation


# ---------------------------------------------------------------------------
# Regras (rodada G6)
# ---------------------------------------------------------------------------

static func _load_driver_key(raw: Dictionary) -> DriverKey:
	var key := DriverKey.new()
	key.input = _number(raw, "input", 0)
	key.offset = _integer(raw, "offset", 0)
	key.value = raw.get("value")
	key.curve = _curve(raw, 1, key.value)
	return key


static func _str_or(raw: Dictionary, key: String, fallback: String) -> String:
	var v = _text(raw, key, fallback)
	return v if v != null and v != "" else fallback


static func _load_constraint(raw: Dictionary, warnings: Warnings) -> ConstraintData:
	var kind: String = _text(raw, "type", "")
	var names := _strings(raw.get("bones"))
	var c: ConstraintData = null
	if kind == "ik":
		var ik := IkConstraintData.new()
		ik.bones = names
		ik.target = _str_or(raw, "target", "")
		ik.bend_positive = _flag(raw, "bendPositive", true)
		ik.compress = _flag(raw, "compress", false)
		ik.stretch = _flag(raw, "stretch", false)
		ik.uniform = _flag(raw, "uniform", false)
		ik.softness = _number(raw, "softness", 0)
		c = ik
	elif kind == "transform":
		var tr := TransformConstraintData.new()
		tr.bones = names
		tr.target = _str_or(raw, "target", "")
		tr.local = _flag(raw, "local", false)
		tr.relative = _flag(raw, "relative", false)
		tr.offset_rotation = _number(raw, "offsetRotation", 0)
		tr.offset_x = _number(raw, "offsetX", 0)
		tr.offset_y = _number(raw, "offsetY", 0)
		tr.offset_scale_x = _number(raw, "offsetScaleX", 0)
		tr.offset_scale_y = _number(raw, "offsetScaleY", 0)
		tr.offset_shear_y = _number(raw, "offsetShearY", 0)
		tr.mix_rotation = _number(raw, "mixRotation", 1)
		tr.mix_x = _number(raw, "mixX", 1)
		tr.mix_y = _number(raw, "mixY", 1)
		tr.mix_scale_x = _number(raw, "mixScaleX", 1)
		tr.mix_scale_y = _number(raw, "mixScaleY", 1)
		tr.mix_shear_y = _number(raw, "mixShearY", 1)
		c = tr
	elif kind == "path":
		var pa := PathConstraintData.new()
		var position_mode = _text(raw, "positionMode", "percent")
		var spacing_mode = _text(raw, "spacingMode", "length")
		var rotate_mode = _text(raw, "rotateMode", "tangent")
		if not position_mode in ["fixed", "percent"]:
			position_mode = "percent"
		if not spacing_mode in ["length", "fixed", "percent", "proportional"]:
			spacing_mode = "length"
		if not rotate_mode in ["tangent", "chain", "chainScale"]:
			rotate_mode = "tangent"
		pa.bones = names
		pa.target = _str_or(raw, "target", "")
		pa.position_mode = position_mode
		pa.spacing_mode = spacing_mode
		pa.rotate_mode = rotate_mode
		pa.offset_rotation = _number(raw, "offsetRotation", 0)
		pa.position = _number(raw, "position", 0)
		pa.spacing = _number(raw, "spacing", 0)
		pa.mix_rotation = _number(raw, "mixRotation", 1)
		pa.mix_x = _number(raw, "mixX", 1)
		pa.mix_y = _number(raw, "mixY", 1)
		c = pa
	elif kind == "physics":
		var ph := PhysicsConstraintData.new()
		ph.bone = _str_or(raw, "bone", "")
		ph.x = _number(raw, "x", 0)
		ph.y = _number(raw, "y", 0)
		ph.rotation = _number(raw, "rotation", 0)
		ph.scale_x = _number(raw, "scaleX", 0)
		ph.shear_x = _number(raw, "shearX", 0)
		ph.inertia = _number(raw, "inertia", 0.5)
		ph.strength = _number(raw, "strength", 100)
		ph.damping = _number(raw, "damping", 1)
		ph.mass = _number(raw, "mass", 1)
		ph.wind = _number(raw, "wind", 0)
		ph.gravity = _number(raw, "gravity", 0)
		ph.limit = _number(raw, "limit", 5000)
		ph.fps = _number(raw, "fps", 60)
		c = ph
	elif kind == "driver":
		var dr := DriverConstraintData.new()
		var targets_raw = raw.get("targets")
		if typeof(targets_raw) == TYPE_ARRAY:
			dr.targets = []
			for entry in targets_raw:
				if typeof(entry) != TYPE_DICTIONARY:
					continue
				var keys: Array = []
				for k in _list(entry.get("keys")):
					if typeof(k) == TYPE_DICTIONARY:
						keys.append(_load_driver_key(k))
				_ordenar_estavel(keys, "input")
				var tmode = _text(entry, "mode", "replace")
				var t := DriverTarget.new()
				t.type = _str_or(entry, "type", "")
				t.target = _text(entry, "target", null)
				t.property = _text(entry, "property", null)
				t.skin = _str_or(entry, "skin", "default")
				t.attachment = _text(entry, "attachment", null)
				t.mode = tmode if tmode in ["replace", "add"] else "replace"
				t.keys = keys
				dr.targets.append(t)
		var mode = _text(raw, "mode", "replace")
		dr.parameter = _str_or(raw, "parameter", "")
		dr.animation = _text(raw, "animation", null)
		dr.from_value = _number(raw, "from", 0) if raw.has("from") else null
		dr.to_value = _number(raw, "to", 1) if raw.has("to") else null
		dr.time_from = _number(raw, "timeFrom", 0)
		dr.time_to = _number(raw, "timeTo", 0) if raw.has("timeTo") else null
		dr.mode = mode if mode in ["replace", "add"] else "replace"
		c = dr
	else:
		# Seção 2.5: tipo de regra desconhecido é ignorado.
		warnings.add("tipo de constraint desconhecido, ignorada: " + kind)
		return null
	c.type = kind
	c.name = _str_or(raw, "name", "")
	c.mix = _number(raw, "mix", 1)
	c.skin_required = _flag(raw, "skinRequired", false)
	return c


# ---------------------------------------------------------------------------
# O leitor do documento
# ---------------------------------------------------------------------------

## Liga cada `linkedmesh` aos números da malha-mãe (7.5).
static func _link_meshes(data: SkeletonData, warnings: Warnings) -> void:
	for skin in data.skins:
		for slot_name in skin.attachments:
			var placeholders: Dictionary = skin.attachments[slot_name]
			for name in placeholders:
				var attachment = placeholders[name]
				if not attachment is MeshAttachment or attachment.type != "linkedmesh":
					continue
				var parent_skin: SkinData = data.find_skin(attachment.link_skin)
				if parent_skin == null:
					parent_skin = data.find_skin("default")
				var parent = null
				if parent_skin != null:
					parent = parent_skin.attachments.get(slot_name, {}).get(attachment.link_parent)
				if not parent is MeshAttachment or parent.type != "mesh":
					warnings.add("linkedmesh sem parent valido: " + name)
					continue
				attachment.vertices = parent.vertices
				attachment.binding = parent.binding
				attachment.uvs = parent.uvs
				attachment.triangles = parent.triangles
				attachment.hull = parent.hull
				attachment.edges = parent.edges
				attachment.vertex_count = parent.vertex_count
				if attachment.inherit_deform:
					attachment.deform_source = parent


## Monta o modelo a partir de um `.bone` já lido. Devolve {"dados", "erro"}.
static func load_skeleton_document(doc, atlases: Array) -> Dictionary:
	if typeof(doc) != TYPE_DICTIONARY:
		return _erro("o arquivo nao traz um objeto raiz")
	var warnings := Warnings.new()

	var header = doc.get("bone")
	if typeof(header) != TYPE_DICTIONARY:
		return _erro("cabecalho `bone` ausente (2.3)")
	var file_version := _parse_version(header.get("version"))
	var min_version := _parse_version(header.get("minVersion"))
	if file_version[0] > READER_VERSION[0]:
		return _erro("arquivo major %d.%d, leitor %d.%d" % [
			file_version[0], file_version[1], READER_VERSION[0], READER_VERSION[1]])
	if file_version[0] == READER_VERSION[0] and _version_cmp(file_version, READER_VERSION) > 0:
		if _version_cmp(min_version, READER_VERSION) <= 0:
			warnings.add("arquivo mais novo, leitura parcial")
		else:
			warnings.add("arquivo mais novo que o leitor: leitura em melhor esforco")

	# Seção 2.7: extensão exigida e desconhecida para a leitura.
	var missing_ext: Array = []
	for e in _strings(doc.get("extensionsRequired")):
		if not e in SUPPORTED_EXTENSIONS:
			missing_ext.append(e)
	if not missing_ext.is_empty():
		return _erro("extensao exigida e nao suportada (2.7): " + ", ".join(missing_ext))

	var meta := _dict(doc.get("skeleton"))
	var data := SkeletonData.new()
	var sname = _text(meta, "name", "")
	data.name = sname if sname != null else ""
	data.fps = _number(meta, "fps", 30)
	data.reference_scale = _number(meta, "referenceScale", 100)
	data.pixel_art = _flag(meta, "pixelArt", false)
	data.atlases = atlases.duplicate()
	data.warnings = warnings

	var raw_bones = doc.get("bones")
	if typeof(raw_bones) != TYPE_ARRAY or raw_bones.is_empty():
		return _erro("o arquivo precisa de pelo menos um osso (2.2)")
	var by_name := {}
	var index := -1
	for raw in raw_bones:
		index += 1
		if typeof(raw) != TYPE_DICTIONARY:
			continue
		var bone := BoneData.new()
		var bname = _text(raw, "name", "bone%d" % index)
		bone.name = bname if bname != null and bname != "" else "bone%d" % index
		bone.index = data.bones.size()
		bone.length = _number(raw, "length", 0)
		bone.x = _number(raw, "x", 0)
		bone.y = _number(raw, "y", 0)
		bone.rotation = _number(raw, "rotation", 0)
		bone.scale_x = _number(raw, "scaleX", 1)
		bone.scale_y = _number(raw, "scaleY", 1)
		bone.shear_x = _number(raw, "shearX", 0)
		bone.shear_y = _number(raw, "shearY", 0)
		bone.inherit_rotation = _flag(raw, "inheritRotation", true)
		bone.inherit_scale = _flag(raw, "inheritScale", true)
		bone.inherit_reflection = _flag(raw, "inheritReflection", true)
		bone.skin_required = _flag(raw, "skinRequired", false)
		var parent_name = _text(raw, "parent", null)
		if parent_name != null:
			var parent: BoneData = by_name.get(parent_name)
			if parent == null:
				# Seção 4.7: pai quebrado ou adiante cai na raiz bones[0].
				warnings.add("osso com pai invalido, preso a raiz: " + bone.name)
				parent = data.bones[0] if not data.bones.is_empty() else null
			bone.parent = parent
		elif not data.bones.is_empty():
			bone.parent = data.bones[0]
		data.bones.append(bone)
		by_name[bone.name] = bone

	index = -1
	for raw in _list(doc.get("slots")):
		index += 1
		if typeof(raw) != TYPE_DICTIONARY:
			continue
		var bone_name = _text(raw, "bone", "")
		var bone: BoneData = by_name.get(bone_name if bone_name != null else "")
		if bone == null:
			warnings.add("slot com osso invalido, preso a raiz: " + _str(raw.get("name")))
			bone = data.bones[0]
		var blend = _text(raw, "blend", "normal")
		if not blend in ["normal", "additive", "multiply", "screen"]:
			warnings.add("blend desconhecido, usando normal: " + _str(blend))
			blend = "normal"
		var slot := SlotData.new()
		var sn = _text(raw, "name", "slot%d" % index)
		slot.name = sn if sn != null and sn != "" else "slot%d" % index
		slot.index = data.slots.size()
		slot.bone = bone
		slot.attachment = _text(raw, "attachment", null)
		slot.color = _color(raw, "color", [1.0, 1.0, 1.0, 1.0])
		slot.dark_color = _color(raw, "darkColor", null)
		slot.blend = blend
		slot.visible = _flag(raw, "visible", true)
		data.slots.append(slot)

	for raw in _list(doc.get("skins")):
		if typeof(raw) != TYPE_DICTIONARY:
			continue
		var skin := SkinData.new()
		var kname = _text(raw, "name", "")
		skin.name = kname if kname != null else ""
		skin.includes = _strings(raw.get("includes"))
		skin.bones = _strings(raw.get("bones"))
		skin.constraints = _strings(raw.get("constraints"))
		for entry in _list(raw.get("drawOrder")):
			if typeof(entry) != TYPE_DICTIONARY or typeof(entry.get("slot")) != TYPE_STRING:
				continue
			var offset = entry.get("offset", 0)
			if not is_number(offset):
				offset = 0
			skin.draw_order.append([entry["slot"], int(offset)])
		var raw_attachments = raw.get("attachments")
		if typeof(raw_attachments) == TYPE_DICTIONARY:
			for slot_name in raw_attachments:
				var placeholders = raw_attachments[slot_name]
				if typeof(placeholders) != TYPE_DICTIONARY:
					continue
				var bucket := {}
				for name in placeholders:
					var raw_attachment = placeholders[name]
					if raw_attachment == null:
						bucket[name] = null  # esconder de propósito (4.4)
					elif typeof(raw_attachment) == TYPE_DICTIONARY:
						bucket[name] = _load_attachment(name, raw_attachment, warnings)
				skin.attachments[slot_name] = bucket
		data.skins.append(skin)

	_link_meshes(data, warnings)
	for skin in data.skins:
		for slot_name in skin.attachments:
			var placeholders: Dictionary = skin.attachments[slot_name]
			for name in placeholders:
				var attachment = placeholders[name]
				if attachment is RegionAttachment:
					_prepare_region(attachment, data.atlases)
				elif attachment is MeshAttachment:
					_prepare_mesh(attachment, data.atlases)
				elif attachment is ParticleAttachment:
					_prepare_particle(attachment, data.atlases)

	for raw in _list(doc.get("constraints")):
		if typeof(raw) != TYPE_DICTIONARY:
			continue
		var constraint := _load_constraint(raw, warnings)
		if constraint != null:
			data.constraints.append(constraint)

	for raw in _list(doc.get("events")):
		if typeof(raw) != TYPE_DICTIONARY:
			continue
		var ev := EventDef.new()
		var en = _text(raw, "name", "")
		ev.name = en if en != null else ""
		ev.int_value = _integer(raw, "int", 0)
		ev.float_value = _number(raw, "float", 0)
		var es = _text(raw, "string", "")
		ev.string_value = es if es != null else ""
		ev.audio = _text(raw, "audio", null)
		ev.volume = _number(raw, "volume", 1)
		ev.balance = _number(raw, "balance", 0)
		data.events.append(ev)

	for raw in _list(doc.get("parameters")):
		if typeof(raw) != TYPE_DICTIONARY:
			continue
		var source: ParameterSource = null
		var raw_source = raw.get("source")
		if typeof(raw_source) == TYPE_DICTIONARY:
			var sprop = _text(raw_source, "property", "")
			if sprop in BONE_PROPERTIES:
				source = ParameterSource.new()
				var sb = _text(raw_source, "bone", "")
				source.bone = sb if sb != null else ""
				source.property = sprop
				source.from_value = _number(raw_source, "from", 0)
				source.to_value = _number(raw_source, "to", 1)
			else:
				warnings.add("source com propriedade desconhecida, ignorada: " + _str(sprop))
		var p := ParameterData.new()
		var pn = _text(raw, "name", "")
		p.name = pn if pn != null else ""
		p.min = _number(raw, "min", 0)
		p.max = _number(raw, "max", 1)
		p.default = _number(raw, "default", 0)
		p.repeat = _flag(raw, "repeat", false)
		p.source = source
		data.parameters.append(p)

	for raw in _list(doc.get("morphs")):
		if typeof(raw) != TYPE_DICTIONARY:
			continue
		var morph := MorphData.new()
		for entry in _list(raw.get("targets")):
			if typeof(entry) != TYPE_DICTIONARY:
				continue
			var t := MorphTarget.new()
			var ts = _text(entry, "slot", "")
			t.slot = ts if ts != null else ""
			var ta = _text(entry, "attachment", "")
			t.attachment = ta if ta != null else ""
			var tk = _text(entry, "skin", "default")
			t.skin = tk if tk != null and tk != "" else "default"
			t.offsets = _floats(entry.get("offsets"))
			morph.targets.append(t)
		var mn = _text(raw, "name", "")
		morph.name = mn if mn != null else ""
		morph.weight = _number(raw, "weight", 0)
		morph.min = _number(raw, "min", 0)
		morph.max = _number(raw, "max", 1)
		data.morphs.append(morph)

	for raw in _list(doc.get("variables")):
		if typeof(raw) != TYPE_DICTIONARY:
			continue
		var vkind = _text(raw, "type", "float")
		if not vkind in ["float", "int", "string", "bool"]:
			warnings.add("tipo de variavel desconhecido, ignorada: " + _str(vkind))
			continue
		var default_value = raw.get("default")
		if default_value == null:
			default_value = {"float": 0.0, "int": 0, "string": "", "bool": false}[vkind]
		var v := VariableData.new()
		var vn = _text(raw, "name", "")
		v.name = vn if vn != null else ""
		v.type = vkind
		v.default = default_value
		data.variables.append(v)

	data.tags = _strings(doc.get("tags"))

	for raw in _list(doc.get("animations")):
		if typeof(raw) == TYPE_DICTIONARY:
			data.animations.append(_load_animation(raw, data, warnings))

	return {"dados": data, "erro": ""}


static func _erro(texto: String) -> Dictionary:
	return {"dados": null, "erro": texto}


# ---------------------------------------------------------------------------
# A entrada por bytes (2.8, 2.9)
# ---------------------------------------------------------------------------

## Texto UTF-8 (sem o BOM) para JSON. Devolve {"doc", "erro"}.
static func parse_text(bytes: PackedByteArray) -> Dictionary:
	var text := bytes.get_string_from_utf8()
	if text.begins_with("﻿"):
		text = text.substr(1)
	var json := JSON.new()
	if json.parse(text) != OK:
		return {"doc": null, "erro": "JSON invalido na linha %d: %s" % [json.get_error_line(), json.get_error_message()]}
	return {"doc": json.data, "erro": ""}


## Lê o arquivo a partir dos bytes. `resolve` recebe um caminho relativo ao
## arquivo e devolve os bytes (PackedByteArray) ou null quando falta (2.8:
## arquivo que falta nunca é fatal). Devolve {"dados": SkeletonData, "erro"}.
static func load_skeleton_bytes(bytes: PackedByteArray, resolve: Callable) -> Dictionary:
	var d := _doc_and_resolver(bytes, resolve)
	if d["erro"] != "":
		return _erro(d["erro"])
	return _finish(d["doc"], d["resolve"], {}, [], "", true)


## O documento dentro de qualquer dos três empacotamentos (rodada G8), e o
## resolvedor que responde pela pasta DELE (2.8: dentro de um `.bonez`, a
## pasta do `main`). Devolve {"doc", "resolve", "erro"}.
static func _doc_and_resolver(bytes: PackedByteArray, resolve: Callable) -> Dictionary:
	if Bin.is_boneb(bytes):
		var b := Bin.parse_boneb(bytes)
		if b["erro"] != "":
			return {"doc": null, "resolve": resolve, "erro": b["erro"]}
		return {"doc": b["doc"], "resolve": resolve, "erro": ""}
	if bytes.size() >= 4 and bytes[0] == 0x50 and bytes[1] == 0x4B and bytes[2] == 0x03 and bytes[3] == 0x04:
		var z := _open_bonez(bytes)
		if z["erro"] != "":
			return {"doc": null, "resolve": resolve, "erro": z["erro"]}
		return {"doc": z["doc"], "resolve": z["resolve"], "erro": ""}
	var lido := parse_text(bytes)
	if lido["erro"] != "":
		return {"doc": null, "resolve": resolve, "erro": lido["erro"]}
	return {"doc": lido["doc"], "resolve": resolve, "erro": ""}


# ---------------------------------------------------------------------------
# O `.bonez` (2.9). Copiado do `_open_bonez` do loader.py (rodada G8).
#
# Diferença que o Godot obriga: o `ZIPReader` só abre por CAMINHO de arquivo,
# e o leitor recebe bytes. Gravar um temporário seria escrever fora do projeto
# do jogo; então o zip se lê aqui, pelo diretório central (o mesmo que o
# `zipfile` do Python lê). O deflate cru de cada entrada ganha um envelope
# gzip feito com o CRC32 e o tamanho que o próprio zip guarda, e o
# `decompress` do Godot abre.
# ---------------------------------------------------------------------------

## As entradas do zip, na ordem do diretório central. Devolve {"nomes", "entradas", "erro"}.
static func _zip_entradas(d: PackedByteArray) -> Dictionary:
	var fim := -1
	var i := d.size() - 22
	while i >= maxi(0, d.size() - 65557):
		if d.decode_u32(i) == 0x06054b50:
			fim = i
			break
		i -= 1
	if fim < 0:
		return {"erro": "zip sem diretorio central"}
	var total := d.decode_u16(fim + 10)
	var p := d.decode_u32(fim + 16)
	var nomes: Array = []
	var entradas := {}
	for _k in range(total):
		if p + 46 > d.size() or d.decode_u32(p) != 0x02014b50:
			return {"erro": "diretorio central do zip quebrado"}
		var metodo := d.decode_u16(p + 10)
		var crc := d.decode_u32(p + 16)
		var csize := d.decode_u32(p + 20)
		var usize := d.decode_u32(p + 24)
		var nlen := d.decode_u16(p + 28)
		var xlen := d.decode_u16(p + 30)
		var clen := d.decode_u16(p + 32)
		var local := d.decode_u32(p + 42)
		var nome := d.slice(p + 46, p + 46 + nlen).get_string_from_utf8()
		if local + 30 > d.size():
			return {"erro": "entrada do zip fora do arquivo: " + nome}
		var inicio := local + 30 + d.decode_u16(local + 26) + d.decode_u16(local + 28)
		nomes.append(nome)
		entradas[nome] = [metodo, crc, csize, usize, inicio]
		p += 46 + nlen + xlen + clen
	return {"nomes": nomes, "entradas": entradas, "erro": ""}


## Os bytes de uma entrada, ou null (método que não seja guardado ou deflate).
static func _zip_ler(d: PackedByteArray, e: Array):
	var corpo := d.slice(e[4], e[4] + e[2])
	if e[0] == 0:
		return corpo
	if e[0] != 8:
		return null
	if e[3] == 0:
		return PackedByteArray()
	var gz := PackedByteArray([0x1f, 0x8b, 8, 0, 0, 0, 0, 0, 0, 0xff])
	gz.append_array(corpo)
	var cauda := PackedByteArray()
	cauda.resize(8)
	cauda.encode_u32(0, e[1])
	cauda.encode_u32(4, e[3])
	gz.append_array(cauda)
	var out := gz.decompress(e[3], FileAccess.COMPRESSION_GZIP)
	return out if out.size() == e[3] else null


## O `posixpath.normpath` do Python, para caminhos de dentro do zip.
static func _normpath(path: String) -> String:
	var out: Array = []
	for parte in path.split("/"):
		if parte == "" or parte == ".":
			continue
		if parte == "..":
			if not out.is_empty() and out[-1] != "..":
				out.pop_back()
			else:
				out.append("..")
			continue
		out.append(parte)
	return "/".join(out) if not out.is_empty() else "."


## Devolve {"doc", "resolve", "erro"}.
static func _open_bonez(data: PackedByteArray) -> Dictionary:
	var z := _zip_entradas(data)
	if z["erro"] != "":
		return {"erro": z["erro"]}
	var names: Array = z["nomes"]
	var entradas: Dictionary = z["entradas"]
	if names.is_empty() or names[0] != "mimetype":
		return {"erro": "a primeira entrada do .bonez deve ser `mimetype` (2.9)"}
	var mime = _zip_ler(data, entradas["mimetype"])
	var mimetype: String = mime.get_string_from_ascii() if mime != null else ""
	if mimetype != "application/vnd.bone+zip":
		return {"erro": "mimetype inesperado no .bonez: " + mimetype}
	if not entradas.has("manifest.json"):
		return {"erro": "manifest.json sem `main` (2.9)"}
	var raw_manifest = _zip_ler(data, entradas["manifest.json"])
	var manifest = parse_text(raw_manifest)["doc"] if raw_manifest != null else null
	var main = manifest.get("main") if typeof(manifest) == TYPE_DICTIONARY else null
	if typeof(main) != TYPE_STRING:
		return {"erro": "manifest.json sem `main` (2.9)"}
	var base: String = main.get_base_dir()

	var resolve := func(uri: String):
		var candidate: String = _normpath(base + "/" + uri) if base != "" else uri
		if not entradas.has(candidate):
			return null
		return _zip_ler(data, entradas[candidate])

	if not entradas.has(main):
		return {"erro": "o `main` do manifest nao esta no .bonez: " + main}
	var raw_main = _zip_ler(data, entradas[main])
	if raw_main == null:
		return {"erro": "nao consegui ler o `main` do .bonez: " + main}
	if Bin.is_boneb(raw_main):
		var b := Bin.parse_boneb(raw_main)
		if b["erro"] != "":
			return {"erro": b["erro"]}
		return {"doc": b["doc"], "resolve": resolve, "erro": ""}
	var lido := parse_text(raw_main)
	if lido["erro"] != "":
		return {"erro": lido["erro"]}
	return {"doc": lido["doc"], "resolve": resolve, "erro": ""}


## `ctx` é o `_Context` do Python: {"cache": {caminho: SkeletonData}}, um
## por carga do projeto, para cada arquivo ser lido uma vez só. `chain` são
## os arquivos de cima (o ciclo e a profundidade de 12.6); `where`, o caminho
## deste arquivo a partir do primeiro.
static func _finish(doc, resolve: Callable, ctx: Dictionary = {}, chain: Array = [],
		where: String = "", load_bodies: bool = true) -> Dictionary:
	if not ctx.has("cache"):
		ctx["cache"] = {}
	if typeof(doc) != TYPE_DICTIONARY:
		return _erro("o arquivo nao traz um objeto raiz")
	var atlases: Array = []
	var assets := _dict(doc.get("assets"))
	var missing: Array = []
	var avisos_de_fora: Array = []
	if resolve.is_valid():
		for uri in _list(assets.get("atlases")):
			var raw = resolve.call(_str(uri))
			if raw != null:
				var lido := parse_text(raw)
				if lido["erro"] == "" and typeof(lido["doc"]) == TYPE_DICTIONARY:
					atlases.append(AtlasJs.load_atlas(lido["doc"]))
				else:
					missing.append(_str(uri))
			else:
				missing.append(_str(uri))
	var base = _text(assets, "skeletonsBase", "")
	if base == null:
		base = ""

	# 2.8: a skin de fora traz osso, slot e regra PARA DENTRO deste corpo, no
	# fim dos arrays. Isso vem antes de montar o corpo (rodada G4).
	var skin_files := _read_external(doc, "skins", base, resolve, missing)
	var merged := _merge_skin_structure(doc, skin_files)
	doc = merged[0]
	avisos_de_fora.append_array(merged[1])

	var r := load_skeleton_document(doc, atlases)
	if r["dados"] == null:
		return r
	var data: SkeletonData = r["dados"]
	data.skeletons_base = base
	data.rig = _dict(doc.get("rig"))
	data.missing.append_array(missing)
	for nota in avisos_de_fora:
		data.warnings.add(nota)
	for sf in skin_files:
		_import_skins(data, sf[0], sf[1], sf[2], ctx, chain, _full(where, sf[0]))
	for af in _read_external(doc, "animations", base, resolve, data.missing):
		_import_animations(data, af[0], af[1])
	# 7.11 e 9.13 (rodada G5).
	_load_children(data, resolve, ctx, chain, where)
	if load_bodies:
		_load_bodies(data, resolve, ctx, chain, where)
	return r


# ---------------------------------------------------------------------------
# Arquivos de fora: skin e animação (2.8). Copiado do loader.py (rodada G4):
# `_join`, `_sub_resolver`, `_read_file`, `_read_external`, `_rig_check`,
# `_merge_skin_structure`, `_import_skins`, `_scaled_animation`,
# `_import_animations`. O `_Context` e a `chain` vieram na G5, com o
# `_full`, o `_load_child_file`, o `_load_children` e o `_load_bodies`.
# ---------------------------------------------------------------------------

static func _join(base: String, name: String) -> String:
	if base == "":
		return name
	if not base.ends_with("/"):
		base += "/"
	return base + name


## Um resolvedor para o arquivo em `path`: os uris dele se resolvem na pasta DELE.
static func _sub_resolver(resolve: Callable, path: String) -> Callable:
	var folder := path.get_base_dir()
	if not resolve.is_valid() or folder == "":
		return resolve
	return func(uri: String): return resolve.call(folder + "/" + uri)


## [doc, resolvedor] ou null (arquivo quebrado conta como faltando).
static func _read_file(path: String, resolve: Callable):
	if not resolve.is_valid():
		return null
	var raw = resolve.call(path)
	if raw == null:
		return null
	# G5: os três empacotamentos, como o `_doc_and_resolver` do Python (antes
	# só o texto: um filho `.boneb` ou `.bonez` contava como faltando).
	var d := _doc_and_resolver(raw, _sub_resolver(resolve, path))
	if d["erro"] != "" or typeof(d["doc"]) != TYPE_DICTIONARY:
		return null
	return [d["doc"], d["resolve"]]


## O caminho de `path`, citado pelo arquivo em `where`, a partir do primeiro.
static func _full(where: String, path: String) -> String:
	var folder := where.get_base_dir()
	return _normpath(folder + "/" + path) if folder != "" else path


static func _read_external(doc: Dictionary, key: String, base: String, resolve: Callable, missing: Array) -> Array:
	var out: Array = []
	for uri in _list(_dict(doc.get("assets")).get(key)):
		var path := _join(base, _str(uri))
		var found = _read_file(path, resolve)
		if found == null:
			missing.append(path)
			continue
		out.append([path, found[0], found[1]])
	return out


static func _rig_check(host: SkeletonData, raw_doc: Dictionary, path: String) -> Dictionary:
	var warnings := host.warnings
	var rig := _dict(raw_doc.get("rig"))
	for name in _list(rig.get("bones")):
		if host.find_bone(_str(name)) == null:
			warnings.add("RIG_UNMET: %s exige o osso %s" % [path, _str(name)])
	for name in _list(rig.get("slots")):
		if host.find_slot(_str(name)) == null:
			warnings.add("RIG_UNMET: %s exige o slot %s" % [path, _str(name)])
	var ext := _dict(raw_doc.get("assets"))
	if not _list(ext.get("animations")).is_empty() or not _list(ext.get("skins")).is_empty():
		# 2.8: a profundidade é sempre 1; as listas de um arquivo de fora se ignoram.
		warnings.add("EXTERNAL_CHAIN: %s tem assets.animations/skins próprios, ignorados" % path)
	return rig


## 2.8 (F23): o que uma skin de fora traz para o corpo além de skins.
## Devolve [doc, notas].
static func _merge_skin_structure(doc: Dictionary, skin_files: Array) -> Array:
	var notes: Array = []
	if skin_files.is_empty():
		return [doc, notes]
	doc = doc.duplicate()
	var bones: Array = _list(doc.get("bones")).duplicate()
	var slots: Array = _list(doc.get("slots")).duplicate()
	var constraints: Array = _list(doc.get("constraints")).duplicate()
	var local_bones := {}
	for b in bones:
		if typeof(b) == TYPE_DICTIONARY:
			local_bones[b.get("name")] = true
	var local_slots := {}
	for s in slots:
		if typeof(s) == TYPE_DICTIONARY:
			local_slots[s.get("name")] = true
	var local_constraints := {}
	for c in constraints:
		if typeof(c) == TYPE_DICTIONARY:
			local_constraints[c.get("name")] = true
	for sf in skin_files:
		var path: String = sf[0]
		var raw_doc: Dictionary = sf[1]
		var rig := _dict(raw_doc.get("rig"))
		var rig_bones := {}
		for b in _list(rig.get("bones")):
			rig_bones[_str(b)] = true
		var raw_bones: Array = []
		for b in _list(raw_doc.get("bones")):
			if typeof(b) == TYPE_DICTIONARY:
				raw_bones.append(b)
		var brought := {}
		for b in raw_bones:
			if b.get("skinRequired") == true:
				brought[b.get("name")] = true
		for index in range(raw_bones.size()):
			var raw: Dictionary = raw_bones[index]
			var name = raw.get("name")
			if raw.get("skinRequired") != true:
				if index != 0:
					notes.append("EXTERNAL_BONE_NOT_SKIN: %s osso %s ignorado" % [path, _str(name)])
				continue
			if local_bones.has(name):
				notes.append("EXTERNAL_DUPLICATE: %s osso %s; vale o local" % [path, _str(name)])
				continue
			var parent = raw.get("parent")
			if parent != null and not rig_bones.has(parent) and not brought.has(parent):
				notes.append("REF_BONE_MISSING: %s osso %s com pai %s fora do rig" % [path, _str(name), _str(parent)])
			bones.append(raw.duplicate())
			local_bones[name] = true
		for raw in _list(raw_doc.get("slots")):
			if typeof(raw) != TYPE_DICTIONARY:
				continue
			if local_slots.has(raw.get("name")):
				notes.append("EXTERNAL_DUPLICATE: %s slot %s; vale o local" % [path, _str(raw.get("name"))])
				continue
			slots.append(raw.duplicate())
			local_slots[raw.get("name")] = true
		for raw in _list(raw_doc.get("constraints")):
			if typeof(raw) != TYPE_DICTIONARY:
				continue
			if raw.get("skinRequired") != true:
				notes.append("EXTERNAL_BONE_NOT_SKIN: %s regra %s ignorada" % [path, _str(raw.get("name"))])
				continue
			if local_constraints.has(raw.get("name")):
				notes.append("EXTERNAL_DUPLICATE: %s regra %s; vale a local" % [path, _str(raw.get("name"))])
				continue
			constraints.append(raw.duplicate())
			local_constraints[raw.get("name")] = true
	doc["bones"] = bones
	doc["slots"] = slots
	doc["constraints"] = constraints
	return [doc, notes]


static func _import_skins(data: SkeletonData, path: String, raw_doc: Dictionary, sub: Callable,
		ctx: Dictionary, chain: Array, full: String) -> void:
	var warnings := data.warnings
	_rig_check(data, raw_doc, path)
	# Os assets da skin se resolvem no arquivo DELA (2.8): ela é lida como um
	# arquivo próprio, e só as skins ficam.
	var shell := {}
	for key in raw_doc:
		if key != "animations":
			shell[key] = raw_doc[key]
	var ext_assets := {}
	var raw_assets := _dict(raw_doc.get("assets"))
	for key in raw_assets:
		if key != "animations" and key != "skins":
			ext_assets[key] = raw_assets[key]
	shell["assets"] = ext_assets
	var r := _finish(shell, sub, ctx, chain + [full], full, false)
	if r["dados"] == null:
		data.missing.append(path)
		return
	var external: SkeletonData = r["dados"]
	for skin in external.skins:
		if data.find_skin(skin.name) != null:
			warnings.add("EXTERNAL_DUPLICATE: skin %s de %s; vale a primeira" % [skin.name, path])
			continue
		# O `binding` conta ossos pelo NÚMERO no arquivo que o gravou (4.7).
		# Vindo para este corpo, o número se traduz pelo nome do osso.
		var remap := {}
		for i in range(external.bones.size()):
			remap[i] = data.find_bone(external.bones[i].name)
		for slot_name in skin.attachments:
			for name in skin.attachments[slot_name]:
				var attachment = skin.attachments[slot_name][name]
				var binding = attachment.get("binding") if attachment != null else null
				if binding == null:
					continue
				var translated: Array = []
				for i in binding.bones:
					var bone = remap.get(i)
					if bone == null:
						warnings.add("RIG_UNMET: %s binding cita um osso que o corpo não tem" % path)
					translated.append(bone.index if bone != null else 0)
				binding.bones = translated
		data.skins.append(skin)


## 2.8 (F24): os valores de `bone/x` e `bone/y`, e o `cy` das curvas Bézier
## deles, multiplicados por k ao copiar.
static func _scaled_animation(raw: Dictionary, k: float) -> Dictionary:
	if k == 1:
		return raw
	var out := raw.duplicate()
	var timelines: Array = []
	for timeline in _list(raw.get("timelines")):
		if typeof(timeline) == TYPE_DICTIONARY and timeline.get("type") == "bone" \
				and (timeline.get("property") == "x" or timeline.get("property") == "y"):
			timeline = timeline.duplicate()
			var keys: Array = []
			for key in _list(timeline.get("keys")):
				if typeof(key) == TYPE_DICTIONARY:
					key = key.duplicate()
					var value = key.get("value")
					if is_number(value):
						key["value"] = value * k
					var curve = key.get("curve")
					if typeof(curve) == TYPE_ARRAY and curve.size() == 4:
						key["curve"] = [curve[0], curve[1] * k, curve[2], curve[3] * k]
				keys.append(key)
			timeline["keys"] = keys
		timelines.append(timeline)
	out["timelines"] = timelines
	return out


static func _import_animations(data: SkeletonData, path: String, raw_doc: Dictionary) -> void:
	var warnings := data.warnings
	var rig := _rig_check(data, raw_doc, path)
	var k := 1.0
	var reference = rig.get("reference")
	if typeof(reference) == TYPE_DICTIONARY:
		var bone := data.find_bone(_str(reference.get("bone", "")))
		var length = reference.get("length")
		if not is_number(length) or length <= 0:
			warnings.add("RIG_REFERENCE: %s reference.length inválido; k = 1" % path)
		elif bone == null or bone.length == 0:
			warnings.add("RIG_UNMET: %s reference.bone %s; k = 1" % [path, _str(reference.get("bone"))])
		else:
			k = bone.length / float(length)
	for raw in _list(raw_doc.get("animations")):
		if typeof(raw) != TYPE_DICTIONARY:
			continue
		var name = raw.get("name")
		if data.find_animation(_str(name)) != null:
			warnings.add("EXTERNAL_DUPLICATE: animação %s de %s; vale a primeira" % [_str(name), path])
			continue
		data.animations.append(_load_animation(_scaled_animation(raw, k), data, warnings))


# ---------------------------------------------------------------------------
# O esqueleto aninhado (7.11) e os corpos (9.13). Copiado do loader.py
# (rodada G5): `_load_child_file`, `_load_children`, `_load_bodies`.
# ---------------------------------------------------------------------------

static func _load_child_file(path: String, resolve: Callable, ctx: Dictionary, chain: Array,
		where: String, warnings: Warnings) -> SkeletonData:
	var full := _full(where, path)
	if chain.has(full) or (chain.is_empty() and full == where):
		warnings.add("NESTED_CYCLE: %s contém a si mesmo (7.11); parado" % full)
		return null
	if chain.size() >= MAX_NESTING:
		warnings.add("NESTED_DEPTH: %s passa da profundidade %d (12.6)" % [full, MAX_NESTING])
		return null
	var cache: Dictionary = ctx["cache"]
	if cache.has(full):
		return cache[full]
	var found = _read_file(path, resolve)
	if found == null:
		return null
	var r := _finish(found[0], found[1], ctx, chain + [full], full, false)
	if r["dados"] == null:
		warnings.add("arquivo externo recusado, fica invisível: %s: %s" % [full, r["erro"]])
		return null
	cache[full] = r["dados"]
	return r["dados"]


## 7.11: todo anexo `skeleton` ganha o filho carregado, uma vez por arquivo.
static func _load_children(data: SkeletonData, resolve: Callable, ctx: Dictionary, chain: Array,
		where: String) -> void:
	for skin in data.skins:
		for slot_name in skin.attachments:
			for name in skin.attachments[slot_name]:
				var attachment = skin.attachments[slot_name][name]
				if not attachment is SkeletonAttachment or attachment.child != null:
					continue
				var path := _join(data.skeletons_base, attachment.uri)
				attachment.resolved = _full(where, path)
				var child := _load_child_file(path, resolve, ctx, chain, where, data.warnings)
				if child == null:
					if not data.missing.has(path):
						data.missing.append(path)
					data.warnings.add("esqueleto aninhado faltando, placeholder vazio: " + path)
					continue
				attachment.child = child


## 9.13: todo corpo que uma chave `body` cita é montado UMA vez, na carga.
static func _load_bodies(data: SkeletonData, resolve: Callable, ctx: Dictionary, chain: Array,
		where: String) -> void:
	for animation in data.animations:
		for timeline in animation.timelines:
			if timeline.type != "body":
				continue
			for key in timeline.keys:
				var value = key.value
				if typeof(value) != TYPE_STRING or data.bodies.has(value):
					continue
				var path := _join(data.skeletons_base, value)
				var body := _load_child_file(path, resolve, ctx, chain, where, data.warnings)
				if body == null:
					data.warnings.add("BODY_MISSING: corpo %s não carregou; fica o de antes" % value)
					if not data.missing.has(path):
						data.missing.append(path)
					continue
				data.bodies[value] = body

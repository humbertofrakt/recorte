# SPDX-License-Identifier: Apache-2.0
# Copiado de runtime-python/recorte/binary.py (rodada G8, 05/10/2026).
#
# O leitor do empacotamento binário `.boneb` (seção 11 da especificação). O
# arquivo binário é a MESMA árvore do JSON, escrita de forma compacta e que se
# descreve: os nomes moram numa tabela de textos, cada valor leva uma etiqueta
# de tipo, e os números em massa podem morar em blocos canônicos. Ler devolve
# Dictionary, Array e números do GDScript: toda regra das seções 2 a 10 vale
# sem mudar nada.
#
# Diferenças que o GDScript obriga:
#   - não há exceção: o `Leitor` guarda o primeiro erro em `erro`, e quem lê
#     confere depois; `parse_boneb` devolve {"doc", "erro"};
#   - `struct.unpack` vira `PackedByteArray.decode_*` (pequeno-endiano, como o
#     `<` do Python); o `float32` lido vira `float` de 64 bits sem mudar o valor.
@tool
extends RefCounted

const MAGIC := [0x89, 0x42, 0x4F, 0x4E, 0x45, 0x0D, 0x0A, 0x1A]
const KNOWN_LAYOUT_VERSION := 1

# Etiquetas de valor da árvore (11.5).
const T_NULL := 0x00
const T_FALSE := 0x01
const T_TRUE := 0x02
const T_INT := 0x03
const T_FLOAT := 0x04
const T_DOUBLE := 0x05
const T_STRING := 0x06
const T_ARRAY := 0x07
const T_OBJECT := 0x08
const T_F32_ARRAY := 0x09
const T_U32_ARRAY := 0x0A
const T_I32_ARRAY := 0x0B
const T_U16_ARRAY := 0x0C
const T_U8_ARRAY := 0x0D
const T_BLOB_REF := 0x0E
const T_INT64 := 0x0F

# Tipos de bloco canônico (11.6).
const K_F32 := 1
const K_U32 := 2
const K_I32 := 3
const K_U16 := 4
const K_U8 := 5
const K_TKEY := 16
const K_BIND := 17
const K_VERT := 18

const MAX_DEPTH := 64


static func is_boneb(data: PackedByteArray) -> bool:
	if data.size() < 8:
		return false
	for i in range(8):
		if data[i] != MAGIC[i]:
			return false
	return true


static func _align16(value: int) -> int:
	return (value + 15) & ~15


## Um cursor sobre um trecho dos bytes. O primeiro erro fica em `erro`.
class Leitor:
	var data: PackedByteArray
	var pos := 0
	var end := 0
	var erro := ""

	func _init(data_: PackedByteArray, start: int, end_: int) -> void:
		data = data_
		pos = start
		end = end_

	func falhar(texto: String) -> void:
		if erro == "":
			erro = texto
		pos = end

	func remaining() -> int:
		return end - pos

	func _pegar(count: int) -> int:
		if count < 0 or count > remaining():
			falhar("leitura fora da secao")
			return -1
		var p := pos
		pos += count
		return p

	func u8() -> int:
		var p := _pegar(1)
		return 0 if p < 0 else data.decode_u8(p)

	func u16() -> int:
		var p := _pegar(2)
		return 0 if p < 0 else data.decode_u16(p)

	func u32() -> int:
		var p := _pegar(4)
		return 0 if p < 0 else data.decode_u32(p)

	func i32() -> int:
		var p := _pegar(4)
		return 0 if p < 0 else data.decode_s32(p)

	func i64() -> int:
		var p := _pegar(8)
		return 0 if p < 0 else data.decode_s64(p)

	func u64() -> int:
		var p := _pegar(8)
		return 0 if p < 0 else data.decode_u64(p)

	func f32() -> float:
		var p := _pegar(4)
		return 0.0 if p < 0 else data.decode_float(p)

	func f64() -> float:
		var p := _pegar(8)
		return 0.0 if p < 0 else data.decode_double(p)

	func bytes(count: int) -> PackedByteArray:
		var p := _pegar(count)
		return PackedByteArray() if p < 0 else data.slice(p, p + count)

	## `fmt`: "f" float32, "I" u32, "i" i32, "H" u16, "B" u8.
	func array(fmt: String, size: int, count: int) -> Array:
		if count * size > remaining():
			falhar("array maior que a secao")
			return []
		var out: Array = []
		for _k in range(count):
			match fmt:
				"f": out.append(f32())
				"I": out.append(u32())
				"i": out.append(i32())
				"H": out.append(u16())
				_: out.append(u8())
		return out


static func _read_string_table(data: PackedByteArray, start: int, length: int, erro: Array) -> Array:
	var r := Leitor.new(data, start, start + length)
	var count := r.u32()
	if count > length:
		erro.append("tabela de strings invalida")
		return []
	var offsets := r.array("I", 4, count + 1)
	if r.erro != "":
		erro.append(r.erro)
		return []
	var body := data.slice(r.pos, start + length)
	if offsets[0] != 0 or offsets[count] > body.size():
		erro.append("offsets da tabela de strings invalidos")
		return []
	var out: Array = []
	for i in range(count):
		var a: int = offsets[i]
		var b: int = offsets[i + 1]
		if b < a or b > body.size():
			erro.append("offsets da tabela de strings nao crescentes")
			return []
		var chunk := body.slice(a, b)
		if chunk.has(0):
			erro.append("string com NUL na tabela")
			return []
		out.append(chunk.get_string_from_utf8())
	if count == 0 or out[0] != "":
		erro.append("a string 0 deve ser vazia")
		return []
	return out


static func _decode_tkey(r: Leitor, block_start: int, elem_count: int) -> Array:
	var key_count := r.u32()
	var components := r.u32()
	r.u32()  # nullable
	if key_count != elem_count:
		r.falhar("TKEY com elemCount diferente de keyCount")
		return []
	var times := r.array("f", 4, key_count)
	var values := r.array("f", 4, key_count * components)
	var curve_types := r.array("B", 1, key_count)
	# O enchimento até o próximo múltiplo de 16, contado do começo do bloco.
	r.pos = block_start + _align16(r.pos - block_start)
	var bezier_count := r.u32()
	var bezier := r.array("f", 4, bezier_count * 4 * components)
	if r.erro != "":
		return []

	var keys: Array = []
	var b := 0
	for i in range(key_count):
		var value
		if components == 1:
			value = values[i]
			if is_nan(value):  # NaN marca um darkColor nulo
				value = null
		else:
			var first: float = values[i * components]
			value = null if is_nan(first) else values.slice(i * components, (i + 1) * components)
		var key := {"time": times[i], "value": value}
		var kind: int = curve_types[i]
		if kind == 1:
			key["curve"] = "stepped"
		elif kind == 2:
			var width := 4 * components
			key["curve"] = bezier.slice(b, b + width)
			b += width
		keys.append(key)
	return keys


static func _decode_bind(r: Leitor, block_start: int, elem_count: int) -> Dictionary:
	var vertex_count := r.u32()
	var total := r.u32()
	if vertex_count != elem_count:
		r.falhar("BIND com elemCount diferente de vertexCount")
		return {}
	var counts := r.array("I", 4, vertex_count)
	var bones := r.array("I", 4, total)
	r.pos = block_start + _align16(r.pos - block_start)
	var positions := r.array("f", 4, 2 * total)
	var weights := r.array("f", 4, total)
	return {"counts": counts, "bones": bones, "positions": positions, "weights": weights}


static func _read_blobs(data: PackedByteArray, start: int, length: int, erro: Array) -> Array:
	var r := Leitor.new(data, start, start + length)
	var count := r.u32()
	var entries: Array = []
	for _k in range(count):
		var kind := r.u32()
		var elem_count := r.u32()
		var offset := r.u64()
		var byte_length := r.u64()
		entries.append([kind, elem_count, offset, byte_length])
	if r.erro != "":
		erro.append(r.erro)
		return []

	var out: Array = []
	for e in entries:
		var kind: int = e[0]
		var elem_count: int = e[1]
		var block_start: int = start + e[2]
		var block_end: int = block_start + e[3]
		if block_end > start + length:
			erro.append("bloco fora da secao BLOB")
			return []
		var block := Leitor.new(data, block_start, block_end)
		if kind == K_F32 or kind == K_VERT:
			out.append(block.array("f", 4, elem_count))
		elif kind == K_U32:
			out.append(block.array("I", 4, elem_count))
		elif kind == K_I32:
			out.append(block.array("i", 4, elem_count))
		elif kind == K_U16:
			out.append(block.array("H", 2, elem_count))
		elif kind == K_U8:
			out.append(block.array("B", 1, elem_count))
		elif kind == K_TKEY:
			out.append(_decode_tkey(block, block_start, elem_count))
		elif kind == K_BIND:
			out.append(_decode_bind(block, block_start, elem_count))
		else:
			# Tipo desconhecido: pula, mas guarda a vaga para os índices.
			out.append(null)
		if block.erro != "":
			erro.append(block.erro)
			return []
	return out


static func _decode_value(r: Leitor, strings: Array, blobs: Array, depth: int):
	if depth > MAX_DEPTH:
		r.falhar("arvore mais funda que 64 niveis")
		return null
	var tag := r.u8()
	if r.erro != "":
		return null
	if tag == T_NULL:
		return null
	if tag == T_FALSE:
		return false
	if tag == T_TRUE:
		return true
	if tag == T_INT:
		return r.i32()
	if tag == T_FLOAT:
		return r.f32()
	if tag == T_DOUBLE:
		return r.f64()
	if tag == T_STRING:
		var index := r.u32()
		if index >= strings.size():
			r.falhar("indice de string fora da tabela")
			return null
		return strings[index]
	if tag == T_ARRAY:
		var count := r.u32()
		if count > r.remaining():
			r.falhar("array maior que a secao")
			return null
		var arr: Array = []
		for _k in range(count):
			arr.append(_decode_value(r, strings, blobs, depth + 1))
			if r.erro != "":
				return null
		return arr
	if tag == T_OBJECT:
		var count2 := r.u32()
		if count2 * 4 > r.remaining():
			r.falhar("objeto maior que a secao")
			return null
		var out := {}
		for _k in range(count2):
			var index2 := r.u32()
			if index2 >= strings.size():
				r.falhar("indice de chave fora da tabela")
				return null
			var name: String = strings[index2]
			if out.has(name):
				r.falhar("chave duplicada no objeto")
				return null
			out[name] = _decode_value(r, strings, blobs, depth + 1)
			if r.erro != "":
				return null
		return out
	if tag == T_F32_ARRAY:
		return r.array("f", 4, r.u32())
	if tag == T_U32_ARRAY:
		return r.array("I", 4, r.u32())
	if tag == T_I32_ARRAY:
		return r.array("i", 4, r.u32())
	if tag == T_U16_ARRAY:
		return r.array("H", 2, r.u32())
	if tag == T_U8_ARRAY:
		return r.array("B", 1, r.u32())
	if tag == T_BLOB_REF:
		var index3 := r.u32()
		if index3 >= blobs.size():
			r.falhar("blob ref fora da secao BLOB")
			return null
		return blobs[index3]
	if tag == T_INT64:
		return r.i64()
	if tag >= 0x10 and tag <= 0x1F:
		r.falhar("tipo reservado 0x%02X: layout mais novo" % tag)
		return null
	# 0x20 para cima trazem o próprio tamanho: dá para pular.
	var byte_length := r.u32()
	r.bytes(byte_length)
	return null


## Lê um `.boneb` e devolve {"doc": a árvore do JSON, "erro": ""} ou {"doc": null, "erro"}.
static func parse_boneb(data: PackedByteArray) -> Dictionary:
	if not is_boneb(data):
		return {"doc": null, "erro": "assinatura .boneb ausente"}
	if data.size() < 32:
		return {"doc": null, "erro": "arquivo menor que o cabecalho"}
	var layout_version := data.decode_u16(8)
	if layout_version > KNOWN_LAYOUT_VERSION:
		return {"doc": null, "erro": "BIN_LAYOUT_VERSION: arquivo com layout %d, leitor conhece %d" % [layout_version, KNOWN_LAYOUT_VERSION]}
	var section_count := data.decode_u32(20)
	var file_size := data.decode_u64(24)
	if file_size != data.size():
		return {"doc": null, "erro": "fileSize %d diferente do tamanho real %d" % [file_size, data.size()]}

	var sections := {}
	var pos := 32
	for _k in range(section_count):
		if pos + 24 > data.size():
			return {"doc": null, "erro": "tabela de secoes truncada"}
		var tag := data.slice(pos, pos + 4).get_string_from_ascii()
		var offset := data.decode_u64(pos + 8)
		var length := data.decode_u64(pos + 16)
		if offset + length > data.size():
			return {"doc": null, "erro": "secao %s fora do arquivo" % tag}
		if sections.has(tag):
			return {"doc": null, "erro": "secao %s repetida" % tag}
		sections[tag] = [offset, length]
		pos += 24

	if not sections.has("STRS") or not sections.has("TREE"):
		return {"doc": null, "erro": "faltam as secoes obrigatorias STRS e TREE"}

	var erro: Array = []
	var strings := _read_string_table(data, sections["STRS"][0], sections["STRS"][1], erro)
	if not erro.is_empty():
		return {"doc": null, "erro": erro[0]}
	var blobs: Array = []
	if sections.has("BLOB"):
		blobs = _read_blobs(data, sections["BLOB"][0], sections["BLOB"][1], erro)
		if not erro.is_empty():
			return {"doc": null, "erro": erro[0]}
	var tree: Array = sections["TREE"]
	var r := Leitor.new(data, tree[0], tree[0] + tree[1])
	var root = _decode_value(r, strings, blobs, 0)
	if r.erro != "":
		return {"doc": null, "erro": r.erro}
	if typeof(root) != TYPE_DICTIONARY:
		return {"doc": null, "erro": "o valor raiz de TREE deve ser um objeto"}
	return {"doc": root, "erro": ""}

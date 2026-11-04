# SPDX-License-Identifier: Apache-2.0
"""Decoder for the `.boneb` binary packaging (spec section 11).

The binary file is the very same JSON tree, encoded compactly and
self-describing: property names live in a string table, every value carries a
type tag, and bulk numeric data may live in canonical blocks. Decoding gives
back plain Python objects, so every rule of sections 2 to 10 applies unchanged.

Written from the specification text, not from any other implementation.
"""

from __future__ import annotations

import struct
from typing import Any

MAGIC = b"\x89BONE\r\n\x1a"
KNOWN_LAYOUT_VERSION = 1

# Tree value tags (section 11.5).
T_NULL = 0x00
T_FALSE = 0x01
T_TRUE = 0x02
T_INT = 0x03
T_FLOAT = 0x04
T_DOUBLE = 0x05
T_STRING = 0x06
T_ARRAY = 0x07
T_OBJECT = 0x08
T_F32_ARRAY = 0x09
T_U32_ARRAY = 0x0A
T_I32_ARRAY = 0x0B
T_U16_ARRAY = 0x0C
T_U8_ARRAY = 0x0D
T_BLOB_REF = 0x0E
T_INT64 = 0x0F

# Canonical block kinds (section 11.6).
K_F32 = 1
K_U32 = 2
K_I32 = 3
K_U16 = 4
K_U8 = 5
K_TKEY = 16
K_BIND = 17
K_VERT = 18

MAX_DEPTH = 64


class BinaryError(Exception):
    """The `.boneb` file cannot be decoded."""


def is_boneb(data: bytes) -> bool:
    return data[:8] == MAGIC


def _align16(value: int) -> int:
    return (value + 15) & ~15


class _Reader:
    """Cursor over a byte range."""

    def __init__(self, data: bytes, start: int, end: int) -> None:
        self.data = data
        self.pos = start
        self.end = end

    def remaining(self) -> int:
        return self.end - self.pos

    def take(self, count: int) -> bytes:
        if count < 0 or count > self.remaining():
            raise BinaryError("leitura fora da secao")
        out = self.data[self.pos:self.pos + count]
        self.pos += count
        return out

    def u8(self) -> int:
        return self.take(1)[0]

    def u16(self) -> int:
        return struct.unpack_from("<H", self.take(2))[0]

    def u32(self) -> int:
        return struct.unpack_from("<I", self.take(4))[0]

    def i32(self) -> int:
        return struct.unpack_from("<i", self.take(4))[0]

    def i64(self) -> int:
        return struct.unpack_from("<q", self.take(8))[0]

    def f32(self) -> float:
        return struct.unpack_from("<f", self.take(4))[0]

    def f64(self) -> float:
        return struct.unpack_from("<d", self.take(8))[0]

    def array(self, fmt: str, size: int, count: int) -> list:
        if count * size > self.remaining():
            raise BinaryError("array maior que a secao")
        raw = self.take(count * size)
        return list(struct.unpack("<" + fmt * count, raw))


def _read_string_table(data: bytes, start: int, length: int) -> list[str]:
    reader = _Reader(data, start, start + length)
    count = reader.u32()
    if count > length:
        raise BinaryError("tabela de strings invalida")
    offsets = reader.array("I", 4, count + 1)
    body = data[reader.pos:start + length]
    if offsets[0] != 0 or offsets[count] > len(body):
        raise BinaryError("offsets da tabela de strings invalidos")
    out: list[str] = []
    for i in range(count):
        a, b = offsets[i], offsets[i + 1]
        if b < a or b > len(body):
            raise BinaryError("offsets da tabela de strings nao crescentes")
        chunk = body[a:b]
        if b"\x00" in chunk:
            raise BinaryError("string com NUL na tabela")
        out.append(chunk.decode("utf-8"))
    if count == 0 or out[0] != "":
        raise BinaryError("a string 0 deve ser vazia")
    return out


def _decode_tkey(reader: _Reader, block_start: int, elem_count: int) -> list[dict]:
    key_count = reader.u32()
    components = reader.u32()
    reader.u32()  # nullable
    if key_count != elem_count:
        raise BinaryError("TKEY com elemCount diferente de keyCount")
    times = reader.array("f", 4, key_count)
    values = reader.array("f", 4, key_count * components)
    curve_types = reader.array("B", 1, key_count)
    # Padding up to the next multiple of 16, counted from the block start.
    offset = reader.pos - block_start
    reader.pos = block_start + _align16(offset)
    bezier_count = reader.u32()
    bezier = reader.array("f", 4, bezier_count * 4 * components)

    keys: list[dict] = []
    b = 0
    for i in range(key_count):
        if components == 1:
            value: Any = values[i]
            if value != value:  # NaN marks a null darkColor
                value = None
        else:
            first = values[i * components]
            value = None if first != first else values[i * components:(i + 1) * components]
        key: dict[str, Any] = {"time": times[i], "value": value}
        kind = curve_types[i]
        if kind == 1:
            key["curve"] = "stepped"
        elif kind == 2:
            width = 4 * components
            key["curve"] = bezier[b:b + width]
            b += width
        keys.append(key)
    return keys


def _decode_bind(reader: _Reader, block_start: int, elem_count: int) -> dict:
    vertex_count = reader.u32()
    total = reader.u32()
    if vertex_count != elem_count:
        raise BinaryError("BIND com elemCount diferente de vertexCount")
    counts = reader.array("I", 4, vertex_count)
    bones = reader.array("I", 4, total)
    offset = reader.pos - block_start
    reader.pos = block_start + _align16(offset)
    positions = reader.array("f", 4, 2 * total)
    weights = reader.array("f", 4, total)
    return {"counts": counts, "bones": bones, "positions": positions, "weights": weights}


def _read_blobs(data: bytes, start: int, length: int) -> list[Any]:
    reader = _Reader(data, start, start + length)
    count = reader.u32()
    entries = []
    for _ in range(count):
        kind = reader.u32()
        elem_count = reader.u32()
        offset = struct.unpack_from("<Q", reader.take(8))[0]
        byte_length = struct.unpack_from("<Q", reader.take(8))[0]
        entries.append((kind, elem_count, offset, byte_length))

    out: list[Any] = []
    for kind, elem_count, offset, byte_length in entries:
        block_start = start + offset
        block_end = block_start + byte_length
        if block_end > start + length:
            raise BinaryError("bloco fora da secao BLOB")
        block = _Reader(data, block_start, block_end)
        if kind in (K_F32, K_VERT):
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
            # Unknown kind: skip it, but keep the slot so indexes stay right.
            out.append(None)
    return out


def _decode_value(reader: _Reader, strings: list[str], blobs: list[Any], depth: int) -> Any:
    if depth > MAX_DEPTH:
        raise BinaryError("arvore mais funda que 64 niveis")
    tag = reader.u8()
    if tag == T_NULL:
        return None
    if tag == T_FALSE:
        return False
    if tag == T_TRUE:
        return True
    if tag == T_INT:
        return reader.i32()
    if tag == T_FLOAT:
        return reader.f32()
    if tag == T_DOUBLE:
        return reader.f64()
    if tag == T_STRING:
        index = reader.u32()
        if index >= len(strings):
            raise BinaryError("indice de string fora da tabela")
        return strings[index]
    if tag == T_ARRAY:
        count = reader.u32()
        if count > reader.remaining():
            raise BinaryError("array maior que a secao")
        return [_decode_value(reader, strings, blobs, depth + 1) for _ in range(count)]
    if tag == T_OBJECT:
        count = reader.u32()
        if count * 4 > reader.remaining():
            raise BinaryError("objeto maior que a secao")
        out: dict[str, Any] = {}
        for _ in range(count):
            index = reader.u32()
            if index >= len(strings):
                raise BinaryError("indice de chave fora da tabela")
            name = strings[index]
            if name in out:
                raise BinaryError("chave duplicada no objeto")
            out[name] = _decode_value(reader, strings, blobs, depth + 1)
        return out
    if tag == T_F32_ARRAY:
        return reader.array("f", 4, reader.u32())
    if tag == T_U32_ARRAY:
        return reader.array("I", 4, reader.u32())
    if tag == T_I32_ARRAY:
        return reader.array("i", 4, reader.u32())
    if tag == T_U16_ARRAY:
        return reader.array("H", 2, reader.u32())
    if tag == T_U8_ARRAY:
        return reader.array("B", 1, reader.u32())
    if tag == T_BLOB_REF:
        index = reader.u32()
        if index >= len(blobs):
            raise BinaryError("blob ref fora da secao BLOB")
        return blobs[index]
    if tag == T_INT64:
        return reader.i64()
    if 0x10 <= tag <= 0x1F:
        raise BinaryError(f"tipo reservado 0x{tag:02X}: layout mais novo")
    # 0x20 and up carry their own byte length, so they can be skipped.
    byte_length = reader.u32()
    reader.take(byte_length)
    return None


def parse_boneb(data: bytes) -> dict:
    """Decode a `.boneb` byte string into the plain JSON tree."""
    if not is_boneb(data):
        raise BinaryError("assinatura .boneb ausente")
    if len(data) < 32:
        raise BinaryError("arquivo menor que o cabecalho")
    layout_version = struct.unpack_from("<H", data, 8)[0]
    if layout_version > KNOWN_LAYOUT_VERSION:
        raise BinaryError(
            f"BIN_LAYOUT_VERSION: arquivo com layout {layout_version}, "
            f"leitor conhece {KNOWN_LAYOUT_VERSION}"
        )
    section_count = struct.unpack_from("<I", data, 20)[0]
    file_size = struct.unpack_from("<Q", data, 24)[0]
    if file_size != len(data):
        raise BinaryError(f"fileSize {file_size} diferente do tamanho real {len(data)}")

    sections: dict[str, tuple[int, int]] = {}
    pos = 32
    for _ in range(section_count):
        if pos + 24 > len(data):
            raise BinaryError("tabela de secoes truncada")
        tag = data[pos:pos + 4].decode("ascii", "replace")
        offset = struct.unpack_from("<Q", data, pos + 8)[0]
        length = struct.unpack_from("<Q", data, pos + 16)[0]
        if offset + length > len(data):
            raise BinaryError(f"secao {tag} fora do arquivo")
        if tag in sections:
            raise BinaryError(f"secao {tag} repetida")
        sections[tag] = (offset, length)
        pos += 24

    if "STRS" not in sections or "TREE" not in sections:
        raise BinaryError("faltam as secoes obrigatorias STRS e TREE")

    strings = _read_string_table(data, *sections["STRS"])
    blobs = _read_blobs(data, *sections["BLOB"]) if "BLOB" in sections else []
    tree_offset, tree_length = sections["TREE"]
    reader = _Reader(data, tree_offset, tree_offset + tree_length)
    root = _decode_value(reader, strings, blobs, 0)
    if not isinstance(root, dict):
        raise BinaryError("o valor raiz de TREE deve ser um objeto")
    return root

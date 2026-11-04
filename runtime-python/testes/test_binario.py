# SPDX-License-Identifier: Apache-2.0
"""The `.boneb` packaging (spec 11) and the `.bonez` container (spec 2.9).

The tests build the bytes here, by hand, from the tables of section 11. They
do not use any writer of this project, so they check the reading of the
specification and not the agreement of a program with itself.
"""

from __future__ import annotations

import io
import json
import struct
import unittest
import zipfile

from base import HEADER
from recorte.binary import BinaryError, parse_boneb
from recorte.loader import load_skeleton_bytes

MAGIC = b"\x89BONE\r\n\x1a"


class Writer:
    """A minimal `.boneb` writer, built only from the tables of 11.3 to 11.6."""

    def __init__(self) -> None:
        self.strings: list[str] = [""]
        self.blobs: list[bytes] = []
        self.blob_kinds: list[int] = []
        self.blob_counts: list[int] = []

    def string_index(self, text: str) -> int:
        if text not in self.strings:
            self.strings.append(text)
        return self.strings.index(text)

    def add_blob(self, kind: int, elem_count: int, payload: bytes) -> int:
        self.blobs.append(payload)
        self.blob_kinds.append(kind)
        self.blob_counts.append(elem_count)
        return len(self.blobs) - 1

    def value(self, item) -> bytes:
        if item is None:
            return b"\x00"
        if item is True:
            return b"\x02"
        if item is False:
            return b"\x01"
        if isinstance(item, BlobRef):
            return b"\x0e" + struct.pack("<I", item.index)
        if isinstance(item, int):
            return b"\x03" + struct.pack("<i", item)
        if isinstance(item, float):
            return b"\x04" + struct.pack("<f", item)
        if isinstance(item, str):
            return b"\x06" + struct.pack("<I", self.string_index(item))
        if isinstance(item, list):
            if item and all(isinstance(v, float) for v in item):
                return b"\x09" + struct.pack("<I", len(item)) + struct.pack(f"<{len(item)}f", *item)
            out = b"\x07" + struct.pack("<I", len(item))
            return out + b"".join(self.value(v) for v in item)
        if isinstance(item, dict):
            out = b"\x08" + struct.pack("<I", len(item))
            for key, sub in item.items():
                out += struct.pack("<I", self.string_index(key)) + self.value(sub)
            return out
        raise TypeError(f"valor sem codificacao: {item!r}")

    def build(self, tree: dict, layout_version: int = 1) -> bytes:
        body = self.value(tree)          # fills the string table as a side effect

        blob_section = b""
        if self.blobs:
            offsets = []
            payload = b""
            for data in self.blobs:
                while len(payload) % 16:
                    payload += b"\x00"
                offsets.append(len(payload))
                payload += data
            head_size = 4 + 24 * len(self.blobs)
            while head_size % 16:
                head_size += 1
            head = struct.pack("<I", len(self.blobs))
            for index, data in enumerate(self.blobs):
                head += struct.pack("<IIQQ", self.blob_kinds[index], self.blob_counts[index],
                                    head_size + offsets[index], len(data))
            head += b"\x00" * (head_size - len(head))
            blob_section = head + payload

        encoded = [s.encode("utf-8") for s in self.strings]
        offsets = [0]
        for chunk in encoded:
            offsets.append(offsets[-1] + len(chunk))
        strs = struct.pack("<I", len(encoded))
        strs += struct.pack(f"<{len(offsets)}I", *offsets)
        strs += b"".join(encoded)

        sections = [(b"STRS", strs), (b"TREE", body)]
        if blob_section:
            sections.append((b"BLOB", blob_section))

        header_size = 32 + 24 * len(sections)
        out = bytearray(b"\x00" * header_size)
        placed = []
        for tag, data in sections:
            while len(out) % 16:
                out.append(0)
            placed.append((tag, len(out), len(data)))
            out += data

        out[0:8] = MAGIC
        struct.pack_into("<H", out, 8, layout_version)
        struct.pack_into("<H", out, 10, 0)
        struct.pack_into("<HH", out, 12, 1, 0)
        struct.pack_into("<HH", out, 16, 1, 0)
        struct.pack_into("<I", out, 20, len(sections))
        struct.pack_into("<Q", out, 24, len(out))
        for index, (tag, offset, length) in enumerate(placed):
            base = 32 + 24 * index
            out[base:base + 4] = tag
            struct.pack_into("<I", out, base + 4, 0)
            struct.pack_into("<Q", out, base + 8, offset)
            struct.pack_into("<Q", out, base + 16, length)
        return bytes(out)


class BlobRef:
    def __init__(self, index: int) -> None:
        self.index = index


def _align16(value: int) -> int:
    return (value + 15) & ~15


def tkey_block(times, values, components, curve_types, beziers) -> bytes:
    body = struct.pack("<III", len(times), components, 0)
    body += struct.pack(f"<{len(times)}f", *times)
    body += struct.pack(f"<{len(values)}f", *values)
    body += struct.pack(f"<{len(curve_types)}B", *curve_types)
    body += b"\x00" * (_align16(len(body)) - len(body))
    count = sum(1 for c in curve_types if c == 2)
    body += struct.pack("<I", count)
    if beziers:
        body += struct.pack(f"<{len(beziers)}f", *beziers)
    return body


def bind_block(counts, bones, positions, weights) -> bytes:
    body = struct.pack("<II", len(counts), len(weights))
    body += struct.pack(f"<{len(counts)}I", *counts)
    body += struct.pack(f"<{len(bones)}I", *bones)
    body += b"\x00" * (_align16(len(body)) - len(body))
    body += struct.pack(f"<{len(positions)}f", *positions)
    body += struct.pack(f"<{len(weights)}f", *weights)
    return body


TREE = {
    "bone": dict(HEADER),
    "skeleton": {"name": "binario"},
    "bones": [{"name": "root"}, {"name": "osso", "parent": "root", "x": 10.0, "y": 20.0}],
    "slots": [],
}


class TestBoneb(unittest.TestCase):
    def test_arvore_volta_igual(self):
        dados = Writer().build(TREE)
        arvore = parse_boneb(dados)
        self.assertEqual(arvore["skeleton"]["name"], "binario")
        self.assertEqual(arvore["bones"][1]["x"], 10.0)

    def test_carrega_como_esqueleto(self):
        skeleton = load_skeleton_bytes(Writer().build(TREE))
        self.assertEqual([b.name for b in skeleton.bones], ["root", "osso"])

    def test_assinatura_errada(self):
        with self.assertRaises(BinaryError):
            parse_boneb(b"\x00" * 64)

    def test_layout_mais_novo_e_recusado(self):
        dados = Writer().build(TREE, layout_version=2)
        with self.assertRaises(BinaryError) as caso:
            parse_boneb(dados)
        self.assertIn("BIN_LAYOUT_VERSION", str(caso.exception))

    def test_tamanho_do_arquivo_tem_que_bater(self):
        dados = bytearray(Writer().build(TREE))
        struct.pack_into("<Q", dados, 24, 999999)
        with self.assertRaises(BinaryError):
            parse_boneb(bytes(dados))

    def test_bloco_tkey_vira_chaves(self):
        writer = Writer()
        indice = writer.add_blob(16, 3, tkey_block(
            times=[0.0, 0.5, 1.0], values=[0.0, 50.0, 100.0], components=1,
            curve_types=[0, 1, 0], beziers=[]))
        arvore = dict(TREE)
        arvore["animations"] = [{"name": "andar", "duration": 1.0, "timelines": [
            {"type": "bone", "target": "osso", "property": "x", "keys": BlobRef(indice)}]}]
        decodificada = parse_boneb(writer.build(arvore))
        chaves = decodificada["animations"][0]["timelines"][0]["keys"]
        self.assertEqual([k["time"] for k in chaves], [0.0, 0.5, 1.0])
        self.assertEqual([k["value"] for k in chaves], [0.0, 50.0, 100.0])
        self.assertNotIn("curve", chaves[0])          # 0 = linear, sem chave escrita
        self.assertEqual(chaves[1]["curve"], "stepped")

    def test_bloco_tkey_com_bezier(self):
        writer = Writer()
        indice = writer.add_blob(16, 2, tkey_block(
            times=[0.0, 1.0], values=[0.0, 100.0], components=1,
            curve_types=[2, 0], beziers=[0.25, 0.0, 0.75, 100.0]))
        arvore = dict(TREE)
        arvore["animations"] = [{"name": "andar", "duration": 1.0, "timelines": [
            {"type": "bone", "target": "osso", "property": "x", "keys": BlobRef(indice)}]}]
        chaves = parse_boneb(writer.build(arvore))["animations"][0]["timelines"][0]["keys"]
        self.assertEqual(chaves[0]["curve"], [0.25, 0.0, 0.75, 100.0])

    def test_bloco_bind_vira_binding(self):
        writer = Writer()
        indice = writer.add_blob(17, 1, bind_block(
            counts=[2], bones=[1, 2], positions=[0.0, 0.0, 0.0, 0.0], weights=[0.25, 0.75]))
        arvore = dict(TREE)
        arvore["bones"] = TREE["bones"] + [{"name": "outro", "parent": "root"}]
        arvore["skins"] = [{"name": "default", "attachments": {"malha": {"malha": {
            "type": "mesh", "binding": BlobRef(indice), "uvs": [0.0, 0.0],
            "triangles": [0, 0, 0], "hull": 1}}}}]
        decodificada = parse_boneb(writer.build(arvore))
        binding = decodificada["skins"][0]["attachments"]["malha"]["malha"]["binding"]
        self.assertEqual(binding["counts"], [2])
        self.assertEqual(binding["bones"], [1, 2])
        self.assertEqual(binding["weights"], [0.25, 0.75])

    def test_bloco_de_kind_desconhecido_e_pulado(self):
        writer = Writer()
        indice = writer.add_blob(999, 4, b"\x01\x02\x03\x04")
        arvore = dict(TREE)
        arvore["extras"] = BlobRef(indice)
        self.assertIsNone(parse_boneb(writer.build(arvore))["extras"])


class TestBonez(unittest.TestCase):
    def _pacote(self, mimetype=b"application/vnd.bone+zip"):
        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, "w") as archive:
            archive.writestr(zipfile.ZipInfo("mimetype"), mimetype,
                             compress_type=zipfile.ZIP_STORED)
            archive.writestr("manifest.json", json.dumps(
                {"bonez": {"version": "1.0"}, "main": "heroi.bone",
                 "atlases": ["heroi.atlas.json"]}))
            archive.writestr("heroi.bone", json.dumps({
                "bone": dict(HEADER),
                "assets": {"atlases": ["heroi.atlas.json"]},
                "bones": [{"name": "root"}],
                "slots": [{"name": "corpo", "bone": "root", "attachment": "corpo"}],
                "skins": [{"name": "default", "attachments": {
                    "corpo": {"corpo": {"type": "region", "path": "corpo"}}}}],
            }))
            archive.writestr("heroi.atlas.json", json.dumps({
                "atlas": {"version": "1.0", "generator": "testes"}, "scale": 1,
                "pages": [{"name": "p", "image": "p.png", "width": 64, "height": 64}],
                "regions": [{"name": "corpo", "page": 0, "x": 0, "y": 0,
                             "width": 20, "height": 10}],
            }))
        return buffer.getvalue()

    def test_abre_pelo_manifesto_e_acha_o_atlas(self):
        skeleton = load_skeleton_bytes(self._pacote())
        self.assertEqual(len(skeleton.atlases), 1)
        attachment = skeleton.skins[0].attachments["corpo"]["corpo"]
        self.assertEqual(attachment.local_corners, [-10.0, -5.0, 10.0, -5.0,
                                                    10.0, 5.0, -10.0, 5.0])

    def test_mimetype_errado_e_recusado(self):
        with self.assertRaises(Exception):
            load_skeleton_bytes(self._pacote(b"application/zip"))


if __name__ == "__main__":
    unittest.main()

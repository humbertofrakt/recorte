# SPDX-License-Identifier: Apache-2.0
"""The pose dump and the conformance suite (spec 12.4)."""

from __future__ import annotations

import unittest
from pathlib import Path

from base import ROOT, document
from recorte import build_pose_dump, compare_pose_dump
from recorte.loader import load_skeleton_document
from recorte.pose_dump import TOLERANCES

CASOS = ROOT.parent / "conformidade" / "casos"


def dump(probe, **parts):
    return build_pose_dump(load_skeleton_document(document(**parts)), probe)


class TestFormatoDoDump(unittest.TestCase):
    def test_campos_de_osso(self):
        saida = dump({"times": [0], "measure": ["bones"]},
                     bones=[{"name": "root", "x": 1, "y": 2}])
        osso = saida["samples"][0]["bones"]["root"]
        self.assertEqual(sorted(osso), sorted([
            "a", "b", "c", "d", "worldX", "worldY", "ax", "ay",
            "arotation", "ascaleX", "ascaleY", "ashearX", "ashearY"]))

    def test_angulo_sai_reduzido(self):
        saida = dump({"times": [0], "measure": ["bones"]},
                     bones=[{"name": "root", "rotation": 400}])
        self.assertAlmostEqual(saida["samples"][0]["bones"]["root"]["arotation"], 40)

    def test_so_os_canais_pedidos(self):
        saida = dump({"times": [0], "measure": ["bones"]}, bones=[{"name": "root"}])
        self.assertNotIn("slots", saida["samples"][0])
        self.assertNotIn("vertices", saida["samples"][0])

    def test_slot_com_anexo_que_nao_resolve_sai_nulo(self):
        saida = dump(
            {"times": [0], "measure": ["slots"]},
            bones=[{"name": "root"}],
            slots=[{"name": "s", "bone": "root", "attachment": "sumido"}],
        )
        self.assertIsNone(saida["samples"][0]["slots"]["s"]["attachment"])

    def test_chave_de_vertices_e_slot_barra_anexo(self):
        saida = dump(
            {"times": [0], "measure": ["vertices", "uvs"]},
            bones=[{"name": "root"}],
            slots=[{"name": "corpo", "bone": "root", "attachment": "corpo"}],
            skins=[{"name": "default", "attachments": {"corpo": {
                "corpo": {"type": "region", "width": 10, "height": 10}}}}],
        )
        self.assertIn("corpo/corpo", saida["samples"][0]["vertices"])
        self.assertIn("corpo/corpo", saida["samples"][0]["uvs"])


class TestComparacao(unittest.TestCase):
    def _um(self, campo, valor):
        return {"samples": [{"time": 0, "bones": {"b": {campo: valor}}}]}

    def test_dentro_da_tolerancia_passa(self):
        ok, _d, _p = compare_pose_dump(self._um("worldX", 10.0),
                                       self._um("worldX", 10.0005), TOLERANCES)
        self.assertTrue(ok)

    def test_fora_da_tolerancia_falha(self):
        ok, diferencas, pior = compare_pose_dump(self._um("worldX", 10.0),
                                                 self._um("worldX", 10.5), TOLERANCES)
        self.assertFalse(ok)
        self.assertAlmostEqual(pior, 0.5)
        self.assertEqual(diferencas[0].pointer, "/samples/0/bones/b/worldX")

    def test_angulo_usa_distancia_circular(self):
        ok, _d, _p = compare_pose_dump(self._um("arotation", 180.0),
                                       self._um("arotation", -180.0), TOLERANCES)
        self.assertTrue(ok)

    def test_uv_tem_tolerancia_propria(self):
        esperado = {"samples": [{"time": 0, "uvs": {"a/b": [0.5]}}]}
        obtido = {"samples": [{"time": 0, "uvs": {"a/b": [0.5001]}}]}
        ok, _d, _p = compare_pose_dump(esperado, obtido, TOLERANCES)
        self.assertFalse(ok)

    def test_string_e_ordem_sao_exatas(self):
        esperado = {"samples": [{"time": 0, "drawOrder": ["a", "b"]}]}
        obtido = {"samples": [{"time": 0, "drawOrder": ["b", "a"]}]}
        ok, _d, _p = compare_pose_dump(esperado, obtido, TOLERANCES)
        self.assertFalse(ok)

    def test_campo_que_falta_e_diferenca(self):
        obtido = {"samples": [{"time": 0, "bones": {"b": {}}}]}
        ok, diferencas, _p = compare_pose_dump(self._um("worldX", 1.0), obtido, TOLERANCES)
        self.assertFalse(ok)
        self.assertIsNone(diferencas[0].actual)


@unittest.skipUnless(CASOS.is_dir(), "a suite de conformidade nao esta ao lado")
class TestSuiteInteira(unittest.TestCase):
    """A prova de ponta a ponta: os casos oficiais contra este runtime."""

    def test_todos_os_casos_passam(self):
        import sys
        sys.path.insert(0, str(ROOT))
        from conformidade import ler_caso, listar_casos, rodar_caso

        nomes = listar_casos(CASOS)
        self.assertGreaterEqual(len(nomes), 39)
        falhas = []
        for nome in nomes:
            resultado = rodar_caso(ler_caso(CASOS, nome))
            if not resultado["passou"]:
                falhas.append((nome, resultado["erro"], resultado["diferencas"][:1]))
        self.assertEqual(falhas, [])


if __name__ == "__main__":
    unittest.main()

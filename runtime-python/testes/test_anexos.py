# SPDX-License-Identifier: Apache-2.0
"""Skins, attachments, weights, deform, morphs and clipping (spec 4.4 and 7)."""

from __future__ import annotations

import unittest

from base import build
from recorte.animation import apply_animation
from recorte.loader import (
    BoundingBoxAttachment,
    ClippingAttachment,
    MeshAttachment,
    PointAttachment,
)

ROOT = [{"name": "root"}]


def region(width, height, **extra):
    return dict({"type": "region", "width": width, "height": height}, **extra)


class TestRegiao(unittest.TestCase):
    def test_quatro_cantos_sem_atlas(self):
        skeleton = build(
            bones=ROOT,
            slots=[{"name": "corpo", "bone": "root", "attachment": "corpo"}],
            skins=[{"name": "default", "attachments": {"corpo": {"corpo": region(10, 10)}}}],
        )
        slot = skeleton.slot_by_name["corpo"]
        attachment, skin = skeleton.attachment_for(slot)
        self.assertEqual(skeleton.world_vertices(slot, attachment, skin),
                         [-5, -5, 5, -5, 5, 5, -5, 5])

    def test_transform_do_anexo(self):
        skeleton = build(
            bones=ROOT,
            slots=[{"name": "corpo", "bone": "root", "attachment": "corpo"}],
            skins=[{"name": "default", "attachments": {
                "corpo": {"corpo": region(10, 10, x=100, y=50, rotation=90)}}}],
        )
        slot = skeleton.slot_by_name["corpo"]
        attachment, skin = skeleton.attachment_for(slot)
        pontos = skeleton.world_vertices(slot, attachment, skin)
        self.assertAlmostEqual(pontos[0], 105, places=6)   # canto BL girado 90
        self.assertAlmostEqual(pontos[1], 45, places=6)


class TestSkins(unittest.TestCase):
    def _doc(self):
        return dict(
            bones=ROOT,
            slots=[{"name": "corpo", "bone": "root", "attachment": "corpo"}],
            skins=[
                {"name": "default", "attachments": {"corpo": {"corpo": region(10, 10)}}},
                {"name": "armadura", "attachments": {"corpo": {"corpo": region(20, 30)}}},
                {"name": "invisivel", "attachments": {"corpo": {"corpo": None}}},
                {"name": "composta", "includes": ["armadura"], "attachments": {}},
            ],
        )

    def test_nasce_com_a_pilha_default(self):
        # 4.4 (rascunho 0.2): um esqueleto novo nasce com a pilha ["default"].
        skeleton = build(**self._doc())
        self.assertEqual(skeleton.skin_names, ["default"])
        attachment, skin = skeleton.attachment_for(skeleton.slot_by_name["corpo"])
        self.assertEqual(skin, "default")
        self.assertEqual(attachment.width, 10)

    def test_pilha_vazia_nao_tem_default_implicita(self):
        skeleton = build(**self._doc())
        skeleton.set_skins([])
        attachment, _skin = skeleton.attachment_for(skeleton.slot_by_name["corpo"])
        self.assertIsNone(attachment)

    def test_a_de_cima_da_pilha_vence(self):
        skeleton = build(**self._doc())
        skeleton.set_skins(["armadura", "default"])
        attachment, skin = skeleton.attachment_for(skeleton.slot_by_name["corpo"])
        self.assertEqual(skin, "default")

    def test_a_ultima_ativada_ganha(self):
        skeleton = build(**self._doc())
        skeleton.set_skins(["armadura"])
        attachment, skin = skeleton.attachment_for(skeleton.slot_by_name["corpo"])
        self.assertEqual(skin, "armadura")
        self.assertEqual(attachment.width, 20)

    def test_nulo_esconde_o_placeholder(self):
        skeleton = build(**self._doc())
        skeleton.set_skins(["invisivel"])
        attachment, _skin = skeleton.attachment_for(skeleton.slot_by_name["corpo"])
        self.assertIsNone(attachment)

    def test_includes_entram_antes(self):
        skeleton = build(**self._doc())
        skeleton.set_skins(["composta"])
        attachment, skin = skeleton.attachment_for(skeleton.slot_by_name["corpo"])
        self.assertEqual(skin, "armadura")


class TestPesos(unittest.TestCase):
    def test_influencias_somam_pelos_pesos(self):
        skeleton = build(
            bones=[{"name": "root"},
                   {"name": "a", "parent": "root", "x": 0},
                   {"name": "b", "parent": "root", "x": 100}],
            slots=[{"name": "malha", "bone": "root", "attachment": "malha"}],
            skins=[{"name": "default", "attachments": {"malha": {"malha": {
                "type": "mesh",
                "binding": {"counts": [2], "bones": [1, 2],
                            "positions": [0, 0, 0, 0], "weights": [0.25, 0.75]},
                "uvs": [0, 0], "triangles": [0, 0, 0], "hull": 1}}}}],
        )
        slot = skeleton.slot_by_name["malha"]
        attachment, skin = skeleton.attachment_for(slot)
        pontos = skeleton.world_vertices(slot, attachment, skin)
        self.assertAlmostEqual(pontos[0], 75)


class TestDeformEMorph(unittest.TestCase):
    def _doc(self):
        return dict(
            bones=ROOT,
            slots=[{"name": "malha", "bone": "root", "attachment": "malha"}],
            skins=[{"name": "default", "attachments": {"malha": {"malha": {
                "type": "mesh", "vertices": [0, 0, 100, 0, 0, 100],
                "uvs": [0, 0, 1, 0, 0, 1], "triangles": [0, 1, 2], "hull": 3}}}}],
            morphs=[{"name": "inchar", "weight": 0, "min": 0, "max": 1, "targets": [
                {"slot": "malha", "attachment": "malha",
                 "offsets": [10, 0, 0, 0, 0, 0]}]}],
            animations=[{"name": "misturar", "duration": 1, "timelines": [
                {"type": "deform", "target": "malha", "attachment": "malha", "keys": [
                    {"time": 0, "value": [0, 0, 0, 0, 0, 0]},
                    {"time": 1, "value": [0, 5, 0, 0, 0, 0]}]},
                {"type": "morph", "target": "inchar", "property": "weight", "keys": [
                    {"time": 0, "value": 0}, {"time": 1, "value": 1}]}]}],
        )

    def _vertices(self, t):
        skeleton = build(**self._doc())
        apply_animation(skeleton, skeleton.data.animations[0], t)
        skeleton.update_pose(t)
        slot = skeleton.slot_by_name["malha"]
        attachment, skin = skeleton.attachment_for(slot)
        return skeleton.world_vertices(slot, attachment, skin)

    def test_deform_e_morph_se_somam(self):
        self.assertEqual(self._vertices(0)[:2], [0, 0])
        meio = self._vertices(0.5)
        self.assertAlmostEqual(meio[0], 5)
        self.assertAlmostEqual(meio[1], 2.5)
        fim = self._vertices(1)
        self.assertAlmostEqual(fim[0], 10)
        self.assertAlmostEqual(fim[1], 5)

    def test_deform_mais_curto_completa_com_zero(self):
        doc = self._doc()
        doc["animations"][0]["timelines"][0]["keys"] = [
            {"time": 0, "value": [7], "offset": 2}]
        skeleton = build(**doc)
        apply_animation(skeleton, skeleton.data.animations[0], 0)
        skeleton.update_pose(0)
        slot = skeleton.slot_by_name["malha"]
        attachment, skin = skeleton.attachment_for(slot)
        pontos = skeleton.world_vertices(slot, attachment, skin)
        for obtido, esperado in zip(pontos, [0, 0, 107, 0, 0, 100]):
            self.assertAlmostEqual(obtido, esperado, places=6)


class TestOutrosAnexos(unittest.TestCase):
    def _skeleton(self):
        return build(
            bones=[{"name": "root", "x": 10, "y": 20}],
            slots=[
                {"name": "mascara", "bone": "root", "attachment": "mascara"},
                {"name": "corpo", "bone": "root", "attachment": "corpo"},
                {"name": "depois", "bone": "root", "attachment": "corpo"},
                {"name": "caixa", "bone": "root", "attachment": "caixa"},
                {"name": "ponta", "bone": "root", "attachment": "ponta"},
            ],
            skins=[{"name": "default", "attachments": {
                "mascara": {"mascara": {"type": "clipping", "end": "corpo",
                                        "vertices": [0, 0, 10, 0, 10, 10]}},
                "corpo": {"corpo": region(10, 10)},
                "depois": {"corpo": region(10, 10)},
                "caixa": {"caixa": {"type": "boundingbox", "shape": "rectangle",
                                    "width": 20, "height": 10}},
                "ponta": {"ponta": {"type": "point", "x": 3, "y": 4, "rotation": 45}},
            }}],
        )

    def test_boundingbox_retangulo_vai_para_o_mundo(self):
        skeleton = self._skeleton()
        formas = skeleton.collision_shapes()
        self.assertEqual(formas["caixa/caixa"], [0, 15, 20, 15, 20, 25, 0, 25])

    def test_point_devolve_posicao_e_rotacao(self):
        skeleton = self._skeleton()
        slot = skeleton.slot_by_name["ponta"]
        attachment, _skin = skeleton.attachment_for(slot)
        self.assertIsInstance(attachment, PointAttachment)
        x, y, rotation = skeleton.point_world(slot, attachment)
        self.assertAlmostEqual(x, 13)
        self.assertAlmostEqual(y, 24)
        self.assertAlmostEqual(rotation, 45)

    def test_clipping_vale_ate_o_slot_end(self):
        skeleton = self._skeleton()
        self.assertIsInstance(skeleton.clipping_for("corpo"), ClippingAttachment)
        self.assertIsNone(skeleton.clipping_for("depois"))

    def test_anexos_que_nao_desenham_ficam_fora_da_lista(self):
        skeleton = self._skeleton()
        nomes = [slot.name for slot, _a, _s in skeleton.visible_attachments()]
        self.assertEqual(nomes, ["corpo", "depois"])


class TestLinkedMesh(unittest.TestCase):
    def test_herda_a_geometria_do_parent(self):
        skeleton = build(
            bones=ROOT,
            slots=[{"name": "boca", "bone": "root", "attachment": "sorriso"}],
            skins=[{"name": "default", "attachments": {"boca": {
                "aberta": {"type": "mesh", "vertices": [0, 0, 10, 0, 0, 10],
                           "uvs": [0, 0, 1, 0, 0, 1], "triangles": [0, 1, 2], "hull": 3},
                "sorriso": {"type": "linkedmesh", "parent": "aberta", "path": "sorriso"},
            }}}],
        )
        slot = skeleton.slot_by_name["boca"]
        attachment, skin = skeleton.attachment_for(slot)
        self.assertIsInstance(attachment, MeshAttachment)
        self.assertEqual(attachment.triangles, [0, 1, 2])
        for obtido, esperado in zip(skeleton.world_vertices(slot, attachment, skin),
                                    [0, 0, 10, 0, 0, 10]):
            self.assertAlmostEqual(obtido, esperado, places=6)


class TestTipoDesconhecido(unittest.TestCase):
    def test_placeholder_fica_vazio(self):
        skeleton = build(
            bones=ROOT,
            slots=[{"name": "estranho", "bone": "root", "attachment": "holo"}],
            skins=[{"name": "default", "attachments": {
                "estranho": {"holo": {"type": "acme_hologram", "brilho": 3}}}}],
        )
        attachment, _skin = skeleton.attachment_for(skeleton.slot_by_name["estranho"])
        self.assertIsNone(attachment)


if __name__ == "__main__":
    unittest.main()

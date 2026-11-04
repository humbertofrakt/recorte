# SPDX-License-Identifier: Apache-2.0
"""Atlas, UV mapping and region geometry (spec 7.3, 10.3 and 10.4)."""

from __future__ import annotations

import unittest

from base import HEADER
from recorte.atlas import find_region, load_atlas
from recorte.loader import load_skeleton_document


def atlas_doc(region, page_size=128, scale=1):
    return {
        "atlas": {"version": "1.0", "generator": "testes"},
        "scale": scale,
        "pages": [{"name": "pagina", "image": "pagina.png",
                   "width": page_size, "height": page_size}],
        "regions": [region],
    }


RECORTE = {"name": "recorte", "page": 0, "x": 2, "y": 2, "width": 60, "height": 40,
           "offsetX": 10, "offsetY": 5, "originalWidth": 100, "originalHeight": 80}

GIRADA = {"name": "girada", "page": 0, "x": 4, "y": 6, "width": 40, "height": 60,
          "rotation": 90, "offsetX": 8, "offsetY": 12,
          "originalWidth": 80, "originalHeight": 100}


class TestUv(unittest.TestCase):
    def test_uv_sem_giro(self):
        atlas = load_atlas(atlas_doc(RECORTE))
        region = atlas.find("recorte")
        # Canto inferior esquerdo do recorte na imagem original.
        u, v = region.uv(0.1, 0.9375)
        self.assertAlmostEqual(u, 2 / 128)
        self.assertAlmostEqual(v, 42 / 128)

    def test_uv_com_giro_de_90(self):
        atlas = load_atlas(atlas_doc(GIRADA, page_size=256))
        region = atlas.find("girada")
        # O canto superior esquerdo do recorte cai no canto superior DIREITO
        # do retangulo na pagina (verificacao escrita na 10.4).
        u0 = region.offset_x / region.original_width
        v0 = 1 - (region.offset_y + region.height) / region.original_height
        u, v = region.uv(u0, v0)
        self.assertAlmostEqual(u, (4 + 60) / 256)
        self.assertAlmostEqual(v, 6 / 256)

    def test_rotacao_invalida_vira_zero(self):
        estranha = dict(RECORTE, rotation=45)
        atlas = load_atlas(atlas_doc(estranha))
        self.assertEqual(atlas.find("recorte").rotation, 0)

    def test_alias_resolve_para_a_mesma_regiao(self):
        com_alias = dict(RECORTE, aliases=["outro_nome"])
        atlas = load_atlas(atlas_doc(com_alias))
        self.assertIs(atlas.find("outro_nome"), atlas.find("recorte"))

    def test_procura_na_ordem_dos_atlas(self):
        primeiro = load_atlas(atlas_doc(dict(RECORTE, name="corpo", width=10)))
        segundo = load_atlas(atlas_doc(dict(RECORTE, name="corpo", width=20)))
        self.assertEqual(find_region([primeiro, segundo], "corpo").width, 10)
        self.assertIsNone(find_region([primeiro, segundo], "nao_existe"))


class TestGeometriaDaRegiao(unittest.TestCase):
    def _skeleton_data(self, region, scale=1, page_size=128, **extra):
        doc = {
            "bone": dict(HEADER),
            "bones": [{"name": "root"}],
            "slots": [{"name": "corpo", "bone": "root", "attachment": "corpo"}],
            "skins": [{"name": "default", "attachments": {"corpo": {
                "corpo": dict({"type": "region", "path": region["name"]}, **extra)}}}],
        }
        atlas = load_atlas(atlas_doc(region, page_size=page_size, scale=scale))
        return load_skeleton_document(doc, [atlas])

    def test_cantos_do_recorte_e_nao_da_imagem_inteira(self):
        data = self._skeleton_data(RECORTE)
        attachment = data.skins[0].attachments["corpo"]["corpo"]
        self.assertEqual(attachment.local_corners,
                         [-40.0, -35.0, 20.0, -35.0, 20.0, 5.0, -40.0, 5.0])

    def test_uvs_dos_cantos_sao_os_do_recorte(self):
        data = self._skeleton_data(RECORTE)
        attachment = data.skins[0].attachments["corpo"]["corpo"]
        esperado = [0.015625, 0.328125, 0.484375, 0.328125,
                    0.484375, 0.015625, 0.015625, 0.015625]
        for obtido, alvo in zip(attachment.page_uvs, esperado):
            self.assertAlmostEqual(obtido, alvo, places=6)

    def test_escala_do_atlas_divide_os_pixels(self):
        data = self._skeleton_data(
            {"name": "meio", "page": 0, "x": 0, "y": 0, "width": 40, "height": 20},
            scale=2)
        attachment = data.skins[0].attachments["corpo"]["corpo"]
        # 40 px de atlas / escala 2 = 20 px de esqueleto.
        self.assertEqual(attachment.local_corners[0], -10.0)
        self.assertEqual(attachment.local_corners[1], -5.0)

    def test_sem_atlas_a_imagem_inteira_e_a_regiao(self):
        doc = {
            "bone": dict(HEADER),
            "bones": [{"name": "root"}],
            "slots": [{"name": "corpo", "bone": "root", "attachment": "corpo"}],
            "skins": [{"name": "default", "attachments": {"corpo": {
                "corpo": {"type": "region", "width": 30, "height": 10}}}}],
        }
        data = load_skeleton_document(doc, [])
        attachment = data.skins[0].attachments["corpo"]["corpo"]
        self.assertEqual(attachment.local_corners,
                         [-15.0, -5.0, 15.0, -5.0, 15.0, 5.0, -15.0, 5.0])


class TestUvDeMalha(unittest.TestCase):
    def test_uvs_da_malha_passam_pela_10_4(self):
        doc = {
            "bone": dict(HEADER),
            "bones": [{"name": "root"}],
            "slots": [{"name": "malha", "bone": "root", "attachment": "malha"}],
            "skins": [{"name": "default", "attachments": {"malha": {"malha": {
                "type": "mesh", "path": "recorte",
                "vertices": [0, 0, 10, 0, 0, 10],
                "uvs": [0.1, 0.9375, 0.7, 0.9375, 0.1, 0.4375],
                "triangles": [0, 1, 2], "hull": 3}}}}],
        }
        data = load_skeleton_document(doc, [load_atlas(atlas_doc(RECORTE))])
        attachment = data.skins[0].attachments["malha"]["malha"]
        self.assertAlmostEqual(attachment.page_uvs[0], 2 / 128)
        self.assertAlmostEqual(attachment.page_uvs[1], 42 / 128)


if __name__ == "__main__":
    unittest.main()

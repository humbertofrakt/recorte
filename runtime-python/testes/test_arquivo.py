# SPDX-License-Identifier: Apache-2.0
"""File rules, versioning, extensions and the fallback table (spec 2)."""

from __future__ import annotations

import json
import unittest

from base import HEADER, build, document
from recorte.loader import BoneError, load_skeleton_bytes, load_skeleton_document


def carregar(**parts):
    return load_skeleton_document(document(**parts))


class TestCabecalho(unittest.TestCase):
    def test_sem_cabecalho_nao_abre(self):
        with self.assertRaises(BoneError):
            load_skeleton_document({"bones": [{"name": "root"}]})

    def test_sem_osso_nenhum_nao_abre(self):
        with self.assertRaises(BoneError):
            load_skeleton_document({"bone": dict(HEADER), "bones": []})

    def test_bom_com_bom_e_aceito(self):
        texto = json.dumps({"bone": dict(HEADER), "bones": [{"name": "root"}]})
        dados = b"\xef\xbb\xbf" + texto.encode("utf-8")
        self.assertEqual(len(load_skeleton_bytes(dados).bones), 1)


class TestVersao(unittest.TestCase):
    def test_minor_maior_abre_com_aviso(self):
        header = dict(HEADER, version="1.7", minVersion="1.0")
        data = load_skeleton_document({"bone": header, "bones": [{"name": "root"}]})
        self.assertTrue(any("mais novo" in m for m in data.warnings.messages))

    def test_minor_maior_sem_min_compativel_ainda_abre(self):
        header = dict(HEADER, version="1.7", minVersion="1.7")
        data = load_skeleton_document({"bone": header, "bones": [{"name": "root"}]})
        self.assertEqual(len(data.bones), 1)

    def test_major_maior_pode_ser_recusado(self):
        header = dict(HEADER, version="2.0", minVersion="2.0")
        with self.assertRaises(BoneError):
            load_skeleton_document({"bone": header, "bones": [{"name": "root"}]})


class TestExtensoes(unittest.TestCase):
    def test_extensao_nao_exigida_e_ignorada(self):
        data = carregar(
            bones=[{"name": "root"}],
            extensionsUsed=["ACME_glow"],
            extensions={"ACME_glow": {"radius": 4}},
        )
        self.assertEqual(len(data.bones), 1)

    def test_extensao_exigida_e_desconhecida_recusa_o_arquivo(self):
        with self.assertRaises(BoneError) as caso:
            carregar(bones=[{"name": "root"}],
                     extensionsUsed=["VENDOR_malha_volumetrica"],
                     extensionsRequired=["VENDOR_malha_volumetrica"])
        self.assertIn("VENDOR_malha_volumetrica", str(caso.exception))


class TestFallbacks(unittest.TestCase):
    def test_propriedade_desconhecida_e_ignorada(self):
        data = carregar(bones=[{"name": "root", "acme_brilho": 3}], acme_raiz=1)
        self.assertEqual(data.bones[0].name, "root")

    def test_constraint_de_tipo_desconhecido_e_ignorada(self):
        data = carregar(
            bones=[{"name": "root"}, {"name": "osso", "parent": "root"}],
            constraints=[{"type": "acme_magnet", "name": "ima",
                          "bones": ["osso"], "target": "root"}],
        )
        self.assertEqual(data.constraints, [])

    def test_timeline_de_tipo_desconhecido_e_ignorada(self):
        data = carregar(
            bones=[{"name": "root"}],
            animations=[{"name": "a", "duration": 1, "timelines": [
                {"type": "acme_glow", "target": "root",
                 "keys": [{"time": 0, "value": 1}]}]}],
        )
        self.assertEqual(data.animations[0].timelines, [])

    def test_propriedade_de_osso_desconhecida_e_ignorada(self):
        data = carregar(
            bones=[{"name": "root"}],
            animations=[{"name": "a", "duration": 1, "timelines": [
                {"type": "bone", "target": "root", "property": "acme_glow",
                 "keys": [{"time": 0, "value": 1}]}]}],
        )
        self.assertEqual(data.animations[0].timelines, [])

    def test_blend_desconhecido_vira_normal(self):
        data = carregar(bones=[{"name": "root"}],
                        slots=[{"name": "s", "bone": "root", "blend": "acme"}])
        self.assertEqual(data.slots[0].blend, "normal")

    def test_modo_de_path_desconhecido_volta_ao_padrao(self):
        data = carregar(
            bones=[{"name": "root"}, {"name": "b", "parent": "root"}],
            slots=[{"name": "t", "bone": "root"}],
            constraints=[{"type": "path", "name": "pc", "bones": ["b"], "target": "t",
                          "positionMode": "acme", "spacingMode": "acme",
                          "rotateMode": "acme"}],
        )
        constraint = data.constraints[0]
        self.assertEqual(constraint.position_mode, "percent")
        self.assertEqual(constraint.spacing_mode, "length")
        self.assertEqual(constraint.rotate_mode, "tangent")

    def test_variavel_de_tipo_desconhecido_e_ignorada(self):
        data = carregar(bones=[{"name": "root"}],
                        variables=[{"name": "v", "type": "acme"}])
        self.assertEqual(data.variables, [])

    def test_curva_desconhecida_vira_linear(self):
        skeleton = build(
            bones=[{"name": "root"}, {"name": "osso", "parent": "root"}],
            animations=[{"name": "a", "duration": 1, "timelines": [
                {"type": "bone", "target": "osso", "property": "x", "keys": [
                    {"time": 0, "value": 0, "curve": "acme_quicar"},
                    {"time": 1, "value": 100}]}]}],
        )
        from recorte.animation import evaluate_keys
        chaves = skeleton.data.animations[0].timelines[0].keys
        self.assertAlmostEqual(evaluate_keys(chaves, 0.5), 50)


class TestReferenciasQuebradas(unittest.TestCase):
    def test_osso_com_pai_inexistente_vira_filho_da_raiz(self):
        data = carregar(bones=[{"name": "root"},
                               {"name": "orfao", "parent": "nao_existe", "x": 5}])
        self.assertIs(data.bones[1].parent, data.bones[0])
        self.assertTrue(any("pai invalido" in m for m in data.warnings.messages))

    def test_slot_com_osso_inexistente_vai_para_a_raiz(self):
        data = carregar(bones=[{"name": "root"}],
                        slots=[{"name": "s", "bone": "nao_existe"}])
        self.assertIs(data.slots[0].bone, data.bones[0])

    def test_regra_com_alvo_quebrado_nao_muda_nada(self):
        skeleton = build(
            bones=[{"name": "root"}, {"name": "b", "parent": "root", "x": 10}],
            constraints=[{"type": "ik", "name": "ik", "bones": ["b"],
                          "target": "nao_existe"}],
        )
        self.assertAlmostEqual(skeleton.bone_by_name["b"].world_x, 10)


class TestVariaveisETags(unittest.TestCase):
    def test_variavel_int_e_truncada(self):
        from recorte.animation import apply_animation
        skeleton = build(
            bones=[{"name": "root"}],
            variables=[{"name": "passos", "type": "int", "default": 0}],
            animations=[{"name": "a", "duration": 1, "timelines": [
                {"type": "variable", "target": "passos", "property": "value", "keys": [
                    {"time": 0, "value": 0}, {"time": 1, "value": 10}]}]}],
        )
        apply_animation(skeleton, skeleton.data.animations[0], 0.55)
        self.assertEqual(skeleton.variables["passos"], 5)

    def test_tags_da_animacao_e_da_timeline_se_juntam(self):
        from recorte.animation import active_tags
        skeleton = build(
            bones=[{"name": "root"}],
            tags=["idle", "ataque"],
            animations=[{"name": "a", "duration": 1, "tags": ["idle"], "timelines": [
                {"type": "tag", "keys": [{"time": 0, "value": []},
                                         {"time": 0.5, "value": ["ataque"]}]}]}],
        )
        animation = skeleton.data.animations[0]
        self.assertEqual(active_tags(skeleton, animation, 0.1), ["idle"])
        self.assertEqual(active_tags(skeleton, animation, 0.6), ["idle", "ataque"])


if __name__ == "__main__":
    unittest.main()

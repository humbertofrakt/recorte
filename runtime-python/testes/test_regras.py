# SPDX-License-Identifier: Apache-2.0
"""The five constraints (spec 6 and 8.2)."""

from __future__ import annotations

import math
import unittest

from base import build
from recorte.animation import apply_animation
from recorte.constraints import PhysicsConstraint
from recorte.skeleton import atan2d, normalized


class TestIk(unittest.TestCase):
    def test_um_osso_aponta_para_o_alvo(self):
        skeleton = build(
            bones=[{"name": "root"},
                   {"name": "b", "parent": "root", "length": 50},
                   {"name": "alvo", "parent": "root", "x": 0, "y": 100}],
            constraints=[{"type": "ik", "name": "ik", "bones": ["b"], "target": "alvo"}],
        )
        b = skeleton.bone_by_name["b"]
        self.assertAlmostEqual(normalized(b.applied.rotation), 90, places=4)

    def test_mix_parcial_gira_metade(self):
        skeleton = build(
            bones=[{"name": "root"},
                   {"name": "b", "parent": "root", "length": 50},
                   {"name": "alvo", "parent": "root", "x": 0, "y": 100}],
            constraints=[{"type": "ik", "name": "ik", "bones": ["b"],
                          "target": "alvo", "mix": 0.5}],
        )
        self.assertAlmostEqual(normalized(skeleton.bone_by_name["b"].applied.rotation),
                               45, places=4)

    def test_mix_zero_deixa_em_fk(self):
        skeleton = build(
            bones=[{"name": "root"},
                   {"name": "b", "parent": "root", "length": 50, "rotation": 10},
                   {"name": "alvo", "parent": "root", "x": 0, "y": 100}],
            constraints=[{"type": "ik", "name": "ik", "bones": ["b"],
                          "target": "alvo", "mix": 0}],
        )
        self.assertAlmostEqual(skeleton.bone_by_name["b"].applied.rotation, 10)

    def test_estica_ate_o_alvo(self):
        skeleton = build(
            bones=[{"name": "root"},
                   {"name": "b", "parent": "root", "length": 50},
                   {"name": "alvo", "parent": "root", "x": 100, "y": 0}],
            constraints=[{"type": "ik", "name": "ik", "bones": ["b"],
                          "target": "alvo", "stretch": True}],
        )
        self.assertAlmostEqual(skeleton.bone_by_name["b"].applied.scale_x, 2, places=4)

    def test_dois_ossos_dobram_no_lado_pedido(self):
        def rig(bend):
            return build(
                bones=[{"name": "root"},
                       {"name": "P", "parent": "root", "length": 100},
                       {"name": "C", "parent": "P", "x": 100, "length": 100},
                       {"name": "alvo", "parent": "root", "x": 0, "y": 100}],
                constraints=[{"type": "ik", "name": "ik", "bones": ["P", "C"],
                              "target": "alvo", "bendPositive": bend}],
            )
        positivo = rig(True)
        self.assertAlmostEqual(normalized(positivo.bone_by_name["P"].applied.rotation),
                               30, places=4)
        self.assertAlmostEqual(normalized(positivo.bone_by_name["C"].applied.rotation),
                               120, places=4)
        negativo = rig(False)
        self.assertAlmostEqual(normalized(negativo.bone_by_name["C"].applied.rotation),
                               -120, places=4)

    def test_a_ponta_chega_no_alvo(self):
        skeleton = build(
            bones=[{"name": "root"},
                   {"name": "P", "parent": "root", "length": 100},
                   {"name": "C", "parent": "P", "x": 100, "length": 100},
                   {"name": "alvo", "parent": "root", "x": 60, "y": 80}],
            constraints=[{"type": "ik", "name": "ik", "bones": ["P", "C"], "target": "alvo"}],
        )
        C = skeleton.bone_by_name["C"]
        ponta_x, ponta_y = C.local_to_world(C.length, 0)
        self.assertAlmostEqual(ponta_x, 60, places=3)
        self.assertAlmostEqual(ponta_y, 80, places=3)


class TestTransform(unittest.TestCase):
    def _rig(self, **extra):
        constraint = {"type": "transform", "name": "tc", "bones": ["osso"],
                      "target": "alvo"}
        constraint.update(extra)
        return build(
            bones=[{"name": "root"},
                   {"name": "alvo", "parent": "root", "x": 100, "y": 0, "rotation": 40},
                   {"name": "osso", "parent": "root", "x": 10, "y": 20}],
            constraints=[constraint],
        )

    def test_mundo_absoluto_copia_a_rotacao(self):
        skeleton = self._rig(mixX=0, mixY=0, mixScaleX=0, mixScaleY=0, mixShearY=0)
        osso = skeleton.bone_by_name["osso"]
        self.assertAlmostEqual(atan2d(osso.c, osso.a), 40, places=4)

    def test_mundo_absoluto_leva_a_posicao(self):
        skeleton = self._rig(mixRotation=0, mixScaleX=0, mixScaleY=0, mixShearY=0)
        osso = skeleton.bone_by_name["osso"]
        self.assertAlmostEqual(osso.world_x, 100, places=4)
        self.assertAlmostEqual(osso.world_y, 0, places=4)

    def test_mundo_relativo_soma_a_rotacao(self):
        skeleton = self._rig(relative=True, mixX=0, mixY=0, mixScaleX=0,
                             mixScaleY=0, mixShearY=0)
        osso = skeleton.bone_by_name["osso"]
        self.assertAlmostEqual(atan2d(osso.c, osso.a), 40, places=4)

    def test_local_absoluto_copia_a_pose_aplicada(self):
        skeleton = self._rig(local=True, mixScaleX=0, mixScaleY=0, mixShearY=0)
        osso = skeleton.bone_by_name["osso"]
        self.assertAlmostEqual(osso.applied.x, 100, places=4)
        self.assertAlmostEqual(osso.applied.rotation, 40, places=4)

    def test_local_relativo_soma(self):
        skeleton = self._rig(local=True, relative=True, mixScaleX=0,
                             mixScaleY=0, mixShearY=0)
        osso = skeleton.bone_by_name["osso"]
        self.assertAlmostEqual(osso.applied.x, 110, places=4)
        self.assertAlmostEqual(osso.applied.rotation, 40, places=4)


TRILHO = {
    "type": "path", "closed": False, "constantSpeed": True,
    "lengths": [300, 600],
    "vertices": [-100, 0, 0, 0, 100, 0,
                 200, 0, 300, 0, 300, 100,
                 300, 200, 300, 300, 300, 400],
}


class TestPath(unittest.TestCase):
    def _rig(self, **extra):
        constraint = {"type": "path", "name": "pc", "bones": ["b1", "b2", "b3"],
                      "target": "trilho"}
        constraint.update(extra)
        return build(
            bones=[{"name": "root"}] + [{"name": f"b{i}", "parent": "root", "length": 100}
                                        for i in (1, 2, 3)],
            slots=[{"name": "trilho", "bone": "root", "attachment": "trilho"}],
            skins=[{"name": "default", "attachments": {"trilho": {"trilho": TRILHO}}}],
            constraints=[constraint],
        )

    def test_posicao_fixa_e_espaco_fixo(self):
        skeleton = self._rig(positionMode="fixed", spacingMode="fixed",
                             rotateMode="tangent", position=250, spacing=100)
        b1 = skeleton.bone_by_name["b1"]
        b2 = skeleton.bone_by_name["b2"]
        self.assertAlmostEqual(b1.world_x, 250, places=4)
        self.assertAlmostEqual(b2.world_x, 300, places=4)
        self.assertAlmostEqual(b2.world_y, 50, places=4)
        self.assertAlmostEqual(normalized(atan2d(b2.c, b2.a)), 90, places=4)

    def test_porcentagem_usa_o_comprimento_total(self):
        skeleton = self._rig(positionMode="percent", spacingMode="percent",
                             rotateMode="tangent", position=0, spacing=0.3)
        self.assertAlmostEqual(skeleton.bone_by_name["b2"].world_x, 180, places=4)

    def test_extrapola_antes_do_inicio(self):
        skeleton = self._rig(positionMode="fixed", spacingMode="fixed",
                             rotateMode="tangent", position=-50, spacing=0)
        self.assertAlmostEqual(skeleton.bone_by_name["b1"].world_x, -50, places=4)

    def test_slot_sem_attachment_path_nao_faz_nada(self):
        skeleton = build(
            bones=[{"name": "root"}, {"name": "b1", "parent": "root", "length": 100}],
            slots=[{"name": "trilho", "bone": "root", "attachment": "outro"}],
            skins=[{"name": "default", "attachments": {"trilho": {
                "outro": {"type": "region", "width": 10, "height": 10}}}}],
            constraints=[{"type": "path", "name": "pc", "bones": ["b1"],
                          "target": "trilho", "position": 200}],
        )
        self.assertAlmostEqual(skeleton.bone_by_name["b1"].world_x, 0)


class TestFisica(unittest.TestCase):
    def _rig(self):
        return build(
            skeleton={"name": "fisica", "referenceScale": 100},
            bones=[{"name": "root"},
                   {"name": "base", "parent": "root", "y": 100},
                   {"name": "haste", "parent": "base", "length": 50}],
            constraints=[{"type": "physics", "name": "fis", "bone": "haste",
                          "x": 1, "y": 1, "rotation": 1, "inertia": 0.5,
                          "strength": 100, "damping": 1, "mass": 1,
                          "gravity": 10, "limit": 5000, "fps": 60}],
            animations=[{"name": "correr", "duration": 1, "timelines": [
                {"type": "bone", "target": "base", "property": "x", "keys": [
                    {"time": 0, "value": 0}, {"time": 1, "value": 200}]}]}],
        )

    def _rodar(self, skeleton, passos, dt=0.01):
        animation = skeleton.data.animations[0]
        for passo in range(passos + 1):
            agora = passo * dt
            apply_animation(skeleton, animation, agora)
            skeleton.update_pose(agora)
        return skeleton.bone_by_name["haste"]

    def test_primeiro_quadro_nao_desloca(self):
        haste = self._rodar(self._rig(), 0)
        self.assertAlmostEqual(haste.world_x, 0, places=6)
        self.assertAlmostEqual(haste.world_y, 100, places=6)

    def test_a_haste_atrasa_e_cai(self):
        skeleton = self._rig()
        haste = self._rodar(skeleton, 10)
        base = skeleton.bone_by_name["base"]
        self.assertLess(haste.world_x, base.world_x)
        self.assertLess(haste.world_y, 100)

    def test_determinismo_com_o_mesmo_passo(self):
        a = self._rodar(self._rig(), 30)
        b = self._rodar(self._rig(), 30)
        self.assertAlmostEqual(a.world_x, b.world_x, places=9)
        self.assertAlmostEqual(a.world_y, b.world_y, places=9)

    def test_reset_zera_a_simulacao(self):
        skeleton = self._rig()
        self._rodar(skeleton, 20)
        fisica = next(c for c in skeleton.constraints if isinstance(c, PhysicsConstraint))
        self.assertNotAlmostEqual(fisica.x_offset, 0, places=6)
        fisica.physics_reset(0.2)
        self.assertEqual(fisica.x_offset, 0.0)
        self.assertEqual(fisica.y_velocity, 0.0)
        self.assertTrue(fisica.reset)


class TestDriver(unittest.TestCase):
    def test_modo_alvos_move_um_osso(self):
        skeleton = build(
            bones=[{"name": "root"}, {"name": "osso", "parent": "root"}],
            parameters=[{"name": "abrir", "min": 0, "max": 1, "default": 0.5}],
            constraints=[{"type": "driver", "name": "dr", "parameter": "abrir",
                          "targets": [{"type": "bone", "target": "osso",
                                       "property": "rotation",
                                       "keys": [{"input": 0, "value": 0},
                                                {"input": 1, "value": 90}]}]}],
        )
        self.assertAlmostEqual(skeleton.bone_by_name["osso"].applied.rotation, 45, places=4)

    def test_parametro_e_grampeado_na_faixa(self):
        skeleton = build(
            bones=[{"name": "root"}, {"name": "osso", "parent": "root"}],
            parameters=[{"name": "abrir", "min": 0, "max": 1, "default": 0}],
            constraints=[{"type": "driver", "name": "dr", "parameter": "abrir",
                          "targets": [{"type": "bone", "target": "osso",
                                       "property": "rotation",
                                       "keys": [{"input": 0, "value": 0},
                                                {"input": 1, "value": 90}]}]}],
        )
        skeleton.parameters["abrir"] = 5      # fora da faixa
        skeleton.update_pose(0)
        self.assertAlmostEqual(skeleton.bone_by_name["osso"].applied.rotation, 90, places=4)

    def test_parametro_dirigido_por_osso(self):
        skeleton = build(
            bones=[{"name": "root"},
                   {"name": "manete", "parent": "root", "rotation": 45},
                   {"name": "osso", "parent": "root"}],
            parameters=[{"name": "abrir", "min": 0, "max": 1, "default": 0,
                         "source": {"bone": "manete", "property": "rotation",
                                    "from": 0, "to": 90}}],
            constraints=[{"type": "driver", "name": "dr", "parameter": "abrir",
                          "targets": [{"type": "bone", "target": "osso",
                                       "property": "x",
                                       "keys": [{"input": 0, "value": 0},
                                                {"input": 1, "value": 100}]}]}],
        )
        self.assertAlmostEqual(skeleton.bone_by_name["osso"].applied.x, 50, places=4)

    def test_modo_continuo_le_uma_animacao(self):
        skeleton = build(
            bones=[{"name": "root"}, {"name": "osso", "parent": "root"}],
            parameters=[{"name": "fase", "min": 0, "max": 1, "default": 0.25}],
            animations=[{"name": "controle", "duration": 1, "timelines": [
                {"type": "bone", "target": "osso", "property": "y", "keys": [
                    {"time": 0, "value": 0}, {"time": 1, "value": 40}]}]}],
            constraints=[{"type": "driver", "name": "dr", "parameter": "fase",
                          "animation": "controle"}],
        )
        self.assertAlmostEqual(skeleton.bone_by_name["osso"].applied.y, 10, places=4)


class TestOrdemDasRegras(unittest.TestCase):
    def test_a_segunda_regra_le_o_resultado_da_primeira(self):
        skeleton = build(
            bones=[{"name": "root"},
                   {"name": "a", "parent": "root"},
                   {"name": "alvo1", "parent": "root", "x": 50, "y": 0},
                   {"name": "alvo2", "parent": "root", "x": 50, "y": 50}],
            constraints=[
                {"type": "transform", "name": "t1", "bones": ["a"], "target": "alvo1",
                 "mixRotation": 0, "mixScaleX": 0, "mixScaleY": 0, "mixShearY": 0},
                {"type": "transform", "name": "t2", "bones": ["a"], "target": "alvo2",
                 "mixRotation": 0, "mixX": 0, "mixScaleX": 0, "mixScaleY": 0,
                 "mixShearY": 0},
            ],
        )
        a = skeleton.bone_by_name["a"]
        self.assertAlmostEqual(a.world_x, 50, places=4)
        self.assertAlmostEqual(a.world_y, 50, places=4)


if __name__ == "__main__":
    unittest.main()

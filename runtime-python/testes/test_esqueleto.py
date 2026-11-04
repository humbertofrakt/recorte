# SPDX-License-Identifier: Apache-2.0
"""Setup pose, world transforms and the five inheritance modes (spec 5)."""

from __future__ import annotations

import math
import unittest

from base import build
from recorte.skeleton import atan2d, cosd, normalized, sind


class TestConvencoes(unittest.TestCase):
    def test_atan2_de_zero_e_zero(self):
        self.assertEqual(atan2d(0, 0), 0.0)

    def test_reducao_de_angulo(self):
        self.assertAlmostEqual(normalized(370), 10)
        self.assertAlmostEqual(normalized(-370), -10)
        self.assertAlmostEqual(normalized(180), 180)
        self.assertAlmostEqual(normalized(-180), 180)
        self.assertAlmostEqual(normalized(720), 0)

    def test_graus(self):
        self.assertAlmostEqual(cosd(60), 0.5)
        self.assertAlmostEqual(sind(30), 0.5)


class TestMundo(unittest.TestCase):
    def test_raiz_usa_a_pose_local(self):
        skeleton = build(bones=[{"name": "root", "x": 3, "y": 4, "rotation": 90}])
        root = skeleton.bones[0]
        self.assertAlmostEqual(root.world_x, 3)
        self.assertAlmostEqual(root.world_y, 4)
        self.assertAlmostEqual(root.a, 0, places=6)
        self.assertAlmostEqual(root.c, 1, places=6)

    def test_translacao_usa_a_matriz_completa_do_pai(self):
        skeleton = build(bones=[
            {"name": "root"},
            {"name": "pai", "parent": "root", "x": 10, "rotation": 90},
            {"name": "filho", "parent": "pai", "x": 5,
             "inheritRotation": False, "inheritScale": False, "inheritReflection": False},
        ])
        filho = skeleton.bone_by_name["filho"]
        # A translacao sempre passa pela matriz do pai, mesmo em onlyTranslation.
        self.assertAlmostEqual(filho.world_x, 10, places=6)
        self.assertAlmostEqual(filho.world_y, 5, places=6)
        self.assertAlmostEqual(filho.a, 1, places=6)

    def test_cinco_modos_de_heranca(self):
        skeleton = build(bones=[
            {"name": "root"},
            {"name": "pai", "parent": "root", "x": 10, "y": 20,
             "rotation": 90, "scaleX": 2, "scaleY": -1},
            {"name": "normal", "parent": "pai", "x": 10, "rotation": 30},
            {"name": "so_translacao", "parent": "pai", "x": 10, "rotation": 30,
             "inheritRotation": False, "inheritScale": False, "inheritReflection": False},
            {"name": "sem_rotacao", "parent": "pai", "x": 10, "rotation": 30,
             "inheritRotation": False, "inheritScale": True, "inheritReflection": False},
            {"name": "sem_escala", "parent": "pai", "x": 10, "rotation": 30,
             "inheritRotation": True, "inheritScale": False, "inheritReflection": True},
            {"name": "sem_escala_nem_reflexo", "parent": "pai", "x": 10, "rotation": 30,
             "inheritRotation": True, "inheritScale": False, "inheritReflection": False},
        ])
        esperado = {
            "normal": (0.5, 0.866025, 1.732051, -1),
            "so_translacao": (0.866025, -0.5, 0.5, 0.866025),
            "sem_rotacao": (0.866025, -0.5, 1, 1.732051),
            "sem_escala": (0.27735, 0.960769, 0.960769, -0.27735),
            "sem_escala_nem_reflexo": (0.27735, -0.960769, 0.960769, 0.27735),
        }
        for nome, (a, b, c, d) in esperado.items():
            bone = skeleton.bone_by_name[nome]
            self.assertAlmostEqual(bone.a, a, places=5, msg=nome)
            self.assertAlmostEqual(bone.b, b, places=5, msg=nome)
            self.assertAlmostEqual(bone.c, c, places=5, msg=nome)
            self.assertAlmostEqual(bone.d, d, places=5, msg=nome)

    def test_os_tres_modos_do_f3_tem_formula_propria(self):
        # F3 (5.3): as tres combinacoes que eram reservadas tem modo proprio.
        # Pai do A-010, refletido; as contas estao nos leiames C-283 a C-285.
        skeleton = build(bones=[
            {"name": "root"},
            {"name": "pai", "parent": "root", "rotation": 90, "scaleX": 2, "scaleY": -1},
            {"name": "noRotation", "parent": "pai", "x": 10, "rotation": 30,
             "inheritRotation": False, "inheritScale": True, "inheritReflection": True},
            {"name": "noReflection", "parent": "pai", "x": 10, "rotation": 30,
             "inheritRotation": True, "inheritScale": True, "inheritReflection": False},
            {"name": "onlyReflection", "parent": "pai", "x": 10, "rotation": 30,
             "inheritRotation": False, "inheritScale": False, "inheritReflection": True},
        ])
        esperado = {
            "noRotation": (-0.8660254, 0.5, 1.0, 1.7320508),
            "noReflection": (-0.5, -0.8660254, 1.7320508, -1.0),
            "onlyReflection": (0.8660254, 0.5, 0.5, -0.8660254),
        }
        for nome, (a, b, c, d) in esperado.items():
            bone = skeleton.bone_by_name[nome]
            self.assertEqual(bone.mode(), nome)
            self.assertAlmostEqual(bone.a, a, places=6, msg=nome)
            self.assertAlmostEqual(bone.b, b, places=6, msg=nome)
            self.assertAlmostEqual(bone.c, c, places=6, msg=nome)
            self.assertAlmostEqual(bone.d, d, places=6, msg=nome)

    def test_ik_de_um_osso_mira_o_alvo_nos_modos_do_f3(self):
        # noReflection e onlyReflection: com mix 1, o eixo X do osso aponta
        # para o alvo, com o pai refletido e cisalhado.
        from recorte.constraints import ik1
        for nome, heranca in (
            ("noReflection", {"inheritReflection": False}),
            ("onlyReflection", {"inheritRotation": False, "inheritScale": False}),
        ):
            skeleton = build(bones=[
                {"name": "root"},
                {"name": "pai", "parent": "root", "x": 50, "y": 20, "rotation": 25,
                 "scaleX": 2, "scaleY": -0.7, "shearY": 15},
                dict({"name": nome, "parent": "pai", "x": 10, "y": 5, "rotation": 30,
                      "scaleX": 1.5, "scaleY": 0.8, "shearY": 10}, **heranca),
            ])
            bone = skeleton.bone_by_name[nome]
            tx = bone.world_x + 30
            ty = bone.world_y - 40
            ik1(bone, tx, ty, False, False, False, 1.0)
            bone.update_world()
            eixo = math.atan2(bone.c, bone.a)
            alvo = math.atan2(ty - bone.world_y, tx - bone.world_x)
            diferenca = abs(((eixo - alvo + 3 * math.pi) % (2 * math.pi)) - math.pi)
            self.assertLess(diferenca, 1e-6, msg=nome)

    def test_escala_zero_nao_vira_nan(self):
        skeleton = build(bones=[
            {"name": "root"},
            {"name": "nulo", "parent": "root", "x": 1, "y": 2, "scaleX": 0, "scaleY": 0},
        ])
        bone = skeleton.bone_by_name["nulo"]
        for valor in (bone.a, bone.b, bone.c, bone.d):
            self.assertTrue(math.isfinite(valor))
            self.assertAlmostEqual(valor, 0, places=9)
        self.assertAlmostEqual(bone.world_x, 1)


class TestMundoParaLocal(unittest.TestCase):
    def _skeleton(self):
        return build(bones=[
            {"name": "root"},
            {"name": "b", "parent": "root", "x": 10, "y": 20,
             "rotation": 25, "scaleX": 2, "scaleY": 1.5},
        ])

    def test_ida_e_volta_de_ponto(self):
        bone = self._skeleton().bone_by_name["b"]
        wx, wy = bone.local_to_world(7, -3)
        lx, ly = bone.world_to_local(wx, wy)
        self.assertAlmostEqual(lx, 7, places=6)
        self.assertAlmostEqual(ly, -3, places=6)

    def test_determinante_degenerado_devolve_zero(self):
        skeleton = build(bones=[{"name": "root", "scaleX": 0, "scaleY": 0}])
        self.assertEqual(skeleton.bones[0].world_to_local(5, 5), (0.0, 0.0))

    def test_aplicada_a_partir_do_mundo_fecha_sem_cisalhamento(self):
        skeleton = self._skeleton()
        bone = skeleton.bone_by_name["b"]
        antes = (bone.a, bone.b, bone.c, bone.d, bone.world_x, bone.world_y)
        bone.applied_from_world()
        bone.update_world()
        depois = (bone.a, bone.b, bone.c, bone.d, bone.world_x, bone.world_y)
        for x, y in zip(antes, depois):
            self.assertAlmostEqual(x, y, places=6)

    def test_a_raiz_com_shear_nao_fecha_e_a_spec_diz_isso(self):
        # 5.5: na raiz o sinal do shearY e o oposto do ramo com pai.
        skeleton = build(bones=[{"name": "root", "shearY": 30}])
        bone = skeleton.bones[0]
        bone.applied_from_world()
        self.assertAlmostEqual(bone.applied.shear_y, -30, places=4)


if __name__ == "__main__":
    unittest.main()

# SPDX-License-Identifier: Apache-2.0
"""Timelines, curves, draw order, sequences and events (spec 8 and 9)."""

from __future__ import annotations

import unittest

from base import build
from recorte.animation import (
    apply_animation,
    draw_order_from_offsets,
    evaluate_keys,
    fire_events,
    sequence_frame,
)
from recorte.loader import Key, Sequence

BONES = [{"name": "root"}, {"name": "osso", "parent": "root"}]


def keys(*items):
    out = []
    for item in items:
        key = Key(time=item[0], value=item[1])
        key.curve = item[2] if len(item) > 2 else "linear"
        out.append(key)
    return out


class TestCurvas(unittest.TestCase):
    def test_antes_da_primeira_e_depois_da_ultima(self):
        k = keys((1, 100), (2, 200))
        self.assertEqual(evaluate_keys(k, 0), 100)
        self.assertEqual(evaluate_keys(k, 5), 200)

    def test_linear(self):
        k = keys((0, 0), (2, 100))
        self.assertAlmostEqual(evaluate_keys(k, 0.5), 25)

    def test_stepped_segura_o_valor(self):
        k = keys((0, 0, "stepped"), (2, 100))
        self.assertEqual(evaluate_keys(k, 1.9), 0)
        self.assertEqual(evaluate_keys(k, 2), 100)

    def test_bezier_absoluta(self):
        # Handles absolutos: cx em segundos, cy em unidades do valor.
        k = keys((0, 0, [1.5, 0, 1.5, 0]), (3, 100))
        meio = evaluate_keys(k, 1.5)
        self.assertGreater(meio, 0)
        self.assertLess(meio, 50)

    def test_bezier_com_handles_fora_da_faixa_e_limitada(self):
        dentro = keys((0, 0, [0.0, 0, 1.0, 100]), (1, 100))
        fora = keys((0, 0, [-5.0, 0, 9.0, 100]), (1, 100))
        self.assertAlmostEqual(evaluate_keys(dentro, 0.5),
                              evaluate_keys(fora, 0.5), places=6)

    def test_valor_nao_numerico_e_sempre_stepped(self):
        k = keys((0, "aberta"), (1, "fechada"))
        self.assertEqual(evaluate_keys(k, 0.9), "aberta")

    def test_rotacao_nao_faz_wrap(self):
        skeleton = build(
            bones=BONES,
            animations=[{"name": "girar", "duration": 1, "timelines": [
                {"type": "bone", "target": "osso", "property": "rotation",
                 "keys": [{"time": 0, "value": 350}, {"time": 1, "value": 10}]}]}],
        )
        apply_animation(skeleton, skeleton.data.animations[0], 0.5)
        self.assertAlmostEqual(skeleton.bone_by_name["osso"].local.rotation, 180)


class TestOrdemDeDesenho(unittest.TestCase):
    def _skeleton(self):
        return build(
            bones=[{"name": "root"}],
            slots=[{"name": f"s{i}", "bone": "root"} for i in range(4)],
        )

    def test_ordem_de_setup(self):
        skeleton = self._skeleton()
        self.assertEqual(draw_order_from_offsets(skeleton, []), [0, 1, 2, 3])

    def test_deslocamento_negativo(self):
        skeleton = self._skeleton()
        ordem = draw_order_from_offsets(skeleton, [{"slot": "s3", "offset": -3}])
        self.assertEqual([skeleton.slots[i].name for i in ordem],
                         ["s3", "s0", "s1", "s2"])

    def test_indice_fora_de_faixa_e_grampeado(self):
        skeleton = self._skeleton()
        ordem = draw_order_from_offsets(skeleton, [{"slot": "s0", "offset": 99}])
        self.assertEqual(ordem[3], 0)

    def test_slot_inexistente_e_ignorado(self):
        skeleton = self._skeleton()
        self.assertEqual(draw_order_from_offsets(skeleton, [{"slot": "nao_existe", "offset": 1}]),
                         [0, 1, 2, 3])


class TestSequencias(unittest.TestCase):
    def setUp(self):
        self.sequence = Sequence(count=4, start=1, digits=0, setup=2)

    def test_hold(self):
        self.assertEqual(sequence_frame(self.sequence, "hold", 1, 0.1, 0, 0.5), 1)

    def test_delay_zero_equivale_a_hold(self):
        self.assertEqual(sequence_frame(self.sequence, "loop", 1, 0, 0, 0.5), 1)

    def test_once_para_no_ultimo(self):
        self.assertEqual(sequence_frame(self.sequence, "once", 1, 0.1, 0, 0.6), 3)

    def test_loop_da_a_volta(self):
        self.assertEqual(sequence_frame(self.sequence, "loop", 1, 0.1, 0, 0.3), 0)

    def test_pingpong_volta(self):
        self.assertEqual(sequence_frame(self.sequence, "pingpong", 1, 0.1, 0, 0.3), 2)

    def test_reversos(self):
        self.assertEqual(sequence_frame(self.sequence, "onceReverse", 2, 0.1, 0, 0.2), 0)
        self.assertEqual(sequence_frame(self.sequence, "loopReverse", 2, 0.1, 0, 0.3), 2)
        self.assertEqual(sequence_frame(self.sequence, "loopReverse", 2, 0.1, 0, 0.2), 3)

    def test_modo_desconhecido_vira_hold(self):
        self.assertEqual(sequence_frame(self.sequence, "acme", 1, 0.1, 0, 0.9), 1)

    def test_nome_do_frame(self):
        sequence = Sequence(count=4, start=1, digits=2)
        self.assertEqual(sequence.frame_name("olho_", 3), "olho_04")
        explicita = Sequence(count=2, frames=["a", "b"])
        self.assertEqual(explicita.frame_name("olho_", 1), "b")


class TestEventos(unittest.TestCase):
    def _skeleton(self):
        return build(
            bones=BONES,
            events=[{"name": "passo", "int": 1, "float": 0.5, "string": "esquerdo",
                     "volume": 0.8}],
            animations=[{"name": "andar", "duration": 1, "loop": True, "timelines": [
                {"type": "event", "keys": [{"time": 0.25, "event": "passo", "int": 2}]}]}],
        )

    def test_payload_da_chave_sobrescreve_a_definicao(self):
        skeleton = self._skeleton()
        eventos = fire_events(skeleton, skeleton.data.animations[0], float("-inf"), 0.5, False)
        self.assertEqual(len(eventos), 1)
        self.assertEqual(eventos[0]["int"], 2)
        self.assertEqual(eventos[0]["float"], 0.5)
        self.assertEqual(eventos[0]["string"], "esquerdo")
        self.assertEqual(eventos[0]["volume"], 0.8)

    def test_uma_vez_por_volta_em_laco(self):
        skeleton = self._skeleton()
        eventos = fire_events(skeleton, skeleton.data.animations[0], 0.5, 2.5, True)
        self.assertEqual([e["time"] for e in eventos], [1.25, 2.25])

    def test_sem_laco_nao_repete(self):
        skeleton = self._skeleton()
        eventos = fire_events(skeleton, skeleton.data.animations[0], 0.5, 2.5, False)
        self.assertEqual(eventos, [])


class TestPropriedadeSemTimeline(unittest.TestCase):
    def test_fica_na_setup_pose(self):
        skeleton = build(
            bones=[{"name": "root"}, {"name": "osso", "parent": "root", "x": 42, "y": 7}],
            animations=[{"name": "andar", "duration": 1, "timelines": [
                {"type": "bone", "target": "osso", "property": "x",
                 "keys": [{"time": 0, "value": 100}]}]}],
        )
        apply_animation(skeleton, skeleton.data.animations[0], 0.5)
        osso = skeleton.bone_by_name["osso"]
        self.assertEqual(osso.local.x, 100)
        self.assertEqual(osso.local.y, 7)


if __name__ == "__main__":
    unittest.main()

# SPDX-License-Identifier: Apache-2.0
"""The `BONE_particles` extension, module P — first phase.

Against `formato/extensions/BONE_particles.md` and nothing else. The tests are
grouped the way the spec is: the chance (3.2, 3.3), when a particle is born
(4, 5, 6), where it is (8, 9) and what is drawn (7.1, 14.1).
"""

from __future__ import annotations

import math
import unittest

from base import build
from recorte.loader import ParticleAttachment
from recorte.particles import acaso, pcg

ROOT = [{"name": "root"}, {"name": "emissor", "parent": "root"}]
SLOTS = [{"name": "fx", "bone": "emissor", "attachment": "jato"}]


def emitter(**extra) -> dict:
    return dict({"type": "BONE_particle", "path": "fx/faisca", "seed": 42}, **extra)


def scene(**extra):
    """A skeleton with one emitter in the slot `fx`."""
    return build(
        bones=ROOT, slots=SLOTS, extensionsUsed=["BONE_particles"],
        skins=[{"name": "default", "attachments": {"fx": {"jato": emitter(**extra)}}}],
    )


def emitter_of(skeleton) -> ParticleAttachment:
    attachment, _skin = skeleton.attachment_for(skeleton.slot_by_name["fx"])
    return attachment


# ---------------------------------------------------------------------------
# 3.2 — the hash, before anything else
# ---------------------------------------------------------------------------


class TestOAcaso(unittest.TestCase):
    """A reader that declares P has to reproduce the five reference numbers of
    3.2 exactly. If one of them misses, no particle case will ever pass and the
    defect is the hash, not the arithmetic."""

    def test_os_cinco_numeros_de_referencia(self):
        self.assertEqual(pcg(0), 129708002)
        self.assertEqual(pcg(42), 1223963391)
        self.assertEqual(pcg(0xFFFFFFFF), 3861530882)
        self.assertEqual(acaso(42, 0, 7, 0), 0.4190843105316162)
        self.assertEqual(acaso(42, 0, -3, 0), 0.5181800723075867)

    def test_indice_negativo_e_complemento_de_dois(self):
        # 3.2: -3 enters as 0xFFFFFFFD, never as 3. A reader that takes the
        # modulus makes the previous lap a copy of the current one.
        self.assertEqual(acaso(42, 0, -3, 0), acaso(42, 0, -3 & 0xFFFFFFFF, 0))
        self.assertNotEqual(acaso(42, 0, -3, 0), acaso(42, 0, 3, 0))
        self.assertAlmostEqual(acaso(42, 0, 3, 0), 0.350787878036499, places=12)

    def test_u_fica_entre_zero_e_um(self):
        for index in range(-200, 200):
            for channel in (0, 5, 11):
                u = acaso(7, 1, index, channel)
                self.assertGreaterEqual(u, 0.0)
                self.assertLess(u, 1.0)

    def test_vinte_e_quatro_bits_exatos(self):
        # `(h >> 8) / 2**24` is exact in float32 too (3.2).
        for index in range(50):
            self.assertEqual(acaso(42, 0, index, 0) * 16777216,
                             int(acaso(42, 0, index, 0) * 16777216))

    def test_o_canal_muda_o_numero(self):
        # 3.3: the channel table is frozen; two channels of the same particle
        # are independent draws.
        vistos = {acaso(42, 0, 7, c) for c in range(13)}
        self.assertEqual(len(vistos), 13)

    def test_a_semente_zero_e_valida(self):
        # 9.9: `0` is a valid seed. There is no automatic seed (3.4).
        self.assertNotEqual(acaso(0, 0, 1, 0), acaso(1, 0, 1, 0))


# ---------------------------------------------------------------------------
# 2.1 and 9 — the attachment
# ---------------------------------------------------------------------------


class TestOAnexo(unittest.TestCase):
    def test_o_tipo_prefixado_carrega(self):
        attachment = emitter_of(scene())
        self.assertIsInstance(attachment, ParticleAttachment)
        self.assertEqual(attachment.type, "BONE_particle")

    def test_os_padroes_da_secao_9(self):
        a = emitter_of(scene())
        self.assertEqual(a.rate, 10)
        self.assertEqual(a.lifetime, [1.0, 1.0])
        self.assertEqual(a.max_particles, 1000)
        self.assertEqual(a.speed, [100.0, 100.0])
        self.assertEqual(a.direction, 90)
        self.assertEqual(a.spread, 0)
        self.assertEqual(a.shape, "point")
        self.assertEqual(a.gravity, [0.0, 0.0])     # zero by design (9.5)
        self.assertEqual(a.drag, 0)
        self.assertEqual(a.scale, [1.0, 1.0])
        self.assertEqual(a.space, "local")
        self.assertEqual(a.seed, 42)                 # the one the file wrote
        self.assertTrue(a.looping)
        self.assertEqual(a.sort_mode, "youngestInFront")

    def test_o_path_cai_no_nome_do_placeholder(self):
        skeleton = build(
            bones=ROOT, slots=SLOTS, extensionsUsed=["BONE_particles"],
            skins=[{"name": "default",
                    "attachments": {"fx": {"jato": {"type": "BONE_particle"}}}}])
        self.assertEqual(emitter_of(skeleton).path, "jato")

    def test_forma_desconhecida_nao_desenha_e_avisa(self):
        # 7.4: the only fallback that does NOT pick a default. Falling to
        # `point` would be a silent guess.
        skeleton = scene(shape="triangulo")
        self.assertFalse(emitter_of(skeleton).shape_ok)
        self.assertTrue(any("forma de emissor desconhecida" in m
                            for m in skeleton.data.warnings.messages))

    def test_space_desconhecido_cai_para_local_e_avisa(self):
        skeleton = scene(space="galaxia")
        self.assertEqual(emitter_of(skeleton).space, "local")
        self.assertTrue(any("space de emissor" in m
                            for m in skeleton.data.warnings.messages))

    def test_sortmode_framemode_meshmode_caem_para_o_padrao(self):
        skeleton = scene(sortMode="aleatorio", frameMode="quadro", meshMode="celula")
        a = emitter_of(skeleton)
        self.assertEqual(a.sort_mode, "youngestInFront")
        self.assertEqual(a.frame_mode, "lifetime")
        self.assertEqual(a.mesh_mode, "vertex")

    def test_campo_desconhecido_e_ignorado(self):
        # 2.5: an unknown property is ignored, and the file still loads.
        a = emitter_of(scene(turbulencia=3, rate=5))
        self.assertEqual(a.rate, 5)

    def test_a_rajada_carrega_com_os_padroes_da_4_3(self):
        a = emitter_of(scene(bursts=[{"time": 0.2}]))
        self.assertEqual(len(a.bursts), 1)
        burst = a.bursts[0]
        self.assertEqual((burst.time, burst.count, burst.cycles), (0.2, 1, 1))
        self.assertEqual((burst.interval, burst.probability), (1.0, 1.0))

    def test_prewarm_com_looping_avisa(self):
        # 6: with a loop the laps already fill the emitter; `prewarm` is ignored.
        skeleton = scene(looping=True, prewarm=2)
        self.assertTrue(any("prewarm ignorado" in m
                            for m in skeleton.data.warnings.messages))


class TestSemAExtensao(unittest.TestCase):
    """7.3 — what a reader WITHOUT P does. This reader has P, so the check is
    the other half: an attachment type nobody knows still leaves an empty
    placeholder and warns once (2.5)."""

    def test_tipo_desconhecido_continua_vazio_e_avisa(self):
        skeleton = build(
            bones=ROOT, slots=SLOTS,
            skins=[{"name": "default",
                    "attachments": {"fx": {"jato": {"type": "ACME_fogo"}}}}])
        attachment, _skin = skeleton.attachment_for(skeleton.slot_by_name["fx"])
        self.assertIsNone(attachment)
        self.assertTrue(any("tipo de attachment desconhecido" in m
                            for m in skeleton.data.warnings.messages))

    def test_particula_sem_prefixo_nao_existe(self):
        # 2.1 and 15: nobody writes `"type": "particle"` without the prefix.
        skeleton = build(
            bones=ROOT, slots=SLOTS,
            skins=[{"name": "default",
                    "attachments": {"fx": {"jato": {"type": "particle"}}}}])
        attachment, _skin = skeleton.attachment_for(skeleton.slot_by_name["fx"])
        self.assertIsNone(attachment)


# ---------------------------------------------------------------------------
# 4, 5, 6 — when a particle is born
# ---------------------------------------------------------------------------


def births(skeleton, t, duration=0.0, loop=False, timelines=None):
    from recorte.particles import burst_births, continuous_births
    a = emitter_of(skeleton)
    out = continuous_births(a, timelines or {}, t, duration, loop)
    out.extend(burst_births(a, t))
    return out


class TestONascimento(unittest.TestCase):
    def test_taxa_fixa_da_um_nascimento_por_vaga(self):
        # 4.1: with `rate` constant the inverse of the integral is a division.
        got = births(scene(rate=20, lifetime=[1, 1], looping=False), 0.5)
        self.assertEqual([b.index for b in got], list(range(0, 11)))
        self.assertAlmostEqual(got[7].birth, 0.35, places=12)

    def test_nascimento_no_instante_exato_conta(self):
        # P-001 and P-005: the particle born exactly at `t` is alive, with
        # age 0. `t_i <= t` (5), not `<`.
        got = births(scene(rate=20, lifetime=[1, 1], looping=False), 0.55)
        self.assertEqual(max(b.index for b in got), 11)
        self.assertAlmostEqual([b for b in got if b.index == 11][0].birth, 0.55)

    def test_taxa_zero_nao_gera_ninguem(self):
        self.assertEqual(births(scene(rate=0, looping=False), 5.0), [])

    def test_start_delay_empurra_o_primeiro(self):
        # 9.1: births only from `startDelay` on. Without `prewarm` there is no
        # index before 0, however far back the lifetime window reaches.
        got = births(scene(rate=10, lifetime=[5, 5], startDelay=1, looping=False), 1.25)
        self.assertEqual([b.index for b in got], [0, 1, 2])
        self.assertAlmostEqual(got[0].birth, 1.0, places=12)

    def test_prewarm_conta_a_partir_do_start_delay(self):
        # The spec settles `[-prewarm, t]` (6) and "births only from
        # `startDelay`" (9.1) separately, and says nothing about the two
        # together. The reading here keeps both true: `prewarm` counts back
        # from the emitter's own start. With `startDelay: 0` — the case P-004
        # measures — it is the same window.
        got = births(scene(rate=10, lifetime=[5, 5], startDelay=1,
                           prewarm=0.5, looping=False), 1.25)
        self.assertEqual([b.index for b in got], [-5, -4, -3, -2, -1, 0, 1, 2])
        self.assertAlmostEqual(min(b.birth for b in got), 0.5, places=12)

    def test_emitting_desligado_zera_a_taxa(self):
        # 4.1: `emitting` false means an effective rate of 0.
        self.assertEqual(births(scene(rate=20, emitting=False, looping=False), 0.5), [])

    def test_a_janela_vem_de_lifetime_max(self):
        # 5: candidates only from `t - lifetime.max`. That is why `lifetime` is
        # not animable (9.2).
        got = births(scene(rate=20, lifetime=[1, 1], looping=False), 2.0)
        self.assertEqual(min(b.index for b in got), 21)   # born at 1.05, not 1.0

    def test_prewarm_traz_indice_negativo(self):
        # 6: without a loop the births are those in `[-prewarm, t]`, and the
        # prewarm indices are NEGATIVE.
        got = births(scene(rate=20, lifetime=[1.5, 1.5], looping=False, prewarm=1), 0.1)
        self.assertEqual(len(got), 23)
        self.assertEqual(sorted(b.index for b in got), list(range(-20, 3)))
        menor = [b for b in got if b.index == -20][0]
        self.assertAlmostEqual(menor.birth, -1.0, places=12)

    def test_sem_prewarm_ninguem_nasce_antes_de_zero(self):
        got = births(scene(rate=20, lifetime=[1.5, 1.5], looping=False), 0.1)
        self.assertEqual(min(b.index for b in got), 0)

    def test_o_laco_traz_as_voltas_de_tras(self):
        # 6: a lap brings `0 <= i < E(D)`, and the lap before is the same list
        # with `t_i` shifted by -D.
        got = births(scene(rate=20, lifetime=[1.2, 1.2]), 0.02, duration=1.0, loop=True)
        self.assertEqual(len(got), 24)
        self.assertAlmostEqual(max(b.birth for b in got), 0.0, places=12)
        self.assertAlmostEqual(min(b.birth for b in got), -1.15, places=12)

    def test_o_acaso_nao_inclui_o_numero_da_volta(self):
        # 6: two particles of different laps with the same index have the same
        # `u`. If the lap entered the hash, `t` alone would not say which lap
        # we are in, and the function would stop being pure.
        got = births(scene(rate=20, lifetime=[1.2, 1.2]), 0.02, duration=1.0, loop=True)
        mesmos = [b for b in got if b.index == 19]
        self.assertEqual(len(mesmos), 2)
        self.assertAlmostEqual(abs(mesmos[0].birth - mesmos[1].birth), 1.0, places=12)

    def test_a_emenda_do_laco_e_exata_com_E_de_D_inteiro(self):
        # 6: `D = 1` and `rate = 20` give `E(D) = 20`; the last birth of a lap
        # and the first of the next are `1/rate` apart, like all the others.
        got = sorted(births(scene(rate=20, lifetime=[1.2, 1.2]), 0.02,
                            duration=1.0, loop=True), key=lambda b: b.birth)
        passos = [round(b.birth - a.birth, 9) for a, b in zip(got, got[1:])]
        self.assertEqual(set(passos), {0.05})

    def test_sem_animacao_o_laco_nao_vale(self):
        # 6: `D` is the duration of the animation that plays. With no animation
        # there is no lap to bring back.
        got = births(scene(rate=20, lifetime=[1.2, 1.2]), 0.02)
        self.assertEqual([b.index for b in got], [0])


class TestRajada(unittest.TestCase):
    BURST = {"time": 0.1, "count": 10, "cycles": 1, "interval": 1, "probability": 0.5}

    def test_a_rajada_tem_fluxo_proprio(self):
        # 4.3: burst `b` is flow `1 + b`, never flow 0.
        got = births(scene(rate=0, lifetime=[2, 2], looping=False,
                           bursts=[dict(self.BURST, probability=1)]), 0.5)
        self.assertEqual({b.flow for b in got}, {1})
        self.assertEqual(len(got), 10)

    def test_probabilidade_e_por_particula_e_nao_por_ciclo(self):
        # 4.3: the draw is per particle, on channel 11. Half a probability does
        # not mean exactly half the particles — here 6 of 10, not 5.
        got = births(scene(rate=0, lifetime=[2, 2], looping=False,
                           bursts=[self.BURST]), 0.5)
        self.assertEqual(sorted(b.index for b in got), [1, 3, 5, 6, 7, 8])

    def test_probabilidade_um_deixa_todas_nascer(self):
        # `u` is in [0, 1), so `u < 1` always: the channel is consumed the same
        # way and the result is everybody.
        got = births(scene(rate=0, lifetime=[2, 2], looping=False,
                           bursts=[dict(self.BURST, probability=1)]), 0.5)
        self.assertEqual(len(got), 10)

    def test_os_ciclos_repetem_com_o_intervalo(self):
        got = births(scene(rate=0, lifetime=[9, 9], looping=False,
                           bursts=[{"time": 0.0, "count": 2, "cycles": 3,
                                    "interval": 0.5, "probability": 1}]), 2.0)
        self.assertEqual(sorted({round(b.birth, 6) for b in got}), [0.0, 0.5, 1.0])
        self.assertEqual(sorted(b.index for b in got), [0, 1, 2, 3, 4, 5])

    def test_duas_rajadas_tem_fluxos_diferentes(self):
        got = births(scene(rate=0, lifetime=[2, 2], looping=False, bursts=[
            {"time": 0.1, "count": 1, "probability": 1},
            {"time": 0.2, "count": 1, "probability": 1},
        ]), 0.5)
        self.assertEqual(sorted(b.flow for b in got), [1, 2])


class TestTimelineDoEmissor(unittest.TestCase):
    def test_o_tipo_de_timeline_e_prefixado(self):
        from recorte.loader import load_skeleton_document
        from base import document
        data = load_skeleton_document(document(
            bones=ROOT, slots=SLOTS, extensionsUsed=["BONE_particles"],
            skins=[{"name": "default",
                    "attachments": {"fx": {"jato": emitter(rate=20)}}}],
            animations=[{"name": "fumar", "duration": 2, "timelines": [{
                "type": "BONE_particle", "target": "fx", "skin": "default",
                "attachment": "jato", "property": "emitting",
                "keys": [{"time": 0, "value": True, "curve": "stepped"},
                         {"time": 1, "value": False, "curve": "stepped"}]}]}]))
        timelines = data.animations[0].timelines
        self.assertEqual(len(timelines), 1)
        self.assertEqual(timelines[0].type, "BONE_particle")
        self.assertEqual(timelines[0].property, "emitting")

    def test_emitting_e_lido_no_nascimento(self):
        # 9.1: `emitting` is N, stepped. It switches the rate on and off; the
        # ones already born stay alive.
        from recorte.loader import Key, Timeline
        timeline = Timeline(type="BONE_particle", target="fx", property="emitting",
                            attachment="jato",
                            keys=[Key(time=0, value=True, curve="stepped"),
                                  Key(time=0.25, value=False, curve="stepped")])
        got = births(scene(rate=20, lifetime=[2, 2], looping=False), 0.5,
                     timelines={"emitting": timeline})
        self.assertEqual([b.index for b in got], [0, 1, 2, 3, 4])

    def test_propriedade_de_emissor_desconhecida_e_ignorada(self):
        from recorte.loader import load_skeleton_document
        from base import document
        data = load_skeleton_document(document(
            bones=ROOT, slots=SLOTS, extensionsUsed=["BONE_particles"],
            skins=[{"name": "default", "attachments": {"fx": {"jato": emitter()}}}],
            animations=[{"name": "x", "duration": 1, "timelines": [{
                "type": "BONE_particle", "target": "fx", "attachment": "jato",
                "property": "turbulencia",
                "keys": [{"time": 0, "value": 1}]}]}]))
        self.assertEqual(data.animations[0].timelines, [])
        self.assertTrue(any("propriedade de emissor desconhecida" in m
                            for m in data.warnings.messages))

    def _rampa(self, chaves, rate=0):
        from recorte.loader import load_skeleton_document
        from base import document
        return load_skeleton_document(document(
            bones=ROOT, slots=SLOTS, extensionsUsed=["BONE_particles"],
            skins=[{"name": "default", "attachments": {"fx": {"jato": emitter(rate=rate)}}}],
            animations=[{"name": "engrossa", "duration": 1, "timelines": [{
                "type": "BONE_particle", "target": "fx", "attachment": "jato",
                "property": "rate", "keys": chaves}]}]))

    def _trechos(self, data):
        from recorte.particles import Trechos, timelines_do_emissor
        emissor = data.skins[0].attachments["fx"]["jato"]
        tls = timelines_do_emissor(data.animations[0], "fx", "jato", "default")
        return Trechos(emissor, tls, 10.0)

    def test_rate_animado_e_lido_desde_a_segunda_fase(self):
        # 4.2, the `linear` branch, in service since version 1.2: 0 -> 40 in
        # [0, 1] gives E = 20 t^2, and particle 7 is born at sqrt(7/20).
        data = self._rampa([{"time": 0, "value": 0, "curve": "linear"},
                            {"time": 1, "value": 40}])
        self.assertEqual(len(data.animations[0].timelines), 1)
        trechos = self._trechos(data)
        self.assertAlmostEqual(trechos.E(1.0), 20.0, places=12)
        self.assertAlmostEqual(trechos.instante(7), math.sqrt(7 / 20), places=12)
        self.assertEqual(trechos.instante(0), 0.0)
        # after the last key, s = 0: the forbidden root would divide by zero
        self.assertEqual(trechos.instante(20), 1.0)
        self.assertAlmostEqual(trechos.instante(32), 1.3, places=12)

    def test_rate_negativo_e_bezier_avisam(self):
        data = self._rampa([{"time": 0, "value": -5, "curve": [0.25, 0, 0.75, 1]},
                            {"time": 1, "value": 40}])
        self.assertTrue(any("RANGE_PARTICLE_RATE:" in m for m in data.warnings.messages))
        self.assertTrue(any("RANGE_PARTICLE_RATE_CURVE" in m for m in data.warnings.messages))
        trechos = self._trechos(data)
        self.assertAlmostEqual(trechos.instante(7), math.sqrt(7 / 20), places=12)

    def test_rate_constante_em_chaves_da_os_mesmos_bits(self):
        from recorte.particles import Trechos
        fixo = self._rampa([], rate=20)
        chaves = self._trechos(self._rampa([{"time": 0, "value": 20, "curve": "linear"},
                                            {"time": 1, "value": 20}]))
        emissor = fixo.skins[0].attachments["fx"]["jato"]
        sem = Trechos(emissor, {}, 10.0)
        for i in range(40):
            self.assertEqual(chaves.instante(i), sem.instante(i))


class TestAExtensaoDeclarada(unittest.TestCase):
    def test_o_leitor_implementa_a_extensao(self):
        from recorte.loader import SUPPORTED_EXTENSIONS
        self.assertIn("BONE_particles", SUPPORTED_EXTENSIONS)

    def test_arquivo_que_exige_a_extensao_carrega(self):
        # 2.7: `extensionsRequired` with an extension this reader implements
        # must load, not be refused.
        skeleton = build(
            bones=ROOT, slots=SLOTS,
            extensionsUsed=["BONE_particles"], extensionsRequired=["BONE_particles"],
            skins=[{"name": "default", "attachments": {"fx": {"jato": emitter()}}}])
        self.assertIsInstance(emitter_of(skeleton), ParticleAttachment)


# ---------------------------------------------------------------------------
# 8 — where it is: the closed form
# ---------------------------------------------------------------------------


def alive(skeleton, t, **kw):
    from recorte.particles import vivas
    slot = skeleton.slot_by_name["fx"]
    attachment, skin = skeleton.attachment_for(slot)
    return vivas(skeleton, slot, attachment, skin, t, **kw)


def one(skeleton, t, index, flow=0, **kw):
    for p in alive(skeleton, t, **kw):
        if p.index == index and p.flow == flow:
            return p
    raise AssertionError(f"nao ha particula (fluxo {flow}, indice {index}) em t={t}")


class TestAPosicao(unittest.TestCase):
    def test_sem_arrasto_e_a_parabola(self):
        # 8: below the 0.00001 threshold of 3.6 the closed form is the plain
        # `p0 + v0*a + g*a**2/2`.
        from recorte.particles import posicao
        p, v = posicao((1, 2), (10, 20), (0, -200), 0.0, 0.5)
        self.assertAlmostEqual(p[0], 1 + 10 * 0.5, places=12)
        self.assertAlmostEqual(p[1], 2 + 20 * 0.5 - 0.5 * 200 * 0.25, places=12)
        self.assertAlmostEqual(v[1], 20 - 200 * 0.5, places=12)

    def test_o_limiar_e_exatamente_o_da_3_6(self):
        from recorte.particles import LIMIAR_ARRASTO
        self.assertEqual(LIMIAR_ARRASTO, 0.00001)

    def test_com_arrasto_vale_o_ramo_do_expm1(self):
        # 8: `F = -expm1(-k*a) / k`. Writing `(1 - exp(-k*a))/k` out loses the
        # last digits when `k*a` is small.
        import math
        from recorte.particles import posicao
        k, age = 0.5, 0.15
        f = -math.expm1(-k * age) / k
        p, _v = posicao((0, 0), (100, 0), (0, 0), k, age)
        self.assertAlmostEqual(p[0], 100 * f, places=12)

    def test_a_velocidade_tende_a_g_sobre_k(self):
        from recorte.particles import posicao
        _p, v = posicao((0, 0), (500, 500), (0, -200), 2.0, 40.0)
        self.assertAlmostEqual(v[1], -100.0, places=6)     # g/k = -200/2

    def test_a_soma_de_passos_depende_do_ritmo_de_quadro(self):
        # 3.4 forbids `p += v*dt` for one reason: it gives a DIFFERENT point at
        # 30 fps and at 60 fps, and going back does not undo it. The closed
        # form gives one number, whatever the frame rate — and here is the
        # measurement, not the promise.
        from recorte.particles import posicao
        g, k, age = (0, -300), 0.7, 0.9
        fechada, _ = posicao((3, 4), (80, 120), g, k, age)

        def euler(passos):
            p, v = (3.0, 4.0), (80.0, 120.0)
            dt = age / passos
            for _ in range(passos):
                p = (p[0] + v[0] * dt, p[1] + v[1] * dt)
                v = (v[0] + (g[0] - k * v[0]) * dt, v[1] + (g[1] - k * v[1]) * dt)
            return p

        trinta, sessenta = euler(27), euler(54)
        self.assertGreater(abs(trinta[1] - sessenta[1]), 0.1)
        self.assertGreater(abs(trinta[1] - fechada[1]), 0.1)

    def test_a_conta_fechada_e_a_mesma_por_qualquer_caminho(self):
        # The other half: the closed form of 8 composes with itself, so no
        # order of evaluation can change it. It is what lets P-008 demand the
        # same frame bit for bit.
        from recorte.particles import posicao
        inteiro, _ = posicao((3, 4), (80, 120), (0, -300), 0.7, 0.9)
        p, v = (3.0, 4.0), (80.0, 120.0)
        for _ in range(9):
            p, v = posicao(p, v, (0, -300), 0.7, 0.1)
        self.assertAlmostEqual(inteiro[1], p[1], places=9)

    def test_a_conta_da_particula_7_do_P_001(self):
        # The spec's own worked example (P-001's leiame): every intermediate
        # number is written there, so this test is the spec, not the code.
        import math
        from recorte.particles import acaso
        skeleton = scene(rate=20, lifetime=[1, 1.5], speed=[100, 150],
                         direction=90, spread=30, shape="circle", radius=10,
                         radiusThickness=1, arc=360, gravity=[0, -200], drag=0.5,
                         angle=[0, 360], angularVelocity=[-90, 90], scale=[0.5, 1],
                         space="local", looping=False)
        p = one(skeleton, 0.5, 7)
        u = [acaso(42, 0, 7, c) for c in range(8)]
        self.assertAlmostEqual(u[0], 0.4190843105316162, places=15)
        self.assertAlmostEqual(p.birth, 0.35, places=12)          # i / rate
        self.assertAlmostEqual(p.age, 0.15, places=12)
        self.assertAlmostEqual(p.life, 1 + 0.5 * u[0], places=12)
        self.assertAlmostEqual(p.life, 1.209542, places=6)
        # p0 on the circle, uniform over the area
        r = 10 * math.sqrt(u[3])
        self.assertAlmostEqual(r, 2.961374, places=6)
        self.assertAlmostEqual(u[4] * 360, 71.939421, places=6)
        # the position, and the angle AS IT IS
        self.assertAlmostEqual(p.x, 3.559924, places=6)
        self.assertAlmostEqual(p.y, 16.586731, places=6)
        self.assertAlmostEqual(p.angle, 251.145834, places=6)
        self.assertAlmostEqual(p.scale, 0.700088, places=6)

    def test_o_angulo_nao_e_reduzido(self):
        # 14.1: `251.145834`, never `-108.854166`. A reader that folds it into
        # -180..180 fails P-001, and only on `angle`.
        skeleton = scene(rate=20, lifetime=[2, 2], angle=[0, 360],
                         angularVelocity=[-90, 90], looping=False)
        angulos = [p.angle for p in alive(skeleton, 0.5)]
        self.assertTrue(any(a > 180 for a in angulos))

    def test_o_angulo_passa_de_360_com_a_idade(self):
        skeleton = scene(rate=1, lifetime=[9, 9], angle=[300, 300],
                         angularVelocity=[180, 180], looping=False)
        p = one(skeleton, 2.0, 0)
        self.assertAlmostEqual(p.angle, 300 + 180 * 2, places=9)

    def test_alinhar_com_a_velocidade_soma_o_angulo_por_cima(self):
        # 9.3: `v(a)` decides where it points, and `angle` is added on top.
        skeleton = scene(rate=1, lifetime=[9, 9], direction=0, spread=0,
                         speed=[100, 100], angle=[10, 10], angularVelocity=[0, 0],
                         alignToVelocity=True, looping=False)
        p = one(skeleton, 0.5, 0)
        self.assertAlmostEqual(p.angle, 10.0, places=9)    # velocity points at +X


# ---------------------------------------------------------------------------
# 9.4 — the shape of the emitter
# ---------------------------------------------------------------------------


class TestAForma(unittest.TestCase):
    def test_ponto_nasce_na_origem(self):
        skeleton = scene(rate=1, lifetime=[9, 9], shape="point", speed=[0, 0],
                         looping=False)
        p = one(skeleton, 0.0, 0)
        self.assertEqual((round(p.x, 12), round(p.y, 12)), (0.0, 0.0))

    def test_circulo_so_na_borda_com_espessura_zero(self):
        # 9.4: `radiusThickness 0` is the rim only.
        import math
        skeleton = scene(rate=20, lifetime=[9, 9], shape="circle", radius=10,
                         radiusThickness=0, speed=[0, 0], looping=False)
        for p in alive(skeleton, 0.5):
            self.assertAlmostEqual(math.hypot(p.x, p.y), 10.0, places=9)

    def test_circulo_cheio_espalha_pelo_disco(self):
        import math
        skeleton = scene(rate=20, lifetime=[9, 9], shape="circle", radius=10,
                         radiusThickness=1, speed=[0, 0], looping=False)
        raios = [math.hypot(p.x, p.y) for p in alive(skeleton, 0.5)]
        self.assertTrue(all(r <= 10.0000001 for r in raios))
        self.assertGreater(max(raios) - min(raios), 1.0)

    def test_o_arco_limita_o_angulo(self):
        # 9.4: `phi = u4 * arc`, counted from the bone's +X.
        import math
        skeleton = scene(rate=40, lifetime=[9, 9], shape="circle", radius=10,
                         radiusThickness=0, arc=90, speed=[0, 0], looping=False)
        for p in alive(skeleton, 0.9):
            graus = math.degrees(math.atan2(p.y, p.x))
            self.assertGreaterEqual(graus, -1e-9)
            self.assertLessEqual(graus, 90 + 1e-9)

    def test_retangulo_usa_a_medida_inteira(self):
        # 9.4: `size` is the WHOLE measure, so the half is what spreads.
        skeleton = scene(rate=40, lifetime=[9, 9], shape="rectangle", size=[20, 6],
                         speed=[0, 0], looping=False)
        pontos = alive(skeleton, 0.9)
        self.assertTrue(all(abs(p.x) <= 10.0000001 for p in pontos))
        self.assertTrue(all(abs(p.y) <= 3.0000001 for p in pontos))
        self.assertGreater(max(p.x for p in pontos), 5)
        self.assertLess(min(p.x for p in pontos), -5)

    def test_aresta_interpola_entre_as_duas_pontas(self):
        skeleton = scene(rate=20, lifetime=[9, 9], shape="edge",
                         edge=[0, 0, 100, 50], speed=[0, 0], looping=False)
        for p in alive(skeleton, 0.5):
            self.assertAlmostEqual(p.y, p.x / 2, places=9)

    def test_osso_e_a_aresta_do_proprio_osso(self):
        # 9.4: no fields of its own — from (0, 0) to (length, 0) of the bone.
        skeleton = build(
            bones=[{"name": "root"},
                   {"name": "emissor", "parent": "root", "length": 40}],
            slots=SLOTS, extensionsUsed=["BONE_particles"],
            skins=[{"name": "default", "attachments": {"fx": {"jato": emitter(
                rate=20, lifetime=[9, 9], shape="bone", speed=[0, 0],
                looping=False)}}}])
        pontos = alive(skeleton, 0.5, pose_em=lambda ti: skeleton)
        self.assertTrue(all(abs(p.y) < 1e-9 for p in pontos))
        self.assertTrue(all(-1e-9 <= p.x <= 40.0000001 for p in pontos))
        self.assertGreater(max(p.x for p in pontos), 20)

    def test_forma_desconhecida_nao_desenha_nada(self):
        # 7.4: not one particle, and the warning already went out at load time.
        skeleton = scene(rate=20, lifetime=[9, 9], shape="triangulo", looping=False)
        self.assertEqual(alive(skeleton, 0.5), [])

    def test_a_forma_so_gasta_os_canais_3_e_4(self):
        # 3.3: changing the shape must not shift the draws of life or speed.
        ponto = scene(rate=20, lifetime=[1, 3], shape="point", looping=False)
        circulo = scene(rate=20, lifetime=[1, 3], shape="circle", radius=10,
                        looping=False)
        self.assertEqual([p.life for p in alive(ponto, 0.5)],
                         [p.life for p in alive(circulo, 0.5)])


# A straight path from (0, 0) to (300, 0) with the handles on the thirds, in
# its own slot: the polyline lies on the line and `p0 = (300 * u3, 0)`.
RETA = {"type": "path", "lengths": [300],
        "vertices": [0, 0, 0, 0, 100, 0, 200, 0, 300, 0, 300, 0]}


def scene_de_caminho(caminho=RETA, **extra):
    return build(
        bones=[{"name": "root"}, {"name": "emissor", "parent": "root", "x": 50,
                                  "rotation": 30}],
        slots=[{"name": "trilha", "bone": "root"}] + SLOTS,
        extensionsUsed=["BONE_particles"],
        skins=[{"name": "default", "attachments": {
            "trilha": {"rota/longa": caminho},
            "fx": {"jato": emitter(**dict(dict(
                rate=0, bursts=[{"time": 0, "count": 4}], lifetime=[1, 1],
                speed=[0, 0], looping=False, shape="path",
                curve="trilha/rota/longa"), **extra))}}}])


class TestOCaminho(unittest.TestCase):
    """9.4.2 (1.1): `shape: "path"` — born along a path, by length. The five
    cases P-021 to P-025 prove the arithmetic; these tests hold what no case
    looks at: the name of `curve`, the warning, and `space: "world"`."""

    def test_curve_corta_na_primeira_barra(self):
        from recorte.particles import ler_curve
        self.assertEqual(ler_curve("trilha/rota/longa"), ("trilha", "rota/longa"))
        self.assertIsNone(ler_curve("trilha"))
        self.assertIsNone(ler_curve("/rota"))
        self.assertIsNone(ler_curve(None))

    def test_placeholder_com_barra_acha_o_caminho(self):
        skeleton = scene_de_caminho()
        pontos = alive(skeleton, 0.5, pose_em=lambda ti: skeleton)
        self.assertEqual(len(pontos), 4)
        for p in pontos:
            self.assertAlmostEqual(p.y, 0.0, places=9)
            self.assertTrue(0 <= p.x <= 300)

    def test_sem_curve_nao_desenha_e_avisa(self):
        # 9.4.2: never a fall to `point`; nothing drawn, and said once.
        skeleton = scene_de_caminho(curve=None)
        self.assertEqual(alive(skeleton, 0.5, pose_em=lambda ti: skeleton), [])
        self.assertTrue(any("REF_PARTICLE_CURVE" in m for m in skeleton.warnings))

    def test_curve_que_nao_e_caminho_nao_desenha_e_avisa(self):
        skeleton = scene_de_caminho(curve="fx/jato")
        self.assertEqual(alive(skeleton, 0.5, pose_em=lambda ti: skeleton), [])
        self.assertTrue(any("REF_PARTICLE_CURVE" in m and "nao e um anexo path" in m
                            for m in skeleton.warnings))

    def test_caminho_de_uma_ancora_nao_desenha_e_avisa(self):
        skeleton = scene_de_caminho(caminho={"type": "path", "lengths": [],
                                             "vertices": [0, 0, 0, 0, 0, 0]})
        self.assertEqual(alive(skeleton, 0.5, pose_em=lambda ti: skeleton), [])
        self.assertTrue(any("menos de 2 ancoras" in m for m in skeleton.warnings))

    def test_em_world_o_ponto_ja_esta_no_esqueleto(self):
        # 9.4.2 step 7: in `world` the point is ALREADY in skeleton space. The
        # emitter's bone is moved (50, 0) and turned 30 degrees: carried by it
        # a second time, the particles would leave the line.
        skeleton = scene_de_caminho(space="world")
        local = scene_de_caminho()
        pontos = alive(skeleton, 0.5, pose_em=lambda ti: skeleton)
        self.assertEqual(len(pontos), 4)
        for p, q in zip(pontos, alive(local, 0.5, pose_em=lambda ti: local)):
            self.assertAlmostEqual(p.y, 0.0, places=9)
            self.assertAlmostEqual(p.x, q.x, places=9)
            self.assertAlmostEqual(q.y, 0.0, places=9)

    def test_em_world_o_spherize_sai_do_centro_do_emissor(self):
        # 9.4.2: `spherizeDirection` is "in the emitter's frame; the centre of
        # the shape is the emitter's origin". With the bone standing still,
        # `world` and `local` are the same drawing — speed and all.
        mover = dict(speed=[80, 80], spherizeDirection=1)
        world = scene_de_caminho(space="world", **mover)
        local = scene_de_caminho(**mover)
        pw = alive(world, 0.5, pose_em=lambda ti: world)
        pl = alive(local, 0.5, pose_em=lambda ti: local)
        self.assertEqual(len(pw), 4)
        for p, q in zip(pw, pl):
            self.assertAlmostEqual(p.x, q.x, places=9)
            self.assertAlmostEqual(p.y, q.y, places=9)


# ---------------------------------------------------------------------------
# 7.2 — the space
# ---------------------------------------------------------------------------


GIRA = [{
    "name": "girar", "duration": 1, "timelines": [{
        "type": "bone", "target": "emissor", "property": "rotation",
        "keys": [{"time": 0, "value": 0, "curve": "linear"},
                 {"time": 1, "value": 90}]}]}]


def girando(space):
    """The rig of P-006: the bone turns 90 degrees between `t_i` and `t`."""
    from recorte.actor import Actor
    from recorte.loader import load_skeleton_document
    from base import document
    data = load_skeleton_document(document(
        bones=ROOT, slots=SLOTS, extensionsUsed=["BONE_particles"],
        skins=[{"name": "default", "attachments": {"fx": {"jato": emitter(
            rate=0.5, lifetime=[2, 2], speed=[100, 100], direction=0, spread=0,
            shape="point", space=space, looping=False)}}}],
        animations=GIRA))
    animation = data.find_animation("girar")

    def pose_em(ti):
        outro = Actor(data)
        outro.pose(animation, ti, ti, False, float("-inf"))
        return outro.current

    actor = Actor(data)
    actor.pose(animation, 1.0, 1.0, False, float("-inf"))
    skeleton = actor.current
    slot = skeleton.slot_by_name["fx"]
    attachment, skin = skeleton.attachment_for(slot)
    from recorte.particles import vivas
    return vivas(skeleton, slot, attachment, skin, 1.0, animation, 1.0, False, pose_em)


class TestOEspaco(unittest.TestCase):
    def test_world_o_osso_solta_a_particula(self):
        # 7.2: `p0` and `v0` go to the skeleton's space at `t_i`, and after that
        # the bone never touches the particle again.
        vivos = girando("world")
        self.assertEqual(len(vivos), 1)
        self.assertAlmostEqual(vivos[0].x, 100.0, places=6)
        self.assertAlmostEqual(vivos[0].y, 0.0, places=6)

    def test_local_o_osso_continua_mandando(self):
        # The contrast that makes P-006: one word changed, and the same
        # particle is at (0, 100) instead of (100, 0) — 90 degrees apart.
        vivos = girando("local")
        self.assertEqual(len(vivos), 1)
        self.assertAlmostEqual(vivos[0].x, 0.0, places=6)
        self.assertAlmostEqual(vivos[0].y, 100.0, places=6)

    def test_o_dump_mede_sempre_no_espaco_do_esqueleto(self):
        # 14.1: `x` and `y` are in skeleton space in BOTH spaces — it is what
        # makes the two comparable, and what P-006 uses.
        import math
        for space in ("local", "world"):
            vivos = girando(space)
            self.assertAlmostEqual(math.hypot(vivos[0].x, vivos[0].y), 100.0,
                                   places=6)


# ---------------------------------------------------------------------------
# 9.6, 9.7 — size and colour over the life
# ---------------------------------------------------------------------------


class TestTamanhoECor(unittest.TestCase):
    def test_a_escala_e_um_fator(self):
        skeleton = scene(rate=1, lifetime=[9, 9], scale=[2, 2], looping=False)
        self.assertAlmostEqual(one(skeleton, 0.5, 0).scale, 2.0, places=9)

    def test_scale_over_lifetime_conta_em_fracao_da_vida(self):
        # 9.6: `time` is in 0..1 of the life, not in seconds.
        skeleton = scene(rate=1, lifetime=[4, 4], scale=[1, 1], looping=False,
                         scaleOverLifetime=[{"time": 0, "value": 0},
                                            {"time": 1, "value": 10}])
        self.assertAlmostEqual(one(skeleton, 0.0, 0).scale, 0.0, places=9)
        self.assertAlmostEqual(one(skeleton, 2.0, 0).scale, 5.0, places=9)

    def test_uma_so_u_para_os_quatro_componentes(self):
        # 9.7: `lerp(c1, c2, u8)` with ONE draw, not four.
        skeleton = scene(rate=1, lifetime=[9, 9], looping=False,
                         startColor=[[0, 0, 0, 0], [1, 1, 1, 1]])
        cor = one(skeleton, 0.5, 0).color
        self.assertEqual(len(set(round(c, 12) for c in cor)), 1)

    def test_o_gradiente_multiplica_a_cor_de_nascimento(self):
        skeleton = scene(rate=1, lifetime=[4, 4], looping=False,
                         startColor=[[1, 1, 1, 1], [1, 1, 1, 1]],
                         colorOverLifetime=[{"time": 0, "value": [1, 1, 1, 0]},
                                            {"time": 1, "value": [1, 1, 1, 1]}])
        self.assertAlmostEqual(one(skeleton, 2.0, 0).color[3], 0.5, places=9)

    def test_alpha_over_lifetime_multiplica_por_cima(self):
        skeleton = scene(rate=1, lifetime=[4, 4], looping=False,
                         colorOverLifetime=[{"time": 0, "value": [1, 1, 1, 0.5]},
                                            {"time": 1, "value": [1, 1, 1, 0.5]}],
                         alphaOverLifetime=[{"time": 0, "value": 0.5},
                                            {"time": 1, "value": 0.5}])
        self.assertAlmostEqual(one(skeleton, 1.0, 0).color[3], 0.25, places=9)


class TestCampoLidoNoNascimento(unittest.TestCase):
    """9: every animable field of an emitter is **N** — read at `t_i` and
    frozen on the particle."""

    def rig(self, keys):
        from recorte.actor import Actor
        from recorte.loader import load_skeleton_document
        from base import document
        data = load_skeleton_document(document(
            bones=ROOT, slots=SLOTS, extensionsUsed=["BONE_particles"],
            skins=[{"name": "default", "attachments": {"fx": {"jato": emitter(
                rate=10, lifetime=[9, 9], speed=[0, 0], shape="point",
                gravity=[0, 0], looping=False)}}}],
            animations=[{"name": "cair", "duration": 2, "timelines": [{
                "type": "BONE_particle", "target": "fx", "skin": "default",
                "attachment": "jato", "property": "gravity", "keys": keys}]}]))
        animation = data.find_animation("cair")
        actor = Actor(data)
        actor.pose(animation, 1.0, 1.0, False, float("-inf"))
        skeleton = actor.current
        slot = skeleton.slot_by_name["fx"]
        attachment, skin = skeleton.attachment_for(slot)
        from recorte.particles import vivas
        return vivas(skeleton, slot, attachment, skin, 1.0, animation, 2.0, False)

    def test_gravidade_animada_nao_entorta_quem_ja_esta_no_ar(self):
        # 9.5 writes the price of the closed form out loud, so that nobody has
        # to find it alone: a key that changes the gravity does NOT bend the
        # particles already flying.
        vivos = self.rig([{"time": 0, "value": [0, 0], "curve": "stepped"},
                          {"time": 0.5, "value": [0, -1000], "curve": "stepped"}])
        antes = [p for p in vivos if p.birth < 0.5]
        depois = [p for p in vivos if p.birth >= 0.5]
        self.assertTrue(antes and depois)
        self.assertTrue(all(abs(p.y) < 1e-9 for p in antes))
        self.assertTrue(all(p.y < 0 for p in depois if p.age > 0))


# ---------------------------------------------------------------------------
# 7.1, 9.9 — the ceiling of living particles and the drawing order
# ---------------------------------------------------------------------------


class TestOTetoEAOrdem(unittest.TestCase):
    def test_o_teto_nao_bloqueia_o_nascimento(self):
        # 7.1: Unity and Godot block the birth when the emitter is full, and
        # that is state — who is born starts depending on who was alive. Here
        # the particle is always born; the ceiling only chooses who is DRAWN.
        from recorte.particles import desenhar, vivas
        skeleton = scene(rate=20, lifetime=[1, 1], maxParticles=5, looping=False)
        slot = skeleton.slot_by_name["fx"]
        attachment, skin = skeleton.attachment_for(slot)
        todas = vivas(skeleton, slot, attachment, skin, 0.55)
        self.assertEqual(len(todas), 12)
        self.assertEqual(len(desenhar(attachment, todas)), 5)

    def test_ficam_as_mais_novas(self):
        from recorte.particles import desenhar, vivas
        skeleton = scene(rate=20, lifetime=[1, 1], maxParticles=5, looping=False)
        slot = skeleton.slot_by_name["fx"]
        attachment, skin = skeleton.attachment_for(slot)
        desenhadas = desenhar(attachment, vivas(skeleton, slot, attachment, skin, 0.55))
        self.assertEqual([p.index for p in desenhadas], [11, 10, 9, 8, 7])

    def test_o_corte_avisa_quantas_ficaram_de_fora(self):
        # 7.1: the reader that cuts SHOULD say so once. A particle that
        # vanishes without a word is regra 21 of the house.
        from recorte.particles import particulas_do_slot
        skeleton = scene(rate=20, lifetime=[1, 1], maxParticles=5, looping=False)
        slot = skeleton.slot_by_name["fx"]
        attachment, skin = skeleton.attachment_for(slot)
        particulas_do_slot(skeleton, slot, attachment, skin, 0.55)
        self.assertTrue(any("PARTICLE_CUT" in m and "7 cortadas" in m
                            for m in skeleton.warnings))

    def test_o_empate_e_pelo_indice_decrescente(self):
        # 7.1 and 4.3: ten particles of a burst share the same `t_i` and flow,
        # so the index decides — 8, 7, 6, 5, 3, 1 in P-007.
        from recorte.particles import particulas_do_slot
        skeleton = scene(rate=0, lifetime=[2, 2], looping=False,
                         bursts=[{"time": 0.1, "count": 10, "cycles": 1,
                                  "interval": 1, "probability": 0.5}])
        slot = skeleton.slot_by_name["fx"]
        attachment, skin = skeleton.attachment_for(slot)
        ordem = particulas_do_slot(skeleton, slot, attachment, skin, 0.5)
        self.assertEqual([p.index for p in ordem], [8, 7, 6, 5, 3, 1])

    def test_oldest_in_front_sai_pelo_outro_lado(self):
        from recorte.particles import particulas_do_slot
        skeleton = scene(rate=20, lifetime=[1, 1], looping=False,
                         sortMode="oldestInFront")
        slot = skeleton.slot_by_name["fx"]
        attachment, skin = skeleton.attachment_for(slot)
        ordem = particulas_do_slot(skeleton, slot, attachment, skin, 0.5)
        self.assertEqual([p.index for p in ordem], list(range(0, 11)))


# ---------------------------------------------------------------------------
# 14.1 — what the dump measures
# ---------------------------------------------------------------------------


def dump(skeleton_doc, probe):
    from recorte.loader import load_skeleton_document
    from recorte.pose_dump import build_pose_dump
    return build_pose_dump(load_skeleton_document(skeleton_doc), probe)


def documento(**extra):
    from base import document
    return document(
        bones=ROOT, slots=SLOTS, extensionsUsed=["BONE_particles"],
        skins=[{"name": "default", "attachments": {"fx": {"jato": emitter(**extra)}}}])


class TestODump(unittest.TestCase):
    def test_a_chave_e_slot_barra_placeholder(self):
        saida = dump(documento(rate=20, lifetime=[1, 1], looping=False),
                     {"times": [0.5], "measure": ["particles"]})
        self.assertEqual(list(saida["samples"][0]["particles"]), ["fx/jato"])

    def test_os_nove_campos_da_14_1(self):
        saida = dump(documento(rate=20, lifetime=[1, 1], looping=False),
                     {"times": [0.5], "measure": ["particles"]})
        primeira = saida["samples"][0]["particles"]["fx/jato"][0]
        self.assertEqual(sorted(primeira), sorted(
            ["flow", "index", "birth", "life", "age", "x", "y", "angle", "scale"]))

    def test_emissor_sem_ninguem_vivo_sai_como_lista_vazia(self):
        # 14.1: it does NOT disappear from the key. Disappearing would confuse
        # "there is no particle" with "this reader does not implement P".
        saida = dump(documento(rate=0, looping=False),
                     {"times": [0.5], "measure": ["particles"]})
        self.assertEqual(saida["samples"][0]["particles"], {"fx/jato": []})

    def test_o_indice_pode_ser_negativo(self):
        # 14.1: negative in the prewarm, and the hash takes it (3.2).
        saida = dump(documento(rate=20, lifetime=[1.5, 1.5], looping=False, prewarm=1),
                     {"times": [0.1], "measure": ["particles"]})
        indices = [p["index"] for p in saida["samples"][0]["particles"]["fx/jato"]]
        self.assertIn(-3, indices)
        self.assertEqual(min(indices), -20)

    def test_os_numeros_saem_com_seis_casas(self):
        saida = dump(documento(rate=20, lifetime=[1, 1.5], speed=[100, 150],
                               spread=30, looping=False),
                     {"times": [0.5], "measure": ["particles"]})
        for p in saida["samples"][0]["particles"]["fx/jato"]:
            for campo in ("birth", "life", "age", "x", "y", "angle", "scale"):
                self.assertEqual(p[campo], round(p[campo], 6))

    def test_so_o_canal_pedido_sai(self):
        saida = dump(documento(rate=20, looping=False),
                     {"times": [0.5], "measure": ["particles"]})
        self.assertNotIn("bones", saida["samples"][0])
        self.assertIn("particles", saida["samples"][0])

    def test_arrastar_para_tras_da_o_mesmo_quadro(self):
        # The whole ruler in three lines, and the point of P-008: evaluate at
        # 0.9, go back to 0.3, come back to 0.9. Not "close within tolerance" —
        # the same text, field by field. The order 0.9 -> 0.3 -> 0.9 is what
        # separates a runtime that restarts from one that keeps a snapshot.
        import json
        saida = dump(documento(rate=20, lifetime=[1, 1.5], speed=[100, 150],
                               direction=90, spread=30, shape="circle", radius=10,
                               radiusThickness=1, arc=360, gravity=[0, -200],
                               drag=0.5, angle=[0, 360], angularVelocity=[-90, 90],
                               scale=[0.5, 1], space="local", looping=True),
                     {"times": [0.9, 0.3, 0.9], "measure": ["particles"], "loop": True})
        primeira = json.dumps(saida["samples"][0]["particles"], sort_keys=True)
        terceira = json.dumps(saida["samples"][2]["particles"], sort_keys=True)
        self.assertEqual(primeira, terceira)
        self.assertNotEqual(primeira,
                            json.dumps(saida["samples"][1]["particles"], sort_keys=True))

    def test_o_laco_faz_t_e_t_mais_D_darem_o_mesmo(self):
        # 6: the particle system works in ANIMATION time, so `t` and `t + D`
        # are the same instant.
        import json
        from base import document
        doc = document(
            bones=ROOT, slots=SLOTS, extensionsUsed=["BONE_particles"],
            skins=[{"name": "default", "attachments": {"fx": {"jato": emitter(
                rate=20, lifetime=[1.2, 1.2], speed=[100, 150], spread=30,
                shape="point", looping=True)}}}],
            animations=[{"name": "girar", "duration": 1, "timelines": []}])
        saida = dump(doc, {"animation": "girar", "times": [0.02, 1.02],
                           "loop": True, "measure": ["particles"]})
        self.assertEqual(json.dumps(saida["samples"][0]["particles"], sort_keys=True),
                         json.dumps(saida["samples"][1]["particles"], sort_keys=True))
        self.assertEqual(len(saida["samples"][0]["particles"]["fx/jato"]), 24)

    def test_o_angulo_do_dump_nao_da_a_volta_na_comparacao(self):
        # The tolerance trap: if the particle `angle` went through the circular
        # distance, a reader that folds it into -180..180 would PASS, and the
        # leiame of P-001 says it has to fail. `251.145834` against
        # `-108.854166` is 360 apart, and the comparison has to see it.
        from recorte.pose_dump import compare_pose_dump
        esperado = {"samples": [{"time": 0, "particles": {"fx/jato": [
            {"index": 7, "angle": 251.145834}]}}]}
        dobrado = {"samples": [{"time": 0, "particles": {"fx/jato": [
            {"index": 7, "angle": -108.854166}]}}]}
        ok, diferencas, _pior = compare_pose_dump(esperado, dobrado)
        self.assertFalse(ok)
        self.assertEqual(len(diferencas), 1)


def _pastas_de_caso():
    """Both homes of a conformance case (12.4): the official folder, and the
    waiting room for a case no runtime passes yet."""
    from pathlib import Path
    raiz = Path(__file__).resolve().parents[2] / "conformidade"
    return (raiz / "casos", raiz / "casos-pendentes")


@unittest.skipUnless(any(p.is_dir() for p in _pastas_de_caso()),
                     "a suite de conformidade nao esta ao lado")
class TestOsCasosDeParticula(unittest.TestCase):
    """The cases are the contract (14). A case lives in `casos-pendentes/`
    until THREE independent sources agree — the reference implementation that
    wrote it, the TypeScript runtime and this one — and then the Planejador
    moves it to `casos/`.

    This class reads BOTH folders, and that is deliberate: the seventeen moved
    across on 18/09/2026, and a test that watched only one of them would have
    gone red for the move and told whoever read it nothing useful. The
    `skipUnless` above says so in words when the folders are not there at all —
    `runtime-python/` runs on the standard library alone and the README invites
    copying it out on its own, and a traceback is a bad way to learn that the
    cases stayed behind.
    """

    def casos(self):
        import json
        vistos = []
        for pasta in _pastas_de_caso():
            if not pasta.is_dir():
                continue
            for caso in pasta.iterdir():
                if caso.name.startswith("P-") and (caso / "esperado.json").is_file():
                    vistos.append(caso)
        for caso in sorted(vistos, key=lambda c: c.name):
            yield caso, json.loads((caso / "esperado.json").read_text(encoding="utf-8"))

    # Raise this by hand when cases are added, NEVER to make a red go away: an
    # exact number across both folders is what catches a case QUIETLY
    # DISAPPEARING, which no per-case assertion below would ever notice —
    # and counting both is what lets it survive the move that no longer says
    # anything about whether the cases pass.
    # 20 desde 04/10/2026: P-018, P-019 e P-020, da 9.10 (x, y, rotation).
    # 25 desde 05/10/2026: P-021 a P-025, da 9.4.2 (a forma `path`, 1.1).
    # 29 desde 05/10/2026, noite: P-026 em `casos/`; P-027, P-028 e P-029
    # pendentes (rodada 34).
    QUANTOS = 29

    def test_todos_os_casos_passam(self):
        """Every case in the folder, and the whole list of failures at once.

        It reports all of them instead of stopping at the first, because a red
        here usually says something about the CASE — and a list of names is
        what tells the difference between one bad expectation and a defect of
        this runtime that hits many.
        """
        from recorte.loader import load_skeleton_bytes
        from recorte.pose_dump import build_pose_dump, compare_pose_dump
        falharam = []
        vistos = 0
        for caso, esperado in self.casos():
            vistos += 1
            data = load_skeleton_bytes((caso / "entrada.bone").read_bytes(), lambda u: None)
            obtido = build_pose_dump(data, esperado["probe"])
            ok, diferencas, _pior = compare_pose_dump(esperado, obtido)
            if not ok:
                falharam.append(f"{caso.name} ({len(diferencas)} diferencas)")
        self.assertEqual(vistos, self.QUANTOS,
                         f"ha {vistos} casos P-* nas duas pastas e este teste "
                         f"espera {self.QUANTOS}")
        self.assertEqual(falharam, [], "casos que nao batem: " + ", ".join(falharam))

    def test_o_P_002_tem_a_rampa_e_a_lista_cheia(self):
        # Until 05/11/2026 the `esperado.json` of P-002 had an EMPTY list on
        # purpose, and a first-phase reader passed it by drawing nobody. The
        # second phase of `rate` opened (4.2, version 1.2): the list is full,
        # 8, 21 and 33 alive, and a reader without the ramp now FAILS.
        for caso, esperado in self.casos():
            if not caso.name.startswith("P-002"):
                continue
            tamanhos = [len(s["particles"]["fx/jato"]) for s in esperado["samples"]]
            self.assertEqual(tamanhos, [8, 21, 33])
            return
        self.fail("o caso P-002 sumiu das duas pastas de casos")


# ---------------------------------------------------------------------------
# 4.3 + 6 — the burst comes back on the laps behind
# ---------------------------------------------------------------------------


def estoura(bursts, duration, times, life=2.0):
    """A skeleton with no continuous rate and one or more bursts, in a loop."""
    from base import document
    return dump(document(
        bones=ROOT, slots=SLOTS, extensionsUsed=["BONE_particles"],
        skins=[{"name": "default", "attachments": {"fx": {"jato": emitter(
            rate=0, lifetime=[life, life], speed=[0, 0], shape="point",
            looping=True, bursts=bursts)}}}],
        animations=[{"name": "e", "duration": duration, "timelines": []}]),
        {"animation": "e", "times": times, "loop": True, "measure": ["particles"]})


UMA = [{"time": 0.1, "count": 4, "cycles": 1, "interval": 1, "probability": 1}]


class TestARajadaNoLaco(unittest.TestCase):
    """6: with a loop, "the births of the current lap AND those of the earlier
    ones". A burst IS a birth — leaving it out makes the explosion vanish as
    the lap turns, which is the seam 6 exists to remove."""

    def test_a_explosao_nao_some_ao_virar_a_volta(self):
        saida = estoura(UMA, 1.0, [0.05, 0.5, 1.05])
        contagens = [len(a["particles"]["fx/jato"]) for a in saida["samples"]]
        self.assertEqual(contagens, [8, 8, 8])   # life 1.2 laps over D = 1

    def test_t_e_t_mais_D_dao_o_mesmo_quadro(self):
        import json
        saida = estoura(UMA, 1.0, [0.05, 1.05])
        self.assertEqual(json.dumps(saida["samples"][0]["particles"], sort_keys=True),
                         json.dumps(saida["samples"][1]["particles"], sort_keys=True))

    def test_o_acaso_nao_inclui_o_numero_da_volta(self):
        # 6: the same index has the same `u` on every lap; only `t_i` moves.
        saida = estoura([{"time": 0.1, "count": 10, "cycles": 1, "interval": 1,
                          "probability": 0.5}], 1.0, [0.5])
        lista = saida["samples"][0]["particles"]["fx/jato"]
        por_volta = {}
        for p in lista:
            por_volta.setdefault(round(p["birth"], 6), []).append(p["index"])
        self.assertGreater(len(por_volta), 1)
        indices = list(por_volta.values())
        self.assertTrue(all(i == indices[0] for i in indices))
        self.assertEqual(sorted(indices[0]), [1, 3, 5, 6, 7, 8])   # as in P-007

    def test_fora_do_laco_nada_muda(self):
        # Every cycle still counts without a loop; it is the LAP that cuts.
        from recorte.particles import burst_births
        skeleton = scene(rate=0, lifetime=[9, 9], looping=False,
                         bursts=[{"time": 0.1, "count": 1, "cycles": 5,
                                  "interval": 0.5, "probability": 1}])
        attachment, _skin = skeleton.attachment_for(skeleton.slot_by_name["fx"])
        got = burst_births(attachment, 5.0)
        self.assertEqual(sorted(round(b.birth, 6) for b in got),
                         [0.1, 0.6, 1.1, 1.6, 2.1])

    def test_a_volta_leva_so_os_ciclos_de_zero_ate_D(self):
        # Without the cut, a late cycle of the lap behind would land exactly on
        # top of an early cycle of this one — two particles with the same `t_i`
        # where the author asked for one.
        saida = estoura([{"time": 0.1, "count": 1, "cycles": 5, "interval": 0.5,
                          "probability": 1}], 1.0, [0.1], life=3.0)
        nascimentos = [round(p["birth"], 6)
                       for p in saida["samples"][0]["particles"]["fx/jato"]]
        self.assertEqual(nascimentos, [0.1, -0.4, -0.9, -1.4, -1.9, -2.4])
        self.assertEqual(len(nascimentos), len(set(nascimentos)))
        # the join is regular: every burst is 0.5 from the next, across laps
        passos = {round(a - b, 9) for a, b in zip(nascimentos, nascimentos[1:])}
        self.assertEqual(passos, {0.5})

    def test_ciclo_descartado_pelo_laco_avisa(self):
        # The cut answers the duplicate, and the warning answers the cut:
        # dropping in silence something the author wrote is what regra 21 is
        # about.
        from recorte.particles import particulas_do_slot
        from recorte.actor import Actor
        from recorte.loader import load_skeleton_document
        from base import document
        data = load_skeleton_document(document(
            bones=ROOT, slots=SLOTS, extensionsUsed=["BONE_particles"],
            skins=[{"name": "default", "attachments": {"fx": {"jato": emitter(
                rate=0, lifetime=[3, 3], speed=[0, 0], shape="point",
                looping=True, bursts=[{"time": 0.1, "count": 1, "cycles": 5,
                                       "interval": 0.5, "probability": 1}])}}}],
            animations=[{"name": "e", "duration": 1, "timelines": []}]))
        animation = data.find_animation("e")
        actor = Actor(data)
        actor.pose(animation, 0.1, 0.1, True, float("-inf"))
        skeleton = actor.current
        slot = skeleton.slot_by_name["fx"]
        attachment, skin = skeleton.attachment_for(slot)
        particulas_do_slot(skeleton, slot, attachment, skin, 0.1, animation,
                           1.0, True)
        self.assertTrue(any("BURST_OUT_OF_LAP" in m and "3 ciclo(s)" in m
                            for m in skeleton.warnings))


# ---------------------------------------------------------------------------
# 14.1 — the ruler of the particle channel
# ---------------------------------------------------------------------------


class TestATolerancia(unittest.TestCase):
    """Two rules against two DIFFERENT errors, and they are not one rule said
    twice: the plain difference catches the 360-degree fold, and the 1e-3
    catches the small constant drift nobody goes looking for."""

    ESPERADO = {"samples": [{"time": 0, "particles": {"fx/jato": [
        {"index": 7, "x": 3.559924, "angle": 251.145834}]}}]}

    def obtido(self, **troca):
        base = {"index": 7, "x": 3.559924, "angle": 251.145834}
        base.update(troca)
        return {"samples": [{"time": 0, "particles": {"fx/jato": [base]}}]}

    def test_o_angulo_dobrado_falha(self):
        # The leiame of P-001 says a reader that folds into -180..180 has to
        # fail. 360 was never hidden by a tolerance — it is the circular
        # distance that would hide it.
        from recorte.pose_dump import compare_pose_dump
        ok, _d, _p = compare_pose_dump(self.ESPERADO,
                                       self.obtido(angle=-108.854166))
        self.assertFalse(ok)

    def test_o_erro_pequeno_e_constante_falha(self):
        from recorte.pose_dump import compare_pose_dump
        ok, _d, _p = compare_pose_dump(self.ESPERADO, self.obtido(x=3.5649))
        self.assertFalse(ok)

    def test_a_regua_de_particula_nao_afrouxa_com_a_de_fisica(self):
        # The hole this test closes: the particle channel used to BORROW
        # `position`, and physics loosens `position` to 1e-2. A particle case
        # with `physicsDt` would then have been measured with 1e-2, with nobody
        # asking for it. A ruler that moves because of an unrelated field is
        # the same family as the green that was never measured.
        from recorte.pose_dump import (PHYSICS_TOLERANCES, TOLERANCES,
                                       compare_pose_dump)
        self.assertEqual(TOLERANCES["particle"], 1e-3)
        self.assertEqual(PHYSICS_TOLERANCES["particle"], 1e-3)
        self.assertEqual(PHYSICS_TOLERANCES["position"], 1e-2)
        quase = self.obtido(x=3.564924)          # 5e-3 off: inside 1e-2
        for regua in (TOLERANCES, PHYSICS_TOLERANCES):
            ok, _d, _p = compare_pose_dump(self.ESPERADO, quase, regua)
            self.assertFalse(ok, "a regua de particula afrouxou")

    def test_o_canal_de_particula_e_proprio_e_nao_emprestado(self):
        from recorte.pose_dump import _tolerance_for, TOLERANCES
        emprestada = dict(TOLERANCES, position=99.0)
        self.assertEqual(
            _tolerance_for("/samples/0/particles/fx/jato/0/x", "x", emprestada),
            1e-3)


# ---------------------------------------------------------------------------
# 9.4.1 — meshMode, the arithmetic written out
# ---------------------------------------------------------------------------

# A quad: four vertices, two triangles, five unique edges (the diagonal is
# shared and enters ONCE).
QUADRADO = {
    "type": "mesh",
    "vertices": [0, 0, 10, 0, 10, 10, 0, 10],
    "uvs": [0, 0, 1, 0, 1, 1, 0, 1],
    "triangles": [0, 1, 2, 0, 2, 3],
    "hull": 4, "width": 10, "height": 10,
}


def com_malha(**extra):
    """An emitter with `shape: "mesh"` pointing at a mesh of the SAME slot."""
    return build(
        bones=ROOT, slots=SLOTS, extensionsUsed=["BONE_particles"],
        skins=[{"name": "default", "attachments": {"fx": {
            "jato": emitter(shape="mesh", mesh="pano", rate=20,
                            lifetime=[9, 9], speed=[0, 0], looping=False, **extra),
            "pano": dict(QUADRADO),
        }}}])


class TestAMalha(unittest.TestCase):
    def test_as_arestas_sao_as_unicas_da_triangulacao(self):
        # 9.4.1: `(a, b)` with `a < b`, no repeats, SORTED by the ascending
        # pair. The diagonal 0-2 is shared by the two triangles and enters once.
        from recorte.particles import arestas_unicas
        self.assertEqual(arestas_unicas([0, 1, 2, 0, 2, 3]),
                         [(0, 1), (0, 2), (0, 3), (1, 2), (2, 3)])

    def test_a_ordem_das_arestas_e_a_do_par_e_nao_a_da_descoberta(self):
        # The order is normative because it is what `floor(u12 * M)` indexes.
        # The same triangulation written in another order has to give the SAME
        # list — a runtime that keeps discovery order picks a different edge
        # for the same `u12`, and nothing downstream shows it.
        from recorte.particles import arestas_unicas
        self.assertEqual(arestas_unicas([0, 1, 2, 0, 2, 3]),
                         arestas_unicas([0, 2, 3, 0, 1, 2]))
        self.assertEqual(arestas_unicas([2, 1, 0]), [(0, 1), (0, 2), (1, 2)])

    def test_vertex_sorteia_um_vertice_pelo_canal_12(self):
        # 9.4.1: `v = floor(u12 * N)`, and the point is that vertex itself.
        from recorte.particles import acaso
        skeleton = com_malha(meshMode="vertex")
        cantos = {(0.0, 0.0), (10.0, 0.0), (10.0, 10.0), (0.0, 10.0)}
        vivos = alive(skeleton, 0.5, pose_em=lambda ti: skeleton)
        self.assertTrue(vivos)
        for p in vivos:
            self.assertIn((round(p.x, 9), round(p.y, 9)), cantos)
            esperado = int(acaso(42, 0, p.index, 12) * 4)
            self.assertEqual((round(p.x, 9), round(p.y, 9)),
                             [(0.0, 0.0), (10.0, 0.0), (10.0, 10.0), (0.0, 10.0)][esperado])

    def test_edge_cai_sobre_uma_aresta(self):
        skeleton = com_malha(meshMode="edge")
        vivos = alive(skeleton, 0.5, pose_em=lambda ti: skeleton)
        self.assertTrue(vivos)
        for p in vivos:
            x, y = round(p.x, 6), round(p.y, 6)
            na_borda = x in (0.0, 10.0) or y in (0.0, 10.0)
            na_diagonal = abs(x - y) < 1e-6
            self.assertTrue(na_borda or na_diagonal, f"({x}, {y}) fora das arestas")

    def test_triangle_cai_dentro_do_quadrado(self):
        skeleton = com_malha(meshMode="triangle")
        vivos = alive(skeleton, 0.5, pose_em=lambda ti: skeleton)
        self.assertTrue(vivos)
        for p in vivos:
            self.assertTrue(-1e-9 <= p.x <= 10 + 1e-9)
            self.assertTrue(-1e-9 <= p.y <= 10 + 1e-9)

    def test_triangle_dobra_em_vez_de_tirar_raiz(self):
        # 9.4.1: `s = u3`, `w = u4`, and if `s + w > 1` both are reflected.
        # The other usual formula (`s = 1 - sqrt(u3)`) is uniform too and gives
        # a DIFFERENT point for the same two `u` — this test is what pins which.
        import math
        from recorte.particles import acaso, ponto_da_malha

        class Falso:
            seed = 42
            mesh_mode = "triangle"

        malha = ([0.0, 0.0, 10.0, 0.0, 10.0, 10.0], [0, 1, 2])
        for index in range(12):
            u3 = acaso(42, 0, index, 3)
            u4 = acaso(42, 0, index, 4)
            s, w = (1 - u3, 1 - u4) if u3 + u4 > 1 else (u3, u4)
            esperado = (0 + s * 10 + w * 10, 0 + s * 0 + w * 10)
            got = ponto_da_malha(Falso(), 0, index, u3, u4, malha)
            self.assertAlmostEqual(got[0], esperado[0], places=12)
            self.assertAlmostEqual(got[1], esperado[1], places=12)
            # and it is NOT the square-root formula
            rs = 1 - math.sqrt(u3)
            rw = u4 * math.sqrt(u3)
            if abs(rs - s) > 1e-6:
                self.assertNotAlmostEqual(got[0], rs * 10 + rw * 10, places=6)

    def test_o_triangulo_grande_recebe_mais(self):
        # 9.4.1: the triangle is drawn by ACCUMULATED AREA, so a big one gets
        # more particles than a small one — not one each.
        from recorte.particles import ponto_da_malha

        class Falso:
            seed = 42
            mesh_mode = "triangle"

        # triangle 0 is tiny, triangle 1 is huge
        malha = ([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 100.0, 0.0, 0.0, 100.0],
                 [0, 1, 2, 0, 3, 4])
        longe = 0
        for index in range(60):
            x, y = ponto_da_malha(Falso(), 0, index, 0.3, 0.3, malha)
            if x > 1 or y > 1:
                longe += 1
        self.assertGreater(longe, 50)

    def test_edge_e_triangle_sem_triangulacao_avisam_e_nao_desenham(self):
        # 9.4.1 builds both from the triangulation. Falling back to `vertex`
        # would draw a different shape than the author asked for.
        skeleton = build(
            bones=ROOT, slots=SLOTS, extensionsUsed=["BONE_particles"],
            skins=[{"name": "default", "attachments": {"fx": {
                "jato": emitter(shape="mesh", mesh="pano", meshMode="triangle",
                                rate=20, lifetime=[9, 9], looping=False),
                "pano": dict(QUADRADO, triangles=[]),
            }}}])
        self.assertEqual(alive(skeleton, 0.5, pose_em=lambda ti: skeleton), [])
        self.assertTrue(any("PARTICLE_MESH_NO_TRIANGLES" in m
                            for m in skeleton.warnings))

    def test_mesh_que_nao_aponta_para_malha_do_mesmo_slot_avisa(self):
        skeleton = build(
            bones=ROOT, slots=SLOTS, extensionsUsed=["BONE_particles"],
            skins=[{"name": "default", "attachments": {"fx": {
                "jato": emitter(shape="mesh", mesh="nao_existe", rate=20,
                                lifetime=[9, 9], looping=False)}}}])
        alive(skeleton, 0.5, pose_em=lambda ti: skeleton)
        self.assertTrue(any("REF_PARTICLE_MESH" in m for m in skeleton.warnings))


# ---------------------------------------------------------------------------
# 9.3.1 — mix first, then open the fan
# ---------------------------------------------------------------------------


class TestASpherize(unittest.TestCase):
    def test_com_spherize_um_a_particula_sai_para_fora_do_centro(self):
        import math
        skeleton = scene(rate=20, lifetime=[9, 9], shape="circle", radius=10,
                         radiusThickness=0, arc=360, speed=[100, 100],
                         direction=90, spread=0, spherizeDirection=1,
                         looping=False)
        for p in alive(skeleton, 0.5):
            # it left along its own radius: position and velocity are aligned
            self.assertGreater(math.hypot(p.x, p.y), 10)

    def test_com_spherize_zero_vale_direction(self):
        # 9.3.1: `0` uses `direction`, so every particle leaves in the SAME
        # direction whatever point of the rim it was born on. Straight up, so
        # nobody ever moves sideways: `x` stays inside the circle it was born
        # on, however old the particle is.
        skeleton = scene(rate=20, lifetime=[9, 9], shape="circle", radius=10,
                         radiusThickness=0, arc=360, speed=[100, 100],
                         direction=90, spread=0, spherizeDirection=0,
                         looping=False)
        vivos = alive(skeleton, 0.5)
        self.assertTrue(vivos)
        for p in vivos:
            self.assertLessEqual(abs(p.x), 10.0000001)
            self.assertGreaterEqual(p.y, -10.0000001)

    def test_com_spherize_um_o_x_se_abre_muito_mais(self):
        # The same rig with `spherizeDirection: 1`: each one leaves along its
        # own radius, so `x` reaches out to 60 instead of staying inside 10.
        skeleton = scene(rate=20, lifetime=[9, 9], shape="circle", radius=10,
                         radiusThickness=0, arc=360, speed=[100, 100],
                         direction=90, spread=0, spherizeDirection=1,
                         looping=False)
        vivos = alive(skeleton, 0.5)
        self.assertGreater(max(abs(p.x) for p in vivos), 30)

    def test_o_leque_nao_encolhe_com_a_mistura(self):
        # 9.3.1: mix FIRST, then open the fan around the mixed base. In the
        # other order the mix pulls both ends of the fan together and the fan
        # SHRINKS by (1 - spherizeDirection) — with spherize 1 it closes
        # altogether, and every particle leaves at the same angle however wide
        # the author opened `spread`. That side effect is what the line forbids.
        import math

        def aberturas(spherize):
            skeleton = scene(rate=40, lifetime=[9, 9], shape="circle", radius=10,
                             radiusThickness=0, arc=1e-9, speed=[100, 100],
                             direction=90, spread=45,
                             spherizeDirection=spherize, looping=False)
            # arc ~ 0: every particle is born at the same place, so the only
            # thing spreading the directions is `spread` itself.
            angulos = []
            for p in alive(skeleton, 0.5):
                angulos.append(math.degrees(math.atan2(p.y - 10 * math.sin(0),
                                                       p.x - 10 * math.cos(0))))
            return max(angulos) - min(angulos)

        sem = aberturas(0)
        com = aberturas(1)
        self.assertGreater(sem, 60)
        # the fan kept its width: it did not collapse to a single angle
        self.assertGreater(com, sem * 0.5)


# ---------------------------------------------------------------------------
# 4.2 — the birth is the INVERSE of the integral, not a sum afterwards
# ---------------------------------------------------------------------------


def torneira(keys, duration=2.0, times=(1.0,), rate=20, startDelay=0,
             life=5.0, loop=False):
    """An emitter whose `emitting` timeline opens and closes the tap."""
    from base import document
    return dump(document(
        bones=ROOT, slots=SLOTS, extensionsUsed=["BONE_particles"],
        skins=[{"name": "default", "attachments": {"fx": {"jato": emitter(
            rate=rate, lifetime=[life, life], speed=[0, 0], shape="point",
            looping=loop, startDelay=startDelay)}}}],
        animations=[{"name": "s", "duration": duration, "timelines": [{
            "type": "BONE_particle", "target": "fx", "skin": "default",
            "attachment": "jato", "property": "emitting", "keys": keys}]}]),
        {"animation": "s", "times": list(times), "loop": loop,
         "measure": ["particles"]})


LIGA_DESLIGA_LIGA = [
    {"time": 0, "value": True, "curve": "stepped"},
    {"time": 0.5, "value": False, "curve": "stepped"},
    {"time": 0.8, "value": True, "curve": "stepped"},
]


class TestATorneiraQueReliga(unittest.TestCase):
    """4.2: a stretch of zero effective rate has zero AREA, so it consumes no
    index — the numbering resumes unbroken in the next stretch.

    The shortcut `t_i = startDelay + i / rate` agrees while the tap only ever
    closes, and breaks the moment it opens again. This runtime took that
    shortcut and it was wrong; these tests are what would have caught it.
    """

    def lista(self, **kw):
        saida = torneira(LIGA_DESLIGA_LIGA, **kw)
        return [(p["index"], round(p["birth"], 6))
                for p in saida["samples"][0]["particles"]["fx/jato"]]

    def test_os_indices_continuam_seguidos_depois_do_vao(self):
        # The one that matters, and it is NOT the count: the particle born at
        # 0.80 is index 10. With the shortcut it would be 16 — and a different
        # index is a different hash, so a different life, speed, angle and
        # colour. The same particle under two names draws two things.
        got = self.lista()
        self.assertEqual(sorted(i for i, _b in got), list(range(0, 15)))
        depois = dict((b, i) for i, b in got)
        self.assertEqual(depois[0.8], 10)

    def test_ninguem_nasce_no_vao(self):
        nascimentos = [b for _i, b in self.lista()]
        self.assertFalse([b for b in nascimentos if 0.5 <= b < 0.8])

    def test_o_atalho_da_outro_numero(self):
        # `o + i/rate` would put a birth at every 0.05 from 0 to 1.0 and then
        # drop the ones in the gap, leaving a HOLE in the numbering.
        got = self.lista()
        atalho = [i for i in range(0, 21)
                  if not (0.5 <= round(0 + i / 20, 6) < 0.8)]
        self.assertNotEqual(sorted(i for i, _b in got), atalho)
        self.assertIn(16, atalho)          # what the shortcut would have named it
        self.assertNotIn(16, [i for i, _b in got])

    def test_a_integral_nao_anda_com_a_torneira_fechada(self):
        from recorte.particles import Trechos
        skeleton = scene(rate=20, lifetime=[5, 5], looping=False)
        attachment, _skin = skeleton.attachment_for(skeleton.slot_by_name["fx"])
        from recorte.loader import Key, Timeline
        timeline = Timeline(type="BONE_particle", target="fx", property="emitting",
                            attachment="jato",
                            keys=[Key(time=0, value=True, curve="stepped"),
                                  Key(time=0.5, value=False, curve="stepped"),
                                  Key(time=0.8, value=True, curve="stepped")])
        trechos = Trechos(attachment, {"emitting": timeline}, 2.0)
        self.assertAlmostEqual(trechos.E(0.5), 10.0, places=9)
        self.assertAlmostEqual(trechos.E(0.8), 10.0, places=9)   # stood still
        self.assertAlmostEqual(trechos.E(1.0), 14.0, places=9)
        self.assertAlmostEqual(trechos.instante(10), 0.8, places=9)

    def test_a_particula_que_nasce_exatamente_em_t_esta_viva(self):
        # 5: `t_i <= t`, so the one born at the sample instant is alive with
        # age 0 — the same rule P-001 and P-005 measure.
        got = self.lista()
        self.assertIn((14, 1.0), got)
        idades = {p["age"] for p in
                  torneira(LIGA_DESLIGA_LIGA)["samples"][0]["particles"]["fx/jato"]}
        self.assertIn(0.0, idades)


class TestAOrigemDaIntegral(unittest.TestCase):
    """4.2: `o = startDelay`, `E(o) = 0`, and the birth of `i` is where
    `E(t) = i` — never a sum applied afterwards."""

    def test_a_chave_fecha_no_relogio_do_esqueleto(self):
        # 4.1: the timeline is read in the skeleton clock, where the animator
        # put the key. With `startDelay 0.3` and the key closing at 0.5, the
        # emission window is [0.3, 0.5) — four births, and the last at 0.45.
        # Summing the delay at the END would push births to 0.75, where
        # `emitting` is already false in that very clock.
        saida = torneira(
            [{"time": 0, "value": True, "curve": "stepped"},
             {"time": 0.5, "value": False, "curve": "stepped"}],
            duration=1.5, times=(1.0,), startDelay=0.3, life=2.0)
        got = [(p["index"], round(p["birth"], 6))
               for p in saida["samples"][0]["particles"]["fx/jato"]]
        self.assertEqual(got, [(3, 0.45), (2, 0.4), (1, 0.35), (0, 0.3)])

    def test_torneira_que_fecha_antes_do_start_delay_nao_da_nada(self):
        # 4.2 writes it out: with `startDelay 0.6` and the key closing at 0.5,
        # NOTHING is born — the tap shut before the emitter switched on. It is
        # not absurd, and it is what the origin being in the right place means.
        saida = torneira(
            [{"time": 0, "value": True, "curve": "stepped"},
             {"time": 0.5, "value": False, "curve": "stepped"}],
            duration=1.5, times=(1.0,), startDelay=0.6, life=2.0)
        self.assertEqual(saida["samples"][0]["particles"]["fx/jato"], [])

    def test_o_prewarm_parte_da_origem_deslocada(self):
        # 4.2: the prewarm extends back FROM the origin, not from absolute
        # zero, and its indices are negative: `t_cont = o + i / r0`.
        saida = dump(documento(rate=10, lifetime=[5, 5], startDelay=1,
                               prewarm=0.5, looping=False),
                     {"times": [1.25], "measure": ["particles"]})
        got = sorted(p["index"] for p in saida["samples"][0]["particles"]["fx/jato"])
        self.assertEqual(got, [-5, -4, -3, -2, -1, 0, 1, 2])
        nascimentos = {round(p["birth"], 6)
                       for p in saida["samples"][0]["particles"]["fx/jato"]}
        self.assertEqual(min(nascimentos), 0.5)


if __name__ == "__main__":
    unittest.main()

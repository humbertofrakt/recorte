# SPDX-License-Identifier: Apache-2.0
"""What lives across files (spec 0.2): the nested skeleton (7.11), external
animations and skins (2.8), the body turn (9.13), `slot/bone` (9.5) and
animated weights (9.6)."""

from __future__ import annotations

import json
import unittest

from base import HEADER
from recorte import build_pose_dump
from recorte.actor import Actor
from recorte.loader import load_skeleton_bytes


def arquivo(**parts) -> dict:
    doc = {"bone": dict(HEADER)}
    doc.update(parts)
    return doc


def projeto(principal: dict, **outros: dict):
    """Loads `principal` with a resolver that answers from `outros`."""
    textos = {nome: json.dumps(doc).encode("utf-8") for nome, doc in outros.items()}
    return load_skeleton_bytes(json.dumps(principal).encode("utf-8"), textos.get)


def regiao(largura, altura, **extra):
    return dict({"type": "region", "width": largura, "height": altura}, **extra)


ARMA = arquivo(
    bones=[{"name": "root"}, {"name": "lamina", "parent": "root", "x": 20}],
    slots=[{"name": "lamina", "bone": "lamina", "attachment": "lamina"}],
    skins=[{"name": "default", "attachments": {"lamina": {"lamina": regiao(20, 10, x=15)}}}],
    events=[{"name": "disparo"}],
    animations=[
        {"name": "fire", "duration": 1, "timelines": [
            {"type": "event", "keys": [{"time": 0.5, "event": "disparo"}]}]},
        {"name": "giro", "duration": 1, "timelines": [
            {"type": "bone", "target": "lamina", "property": "rotation",
             "keys": [{"time": 0, "value": 0}, {"time": 1, "value": 90}]}]},
        {"name": "sobe", "duration": 1, "timelines": [
            {"type": "bone", "target": "lamina", "property": "y",
             "keys": [{"time": 0, "value": 7}]}]},
    ],
)


def hospedeiro(anexo: dict, animacoes=None) -> dict:
    return arquivo(
        bones=[{"name": "root"}, {"name": "mao", "parent": "root", "x": 100, "y": 50,
                                  "rotation": 90}],
        slots=[{"name": "arma", "bone": "mao", "attachment": "arma"}],
        skins=[{"name": "default", "attachments": {"arma": {"arma": dict(
            {"type": "skeleton", "uri": "arma.bone"}, **anexo)}}}],
        animations=animacoes or [],
    )


class TestEsqueletoAninhado(unittest.TestCase):
    def test_raiz_do_filho_no_osso_do_slot_vezes_trs_do_anexo(self):
        dados = projeto(hospedeiro({"x": 10, "rotation": -90}), **{"arma.bone": ARMA})
        amostra = build_pose_dump(dados, {"times": [0], "measure": ["bones"]})["samples"][0]
        raiz = amostra["bones"]["arma/root"]
        # mão girada 90 em (100, 50): T(10, 0) sobe 10; R(-90) desgira.
        self.assertAlmostEqual(raiz["worldX"], 100, places=6)
        self.assertAlmostEqual(raiz["worldY"], 60, places=6)
        self.assertAlmostEqual(raiz["a"], 1, places=6)
        self.assertAlmostEqual(amostra["bones"]["arma/lamina"]["worldX"], 120, places=6)

    def test_canais_prefixados_e_ordem_sem_o_filho(self):
        dados = projeto(hospedeiro({}), **{"arma.bone": ARMA})
        amostra = build_pose_dump(dados, {"times": [0], "measure": [
            "slots", "vertices", "drawOrder"]})["samples"][0]
        self.assertIn("arma/lamina", amostra["slots"])
        self.assertIn("arma/lamina/lamina", amostra["vertices"])
        self.assertNotIn("arma/arma", amostra["vertices"])
        self.assertEqual(amostra["drawOrder"], ["arma"])

    def test_evento_do_filho_chega_prefixado(self):
        dados = projeto(hospedeiro({"animation": "fire"}), **{"arma.bone": ARMA})
        dump = build_pose_dump(dados, {"times": [0.4, 0.6], "measure": ["events"]})
        self.assertEqual(dump["samples"][0]["events"], [])
        eventos = dump["samples"][1]["events"]
        self.assertEqual([e["event"] for e in eventos], ["arma/disparo"])
        self.assertAlmostEqual(eventos[0]["time"], 0.5, places=6)

    def test_fundo_por_baixo_e_nested_null_nao_cai_para_animation(self):
        anim = [{"name": "pai", "duration": 1, "timelines": [
            {"type": "nested", "target": "arma", "property": "animation",
             "keys": [{"time": 0, "value": None}]}]}]
        dados = projeto(hospedeiro({"animation": "giro", "baseAnimation": "sobe"}, anim),
                        **{"arma.bone": ARMA})
        osso = build_pose_dump(dados, {"animation": "pai", "times": [0.5], "measure": [
            "bones"]})["samples"][0]["bones"]["arma/lamina"]
        self.assertAlmostEqual(osso["ay"], 7, places=6)          # o fundo roda
        self.assertAlmostEqual(osso["arotation"], 0, places=6)   # null ganha de `animation`

    def test_ciclo_de_uri_nao_trava(self):
        eu = hospedeiro({})
        eu["skins"][0]["attachments"]["arma"]["arma"]["uri"] = "eu.bone"
        dados = projeto(eu, **{"eu.bone": eu})
        filho = dados.skins[0].attachments["arma"]["arma"].child
        self.assertIsNone(filho.skins[0].attachments["arma"]["arma"].child)
        self.assertTrue(any("NESTED_CYCLE" in m for m in filho.warnings.messages))
        build_pose_dump(dados, {"times": [0], "measure": ["bones"]})


# The rig of C-326: a hair strand with physics, and a `reset` key at 0.11 on
# the CHILD's clock.
CABELO = arquivo(
    skeleton={"name": "cabelo", "referenceScale": 100},
    bones=[{"name": "root"}, {"name": "fio", "parent": "root", "length": 100}],
    constraints=[{"type": "physics", "name": "vento", "bone": "fio", "x": 1,
                  "inertia": 0.5, "strength": 100, "damping": 1, "mass": 1,
                  "wind": 1, "gravity": 0, "limit": 5000, "fps": 60}],
    animations=[{"name": "sopro", "duration": 1, "timelines": [
        {"type": "constraint", "target": "vento", "property": "reset",
         "keys": [{"time": 0.11}]}]}],
)


def cabeca(aparece: float) -> dict:
    """The host: the strand shows up in slot `cab` at `aparece` seconds."""
    chaves = [{"time": 0, "value": "cabelo"}]
    if aparece > 0:
        chaves = [{"time": 0, "value": None}, {"time": aparece, "value": "cabelo"}]
    return arquivo(
        bones=[{"name": "root"}],
        slots=[{"name": "cab", "bone": "root"}],
        skins=[{"name": "default", "attachments": {"cab": {"cabelo": {
            "type": "skeleton", "uri": "cabelo.bone", "animation": "sopro",
            "loop": False}}}}],
        animations=[{"name": "fica", "duration": 2, "timelines": [
            {"type": "slot", "target": "cab", "property": "attachment",
             "keys": chaves}]}],
    )


class TestResetDentroDaPeca(unittest.TestCase):
    """7.11: the child's animation counts whole, `reset` keys too (9.8),
    before the `physicsApply` of the same frame. C-326 proves the key fires;
    this proves the CLOCK: the key is looked for on the child's clock, which
    starts when the strand shows up. With the child born at 0 it is the
    parent's clock too, and a reader that reads the key there passes C-326."""

    def fio(self, aparece: float) -> list:
        dados = projeto(cabeca(aparece), **{"cabelo.bone": CABELO})
        # The probe's literal, as in the cases: with `1 / 60` exactly, a frame
        # boundary of the 60 fps physics (6.5) falls a hair short and one
        # step is lost (0.082562 here, with the reset firing all the same).
        dt = 0.0166666666666667
        dump = build_pose_dump(dados, {
            "animation": "fica", "physicsDt": dt,
            "times": [aparece + 0.1, aparece + 10 * dt], "measure": ["bones"]})
        return [s["bones"]["cab/fio"]["worldX"] for s in dump["samples"]]

    def test_o_reset_do_filho_dispara(self):
        x = self.fio(0)
        self.assertAlmostEqual(x[0], 0.531095, places=5)
        self.assertAlmostEqual(x[1], 0.162830, places=5)   # sem o reset: 1,180874

    def test_filho_que_aparece_depois_tem_o_mesmo_reset(self):
        # Born at 0.5: the key is at 0.61 on the frame's clock, and the strand
        # does exactly what it did when it was born at 0, half a second later.
        x = self.fio(0.5)
        self.assertAlmostEqual(x[0], 0.531095, places=5)
        self.assertAlmostEqual(x[1], 0.162830, places=5)


class TestDeFora(unittest.TestCase):
    def test_reference_escala_so_as_translacoes(self):
        host = arquivo(assets={"animations": ["anda.bone"]},
                       bones=[{"name": "root"}, {"name": "t", "parent": "root", "length": 30}])
        anda = arquivo(rig={"bones": ["t"], "reference": {"bone": "t", "length": 10}},
                       bones=[{"name": "root"}], animations=[{"name": "anda", "timelines": [
                           {"type": "bone", "target": "t", "property": "x",
                            "keys": [{"time": 0, "value": 2}]},
                           {"type": "bone", "target": "t", "property": "rotation",
                            "keys": [{"time": 0, "value": 2}]}]}])
        dados = projeto(host, **{"anda.bone": anda})
        osso = build_pose_dump(dados, {"animation": "anda", "times": [0], "measure": [
            "bones"]})["samples"][0]["bones"]["t"]
        self.assertAlmostEqual(osso["ax"], 6, places=6)
        self.assertAlmostEqual(osso["arotation"], 2, places=6)

    def test_pele_de_fora_traz_osso_e_slot_no_fim(self):
        host = arquivo(assets={"skins": ["rabo.bone"]},
                       bones=[{"name": "root"}],
                       slots=[{"name": "corpo", "bone": "root"}])
        rabo = arquivo(rig={"bones": ["root"]},
                       bones=[{"name": "root"}, {"name": "comum", "parent": "root"},
                              {"name": "rabo", "parent": "root", "x": 5, "skinRequired": True}],
                       slots=[{"name": "rabo", "bone": "rabo"}],
                       skins=[{"name": "lobo", "bones": ["rabo"]}])
        dados = projeto(host, **{"rabo.bone": rabo})
        self.assertEqual([b.name for b in dados.bones], ["root", "rabo"])
        self.assertEqual([s.name for s in dados.slots], ["corpo", "rabo"])
        self.assertIsNotNone(dados.find_skin("lobo"))
        self.assertTrue(any("EXTERNAL_BONE_NOT_SKIN" in m for m in dados.warnings.messages))

    def test_arquivo_faltando_entra_na_lista(self):
        dados = projeto(arquivo(assets={"animations": ["nada.bone"]}, bones=[{"name": "root"}]))
        self.assertEqual(dados.missing, ["nada.bone"])


def homem_e_lobo(chaves) -> tuple:
    homem = arquivo(
        bones=[{"name": "root"}, {"name": "braco", "parent": "root", "x": 1}],
        slots=[{"name": "corpo", "bone": "root", "attachment": "corpo"}],
        skins=[{"name": "default", "attachments": {"corpo": {"corpo": regiao(2, 2)}}},
               {"name": "pelo", "attachments": {"corpo": {"corpo": regiao(4, 4)}}}],
        animations=[{"name": "virar", "duration": 1, "timelines": [
            {"type": "body", "keys": chaves},
            {"type": "bone", "target": "braco", "property": "rotation",
             "keys": [{"time": 0, "value": 30}]}]}])
    lobo = arquivo(
        bones=[{"name": "root"}, {"name": "rabo", "parent": "root", "x": 9}],
        slots=[{"name": "corpo", "bone": "root", "attachment": "corpo"}],
        skins=[{"name": "default", "attachments": {"corpo": {"corpo": regiao(6, 6)}}},
               {"name": "pelo", "attachments": {"corpo": {"corpo": regiao(8, 8)}}}])
    return (homem, lobo)


class TestVirada(unittest.TestCase):
    def test_antes_da_primeira_chave_vale_o_arquivo(self):
        homem, lobo = homem_e_lobo([{"time": 0.5, "value": "lobo.bone"}])
        dados = projeto(homem, **{"lobo.bone": lobo})
        dump = build_pose_dump(dados, {"animation": "virar", "times": [0.2, 0.7],
                                       "measure": ["bones"]})
        antes, depois = dump["samples"]
        self.assertIsNone(antes["body"])
        self.assertIn("braco", antes["bones"])
        self.assertEqual(depois["body"], "lobo.bone")
        self.assertIn("rabo", depois["bones"])
        self.assertNotIn("braco", depois["bones"])

    def test_um_esqueleto_por_corpo_montado_uma_vez(self):
        homem, lobo = homem_e_lobo([{"time": 0.5, "value": "lobo.bone"}])
        ator = Actor(projeto(homem, **{"lobo.bone": lobo}))
        animacao = ator.data.find_animation("virar")
        primeiro = ator.pose(animacao, 0.7, 0.7, False, 0)
        ator.pose(animacao, 0.2, 0.2, False, 0.7)
        self.assertIs(ator.pose(animacao, 0.9, 0.9, False, 0.2), primeiro)

    def test_keep_skins_falso_volta_so_com_default(self):
        homem, lobo = homem_e_lobo([{"time": 0.5, "value": "lobo.bone", "keepSkins": False}])
        dados = projeto(homem, **{"lobo.bone": lobo})
        vertices = build_pose_dump(dados, {"animation": "virar", "skins": ["default", "pelo"],
                                           "times": [0.2, 0.7], "measure": ["vertices"]})
        antes, depois = [s["vertices"]["corpo/corpo"] for s in vertices["samples"]]
        self.assertEqual(antes[:2], [-2, -2])     # pelo do homem, 4x4
        self.assertEqual(depois[:2], [-3, -3])    # default do lobo, 6x6


class TestDesenhoTrocaDeOsso(unittest.TestCase):
    def _dados(self):
        return projeto(arquivo(
            bones=[{"name": "root"}, {"name": "mao", "parent": "root", "x": 10},
                   {"name": "costas", "parent": "root", "y": 10, "rotation": 90}],
            slots=[{"name": "s", "bone": "mao", "attachment": "p"}],
            skins=[{"name": "default", "attachments": {"s": {"p": {"type": "point"}}}}],
            animations=[{"name": "a", "duration": 1, "timelines": [
                {"type": "slot", "target": "s", "property": "bone", "keys": [
                    {"time": 0.5, "value": "costas",
                     "transform": {"x": 3, "rotation": -90}}]}]}]))

    def test_transform_t_antes_de_r(self):
        dump = build_pose_dump(self._dados(), {"animation": "a", "times": [0.6],
                                               "measure": ["slots", "points"]})
        amostra = dump["samples"][0]
        self.assertEqual(amostra["slots"]["s"]["bone"], "costas")
        ponto = amostra["points"]["s/p"]
        self.assertAlmostEqual(ponto["x"], 0, places=6)
        self.assertAlmostEqual(ponto["y"], 13, places=6)
        self.assertAlmostEqual(ponto["rotation"], 0, places=6)

    def test_setup_devolve_o_osso_do_arquivo(self):
        ator = Actor(self._dados())
        esqueleto = ator.pose(ator.data.find_animation("a"), 0.6, 0.6, False, 0)
        esqueleto.set_to_setup_pose()
        self.assertEqual(esqueleto.slot_by_name["s"].bone.name, "mao")
        self.assertIsNone(esqueleto.slot_by_name["s"].bone_transform)


class TestPesosAnimados(unittest.TestCase):
    def test_chave_de_tamanho_errado_e_ignorada(self):
        dados = projeto(arquivo(
            bones=[{"name": "root"}, {"name": "a", "parent": "root", "x": 10}],
            slots=[{"name": "m", "bone": "root", "attachment": "m"}],
            skins=[{"name": "default", "attachments": {"m": {"m": {
                "type": "mesh", "uvs": [0, 0, 1, 0, 0, 1], "triangles": [0, 1, 2],
                "binding": {"counts": [2, 1, 1], "bones": [0, 1, 0, 0],
                            "positions": [0, 0, 0, 0, 5, 0, 0, 5],
                            "weights": [1, 0, 1, 1]}}}}}],
            animations=[{"name": "p", "duration": 1, "timelines": [
                {"type": "weights", "target": "m", "attachment": "m", "keys": [
                    {"time": 0, "value": [0, 1, 1, 1]},
                    {"time": 1, "value": [1, 1]}]}]}]))
        vertices = build_pose_dump(dados, {"animation": "p", "times": [1],
                                           "measure": ["vertices"]})["samples"][0]["vertices"]
        self.assertAlmostEqual(vertices["m/m"][0], 10, places=6)   # só a chave válida


# "Este boneco" (7.11 `around`, 7.13, 12.4 `drawList`).
PODER = arquivo(
    bones=[{"name": "root"}, {"name": "orbe", "parent": "root"}],
    slots=[{"name": n, "bone": "root", "attachment": n} for n in ("atras", "meio", "frente")],
    skins=[{"name": "default", "attachments": {
        n: {n: regiao(10, 10)} for n in ("atras", "meio", "frente")}}],
    animations=[{"name": "andar", "duration": 2, "timelines": [
        {"type": "bone", "target": "orbe", "property": "x",
         "keys": [{"time": 0, "value": 0}, {"time": 2, "value": 200}]}]}],
)


def heroi(*anexos: tuple[str, dict], ordem=("perna", "aura", "cabeca"), extra=None,
          animacoes=None) -> dict:
    """`perna · aura · cabeca`; the `aura` slot gets every placeholder given."""
    anexos_aura = {nome: dict({"type": "skeleton", "uri": "poder.bone"}, **a) for nome, a in anexos}
    pele = {n: {n: regiao(10, 10)} for n in ordem if n != "aura"}
    pele["aura"] = anexos_aura
    pele.update(extra or {})
    return arquivo(
        bone=dict(HEADER, version="1.1", minVersion="1.1"),
        bones=[{"name": "root"}],
        slots=[{"name": n, "bone": "root", "attachment": (anexos[0][0] if n == "aura" else n)}
               for n in ordem],
        skins=[{"name": "default", "attachments": pele}],
        animations=animacoes or [],
    )


def lista(dados, **sonda) -> list:
    sonda = dict({"times": [0], "measure": ["drawList"]}, **sonda)
    return [[(p["piece"], tuple(p["clips"])) if p["clips"] else p["piece"] for p in a["drawList"]]
            for a in build_pose_dump(dados, sonda)["samples"]]


class TestEsteBoneco(unittest.TestCase):
    def test_sem_around_o_filho_entra_em_bloco_no_lugar_do_slot(self):
        dados = projeto(heroi(("p", {})), **{"poder.bone": PODER})
        self.assertEqual(lista(dados), [["perna/perna", "aura/atras/atras", "aura/meio/meio",
                                         "aura/frente/frente", "cabeca/cabeca"]])

    def test_around_parte_o_filho_em_volta_do_pai_inteiro_sem_o_meio(self):
        dados = projeto(heroi(("p", {"around": "meio"})), **{"poder.bone": PODER})
        self.assertEqual(lista(dados), [["aura/atras/atras", "perna/perna", "cabeca/cabeca",
                                         "aura/frente/frente"]])
        self.assertEqual(dados.warnings.messages, [])   # 1.1 abre normal

    def test_slot_que_o_filho_nao_tem_desenha_em_bloco_e_avisa_uma_vez(self):
        dados = projeto(heroi(("p", {"around": "nada"})), **{"poder.bone": PODER})
        ator = Actor(dados)
        ator.pose(None, 0, 0, False, float("-inf"))
        from recorte import draw_list
        primeira = draw_list(ator.current)
        draw_list(ator.current)
        self.assertEqual([p for p, _ in primeira], ["perna/perna", "aura/atras/atras",
                                                     "aura/meio/meio", "aura/frente/frente",
                                                     "cabeca/cabeca"])
        avisos = [m for m in ator.current.warnings if "AROUND_SLOT_MISSING" in m]
        self.assertEqual(len(avisos), 1)

    def test_mascara_do_pai_corta_o_bloco_e_nao_corta_o_around(self):
        extra = {"recorte": {"recorte": {"type": "clipping", "end": "cabeca",
                                         "vertices": [0, 0, 10, 0, 0, 10]}}}
        ordem = ("recorte", "perna", "aura", "cabeca")
        bloco = projeto(heroi(("p", {}), ordem=ordem, extra=extra), **{"poder.bone": PODER})
        volta = projeto(heroi(("p", {"around": "meio"}), ordem=ordem, extra=extra),
                        **{"poder.bone": PODER})
        corte = ("recorte/recorte",)
        self.assertEqual(lista(bloco), [[("perna/perna", corte), ("aura/atras/atras", corte),
                                         ("aura/meio/meio", corte), ("aura/frente/frente", corte),
                                         ("cabeca/cabeca", corte)]])
        self.assertEqual(lista(volta), [["aura/atras/atras", ("perna/perna", corte),
                                         ("cabeca/cabeca", corte), "aura/frente/frente"]])

    def test_troca_de_placeholder_com_a_mesma_uri_nao_zera_o_relogio(self):
        troca = [{"name": "troca", "duration": 1, "timelines": [
            {"type": "slot", "target": "aura", "property": "attachment",
             "keys": [{"time": 0, "value": "p"}, {"time": 0.75, "value": "q"}]}]}]
        def orbe(uri_q):
            dados = projeto(heroi(("p", {"animation": "andar", "around": "meio"}),
                                  ("q", {"animation": "andar", "uri": uri_q}),
                                  animacoes=troca),
                            **{"poder.bone": PODER, "outro.bone": PODER})
            amostras = build_pose_dump(dados, {"animation": "troca", "times": [0.5, 0.9],
                                               "measure": ["bones"]})["samples"]
            return [round(a["bones"]["aura/orbe"]["worldX"], 6) for a in amostras]
        self.assertEqual(orbe("poder.bone"), [50, 90])   # continua (7.11, Apêndice C 1)
        self.assertEqual(orbe("outro.bone"), [50, 15])   # outra uri: zera na chave


if __name__ == "__main__":
    unittest.main()

#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Roda a suíte de conformidade contra o runtime Python (seção 12.4).

    python runtime-python/conformidade.py
    python runtime-python/conformidade.py --nivel C
    python runtime-python/conformidade.py --caso C-212-ik-2-ossos
    python runtime-python/conformidade.py --json

Sai com código diferente de zero se algum caso falhar.
"""

from __future__ import annotations

import argparse
import json
import sys
import time as clock
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent
sys.path.insert(0, str(AQUI))

from recorte import build_pose_dump, compare_pose_dump  # noqa: E402
from recorte.loader import BoneError, load_skeleton_bytes  # noqa: E402
from recorte.pose_dump import PHYSICS_TOLERANCES, TOLERANCES  # noqa: E402

CASOS = RAIZ / "conformidade" / "casos"
NOMES_DE_ENTRADA = ("entrada.bone", "entrada.boneb", "entrada.bonez")


def nivel_do_caso(nome: str) -> str:
    return nome.split("-", 1)[0] if "-" in nome else "?"


def listar_casos(pasta: Path) -> list[str]:
    if not pasta.is_dir():
        return []
    return sorted(p.name for p in pasta.iterdir()
                  if p.is_dir() and (p / "esperado.json").is_file())


def ler_caso(pasta: Path, nome: str) -> dict:
    dir_caso = pasta / nome
    esperado = json.loads((dir_caso / "esperado.json").read_text(encoding="utf-8"))
    sonda_propria = dir_caso / "probe.json"
    if sonda_propria.is_file():
        sonda = json.loads(sonda_propria.read_text(encoding="utf-8"))
    else:
        sonda = esperado.get("probe")
    if sonda is None:
        raise BoneError(f'caso "{nome}" sem sonda: falta probe.json ou a chave "probe"')
    entrada = None
    for candidato in NOMES_DE_ENTRADA:
        if (dir_caso / candidato).is_file():
            entrada = dir_caso / candidato
            break
    if entrada is None:
        raise BoneError(f'caso "{nome}" sem entrada')
    return {"nome": nome, "dir": dir_caso, "nivel": nivel_do_caso(nome),
            "sonda": sonda, "esperado": esperado, "entrada": entrada}


def carregar(caso: dict):
    dir_caso: Path = caso["dir"]
    dados = caso["entrada"].read_bytes()

    def resolver(uri: str) -> bytes | None:
        arquivo = dir_caso / uri
        return arquivo.read_bytes() if arquivo.is_file() else None

    return load_skeleton_bytes(dados, resolver)


def rodar_caso(caso: dict) -> dict:
    inicio = clock.time()
    recusa = caso["esperado"].get("recusa")
    try:
        dados = carregar(caso)
        obtido = build_pose_dump(dados, caso["sonda"])
    except Exception as erro:  # noqa: BLE001 — qualquer recusa conta
        if recusa is not None:
            trecho = recusa.get("contem")
            bate = trecho is None or trecho in str(erro)
            return {"caso": caso["nome"], "nivel": caso["nivel"], "passou": bate,
                    "erro": None if bate else
                    f'recusou, mas a mensagem não traz "{trecho}": {erro}',
                    "diferencas": [], "maiorDiferenca": 0 if bate else None,
                    "ms": int((clock.time() - inicio) * 1000)}
        return {"caso": caso["nome"], "nivel": caso["nivel"], "passou": False,
                "erro": str(erro), "diferencas": [], "maiorDiferenca": None,
                "ms": int((clock.time() - inicio) * 1000)}

    if recusa is not None:
        return {"caso": caso["nome"], "nivel": caso["nivel"], "passou": False,
                "erro": "o arquivo devia ter sido recusado, e carregou",
                "diferencas": [], "maiorDiferenca": None,
                "ms": int((clock.time() - inicio) * 1000)}

    base = PHYSICS_TOLERANCES if caso["sonda"].get("physicsDt") else TOLERANCES
    tolerancias = dict(base, **(caso["sonda"].get("tolerances") or {}))
    ok, diferencas, pior = compare_pose_dump(caso["esperado"], obtido, tolerancias)
    return {
        "caso": caso["nome"], "nivel": caso["nivel"], "passou": ok, "erro": None,
        "diferencas": [{"onde": d.pointer, "esperado": d.expected, "obtido": d.actual,
                        "diferenca": None if d.delta == float("inf") else round(d.delta, 6),
                        "tolerancia": d.tolerance} for d in diferencas[:8]],
        "maiorDiferenca": round(pior, 6),
        "ms": int((clock.time() - inicio) * 1000),
    }


def nivel_alcancado(por_nivel: dict) -> tuple[str | None, list[str]]:
    def cheio(n: str) -> bool:
        v = por_nivel.get(n)
        return v is not None and v["total"] > 0 and v["passaram"] == v["total"]

    def vazio(n: str) -> bool:
        v = por_nivel.get(n)
        return v is None or v["total"] == 0

    faltando = [n for n in ("A", "B", "C", "X", "BIN", "ZIP") if vazio(n)]
    if not cheio("X") or not cheio("A"):
        return (None, faltando)
    if not cheio("B"):
        return ("A", faltando)
    if not cheio("C") or not (cheio("BIN") and cheio("ZIP")):
        return ("B", faltando)
    return ("C", faltando)


def tabela(linhas: list[dict]) -> str:
    cabecalho = ["Caso", "Nível", "Resultado", "Maior diferença"]
    corpo = []
    for r in linhas:
        if r["erro"] is not None:
            resultado, diferenca = "ERRO", "—"
        else:
            resultado = "passou" if r["passou"] else "FALHOU"
            diferenca = "nenhuma" if r["maiorDiferenca"] == 0 else str(r["maiorDiferenca"])
        corpo.append([r["caso"], r["nivel"], resultado, diferenca])
    larguras = [max(len(cabecalho[i]), *(len(linha[i]) for linha in corpo)) if corpo
                else len(cabecalho[i]) for i in range(4)]

    def linha(celulas: list[str]) -> str:
        return "  ".join(c.ljust(larguras[i]) for i, c in enumerate(celulas)).rstrip()

    regua = "  ".join("-" * w for w in larguras)
    return "\n".join([linha(cabecalho), regua, *(linha(l) for l in corpo)])


def detalhes(linhas: list[dict]) -> str:
    partes: list[str] = []
    for r in linhas:
        if r["passou"]:
            continue
        partes.append(f"\n{r['caso']}")
        if r["erro"] is not None:
            partes.append(f"  erro: {r['erro']}")
            continue
        for d in r["diferencas"]:
            distancia = ("não bate" if d["diferenca"] is None
                         else f"diferença {d['diferenca']} (tolerância {d['tolerancia']})")
            partes.append(f"  {d['onde']}")
            partes.append(f"    esperado {json.dumps(d['esperado'])}   "
                          f"obtido {json.dumps(d['obtido'])}   {distancia}")
    return "\n".join(partes)


def principal(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(
        description="Suíte de conformidade do formato .bone, contra o runtime Python.")
    parser.add_argument("--caso", action="append", default=[], help="Roda só um caso.")
    parser.add_argument("--nivel", action="append", default=[], help="Roda só um nível.")
    parser.add_argument("--json", action="store_true", help="Relatório em JSON.")
    parser.add_argument("--casos", default=str(CASOS), help="Outra pasta de casos.")
    op = parser.parse_args(argv)

    pasta = Path(op.casos)
    nomes = listar_casos(pasta)
    if op.caso:
        faltando = [n for n in op.caso if n not in nomes]
        if faltando:
            raise SystemExit(f"caso não encontrado: {', '.join(faltando)}")
        nomes = [n for n in nomes if n in set(op.caso)]
    if op.nivel:
        pedidos = {n.upper() for n in op.nivel}
        nomes = [n for n in nomes if nivel_do_caso(n) in pedidos]
    if not nomes:
        raise SystemExit(f"nenhum caso em {pasta}")

    linhas = [rodar_caso(ler_caso(pasta, nome)) for nome in nomes]
    falhas = [r for r in linhas if not r["passou"]]
    por_nivel: dict[str, dict[str, int]] = {}
    for r in linhas:
        entrada = por_nivel.setdefault(r["nivel"], {"total": 0, "passaram": 0})
        entrada["total"] += 1
        if r["passou"]:
            entrada["passaram"] += 1

    if op.json:
        nivel, faltando = nivel_alcancado(por_nivel)
        print(json.dumps({
            "suite": "bone-conformance", "formatVersion": "1.0",
            "runtime": "recorte-python", "total": len(linhas),
            "passed": len(linhas) - len(falhas), "failed": len(falhas),
            "level": nivel, "missingCategories": faltando,
            "byLevel": por_nivel, "cases": linhas,
        }, indent=2, ensure_ascii=False))
    else:
        print(tabela(linhas))
        if falhas:
            print(detalhes(linhas))
        resumo = "   ".join(f"{n}: {v['passaram']}/{v['total']}"
                            for n, v in sorted(por_nivel.items()))
        print(f"\n{len(linhas) - len(falhas)} de {len(linhas)} passaram.   {resumo}")
    return 0 if not falhas else 1


if __name__ == "__main__":
    sys.exit(principal(sys.argv[1:]))

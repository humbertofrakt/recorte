#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Adaptador do runtime Python para o executor oficial da suíte (§12.4).

Recebe a pasta do caso como argumento e a sonda em JSON na entrada padrão, e
devolve o pose dump em JSON na saída padrão. Recusa um arquivo saindo com
código diferente de zero e escrevendo o motivo na saída de erro.

    node ferramentas/conformidade.mjs --adaptador "python runtime-python/adaptador.py"
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI))

from recorte import build_pose_dump  # noqa: E402
from recorte.loader import load_skeleton_bytes  # noqa: E402

NOMES_DE_ENTRADA = ("entrada.bone", "entrada.boneb", "entrada.bonez")


def main(argv: list[str]) -> int:
    if not argv:
        sys.stderr.write("falta a pasta do caso\n")
        return 2
    pasta = Path(argv[0])
    sonda = json.loads(sys.stdin.read() or "{}")

    entrada = None
    for nome in NOMES_DE_ENTRADA:
        if (pasta / nome).is_file():
            entrada = pasta / nome
            break
    if entrada is None:
        sys.stderr.write(f"caso sem entrada em {pasta}\n")
        return 2

    def resolver(uri: str) -> bytes | None:
        arquivo = pasta / uri
        return arquivo.read_bytes() if arquivo.is_file() else None

    try:
        dados = load_skeleton_bytes(entrada.read_bytes(), resolver)
        dump = build_pose_dump(dados, sonda)
    except Exception as erro:  # noqa: BLE001 — recusa é resultado válido
        sys.stderr.write(f"{erro}\n")
        return 1

    sys.stdout.write(json.dumps(dump, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

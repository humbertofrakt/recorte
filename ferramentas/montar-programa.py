"""Monta o editor e poe a versao pronta em programa/.

Uso, da raiz do projeto:  python ferramentas/montar-programa.py [NUMERO]

NUMERO (ex.: 27.5) e a versao que vai ser fechada logo depois pelo versao.py.
Com ele, o "Sobre" do programa e o LEIA-ME dizem esse numero. Sem ele, dizem a
maior versao ja guardada, como antes -- e o Sobre fica uma versao atras, porque
o fecho monta ANTES de guardar (rodada 4, consertos, 05/10/2026). Numero que ja
existe em backup/versoes e recusado: o Sobre diria uma versao que e outra.

O que faz:
  1. roda `npm run editor:build` (a saida vai para backup/editor-build)
  2. limpa programa/index.html e programa/assets
  3. copia a saida nova para programa/
  4. escreve a data e a versao em programa/LEIA-ME.txt

Nao mexe em servidor.mjs, Abrir o editor.bat nem no resto do LEIA-ME.
"""
import datetime
import os
import re
import shutil
import subprocess
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAIDA = os.path.join(RAIZ, "backup", "editor-build")
PROGRAMA = os.path.join(RAIZ, "programa")


def versao_atual():
    pasta = os.path.join(RAIZ, "backup", "versoes")
    if not os.path.isdir(pasta):
        return "?"
    numeros = []
    for nome in os.listdir(pasta):
        m = re.match(r"recorte v(\d+)\.(\d+) ", nome)
        if m:
            numeros.append((int(m.group(1)), int(m.group(2))))
    if not numeros:
        return "?"
    maior = max(numeros)
    return f"v{maior[0]}.{maior[1]}"


def versoes_guardadas(pasta):
    """Os numeros (maior, menor) das versoes guardadas em backup/versoes."""
    if not os.path.isdir(pasta):
        return []
    numeros = []
    for nome in os.listdir(pasta):
        m = re.match(r"recorte v(\d+)\.(\d+) ", nome)
        if m:
            numeros.append((int(m.group(1)), int(m.group(2))))
    return numeros


def versao_pedida(args, guardadas):
    """O numero pedido na linha de comando: (numero ou None, erro ou None)."""
    if not args:
        return None, None
    pedido = args[0].strip().lstrip("v")
    m = re.fullmatch(r"(\d+)\.(\d+)", pedido)
    if not m:
        return None, f"o numero tem de ser como 27.5, e veio '{args[0]}'"
    numero = (int(m.group(1)), int(m.group(2)))
    if numero in guardadas:
        return None, (f"a v{pedido} ja esta guardada em backup/versoes: "
                      "use o numero da versao que vai ser fechada agora")
    return f"{numero[0]}.{numero[1]}", None


def main():
    pedida, erro = versao_pedida(sys.argv[1:], versoes_guardadas(os.path.join(RAIZ, "backup", "versoes")))
    if erro is not None:
        print(f"PAREI: {erro}.")
        sys.exit(1)
    ambiente = dict(os.environ)
    if pedida is not None:
        ambiente["RECORTE_VERSAO"] = pedida
        print(f"Versao do programa: v{pedida}")
    print("1. Montando o editor (npm run editor:build)...")
    comando = "npm.cmd" if os.name == "nt" else "npm"
    resultado = subprocess.run([comando, "run", "editor:build"], cwd=RAIZ, env=ambiente)
    if resultado.returncode != 0:
        print("PAREI: a montagem falhou. Veja as linhas acima.")
        sys.exit(1)
    if not os.path.isfile(os.path.join(SAIDA, "index.html")):
        print("PAREI: nao achei backup/editor-build/index.html")
        sys.exit(1)

    print("2. Limpando programa/...")
    os.makedirs(PROGRAMA, exist_ok=True)
    for nome in ("index.html", "assets"):
        alvo = os.path.join(PROGRAMA, nome)
        if os.path.isdir(alvo):
            shutil.rmtree(alvo)
        elif os.path.isfile(alvo):
            os.remove(alvo)

    print("3. Copiando...")
    total = 0
    for nome in os.listdir(SAIDA):
        origem = os.path.join(SAIDA, nome)
        destino = os.path.join(PROGRAMA, nome)
        if os.path.isdir(origem):
            shutil.copytree(origem, destino)
            total += sum(len(a) for _, _, a in os.walk(origem))
        else:
            shutil.copy2(origem, destino)
            total += 1

    leia = os.path.join(PROGRAMA, "LEIA-ME.txt")
    if os.path.isfile(leia):
        hoje = datetime.date.today().strftime("%d/%m/%Y")
        # newline="" dos dois lados: o fim de linha do LEIA-ME fica como esta
        # (o modo texto do Python no Windows troca LF por CRLF sem dizer).
        with open(leia, encoding="utf-8", newline="") as f:
            texto = f.read()
        numero = f"v{pedida}" if pedida is not None else versao_atual()
        texto = re.sub(r"Versao v[\d.?]+, montada em \d\d/\d\d/\d\d\d\d\.",
                       f"Versao {numero}, montada em {hoje}.", texto)
        with open(leia, "w", encoding="utf-8", newline="") as f:
            f.write(texto)

    print(f"Pronto: {total} arquivos em programa/. Abra com 'Abrir o editor.bat'.")


if __name__ == "__main__":
    main()

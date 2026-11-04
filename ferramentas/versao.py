"""Guarda uma versão numerada do projeto em backup/versoes e registra no backup/INDICE.md.

Uso:  python ferramentas/versao.py 0.2 "Especificação 0.1 do formato + validador"
"""
import sys, os, zipfile, datetime, re

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INCLUIR = [
    # código e formato
    "formato", "ferramentas", "runtime", "runtime-python", "editor", "programa", "contribuição",
    # o que prova que o formato funciona
    "conformidade",
    # documentação e site
    "documentos", "site",
    # arquivos da raiz
    "package.json", "tsconfig.json", "vitest.config.ts", ".gitignore",
    "README.md", "ESTADO.md", "CHANGELOG.md", "CONTRIBUTING.md",
    "LICENSE", "NOTICE", "Abrir Recorte.bat", "CLAUDE.md",
]
EXCLUIR_DIRS = {"node_modules", "dist", ".vite", "__pycache__"}

def main():
    if len(sys.argv) < 3:
        print(__doc__); sys.exit(1)
    versao, descricao = sys.argv[1], sys.argv[2]
    hoje = datetime.date.today().strftime("%Y-%m-%d")
    hoje_br = datetime.date.today().strftime("%d/%m/%Y")
    pasta = os.path.join(RAIZ, "backup", "versoes")
    os.makedirs(pasta, exist_ok=True)
    nome = f"recorte v{versao} {hoje}.zip"
    destino = os.path.join(pasta, nome)

    # Nunca sobrescrever uma versao ja guardada.
    # Em 08/09/2026 duas sessoes gravaram "v1.4" no mesmo dia e uma apagou a
    # outra. Backup que some sem avisar e pior do que backup que nao existe.
    # E o NUMERO conta, nao o nome: em 18/09/2026, passada a meia-noite, a v14.4
    # nasceu duas vezes ("... 2026-09-17.zip" e "... 2026-09-18.zip") porque a
    # data no nome deixou o numero repetido escapar. Confere o numero em
    # qualquer data.
    prefixo = f"recorte v{versao} "
    repetidos = [f for f in os.listdir(pasta) if f.startswith(prefixo) and f.endswith(".zip")]
    if os.path.exists(destino) or repetidos:
        print(f"PAREI: a v{versao} ja existe" + (f" ({', '.join(repetidos)})." if repetidos else f" ({nome})."))
        existentes = sorted(f for f in os.listdir(pasta) if f.startswith("recorte v"))
        if existentes:
            print("\nVersoes ja guardadas:")
            for f in existentes[-5:]:
                print(f"  {f}")
        print("\nEscolha um numero de versao que ainda nao existe e rode de novo.")
        sys.exit(1)

    manuais = [f for f in os.listdir(RAIZ) if f.startswith("MANUAL") and f.endswith(".md")]
    total = 0
    with zipfile.ZipFile(destino, "w", zipfile.ZIP_DEFLATED) as z:
        for item in INCLUIR + manuais:
            caminho = os.path.join(RAIZ, item)
            if os.path.isfile(caminho):
                z.write(caminho, item); total += 1
            elif os.path.isdir(caminho):
                for d, subdirs, arquivos in os.walk(caminho):
                    subdirs[:] = [s for s in subdirs if s not in EXCLUIR_DIRS]
                    for a in arquivos:
                        p = os.path.join(d, a)
                        z.write(p, os.path.relpath(p, RAIZ)); total += 1
    indice = os.path.join(RAIZ, "backup", "INDICE.md")
    texto = open(indice, encoding="utf-8").read()
    linha = f"| v{versao} | {hoje_br} | versoes/{nome} | {descricao} |\n"
    # insere logo abaixo do cabeçalho da tabela de versões (mais nova em cima)
    m = re.search(r"\| Versão \| Data \| Arquivo \| O que mudou \|\n\|[-:| ]+\|\n", texto)
    if m:
        texto = texto[:m.end()] + linha + texto[m.end():]
    else:
        texto += "\n" + linha
    open(indice, "w", encoding="utf-8").write(texto)
    print(f"guardado {nome} ({total} arquivos) e registrado no INDICE.md")

if __name__ == "__main__":
    main()

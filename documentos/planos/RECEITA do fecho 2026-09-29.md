# Receita do fecho da casa — 29/09/2026

Escrita pelo chat C, `EXECUTANDO · as portas das regras`, o **fechador** (P51).
Vale para a janela 2 (06:30) e as seguintes.

## Antes da hora — dez minutos antes

| # | Quem | O quê |
|:---:|:---|:---|
| 1 | chat O → Planejador → fechador | a lista "consertado, espera a janela", por dono |
| 2 | cada dono | a seção dele no `CHANGELOG.md`, **sem número**, no topo |

## Na hora

| # | Passo | Comando | Se cair |
|:---:|:---|:---|:---|
| 0 | **Há memória?** Escreva o número | `(Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory / 1MB` (em GB) | **Com menos de 2 GB livres, não começa** (P61). Diga o número ao Planejador e espere. O navegador do Humberto é dele: ninguém fecha |
| 1 | **A casa está vazia?** Relógio, processos, portas, CPU | `Get-Date` · `Get-Process node, chrome` · portas 5170–5400 · CPU abaixo de 30% | Não mede. Diga ao Planejador quem está rodando (o comando mostra o script) |
| 2 | Suíte inteira | `npx vitest run --maxWorkers=2 --minWorkers=1` | Cada vermelho **pelo nome**, com o dono pela data do arquivo. O dono conserta; mede-se de novo **só o arquivo**, e depois a suíte |
| 3 | Tipos | `npx tsc --noEmit -p editor/tsconfig.json` | Igual: arquivo, linha, dono |
| 4 | Conformidade | `node ferramentas/conformidade.mjs` | 87 de 87. Menos: dono é `runtime/` ou `conformidade/` |
| 5 | Roteiro | `npm run roteiro` | A queda fica em `backup/provas-quedas/roteiro/` com frase, foto e tempo. Leia o `queda.txt` antes de culpar alguém. Rode de novo: se passar, é intermitente — relate assim, nunca esconda |
| 6 | Medição | `npm run medir` | A queda fica em `backup/provas-quedas/medir/`. "ROLA" não é queda: é número |
| 7 | Conferir o `CHANGELOG` | ler o topo | Toda linha da lista do chat O tem seção, com o nome do dono. Faltou: pede ao dono, não escreve por ele |
| 8 | Número da versão | o próximo livre no `backup/INDICE.md` (e em `backup/versoes/`) | O `versao.py` recusa número repetido |
| 9 | Pôr o número nas seções | trocar *"(janela HH:MM)"* por *"vNN.N"* no `CHANGELOG` | — |
| 10 | Guardar a versão | `python ferramentas/versao.py NN.N "o que mudou"` | — |
| 11 | Montar o programa | `python ferramentas/montar-programa.py` | Diga o erro inteiro ao Planejador |
| 12 | Avisar | ao Planejador: *"fechei a vNN.N, programa montado"*, com os cinco números e a hora | — |

## A memória — o computador travou às 05:57 de 29/09

A máquina tem **7,7 GB**. Com 16 chats, servidores e Chrome sem janela, acabou.

| Regra | Como |
|:---|:---|
| **Uma prova de cada vez**, nunca duas juntas | entre uma e outra, conferir que os `node` e o Chrome da anterior morreram (`Get-Process node, chrome`) |
| `vitest` com **2 trabalhadores no máximo** | `--maxWorkers=2 --minWorkers=1`. Demora mais e não trava |
| Rodar um arquivo de teste só | `npx vitest run editor/testes/X.test.ts --maxWorkers=1 --minWorkers=1` |
| O Windows disse **"Memória insuficiente"** | **PARE.** Diga ao Planejador o que estava rodando. Não repita em laço |
| No fecho, os outros chats **dormem**, não só param (P60) | — |

## As provas — o que vale saber

| Regra | Por quê |
|:---|:---|
| As quatro provas sobem pelo `ferramentas/provas/vite-quieto.mjs` (P57) | sem vigiar arquivos: a prova mede o código como estava ao subir |
| "Casa vazia" é **parada de gravar e de rodar** (P22) | a CPU a 100% fez o passo 14 levar 41 s |
| Todo número tem hora (regra 25) | medido às 06:35 e relatado às 06:50 já é velho se alguém gravou |
| O vermelho do manual (`exportar-e-ajuda.test.ts`, *"the manual page"*) é conhecido | o manual está pausado (regra 11). Continua sendo relatado, pelo nome |

## O que entra no `CHANGELOG`

Uma seção por lote, **escrita pelo dono**. O fechador só confere, e troca o
*"(janela HH:MM)"* pelo número. No pé da seção mais nova, o fechador põe a
medição: os cinco números, com a hora.

# Registro de implementações conformes — formato bone

Este é o **registro oficial**. Um runtime entra aqui depois de rodar a suíte de
conformidade e publicar o `conformance-report.json`.

O registro existe porque a auto-certificação da §12.4 só vale se for **pública
e refazível**. Qualquer pessoa tem que poder pegar a linha abaixo, baixar o
runtime, rodar `node ferramentas/conformidade.mjs --adaptador "<comando>"` e
chegar no mesmo número. Um registro vazio, ou fechado, transforma "nível C"
numa frase de propaganda.

Foi assim que o glTF ganhou credibilidade: não pela especificação, pela lista
pública de quem passava nos testes.

---

## Implementações registradas

| Runtime | Versão | Linguagem | Nível | Casos | Data | Relatório |
|:---|:---|:---|:---:|:---:|:---|:---|
| Recorte (runtime de referência) | 1.0, rascunho 0.2 | TypeScript | C | **104 de 104** | 2026-10-05 (v27.7) | `ferramentas/conformidade.mjs --json` |
| Recorte Python | 1.0, rascunho 0.2 | Python 3.12 | C | **104 de 104** | 2026-10-05 (v27.7) | `runtime-python/conformidade.py --json` |
| Recorte (runtime de referência) | 1.0, rascunho 0.2 | TypeScript | C | **71 de 71** | 2026-09-17 (v13.7) | `ferramentas/conformidade.mjs --json` |
| Recorte Python | 1.0, rascunho 0.2 | Python 3.12 | C | **71 de 71** | 2026-09-17 (v13.4) | `runtime-python/conformidade.py --json`, e o executor oficial com `--adaptador "python runtime-python/adaptador.py"` |
| Recorte (runtime de referência) | 1.0, rascunho 0.1 | TypeScript | C | 46 de 46 | 2026-09-08 | linha datada: a suíte cresceu |
| Recorte Python | 1.0, rascunho 0.1 | Python 3.12 | C | 46 de 46 | 2026-09-08 | linha datada: a suíte cresceu |

**Nível** é o da regra 5 da §12.4: `A` com 100% dos casos A e X; `B` com A, B e
X; `C` com A, B, C e X, mais todos os casos BIN e ZIP.

**Casos** é `passaram de total` no dia da medição. O número muda quando a suíte
cresce — uma linha antiga com um total menor não está errada, está datada.

**Nota de 17/09/2026.** O rascunho 0.2 (`formato/ESPECIFICACAO 2026-09-17.md`)
mudou o formato sem compatibilidade (M13): saiu o socket, entraram a virada de
corpo, `slot/bone`, `weights`, a pele de fora com osso e `rig.reference`. No
mesmo dia os dois runtimes passaram a ler o 0.2, os 18 casos novos entraram em
`casos/`, e `ferramentas/comparar-runtimes.mjs` deu **71 de 71 concordando
campo a campo**. O segundo runtime foi escrito só pelo texto da spec e anotou
16 lugares em que ela não bastava; viraram o Apêndice C.

**Nota de 05/10/2026 (v27.7).** Os 14 casos `C-263`, `C-310` a `C-321` e `X-307` saíram de `casos-pendentes/` para `casos/`: **104 de 104** nos dois runtimes, e `ferramentas/comparar-runtimes.mjs` dá **104 de 104 concordando campo a campo**. As linhas de 71 continuam acima, datadas.

**05/10/2026, noite (v28.8): 120 de 120** nos dois runtimes — `A 13/13 · B 7/7 · BIN 1/1 · C 63/63 · P 28/28 · X 7/7 · ZIP 1/1` (20:58). Na v28.4 entraram `P-021` a `P-026` (a forma `path` da extensão de partículas 1.1): 110. Na v28.8, os 10 casos da rodada 34 (`C-264`, `C-322` a `C-326`, `P-027` a `P-029`, `X-308`), escritos à mão pela spec por quem não escreveu runtime: três derrubaram o TypeScript (C-324, C-326, P-029) e dois o Python (C-326, P-027), e foram consertados. `node ferramentas/comparar-runtimes.mjs`: **120 de 120 concordando campo a campo**. Em `casos-pendentes/` ficou só o `P-002`. **O leitor do Godot dá 119 de 120** até copiar o conserto do C-326 do Python.

**05/11/2026: 132 de 132** nos dois runtimes — `A 14/14 · B 9/9 · BIN 1/1 · C 66/66 · P 32/32 · X 8/8 · ZIP 2/2` (01h UTC). O `P-002` (taxa em rampa) saiu de `casos-pendentes/`: a 2ª fase de `rate` abriu (`BONE_particles` 1.2, §4.2), o esperado foi preenchido por conta à parte, e os dois runtimes passaram. `node ferramentas/comparar-runtimes.mjs`: **132 de 132 concordando campo a campo**. O pacote do Construct: 132 de 132. Entraram também, escritos pela spec: `A-032` (dark color), `B-120` (tags), `B-121` (variáveis), `C-330` (parâmetro e driver), `C-331` (driver contínuo e `source`), `C-332` (driver em parâmetro, variável e constraint), `X-309` (BOM na leitura), `ZIP-502` (o `main` numa subpasta), `P-030` (rampa com torneira), `P-031` (dois emissores no mesmo slot) e `P-032` (`space` e `sortMode` desconhecidos) — quatro deles derrubaram alguém (B-120 o Python; P-030 e P-031 o TypeScript; X-309 o executor da suíte), consertados. **`casos-pendentes/` está vazia.** O leitor do Godot ainda recusa o `rate` animado: reprova P-002, P-030 e B-120 até copiar os consertos do Python.

---

## Como entrar

1. Rode a suíte contra o seu runtime:

   ```
   node ferramentas/conformidade.mjs --json --adaptador "<seu comando>" > conformance-report.json
   ```

2. Guarde o `conformance-report.json` num endereço público — o repositório do
   seu runtime serve.

3. Abra uma issue no repositório do formato com a linha da tabela preenchida e
   o link do relatório. Veja `CONTRIBUTING.md`.

O guia completo, passo a passo, está em `como-provar-conformidade.md`. O
adaptador de referência — o arquivo para ler quando o seu diverge — está em
`adaptador-referencia.mjs`.

---

## O que este registro NÃO é

Não é um selo de qualidade e não é endosso. Diz uma coisa só: no dia da
medição, aquele runtime passou naqueles casos. Um runtime que passa em tudo e
desenha devagar continua passando em tudo.

## Correções

Achou um registro que não reproduz? Abra uma issue com o caso, o campo e a
conta. Um registro que não reproduz é retirado da tabela e a linha vai para a
seção abaixo, com a data e o motivo — nada some em silêncio.

### Registros retirados

Nenhum até agora.

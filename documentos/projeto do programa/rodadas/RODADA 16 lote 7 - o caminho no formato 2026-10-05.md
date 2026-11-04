# Rodada 16, lote 7 — partículas "ao longo de um caminho": o formato e os runtimes

Ficha escrita pelo `DIRETOR · 000da3` em 05/10/2026.
**Mexe no formato, nos dois runtimes, na conformidade.** O plano já existe e a conta já foi refeita pelo Diretor: você executa, não replaneja.

---

## O plano que manda

`documentos/projeto do programa/16 AS PARTICULAS - o plano 2026-10-05.md`, **seção 5 inteira** (o valor novo, a conta, os casos P-021 a P-023, o leitor velho). Leia também: `CLAUDE.md` · a extensão de partículas da especificação (em `formato/`, `extensions/BONE_particles.md`: §3.2 o sorteio, §4.2 a taxa, §6.4 o comprimento do caminho, §7.3 e §7.4 o leitor velho, §9.4 as formas, §9.10) · `conformidade/como-provar-conformidade.md` e dois casos P prontos, para a forma · `runtime/src/` das partículas e do caminho.

| Decisão já dada | |
|:---|:---|
| O Humberto disse sim à forma nova, na rodada 16 | `03`, "partículas: a forma 'ao longo de um caminho'" |
| `shape: "path"` e o campo novo `curve` (`"<slot>/<anexo>"`, `x-since 1.1` da extensão) | o caminho pode ser de **outro slot** (sugestão do Diretor; vai ao Humberto) |
| Sempre por comprimento; lido em `t_i`; função pura do tempo | plano, seção 5 |

## A conta, refeita pelo Diretor

| Caso | Resultado |
|:---|:---|
| P-021 (reta com alças juntas) | `p0 = (300·u3 ; 0)`: os quatro números fecham, e os do leitor errado (`300·(3u² − 2u³)`) também |
| P-022 (caminho animado, lido em `t_i`) | `x = 300·u3`, `y = 100·t_i`: os seis fecham |
| P-023 (outro slot, emissor em (60, 0)) | o do P-021 menos (60, 0): os quatro fecham |
| **Não refiz** | os `u3` (o sorteio da §3.2). **Você confere os `u` contra os números de referência da §3.2 antes de digitar um esperado** |

**Um buraco que eu achei, e você fecha (regra 28):** os três casos são **retas**. Um leitor que medisse o comprimento exato da curva, ou com 100 segmentos, passaria nos três; e a regra do plano é **a poligonal de 10 segmentos**. Falta:

| Caso novo | O que olha | A conta |
|:---|:---|:---|
| **P-024, uma curva de verdade** | a poligonal de 10 segmentos, e a interpolação reta dentro do segmento | uma curva só, com alças fora da reta (por exemplo `A0 = (0,0)`, saída `(0,200)`; `A1 = (300,0)`, chegada `(300,200)`). **Calcule à mão, e escreva a conta no `leiame`:** os 10 pontos, os 10 comprimentos, o total, e o `p0` de duas partículas. Diga também o que daria o comprimento exato, e confira que a diferença passa da tolerância (`1e-3`); se não passar, escolha uma curva mais fechada |
| **P-025, caminho fechado** | "fechado inclui a curva que volta" | três âncoras, fechado; um `u3` que caia na curva que volta |

Se a sua conta de um caso discordar do plano ou de mim, **pare e me diga**: pode ser o plano, eu, ou você.

---

## O que tem de existir no fim

| # | |
|:---:|:---|
| 1 | Spec: §9.4 com a linha `path`, a §9.4.2 com a conta, a versão da extensão 1.1; o schema com `"path"` no `enum` e o campo `curve`; o validador com o L1 `REF_PARTICLE_CURVE` |
| 2 | Os cinco casos (P-021 a P-025) em `conformidade/casos/`, com `esperado.json` **digitado da conta** e `leiame.md` dizendo o que o verde prova e qual número o leitor errado daria |
| 3 | **Vistos vermelhos antes do código.** O executor de conformidade reprova o que não conhece: confira que um emissor de forma desconhecida não dá verde mudo (o leitor de hoje "não desenha e avisa", §7.4: o que a sonda devolve nesse caso?) |
| 4 | O runtime **TypeScript**. Os cinco verdes; os 104 sem mudar um número; arquivo sem `shape: "path"` sai igual |
| 5 | **O runtime Python é de outro chat**, só pela spec e pelos `leiame`: **não abra `runtime-python/`**. Deixe a spec bastar. Avise-me quando o texto e os casos estiverem prontos, para eu abrir o chat dele |
| 6 | **Um defeito achado hoje, que entra junto:** `runtime/src/render/canvas.ts:214` — o desenhador guarda a curva de emissão **pelo nome** e nunca a esquece; quem recarrega um arquivo no mesmo desenhador desenha com a curva velha (medido: 0 px de diferença ao mudar a taxa). O editor contornou trocando de desenhador. Regra 26: o teste que falha hoje, depois o conserto |
| 7 | Dois textos: "Esqueleto aninhado passou da profundidade máxima" em `runtime/src/file.ts:305` e `nested.ts:255` → "entidade". Só o texto |
| 8 | Os leitores: o pacote do Construct **remontado** (`npm run leitor:construct`, `leitor:construct:conformidade`: os 109 sobre o pacote; se o desenhador do Construct precisar de algo além de remontar, **não mexa**: diga-me). O Godot copia do Python, depois: fica 104 de 109 até lá, e isso é esperado. **Não toque `leitor-godot/`** |

---

## A cerca e o fecho

| | |
|:---|:---|
| Escreve em | `formato/`, `conformidade/casos/`, `ferramentas/src/` (validador, conformidade), `runtime/`. **Não** em `editor/` (o lote 8, o caminho no editor, é de outro chat), `runtime-python/`, `leitor-godot/` |
| Outro chat pode estar fechando versão do editor | eu digo na mensagem se a casa está vazia. Enquanto não estiver: só os seus arquivos de teste, a conformidade e o `tsc`; **nada meio escrito no disco** (regra 29) |
| O fecho, com o meu "pode fechar" | suíte inteira · `tsc` · conformidade (109) · o pacote do Construct · roteiro · medir · CHANGELOG · ESTADO · `python ferramentas/montar-programa.py <número>` · `versao.py` · a contagem por arquivo. Fecho em **Opus** |
| Réguas | backup antes de escrever em arquivo que existe, com linha no `backup/INDICE.md` (CRLF); relógio primeiro, nome depois; fim de linha conferido nos bytes (a spec é CRLF, o schema é LF: confira), **sem `grep $'\r'` no Bash**; regra 26 e 28 em cada caso (**escolha o estrago pelo que o caso mexe, não pelo nome**); mensagem minha só chega quando o seu turno para; não pergunte nada ao Humberto |

## O que entregar

Um aviso ao `DIRETOR · 000da3`: o que existe · os casos, vermelhos antes e verdes depois, com a hora · a conta do P-024 e do P-025 · onde a sua conta discordou · o que não foi provado · o seu erro, pela forma. Depois **pare**.

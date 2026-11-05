# Noite de 04 para 05/11/2026 — o formato e os runtimes

Ramo: `obra/runtime`. Parte: `formato/`, `runtime/`, `runtime-python/`,
`conformidade/`, `site/validador/`, `leitor-construct/`.

## O resumo

| Medida | Antes | Agora |
|:---|:---:|:---:|
| Casos em `conformidade/casos/` | 120 | **138** |
| Casos em `casos-pendentes/` | 1 (P-002) | **0** |
| TS × Python, campo a campo | 120 de 120 | **138 de 138** |
| Pacote do Construct | 120 de 120 | **138 de 138** |
| `npx vitest run` | 5.806 testes, 1 vermelho (manual) | **5.975**, 0 vermelho (depois dos merges da noite) |
| Testes do Python | 275 | **277** |
| `tsc` do editor | limpo | limpo |

Medido às 00h50 UTC de 05/11 (o relógio da máquina), com a casa só minha.

## 1. O P-002 (taxa em rampa) entrou em `casos/`

| O que fiz | Como provei | O que ficou |
|:---|:---|:---|
| Abri a 2ª fase **só de `rate`**: a taxa animada por integral (§4.2, ramo `linear`). Extensão vira **1.2** | — | O resto da 2ª fase (sub-emissor, rastro, ruído) continua fora |
| Escrevi o `esperado.json` por **conta à parte**: inverti `E = 20·t²` pela raiz direta, sem a fórmula da spec | 8, 21 e 33 vivas em `t = 0.6`, `1`, `1.31`. A partícula 7 em `0.591608` | — |
| Vi os dois runtimes **reprovarem** antes do conserto | os dois davam **0** partículas (regra 26) | — |
| Runtime TS: trechos em rampa e a inversa estável `2d / (r0 + sqrt(r0² + 2sd))` | P-002 verde; a 1ª fase não muda um bit (120 casos iguais) | — |
| Troquei a fórmula, numa cópia, pela proibida `(−r0 + sqrt)/s` | o P-002 reprova em `t = 1` e `1.31`, e mais **17** casos P caem | o caso pega a forma errada |
| Runtime Python: o mesmo, escrito pela spec | P-002 verde | — |
| Movi o caso. Varri antes **todos** os leitores (regra 25) | 7 testes que prendiam "P-002 pendente" reescritos, nenhum apagado; notas datadas no `REGISTRY`, no `README`, no `leiame` da pasta | `casos-pendentes/` está **vazia** |

## 2. Defeitos achados no caminho

| Defeito | Forma do erro (regra 27) | Quem tinha | Caso que prende |
|:---|:---|:---|:---|
| Timeline `BONE_particle` sem `property`, `skin` e `attachment` na identidade | **projetei a identidade da §9.1 só nos tipos que eu conhecia**; o tipo novo perdeu três campos | **TS**, desde a 1ª fase | **P-031**: dois emissores no mesmo slot. O TS antigo dava **9** vivas em vez de **5** |
| O mesmo defeito, visto pela 2ª fase | `rate` e `emitting` do mesmo emissor viravam "repetidas" | TS | **P-030**: rampa cortada pela torneira |
| Tags antes da primeira chave | **usei a borda geral (§9.10) onde a regra específica (§8.5) manda** | **Python** | **B-120** |
| Arquivo com BOM não abria **na suíte** | **o executor leu o arquivo antes do leitor**, com `JSON.parse` cru, para achar os atlas | o executor (`ferramentas/conformidade.mjs`), o adaptador de referência, o do Construct e o teste da suíte. O runtime já tirava o BOM | **X-309** |

## 3. Leitura de fora: spec × schema × runtime

| O que conferi | Como | Resultado |
|:---|:---|:---|
| Todos os exemplos e rigs | `npm run validar -- --todos` e os 3 rigs | 13 válidos. Os 5 casos "inválidos" da suíte são inválidos **de propósito** (B-101, P-029, X-301 a X-303) |
| Todo campo do schema aparece na spec | script: 188 campos | **todos** aparecem |
| Os `default` do schema batem com a coluna "padrão" da spec | script, tabela a tabela | **todos** batem |
| Todo valor de `enum` do schema aparece na spec | script | **todos** aparecem |
| Regra "DEVE" de leitor sem caso | script: seção da regra × seções citadas pelos `leiame` | os buracos abaixo |

**Buracos fechados com caso novo** (escrito pela spec, esperado digitado da
conta **antes** de rodar runtime):

| Caso | O que prende | TS | Python | Leitor errado reprova? |
|:---|:---|:---:|:---:|:---:|
| **A-032** dark color | liga sem setup; trecho que toca `null` é degrau; `null` ≠ `[0,0,0]` | verde | verde | sim (2 de 2) |
| **B-120** tags ativas | só `animation.tags` antes da 1ª chave; a ordem da união | verde | **vermelho → consertado** | — |
| **B-121** variáveis | `int` trunca em direção a zero; padrão; antes da 1ª chave | verde | verde | sim (3 de 3) |
| **C-330** parâmetro e driver | clamp; envolver (`360 → 0`); `add` soma o **desvio** do setup | verde | verde | sim (3 de 3) |
| **C-331** driver contínuo e `source` | Smart Bone com clamp; `timeTo` padrão = duração; alvo `slot/color` | verde | verde | sim (3 de 3) |
| **C-332** driver em parâmetro, variável e constraint | `int` escrito por driver trunca; o `mix` de uma constraint posterior | verde | verde | sim (4 de 4) |
| **C-333** driver em morph, deform e ordem | o peso do morph é limitado; `drawOrder` em degrau | verde | verde | sim (3 de 3) |
| **X-309** BOM na leitura | §2.1: o leitor DEVE aceitar BOM | **vermelho (o executor) → consertado** | verde | — |
| **X-310** fallbacks de driver e parâmetro | §2.5: alvo de tipo desconhecido cai **sozinho**; modo desconhecido vira `replace`; `source` desconhecido → `default`; propriedade de timeline desconhecida | verde | verde | sim (5 de 5) |
| **X-311** `sequence.mode` desconhecido | §2.5: vira `hold` | verde | verde | sim |
| **X-312** atlas com `rotation: 45` | §2.5: vira `0` (o esperado é o do B-102) | verde | verde | sim |
| **X-313** modos de `path` desconhecidos | §2.5: `positionMode` → `percent`, `rotateMode` → `tangent`. Na 1ª versão o `fixed` **passava** (com `position 0` os dois coincidem); refeito com `position 0.1` | verde | verde | sim (3 de 3) |
| **X-314** `spacingMode` desconhecido | §2.5: cai em `length` (`fixed`, `percent` e `proportional` reprovam) | verde | verde | sim (3 de 3) |
| **ZIP-502** `main` numa subpasta | §2.8: a base é a pasta do `main`; uma **isca** com o mesmo nome na raiz | verde | verde | sim (a isca no lugar dá `−15` em vez de `−40`) |
| **P-032** `space`/`sortMode` desconhecidos | §7.4 da extensão: caem em `local` e `youngestInFront` (o aviso **não** é medido) | verde | verde | sim (2 de 2) |
| **P-030** rampa com torneira | ver acima | verde (consertado) | verde | — |
| **P-031** dois emissores no slot | ver acima | verde (consertado) | verde | — |

**Linhas novas na spec** (cada uma era uma coisa que dois leitores adivinhariam diferente):

| Onde | A linha |
|:---|:---|
| `BONE_particles` §4.2 | os trechos da taxa animada; o índice na fronteira de rampa que começa em zero (`0/0` → nasce na fronteira); a 1ª fase não muda um bit |
| `BONE_particles` §9, §12, §14 | `rate` é **I** desde a 1.2; P: 32/32 |
| `BONE_particles` §14.1 | a chave do dump é o emissor **que o slot mostra** (P-031 tem um que não mostra) |
| Spec §8.2, tabela `DriverTarget` | `add` = soma o **desvio** em relação ao setup, como o pseudocódigo (a tabela dizia "soma o valor") |
| Spec §8.5 | a regra das tags ganha da borda da §9.10; a ordem da união |
| Spec §12.4 | a lista "o que a suíte ainda não cobre" atualizada |
| Spec §2.9 | as uris do **manifesto** são nomes de entrada, relativas à raiz do ZIP; só as de dentro do esqueleto usam a pasta do `main` |
| ZIP-501 `leiame` | dizia `application/bone-package`; o pacote e a spec dizem `application/vnd.bone+zip`. Corrigido o texto |

**O que ainda não tem caso** (está na §12.4): `blend` (o dump não tem canal
para ele), e o alvo de `driver` do tipo `nested`.

**Achado sobre a régua (regra 28):** o comparador só olha as chaves que o
esperado cita (a §12.4 manda assim). Então **"o leitor ignorou"** só se prova
por um efeito positivo: uma `boundingbox` de forma desconhecida, ou uma
variável de tipo desconhecido, que o leitor **não** ignorasse apareceria como
chave a mais, e passaria. Proposta, para decidir: `null` no esperado querendo
dizer "esta chave **não** pode existir". Não fiz, porque muda o contrato da
suíte para todo leitor.

**Pergunta para o Humberto (não decidi):** a §2.1 chama de **L0** um número que
não cabe em float64 (`1e400`) e chaves duplicadas no mesmo objeto. A §12.2 diz
que o leitor só recusa "nos casos em que 2.4 e 2.7 permitem". Então um **leitor**
recusa um arquivo L0, ou abre? Hoje o runtime TS recusa chave duplicada e o
JavaScript lê `1e400` como `Infinity`. Sem a resposta, não escrevi caso.

## 4. Desempenho do runtime TS

| Medida | Por quadro |
|:---|:---:|
| `heroi.bone` (ik, transform, path, física, driver), pose + lista de desenho | **~9 µs** |
| o mesmo, mais os vértices de mundo de todo anexo | **~10 µs** |
| `particulas.bone` (15 vivas) | ~17 µs |
| carga: 776 partículas vivas, `local` / `world` | ~0,8 ms / ~0,9 ms (~1 µs por partícula) |

A 60 fps um quadro tem 16.600 µs: o herói usa **0,06%**. Tentei um conserto
(o prefixo do hash uma vez por partícula): **não mudou a medida**, e desfiz.
Nenhum conserto barato vale o risco. O medidor está fora da casa (regra 29),
no rascunho da sessão.

## 5. Para outras partes (não mexi)

| Parte | O que precisa |
|:---|:---|
| `leitor-godot/` | Conferir o **X-309** (BOM): o `adaptador.mjs` dele entrega o caminho ao Godot, e não sei se o carregador `.gd` tira o BOM. **Vai reprovar P-002, P-030 e B-120** até copiar três consertos do Python: (1) `particulas.gd`, os trechos com rampa — o `Trechos` de `runtime-python/recorte/particles.py`; (2) `carregador.gd` linha ~1226, aceitar a timeline de `rate` em vez de avisar "2a fase"; (3) as tags antes da 1ª chave, como em `runtime-python/recorte/animation.py` (`kind == "tag"`). Conferir também se a identidade de timeline leva `attachment` (P-031), e rodar os **18 casos novos** (`A-032`, `B-120`, `B-121`, `C-330` a `C-333`, `P-030` a `P-032`, `X-309` a `X-314`, `ZIP-502`): eu não tenho Godot nesta máquina |
| editor | O editor ganha `rate` animado de graça pelo runtime. Se o painel recusa animar `rate`, isso agora é escolha, não limite |
| `programa/` | não remontei; o Diretor monta no fecho |

## 6. Decisões que tomei sozinho

| Decisão | Por quê |
|:---|:---|
| Abrir a 2ª fase de `rate` | A tarefa mandava fechar o P-002, e a conta já estava inteira na spec. **Não é campo novo**: a timeline `BONE_particle` com `property: "rate"` já estava escrita (§9, marca I). Se o Humberto não quiser, reverter é desfazer a mudança em `runtime/src/particles/emission.ts`, `runtime-python/recorte/particles.py` e nos dois loaders, e devolver o P-002 e o P-030 para `casos-pendentes/` |
| Versão da extensão 1.2 | O comportamento do leitor muda (aceita uma timeline que antes recusava) |
| `add` do driver = soma do desvio | O pseudocódigo da §8.2 é a parte mais exata, e os dois runtimes já faziam assim |

## 7. Tarefa nova do Diretor: os avisos em português

| O que fiz | Como provei | O que ficou |
|:---|:---|:---|
| `translateWarning` (editor/src/panels/warning-model.ts) cobre as **204** frases de aviso do leitor: 179 do `loader.ts`, 7 de curva, os problemas de endereço do `uri.ts` | teste novo `editor/testes/avisos-em-portugues.test.ts`, com a lista tirada **viva** do código | — |
| A frase se parte em **causa** e **consequência**: *"não existe osso com o nome "braco": essas chaves ficam sem efeito (TARGET_MISSING)"* | o teste confere: nenhuma volta em inglês, nenhuma palavra inglesa solta, nenhum jargão fora de parênteses (`ui/jargao.ts`) | — |
| As 8 frases antigas ficam **letra por letra** | os testes de `acabamento` e `menus` passam | uma delas diz "atlas" fora de parênteses; está presa por `acabamento.test.ts`, e ficou anotada no teste como dívida |
| Regra 26 | com a `translateWarning` antiga, **198 de 204** voltavam em inglês | — |

Os avisos de `actor.ts`, `nested.ts`, `file.ts` e do binário já nasciam em português.

## 8. Tarefa nova do Diretor: a página na web

| O que fiz | Como provei | O que ficou |
|:---|:---|:---|
| `ferramentas/pagina-md.mjs`: os `.md` da página viram `.html` que se lê (a spec, o manual, a conformidade, o ESTADO). Link para arquivo que a página não publica vai para o GitHub | Playwright com o `_site` servido em `/recorte/`, igual ao Pages: **0 links quebrados**, 0 erros no console | o HTML dos documentos não passou pela régua do jargão (é o texto da spec e do manual, como está) |
| `formato/especificacao.html`: endereço que não muda, sempre a spec mais nova | o teste prende | — |
| `pagina.yml`: gera o runtime do visualizador, `LICENSE` vira `.txt` (sem extensão o Pages manda baixar), roda o conversor | o teste prende | — |
| `site/index.html` em palavras simples; **"Abrir o editor"** grande, em primeiro; uma tabela "Por onde começar". Link velho (`ESPECIFICACAO 2026-09-06.md`) consertado, no site e no conferidor | — | — |
| Visualizador: a **espada** do herói não aparecia (aviso em inglês). Agora lê as entidades vizinhas e desenha | foto: a espada inteira, sem aviso | — |
| Conferidor e visualizador sem jargão nos textos de tela, com caminho de volta | — | as mensagens do núcleo do conferidor (presas por `site.test.ts`) não mexi |
| Teste novo `ferramentas/testes/pagina.test.ts` (12) | com as páginas antigas: **7 vermelhos** | — |
| Funcionando, com o `heroi.bone` | conferidor: "Arquivo válido", desenho na tela; visualizador anima (0,53 s → 1,15 s); editor abre sem erro | — |

**A frase com "atlas" na barra de avisos:** não troquei. Ela está presa em 5
testes do editor **e** o `problems-dialog.ts` lê essa frase por regex para achar
a imagem que falta. Trocar a frase quebra o botão do diálogo. Conserto certo:
trocar as três coisas juntas (frase, regex, testes) — é código do editor.

FIM

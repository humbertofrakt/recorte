# 08 · O que falta do Spine

A Pesquisa 1 conferiu **470 funções** do Spine contra o Recorte: igual 56 · diferente 211 · falta 163 · não se aplica 36 · não confirmei 4.
Linha a linha: `documentos/planos/O QUE AINDA NAO TEMOS 2026-09-16.md`, Parte 1.

**Nada aqui é pedido dele.** É o cardápio. Entra no programa novo só o que ele escolher, pelo método do arquivo `01` (Spriter primeiro).
"Diferente" é bom sinal: quase sempre porque seguimos o Spriter.

## Por bloco — só o que cabe no programa novo

| # | Bloco | O que falta | Custo | Casa com | Fonte |
|:---:|:---|:---|:---|:---|:---|
| D1 | **Caminho** (path) | criar, editar, fechar, velocidade constante, inverter | só porta (spec §7.8, §6.4) | rastro de efeito (`07`) | P1 §10.5 |
| D2 | Caixa e máscara | editar os cantos | só porta (§7.6, §7.7) | defeito A3 (`09`) | P1 §10.3–10.4 |
| D3 | **Sliders** | a regra que toca uma animação por um valor | só porta (§6.6, §8.2) | defeito A4 (`09`) | P1 §13 |
| D4 | **Sequência de imagens** | criar a folha animada; chave na região e na malha | só porta (§7.10, §9.6) | efeito #1 (`07`) · 🗣️ **sim, como opção** (`05` G12) | P1 §10 |
| D5 | Eventos de **áudio** | caminho, volume, painel, evento visível na cena | só porta (§8.6) | som do Spriter | P1 §14, §15 Audio |
| D6 | Física | Simular, Reiniciar, Global; **assar em chaves** — 🗣️ *provavelmente sim* (RESPOSTAS Q28) | só porta (§6.5) | — | P1 §12 |
| D7 | Peles | pastas, placeholders em lote, avisos (🗣️ **cor e "não exportar" não**, Q19) | só porta | `04` | P1 §11 |
| D8 | Curvas | presets, Favor, Store, alças que acompanham, zoom, copiar curva | só editor | `05` | P1 §15 Graph |
| D9 | Pesos | Soldar, Trocar, copiar/colar pesos, ferramenta Direta, pintar várias malhas | só editor | — | P1 §15 Weights |
| D10 | Folha de chaves | Offset, Adjust, Sync, filtros, tocar sem interpolar | só editor | `05` | P1 §15 Dopesheet |
| D11 | Métricas | contagem de ossos, slots, vértices, área | só editor | `06` | P1 §15 Metrics |
| D12 | Fantasma e Árvore | 5 + 5 faltas pequenas | só editor | — | P1 §15 Ghosting, Tree |
| D13 | Exportar | APNG, PSD, JPEG, vídeo; HTML que toca | só editor | — | P1 §18 |
| D14 | Atlas e importar | ninepatch, desempacotar; 6 faltas de importar | só editor | — | P1 §19, §20 |
| D15 | Configurações, tela inicial, linha de comando | 7 faltas pequenas | só editor | — | P1 §16, §21, §22 |

## O que o Spine 4.3 trouxe e vale olhar

| O quê | Fonte |
|:---|:---|
| Janela de Problemas com "consertar" · assar regra em chaves · conta no campo (`120/2`) · pintar pesos em várias malhas | P1 A.2 |
| Ordem de desenho animada dentro de pasta · malha ligada em outro slot · escala volumétrica no IK | P1 A.2 — campos novos em `10` |

## Já temos e o Spine não (não refazer)

Trocar de pai no meio da animação (*"provavelmente nunca"*, disse a equipe deles) · marcadores na linha do tempo · solo · régua e guias.
Fonte: `O QUE OS USUARIOS PEDEM 2026-09-16.md`, OURO.

## Da mesma pesquisa: grade em perspectiva (ideia dele)

*"se o jogo for top-down seria interessante ter uma grade em perspectiva"*. Presets Quadrada · Isométrica 2:1 · 30° · Dimétrica · Oblíqua · Livre; campo em L × A do losango; losango do pé que fica vermelho fora da interseção; projeção paralela primeiro.
🗣️ **A grade não vai no arquivo** (a não ser avisando) — fica na máquina (RESPOSTAS Q25). **Shift trava nos eixos da grade** (as diagonais), como a trava de ângulo do Photoshop — fechado pelo Planejador (Q25b, delegado); Spriter não confirmado.
Fonte: P1 Parte 4 · RESPOSTAS Q25.

# 11 · O que fica do programa atual

🗣️ **O programa novo é reforma da v13.2**: *"já temos muita coisa feita, só algumas mudanças necessárias"* (17/09). **Este arquivo é a base da obra.** Ler antes dos assuntos.

O que já funciona na **v13.2** e passa para o programa novo. **Não é para refazer.** A reforma mexe só no que está em "Muda com o modelo novo", no fim, e acrescenta o que está em `02` a `10`.
Fontes: planos de 13–14/09 (`PEDIDOS …`, `PLANO …`) · manual, capítulos 0–9 · `backup/INDICE.md` (versões).

**Atenção:** "existe" aqui é o que os documentos dizem. Antes de construir em cima, **testar ao vivo** — o lápis das peles estava escrito como "funciona" e não funcionava (`09` A9).

| Tema | O que fica | Fonte |
|:---|:---|:---|
| **Ferramentas** | Transformar primeiro e único (mover, girar, escalar, inclinar com Alt, escolher) · bolinha de girar a 3/4, mín. 30 px · caixa gira com o objeto · três alças no osso · mover vários só pelo topo · osso novo na raiz sem escolhido · cadeia de ossos · filho vira pai · `P` mostra e desafilha filhos · clonar com Ctrl · Só este, Os filhos, Os pais | `PEDIDOS ferramentas e seleção` · `PLANO caixa ossos e malha` · `PLANO o gesto do P` · MAN 1 |
| **Árvore** | seções, miniaturas, olho, cadeado, busca, duplicar o membro · pai por `P`, menu, arrasto · a Árvore mostra o pai do tempo de agora · pose de mundo ao trocar de pai | MAN 1 · `PLANO fluxo` 1.4 |
| **Criar no meio da animação** | osso, ponto, caixa, imagem nova (o slot nasce vazio em 0), malha e pesos · trocar de pai grava chave | `QUADRO ABERTO`, "Já feito" · `05` G4–G5 |
| **Malha** | contorno afastado 0–30 px · modo de criar vértice · nomes únicos · painel em ícone · aba liga a ferramenta · malha ligada · pesos automáticos, suavizar, podar, pincel com 4 modos, travar osso | `PEDIDOS malha` · `PLANO caixa` · MAN 6 |
| **Imagens e pivô** | painel Imagens (arrastar, busca, contagem de uso) · pivô por imagem em nove pontos · pivô guardado por nome · trocar pela pasta no botão direito · importar PSD, PSD com ossos, PNGs · reempacotar atlas | MAN 1 · `03` |
| **Ordem** | seis botões, arrastar, pastas, Juntar · ordem de desenho vira chave | MAN 1 · `PEDIDOS reutilizar` |
| **Peles** | nova, duplicar, apagar, empilhar, trocar imagem em todas, "Só com a pele" à mão, exportar por pele | MAN 3 · `04` |
| **Linha do tempo** | ver `05`, "O que a linha do tempo já tem" | `05` |
| **Animações** | nova, duplicar, topo como padrão, troca tocando, mistura · Prévia em camadas, tela cheia | MAN 4 |
| **Regras** | as cinco (IK, transformação, caminho, física, comando) · aba Regras, Nova regra, nome errado em vermelho · Força animável · Posar (B) | MAN 7 |
| **Painéis e casca** | ver `06`, "O que já existe e fica" | `06` |
| **Cena** | guias com ímã · réguas · imagem de referência · casca de cebola · exibição | MAN 1 · MAN 4 |
| **Arquivo** | `.bone`, `.boneb`, `.bonez` · Histórico clicável · reabrir o fechado · rascunho a cada 3 s (com os defeitos A1–A2) | MAN 0 · MAN 8 |
| **Exportar e importar** | glTF, imagem, GIF, WebM, por pele · repetir a última (Ctrl+Shift+E) · arte em pixel · importar Spriter, Spine, DragonBones com lista de avisos | MAN 8 · MAN 9 |
| **Ferramentas de linha de comando** | converter, fatiar, empacotar, validar, render-png, exportar-imagem · validador na web · `versao.py`, `montar-programa.py` | MAN 8 · `CLAUDE.md` |
| **Formato e runtime** | spec, JSON Schema, runtime TS, runtime Python só pela spec, **53 casos de conformidade** · `rig`, `assets`, pacote, sequência, esqueleto aninhado, sliders, física, eventos com áudio especificados | MAN 5 · MAN 8 · `ESTADO.md` |
| **Provas** | suíte (2.839 testes na v13.2) · `tsc` · conformidade · roteiro dos 30 minutos (14 passos) · medição dos painéis | `RETOMADA do planejador 2026-09-15.md` · `CLAUDE.md` regra 9 |

## Muda com o modelo novo — fica, mas vai ser mexido

| O quê | Por quê | Fonte |
|:---|:---|:---|
| Pose de repouso única | vira uma pose por base | `02` M2 |
| Modo Montagem/Animando, `Ctrl+Tab` | sai; tudo sempre disponível | `02` M4 · RESPOSTAS Q5 |
| Malha e pesos gravam no repouso | passam a gravar na base da animação | `02` M7 |
| "Gravar sozinho" que recusa | editar sempre grava; Key all / Key selected extras | `02` M6 · RESPOSTAS Q1 |
| Seleção de chaves com Shift | Ctrl + clique seleciona; Ctrl + arrastar continua duplicando | `05` G2 · RESPOSTAS Q3 |
| Posar na tecla B · Criar osso na N | B cria osso · Posar vai para Y · N livre | `05` G1 · lote 2 Q36 |
| A pilha de peles: a última adicionada manda | a de cima de Ativas manda | `04` I7c · lote 2 Q32 |
| Teclas fixas | sistema de trocar as teclas | `05` G7 · RESPOSTAS Q3 |
| Socket (`point` + `socket`) nos exemplos | sai; entidade segue a imagem | `10` F7 · RESPOSTAS Q7 |
| A `default` sempre por baixo | deixa de ser fixa no fundo | `04` I10 · RESPOSTAS Q33 |
| Olho das peles | vira colunas Feitas/Ativas | `04` I7 |
| Um arquivo = um personagem | o projeto é a caixa | `02` P1 |
| O que o manual chama "personagem" (6 lugares marcados) | vira projeto e corpo | chat MANUAL 15/09 |

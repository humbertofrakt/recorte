# 10 · Formato — campos novos

**Tudo aqui é decisão do Humberto** (regra 7). Ninguém escreve campo novo no núcleo sem a palavra dele.
M13 (`02`): o programa novo **não tem compatibilidade** com projetos antigos — o formato está livre para mudar agora.

## Já decidido por ele — precisa entrar na spec

| # | O quê | Fonte |
|:---:|:---|:---|
| F1 | **Várias bases** por corpo: a base é animação de quadro 0; uma pose por base | `AS REGRAS DA BASE` §8 · `02` M1–M2 |
| F2 | **Corpos e as suas animações** no projeto; sem corpo principal | BASE §11, §15 · `02` M8, P1 |
| F3 | **A virada**: colar uma base no meio da animação, corte seco; osso da base nova **nasce** ali | BASE §9, §16 · `02` M10–M11 |
| F4 | **Entidade**: segue a imagem; faixa com `origin` e `timeScale`; laço começa onde foi solta; lugar na ordem de desenho | BASE §12–14 · `02` E5, E11, E13–E14 |
| F5 | **Pino e tomadas**: um tipo de peça; pendurar cria tomada | BASE §18, §20 · `02` E8–E9 |
| F6 | Convenção de nomes de osso **nossa e publicada** | BASE §16 |
| F7 | 🗣️ **O socket sai.** A entidade segue a imagem; `point` + `socket` (§7.11) deixa de ser o encaixe; `mecha.bone` e `capacete.bone` são refeitos pela imagem | RESPOSTAS Q7 · BASE §13 (15/09) |
| F8 | 🗣️ **Desenho troca de osso por chave**, como no Spriter — campo novo aprovado | RESPOSTAS Q10 |
| F9 | 🗣️ **Pesos animáveis** — campo novo aprovado e **confirmado** | RESPOSTAS Q11 · lote 2 Q11b |
| F16 | 🗣️ **Recorte na exportação, as duas opções — a pessoa escolhe**: corte automático da borda (o de hoje, **padrão**) **ou** a área desenhada por animação, como o Spriter (cap. 26: salva no arquivo, magenta na cena). **Campo novo no núcleo: aprovado** | RESPOSTAS Q21 (palavra dele via Diretor, 17/09) · `O QUE O SPRITER TEM` faltas #6 |
| F15 | 🗣️ **A pele é do corpo** (`skins` mora no corpo). Pele de fora = pele em arquivo com `rig`; Mixamo não é pele | RESPOSTAS lote 3, Q30 |
| F23 | 🗣️ **A pele de fora traz osso próprio** — campo novo aprovado | RESPOSTAS lote 3, Q40 |
| F24 | 🗣️ **A animação de fora se ajusta ao tamanho do boneco**, *"o Spine tem essa opção"* — seguir o Spine. Campo novo aprovado | RESPOSTAS lote 3, Q41 |
| F25 | 🗣️ **Pele vira base** (promover) e **a pilha passa ou não na virada** (opção por projeto) | RESPOSTAS lote 3, Q38, Q39 |
| F10 | 🗣️ **Emissor de partículas**: vai ter. **Depois de bases e peles**; a 1ª fase está fechada em `07` | lote 2, Q15 |
| F22 | 🗣️ **Na pilha de peles, a de CIMA vence.** Muda a spec §4.4 (*"a última adicionada tem prioridade"* → *"a de cima da pilha"*). Não confundir com ordem de desenho | RESPOSTAS lote 2, Q32 |
| F18 | 🗣️ A entidade escolhe a animação que toca (botão direito na linha do tempo): o arquivo guarda **qual animação** — conferir se `baseAnimation` basta | RESPOSTAS Q8 |
| F19 | 🗣️ **A `default` deixa de ser "sempre ativa, por baixo"** (spec §2): há peles que substituem muito | RESPOSTAS Q33 |
| F20 | 🗣️ **Animação para outro personagem** (`rig` §4.8, `assets.animations` §2.8) definida **agora**, encaixando no sistema de peles | RESPOSTAS Q14 |
| F21 | 🗣️ **Grade em perspectiva não vai no arquivo** (a não ser avisando) | RESPOSTAS Q25 |

**Proposta do Diretor sobre a ordem:** spec escrita primeiro → casos de conformidade → runtime → editor (BASE §7). Sem aval dele.

## Esperando a palavra dele

| # | Campo | Por quê | Pergunta |
|:---:|:---|:---|:---|
| F26 | **Animação daqui por cima da de fora** (andar do Mixamo + aceno próprio no braço) | camada sobre animação importada | Q42 — ele achou interessante; explicação dada, falta o sim/não |

**Saiu:** F14 (cor na pele, pele que não vai ao jogo — 🗣️ não, Q19). F16 saiu e **voltou** aprovado (Q21).


## Fechado pelo Planejador (17/09, delegado: "o mais simples")

| # | Decisão | Fonte |
|:---:|:---|:---|
| F11 | **Nenhum campo de efeito novo na 1.0**: UV, dissolve, distorção, grupo como imagem só, mais misturas, ordem animada em pasta — todos no glacê | `12` Q26 |
| F17 | **IK de dois ossos na 1.0**; mais de dois depois · `BONE_pendulum` continua extensão | `12` Q24 |
| F10b | Partículas como **extensão** `BONE_particles`, taxa liga/desliga, uma semente por emissor | `12` Q16 · `07` |

## Não é campo novo — cabe no que existe

| O quê | Onde já está |
|:---|:---|
| Sequência de imagens | §7.10, §9.6 |
| Esqueleto aninhado | §7.11 |
| Caminho, sliders, eventos com áudio, física com bake | §6.4, §6.6, §8.2, §8.6, §6.5 |
| Biblioteca de animações | `assets.animations` §2.8 + `rig` §4.8 |
| Tremor com semente | só editor: gera chaves comuns |
| Grade em perspectiva | na máquina, não no arquivo (F21) |
| Física vira chaves | bake já previsto em §6.5; falta a porta (🗣️ provavelmente sim, Q28) |

Fonte das duas tabelas de baixo: `COMO SE FAZ EFEITO 2026-09-16.md` §5 · `O QUE AINDA NAO TEMOS 2026-09-16.md` Parte 3.

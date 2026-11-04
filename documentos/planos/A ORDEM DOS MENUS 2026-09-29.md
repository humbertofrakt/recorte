# A ordem dos menus — a lista final, para conferir — 29/09/2026

Escrito pelo chat **A2** (`EXECUTANDO · a casca`), às 04h40 (relógio da máquina; corrigido às 05h07 — estava "05h", escrito sem olhar o relógio).
Decisão **P33** do `PLANEJADOR · 9f75b5`. **Nada foi mudado ainda.** A mudança é
um lote só, numa janela em que ninguém mais toca `ui/menus.ts`.

**De onde vem:** a árvore de hoje, tirada do código (`allMenus`, com uma
animação aberta), e a parte D de `documentos/pesquisa/nova pesquisa/ONDE FICA CADA BOTAO 2026-09-29.md`.

## As regras deste lote

| # | Regra |
|:---:|:---|
| 1 | **Nenhum id muda de nome. Nenhuma tecla muda.** |
| 2 | Item que muda de lugar **sai** do lugar velho. O nome velho vai para a **dica**, e a Paleta de comandos acha pelos dois |
| 3 | Nenhum bloco com mais de **seis** itens entre separadores (os testes `tema-e-ficha`, `peles`, `regras` conferem) |
| 4 | Submenu novo ganha **id novo** de pai (como `importar`, `exportar`, `escolher` já são), com linha em `ui/actions-table.ts` |
| 5 | Submenu **nunca vazio**: sem os ids dos chats D e I, ele leva ao painel que faz a coisa |

**Legenda da coluna "Veio de":** `=` fica onde está · `b2`, `c3`… é o item aprovado do chat O · `B1` é a bandeira 1 do P33.

---

## A barra — c1, B5

| Hoje | Depois |
|:---|:---|
| Arquivo · Editar · **Exibir** · Esqueleto · Animação · Janela · Ajuda | Arquivo · Editar · Esqueleto · Animação · **Exibir** · Janela · Ajuda |

Por quê: *arte → montar → animar*, e só então *olhar* (Spriter, B.1.4 do chat O).

---

## 1. Arquivo — c2, b8, B1, N-1, N-2, N-3

| Bloco | Item | Tecla | Id | Veio de |
|:---:|:---|:---:|:---|:---|
| 1 | Novo projeto | Ctrl+N | `novo` | = |
| 1 | Abrir projeto… | Ctrl+O | `abrir` | = |
| 1 | Abrir pasta do projeto… | | `abrir-pasta` | = |
| 1 | Abrir recente… | | `abrir-recente` | b8: junto do Reabrir |
| 1 | Reabrir o fechado | | `reabrir` | b8 |
| 1 | Abrir o herói (exemplo) | | `abrir-exemplo` | = |
| 2 | **Importar ▸** | | `importar` | c2: logo depois de abrir; a arte **entra** antes de salvar |
| | ↳ De outro programa… · PSD… · PSD com ossos… | | (iguais) | = |
| 2 | **Trazer para o projeto ▸** | | `trazer-para-projeto` **(novo pai)** | b8 |
| | ↳ Abrir outro corpo… | | `abrir-corpo` | b8 |
| | ↳ Abrir uma entidade… | | `abrir-entidade` | b8 |
| 3 | Salvar | Ctrl+S | `salvar` | = |
| 3 | Salvar como… | Ctrl+Shift+S | `salvar-como` | = |
| 3 | Salvar a entidade editada… | | `salvar-entidade` | = |
| 4 | **Exportar ▸** | | `exportar` | B1: **um lugar só** |
| | ↳ *(para o jogo)* **Imagens: GIF, PNG, folha, vídeo…** | | `exportar-imagem` | N-2: o nome diz o que sai. Dica: *"era Imagem…"* |
| | ↳ Uma imagem por pele… | | `exportar-pele` | dica: *"era Por pele…"* |
| | ↳ glTF, para programa 3D… | | `exportar-gltf` | dica: *"era glTF…"* |
| | ↳ Salvar como binário… | | `salvar-binario` | B1: saiu do bloco Salvar |
| | ↳ Salvar como pacote… | | `salvar-pacote` | B1 |
| | ↳ Entregar um corpo… | | `entregar-corpo` | B1 |
| | ↳ ‖ *(para outro boneco)* **Animações, para outro corpo…** | | `exportar-animacao` | B1, N-3: saiu de Animação. Dica: *"era Animação → Exportar animação…"* |
| | ↳ **Pele, para outro boneco…** | | `exportar-pele-arquivo` | B1: saiu de Esqueleto. Dica: *"era Esqueleto → Exportar pele…"* |
| 4 | Repetir a última exportação | Ctrl+Shift+E | `repetir-exportacao` | = |
| 5 | Configurações do projeto… | | `configuracoes` | = (o b9 fica para depois) |
| 6 | Sair | | `sair` | = |

**Título de bloco** ("Para o jogo", "Para outro boneco"): o menu de hoje **não tem** esse tipo de linha. Proponho só o separador, e o nome de cada item dizer o destino. Se quiser o título, é um tipo novo em `menus.ts` e no desenho da casca — digo o custo antes.

---

## 2. Editar — b12

| Bloco | Item | Tecla | Id | Veio de |
|:---:|:---|:---:|:---|:---|
| 1 | Desfazer · Refazer | Ctrl+Z · Ctrl+Y | (iguais) | = |
| 2 | Copiar | Ctrl+C | `copiar` | = |
| 2 | Colar | Ctrl+V | `colar` | = |
| 2 | Recortar chaves | Ctrl+X | `recortar-chaves` | = |
| 3 | Copiar a pose inteira | Ctrl+Shift+C | `copiar-pose` | = |
| 3 | Copiar a pose do escolhido | | `copiar-pose-escolhido` | b12: saiu de Animação |
| 3 | Colar em todas as chaves | Ctrl+Shift+V | `colar-todas-chaves` | = |
| 3 | Colar espelhado | | `colar-espelhado` | b12: saiu de Animação |
| 4 | Duplicar · Apagar | Ctrl+D · Delete | (iguais) | = |
| 5 | Selecionar tudo · Desmarcar · Renomear · Inverter a seleção · Substituir nomes… · Buscar na Árvore… | (iguais) | (iguais) | = |
| 6 | Escolher ▸ (os filhos, os pais) | | `escolher` | = |
| 7 | Copiar posição no osso · Colar posição no osso | | (iguais) | = |
| 8 | Preferências… | | `preferencias` | = |

`Copiar a ordem na animação` **sai** daqui (b11, vai para Esqueleto).

---

## 3. Esqueleto — c3, b2, b3, b10, b11, b14, a1, a5, B1

| Bloco | Item | Tecla | Id | Veio de |
|:---:|:---|:---:|:---|:---|
| 1 | **Novo ▸** | | `novo-item` | b14: em blocos por tarefa |
| | ↳ *(o que se vê)* Osso | | `novo-osso` | = |
| | ↳ **Pôr imagem na cena…** | | `novo-imagem` | b2. Dica: *"era Imagem no slot…"* |
| | ↳ Ponto · Caixa de colisão | O · X | `novo-ponto`, `novo-caixa` | = |
| | ↳ Ponto neste slot · Caixa neste slot | | (iguais) | = |
| | ↳ ‖ Máscara · Emissor de partículas | | (iguais) | = |
| | ↳ ‖ *(o que manda)* Regra… · Evento · Parâmetro | | (iguais) | = |
| | ↳ ‖ *(a roupa)* Pele | | `nova-pele` | = |
| 2 | Virar filho de… | P | `virar-filho` | = (o J2 muda o que ele FAZ, não o lugar) |
| 2 | Opções do desenho… | | `opcoes-do-desenho` | = |
| 3 | Trazer para a frente · Mandar para trás | + · − | (iguais) | = |
| 3 | Frente de tudo · Fundo de tudo | Ctrl+Shift+↑ · ↓ | (iguais) | = |
| 3 | **Copiar a ordem na animação** | | `copiar-ordem-animacao` | b11: saiu de Editar |
| 4 | Nova pasta… · Tirar da pasta · Limpar desenhos vazios | | (iguais) | = |
| 5 | **Malha ▸** | | `malha` **(novo pai)** | a1. Até o chat D registrar os ids, leva **uma** linha: *Abrir a aba Malha e pesos* (`painel-malha`) |
| 5 | Física ▸ | | `fisica` | c3: depois da montagem |
| 5 | **Peles ▸** | | `peles` **(novo pai)** | a5 |
| | ↳ Trocar imagem nas peles… | | `trocar-imagem-todas-peles` | saiu do bloco solto |
| | ↳ Importar pele… | | `importar-pele` | idem |
| | ↳ Promover pele a base… | | `promover-pele-base` | idem |
| | ↳ *(os ids do chat I entram aqui)* | | | a5 |
| 6 | Voltar à pose de repouso · Voltar tudo ao repouso | Ctrl+1 · Ctrl+Shift+1 | (iguais) | = |
| 7 | Compensar ▸ · Eixos das alças ▸ | | (iguais) | = |

**Saem de Esqueleto:** Variável e Etiqueta (b3, vão para Animação) · Variáveis e etiquetas ▸ (b3) · Exportar pele… (B1, vai para Arquivo → Exportar) · os cinco Travar (b10, vão para Exibir).

---

## 4. Animação — c12, b3, b4, b5, b12, B1

| Bloco | Item | Tecla | Id | Veio de |
|:---:|:---|:---:|:---|:---|
| 1 | Abrir a base | | `abrir-a-base` | = |
| 2 | **Nova animação** | | `nova-animacao` | **fica à vista** — ver o desvio abaixo |
| 2 | **Animações ▸** | | `animacoes` **(novo pai)** | c12 |
| | ↳ Duplicar · Renomear · Apagar animação · Mandar para o topo | | (iguais) | c12 |
| | ↳ ‖ Importar animação… · Biblioteca de animações… | | (iguais) | c12 |
| 3 | Mudar duração… · Repetir | · L | (iguais) | = |
| 4 | Tocar / Pausar · Tocar para trás · Início · Fim · Quadro anterior · Quadro seguinte | (iguais) | (iguais) | = |
| 5 | Chave anterior · Chave seguinte · … do escolhido (2) | (iguais) | (iguais) | = |
| 6 | Chavear · Chavear tudo · Colar corpo aqui | K · Ctrl+K | (iguais) | = |
| 7 | Apagar chave · Apagar as linhas · Limpar a animação inteira… | (iguais) | (iguais) | = |
| 8 | Curva da chave ▸ | | `interpolacao` | = |
| 8 | Marcas ▸ | | `marcas` | = |
| 8 | **Novo evento** | | `novo-evento` | b4: **repete** o de Esqueleto → Novo (ver pergunta 2) |
| 8 | Trecho de laço ▸ | | `trecho` | = |
| 8 | **Variáveis e etiquetas ▸** | | `variaveis-e-etiquetas` | b3: saiu de Esqueleto |
| | ↳ Nova variável · Nova etiqueta | | `nova-variavel`, `nova-etiqueta` | b3: saíram de Esqueleto → Novo |
| | ↳ Apagar a variável · Mostrar na aba Regras | | (iguais) | = |
| 9 | **Efeitos de chave ▸** | | `efeitos` | b5. Dica: *"Flash, pulso e tremor viram chaves. Partícula é outra coisa: a linha abaixo"* |
| | ↳ Flash… · Pulso… · Tremor… | | (iguais) | = |
| | ↳ ‖ **Partículas: fogo, fumaça, faísca, poeira** | | os ids do chat B (P5) | b5 |
| 10 | Selecionar todas as chaves · Esticar seleção… · Espelhar no tempo · Fechar ciclo · Espelhar esquerda e direita… | | (iguais) | = |
| 11 | Empurrar as chaves… · Limpar chaves repetidas | | (iguais) | = |

**Saem de Animação:** Exportar animação… (B1) · Copiar a pose do escolhido e Colar espelhado (b12, vão para Editar).

**Desvio que peço conferir:** o c12 põe *Nova animação* dentro de **Animações ▸**. Eu a deixo **fora**, à vista, no bloco 2. É o passo 6 da dica do passo seguinte (P19: *"Próximo: crie uma animação — Animação → Nova animação"*), e o primeiro gesto de quem vai animar. Na régua do arroz: a panela não vai para dentro do armário.

---

## 5. Exibir — b10

Igual a hoje, **mais um bloco**, logo depois de *Esconder o escolhido…*:

| Bloco | Item | Tecla | Id | Veio de |
|:---:|:---|:---:|:---|:---|
| novo | **Travar ▸** | | `travar` **(novo pai)** | b10 |
| | ↳ Travar ossos · Travar desenhos | 8 · 0 | (iguais) | b10: saíram de Esqueleto |
| | ↳ Travar o escolhido · Travar o resto · Destravar tudo | Ctrl+2 · Ctrl+Shift+2 · Ctrl+Alt+2 | (iguais) | b10 |

Por quê: *Ver* e *Travar* moram juntos no Spriter, e a nossa barra de ações já os junta (7, 8, 9, 0).

---

## 6. Janela — c4

| Bloco | Hoje | Depois |
|:---:|:---|:---|
| montar | Árvore · Ordem · Propriedades · Imagens · Entidades · Pivôs | **Imagens · Entidades · Pivôs · Árvore · Ordem · Malha e pesos** (Entidades colada em Imagens: a promessa E15 do degrau 5) |
| animar | Animações · Peles · Regras · Histórico | **Animações · Linha do tempo · Curvas · Peles · Regras** |
| olhar | Exibição · Prévia · Malha e pesos · Linha do tempo · Curvas | **Propriedades · Exibição · Prévia · Histórico** |
| o resto | (igual) | (igual) |

Isto é o `WINDOW_GROUPS`. Os testes `peles` e `regras` conferem o limite de seis.

---

## 7. Ajuda — igual

---

## Fora dos menus, no mesmo P33

| # | O quê | Para onde foi |
|:---:|:---|:---|
| B2 | Malha e pesos no grupo 1 da direita | **chat P** (`EXECUTANDO · a tela que cabe`), decisão P45, 29/09 às 04:50 |
| B3 | Botão Prévia na barra de ações | **chat P**, P45 |

---

## As perguntas ao Planejador

| # | Pergunta | A minha suposição, se não houver resposta |
|:---:|:---|:---|
| 1 | *Nova animação* fica fora do submenu? | fica fora |
| 2 | O b4 pede **repetir** *Novo evento* em Animação; o B1 diz "muda de lugar, não repete". Repito ou mudo? | **mudo**: sai de Esqueleto → Novo e fica só em Animação, ao lado das Marcas (é onde a chave dele mora) |
| 3 | Título de bloco dentro do submenu Exportar | sem título: só o separador |
| 4 | A Importar pele e a Importar animação: espelhar o Exportar (`Importar ▸ · De outro boneco`)? **Não está aprovado** | ficam onde a lista acima diz |

---

## As respostas do Planejador — P41 (29/09/2026)

**Lista APROVADA.** `ui/menus.ts` passa a ser só da casca, a partir da "casa livre". A reordenação é o PRIMEIRO lote, antes do A3.

| # | Pergunta | Resposta |
|:---:|:---|:---|
| 1 | *Nova animação* fora do submenu? | **sim** |
| 2 | *Novo evento*: repete ou muda? | **muda**: sai de Esqueleto → Novo, fica em Animação ao lado das Marcas. O `Novo ▾` da Árvore continua criando evento |
| 3 | Título de bloco no Exportar | **sem título**, só o separador |
| 4 | Espelhar o Exportar no Importar? | **sim**: `Arquivo → Importar ▸` ganha o bloco "de outro boneco": **Animações, de outro corpo…** (`importar-animacao`) e **Pele, de outro boneco…** (`importar-pele`). Saem de `Animações ▸` e de `Peles ▸`. A Biblioteca fica em `Animações ▸` |

---

## Mudanças depois da aprovação — 29/09/2026, entre 04:51 e 04:59

| # | O quê | Por quê |
|:---:|:---|:---|
| 1 | Arquivo, bloco 1 partido em dois: **abrir** (Novo, Abrir projeto, Abrir recente, Reabrir, Abrir o herói) e **a pasta** (Abrir pasta do projeto) | pedido do Planejador (P41): o chat H põe no bloco da pasta `recarregar-pasta` e `trocar-pasta-origem` quando os ids existirem |
| 2 | Esqueleto, bloco 2, depois de *Opções do desenho…*: `definir-pivo` e `carimbar-pivos` (chat H) | entram quando o H avisar que os ids estão registrados |
| 3 | *"Imagens: GIF, PNG, folha, vídeo…"* virou **"GIF, PNG, folha, vídeo…"** | a auditoria da casa recusa nome com mais de 28 letras (tinha 31) |
| 4 | *Malha ▸* só entra com os ids do chat D | a auditoria recusa o mesmo id duas vezes na barra: `painel-malha` já está em Janela |

## A medição, antes de gravar — 29/09/2026, 04:51

A cópia reordenada rodou contra os 23 arquivos de teste que leem os menus,
**sem tocar a casa** (um apelido de configuração troca `ui/menus.ts` pela
cópia). Auditoria de menus: **limpa**. Maior bloco: 6. Id repetido: nenhum.

| Onde | Na casa hoje | Com a cópia |
|:---|:---:|:---:|
| 23 arquivos | 1 vermelho (o do manual, já conhecido) | **14** vermelhos: o do manual + **13 novos** |

Os 13 novos são todos de **lugar ou nome no menu**, nenhum de função:

| Teste | Dono | Por que cai |
|:---|:---:|:---|
| `acoes` — toda ação dos sete menus está na tabela | casca | os 4 pais novos (`trazer-para-projeto`, `animacoes`, `peles`, `travar`) faltam em `actions-table.ts` |
| `menus` — sete menus, nesta ordem | casca | a ordem da barra mudou (c1) |
| `menus` — um separador não é uma entrada | casca | conta separadores: eram 21, são 30 |
| `animando` — Mandar para o topo (2 testes) · as duas portas da biblioteca · o gesto é UM id | G | procuram no nível de cima do menu Animação; agora moram em *Animações ▸*, e o Exportar/Importar animação em Arquivo |
| `exportar-e-ajuda` — glTF é o primeiro do Exportar | E | a ordem do Exportar mudou (B1) |
| `exportar-por-pele` — "Por pele…" logo depois de "Imagem…" | E | nomes novos (N-2) |
| `pasta-do-projeto` — Abrir pasta logo depois de Abrir · Importar ficou com três · Entidades ao lado de Imagens | E | a pasta tem bloco próprio; o Importar ganhou o bloco "de outro boneco"; Janela mudou (c4) |
| `peles` — a porta: botão direito da Árvore e menu Esqueleto | I | "Trocar imagem nas peles" mora em *Esqueleto → Peles ▸* |

## Os pedidos que esperam o id existir — 29/09/2026, entre 04:55 e 04:59 (estava "05:05": escrito sem olhar o relógio, regra 20)

Item de menu sem ação registrada não entra (camada 2 de 22/09). Cada um entra quando o dono avisar.

| Id | Nome | Onde | Tecla | Dono |
|:---|:---|:---|:---:|:---:|
| `recarregar-pasta` · `trocar-pasta-origem` | Recarregar a pasta · Trocar pasta de origem… | Arquivo, bloco da pasta, depois de *Abrir pasta do projeto…* | — | H |
| `definir-pivo` · `carimbar-pivos` | Definir pivô… · Carimbar pivôs | Esqueleto, bloco 2, depois de *Opções do desenho…* | — | H |
| `escolher-irmao-seguinte` · `escolher-irmao-anterior` | O irmão seguinte · O irmão anterior | Editar → Escolher ▸, depois de *Os pais* | `Alt+]` · `Alt+[` — **no `shortcut:` do menu, e só ali** (nunca também em `keys.ts`) | F |
| `particulas-fogo` · `-fumaca` · `-faisca` · `-poeira` | Fogo · Fumaça · Faísca · Poeira | Animação → Efeitos de chave ▸, depois do separador (b5). **Um lugar só**: a auditoria recusa o mesmo id duas vezes, então não entram também em Esqueleto → Novo | — | B |
| os botões da aba Malha e pesos | — | Esqueleto → Malha ▸ (a1) | — | D |
| as portas de pele que faltam | — | Esqueleto → Peles ▸ (a5) | — | I |

## A medição das reescritas — 29/09/2026, entre 04:55 e 04:59 (estava "05:04": escrito sem olhar o relógio, regra 20)

As 13 reescritas e a tabela, em cópia, rodaram contra o menu novo: os 23 arquivos com **1 vermelho** só, o do manual (`exportar-e-ajuda`, *"carries every chapter"*), que **já está vermelho na casa hoje** e não é deste lote.

## GRAVADO — 29/09/2026, 05:00 (relógio)

`ui/menus.ts`, `ui/actions-table.ts` e os 7 testes, numa volta só, na "casa livre".
Medido na casa às 05:03: os 23 arquivos **sem vermelho deste lote**. O `tsc`
acusou dois erros meus às 05:01 (`animating` opcional em `EditMenuState` brigava
com o de `AnimationMenuState`); consertado às 05:02, antes do aviso "menus gravados".

## No fim ▸ (a4) — preparado no rascunho, 09:35 — NÃO gravado

Os cinco ids do chat D já estão registrados e na tabela; falta o menu (e por isso o rótulo sai vazio na tabela, que o tira do menu).

| Onde | O quê |
|:---|:---|
| Animação, bloco 3, logo depois de *Repetir* | **No fim ▸** (`no-fim`, pai novo) |
| dentro, nesta ordem | Como o arquivo diz (`fim-arquivo`) · Parar no fim (`fim-parar`) · Repetir (`fim-repetir`) · Vai e volta (`fim-vai-e-volta`) · Voltar ao início (`fim-voltar`) |
| marca de rádio | vem de cada ação (`checked`), como a do Tema |
| `actions-table.ts` | `no-fim` no grupo dos submenus |
| `acoes.test.ts` | a conta: 226 lido do disco + 1 (o pai `no-fim`, casca) + 5 (os `fim-*`, chat D) = **232**, as duas partes juntas, combinado com o chat D. Se o disco não disser 226, o script para |
| `menus.test.ts` | 3 testes novos, olhando DENTRO do submenu: o lugar, os cinco na ordem, e os nomes iguais aos do `END_MODES` |

Script: `no-fim.py` no rascunho do chat A2. Conferido às 09:35: acha todos os trechos no disco de hoje. **Não medido**: menos de 2 GB livres (P61). Grava e mede na mesma volta, quando o Planejador disser.

**K5 do chat D** ("uma segunda entrada Colar espelhado em Editar"): já está feito desde as 05:00 — `colar-espelhado` MUDOU para Editar (b12), e saiu de Animação. Uma segunda entrada não pode: a auditoria recusa o mesmo id duas vezes na barra.

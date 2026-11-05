# O dicionário da tela — 05/11/2026

Ramo `obra/recorte-na-cena`, sobre `obra/noite-2026-11-04`. Medido às 00h46 UTC: `npx vitest run` 5.797 verdes + o vermelho conhecido do manual; `tsc` limpo; conformidade 120/120.

A queixa do Humberto: as funções existem, mas **não aparecem**, ou têm **nome de programador**.

## 1. A régua

| Onde | O termo técnico pode aparecer? |
|:---|:---|
| **Nome** de menu, aba, ferramenta, botão, tecla | **Não.** Só a palavra da pessoa |
| **Dica**, rodapé, janela | Só **entre parênteses** ou crases, depois da palavra da pessoa: *"o desenho (slot)"* |
| Nome de arquivo | Pode: `.bone`, `.boneb`, `.bonez`, `manifest.json` é o que a pessoa vê na pasta |

O código da régua: `editor/src/ui/jargao.ts`. Os testes: `editor/testes/menus.test.ts`, *"o dicionário da tela"*.

## 2. O dicionário

As palavras vêm do que a casa **já decidiu**: o glossário da spec (§1.6) e a régua R13 do doc `68`. Nada foi inventado.

| Termo técnico | Palavra da pessoa | De onde vem |
|:---|:---|:---|
| slot | **desenho** (o lugar da imagem no osso); com entidade dentro, **tomada** | R13 do doc 68; spec §1.6 |
| atlas | **folha de imagens** | o que o atlas é (spec §10) |
| attachment | **imagem**, **desenho** | spec §1.6 |
| skeleton | **base**, **boneco** | spec §1.6 |
| constraint | **regra** | spec §1.6 |
| rig | **os ossos que ela espera** | spec §2.8, §4.8 |
| mesh | **malha** | spec §1.6 |
| region | **imagem** | spec §1.6 |
| setup pose | **base**, **pose de repouso** | spec §1.6 |
| timeline | **linha** (da linha do tempo) | spec §1.6 |
| keyframe | **chave** | spec §1.6 |
| socket | **encaixe** | spec §7.11 |
| bounding box | **caixa** | a ferramenta Caixa |
| clipping | **máscara** | item 47 |
| manifest | **a lista do projeto** (o arquivo `manifest.json` fica com o nome) | spec §2.9 |

### Duas palavras que a casa decidiu de dois jeitos

| Coisa | Spec §1.6 (17/09) | Tela hoje, R13 do doc 68 (07/10) | Fiz |
|:---|:---|:---|:---|
| `skins[]` | **Pele** | **Skin** (menu Skins, aba Skins) | deixei **skin**: é a mais nova, e está em toda a tela |
| slot com entidade | **Tomada** | slot | é da sessão das tomadas |

## 3. O que eu consertei (casca, menus, cena)

| Onde | Era | Ficou |
|:---|:---|:---|
| Base → Novo | **Ponto neste slot** | **Ponto neste desenho** |
| Base → Novo | **Caixa neste slot** | **Caixa neste desenho** |
| dica das duas | "Com um slot escolhido … sem criar slot" | "Com um desenho escolhido … sem criar outro desenho (slot)" |
| Desfazer / Histórico | "Novo ponto no slot", "Nova caixa no slot" | "Novo ponto no desenho", "Nova caixa no desenho" |
| Arquivo → Salvar, Salvar como, pacote, Entregar | "o atlas" | "a folha de imagens (atlas)" |
| Arquivo → Animações, para outra base | "o contrato de rig" | "a lista dos ossos que elas esperam (o contrato de rig)" |
| Imagens → Carimbar pivôs | "Grava no atlas" | "Grava na folha de imagens (atlas)" |
| Base → Limpar desenhos vazios | "Apaga os slots" | "Apaga os desenhos (slots)" |
| Malha e regras: Usar a forma | "do mesmo slot" | "do mesmo desenho (slot)" |
| Substituir nomes | "em ossos, slots e regras" | "em ossos, desenhos (slots) e regras" |
| Colar base, sem outra base | "manifest.json que liste as bases em skeletons" | "a pasta de um projeto que tenha mais de uma base … quem lista as bases é o manifest.json" |
| Rodapé: Salvar | "Atlas e páginas gravados junto" | "A folha de imagens (atlas e páginas) foi gravada junto" |
| Janela de problemas | "não estão em atlas nenhum" | "não estão em folha de imagens nenhuma (atlas)" |
| Rodapé: arrastar imagem | "o slot nasce no osso" | "o desenho nasce no osso" |
| Menu cinza: Ponto/Caixa neste desenho | "sem um slot escolhido" | "sem um desenho escolhido" |

## 4. As portas

| Teste | O que prova |
|:---|:---|
| *toda ação da tabela tem porta à vista* | as 308 ações de `ui/actions-table.ts` têm item de menu com nome de gente (3 letras ou mais) |
| *nenhum NOME … leva termo técnico* | menus, itens, abas, teclas da Ajuda, ferramentas |
| *nas dicas dos menus …* | termo técnico só entre parênteses |
| *nos textos da casca e da cena …* | todo texto de `ui/` e `viewport/` |
| *a régua acusa* (regra 26) | "Ponto neste slot" e "Grava no atlas" saem vermelhos |
| *a lista do que espera outro dono não mente* | cada linha de `ESPERANDO` ainda tem o termo, e diz quem paga |

**Prova de que o defeito existia** (regra 26): os testes novos, rodados sobre o código de ANTES (`obra/noite-2026-11-04`, 71a9397), saem **vermelhos**: 2 nomes de menu, 12 dicas de menu e 27 textos de `ui/` e `viewport/` (a terceira conta inclui as frases dos menus). Depois do conserto: 0, fora a lista `ESPERANDO`.

O botão com dica (barra, painéis) já tinha teste: `hiddenFunctions` (`ui/action-audit.ts`), *"toda ação registrada aparece em menu, na barra ou no botão direito"*.

## 5. Para as outras partes (o Diretor repassa)

**176 textos.** Tabela gerada pela mesma régua. A coluna **Proposta** é a troca mecânica pelo dicionário: confira o gênero e a frase antes de aplicar.

Cuidados:

| Parte | Cuidado |
|:---|:---|
| Entidades / tomadas | **"Marcar como slot"** não é a tomada: é a imagem que vira uma base própria. A palavra é da sessão das tomadas. Os 10 textos de menu e cena desta parte estão em `ESPERANDO` (`ui/jargao.ts`): ao trocar, tire a linha de lá |
| Ficha (avisos) | `deform needs a vertex attachment; timeline ignored` é um aviso **do runtime, em inglês**, que chega à barra de avisos. Precisa de tradução em `panels/warning-model.ts` |
| Documento | "Adicionar slot", "Remover slot" são nomes do Desfazer e do Histórico |
| Malha e pivô | **Tirar pesos**: a dica do menu e a do botão da aba são a mesma frase, letra por letra (`malha.test.ts`). Troque "o osso do slot" por "o osso do desenho" nas duas de uma vez (`panels/mesh-panel-model.ts:371` e `ui/menus.ts`), e tire a linha de `ESPERANDO` |
| Manual | os capítulos 00, 01 e 02 citam **"Ponto neste slot"** e **"Caixa neste slot"**: o nome mudou para **"… neste desenho"** |

### Entidades / tomadas — 71 textos

| Onde | Termo | Hoje | Proposta |
|:---|:---|:---|:---|
| `panels/entities-actions.ts:222` | slot | X não tem o slot "X": nada foi marcado | X não tem a tomada "X": nada foi marcado |
| `panels/entities-actions.ts:355` | slot | Marcar como slot precisa de um projeto aberto | Marcar como tomada precisa de um projeto aberto |
| `panels/entities-actions.ts:364` | slot | Marcar como slot | Marcar como tomada |
| `panels/entities-actions.ts:367` | slot | O slot passa a se chamar assim, e o arquivo é <nome>.bone | A tomada passa a se chamar assim, e o arquivo é <nome>.bone |
| `panels/entities-actions.ts:368` | slot | Marcar como slot | Marcar como tomada |
| `panels/entities-actions.ts:376` | slot | Marcar como slot: X. Nada mudou | Marcar como tomada: X. Nada mudou |
| `panels/entities-actions.ts:381` | slot | "X" virou a base X: o slot se chama X, e ela está na lista de bases.  | "X" virou a base X: a tomada se chama X, e ela está na lista de bases.  |
| `panels/entities-actions.ts:389` | slot | Escolha o slot marcado primeiro | Escolha a tomada marcado primeiro |
| `panels/entities-actions.ts:393` | slot | X voltou a ser a imagem de antes, no slot X.  | X voltou a ser a imagem de antes, na tomada X.  |
| `panels/entities-actions.ts:468` | slot | Não há ligação de teste: arraste uma entidade da prateleira até a linha de um slot, na aba Entidades | Não há ligação de teste: arraste uma entidade da prateleira até a linha de uma tomada, na aba Entidades |
| `panels/entities-actions.ts:496` | slot | Não há peça de teste: arraste uma entidade da prateleira até a linha de um slot, na aba Entidades | Não há peça de teste: arraste uma entidade da prateleira até a linha de uma tomada, na aba Entidades |
| `panels/entities-actions.ts:498` | slot | Nenhuma peça de teste está num slot com iguais (a mesma imagem em outros slots, como as rodas) | Nenhuma peça de teste está num tomada com iguais (a mesma imagem em outros tomadas, como as rodas) |
| `panels/entities-actions.ts:578` | slot | Pôr em teste neste slot | Pôr em teste nesta tomada |
| `panels/entities-actions.ts:586` | slot | X já está em teste no slot X | X já está em teste na tomada X |
| `panels/entities-cards-model.ts:501` | slot | a animação não muda. Arraste para outro slot para mudar, ou para a prateleira para desligar.  | a animação não muda. Arraste para outra tomada para mudar, ou para a prateleira para desligar.  |
| `panels/entities-cards-model.ts:507` | slot | . Fica em volta de X ("Este boneco"): o meio é o slot X | . Fica em volta de X ("Este boneco"): o meio é a tomada X |
| `panels/entities-cards-model.ts:524` | slot | X: este slot não existe mais em X. A peça de teste ficou sem lugar:  | X: esta tomada não existe mais em X. A peça de teste ficou sem lugar:  |
| `panels/entities-cards-model.ts:525` | slot | arraste-a até a linha de outro slot, ou botão direito → Desligar | arraste-a até a linha de outra tomada, ou botão direito → Desligar |
| `panels/entities-cards-model.ts:527` | slot | X: slot marcado. Ele virou uma base, com nome e animações próprias | X: tomada marcado. Ele virou uma base, com nome e animações próprias |
| `panels/entities-cards-model.ts:528` | slot | X: slot com entidade | X: tomada com entidade |
| `panels/entities-cards-model.ts:531` | slot | . Arraste uma entidade da prateleira até aqui para pô-la neste slot em teste: vale só na Prévia, o arquivo não muda | . Arraste uma entidade da prateleira até aqui para pô-la nesta tomada em teste: vale só na Prévia, o arquivo não muda |
| `panels/entities-cards-model.ts:533` | slot | X. O editor não carregou a base deste slot: não dá para ver o que tem dentroX | X. O editor não carregou a base desta tomada: não dá para ver o que tem dentroX |
| `panels/entities-cards-model.ts:555` | slot | Quem está dentro de quem, de cima para baixo. O cartão dentro de uma linha está no slot daquela linha | Quem está dentro de quem, de cima para baixo. O cartão dentro de uma linha está na tomada daquela linha |
| `panels/entities-cards-model.ts:559` | slot | As entidades do projeto. Arraste uma até a linha de um slot, na Montagem, para pô-la ali em teste;  | As entidades do projeto. Arraste uma até a linha de uma tomada, na Montagem, para pô-la ali em teste;  |
| `panels/entities-cards-model.ts:605` | slot | O teste vale só nos slots do projeto aberto (o cartão AQUI). Esta linha é de dentro de X:  | O teste vale só nas tomadas do projeto aberto (o cartão AQUI). Esta linha é de dentro de X:  |
| `panels/entities-cards-model.ts:620` | slot | X já está no slot X, em teste: arraste outra entidade | X já está na tomada X, em teste: arraste outra entidade |
| `panels/entities-cards-model.ts:623` | slot | X já está no slot X, gravada no arquivo: arraste outra entidade | X já está na tomada X, gravada no arquivo: arraste outra entidade |
| `panels/entities-cards-model.ts:639` | slot | X não tem o slot X | X não tem a tomada X |
| `panels/entities-cards-model.ts:641` | slot | O slot X não tem desenho nenhum: não há imagem para X tomar o lugar | A tomada X não tem desenho nenhum: não há imagem para X tomar o lugar |
| `panels/entities-cards-model.ts:658` | slot | A peça de teste já está no slot X: arraste-a até a linha de outro slot, ou para a prateleira | A peça de teste já está na tomada X: arraste-a até a linha de outra tomada, ou para a prateleira |
| `panels/entities-cards-model.ts:686` | slot | X no lugar de X, no slot X: teste. A animação não muda. | X no lugar de X, na tomada X: teste. A animação não muda. |
| `panels/entities-cards-model.ts:698` | slot | X no slot XX: teste.X A animação não muda. | X na tomada XX: teste.X A animação não muda. |
| `panels/entities-cards-model.ts:709` | slot | X saiu do slot X (era teste). | X saiu da tomada X (era teste). |
| `panels/entities-cards-model.ts:721` | slot | Mudar o teste de slot | Mudar o teste de tomada |
| `panels/entities-cards-model.ts:723` | slot | X passou do slot X para o X: teste. | X passou da tomada X para o X: teste. |
| `panels/entities-cards-model.ts:724` | slot | X passou do slot X para o X, no lugar de X: teste. | X passou da tomada X para o X, no lugar de X: teste. |
| `panels/entities-cards-model.ts:810` | slot | Escolha uma imagem na cena primeiro (clique nela), ou arraste a entidade da aba Entidades até a linha do slot | Escolha uma imagem na cena primeiro (clique nela), ou arraste a entidade da aba Entidades até a linha da tomada |
| `panels/entities-cards-model.ts:818` | slot | Escolha na cena a imagem do slot que tem a peça de teste | Escolha na cena a imagem da tomada que tem a peça de teste |
| `panels/entities-cards-model.ts:819` | slot | O slot X não tem peça de teste | A tomada X não tem peça de teste |
| `panels/entities-cards-model.ts:947` | slot | O editor não abriu o arquivo X: não dá para ver os slots dele. Abra a pasta do projeto | O editor não abriu o arquivo X: não dá para ver as tomadas dele. Abra a pasta do projeto |
| `panels/entities-cards-model.ts:949` | slot | X não tem slot com desenho para receber X | X não tem tomada com desenho para receber X |
| `panels/entities-cards-model.ts:950` | slot | O slot X de X não tem desenho: não há lugar para X | A tomada X de X não tem desenho: não há lugar para X |
| `panels/entities-cards-model.ts:962` | slot | X entrou em X, no slot X: teste.  | X entrou em X, na tomada X: teste.  |
| `panels/entities-cards-model.ts:1127` | slot | O slot X não tem desenho para a peça tomar o lugar | A tomada X não tem desenho para a peça tomar o lugar |
| `panels/entities-cards-model.ts:1137` | slot | O editor não conseguiu montar X para achar o lugar do slot X | O editor não conseguiu montar X para achar o lugar da tomada X |
| `panels/entities-cards-model.ts:1201` | slot |  X saiu do slot. |  X saiu da tomada. |
| `panels/entities-cards-model.ts:1204` | slot | X gravada no slot X: agora é do projetoX.XX Ctrl+Z volta a teste. | X gravada na tomada X: agora é do projetoX.XX Ctrl+Z volta a teste. |
| `panels/entities-cards-model.ts:1279` | slot | Montagem de teste: o slot X não existe mais em X.  | Montagem de teste: a tomada X não existe mais em X.  |
| `panels/entities-cards-model.ts:1280` | slot | A peça X ficou sem lugar: arraste-a para outro slot, ou Desligar | A peça X ficou sem lugar: arraste-a para outra tomada, ou Desligar |
| `panels/entities-cards-model.ts:1291` | slot | Montagem de teste: o slot X não existe mais em X.  | Montagem de teste: a tomada X não existe mais em X.  |
| `panels/entities-cards-model.ts:1306` | slot | X entra no slot X de X, no lugar da imagem que está lá | X entra na tomada X de X, no lugar da imagem que está lá |
| `panels/palette-entities-model.ts:143` | slot | X: base do projeto. Arraste até a linha de um slot, na Montagem, para pô-la ali em teste,  | X: base do projeto. Arraste até a linha de uma tomada, na Montagem, para pô-la ali em teste,  |
| `panels/palette-entities.ts:180` | slot | arraste para um slot | arraste para uma tomada |
| `panels/palette-entities.ts:225` | slot | Tira a peça de teste deste slot. O arquivo não muda: ela nunca entrou nele | Tira a peça de teste desta tomada. O arquivo não muda: ela nunca entrou nele |
| `panels/palette-entities.ts:273` | slot | Trocar todas as iguais: põe X em teste nos X slots que mostram a mesma imagem que X,  | Trocar todas as iguais: põe X em teste nos X tomadas que mostram a mesma imagem que X,  |
| `panels/palette-entities.ts:312` | slot | Mostra de novo só os slots com entidade, com teste, ou marcados | Mostra de novo só as tomadas com entidade, com teste, ou marcados |
| `panels/palette-entities.ts:471` | slot | A peça de teste já está no slot X: arraste-a até a linha de outro slot, ou para a prateleira | A peça de teste já está na tomada X: arraste-a até a linha de outra tomada, ou para a prateleira |
| `panels/palette-entities.ts:706` | slot | X não está gravada no slot X deste arquivo | X não está gravada na tomada X deste arquivo |
| `panels/palette-entities.ts:732` | slot | Nada mudou: nenhum slot de X foi escolhido | Nada mudou: nenhuma tomada de X foi escolhido |
| `panels/palette-entities.ts:749` | slot | Em que slot de X entra? | Em que tomada de X entra? |
| `panels/palette-entities.ts:750` | slot | Qual slot? | Qual tomada? |
| `panels/palette-entities.ts:793` | slot | Não há ligação de teste para pôr no projeto. Arraste uma entidade da prateleira até a linha de um slot | Não há ligação de teste para pôr no projeto. Arraste uma entidade da prateleira até a linha de uma tomada |
| `panels/slot-base-model.ts:131` | slot | Marcar como slot precisa de um projeto aberto | Marcar como tomada precisa de um projeto aberto |
| `panels/slot-base-model.ts:139` | slot | X já é um slot marcado | X já é uma tomada marcado |
| `panels/slot-base-model.ts:140` | slot | X não mostra uma imagem: só imagem vira slot | X não mostra uma imagem: só imagem vira tomada |
| `panels/slot-base-model.ts:144` | slot | X é uma X: por enquanto só a imagem simples vira slot | X é uma X: por enquanto só a imagem simples vira tomada |
| `panels/slot-base-model.ts:168` | slot | Escolha o slot marcado primeiro (clique nele na cena, ou na Árvore) | Escolha a tomada marcado primeiro (clique nele na cena, ou na Árvore) |
| `panels/slot-base-model.ts:169` | slot | X não é um slot marcado | X não é uma tomada marcado |
| `panels/slot-base-model.ts:187` | slot | Já existe um slot X no boneco | Já existe uma tomada X no boneco |
| `panels/slot-base-model.ts:216` | slot | Marcar como slot | Marcar como tomada |
| `doc/around-warnings.ts:39` | slot | Este boneco: a entidade X não tem mais o slot "X" que marcava o meio  | Este boneco: a entidade X não tem mais a tomada "X" que marcava o meio  |

### Arquivo, exportar, importar — 35 textos

| Onde | Termo | Hoje | Proposta |
|:---|:---|:---|:---|
| `io/drop-plan.ts:117` | atlas | Um atlas sozinho não abre nada. Solte o `.bone` junto com ele | Um folha de imagens (atlas) sozinho não abre nada. Solte o `.bone` junto com ele |
| `io/export-animation.ts:313` | rig | Sem rig.reference: a animação entra no tamanho em que foi gravada | Sem rig.reference: a animação entra no tamanho em que foi gravada |
| `io/export-animation.ts:621` | slot,rig | de rig gerado do conteúdo — os ossos e os slots que as chaves nomeiam — e  | de rig gerado do conteúdo — os ossos e os desenhos que as chaves nomeiam — e  |
| `io/export-animation.ts:698` | slot | Estas animações não nomeiam osso nem slot nenhum: elas cabem em qualquer base. | Estas animações não nomeiam osso nem desenho nenhum: elas cabem em qualquer base. |
| `io/export-skin.ts:186` | atlas | O atlas aberto não tem X X:  | A folha de imagens (atlas) aberto não tem X X:  |
| `io/export-skin.ts:286` | slot | Salvo em X. X bytes, X ossos, X slots,  | Salvo em X. X bytes, X ossos, X desenhos,  |
| `io/export-skin.ts:413` | atlas | Pacote .bonez com o atlas (um arquivo só) | Pacote .bonez com a folha de imagens (atlas) (um arquivo só) |
| `io/export-skin.ts:417` | atlas | Sai um .bonez com o .bone fatiado, o atlas só com as regiões usadas e as páginas reempacotadas | Sai um .bonez com o .bone fatiado, a folha de imagens (atlas) só com as regiões usadas e as páginas reempacotadas |
| `io/export-skin.ts:418` | atlas | Este arquivo não tem atlas aberto: sai só o .bone | Este arquivo não tem folha de imagens (atlas) aberto: sai só o .bone |
| `io/export-skin.ts:463` | atlas | Sai um .bonez só: o .bone, o atlas com as X região(ões) usadas e as páginas reempacotadas. | Sai um .bonez só: o .bone, a folha de imagens (atlas) com as X região(ões) usadas e as páginas reempacotadas. |
| `io/export-skin.ts:464` | atlas | O arquivo vai pedir X região(ões) do atlas. Sai só o .bone;  | O arquivo vai pedir X região(ões) da folha de imagens (atlas). Sai só o .bone;  |
| `io/export-skin.ts:465` | atlas | para levar o atlas junto, marque o pacote .bonez. | para levar a folha de imagens (atlas) junto, marque o pacote .bonez. |
| `io/export-skin.ts:779` | atlas | salve o projeto antes, para X no atlas | salve o projeto antes, para X na folha de imagens (atlas) |
| `io/folder-save.ts:145` | atlas | As imagens vieram soltas, sem pasta aberta: o atlas e as páginas foram baixados | As imagens vieram soltas, sem pasta aberta: a folha de imagens (atlas) e as páginas foram baixados |
| `io/folder-save.ts:147` | atlas | o atlas e as páginas foram baixados | a folha de imagens (atlas) e as páginas foram baixados |
| `io/folder-save.ts:153` | atlas | O .bone foi salvo fora da pasta X: o atlas e as páginas foram baixados.  | O .bone foi salvo fora da pasta X: a folha de imagens (atlas) e as páginas foram baixados.  |
| `io/import-foreign.ts:54` | atlas | Projeto de outro programa, atlas e imagens | Projeto de outro programa, folha de imagens (atlas) e imagens |
| `io/import-foreign.ts:275` | atlas | Não deu para montar o atlas: X. | Não deu para montar a folha de imagens (atlas): X. |
| `io/import-psd.ts:520` | slot | Escolha o que fazer com os ossos e os slots que já estão aqui. | Escolha o que fazer com os ossos e os desenhos que já estão aqui. |
| `io/import-psd.ts:523` | slot | Substituir: apaga os ossos, os slots e as animações, e monta tudo de novo pelo PSD. | Substituir: apaga os ossos, os desenhos e as animações, e monta tudo de novo pelo PSD. |
| `io/open-save.ts:431` | atlas | Não deu para ler o atlas X: X | Não deu para ler a folha de imagens (atlas) X: X |
| `io/open-save.ts:442` | atlas | procuradas nos atlas que o projeto já tem abertos. | procuradas nos folha de imagens (atlas) que o projeto já tem abertos. |
| `io/open-save.ts:476` | slot | A entidade X não foi aberta; esse slot fica vazio. | A entidade X não foi aberta; esse desenho fica vazio. |
| `io/open-save.ts:798` | atlas | As imagens desta base não vieram da pasta do projeto: o atlas que ela já citava vai como está, sem fatiar. | As imagens desta base não vieram da pasta do projeto: a folha de imagens (atlas) que ela já citava vai como está, sem fatiar. |
| `io/open-save.ts:825` | atlas | O navegador não entregou a pasta do arquivo: o atlas e as páginas foram baixados. Ponha-os ao lado do .bone. | O navegador não entregou a pasta do arquivo: a folha de imagens (atlas) e as páginas foram baixados. Ponha-os ao lado do .bone. |
| `io/open-save.ts:836` | atlas | sem atlas novo | sem folha de imagens (atlas) novo |
| `io/open-save.ts:1071` | atlas | Atlas da pasta gravado ao lado: X, com X X em uso | Folha de imagens (atlas) da pasta gravado ao lado: X, com X X em uso |
| `io/open-save.ts:1084` | atlas | Atlas gravado ao lado: X | Folha de imagens (atlas) gravado ao lado: X |
| `io/open-save.ts:1087` | atlas | Atlas e páginas baixados: X | Folha de imagens (atlas) e páginas baixados: X |
| `io/open-save.ts:1256` | atlas | o atlas com as imagens | a folha de imagens (atlas) com as imagens |
| `io/open-save.ts:1256` | atlas | X atlas com as imagens | X folha de imagens (atlas) com as imagens |
| `io/pedir-pasta.ts:179` | atlas | Escolha a pasta: o .bone, o atlas, as imagens em uso e as entidades vão juntos, e o projeto passa a morar nela | Escolha a pasta: o .bone, a folha de imagens (atlas), as imagens em uso e as entidades vão juntos, e o projeto passa a morar nela |
| `io/pedir-pasta.ts:183` | atlas | Escolhe onde gravar o .bone. O atlas e as entidades continuam na pasta X | Escolhe onde gravar o .bone. A folha de imagens (atlas) e as entidades continuam na pasta X |
| `io/project-folder.ts:354` | atlas | } no atlas salvo, e a cena continua com  | } na folha de imagens (atlas) salvo, e a cena continua com  |
| `io/save-binary.ts:278` | atlas | Esta base usa X, mas o atlas não está aberto. O pacote sai sem ele. | Esta base usa X, mas a folha de imagens (atlas) não está aberto. O pacote sai sem ele. |

### Imagens e pasta — 22 textos

| Onde | Termo | Hoje | Proposta |
|:---|:---|:---|:---|
| `panels/image-grid-model.ts:70` | slot | Só as imagens que este slot já usou: nas skins, nas chaves de Desenho e nas trocas desta sessão | Só as imagens que este desenho já usou: nas skins, nas chaves de Desenho e nas trocas desta sessão |
| `panels/image-grid-model.ts:79` | slot | Este slot ainda não usou outra imagem | Este desenho ainda não usou outra imagem |
| `panels/image-picker-model.ts:938` | slot | Em todas as skins: ligado. A imagem que você clicar troca em toda skin que usa a mesma neste slot | Em todas as skins: ligado. A imagem que você clicar troca em toda skin que usa a mesma neste desenho |
| `panels/image-picker.ts:111` | atlas | "X" não está no atlas nem na pasta, ou o arquivo não abriu | "X" não está na folha de imagens (atlas) nem na pasta, ou o arquivo não abriu |
| `panels/image-picker.ts:350` | atlas | "X" não está no atlas nem na pasta, ou o arquivo não abriu | "X" não está na folha de imagens (atlas) nem na pasta, ou o arquivo não abriu |
| `panels/image-picker.ts:363` | atlas | "X" não está no atlas nem na pasta, ou o arquivo não abriu | "X" não está na folha de imagens (atlas) nem na pasta, ou o arquivo não abriu |
| `panels/image-picker.ts:655` | slot | Ligado: a imagem que você clicar troca em toda skin que usa a mesma neste slot (o mesmo que Shift + clique) | Ligado: a imagem que você clicar troca em toda skin que usa a mesma neste desenho (o mesmo que Shift + clique) |
| `panels/palette-model.ts:422` | slot | X está aberto, com ${n === 1 ? '1 slot' :  | X está aberto, com ${n === 1 ? '1 desenho' :  |
| `panels/palette-model.ts:426` | slot | Trocar o desenho do slot | Trocar o desenho do desenho |
| `panels/palette.ts:62` | atlas | Carimbar pivôs: grava no atlas onde cada imagem encaixa no osso,  | Carimbar pivôs: grava na folha de imagens (atlas) onde cada imagem encaixa no osso,  |
| `panels/palette.ts:169` | atlas | "X" não está em nenhum atlas aberto | "X" não está em nenhuma folha de imagens (atlas) aberto |
| `panels/palette.ts:307` | atlas | "X" não está em nenhum atlas aberto, nem na pasta | "X" não está em nenhuma folha de imagens (atlas) aberto, nem na pasta |
| `panels/palette.ts:734` | atlas | Duplicar "X" no atlas: cada lugar com pivô diferente ganha a sua cópia | Duplicar "X" na folha de imagens (atlas): cada lugar com pivô diferente ganha a sua cópia |
| `panels/palette.ts:840` | atlas | "X" não está em nenhum atlas aberto, nem na pasta: não há pivô para copiar | "X" não está em nenhuma folha de imagens (atlas) aberto, nem na pasta: não há pivô para copiar |
| `panels/palette.ts:856` | atlas | "X" não está em nenhum atlas aberto, nem na pasta | "X" não está em nenhuma folha de imagens (atlas) aberto, nem na pasta |
| `panels/palette.ts:906` | atlas | Duplicar no atlas | Duplicar na folha de imagens (atlas) |
| `panels/palette.ts:907` | atlas | Faz uma cópia de "X" no atlas, com outro nome e o mesmo desenho | Faz uma cópia de "X" na folha de imagens (atlas), com outro nome e o mesmo desenho |
| `panels/palette.ts:908` | atlas | Faz uma cópia de "X" no atlas, e X passa a usar a cópia | Faz uma cópia de "X" na folha de imagens (atlas), e X passa a usar a cópia |
| `panels/palette.ts:1120` | slot | nenhum slot usa esta imagem | nenhum desenho usa esta imagem |
| `panels/palette.ts:1121` | slot | um slot usa esta imagem | um desenho usa esta imagem |
| `panels/palette.ts:1121` | slot | X slots usam esta imagem | X desenhos usam esta imagem |
| `panels/palette.ts:1140` | slot,atlas | ou para um slot ou desenho da Árvore. X. Botão direito: Duplicar no atlas | ou para um desenho ou desenho da Árvore. X. Botão direito: Duplicar na folha de imagens (atlas) |

### Malha e pivô — 15 textos

| Onde | Termo | Hoje | Proposta |
|:---|:---|:---|:---|
| `panels/mesh-panel-model.ts:371` | slot | A malha volta a seguir só o osso do slot | A malha volta a seguir só o osso do desenho |
| `panels/mesh-panel.ts:141` | atlas | sem imagem para "X" no atlas | sem imagem para "X" na folha de imagens (atlas) |
| `panels/mesh-panel.ts:143` | atlas | a imagem da página do atlas ainda não carregou | a imagem da página da folha de imagens (atlas) ainda não carregou |
| `panels/mesh-panel.ts:460` | slot | Uma malha ligada empresta a forma de outra malha do mesmo slot e troca só a imagem | Uma malha ligada empresta a forma de outra malha do mesmo desenho e troca só a imagem |
| `panels/mesh-panel.ts:466` | slot | Escolha um slot. | Escolha um desenho. |
| `panels/mesh-panel.ts:1029` | atlas | Não deu: "X" não está no atlas, e o desenho não diz o tamanho. | Não deu: "X" não está na folha de imagens (atlas), e o desenho não diz o tamanho. |
| `panels/mesh-panel.ts:1202` | slot | Escolha um slot primeiro | Escolha um desenho primeiro |
| `io/pivot-atlas.ts:230` | atlas | Duplicar no atlas | Duplicar na folha de imagens (atlas) |
| `io/pivot-model.ts:293` | atlas | imagem "X" é usada em X lugares com pivôs diferentes; duplique no atlas | imagem "X" é usada em X lugares com pivôs diferentes; duplique na folha de imagens (atlas) |
| `io/pivot-model.ts:375` | atlas | Nenhum desenho montado usa imagem do atlas: não há pivô para carimbar | Nenhum desenho montado usa imagem da folha de imagens (atlas): não há pivô para carimbar |
| `mesh/linked-mesh.ts:96` | slot | Escolha um slot ou um desenho primeiro. | Escolha um desenho ou um desenho primeiro. |
| `mesh/linked-mesh.ts:98` | slot | O slot "X" não existe neste arquivo. | O desenho "X" não existe neste arquivo. |
| `mesh/linked-mesh.ts:101` | slot | Este slot não tem nenhuma malha para servir de origem. Vire um desenho em malha primeiro. | Este desenho não tem nenhuma malha para servir de origem. Vire um desenho em malha primeiro. |
| `mesh/linked-mesh.ts:174` | slot | "X" não é uma malha do slot "X". Uma malha ligada só empresta a forma de uma malha do mesmo slot (7.5). | "X" não é uma malha do desenho "X". Uma malha ligada só empresta a forma de uma malha do mesmo desenho (7.5). |
| `mesh/linked-mesh.ts:183` | slot | Já existe um desenho chamado "X" no slot "X". | Já existe um desenho chamado "X" no desenho "X". |

### Árvore — 9 textos

| Onde | Termo | Hoje | Proposta |
|:---|:---|:---|:---|
| `panels/tree-actions.ts:261` | slot | , dentro do slot X | , dentro do desenho X |
| `panels/tree-actions.ts:286` | slot | Escolha um slot na Árvore primeiro | Escolha um desenho na Árvore primeiro |
| `panels/tree-commands.ts:106` | slot | Novo slot | Novo desenho |
| `panels/tree-commands.ts:548` | slot | Novo anexo no slot | Novo anexo no desenho |
| `panels/tree-commands.ts:589` | slot | X X entrou no slot X:  | X X entrou no desenho X:  |
| `panels/tree.ts:777` | slot | Abre o painel Imagens: a imagem que você clicar troca em toda skin que usa a mesma neste slot | Abre o painel Imagens: a imagem que você clicar troca em toda skin que usa a mesma neste desenho |
| `panels/tree.ts:1129` | slot | Solte a imagem na linha de um slot: o desenho dele troca por "X". Nesta linha ela não entra | Solte a imagem na linha de um desenho: o desenho dele troca por "X". Nesta linha ela não entra |
| `panels/tree.ts:1145` | slot | Imagem no slot | Imagem no desenho |
| `panels/tree.ts:1149` | slot | X entrou no slot X como X: escolha-o no campo Anexo das Propriedades para mostrar | X entrou no desenho X como X: escolha-o no campo Anexo das Propriedades para mostrar |

### Animações — 5 textos

| Onde | Termo | Hoje | Proposta |
|:---|:---|:---|:---|
| `panels/animations-actions.ts:275` | slot | Entidade X, encaixada no slot X | Entidade X, encaixada no desenho X |
| `panels/animations-actions.ts:276` | slot | Entidade X, encaixada nos slots X | Entidade X, encaixada nos desenhos X |
| `panels/animations-model.ts:463` | slot | nos slots X | nos desenhos X |
| `panels/animations.ts:578` | slot | X: a imagem marcada como slot. Clique para montá-la por dentro, com o boneco à vista | X: a imagem marcada como desenho. Clique para montá-la por dentro, com o boneco à vista |
| `panels/animations.ts:713` | slot | X: a imagem marcada como slot. Clique para montar X  | X: a imagem marcada como desenho. Clique para montar X  |

### Linha do tempo — 5 textos

| Onde | Termo | Hoje | Proposta |
|:---|:---|:---|:---|
| `panels/dopesheet-actions.ts:72` | slot | Escolha um osso ou um slot, na cena ou na Árvore, para copiar a pose dele | Escolha um osso ou um desenho, na cena ou na Árvore, para copiar a pose dele |
| `panels/dopesheet-edit.ts:198` | slot | Escolha um osso, um slot ou uma linha para chavear. | Escolha um osso, um desenho ou uma linha para chavear. |
| `panels/dopesheet-edit.ts:538` | slot | Escolha um osso, um slot ou uma linha da folha | Escolha um osso, um desenho ou uma linha da folha |
| `panels/dopesheet.ts:1146` | slot | X existe no slot X, mas esta  | X existe no desenho X, mas esta  |
| `anim/sequence-key.ts:175` | slot | Este slot não está mostrando desenho nenhum neste instante. | Este desenho não está mostrando desenho nenhum neste instante. |

### Ficha — 5 textos

| Onde | Termo | Hoje | Proposta |
|:---|:---|:---|:---|
| `panels/properties-model.ts:1382` | slot | osso — ao longo do osso do slot | osso — ao longo do osso do desenho |
| `panels/properties-model.ts:1383` | slot | malha — de uma malha do mesmo slot | malha — de uma malha do mesmo desenho |
| `panels/properties-model.ts:1803` | slot | Slot do caminho | Desenho do caminho |
| `panels/properties.ts:1440` | slot | Não há slot para escolher. | Não há desenho para escolher. |
| `panels/regua-numeros.ts:104` | rig | Escala da física, em px por unidade, de 1 a +∞: quantos px valem 1 unidade de física, para o mesmo rig se mexer igual em arte 1x e 4x. Típic | Escala da física, em px por unidade, de 1 a +∞: quantos px valem 1 unidade de física, para o mesmo boneco se mexer igual em arte 1x e 4x. Típic |

### Ficha (partículas) — 2 textos

| Onde | Termo | Hoje | Proposta |
|:---|:---|:---|:---|
| `panels/particle-sheet.ts:193` | slot | Malha — nasce de uma malha do mesmo slot | Malha — nasce de uma malha do mesmo desenho |
| `panels/particle-sheet.ts:194` | slot | Malha: este slot não tem malha. Ponha uma malha no slot do emissor | Malha: este desenho não tem malha. Ponha uma malha no desenho do emissor |

### Ficha (regras) — 2 textos

| Onde | Termo | Hoje | Proposta |
|:---|:---|:---|:---|
| `panels/rules-model.ts:216` | slot | o slot "X" não existe | o desenho "X" não existe |
| `panels/rules-model.ts:293` | slot | O slot "X" não existe. | O desenho "X" não existe. |

### Ficha (peles) — 2 textos

| Onde | Termo | Hoje | Proposta |
|:---|:---|:---|:---|
| `panels/skins.ts:722` | slot | 1 slot vestido por esta skin | 1 desenho vestido por esta skin |
| `panels/skins.ts:723` | slot | X slots vestidos por esta skin | X desenhos vestidos por esta skin |

### Documento (nome do Desfazer) — 2 textos

| Onde | Termo | Hoje | Proposta |
|:---|:---|:---|:---|
| `doc/commands.ts:495` | slot | Adicionar slot | Adicionar desenho |
| `doc/commands.ts:583` | slot | Remover slot | Remover desenho |

### Ficha (avisos) — 1 textos

| Onde | Termo | Hoje | Proposta |
|:---|:---|:---|:---|
| `panels/warning-model.ts:130` | attachment,timeline | deform needs a vertex attachment; timeline ignored | A malha que esta chave deforma não existe nesta pele: a linha foi ignorada (timeline deform) |


FIM

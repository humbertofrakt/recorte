# A fila de 29/09 conferida contra o programa de hoje (v28.8) — 05/10/2026

Rodada 17, parte 1. Conferente: `CONFERINDO · rodada 17 — a fila de 29/09 contra o programa de hoje`.
**Nenhum código foi mexido** e **não li os testes**. Só usei o programa e fotografei.

| | |
|:---|:---|
| Fila | `documentos/planos/FILA dos defeitos 2026-09-29.md`: conferi as 79 linhas que a fila dava como abertas, a medir ou em obra (fila e "Do plano") |
| Versão montada | **v28.8** (o "Sobre" diz v28.8) |
| Como | `programa/` na porta 5324 · Chrome sem janela · mouse e teclado por protocolo · só 1920×1080 |
| Hora | 21h13 a 21h35 do relógio da máquina, 05/10/2026 |
| Fotos | `backup/fotos-obra/rodada-17/` (46), dos itens que ainda existem e de algumas provas |
| Material | o herói de exemplo (aberto pelo próprio programa) e, onde precisei de pasta, uma pasta em memória no lugar do seletor do Windows |

## O quadro

| Ainda existe | Já não existe | Não dá para provar sem janela | Não entendi o item | Não cheguei a conferir | Total |
|:---:|:---:|:---:|:---:|:---:|:---:|
| **28** (26 inteiros + 2 em parte) | **36** | **6** | **3** | **6** | **79** |

Uma linha da tabela pode juntar mais de um id da fila (os mesmos que a fila já juntava). **"Já não existe" quer dizer: refiz o gesto do item e o programa fez o certo, ou disse o que faltava.** Quase todo o grupo "já não existe" é de aviso de rodapé e de painel que cabe, que as rodadas de hoje consertaram.

## Os que ainda existem, do pior para o menor, por parte do programa

Dentro de cada parte, o pior primeiro (o que perde trabalho ou quebra a tarefa). É daqui que saem os lotes.

### P · a tela que cabe (tamanho e lugar)

| id | o defeito hoje | foto |
|:---|:---|:---|
| **K13 + K1b** | **Com os Detalhes da linha do tempo abertos, o painel da direita fica sem altura.** A lista de Animações mostra **uma linha só** (`idle`; `walk` e `attack` somem) e a aba Imagens mostra só o cabeçalho e uma miniatura. O boneco cabe, mas quem anima com a linha do tempo aberta perde a lista de animações de vista | K13_detalhes_aberto |
| **L12 + PL-30** | **Malha e pesos mora no grupo de baixo**, junto de Animações, Skins, Regras e Histórico: abrir uma aba esconde a outra. O plano pedia a Malha ao lado de Imagens e Pivôs | malha_painel |
| **PL-31** | A barra de ações **não tem botão Prévia**; a Prévia é só uma aba | PL22_descarte |

### G · animações, prévia e curvas

| id | o defeito hoje | foto |
|:---|:---|:---|
| **G-Q6** | **A aba Curvas esconde o tocador.** Onde ficavam ▶ ■ e o tempo, ficam só *Ajustar* e *Mostrar todas*: não se toca olhando a curva | GQ6_curvas |
| **K9 + G-Q5** | **Os sete botões do formato da curva** (*Suave, Entrada suave, Saída suave, Linear, Degrau, Passa do alvo, Recua e passa*) ficam **abaixo do gráfico, fora da tela**: y 1078 a 1217 numa tela de 1080. Só aparecem rolando | K9_curva_botoes |
| **G-Q4** | *Em parte.* Com `idle` aberto e tocando, a Prévia mostra o boneco **parado**; a camada 0 diz *"— nenhuma —"* e o texto *"Escolha uma animação na camada 0 para ver a mistura"*. Não segue a animação aberta | GQ4_previa_tocando |
| **G-Q7** | A aba Curvas, sem chave escolhida, só diz *"Passe o cursor sobre a área."* | GQ6_curvas |

### D · Árvore, malha e pesos

| id | o defeito hoje | foto |
|:---|:---|:---|
| **L2 (+L3)** | **Depois de "Pesos automáticos" a cena não muda e o rodapé só repete o nome do botão** (*"Pesos automáticos."*). O resultado (*"Pesos automáticos em 4 vértices."*) aparece num aviso azul no fim do painel e **fica ali também ao escolher outra imagem** (`shin`) | L2_pesos_automaticos · K10a_clicar_perna |
| **L5** | O painel *Malha e pesos* ainda é uma lista longa numa janela baixa: *Pesos* e *Pincel* ficam abaixo da dobra, só rolando | L2_pesos_automaticos |
| **L1a** | Abrir o grupo *Pincel* só mostra *Somar, Subtrair, Substituir…*: a ferramenta da barra segue *Malha* e o rodapé não diz nada | L1a_pincel2 |
| **L11b** | O painel de pesos não tem o passo *testar* nem diz como desfazer | L1a_pincel2 |
| **PL-25** | Editar → Pose não tem *Breakdown* (só copiar pose, copiar do escolhido, colar em todas, colar espelhado) | PL10_regras |

### E · arquivo, importar e exportar

| id | o defeito hoje | foto |
|:---|:---|:---|
| **N-16b** | **O diálogo *Exportar imagem* abre rolado**: o título e o campo *Animação* ficam escondidos acima | exportar_dialogo |
| **N-10** | O diálogo **não guarda a escolha da vez passada**: escolhi *Sequência de imagens PNG*, fechei sem exportar, reabri e voltou *GIF animado* | exportar_dialogo |
| **N-5** | O diálogo não mostra o que vai sair (só *"Nada foi desenhado ainda."*); o resumo só vem depois de exportar | exportar_dialogo |
| **N-8** | Ao terminar, o aviso lista *"Arquivos: heroi.gif"* mas **não diz em que pasta ficou** | N8_exportou |

### F · a cena e as ferramentas

| id | o defeito hoje | foto |
|:---|:---|:---|
| **J2** | **Base → *Virar filho de…* só anuncia o gesto**: *"Segure P: o que está pintado já é filho de arm_b. Clique para prender ou soltar"*. O item do menu não faz a troca | J2_virar_filho |
| **M15** | Num projeto novo, o botão direito na cena diz **"Não há ferramenta anterior para voltar"** (no herói, no vazio, diz *"Ferramenta: Transformar"*) | M13_estado |
| **N-4b** | Não há retângulo de recorte arrastável na cena: o campo *Recorte* só tem *automático* e *a área desenhada nesta animação* | N4b_recorte |

### I · exibição e peles

| id | o defeito hoje | foto |
|:---|:---|:---|
| **I8** | **A aba Exibição não dobra os grupos**: clicar em *MOSTRAR NA TELA* ou *A CENA* não faz nada, e *Cor do fundo* fica cortada embaixo | I8_exibicao |
| **M13** | Botão direito na imagem → *Em todas as skins*: **clicar deixa o rodapé em "Arquivo salvo."** (a dica explica ao passar o mouse; o clique segue mudo) | M13_em_todas |
| **M10** | As **sete ações da aba Skins são ícones sem texto** (+, copiar, pasta, pasta aberta, salvar, carimbo, lixeira) | peles_aba |
| **M12a** | *Em parte.* Apagar skin pergunta uma vez (*"Ela veste 1 slot(s)…"*). Não consegui apagar a `armadura`, de que a capa depende, para ver se cita quem depende: a lixeira age sobre a skin com o lápis aceso | M12a_apagar_pele |

### B · Propriedades e ficha

| id | o defeito hoje | foto |
|:---|:---|:---|
| **D2** | Escolher o evento `step` na Árvore **mostra a ficha da Base**; a ficha do evento (*Chave de evento, Definição do evento*) mora no **fim de Propriedades** | D2_evento_ficha |

### C · a aba Regras

| id | o defeito hoje | foto |
|:---|:---|:---|
| **PL-10** | A aba Regras tem **doze botões de ícone soltos** (+, lixeiras, olho…), sem o *Novo ▾* que o plano pedia | PL10_regras |

### A · a casca (menus, janelas, arquivo)

| id | o defeito hoje | foto |
|:---|:---|:---|
| **PL-21** | Ajuda → Atalhos lista menus, Ferramentas e Cena; **não há a seção dobrada com as teclas de painel** | PL21_atalhos |
| **J11** | As boas-vindas dizem *"Arquivo → Abrir pasta…"*; o menu diz *"Abrir pasta do projeto…"* | menu_arquivo |

**Achado novo, que a fila não tem** (visto de passagem; *não repeti para confirmar*): depois de tirar a skin ativa pelo **×** da pilha, o `Ctrl+Z` desfez o passo de antes (*"Desfeito: Chavear ângulo"*) e a skin continuou desligada; despir a skin parece não entrar no Desfazer. Foto `peles_depois`. Vale a pergunta ao dono das peles (I).

## Os cinco piores que ainda existem

| # | Id | Por quê |
|:---:|:---|:---|
| 1 | **K13 + K1b** | animar com os Detalhes abertos deixa a lista de animações de uma linha só |
| 2 | **G-Q6** | a aba Curvas esconde o tocador |
| 3 | **K9 + G-Q5** | os botões do formato da curva ficam fora da tela |
| 4 | **L2 + L5** | Pesos automáticos não muda a cena nem diz o resultado no rodapé, e o painel de pesos fica abaixo da dobra |
| 5 | **J2** | *Virar filho de…* só diz "Segure P" |

## A tabela completa

Uma linha por item da fila, na ordem em que conferi. **Foto só nos que ainda existem.** Para repetir: o id e o que vi dizem o gesto.

| id | estado | o que vi | foto |
|:---|:---|:---|:---|
| J10+M9 | já não existe | Sobre diz v28.8 | — |
| J11 | ainda existe | boas-vindas dizem "Arquivo → Abrir pasta…"; o menu diz "Abrir pasta do projeto…" | menu_arquivo |
| K4 | já não existe | rodapé diz "Próximo: …" depois de cada passo | — |
| N-15 | já não existe | um clique em Arquivo abre o menu | — |
| J14 | já não existe | Salvar de projeto novo pede a pasta e grava com o nome da pasta (não "sem nome") | — |
| J18 | não entendi o item | o item fala de três itens no Arquivo e "o certo é o último": hoje há Abrir projeto…, Abrir recente… (apagado) e Reabrir o fechado, e não sei qual era o errado | — |
| J9 | já não existe | Ângulo -90 digitado em osso com IK: rodapé diz "arm não girou: a regra ik_arm manda nele. Desligue o olho dela na aba Regras" | — |
| K8 | já não existe | ficha mostra "90,04" e "base 90" | — |
| K3 | já não existe | rodapé "Chave em 1,93 s: Rotação de torso" | — |
| K16b | já não existe | criar chave não abriu os Detalhes | — |
| K13 | ainda existe | com Detalhes abertos a lista de animações fica de uma linha e Imagens de uma fileira | K13_detalhes_aberto |
| K1b | ainda existe | com Detalhes abertos o painel direito sem altura (Imagens, Animações de uma linha) | K13_detalhes_aberto |
| K17+J17 | já não existe | Ângulo à vista com Detalhes abertos | — |
| L15 | já não existe | herói abre inteiro, cabeça dentro | — |
| J15 | já não existe | aba Imagens mostra três fileiras | — |
| I8 | ainda existe | Exibição: grupos não dobram (clicar no título não faz nada) e Cor do fundo corta | I8_exibicao |
| G-Q4 | ainda existe, em parte | Prévia com idle aberto e tocando mostra o boneco parado; camada 0 "— nenhuma —" e o texto "Escolha uma animação na camada 0" | GQ4_previa_tocando |
| M7 | já não existe | × da skin diz "Skin default desligada: saíram 23 desenhos…" | — |
| M10 | ainda existe | sete ícones sem texto na aba Skins | peles_aba |
| M18 | já não existe | menu Skins tem Nova skin e Fazer a skin de uma pasta | — |
| M19 | já não existe | Feitas e Ativas cabem | — |
| M16 | já não existe | Imagens e Skins à vista juntas | — |
| L4 | já não existe | Virar malha diz "virou malha: 4 vértices…" | — |
| L2 (+L3) | ainda existe | Pesos automáticos: cena não muda e rodapé só diz "Pesos automáticos." | L2_pesos_automaticos |
| L6 | já não existe | Criar aresta apagado com dica "Escolha dois vértices" | — |
| L9 | já não existe | osso do pincel se liga clicando nos ossos na cena | — |
| L5 | ainda existe | painel Malha e pesos: Pesos fica abaixo da dobra; rola | L2_pesos_automaticos |
| M15 | ainda existe | no herói, botão direito no vazio diz "Ferramenta: Transformar"; mas num projeto novo, botão direito na cena diz "Não há ferramenta anterior para voltar" (reproduz) | M13_estado |
| K10a+K10b | já não existe | clicar na perna escolhe a imagem shin, a Árvore rola até ela e o painel diz "shin (slot shin_front)" | — |
| J2 | ainda existe | Base → Virar filho de… só diz "Segure P: o que está pintado já é filho de arm_b. Clique para prender ou soltar" (anuncia o gesto, não age) | J2_virar_filho |
| F-p18 | já não existe | Alt+arrastar no vazio não troca a ferramenta (segue Transformar) | — |
| G-Q6 | ainda existe | aba Curvas esconde o tocador: no lugar dele só "Ajustar" e "Mostrar todas" | GQ6_curvas |
| G-Q7 | ainda existe | Curvas sem chave escolhida só diz "Passe o cursor sobre a área." | GQ6_curvas |
| K9+G-Q5 | ainda existe | os sete botões do formato da curva (Suave … Recua e passa) ficam abaixo do gráfico, fora da tela (y 1078 a 1217 numa tela de 1080) | K9_curva_botoes |
| K16a+A2-2 | já não existe | na aba Linha do tempo o tocador fica à vista com os Detalhes abertos | — |
| A2-3 | já não existe | "Repetir a última exportação" cabe numa linha no menu, sem quebrar a palavra | — |
| N-16b | ainda existe | o diálogo Exportar imagem abre rolado: o título e o campo Animação ficam escondidos acima | exportar_dialogo |
| N-10 | ainda existe | escolhi "Sequência de imagens PNG", fechei sem exportar e reabri: voltou "GIF animado" | exportar_dialogo |
| N-5 | ainda existe | o diálogo não mostra o que vai sair (só "Nada foi desenhado ainda."); o resumo vem depois de exportar | exportar_dialogo |
| N-4a | já não existe | o diálogo traz o campo Recorte com opções (automático / área desenhada) e explicação | — |
| N-8 | ainda existe | ao terminar, o aviso lista "Arquivos: heroi.gif" mas não diz em que pasta ficou | N8_exportou |
| N-13 | já não existe | o aviso final usa palavras comuns (Animação, Trecho, Quadros, Tamanho de cada quadro) | — |
| PL-10 | ainda existe | a aba Regras tem doze botões de ícone soltos (+, lixeiras, olho…), sem "Novo ▾" | PL10_regras |
| PL-25 | ainda existe | Editar → Pose só tem Copiar pose, Copiar do escolhido, Colar em todas, Colar espelhado: sem Breakdown | PL10_regras |
| PL-21 | ainda existe | Ajuda → Atalhos lista menus, Ferramentas e Cena; não há seção dobrada com as teclas de painel | PL21_atalhos |
| PL-22 | não dá para provar sem janela | Novo projeto com mudança não salva: nenhuma janela própria apareceu e nada mudou; se é a caixa do navegador, a máquina sem janela não mostra | — |
| R1a+J16+R1b+A2-4 | já não existe | o rodapé de baixo mostra os três campos inteiros em 1920×1080 | — |
| L12 | ainda existe | Malha e pesos e Animações são abas do mesmo grupo: abrir uma esconde a outra | malha_painel |
| PL-30 | ainda existe | a aba Malha e pesos mora no grupo de baixo (com Animações/Histórico), não junto de Imagens e Pivôs | malha_painel |
| PL-31 | ainda existe | a barra de ações não tem botão Prévia; a Prévia é uma aba | PL22_descarte |
| PL-20 | já não existe | campos Rajadas e forma Linha aparecem na ficha do emissor (rodada 32) | — |
| PL-19 | já não existe | a ficha do emissor cabe: abas de ícone, sem rolar | — |
| D1+B3 | já não existe | escolher o parâmetro lookX abre a ficha dele no alto de Propriedades; "Compensar" não cobre | — |
| D2 | ainda existe | escolher o evento "step" na Árvore mostra a ficha da Base; a ficha do evento (Chave de evento, Definição) fica no fim de Propriedades | D2_evento_ficha |
| M17+M11 | já não existe | Exportar skin gravou armadura_capa.bone e Importar leu o arquivo: disse "a skin já existe nesta base. Apague ou renomeie… Nada mudou" (não recusou o arquivo) | — |
| M12a | ainda existe, em parte | Apagar a skin pergunta uma vez ("Ela veste 1 slot(s)…"); não consegui apagar a "armadura" (de que a capa depende) para ver se avisa de quem depende, porque o lixo age sobre a skin com o lápis aceso | M12a_apagar_pele |
| J8 | já não existe | ao pôr a imagem na cena o rodapé diz "Para prender num osso: com ela escolhida, crie o osso — ele pega o desenho" (é outro gesto que o da Árvore, mas a dica existe) | — |
| H2+J6+H-Q9 | não entendi o item | é a pergunta ao Humberto (o pivô recoloca o desenho ou o deixa parado); não é defeito a conferir | — |
| J1 | já não existe | salvei, abri só o .bone e as imagens voltaram; o rodapé também diz que gravou o atlas ao lado | — |
| M13 | ainda existe | botão direito na imagem → "Em todas as skins": clicar só deixa o rodapé em "Arquivo salvo." (a dica explica ao passar o mouse) | M13_em_todas |
| M20 | já não existe | Skins → Trocar imagem nas skins… tem dica que diz a condição ("Com um desenho escolhido…"); habilita ao escolher a imagem | — |
| L1a | ainda existe | abrir o grupo Pincel só mostra Somar/Subtrair/…; a ferramenta da barra segue Malha e o rodapé não diz nada | L1a_pincel2 |
| L11b | ainda existe | o painel de pesos tem Pesos automáticos, Suavizar, Podar, Chavear, Tirar e Pincel; nenhum passo "testar" nem aviso de como desfazer | L1a_pincel2 |
| C2 | não dá para provar sem janela | abrir pasta levou menos de 3 s com a minha pasta em memória; os 5 a 6 s dependem de pasta de verdade | — |
| E6 | não dá para provar sem janela | não há projeto grande do Spriter na máquina de prova | — |
| E3b | não dá para provar sem janela | não há pasta com .scml na máquina de prova | — |
| N-11 | não dá para provar sem janela | WebM de 2 s: não consigo medir a duração do vídeo sem tocá-lo | — |
| N-7 | já não existe | PNG em sequência: o rodapé diz "60 quadros de 114x242, 1 .zip com 60 PNG" (bate com o que saiu) | — |
| J5+M4 | já não existe | arrastar a miniatura da aba Imagens para a cena não deu erro: a imagem entrou solta e o rodapé disse o que fazer | — |
| PL-15 | já não existe | Malha e pesos tem grupos que dobram (Avançado, Pincel) e a aba rola | — |
| PL-29 | já não existe | Malha, peles, pivô e "No fim" têm item de menu (Malha e regras → Malha ▸, Skins, Imagens → Definir pivô, Animação → No fim ▸) | — |
| K18 | não entendi o item | Ctrl+C e Ctrl+V com uma imagem escolhida não disseram nada e nada mudou; não sei o que o item pedia que colasse | — |
| N-9 | não cheguei a conferir | "Repetir a última exportação" repetiu o aviso da exportação anterior; não consegui separar se gravou de novo | — |
| M12b | não cheguei a conferir | não achei um arquivo com aviso em inglês para abrir | — |
| L7 | não cheguei a conferir | não conferi (precisa desenhar uma aresta à mão) | — |
| L8 | não cheguei a conferir | não conferi: a tela perdeu a escolha da malha antes do arrasto | — |
| PL-14 | não cheguei a conferir | não conferi (caminho ganha ponto pela cena) | — |
| PL-17 | não cheguei a conferir | "em obra": o item é a conferência de cada import/export com arquivo de verdade; não é gesto de uso | — |
| C3 | não dá para provar sem janela | é a queda do roteiro, não do programa | — |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| Seletor de pasta e de arquivo do Windows | pasta em memória (heroi, espada, poder5) | Salvar/Abrir numa pasta de verdade; `C2` (5 a 6 s) e `E3b` (.scml) |
| Recarregar a página com mudança não salva | tirei o aviso do navegador com uma linha de código, só para reiniciar a prova | só o reinício |
| Caixas do navegador (confirm) | a máquina sem janela não mostra | `PL-22`: nada apareceu ao pedir Novo projeto com mudança não salva |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
| Itens sem gesto de uso | `E6` (projeto grande do Spriter), `N-11` (duração do WebM), `C3` (roteiro) | — |

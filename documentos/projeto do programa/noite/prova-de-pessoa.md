# A prova de pessoa — 05/11/2026

Ramo `obra/recorte-na-cena`, sobre `obra/noite-2026-11-04` (7c21fe0).

Uma pessoa que **nunca abriu o Recorte**, de ponta a ponta, no editor **montado** (`npm run editor:build`, servido pelo `programa/servidor.mjs`).
Só clica no que está à vista: menus e botões pelo texto, a cena, a Árvore, a ficha, o teclado.

Script: `ferramentas/provas/prova-de-pessoa.mjs`. Resultado: **16 passos PASSOU, 0 FALHOU, 6 atritos.**

## O caminho

| # | A pessoa faz | Por onde | Deu? |
|:---:|:---|:---|:---:|
| 1 | abre o programa | — | sim |
| 2 | abre o herói | botão **Abrir o herói** das boas-vindas | sim |
| 3 | toca | clica em **idle** na aba Animações, depois **▶** | sim, depois do conserto (atrito 1) |
| 4 | muda uma pose | arrasta o braço na cena; depois **torso** na Árvore e o **Ângulo** na ficha | sim (atrito 2) |
| 5 | animação nova | **Animação → Nova animação**, escreve "aceno", Enter | sim |
| 6 | 1 s | **Animação → Mudar duração…** | sim |
| 7 | 3 chaves | Ângulo em 0 s; clica na régua em **0,50 s**; **⏭**; Ângulo em 1 s | sim: `[0, 0.5, 1]` no arquivo |
| 8 | exporta GIF | **Arquivo → Exportar → GIF, PNG, folha, vídeo…**, **Exportar** | sim |
| 9 | salva | **Arquivo → Salvar** | sim, **sem as imagens** (atrito 5) |
| 10 | reabre | **Arquivo → Abrir projeto…** | sim, com **42 avisos** (atrito 6) |

## Os atritos

Onde a pessoa não saberia o que fazer, ou leria uma palavra que não é dela.

| # | Onde | O que a pessoa vê | De quem | Fiz |
|:---:|:---|:---|:---|:---|
| 1 | logo depois de **Abrir o herói** | o ▶ está **cinza**, e nada diz por quê: o motivo só está na dica do botão. O rodapé dizia *"Abriu a base. Sem mudanças por salvar."* | casca | **consertei**: o rodapé diz *"Para ver o herói se mexer, clique em idle na aba Animações e aperte ▶"* |
| 1b | o mesmo ▶ | um botão cinza não responde ao clique; o porquê some | Linha do tempo | **tabela**: deixar o ▶ aceso na base, e o clique dizer no rodapé *"Abra uma animação para tocar"* |
| 2 | arrastar o braço, ou girar a cabeça | *"arm não girou: a regra ik_arm manda nele"*. O rodapé explica; o herói tem regra em quase todo membro | — | nada: a frase guia. Anotado: o exemplo é difícil para o primeiro gesto |
| 3 | clicar no osso na **Árvore** | o rodapé não muda: não diz *"Escolheu torso"* | Árvore | **tabela** |
| 4 | **Mudar duração** com o mesmo valor | a janela fecha e o rodapé não diz nada | Linha do tempo | **tabela**: dizer *"aceno já dura 1,00 s"* |
| 4b | a chave em **1 s** | a régua à vista vai até **0,90 s**: o fim da animação de 1 s fica fora; só o **⏭** (ícone, com a dica "Fim") chega lá | Linha do tempo | **tabela**: a régua caber a animação inteira, ou o fim ter número à vista |
| 4c | **Exportar** a animação "aceno" | o arquivo sai **heroi.gif**: o nome é o do boneco, e duas exportações seguidas se pisam na pasta de downloads | Arquivo, exportar | **tabela**: `heroi-aceno.gif` |
| 5 | **Salvar** (no navegador sem seletor de pasta) | baixam só `heroi.bone` e `manifest.json`. **As imagens do herói não vão junto** (`heroi.atlas.json` e o png). O rodapé diz *"O manifesto do projeto baixado: salve o .bone dentro da pasta do projeto para ir junto"*: a palavra **manifesto**, e não diz que o `.bone` baixou | Arquivo, exportar | **tabela** — o mais grave da noite |
| 6 | **Reabrir** o que foi salvo | o herói volta **sem imagem nenhuma** (só ossos), e o rodapé mostra **42 avisos**: *"Esta base usa heroi.atlas.json, que mora na pasta do projeto, e ela veio sozinha"* | Arquivo, exportar | **tabela** (é o atrito 5 visto do outro lado) |

**Sobre o 5 e o 6.** O robô usa o navegador sem o seletor de pasta, e por isso o Salvar cai no download — o caminho do Firefox. No Chrome do Humberto, o Salvar pede a pasta e grava a folha de imagens junto. Mesmo assim: quem salvar pelo download perde as imagens do herói em silêncio. A prova de pessoa no Chrome com pasta é da mão do Humberto.

## Prova de que o defeito 1 existia (regra 26)

A primeira volta da prova, no editor montado antes do conserto, leu no rodapé: *"Abriu a base. Sem mudanças por salvar."* — e o ▶ com `disabled`.
O primeiro conserto saiu **cortado**: o rodapé encolhe a frase até caber (`ui/shell-status.ts`), e *"O herói abriu na base, a pose de montar. Para vê-lo se mexer: …"* aparecia como *"O herói abriu parado, na base"*. A frase de agora não tem ponto nem dois-pontos, e o teste confere que ela sai inteira (`cena.test.ts`, *"prova de pessoa"*).

## Fecho

| Prova | Resultado |
|:---|:---|
| `node ferramentas/provas/prova-de-pessoa.mjs` (editor montado) | 16 PASSOU, 0 FALHOU, 6 atritos |
| `npx vitest run` (01h09 UTC) | 5.897 verdes, 31 pulados, 1 vermelho: o conhecido do manual |
| `npx tsc --noEmit -p editor/tsconfig.json` | limpo |
| `node ferramentas/conformidade.mjs` | 132 de 132 (a base cresceu) |

## Atritos da cena com o herói aberto (01h15 UTC)

| # | Onde | O que a pessoa via | Fiz |
|:---:|:---|:---|:---|
| 7 | arrastar um osso **na cena**, numa animação | o rodapé dizia só *"Mover X 8,3 px · Y 0 px"*: a chave que nasceu não aparecia. Pela ficha ele dizia *"Chave em …"* | **consertei** (`viewport/gesture-notice.ts`): a chave vai na frente — *"2 chaves em 0,00 s: Posição X de torso, Posição Y de torso. Mover …"*. Provado no navegador, com e sem o conserto; 4 testes em `cena.test.ts` |
| — | clique no vazio, Esc, roda do mouse, botão direito, Delete, letras das ferramentas | tudo responde, e o rodapé diz | nada a fazer |
| — | todo botão, campo e aba à vista | varredura da página: nenhum sem nome ou dica | nada a fazer |
| 9 | o herói aberto, na cena | dois tracejados **quase da mesma cor** (o recorte `#ff00c8` e a máscara `#d6008c`), e nenhum diz o que é: eu mesmo confundi os dois nas fotos | **consertei**: cada um tem o nome escrito — *"recorte 143 × 265 px"* e *"máscara mask"* (`viewport-draw.ts`, 2 testes) |
| 10 | `cena.test.ts`, *"escolher vem antes de criar"* | o teste dizia que o primeiro botão é o Selecionar, e passava só porque o Transformar não estava carregado (regra 28) | **consertei** o teste: Transformar, depois Selecionar |
| 11 | apertar **7** (ou 8, 9, 0) com o foco na cena | os ossos somem (ou travam) **calados**: quem apertou sem querer não sabe a volta. Os botões do alto já falavam | **consertei**: a cena diz a mesma frase — *"Ossos escondidos. 7 traz de volta"* (2 testes) |
| 12 | **Selecionar**, arrastar um retângulo | escolhia **calado**: o Delete seguinte apagava o que a pessoa nem sabia que tinha pegado | **consertei**: *"14 itens escolhidos pelo retângulo: Delete apaga, Esc tira a escolha"*; vazio: *"Retângulo vazio: arraste por cima das peças"* |
| 13 | **Malha** e **Pesos**, clique sem nada escolhido | nada acontecia, e nada dizia | **consertei**: *"Malha sem desenho escolhido: clique nele com Selecionar (Q)…"*, *"Pesos sem malha escolhida: …"* |
| 14 | o rodapé apertado | quando a frase não cabe, ele mostra só o que vem **antes dos dois-pontos** (`ui/shell-status.ts`): a primeira versão das frases acima aparecia como só *"Malha"*, e a do recorte como só *"Recorte"* | **regra para quem escreve frase de rodapé: o essencial antes dos dois-pontos.** Reescrevi as minhas (recorte, chave do arrasto, Malha, Pesos, retângulo) e as da casca (efeitos: *"Flash gravado: …"*), com teste da versão menor. **Régua nova** em `menus.test.ts`: nenhum `notice` de `ui/` e `viewport/` com uma palavra só antes dos dois-pontos (no código de antes ela acha 6) |
| 15 | varredura: cada item de **Editar**, **Base** e **Exibir**, clicado com o herói aberto (idle, torso escolhido) | **calados** (o rodapé não muda, nenhuma janela abre): **Editar → Colar posição no osso** (sem nada copiado), **Base → Copiar a ordem na animação**, **Editar → Renomear** (abre o campo na Árvore, mas o rodapé não diz onde) | **tabela**: Árvore (os dois de Editar) e Ordem |
| 8 | a grade do botão direito | *"Laranja: a de agora"* e *"fonte: pasta · todas · objeto"*: **objeto** não diz o que é | Imagens e pasta: **tabela** |

## Achado para quem cuida da suíte (regra 24)

Com a pasta `backup/` presente — mesmo só com a saída do `npm run editor:build`, que grava em `backup/editor-build` —, **5 testes ficam vermelhos**:
`arvore` e `paineis` (*"o defeito EXISTIA"* do emissor), `folha-animada` (*"o leitor antigo jogava fora a direção"*) e dois de `validador-rascunho-0-2`.
Sem a pasta, passam. Eles leem cópias antigas em `backup/` e só se pulam quando a pasta **não existe**. Quem montar o editor num clone vê vermelho que não é defeito.
Não mexi: são de outras partes.

## A prova final, sobre a integração (03h37 UTC)

Script: `ferramentas/provas/prova-de-pessoa-final.mjs`, sobre `a430d0d` + os consertos deste ramo. **13 PASSOU, 0 FALHOU, 4 atritos.**

| # | A pessoa faz | Deu? |
|:---:|:---|:---:|
| 1 | boas-vindas → **Abrir a oficina** | sim; o rodapé diz por onde começar |
| 2 | **walk** → ▶ | sim, com a motosserra na mão |
| 3 | **Bases → mecha** | sim: o herói está na cabine (*"cabine · piloto"* na Árvore) |
| 4 | **Skins → Guarda-roupa**, **Vestir só esta** na coluna armadura | sim: *"Vestida: armadura"* |
| 5 | **Bases → cavaleiro**, **Animação → Animações de outro boneco…**, heroi, **Usar as animações** | sim: *"3 animações de heroi, ligadas"* |
| 6 | **Quero fazer…** "arma" | sim: *"Pôr uma arma na mão"*, com os passos |
| 7 | **Arquivo → Exportar → GIF** | sim: `heroi.gif`, 152 × 242 |

| Atrito | De quem | Fiz |
|:---|:---|:---|
| **Bases → mecha** ficava no zoom do herói (216%), o mecha meio fora da cena e o ícone da cabine quase na régua | Cena | **consertei**: trocar de base ajusta a vista (216% → 106%) |
| a **barra de menus** em 1024 px: Exibir, Janela e Ajuda fora da tela | casca | **consertei**: 0 menu fora em 1024, 1280, 1366 e 1920 |
| **Bases → mecha**: o rodapé fica *"Sem mudanças por salvar."*; o *"Base de mecha"* do `openBody` não chega à vista (conferido: também sem o meu Ajustar) | Animações | **tabela** |
| depois do Guarda-roupa, a aba **Skins** fica na frente da aba Animações, e a lista **Bases** some de vista: a pessoa precisa achar a aba | Skins / casca | **tabela** — o Guarda-roupa podia devolver a aba de antes ao fechar |
| **Animações de outro boneco** → Usar: logo depois, **82 avisos** (47 iguais) no rodapé, e as animações ligadas não aparecem na lista do cavaleiro à vista (só *"Só compartilhadas, abaixo."* e as do esqueleto padrão) | Animações / reaproveitar | **tabela** |
| o rodapé da **Oficina aberta** sai cortado com *"…"* (a frase é longa e não tem dois-pontos cedo) | Oficina | **tabela**: o essencial antes dos dois-pontos (#14) |

FIM


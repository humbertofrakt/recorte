# Skins — o desenho de uso (noite de 04 para 05/11/2026)

Executor: **Skins** (ramo `obra/skins`).
A pergunta do Humberto: *"o que eu pedia não aparecia na tela"*.
Aqui: o que travou, o que os outros fazem, e o que muda.

---

## 1. O diagnóstico — uma pessoa nova, só clicando

Robô: Playwright, Chromium sem janela, 1440×900.
Só cliques no que se vê: texto de botão, item de menu, ícone com dica.
Herói aberto pelo botão **Abrir o herói** das boas-vindas.

| # | Objetivo | Conseguiu? | Onde travou |
|:-:|:---|:-:|:---|
| a | Roupa nova "ferro", trocando 3 peças | **meio** | Ver T1 a T4 |
| b | Ver duas roupas lado a lado, e alternar | **não** | T5, T6 |
| c | Combinar armadura + capa | sim | T7 |
| d | Mandar a roupa para outro boneco | sim | T8 |
| e | Skin de fora que troca a cabeça por capacete | **não** | T9 |

### As travas

| # | O que aconteceu | Tipo |
|:-:|:---|:---|
| T1 | Depois de **Nova skin**, a aba diz *"Arraste uma imagem da aba Imagens para a cena: ela nasce nesta skin"*. Isso **cria** peça nova. Eu queria **trocar** uma peça que já existe. | palavra errada |
| T2 | Trocar uma peça só se faz assim: achar a peça na Árvore, clicar, ir em Propriedades, clicar na **Imagem**, escolher. Nada na aba Skins leva lá. | sem porta |
| T3 | A lista de imagens diz *"Trocar a imagem de body"*. **Não diz em que skin** a troca vai cair. Só o rodapé conta, depois. | não entendi |
| T4 | Na Árvore, osso e peça têm o mesmo nome (`hair`, `arm`). Clicar no nome pega o osso, e a ficha não tem Imagem. A peça `weapon` estava fechada dentro do osso. | não achei |
| T5 | Não há jeito de ver duas roupas lado a lado. Nem uma miniatura por skin. | sem porta |
| T6 | Alternar = arrastar entre **Feitas** e **Ativas**, ou olho + ×. Não há "vestir só esta". O lápis, o olho e o × são três ícones para três ideias. | não entendi |
| T7 | O olho em **Feitas** liga a capa por cima. Funciona. Mas "Feitas" e "Ativas" não são palavras de quem veste boneco. | palavra |
| T8 | **Arquivo → Exportar → Skin, para outro boneco…** grava *a skin do lápis*. Se o lápis está noutra, sai a errada. **Arquivo → Importar → Skin, de outro boneco…** traz. Funcionou. | ok |
| T9 | Escolhi `capacete-skin.bone` **e** `capacete.png` juntos. A skin entrou, a imagem **não**: a cabeça sumiu e vieram 2 avisos. | defeito |

Fotos: `fotos-skins/antes-1-aba-skins.png`, `antes-2-trocar-pela-ficha.png`,
`antes-3-capacete-sem-imagem.png`.

---

## 2. O que os outros programas fazem

| Programa | Onde se troca a roupa | O que se aprende |
|:---|:---|:---|
| **Spine** | Vista *Skins* na árvore. Cada skin com um olho. Uma pasta *placeholder* por peça; o que entra nela vale para a skin **ativa**. | A skin ativa é a que se edita. Uma ideia só. |
| **Spriter** | Janela *Character Maps*. Escolhe-se o mapa; à esquerda a imagem original, à direita a que entra no lugar. Mapas se empilham. | Uma **lista peça → imagem**, por mapa. Ninguém mexe na árvore. |
| **Jogos com troca de roupa** (criador de personagem) | Uma **grade**: as partes do corpo de um lado, as opções do outro, com miniatura. Um boneco grande ao lado mostra o resultado na hora. | Ver **antes** de vestir. Passar o mouse = provar. |

---

## 3. As palavras

| Na tela | Por quê |
|:---|:---|
| **Skin** | O Humberto usa "skin". O menu já se chama **Skins**. Fica. A dica explica: *"skin é uma roupa: as peças trocam de imagem"*. |
| **Guarda-roupa** | A janela nova da grade. Nome de casa, não de programa. |
| **Peça** | O slot. Quem veste não pensa em "slot". |
| **Vestida** | Era "Ativa". A skin que está na tela. |
| **Todas** | Era "Feitas". |
| **Vestir só esta** | Tira as outras e veste esta. Um clique. |
| **Por cima** | Liga esta junto, por cima das vestidas (armadura + capa). |
| **Igual à base** | A skin não mexe nesta peça (era "Ignorar"). |
| **Esconder** | A peça some com esta skin vestida. |
| **Nova a partir desta** | Era "Clonar". |

O lápis continua na aba. No Guarda-roupa ele não aparece:
**a coluna em que você clica é a que muda.** Uma ideia, não duas.

---

## 4. O caminho mais curto, para cada objetivo

| # | Objetivo | Cliques |
|:-:|:---|:---|
| a | Roupa nova, 3 peças | Skins → **Guarda-roupa…** · **+ Nova skin** (nome) · clique na casa *peça × skin* · clique na imagem nova. ×3 |
| b | Ver lado a lado e alternar | No Guarda-roupa, cada coluna tem **o boneco inteiro** vestido com ela. Passar o mouse **prova** na cena. **Vestir só esta** alterna |
| c | Combinar | **Por cima** na coluna da capa |
| d | Mandar para outro boneco | **Levar…** na coluna (grava o `.bone` da skin). No outro boneco: **Trazer skin de fora…** |
| e | Capacete de fora | **Trazer skin de fora…**, escolhendo o `.bone` **e** a imagem juntos. A imagem entra junto |

---

## 5. As telas

### O Guarda-roupa

```
┌ Guarda-roupa ── peça × skin ──────────────────────────────── [Fechar] ┐
│ Cada coluna é uma skin. Clique numa casa para trocar a imagem         │
│ daquela peça naquela skin. Mouse em cima da coluna: prova na cena.    │
│ [+ Nova skin]  [Trazer skin de fora…]                                 │
├─────────┬────────────┬────────────┬────────────┬──────────────────────┤
│         │  default   │  armadura  │  ferro     │                      │
│         │  [boneco]  │  [boneco]  │  [boneco]  │   ← miniatura        │
│         │ ● vestida  │ [Vestir só]│ [Vestir só]│                      │
│         │            │ ☐ por cima │ ☑ por cima │                      │
│         │            │ [Nova a p.]│ [Levar…]   │                      │
├─────────┼────────────┼────────────┼────────────┤                      │
│ body    │  [img]     │  [img]     │  [img]     │                      │
│ head    │  [img]     │   = base   │  [img]     │  "= base": não mexe  │
│ hair    │  [img]     │   = base   │  oculta    │                      │
└─────────┴────────────┴────────────┴────────────┴──────────────────────┘
```

Clique numa casa abre a escolha, embaixo da grade:

```
 Trocar  body  na skin  "ferro"                       ← diz a skin
 [img][img][img][img][img][img] ...
 [Igual à base]  [Esconder]
```

### A aba Skins (o que muda)

```
 [+][⧉][📁][⬆][⬇][⭱][🗑]
 [ Guarda-roupa: peça × skin… ]     ← botão com texto
 Vestida: ferro · Editando: ferro   ← uma linha que diz o estado
 TODAS               VESTIDAS
```

---

## 6. O que NÃO muda

- O formato `.bone`. Nenhum campo novo (regra 7).
- O lápis, o arrasto, o olho e o × da aba continuam: quem já usa não perde nada.
- Desfazer: toda troca no Guarda-roupa é um passo do `Ctrl+Z`. A prova é só olhar (passar o mouse), e não entra no desfazer.

## 7. Decisões tomadas sozinho (sem perguntar)

| Decisão | Por quê |
|:---|:---|
| Palavra "skin" fica | Ele usa. Trocar agora confunde mais. |
| Guarda-roupa é uma **janela**, não a aba | A aba tem 260 px. A grade precisa de largura. Spriter faz igual (janela própria). |
| Clicar numa casa **veste** a coluna e põe o lápis nela | Mudar uma roupa que não está na tela é pintar no escuro. |
| A grade mostra a peça pelo desenho de partida dela | Peça com várias imagens (mão aberta/fechada) mostra a de partida. As outras: Propriedades, como antes. |

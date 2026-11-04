# Manual do Recorte

Também em inglês: [English](en/README.md)

O Recorte anima desenhos 2D por ossos, para jogos.

Este manual é para quem **usa** o programa. Não é a especificação do formato.
A especificação está em `formato/ESPECIFICACAO 2026-09-17.md`.

---

## 07/10/2026 — o manual alcança a v36.5

O manual de 15/09 ficou para trás: o programa andou muito desde então.
Na **versão v36.5**, os capítulos são conferidos de novo **no código**.
O 8 e o 9 já foram. O 10 é novo, escrito do código.

| O que | Quer dizer |
|:---|:---|
| **existe** | está no programa hoje, com o gesto escrito |
| **existe diferente** | está, mas não do jeito que o capítulo pedia |
| **falta** | ainda não está |
| **muda com as bases** | depende do modelo de bases e entidades |
| **não confirmei** | o capítulo diz, e ninguém conferiu no código |

Cada capítulo fecha com a tabela de **selo**. O que era guia e já foi
entregue virou **existe**.

### O que mudou nos capítulos 8 e 9

| Capítulo | O que mudou |
|:---|:---|
| 8 | O **leitor do Construct 3** (desde 05/10) e o **leitor do Godot**. O menu **Arquivo → Exportar** com os nomes novos. **Entregar uma base…**. Abrir, Salvar, a janela de mudanças não salvas e o **Reabrir o fechado**. **Só este quadro** e o `.zip` na exportação de imagem. O validador lê `.bonez` |
| 9 | A tabela do Spriter conferida tecla a tecla. Entraram: pivô por imagem, guias, trocar de pai na animação, `Ctrl+←` `Ctrl+→`, `Ctrl` + arrastar para clonar, escolher filhos e pais, skins em **Feitas** e **Ativas**. Criar osso agora é `B`. Importar pede **a pasta** do projeto |

### 15/09/2026 — a espinha nova

*"tem um manual escrito, ele foi baseado na versão antiga. O que estamos
fazendo é criar o manual guia para a NOVA versão do programa."* — o Humberto.

A espinha é **corpos · animações · entidades**, o modelo novo do programa
(capítulo 2). No programa, "corpo" se chama **base**, e "pele" se chama
**skin**.

## Por onde começar

| Você é | Comece em |
|:---|:---|
| Nunca abriu o Recorte | **[0. Abrir o Recorte](00-abrir-o-recorte.md)**, depois **[2. Bases e animações](02-corpos-e-animacoes.md)** — o modelo, em uma leitura |
| Quer conferir se entendemos o pedido | **[2. Bases e animações](02-corpos-e-animacoes.md)** direto — é onde o lobisomem está escrito |
| Já anima em outro programa | [9. Vindo do Spriter](09-vindo-do-spriter-spine-e-dragonbones.md), e volte para o 0 |
| Só quer pôr no jogo | [8. Exportar e usar no jogo](08-exportar-e-usar-no-jogo.md) |

---

## Os onze capítulos

| # | Capítulo | O que você aprende |
|:---:|:---|:---|
| 0 | [Abrir o Recorte](00-abrir-o-recorte.md) | Instalar, abrir, e ler a tela: as cinco faixas, a barra, os menus, os dois modos. |
| 1 | [Montar um corpo](01-montar-um-corpo.md) | Trazer as imagens, criar ossos, prender desenho no osso, ordem de desenho, pastas. |
| **2** | **[Bases e animações](02-corpos-e-animacoes.md)** | **A espinha do modelo novo: a base como animação de um quadro só, as duas listas, o lobisomem. Leia este antes dos outros.** |
| 3 | [Skins](03-peles.md) | Trocar a roupa sem refazer o esqueleto. Uma skin, várias skins, e o que o jogo chama. |
| 4 | [Animar](04-animar.md) | O tocador, as chaves, o laço, as marcas, as curvas, e a faixa que dirige uma entidade. |
| 5 | [Entidades](05-entidades.md) | Esqueletos pendurados — a espada, a motosserra, o fogo do mecha — e a animação de fora reaproveitada. |
| 6 | [Malha e pesos](06-malha-e-pesos.md) | Dobrar o desenho por dentro, e pintar quanto cada osso puxa. |
| 7 | [As cinco regras](07-as-cinco-regras.md) | IK, transformação, caminho, física e comando. Uma a uma, com o exemplo do herói. |
| 8 | [Exportar e usar no jogo](08-exportar-e-usar-no-jogo.md) | As três embalagens, abrir e salvar, o menu Exportar, o validador, e o boneco no jogo: Construct 3, Godot, ou código. *Conferido em 07/10.* |
| 9 | [Vindo do Spriter, Spine e DragonBones](09-vindo-do-spriter-spine-e-dragonbones.md) | Cada coisa do Spriter e onde ela está aqui, com a tecla. Trazer o projeto pela pasta. Também Spine e DragonBones. *Conferido em 07/10.* |
| 10 | [Partículas e biblioteca](10-particulas-e-biblioteca.md) | Fogo, fumaça, faísca e poeira num clique; a ficha em dez abas, a forma, a cor, as rajadas, o peso. E parado, andar, correr e pular prontos. *Escrito em 07/10.* |

Cada capítulo abre com **"O que você vai conseguir fazer no fim"**, em três
linhas, e fecha com uma tabela de **selo** — a lista honesta do que existe,
do que falta, e do que muda com as bases.

---

## O manual em PDF

Gerado da **mesma página** que o **Ajuda → Manual** (`F1`) monta, e não de
uma segunda cópia do texto — nunca duas fontes dizendo coisas diferentes. O
PDF de 09/09 saiu da pasta: era o manual velho, sem selo, e ficaria
confundindo ao lado do novo (guardado em `backup/`, não volta). Para gerar um
novo, com o editor aberto numa outra janela:

```
npm run manual-pdf
```

O arquivo sai com a data no nome, e o de ontem não é sobrescrito.

---

## Como este manual escreve as coisas

| Escrito assim | Quer dizer |
|:---|:---|
| **Arquivo → Salvar** | um caminho de menu |
| **Chavear** (`K`) | um botão, com a tecla dele |
| `heroi.bone` | um nome de arquivo, um comando, ou um nome dentro do arquivo |
| *Nova regra* | uma janela que o programa abre |

**Todo botão é citado com o nome exato da dica dele.** Passe o mouse por cima
de qualquer botão do programa e a dica diz o nome e a tecla — é a mesma
palavra que está aqui.

As imagens são do editor rodando, em 1440 × 900, no tema escuro, que é como o
programa abre.

---

## As nove palavras

Cada uma é explicada de novo no capítulo em que aparece.

| Palavra | O que é |
|:---|:---|
| **Osso** | Uma peça invisível que move o desenho. Tem posição, giro e tamanho. |
| **Slot** | O lugar onde um desenho aparece. Fica preso num osso, e tem ordem de desenho. |
| **Anexo** | O desenho em si: uma imagem, uma malha, uma caixa de colisão, um ponto. |
| **Pele** | Um conjunto de anexos. Trocar de pele troca a roupa sem mexer no esqueleto. No programa: **Skin**. |
| **Chave** | O valor de uma propriedade num instante da animação. |
| **Malha** | O desenho recortado em triângulos, para poder dobrar por dentro. |
| **Peso** | Quanto cada osso puxa cada ponto da malha. |
| **Regra** | Um cálculo automático em cima dos ossos. IK, física e as outras três. |
| **Atlas** | Uma página grande com várias imagens dentro, e a lista de onde cada uma está. |

---

## O manual em inglês

**Parado.** [`en/`](en/README.md) tem a tradução dos nove capítulos do
modelo velho — decisão da casa: traduzir depois do português estar certo,
nunca junto. Vai ser refeito quando os onze capítulos novos fecharem.

**Os rótulos do editor continuam em português.** Por isso o manual em inglês
escreve cada botão em inglês com o rótulo português entre parênteses:
**Turn into mesh** (Virar malha).

O documento de conformidade, que é o que um autor de runtime estrangeiro lê,
também está nas duas línguas:
[como provar conformidade](../../conformidade/como-provar-conformidade.md) e
[how to prove conformance](../../conformidade/how-to-prove-conformance.md).

---

## Perguntas que todo mundo faz

### Quanto custa?

Nada.

| O que | Licença | Uso comercial |
|:---|:---|:---|
| O formato `.bone` | CC BY 4.0 | Livre |
| O runtime | Apache 2.0 | Livre |
| O editor | Apache 2.0 | Livre |
| As ferramentas | Apache 2.0 | Livre |

Sem royalties. Sem licença por jogo. Sem limite de faturamento.

### Preciso comprar o editor para usar o runtime no meu jogo?

Não. Nunca.

**O runtime não pergunta de onde o arquivo veio, e nunca vai perguntar.** Essa é
a queixa número um dos usuários do Spine, e é o primeiro erro que este projeto
se comprometeu a não repetir.

### Tem recurso "profissional" que fica de fora?

Não. Cinemática inversa, malha, pesos por vértice, física e peles são o
**mínimo**, e não extras.

### A licença pode ficar mais restritiva depois?

Não. Está escrito na especificação, na seção de governança: *a licença nunca
muda para licença mais restritiva*.

E se o projeto parar: se o comitê do formato parar por 24 meses, qualquer pessoa
que passe a suíte de conformidade pode continuar o repositório, com o mesmo nome
e a mesma licença. Isso existe porque o DragonBones parou em 2020 e ninguém pôde
continuar.

### Por que mais um formato?

Porque **nenhum dos que existem é aberto de verdade**.

| Programa | O problema |
|:---|:---|
| Spine | JSON próprio, sem especificação pública; o runtime exige licença do editor |
| DragonBones | JSON próprio, documentado em parte; editor parado desde 2020 |
| Live2D | JSON próprio, fechado; só por assinatura |
| Creature | JSON próprio; comunidade pequena, documentação fraca |
| Spriter | XML próprio; **sem malha no formato** |

Todos são o formato **de um programa**. Se o programa morre, o formato morre
junto, e o trabalho fica preso.

O PDF virou padrão porque é aberto, estável, e qualquer programa lê — ninguém
precisa do Acrobat. O glTF fez o mesmo pelo 3D. Os dois têm as mesmas quatro
coisas, e o `.bone` tem as quatro:

| # | O que | Tem? |
|:---:|:---|:---:|
| 1 | especificação escrita e pública | sim |
| 2 | validador oficial e gratuito | sim |
| 3 | suíte de testes que qualquer leitor pode rodar | sim |
| 4 | governança escrita, com regra de sucessão | sim |

### Meu arquivo velho vai abrir no programa novo?

Sim. Sempre. É o princípio número um da especificação: a versão 1.x só
acrescenta, nunca remove e nunca muda o sentido do que já existe.

Um arquivo que usa um recurso que o seu leitor não conhece **abre assim mesmo**:
toda propriedade desconhecida é ignorada, e todo valor desconhecido tem um
comportamento de reserva escrito.

### Posso confiar que outro programa vai ler meu arquivo igual?

Essa é a pergunta certa, e a resposta é o motivo de o projeto existir.

O formato tem **dois runtimes**, escritos por caminhos independentes: um em
TypeScript e um em Python, este último feito só a partir do **texto** da
especificação, sem olhar o código do outro. Há uma ferramenta que põe os dois
frente a frente e compara **campo por campo**:

```
npm run conformidade:dois
```

A suíte tem hoje **120 casos** (07/10/2026). Quem passa:

| Leitor | Casos |
|:---|:---:|
| TypeScript (`runtime/`) | 120 de 120 |
| Construct 3 (`leitor-construct/`) | 120 de 120, sobre o pacote |
| Godot (`leitor-godot/`) | 119 de 120 |
| Python (`runtime-python/`) | não confirmei o número de hoje |

Quando os runtimes não concordavam, quem estava errado era quase sempre a
**especificação**, e o texto foi corrigido.

**Um formato com um runtime só não é um formato: é um programa.**

### O que são os níveis A, B e C?

| Nível | Nome | Suporta |
|:---:|:---|:---|
| **A** | Básico | ossos, slots, imagens, peles, atlas, chaves, eventos |
| **B** | Malha | tudo do A, mais malha, pesos, caixas, máscara, binário |
| **C** | Completo | tudo do B, mais as cinco regras, parâmetros, morphs, esqueleto dentro de esqueleto |

Um arquivo de nível acima **ainda abre**: as partes não suportadas seguem as
regras de reserva. A meta é que uma engine pequena consiga o nível A num fim de
semana.

### Onde vejo tudo o que ainda não funciona?

Em cada capítulo, na última seção. A lista completa, com o placar dos
requisitos, está em `ESTADO.md`.

---

**O padrão é o arquivo, não o programa.** O programa é só a melhor forma de
criar esse arquivo.

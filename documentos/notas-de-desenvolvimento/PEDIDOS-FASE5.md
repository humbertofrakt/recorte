# Pedidos da fase 5

Um pedido por bloco. Quem anotou, para quem, o que é, e como contornei enquanto
isso.

---

## 1. O `README.md` da raiz ensina um comando que não funciona

**De:** dono C (documentação) · **Para:** quem cuida do `README.md` da raiz

O `README.md` da raiz traz, na seção "Trazer trabalho de outro programa":

```
npm run importar heroi-spine.json heroi.bone --atlas heroi.atlas
npm run importar boneco.scml boneco.bone --relatorio avisos.txt
```

Essas duas linhas **falham**. O npm come as opções antes de passar ao programa:

```
Erro na conversão: Cannot read properties of null (reading 'trim')
```

O certo é pôr `--` logo depois do nome do script:

```
npm run importar -- heroi-spine.json heroi.bone --atlas heroi.atlas
npm run importar -- boneco.scml boneco.bone --relatorio avisos.txt
```

Testado nas duas formas. Com `--` funciona, sem `--` falha.

Chamar o programa direto também funciona, e aí não precisa de `--`:

```
node ferramentas/importar.mjs heroi-spine.json heroi.bone --atlas heroi.atlas
```

**Como contornei:** o manual (`documentos/manual/07-vindo-de-outro-programa.md`)
já ensina a forma com `--`, e explica por quê. Não mexi no `README.md` da raiz,
que é de outro dono.

---

## 2. Falta a versão em inglês do manual

**De:** dono C (documentação) · **Para:** quem for definir o escopo da fase 6

O requisito C1 do manual de requisitos pede o manual **em inglês e em português
desde o início**.

Esta entrega tem só o português: `documentos/manual/01` a `08` mais o
`README.md` da pasta.

O texto foi escrito de propósito com frases curtas e tabelas, o que torna a
tradução barata. Sugestão de pasta: `documentos/manual/en/`.

**Como contornei:** anotei a falta no próprio manual, na pergunta "Ele existe em
inglês?" do capítulo 8.

---

## 3. Faltam os vídeos curtos do requisito C5

**De:** dono C (documentação) · **Para:** quem for definir o escopo da fase 6

O requisito C5 pede vídeos curtos por ferramenta e uma academia gratuita.

Não dá para gravar vídeo daqui. O que foi feito no lugar:

- Cada ferramenta do editor tem uma tabela de gestos no manual.
- O capítulo 1 traz um roteiro de dez passos com "o que clicar" e "o que esperar
  ver", que é o roteiro pronto de um vídeo.
- Cada tela citada tem uma imagem de verdade, tirada do editor rodando.

**Como contornei:** os capítulos 1 a 6 servem de roteiro para gravar depois.

---

## 4. O editor ainda não escolhe qual evento uma chave dispara

**De:** dono C (documentação) · **Para:** dono do editor

As chaves de evento aparecem na linha do tempo, mas não há campo para escolher
qual evento é disparado. Está escrito no `editor/README.md` como pendência.

**Como contornei:** o capítulo 3 do manual avisa isso na seção de eventos e diz
que, por enquanto, isso se escreve no `.bone` à mão.

---

## 5. O editor ainda não cria malha ligada

**De:** dono C (documentação) · **Para:** dono do editor

A malha ligada existe no formato (§7.5) e o runtime a lê. O `heroi.bone` usa uma.
O editor não tem botão para criar.

**Como contornei:** o capítulo 4 do manual explica o que é e avisa que, por
enquanto, isso se escreve no `.bone` à mão.

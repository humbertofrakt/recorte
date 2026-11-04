# Rodadas K1 e K2 — o leitor do Construct: o pacote, e ver o boneco

Ficha escrita pelo `DIRETOR · ed2cab` em 05/10/2026.
**Esta rodada escreve código, numa pasta NOVA.** Não mexe no editor, nem no `programa/`.
Outra rodada está usando a máquina para conferir o editor: **não rode nada pesado junto** (veja as réguas).

---

## Para quê

O Humberto decidiu a entrega: *"bota para Construct e Godot."* E hoje, 05/10: **começar pelo Construct.**

A pesquisa está feita: `documentos/projeto do programa/08 OS LEITORES - Godot e Construct 2026-10-05.md`. **Leia inteiro.** Esta ficha só diz o que fazer primeiro; o como está lá.

Em uma frase: **um addon do Construct 3 (Addon SDK v2) com o nosso `runtime/` inteiro dentro.** Só o desenho é novo. É o que o Spine faz no plugin oficial dele.

| Dado | |
|:---|:---|
| O Construct do Humberto | **Construct 3 LTS r449**. O addon tem de instalar nele. O plugin do Spine pede o r495 e não instala |
| O SDK | **v2** (existe desde o r397; o v1 some no r450) |
| O `runtime/` | TypeScript, sem dependência de fora. Só `render/canvas.ts` usa o DOM, e **fica de fora** |

---

## K1 — o pacote

| # | O que tem de existir no fim |
|:---:|:---|
| 1 | Uma pasta nova na raiz do projeto para o leitor do Construct. **O nome é seu, em português, e você me diz** (sugestão: `leitor-construct/`). Uma linha no `CLAUDE.md`? **Não**: diga-me, e eu ponho |
| 2 | O `runtime/` empacotado num **arquivo `.js` só**, sem o `render/canvas.ts`. O comando que gera fica num script do `package.json` (ex.: `npm run leitor:construct`) |
| 3 | **Os 90 casos de conformidade rodam sobre esse arquivo `.js`**, no Node, e passam 90 de 90. É a prova de que o que vai dentro do addon lê certo. Veja `conformidade/README`, `como-provar`, e o adaptador de `ferramentas/src/conformidade/` |
| 4 | Um **addon vazio** do Construct: `addon.json`, `aces.json`, os arquivos de tipo e de instância, o ícone, empacotado em `.c3addon`. Um objeto chamado **Recorte**, que ainda não desenha nada |
| 5 | Um teste que confere o `addon.json` (versão mínima r449, SDK v2, os arquivos citados existem) |

## K2 — ver o boneco

| # | O que tem de existir no fim |
|:---:|:---|
| 1 | O objeto Recorte **carrega** o `.bone`, o atlas e a imagem da pasta *Files* do projeto do Construct |
| 2 | **Desenha** com `drawMesh`: ossos, imagens, ordem de desenho, cor, modo de mistura. O eixo Y do Construct aponta para baixo: a conta da virada fica num lugar só |
| 3 | **Toca animação**: ação "Tocar animação" (nome, em laço ou não), e a expressão do nome da animação que está tocando |
| 4 | O desenhador novo é **módulo puro**: recebe a pose e devolve as listas de `drawMesh` (posições, uv, índices, cores). **Testado no Node, sem o Construct**: para o herói parado, as listas batem com as do desenhador do editor |
| 5 | Um projeto de exemplo do Construct (`.c3p` ou pasta), com o herói andando |

---

## O que você NÃO consegue fazer, e é do Humberto

Você não abre o Construct. **Instalar o addon no r449 e ver o herói na tela é a mão do Humberto.** Então:

| # | |
|:---:|:---|
| 1 | Tudo o que der para provar **sem** o Construct, prove no Node |
| 2 | Deixe um **passo a passo de cinco linhas** para ele instalar e ver: `LEIA-ME.md` na pasta do leitor, em português, frases curtas |
| 3 | Diga no relatório, às claras, **o que só a mão dele prova** |
| 4 | O Humberto tem uma skill para montar projetos do Construct 3 LTS r449 sem abrir o editor: `construct3-suprema-lts`. Se ela aparecer na sua lista de skills, **use-a** para o projeto de exemplo. Se não aparecer, diga |

---

## As réguas

| # | Régua |
|:---:|:---|
| 1 | Leia o `08` inteiro; `runtime/src/` (o que entra no pacote); o plugin do Spine como modelo de **forma** (o link está no `08`): `addon.json`, `aces.json`, `instance.ts`, o desenhador. **Não copie código dele**: é de outra licença. Copie a ideia, e escreva o nosso |
| 2 | **Páginas do construct.net pedem verificação de robô.** A rodada 22 não leu o `IRenderer` do r449 (leu o do r495). Onde você depender de uma página que não conseguiu ler, **escreva a suposição no código e no relatório**, com o link: o Humberto pode colar a página |
| 3 | **Não mexa em `runtime/`.** Se o empacotamento pedir uma mudança nele (um ponto de entrada novo, por exemplo), **só acrescente**, e me diga. `editor/`, `programa/`, `formato/`: não toque |
| 4 | **A máquina:** outra rodada está conferindo o editor com um servidor e um Chrome. **Você pode** rodar o empacotamento e os 90 casos no Node (são leves). **Você não pode** rodar `npx vitest run` inteiro, `npm run roteiro`, `npm run medir` nem `montar-programa.py` enquanto ela não terminar. Rode só os **seus** arquivos de teste (`npx vitest run <caminho>`). Meça a memória livre antes de cada comando |
| 5 | **A suíte inteira, o `tsc` e a versão ficam para o fim**, quando eu disser que a máquina está livre. Até lá, feche K1 e K2 **no disco**, com os seus testes passando, e me avise. Mensagem minha só chega quando o seu turno para |
| 6 | Teste novo num arquivo da parte nova. A contagem não cai: a referência por arquivo é o último `backup/contagem-testes_*.tsv` |
| 7 | Backup antes de escrever em arquivo que já existe (`package.json`, `tsconfig`, `vitest.config.ts`), com linha no `backup/INDICE.md`. Regra 20: a data se confere no relógio |
| 8 | Regra 21: onde o leitor não entende, **avisa**. O objeto Recorte expõe os avisos do leitor numa expressão, e escreve no console |
| 9 | Nomes das ações do Construct **em português, com as palavras do Humberto**: tocar · vestir skin · tirar skin · encaixar · desencaixar · animar a peça · soltar a peça. Em K2 só entra "tocar"; as outras são K4 e K5. Deixe os nomes reservados no `aces.json` **só quando funcionarem** |

---

## O que entregar

| # | |
|:---:|:---|
| 1 | A pasta do leitor, o `.js` do pacote, o addon `.c3addon`, os testes, o exemplo, o `LEIA-ME.md` |
| 2 | No `03`: uma linha em "O que cada rodada entregou", e as rodadas K1 e K2 na tabela, como **entregue** |
| 3 | Um aviso ao `DIRETOR · ed2cab` por `SendMessage` (rode `ListAgents` antes), a cada rodada fechada: o que existe · **90 de 90** no pacote, com a hora · o que você supôs sem conseguir ler · o que só a mão do Humberto prova |

## O que NÃO fazer

| | |
|:---|:---|
| Não faça malha com pesos, recorte, skin, conexão nem partículas | são K3 a K6 |
| Não comece o Godot | é outra frente |
| Não pergunte nada ao Humberto | dúvida vem para mim |

# Rodada 4 — os painéis do Photoshop

Ficha escrita pelo `DIRETOR · ed2cab` em 05/10/2026.
**Esta rodada tem duas partes: CONFERIR E PLANEJAR (agora), e CONSTRUIR (só depois do meu "pode").**
Outro chat está escrevendo código no editor agora (a rodada 23). **Você não escreve em `editor/` antes do "pode".**

---

## Para quê

Palavras do Humberto, 04/10:

> *"no Photoshop você pode abrir os menus e soltar eles das paredes. Atualmente eles ficam presos nas paredes. Era para poder recolher eles, e expandir. Era para seguir a filosofia do Photoshop. Lá tem uma aba só de janelas. E contextos."*

E a memória antiga dele, de setembro: recolher, arrastar de grupo, arranjo guardado; **rolar só o palco e a lista**.

**O problema:** o `ESTADO.md` (seções "A coluna", "Arrumar do seu jeito", "Fechar e achar de novo", "Descolar da lateral", e o degrau 11) afirma que **quase tudo isso já existe**: recolher o grupo, arrastar a aba, soltar o painel para flutuar, colar na quina, arranjos com nome, menu Janela. **Na mão dele, os painéis ficam presos na parede.**

Ou está quebrado, ou está escondido, ou ele espera um gesto diferente do que foi feito. **Ninguém conferiu no uso.** A primeira parte desta rodada é descobrir qual dos três.

---

## PARTE 1 — conferir e planejar (agora; sem escrever em `editor/`)

### 1a. Como o Photoshop faz

Leia e escreva, **com link**, cada gesto do Photoshop com painéis. A rodada 5 já leu o menu Janela dele (`05 O DESENHO DOS MENUS`, seção "Como o Photoshop faz"): comece de lá, e complete.

| O gesto do Photoshop | O que você tem de saber dizer |
|:---|:---|
| Soltar um painel da parede | onde se puxa (a aba? a barra?), e como ele fica flutuando |
| Colar de volta | onde se solta, e qual é o sinal (a linha azul) |
| Recolher em ícones | a setinha dupla no topo da coluna; o painel vira ícone, e abre ao clicar |
| Expandir | o contrário |
| Recolher um painel só | dois cliques na aba |
| Agrupar e empilhar | arrastar uma aba para outro grupo, ou para a borda de baixo de um painel |
| Esconder tudo | `Tab`; `Shift+Tab` |
| O menu Janela | todos os painéis, com marca; Área de trabalho ▸ (os contextos), Nova, Redefinir |
| Mudar a largura da coluna | arrastar a borda |

### 1b. O que o nosso faz hoje, **no uso**

No `programa/` montado (v25.7), numa porta só sua (sugestão: 5322), com **um** servidor e **um** Chrome sem janela, mouse e teclado de verdade por protocolo. Meça a memória livre antes. **Você tem até as 05h40 do relógio da máquina**: depois disso o outro chat pode remontar o `programa/`.

Para **cada gesto** da tabela 1a, faça o gesto no nosso programa e diga, com foto em `backup/fotos-obra/rodada-04/`:

| Estado | Quer dizer |
|:---|:---|
| **igual ao Photoshop** | o mesmo gesto dá o mesmo resultado |
| **existe, com outro gesto** | dá para fazer, mas não do jeito do Photoshop. Diga qual é o nosso gesto, e se há algum sinal na tela que o ensine |
| **existe e está quebrado** | o gesto certo não funciona. Diga o que acontece |
| **não existe** | |

Procure como o **usuário** procura: puxe a aba, puxe o título, clique com o botão direito, olhe o menu Janela. Só depois leia o código (`editor/src/ui/layout-model.ts`, `panel-groups.ts`, `panels/dock-model.ts`, `ui/arrangements.ts`, `shell.css`) para entender **por que** não achou.

### 1c. O plano

`documentos/projeto do programa/09 OS PAINEIS - conferidos e o plano <data do relógio>.md`:

| # | Parte |
|:---:|:---|
| 1 | A tabela dos gestos: Photoshop · o nosso hoje · estado · foto |
| 2 | **A resposta, em três linhas:** por que, na mão do Humberto, os painéis ficam presos na parede |
| 3 | **O plano em lotes pequenos**, um por gesto que se vê, do que mais muda a vida dele para o que menos muda. Cada lote: o que ele vai ver · os arquivos · o que pode quebrar |
| 4 | O que **não** copiar do Photoshop, se alguma coisa, e por quê |
| 5 | "Perguntas para o Humberto": no máximo três, cada uma com a sua suposição. **Se o Photoshop responde, não pergunte**: a régua é "seguir a filosofia do Photoshop" |

**Mande-me o plano por `SendMessage` e TERMINE O TURNO.** A minha resposta só chega quando o seu turno para.

---

## PARTE 2 — construir (só depois do meu "pode")

| # | Régua |
|:---:|:---|
| 1 | Leia `editor/src/contract.ts` inteiro e `documentos/PARTES.md`. O fim do `03` diz o que mudou desde 04/10 (doze menus, "skin", "base") |
| 2 | Um lote = um gesto que se vê = uma versão = um par de fotos, nas **duas telas** (1440×900 e 1280×720) |
| 3 | **A tela é dele, o arquivo é do boneco**: a arrumação dos painéis mora na máquina (`RECORTE_…` no navegador), nunca dentro do `.bone` |
| 4 | Nada some sem porta de volta: todo painel fechado ou recolhido continua escrito no menu Janela |
| 5 | `npm run medir` não pode piorar. Se um painel deixar de caber, **diga o número** |
| 6 | Rolar só o palco e as listas. Painel não rola de lado |
| 7 | O menu **Janela** do `05` reservou três itens marcados (novo): *Soltar o painel da parede · Recolher em ícone · Expandir*. Quando funcionarem, **entram no menu**, com id em `ui/actions-table.ts` |
| 8 | Teste novo no arquivo da parte; a contagem não cai (referência: o último `backup/contagem-testes_*.tsv`); fecho completo, um processo de cada vez; versão pelo `versao.py`; `CHANGELOG`; aviso a cada lote |

---

## O que NÃO fazer

| | |
|:---|:---|
| Não escreva em `editor/` antes do "pode" | outro chat está escrevendo lá |
| Não rode `npx vitest run` inteiro, roteiro, medição nem `montar-programa.py` na parte 1 | idem |
| Não toque em `leitor-construct/`, `formato/` nem nos runtimes | |
| Não pergunte nada ao Humberto | dúvida vem para mim |

# Rodada 16 — partículas: o sistema

Ficha escrita pelo `DIRETOR · 000da3` em 05/10/2026.
**Duas partes. A primeira não escreve código: é o plano, com o desenho da tela.** O código só começa com o meu "pode".

---

## Para quê

O Humberto não conseguiu usar as partículas, viu o Niagara, e quer um **sistema completo**, com balanceamento: o que é bom ter, e o que pesa demais (`02 AS DECISOES`, seção 5).

| O que já está decidido por ele | Onde |
|:---|:---|
| **A régua:** entra o que é **função pura do tempo** e o nosso leitor desenha barato no Godot e no Construct | `03`, "o Humberto respondeu as onze perguntas", linha 6 |
| A rodada 16 dá **controle na tela** a tudo o que o formato já tem: rajadas, curvas, gradiente, e **todas as formas** (ponto, retângulo, círculo, anel, arco, linha, osso, malha), com um seletor de forma que **mostra o desenho de cada uma** | `03`, "partículas: a forma 'ao longo de um caminho' entra na rodada 16" |
| Entra uma forma nova: **ao longo de um caminho** (a curva que o programa já tem). Valor novo no formato; ele disse sim. Tem de continuar função pura do tempo | idem |
| Trilha e sub-emissor (nascer e morrer): **depois** do básico. Partícula que é entidade inteira: depois. Exportar para a partícula da engine: não agora | idem, linhas 8 a 10 |

| O que já existe | |
|:---|:---|
| A pesquisa | `documentos/projeto do programa/06 AS PARTICULAS - pesquisa e proposta 2026-10-04.md`. **Leia inteira** |
| A rodada 15 (v24.0 a v24.3) | o emissor tem marca na cena, se clica, se move, gira e se prende; o painel Partículas com Novo, Duplicar e Apagar; `x`, `y`, `rotation` no formato |
| Um problema medido e escrito no `ESTADO.md` | **a ficha do emissor pede 2.736 px de altura e o painel tem 343.** É pedido de desenho, não conserto escondido |
| Os leitores | o Construct e o Godot já desenham as partículas pela conta do formato, e passam os 19 casos P. No Godot, **dez heróis com faíscas custam 54 a 58 ms por quadro**; um, 3 ms. A parte quente é a partícula (~50 µs cada) |

---

## Parte 1 — o plano (sem código)

Entregue `documentos/projeto do programa/16 AS PARTICULAS - o plano <data do relógio>.md`. Frases curtas, tabelas. Responda, nesta ordem:

| # | A pergunta | O que eu quero ler |
|:---:|:---|:---|
| 1 | **O que o formato tem e a tela não mostra?** | Uma tabela: cada campo da extensão de partículas (a spec e o schema) · se tem controle na tela hoje · onde. **Confira no código do editor, campo por campo; não confie na pesquisa de ontem** |
| 2 | **O desenho da ficha do emissor** | Como 2.736 px viram algo que cabe: grupos que dobram, abas dentro da ficha, o que fica à vista e o que fica um clique abaixo. Um desenho em texto (caixas), nas três telas (1920×1080 é a do Humberto). **O Humberto é disléxico: poucos controles por grupo, nome claro, ícone com o nome na dica.** Olhe como o Spine, o Unity e o Godot arrumam a ficha de partículas, com link; diga o que copia e o que não |
| 3 | **O seletor de forma** | As oito formas e a nova, cada uma com o desenho dela na cena (a alça para mudar o tamanho, o raio, o arco) |
| 4 | **Rajadas, curvas e gradiente** | Que editor cada um ganha. O programa já tem editor de curva (a linha do tempo): dá para reaproveitar? |
| 5 | **A forma "ao longo de um caminho"** | O valor novo no formato (a menor mudança; `x-since`), a conta **à mão** de onde nasce a partícula *i* no instante *t* para um caminho simples, e os casos de conformidade novos com o número esperado calculado no plano. Como fica função pura do tempo quando o caminho é animado. O que um leitor velho faz com o arquivo novo (avisa, nunca desenha errado calado) |
| 6 | **O balanceamento** | O que o Humberto pediu: o que é bom ter e o que pesa demais. Com o número do Godot acima: quantas partículas por emissor e por tela o editor deve **avisar**, e como |
| 7 | **Os lotes**, pequenos, um por versão | do que mais muda a vida dele para o que menos muda. Diga quais mexem no formato e nos runtimes (esses vão para o modelo mais forte) e quais são só editor |
| 8 | **O que você não sabe** | às claras |

**Régua da parte 1:** não escreva em `editor/`, `runtime/`, `runtime-python/`, `formato/`, `conformidade/`, `leitor-*`. Não rode a suíte. Pode abrir o `programa/` montado para **olhar** a ficha de hoje e fotografar (um servidor, um Chrome sem janela, medindo a memória antes: 0,5 GB livres ou mais; outro chat pode estar usando a máquina: se a memória não der, trabalhe só pelo código e diga). Fotos em `backup/fotos-obra/rodada-16/`.

Terminou: avise-me por `SendMessage` com as cinco linhas principais e **as perguntas que só o Humberto responde, cada uma com a sua sugestão**, e **termine o turno**.

## Réguas da casa

`CLAUDE.md` inteiro · mensagem minha só chega quando o seu turno para · não pergunte nada ao Humberto, não abra painel de pergunta · relógio primeiro, nome depois · backup antes de escrever em arquivo que existe, com linha no `backup/INDICE.md` (CRLF) · gaste pouco: a conta bateu no limite duas vezes hoje.

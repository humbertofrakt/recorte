# Pedidos do Humberto — a coluna do meu jeito — 13/09/2026

Palavras dele, 13/09: *"rolar o menu é aceitável, mas quero formas de organizar
o menu do meu jeito; todo programa faz isso"*. E logo depois:

> *"tá faltando arrastar para criar meus grupos. Botão de esconder e mostrar.
> Arrastar pra fora das laterais. Fechar um grupo e poder abrir em visualizar
> janela. E vários outros tipos de personalização de menus."*

Antes, no mesmo dia: *"dá para mover as janelas como no Photoshop? Tipo soltar
como popup? Podia ter também botões para recolher quando não estivesse usando."*

## O que já entrou (v12.2)

| Feito | Onde |
|:---|:---|
| Botão de recolher cada grupo | `ui/panel-groups.ts` |
| A altura vai para o grupo da aba em uso (0,68) | idem |
| A mão vence a conta; dois cliques na alça devolvem o automático | idem |
| O arranjo guardado em `RECORTE_editor_state` | idem |

## O que falta, por fase

**Fase 1 — arrumar dentro da coluna** (em andamento, chat 2)

| # | O quê |
|:---:|:---|
| 1 | Arrastar uma **aba de um grupo para outro** |
| 2 | **Reordenar** as abas dentro do grupo |
| 3 | **Criar grupo novo** arrastando uma aba para uma borda: o grupo nasce ali |
| 4 | **Esconder e mostrar**: um botão por painel, e a lista de tudo no menu Exibir |
| 5 | **Fechar um grupo** e poder abri-lo de novo pelo menu — nada some sem porta de volta |
| 6 | **Voltar ao arranjo de fábrica** |

**Fase 2 — sair da coluna** (lote próprio, depois)

| # | O quê |
|:---:|:---|
| 7 | **Descolar o painel da lateral**: arrastado para fora, ele solta e flutua SOBRE a janela do editor, como no Photoshop. Move-se, redimensiona-se, e volta a colar quando encostado numa borda ou quina. Pedido de novo em 13/09: *"descolar os menus da barra lateral, ok não fazer pop up, mas seria bom poder descolar como no Photoshop"* — **flutuar dentro do programa é o que ele quer; janela do sistema é que está fora** |
| 8 | ~~Soltar em **janela própria** (popup)~~ — **fora, por enquanto**. Ele mandou ignorar em 13/09/2026. Não começar sem ele pedir de novo |

## A régua

Rolagem é aceitável em painel com **palco** ou com **lista que cresce com o
arquivo**. Nunca para texto fixo — aí é *"uma wikipédia"*.

Tudo guardado em `RECORTE_editor_state`, nunca no `.bone` (regra 6 da casa).
Toda porta que fecha tem porta que abre, no menu Exibir.

Antes de desenhar cada gesto: olhar Spriter, Spine e DragonBones — e, para
docking, também o Photoshop, que é o que ele cita.

## O gesto, com as palavras dele (13/09/2026)

> *"no Photoshop, se eu encosto nas quinas, a janela se adapta, 'cola' no lugar."*

É o docking do Photoshop, e é o modelo do item 3. O que isso exige:

| # | O que o gesto precisa ter |
|:---:|:---|
| 1 | **Zonas de encaixe**: as bordas e as quinas da coluna respondem quando a aba arrastada chega perto |
| 2 | **Mostrar antes de soltar**: uma sombra ou faixa dizendo onde o painel vai parar, enquanto a mão ainda segura |
| 3 | **Colar sozinho** ao soltar na zona: a pessoa não precisa acertar o pixel |
| 4 | Soltar **fora de qualquer zona** não faz nada — a aba volta para onde estava, sem estrago |

Sem a sombra do item 2 o gesto vira adivinhação: a pessoa solta e descobre
depois. É por isso que o Photoshop pinta a faixa azul.

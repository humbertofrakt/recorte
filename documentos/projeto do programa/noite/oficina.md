# A oficina — o exemplo que mostra tudo junto

Pedido do Diretor, noite de 04 para 05/11/2026. Feito pela sessão do reaproveitar.

## Para o Humberto

1. Abra o programa.
2. Na tela vazia, clique **Abrir a oficina** (ou **Arquivo → Abrir a oficina (exemplo)**).
3. Pronto: 5 bases, na aba Animações.

| Caso | Onde olhar |
|:---|:---|
| **O herói com a motosserra** — a corrente gira sempre, sozinha | base **heroi**, abra `walk`, aperte ▶ |
| **O herói com duas roupas** | aba **Skins**: `default` e `armadura` |
| **O mecha com o herói dentro**, na cabine | **Bases → mecha**, em Compartilhadas clique `andar`, ▶ |
| **Três bonecos, as mesmas animações** (Esqueleto padrão) | **Bases → cavaleiro / goblin / robo**, em Compartilhadas |

## O que é

| Coisa | Onde |
|:---|:---|
| A pasta do projeto (com `manifest.json`) | `exemplo/oficina/` |
| Quem a gera (rodar de novo regrava igual) | `node ferramentas/fazer-oficina.mjs` |
| A porta no programa | `io/oficina.ts`: a pasta vai DENTRO do programa (como o herói), e abre como pasta de leitura pela porta da pasta solta |
| Botão e menu | boas-vindas **Abrir a oficina**; **Arquivo → Abrir a oficina (exemplo)** |
| Manual | cap. 0, as duas tabelas (português e inglês) |

**Formato de hoje, nada novo**: a motosserra é um anexo `skeleton` com `baseAnimation: "girar"` (§7.11); o herói na cabine é outro anexo `skeleton` (`heroi.bone`, que leva a motosserra junto: dois níveis); os bonecos e o mecha citam `humanoide-v1-animacoes.bone` em `assets.animations` (§2.8) e declaram `rig: humanoide-v1`.

**A oficina é só de leitura**: o Salvar não grava nela; pergunta onde (como no herói).

## Prova

| Régua | Resultado |
|:---|:---|
| `node ferramentas/validador/validar.mjs exemplo/oficina/*` | 10 válidos, 0 com erro |
| `render-png` | desenha as 5 bases, com o herói na cabine e a motosserra (foto `fotos-oficina/runtime-a-oficina-inteira.png`) |
| `ferramentas/provas/oficina/prova.cjs` (só cliques) | 11 passos, nenhum travou |
| programa montado (`vite build`) | a oficina vai junto e abre igual |

## Aviso para a parte do validador

O validador diz *"Este arquivo não tem nenhuma animação. Ele é uma pose de montagem"* para um boneco que toca animações de fora (`assets.animations`). É aviso (não erro), mas não é verdade: o boneco anda. Não mexi (parte do validador).

FIM

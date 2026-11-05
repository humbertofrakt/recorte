# Reaproveitar animação — relatório

Ramo `obra/reaproveitar`. Noite de 04 para 05/11/2026.

## 1. Diagnóstico: usar como pessoa nova (antes)

Script: `ferramentas/provas/reaproveitar/diagnostico.cjs`. Chromium sem janela, só cliques no que se vê.
Os 3 bonecos de teste: `fazer-bonecos.mjs` (cavaleiro alto, goblin baixo, robô com nomes diferentes).

| Objetivo | O que aconteceu | Travou? |
|:---|:---|:---:|
| (a) andar do herói no cavaleiro | Exportar → arquivo `animacoes-animacoes.bone` (nome estranho). Importar no cavaleiro: **"Esta base NÃO tem 18 nomes"** (o herói usa `hips`, `torso`; o padrão usa `quadril`, `tronco`). Entra, e **não mexe nada** | **sim** |
| (b) as 4 de fábrica no goblin | Biblioteca → grava o arquivo. A lista diz **"Nenhuma animação ainda"** e embaixo "De fora: humanoide-v1-animacoes.bone · 4". `andar` **não tem clique, não toca** | **sim** |
| (c) robô, nomes diferentes | Biblioteca: **"Esta base não tem 14 nomes"**. Não há tela para ligar `braco_direito` a `braco_d`. Só "Editar → Substituir nomes…", à mão, 14 vezes | **sim** |
| (d) mudar num lugar, 3 mudam | Não há caminho. O arquivo compartilhado não abre no editor, não toca, e ninguém diz quem é o dono | **sim** |

**O que só dava por código:** ligar ossos com nomes diferentes; ver uma animação compartilhada tocar; editar a animação compartilhada.

**Palavras que não se entendem:** "contrato de rig", "assets.animations", "De fora", "k = 2,000".

Fotos: `fotos-reaproveitar/antes-1-…png`, `antes-2-…png`.

## 2. Desenho

Em `reaproveitar-o-desenho.md`.

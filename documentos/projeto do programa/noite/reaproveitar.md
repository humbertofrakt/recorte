# Reaproveitar animação — relatório

Ramo `obra/reaproveitar`. Noite de 04 para 05/11/2026.
Pedido: *"o Fortnite tem vários personagens, mas usa as mesmas animações base"*.

## Em uma linha

Antes, os 4 objetivos travavam. Agora os 4 passam, só com cliques, e o runtime desenha os 3 bonecos andando com o mesmo andar.

## 1. Diagnóstico: usar como pessoa nova (antes)

Script: `ferramentas/provas/reaproveitar/diagnostico.cjs`. Chromium sem janela, só cliques no que se vê.
Os 3 bonecos de teste: `fazer-bonecos.mjs` (cavaleiro alto, goblin baixo, robô com nomes diferentes).

| Objetivo | O que aconteceu | Travou? |
|:---|:---|:---:|
| (a) andar do herói no cavaleiro | Exportar → arquivo `animacoes-animacoes.bone` (nome estranho). Importar no cavaleiro: **"Esta base NÃO tem 18 nomes"** (o herói usa `hips`, `torso`; o padrão usa `quadril`, `tronco`). Entra, e **não mexe nada** | **sim** |
| (b) as 4 de fábrica no goblin | Biblioteca → grava o arquivo. A lista diz **"Nenhuma animação ainda"** e embaixo "De fora: humanoide-v1-animacoes.bone · 4". `andar` **não tem clique, não toca** | **sim** |
| (c) robô, nomes diferentes | Biblioteca: **"Esta base não tem 14 nomes"**. Não há tela para ligar `braco_direito` a `braco_d`. Só "Editar → Substituir nomes…", à mão, 14 vezes | **sim** |
| (d) mudar num lugar, 3 mudam | Não há caminho. O arquivo compartilhado não abre no editor, não toca, e ninguém diz quem é o dono | **sim** |

**Só dava por código:** ligar ossos de nomes diferentes; ver uma compartilhada tocar; mudar a compartilhada.
**Palavras que ninguém entende:** "contrato de rig", "assets.animations", "De fora", "k = 2,000".

## 2. Desenho

Em `reaproveitar-o-desenho.md`: Unreal (Skeleton dono, Retarget), Unity (Avatar, auto-mapeamento), Spine (copia), Spriter. As palavras decididas, os caminhos, as telas.

## 3. O que foi feito

| Lote | O que | Arquivos |
|:---|:---|:---|
| 1 | Diagnóstico e desenho | `ferramentas/provas/reaproveitar/`, `noite/reaproveitar-o-desenho.md` |
| 2 | **Combinar os ossos**: mesmo nome, lembrado, nome parecido (português e inglês, `arm`/`arm_b`), escolhido | `anim/bone-match.ts` |
| 2 | **As compartilhadas tocam no editor** (a conta do runtime, §2.8) | `doc/shared-animations.ts`, 2 linhas em `doc/document.ts` |
| 2 | Janela **Usar animações de outro boneco**: de onde, quais, a tabela, **Ligadas** ou **Cópia** | `panels/reuse-window.ts`, `reuse-model.ts`, `reuse-actions.ts` |
| 2 | **Base dona**: a base que compartilha; o Salvar grava `<base>-animacoes.bone` | `io/shared-save.ts`, 2 linhas em `io/open-save.ts` |
| 2 | Aba Animações: "De fora" vira **Compartilhadas**, uma linha por animação, com clique e **Abrir o original** | `panels/animations.ts`, `.css` |
| 2 | Menus: **Animação → Animações de outro boneco…**; **Base → Seguir o Esqueleto padrão…** | `ui/menus.ts`, `actions-table.ts`, `register-actions.ts` |
| 2 | A compartilhada toca (o tocador lia só o arquivo) | 4 linhas em `anim/transport.ts` |
| 3 | Prova de pessoa; 2 consertos que ela achou (abaixo) | `prova.cjs` |
| 3 | `render-png.mjs` lê `assets.animations` | `ferramentas/render-png.mjs` |
| 4 | A Biblioteca antiga também toca; (e) e (f) na prova | `animations-actions.ts` (+3 linhas) |

**O formato não ganhou campo** (regra 7). O mapa de ossos e o dono moram em `RECORTE_editor_state` (`mapaDeOssos`, `compartilha`). "Seguir o padrão" usa o `rig` que a §4.8 já permite num esqueleto comum. A proposta de um campo (`rig.map`, para ligar sem renomear) está no desenho, §6 — **decisão do Humberto**.

## 4. A prova de pessoa (depois)

`node ferramentas/provas/reaproveitar/prova.cjs --fotos PASTA --saida PASTA` (editor no ar na porta 5287).

| Passo | Resultado |
|:---|:---:|
| o projeto com 3 bases (Base → Trazer uma base de fora…) | passou |
| (b) cavaleiro: Esqueleto padrão, **combinam 14 de 14**, Cópia → parado, andar, correr, pular | passou |
| (a) cavaleiro: `walk` do herói, **combinam 12 de 12** (hips→quadril, arm_b→braco_e…), Cópia | passou |
| (c) robô: as do cavaleiro, **combinam 14 de 14**, a janela diz antes `bacia → quadril, braco_direito → braco_d…`, Ligadas | passou |
| (c) Compartilhadas no robô: **↗ do cavaleiro**, e o andar toca | passou |
| (d) goblin: Ligadas; **Abrir o original** leva ao cavaleiro com o andar aberto | passou |
| (d) mudar a cabeça no andar do cavaleiro → **a cena do goblin muda sozinha** | passou |
| Salvar **com o foco no goblin** grava as 3 bases e `cavaleiro-animacoes.bone` ao lado | passou |
| (e) fechar e reabrir a pasta: o goblin ainda toca as do cavaleiro | passou |
| (f) o goblin sozinho, sem o cavaleiro: lê o arquivo da pasta | passou |

**Validador**: os 5 `.bone` salvos, **5 válidos, 0 com erro**.
**Runtime**: `render-png.mjs` desenha os 3 andando, com a cabeça inclinada que só foi mudada no cavaleiro. Foto `fotos-reaproveitar/depois-3-bonecos-andando-runtime.png`.

## 5. Defeitos achados pela prova, e consertados (provados antes)

| Forma do erro | Conserto |
|:---|:---|
| **Copiei a animação inteira sem olhar os nomes de dentro das chaves.** A ordem citava o slot `arm` e o evento `step`, que o cavaleiro não tem: o arquivo salvo ficava **inválido** | a chave que cita nome que falta sai, e é dita no rodapé |
| **Montei o corpo uma vez e não remontei quando o chão mudou.** O goblin mostrava o andar velho depois que o cavaleiro mudou | trocar de base remonta a que toca compartilhadas |
| **A Biblioteca gravava o nome e não o arquivo.** A lista dizia o nome, e nada tocava | o arquivo fica guardado; as 4 tocam |

## 6. Defeito de OUTRA parte, achado pela prova — consertei na casca, e aviso o dono

**Salvar com o foco numa base que não é a principal perdia essa base.** Dono: o Salvar do projeto (`io/open-save.ts` `saveDocument` + `io/project-open.ts` `projectFilesToSave`).

| Passo | O que acontecia |
|:---|:---|
| abrir a pasta com `cavaleiro.bone`; trazer `goblin.bone`; clicar no goblin; Ctrl+S | o goblin era gravado em `cavaleiro.bone`; logo depois o cavaleiro era gravado por cima. O `manifest.json` saía sem o goblin. As mudanças do goblin sumiam, sem aviso |

A forma: *gravo o foco no arquivo que ABRI, e não no arquivo do FOCO.*

**O conserto (mínimo, na casca, `ui/shell-file.ts` `save`)**: com o foco fora da base principal (`manifesto.main`), o Salvar volta à principal, salva, e volta ao foco de antes. Provado antes: a prova, salvando com o foco no goblin, tirava o goblin do manifesto; agora as 3 bases ficam, e o `goblin.bone` salvo cita o arquivo compartilhado. **Para a sessão do arquivo**: a raiz é o `openHandle` não seguir o foco; o conserto de verdade é lá. O `Salvar como…` com o foco fora da principal não foi mexido.

## 7. O que ficou de fora

| O quê | Por quê |
|:---|:---|
| Mudar a compartilhada no boneco que a usa | muda-se no dono (Abrir o original). Mexer nela dá "Este valor não tem onde ser gravado…" — frase do painel Propriedades (outra parte); seria melhor dizer "compartilhada: Abrir o original" |
| A régua do tempo mostra 0,00 s na compartilhada aberta | a régua lê o arquivo (parte animar). O tocador já toca |
| Ligadas a outra base dá 2 passos de desfazer (a dona e este) | dois arquivos mudam |
| Ligar sem renomear | precisa de campo novo (`rig.map`), decisão do Humberto |

## 8. Régua de fecho (05/11/2026, 01:15 UTC, depois de juntar `obra/noite-2026-11-04`)

| Régua | Resultado |
|:---|:---|
| `npx vitest run` | **5.959 passaram, 0 vermelho**, 11 pulados (o vermelho do manual sumiu com o ramo da noite) |
| `npx tsc --noEmit -p editor/tsconfig.json` | limpo |
| `node ferramentas/conformidade.mjs` | 132 de 132 |
| Testes desta parte | `editor/testes/reaproveitar.test.ts`: 19 |
| Prova de pessoa | `prova.cjs`: nenhum passo travou |

## 9. A prova final achou (05/11, 03:40), e foi consertado

**O caso:** na Oficina, cavaleiro → Animações de outro boneco… → heroi → Usar: **82 avisos (47 iguais)**, e as que entravam não ficavam à vista.

| Causa (pela forma) | Conserto |
|:---|:---|
| **Liguei a um boneco INTEIRO como se fosse um arquivo de animações.** A janela começava em Ligadas; ligar ao herói renomeava `quadril` → `hips` (o andar do Esqueleto padrão, que o cavaleiro já tocava, parava) e trazia as linhas dos slots, regras e eventos do herói que o cavaleiro não tem — uma por aviso | um arquivo solto começa em **Cópia**; e Ligadas é **recusada**, dizendo por quê, quando pararia o que o boneco já toca |
| As linhas sem onde cair viravam um aviso cada | saem da composição, e viram **uma frase por arquivo**: *"heroi.bone: 36 linhas… ficam de fora — este boneco não tem slot "head", …"* |
| A que entrava não ficava à vista | a primeira que entrou fica **aberta e escolhida** na lista, e rola até ela |

Teste visto vermelho antes (82 avisos a mais → 1). Prova da oficina: passo (5), só clicando, os avisos não mudam e a animação nova fica escolhida e à vista.

FIM

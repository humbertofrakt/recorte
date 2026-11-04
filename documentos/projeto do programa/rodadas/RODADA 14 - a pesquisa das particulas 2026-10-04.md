# Rodada 14 — a pesquisa das partículas

Ficha escrita pelo `DIRETOR · ed2cab` em 04/10/2026.
**Esta rodada não escreve código e não abre o programa.** Só lê, pesquisa e propõe.
(A rodada 1 está usando o `programa/` agora, e a máquina tem 7,7 GB.)

---

## Para quê

Palavras do Humberto, 04/10:

> *"eu quero um sistema de partículas. Não sei até onde podemos ir com ele, mas queria fazer um sistema completo. Vi o Niagara, ele tem muitas opções."*

> *"balanceamento: não sei o que é bom que o programa tenha, e coisas que vão estragar por pesar demais."*

E ele decidiu a entrega: o programa exporta para **Construct** e **Godot**.

**A régua proposta pelo Diretor, que ele ainda NÃO confirmou:**

> O sistema de partículas tem o que o Construct e o Godot conseguem tocar. O que os dois não tocam, não entra.

Esta rodada põe essa régua à prova, e devolve uma proposta para ele aprovar.

---

## O que pesquisar

| # | O quê | Onde |
|:---:|:---|:---|
| 1 | O que as partículas do **Construct 3** fazem: todas as propriedades do objeto Particles | o manual oficial, na internet. **Com link** |
| 2 | O que as partículas 2D do **Godot** fazem: `GPUParticles2D`, `CPUParticles2D`, `ParticleProcessMaterial` | a documentação oficial. **Com link** |
| 3 | O que o **Niagara** tem que ele pode ter gostado: emissores, módulos, forças, colisão, eventos, sub-emissores, fitas | a documentação da Unreal. Só o mapa, sem se perder: é 3D |
| 4 | O que o **nosso formato** já tem: a extensão `BONE_particles` | `formato/` (procure `BONE_particles`), e `documentos/planos/CONFRONTO dos dois runtimes - particulas 2026-09-18.md`. **A extensão é função pura do tempo, com semente fixa: arrastar a agulha para trás dá o mesmo quadro.** Isso é uma decisão da casa, e limita o que pode entrar |
| 5 | O que o editor já mostra | `editor/src` (procure `particle`, `emissor`). Só ler |
| 6 | Como o **Spine**, o **Spriter** e o **DragonBones** tratam partícula | `documentos/pesquisa/nova pesquisa/`. Se nenhum trata, diga em uma linha |
| 7 | O que já foi pesquisado aqui | `documentos/planos/COMO SE FAZ EFEITO 2026-09-16.md` e `IDEIAS NOVAS - particulas e biblioteca 2026-09-15.md` |

**Leia a fonte; não responda de memória.** Onde não achou, escreva "não achei".

---

## O que entregar

`documentos/projeto do programa/06 AS PARTICULAS - pesquisa e proposta <data do relógio>.md`, com:

| # | Parte |
|:---:|:---|
| 1 | **A tabela grande:** uma linha por recurso (taxa, rajada, forma do emissor, vida, velocidade, gravidade, cor ao longo da vida, tamanho ao longo da vida, giro, folha animada, trilha, sub-emissor, colisão, atração, turbulência, espaço local ou do mundo…). Colunas: **Construct · Godot · o nosso hoje · pesa?** |
| 2 | **A proposta, em três prateleiras:** **entra** (os dois tocam, e é barato) · **entra com cuidado** (um só toca, ou pesa: diga o custo) · **fica fora** (pesa demais, ou quebra a "função pura do tempo": diga por quê) |
| 3 | **O que a régua do Diretor deixa de fora que ele pode querer**, dito com franqueza. Se a régua for ruim, diga, e proponha outra |
| 4 | **O que muda no formato**, se alguma coisa. Campo novo no formato é decisão do Humberto (regra 7 da casa): liste como pergunta |
| 5 | **O uso:** o que falta para ele conseguir clicar na partícula, mover, girar e prender a um osso. Ele não conseguiu (decisões, seção 5) |
| 6 | "Perguntas para o Humberto": no máximo cinco, cada uma com a sua suposição |
| 7 | Frases curtas, tabelas alinhadas, um exemplo de jogo para cada recurso (fogo, fumaça, faísca, chuva). Ele é disléxico |

No `03`: o estado da rodada 14 passa a **entregue**. Avise o `DIRETOR · ed2cab` por `SendMessage` (rode `ListAgents` antes).

## O que NÃO fazer

| | |
|:---|:---|
| Não escreva em `editor/`, `runtime/`, `runtime-python/`, `formato/` | é só pesquisa |
| Não abra o programa, nem rode testes, roteiro ou medição | a rodada 1 está usando a máquina |
| Não decida pelo Humberto | proponha; ele aprova |

# Padrão: exportar sem recorte — pivô automático sem PSD

Decisão do Humberto, 16/09/2026, na janela **PESQUISA · Alinhamento de imagens
com pivô**. Fixado: *"isso é o padrão que vamos seguir."*

## O problema

Um monte de mãos soltas na pasta **não alinha sozinho**. Pivô era o maior
problema dele.

## Por que o PSD alinha e o PNG solto não

| | PSD | PNG recortado (trim/auto-crop) |
|:---|:---|:---|
| Régua comum | a régua do documento, `0,0` | **não existe** — cada PNG vira um retângulo colado na própria arte |
| Corta a camada? | nunca | sim, cada imagem tem seu próprio recorte |
| Deslocamento gravado | o real, até a régua | perdido: o `0,0` de cada arquivo é o canto do recorte dele, e o recorte muda de imagem pra imagem |

O pivô automático (o que o plugin do Spine faz, e o que o Recorte já faz ao
importar PSD — `pivot-model.ts`) **não é truque de Photoshop**. É ter um `0,0`
combinado entre as imagens. O PSD tem de graça, porque nunca corta camada.

## O padrão

Para qualquer conjunto de desenhos que troca no mesmo slot (mãos, bocas,
olhos, qualquer variação que tem que cair no mesmo lugar):

1. **Não recortar** (sem trim, sem auto-crop) na exportação.
2. **Mesmo tamanho de tela** entre as variações.
3. **O ponto de encaixe sempre no mesmo pixel** dentro dessa tela (ex: o
   pulso, sempre em `(x, y)` fixo, não importa a forma da mão).

Com isso o `0,0` do próprio arquivo vira a régua — o mesmo efeito do PSD,
sem precisar de PSD.

## O que fazer com o que já está solto e recortado

Não tem como recuperar a régua que nunca existiu. Alinha à mão **uma vez só**;
depois de alinhado, o Recorte lembra (o rig é a fonte da verdade — troca de
imagem no slot já cai no pivô gravado).

## Fora do escopo desta conversa (não implementado, não pedido)

Ideia registrada, não decidida: um sidecar de deslocamento por imagem (nome
do arquivo ou `.json` ao lado) para quem exporta recortado mas quer guardar o
deslocamento original — replicaria o mesmo padrão sem exigir tela igual.
Fica anotado para quando o Humberto quiser olhar; **código congelado agora**,
nada disso entra sem ordem dele.

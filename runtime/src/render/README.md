# `src/render/` — desenho em Canvas 2D

Um renderizador de referência. Lê o que `collectDrawables` (7.13) manda desenhar
e pinta com as imagens do atlas.

| Arquivo | O que faz |
|:---|:---|
| `canvas.ts` | `CanvasRenderer`, `triangleAffine`, `blendComposite`, `BLEND_COMPOSITE`. |

## Como usar

```js
const renderer = new CanvasRenderer(ctx, {
  images: new Map([['heroi', imagem]]),   // chave = nome da página do atlas
  debug: { bones: true, boundingBoxes: true },
});

ctx.save();
ctx.translate(largura / 2, altura / 2);
ctx.scale(escala, -escala);   // esqueleto tem y para cima; canvas tem y para baixo
renderer.draw(esqueleto);
ctx.restore();
```

O renderizador desenha **no espaço do esqueleto**. Quem chama monta a visão
(`translate` + `scale`) antes. O contexto volta como estava.

## Como cada coisa é desenhada

- **`region`** — os quatro cantos de 7.3 são a imagem afim de um retângulo.
  Uma matriz só leva os pixels da página até o quadrilátero; o quadrilátero é
  o recorte (`ctx.clip`).
- **`mesh` / `linkedmesh`** — uma matriz afim por triângulo: recorta no
  triângulo de destino, `setTransform` com a matriz que leva os UVs até ele,
  `drawImage` da página inteira. Cada triângulo é empurrado para fora do
  centro em `seamExpand` pixels (padrão 0.35) para não deixar linha branca
  entre vizinhos.
- **`clipping` (7.7)** — `ctx.clip` com o polígono da máscara. Com `invert`,
  o polígono mais um retângulo grande, na regra `evenodd`.
- **Cor (7.12)** — `light.a` vai em `globalAlpha`. Quando `light.rgb` não é
  branco, ou o slot tem `darkColor`, o desenho passa por um canvas auxiliar:
  `multiply` com a cor, `destination-in` para devolver o alpha original, e o
  termo escuro somado com `lighter`.
- **`blend` (7.12)** — `normal → source-over`, `additive → lighter`,
  `multiply → multiply`, `screen → screen`.
- **Depuração** — `debug: { bones, boundingBoxes, points, paths, meshes, clipping }`.
  A espessura da linha é em pixels de tela; o renderizador divide pela escala da visão.

## Limites conhecidos

1. **`skeleton` aninhado (7.11) não é desenhado.** O runtime ainda não carrega
   a instância filha. O renderizador avisa uma vez e segue.
2. **Página `premultiplied: true`** é desenhada como se fosse alpha reto. O
   Canvas 2D não expõe `glBlendFunc`, então não dá para separar os dois casos.
3. **`multiply` e `screen`** do Canvas batem com a tabela de 7.12 quando a
   fonte é opaca e divergem um pouco quando não é.
4. **Cor escura (tint black)** usa três canvas auxiliares e blend do CSS. É uma
   aproximação boa, não a fórmula exata pixel a pixel.

Nenhum desses pontos é dúvida da especificação — são limites do Canvas 2D.
Um renderizador WebGL faz os quatro exatamente como 7.12 pede.

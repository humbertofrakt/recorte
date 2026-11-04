# Visualizador

Página que abre `formato/exemplos/heroi.bone` e desenha o esqueleto animado
em Canvas 2D. Serve para ver, na tela, o que o runtime calcula.

## Como abrir

**1. Gerar o JavaScript do runtime** (uma vez, e de novo sempre que o runtime mudar):

```bash
npx tsc -p ferramentas/visualizador/tsconfig.json
```

Isso cria `ferramentas/visualizador/dist/`. É código gerado — não edite nada lá.

**2. Subir um servidor estático na raiz do projeto:**

```bash
npx serve
```

ou, sem instalar nada:

```bash
python -m http.server 8000
```

**3. Abrir no navegador:**

```
http://localhost:8000/ferramentas/visualizador/
```

Tem que ser por servidor. Abrir o arquivo direto (`file://`) não funciona:
o navegador bloqueia o `fetch` do `.bone` e do atlas.

## O que a página faz

| Controle | O que é |
|:---|:---|
| Animações | Lista as animações do arquivo. Clique para trocar. |
| Tocar / Parar / Reiniciar | Liga e desliga o relógio; reinicia volta ao tempo 0. |
| Velocidade | De 0 a 2×. Vale para a animação e para o relógio da física. |
| Mostrar | Ossos, caixas de colisão, malha dos meshes, máscara de recorte, pontos e caminhos. |
| Zoom / Enquadrar | Aproxima; "Enquadrar" recalcula o enquadramento pela caixa do esqueleto. |

A linha abaixo do palco diz quantos ossos, slots e animações o arquivo tem.
A lista embaixo mostra os avisos do carregador e do renderizador.

## Arquivos

| Arquivo | O que é |
|:---|:---|
| `index.html` | Página e estilo. |
| `visualizador.js` | Módulo ES, sem build: carrega, controla e desenha. |
| `tsconfig.json` | Só para gerar `dist/` a partir de `runtime/src`. |
| `dist/` | Gerado (já está no `.gitignore`). Não edite. |

## Notas

- O `heroi.png` do exemplo é arte de teste: retângulos coloridos. O boneco
  parece abstrato porque a imagem é assim, não porque o desenho esteja errado.
- O attachment `sword` é um esqueleto aninhado (7.11). O runtime ainda não
  carrega o filho, então ele não aparece e a página mostra um aviso.
- No console do navegador, `recorte` dá acesso ao estado
  (`recorte.esqueleto`, `recorte.animacao`, `recorte.renderizador`).

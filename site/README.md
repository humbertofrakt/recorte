# O site do Recorte

A página inicial do projeto e o validador na web.

Tudo aqui é **arquivo estático**. Não tem build, não tem servidor, não tem
banco de dados. Qualquer hospedagem que sirva arquivo serve.

---

## O que tem nesta pasta

| Arquivo | O que é |
|:---|:---|
| `index.html` | A página inicial do projeto. |
| `site.css` | O estilo da página inicial. |
| `validador/index.html` | O validador: arraste um arquivo, veja o resultado. |
| `validador/validador.css` | O estilo do validador. |
| `validador/validador.js` | A tela do validador: soltar arquivo, mostrar resultado, desenhar. |
| `validador/nucleo.js` | As contas do validador. Sem tela, sem Node. É o que os testes conferem. |
| `validador/nucleo.d.ts` | Os tipos do `nucleo.js`, para os testes. |
| `validador/esquema-compilado.js` | **Gerado.** O `bone.schema.json` compilado. Não edite à mão. |
| `validador/esquema-compilado.d.ts` | **Gerado.** Os tipos do arquivo acima. |
| `validador/construir-esquema.mjs` | O programa que gera os dois arquivos acima. |
| `validador/exemplo-com-erro.bone` | Um arquivo quebrado de propósito, para o botão "ver um arquivo com erro". |
| `tela-validador.png` | Foto da tela: um arquivo certo. |
| `tela-validador-erros.png` | Foto da tela: um arquivo com erro. |

---

## Como publicar

1. Copie **a pasta inteira do projeto** para a hospedagem.
2. Aponte o endereço para `site/index.html`.
3. Pronto. Não precisa de mais nada.

Serve GitHub Pages, Netlify, Cloudflare Pages, Vercel, ou uma pasta num
servidor de arquivos comum. Nenhum deles precisa rodar Node.

### Por que a pasta inteira, e não só `site/`

Três coisas moram fora daqui e a página busca por caminho relativo:

| O quê | Onde está | Quem usa |
|:---|:---|:---|
| O runtime já compilado | `ferramentas/visualizador/dist/` | O desenho do esqueleto no validador. |
| Os arquivos de exemplo | `formato/exemplos/` | O botão "ver um arquivo certo". |
| A especificação e o manual | `formato/`, `documentos/` | Os links da página inicial. |

**Resolvido na fase 7.** O `.gitignore` ignora toda pasta chamada `dist`, e
isso escondia `ferramentas/visualizador/dist/` — o runtime compilado que o
validador carrega para desenhar. Num clone novo a página validava e o quadro do
desenho ficava vazio. O `.gitignore` agora abre exceção para essa pasta, com o
motivo escrito ao lado.

Se por algum motivo ela não estiver lá, o comando que a gera é:

```
npx tsc -p ferramentas/visualizador/tsconfig.json
```

---

## Como rodar aqui na sua máquina

Basta um servidor de arquivos qualquer, porque a página usa módulos ES e o
navegador não carrega módulo de `file://`.

```
npm run site
```

Ou, na mão:

```
npx vite --port 5174
```

Depois abra:

| Endereço | O que é |
|:---|:---|
| `http://localhost:5174/site/index.html` | A página inicial. |
| `http://localhost:5174/site/validador/index.html` | O validador. |
| `http://localhost:5174/site/validador/index.html?exemplo` | O validador já com um arquivo certo. |
| `http://localhost:5174/site/validador/index.html?exemplo=erro` | O validador já com um arquivo quebrado. |

O script `site` do `package.json` e a configuração `site` em
`.claude/launch.json` fazem isso com um comando só.

---

## Quando o esquema mudar

O validador da web não baixa o Ajv da internet e não compila esquema no
navegador. O `formato/bone.schema.json` é compilado **antes**, num arquivo só,
por este comando:

```
node site/validador/construir-esquema.mjs
```

Ele grava `validador/esquema-compilado.js` e `validador/esquema-compilado.d.ts`.

**Rode esse comando toda vez que `formato/bone.schema.json` mudar.** Se
esquecer, a página passa a discordar da linha de comando — e
`ferramentas/testes/site.test.ts` quebra, que é justamente para isso.

---

## O que a página promete ao visitante

A página diz, com todas as letras, que **nada sai do computador dele**. Isso
tem que continuar sendo verdade:

| Regra | Por quê |
|:---|:---|
| Nenhum `fetch` para outro endereço. | O arquivo do visitante nunca viaja. |
| Nenhuma biblioteca de CDN. | Um `<script src>` de fora vê tudo o que a página vê. |
| Nenhuma medição, nenhum cookie, nenhum rastreador. | Mesma razão. |
| O único `fetch` é para os arquivos de exemplo, ao lado da página. | Só acontece se o visitante clicar. |

Quem for mexer nesta pasta: se precisar de rede para alguma coisa, pare e
pense de novo. A frase na página é uma promessa, não um enfeite.

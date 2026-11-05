# X-309 — o BOM na leitura

| Item | Valor |
|:---|:---|
| Nível | **X** (compatibilidade, todo nível) |
| Spec | 2.1: *"Leitores **DEVEM** aceitar BOM na leitura e **NÃO DEVEM** gravar BOM"* |
| Esperado | **o mesmo do A-024**, byte a byte: a entrada é a do A-024 com `EF BB BF` na frente |

## O que este caso prende

Um arquivo `.bone` salvo por um editor de texto do Windows chega com BOM. O
leitor tira o BOM e lê o resto como se ele não estivesse lá. Nada mais muda.

## O que falha aqui

| Erro | O que a suíte mostra |
|:---|:---|
| `JSON.parse` direto no texto | erro de JSON no primeiro caractere |

**Achado em 05/11/2026: quem falhava era o EXECUTOR da suíte**, e não o runtime.
`ferramentas/conformidade.mjs`, o `adaptador-referencia.mjs` e o adaptador do
Construct liam o `.bone` com `JSON.parse` para achar os atlas, **antes** de
entregar ao runtime — e o runtime já tirava o BOM. Os três passaram a usar
`parseBoneText`. O runtime Python passou de primeira.

## Onde este caso mora

**Entrou em `casos/` em 05/11/2026.** O esperado é o do A-024, conferido à mão
lá; os dois runtimes passam.

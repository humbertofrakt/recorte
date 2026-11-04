# documentos/notas-de-desenvolvimento/

Notas de quem construiu. Consulta, não trabalho do dia.

| Arquivo | O que é |
|:---|:---|
| `PEDIDOS-FUNDACAO.md` a `PEDIDOS-FASE7.md` | Pedidos entre os donos de cada fase (formato, runtime, editor). Todos atendidos |
| `PEDIDOS-CONTRATO.md` | Pedidos ao contrato do editor (`editor/src/contract.ts`) |
| `DUVIDAS-SPEC.md` | 32 dúvidas da especificação, cada uma com a resposta escolhida e testada. Falta o Humberto confirmar |
| `SPEC-INSUFICIENTE.md` | Onde o texto da spec não bastou para o segundo runtime |
| `ferramentas/provas/` | Os scripts de prova moram lá desde o lote A7: `roteiro-30.mjs`, `medir-paineis.mjs`, `conferir-editor.mjs` e `fotos-manual.mjs` |

Uso do script, com `npm run editor` ligado noutra janela:

```
node ferramentas/provas/conferir-editor.mjs %TEMP%/perfil editor/tela-final.png
```

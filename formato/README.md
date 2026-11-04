# formato/

O coração do projeto: o formato de arquivo `.bone`. O padrão é o arquivo, não o programa.

| Arquivo ou pasta | O que é |
|:---|:---|
| `ESPECIFICACAO 2026-09-17.md` | A especificação, **rascunho 0.2** (17/09/2026): o modelo novo do programa, com o glossário em §1.6. Não abre arquivo do rascunho 0.1, que está em `backup/ESPECIFICACAO_2026-09-06_rascunho-0.1-antes-do-0.2.md`. O que ainda está aberto: Apêndice B |
| `bone.schema.json` | O JSON Schema do rascunho 0.2 (`$id` `bone-0.2`). O validador de linha de comando e o da web usam este arquivo; quando ele mudar, rode `node site/validador/construir-esquema.mjs` |
| `LICENSE` | CC BY 4.0, por referência à URL canônica |
| `exemplos/` | `heroi.bone`, `espada.bone` (a entidade), `minimo.bone`, o trio `mecha.bone` / `mecha-animacoes.bone` / `mecha-pele-inverno.bone` (entidade pela imagem, animações e pele de fora), `capacete.bone` (entidade num slot que não é de arma), o atlas e as imagens. `leiame.md` explica cada um |
| `rigs/` | `humanoide-v1.bone`: a convenção de nomes do projeto, um corpo sem arte com ossos, comprimentos e tomadas reservadas. `lobisomem-rabo.bone`: a pele de fora com osso que serve a esse rig |
| `extensions/REGISTRY.md` | O registro das extensões: nome, dono, o que um leitor que não conhece deve fazer |

Três formas do mesmo arquivo: `.bone` (JSON), `.boneb` (binário), `.bonez` (pacote com as imagens). Quem converte é `ferramentas/converter.mjs`.

Mudança no núcleo do formato é decisão do Humberto. As abertas estão no `ESTADO.md`, "Decisões em aberto".

/**
 * **O texto do arquivo de cada entidade aberta** — rodada 8b, C10 (05/10/2026).
 *
 * Ao abrir um `.bone` com entidade dentro (spec 7.11), o `io/` lê o arquivo do
 * filho e o monta (`SkeletonData`). Até a rodada 8b o texto era jogado fora:
 * a entidade era só um esqueleto pronto, e nada a abria para editar. Para
 * **animar a espada por dentro, com o herói à vista** (C10), o editor precisa
 * do `.bone` dela de novo — é dele que nasce o `Doc` da espada.
 *
 * Um mapa pelo mesmo uri que o anexo `skeleton` escreve (o `resolvedUri`, a
 * chave de `doc.skeletons`). Quem abre grava; quem anima lê. O texto, e não o
 * objeto: cada `Doc` que nasce daqui ganha a sua cópia, e nenhum passo de
 * desfazer de um pode mexer no arquivo do outro.
 *
 * Módulo do degrau 1: nada de DOM, nada de `io/`.
 */

const textos = new Map<string, string>();

/** Guarda o texto do `.bone` de uma entidade, pelo uri dela. */
export function rememberEntityFile(uri: string, text: string): void {
  if (uri.length === 0) return;
  textos.set(uri, text);
}

/** O texto guardado de uma entidade, ou `null` quando o editor não a abriu. */
export function entityFileText(uri: string): string | null {
  return textos.get(uri) ?? null;
}

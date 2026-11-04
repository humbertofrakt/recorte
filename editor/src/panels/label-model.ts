/**
 * O nome comprido num painel estreito — lote 65, plano "painéis que cabem".
 *
 * Um nome que não cabe corta com reticências, e o nome inteiro vai para a
 * dica (`title`). Vale onde o CSS não corta sozinho: dentro de uma lista
 * (`<option>`), que o navegador desenha do jeito dele.
 */

/** Quantas letras um rótulo mostra antes de cortar, por padrão. */
export const LABEL_MAX = 32;

/** O texto que aparece, e o inteiro para a dica. */
export function labelFor(text: string, max = LABEL_MAX): { text: string; title: string } {
  const limite = Math.max(2, Math.floor(max));
  if (text.length <= limite) return { text, title: text };
  return { text: `${text.slice(0, limite - 1)}…`, title: text };
}

/**
 * O nome do passo de uma seta — rodada 46, lotes 1 e 3 (doc `66`; nota (b) do
 * doc `73`): quanto andou e PARA ONDE. *"Andar 10 px para a esquerda com o
 * osso"*. Módulo puro e sem import, para o `select.ts` e o `drawing-group.ts`
 * usarem sem dar a volta pelo `gesture-footer.ts`.
 *
 * Y aponta para cima no mundo: `dy > 0` é "para cima".
 */
export function nudgeLabel(dx: number, dy: number, what: string): string {
  const passo = Math.round(Math.abs(dx) + Math.abs(dy));
  let sentido = '';
  if (dx > 0) sentido = ' para a direita';
  else if (dx < 0) sentido = ' para a esquerda';
  else if (dy > 0) sentido = ' para cima';
  else if (dy < 0) sentido = ' para baixo';
  return `Andar ${passo} px${sentido} com ${what}`;
}

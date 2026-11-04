/**
 * **A tira de abas numa fileira só** — rodada 47, lote 1 (07/10/2026).
 *
 * O grupo de cima da coluna da direita tem oito abas (Imagens, Entidades,
 * Pivôs, Malha e pesos, Partículas, Exibição, Prévia, e o ▾). Numa coluna de
 * 258 px a tira quebrava em **três fileiras: 103 px**, e em 1280×720 isso era
 * um quarto do grupo: a aba Imagens ficava sem nenhuma miniatura inteira (doc
 * `68`, §3, C1). Numa fileira a tira tem 37 px.
 *
 * O que não cabe vai para o botão **»** no fim da tira, que abre a lista das
 * abas escondidas. É o Photoshop: num grupo estreito, as abas que não cabem
 * moram no menu do grupo (doc `09`, §2).
 *
 * Três regras, nesta ordem:
 *
 * 1. Se tudo cabe, não há **»**: nada muda para quem tem a coluna larga.
 * 2. A aba **à frente** está sempre à vista. Quem escolheu uma aba pelo **»**
 *    a vê na tira, no lugar da última que cabia.
 * 3. A ordem das abas não muda: as visíveis ficam na ordem do grupo.
 *
 * Puro (regra 8): recebe as larguras medidas, devolve quem aparece. A casca
 * mede e esconde.
 */

/** O que a tira mostra. Índices na ordem do grupo. */
export interface TabStripPlan {
  /** As abas à vista, na ordem do grupo. */
  visible: number[];
  /** As abas que moram no **»**, na ordem do grupo. Vazio = sem **»**. */
  hidden: number[];
}

/**
 * Quem cabe numa fileira.
 *
 * `widths`: a largura de cada aba, medida. `room`: a largura da tira, sem o
 * ▾ do fim. `more`: a largura do **»**. `gap`: o espaço entre duas abas.
 * `active`: o índice da aba à frente, ou -1.
 */
export function planTabStrip(
  widths: readonly number[], room: number, more: number, gap: number, active: number,
): TabStripPlan {
  const n = widths.length;
  const todas = [...Array(n).keys()];
  const largura = (ids: readonly number[]): number => ids.reduce((soma, i) => soma + Math.max(0, widths[i]), 0)
    + Math.max(0, ids.length - 1) * gap;
  if (n === 0 || largura(todas) <= room) return { visible: todas, hidden: [] };

  // Não cabe: o » entra, e o que sobra para as abas é menos ele.
  const sobra = room - more - gap;
  const visivel: number[] = [];
  const naFrente = active >= 0 && active < n ? active : -1;
  // A da frente primeiro: ela reserva o lugar dela.
  let usado = naFrente === -1 ? 0 : Math.max(0, widths[naFrente]);
  for (const i of todas) {
    if (i === naFrente) continue;
    const mais = Math.max(0, widths[i]) + gap;
    if (usado + mais > sobra) break;
    visivel.push(i);
    usado += mais;
  }
  if (naFrente !== -1) visivel.push(naFrente);
  visivel.sort((a, b) => a - b);
  return { visible: visivel, hidden: todas.filter((i) => !visivel.includes(i)) };
}

/** A dica do **»**: diz quantas e quais abas moram nele. */
export function moreHint(names: readonly string[]): string {
  if (names.length === 0) return '';
  const lista = names.join(', ');
  return names.length === 1
    ? `Mais uma aba: ${lista}. Clique para abrir`
    : `Mais ${names.length} abas: ${lista}. Clique para escolher uma`;
}

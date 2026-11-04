/**
 * **As rajadas do emissor** — rodada 16, lote 5.
 *
 * `bursts` (§4.3 da extensão) é uma lista de `{time, count, cycles, interval,
 * probability}`: N partículas de uma vez, em `time`, repetidas `cycles` vezes a
 * cada `interval`, cada uma com chance `probability`. Até aqui só os modelos
 * prontos (faísca) escreviam rajada; a ficha não tinha onde.
 *
 * Parte **pura**: ler, resumir numa frase, pôr, tirar e mudar um campo — cada
 * operação devolve a lista nova inteira, que um `SetProperty` grava. Os
 * limites são os do schema: um número fora deles volta para dentro, e nunca
 * vai para o arquivo um valor que o validador recusaria.
 */

export interface Burst {
  time: number;
  count: number;
  cycles: number;
  interval: number;
  probability: number;
}

export type BurstField = keyof Burst;

/** O padrão de cada campo (§9.1). */
export const BURST_DEFAULT: Readonly<Burst> = { time: 0, count: 1, cycles: 1, interval: 1, probability: 1 };

/** O teto do formato (§10): 1024 rajadas por emissor. */
export const MAX_BURSTS = 1024;

const num = (v: unknown, padrao: number): number => (typeof v === 'number' && Number.isFinite(v) ? v : padrao);

/** As rajadas do arquivo, com os padrões no que faltar. */
export function readBursts(raw: unknown): Burst[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((b) => b !== null && typeof b === 'object').map((b) => {
    const o = b as Record<string, unknown>;
    return {
      time: num(o.time, BURST_DEFAULT.time),
      count: num(o.count, BURST_DEFAULT.count),
      cycles: num(o.cycles, BURST_DEFAULT.cycles),
      interval: num(o.interval, BURST_DEFAULT.interval),
      probability: num(o.probability, BURST_DEFAULT.probability),
    };
  });
}

/** Um número com vírgula e sem zeros sobrando: 0,5 · 2 · 0,25. */
function br(v: number): string {
  return String(Math.round(v * 1000) / 1000).replace('.', ',');
}

/**
 * **A rajada numa frase curta**, para a lista: *"em 0,5 s · 12 · ×3 a cada
 * 0,2 s · 50%"*. A repetição e a chance só aparecem quando não são o padrão.
 */
export function burstSummary(b: Burst): string {
  const partes = [`em ${br(b.time)} s`, `${br(b.count)}`];
  if (b.cycles > 1) partes.push(`×${br(b.cycles)} a cada ${br(b.interval)} s`);
  if (b.probability < 1) partes.push(`${Math.round(b.probability * 100)}%`);
  return partes.join(' · ');
}

/** O que a linha da ficha diz: quantas rajadas, e quantas partículas elas soltam no total. */
export function burstsLine(bursts: readonly Burst[]): string {
  if (bursts.length === 0) return 'nenhuma';
  const total = bursts.reduce((s, b) => s + b.count * b.cycles, 0);
  return `${bursts.length} ${bursts.length === 1 ? 'rajada' : 'rajadas'} · ${br(total)} partículas`;
}

/** Uma rajada nova: depois da última (meio segundo adiante), com 10 partículas. */
export function addBurst(bursts: readonly Burst[]): Burst[] {
  if (bursts.length >= MAX_BURSTS) return bursts.map((b) => ({ ...b }));
  const ultima = bursts[bursts.length - 1];
  const time = ultima === undefined ? 0 : Math.round((ultima.time + 0.5) * 1000) / 1000;
  return [...bursts.map((b) => ({ ...b })), { ...BURST_DEFAULT, time, count: 10 }];
}

export function removeBurst(bursts: readonly Burst[], i: number): Burst[] {
  return bursts.filter((_, j) => j !== i).map((b) => ({ ...b }));
}

/**
 * **Mudar um campo de uma rajada**, dentro dos limites do schema: `time ≥ 0`;
 * `count` e `cycles` inteiros de 1 para cima (`cycles` até 1.048.576, §10);
 * `interval > 0`; `probability` de 0 a 1.
 */
export function setBurstField(bursts: readonly Burst[], i: number, field: BurstField, value: number): Burst[] {
  return bursts.map((b, j) => {
    if (j !== i) return { ...b };
    const v = Number.isFinite(value) ? value : BURST_DEFAULT[field];
    const limpo = field === 'time' ? Math.max(0, v)
      : field === 'count' ? Math.max(1, Math.round(v))
        : field === 'cycles' ? Math.min(1048576, Math.max(1, Math.round(v)))
          : field === 'interval' ? (v > 0 ? v : BURST_DEFAULT.interval)
            : Math.min(1, Math.max(0, v));
    return { ...b, [field]: limpo };
  });
}

/** Os cinco campos da janelinha, na ordem, com o nome que a pessoa lê. */
export const BURST_FIELDS: ReadonlyArray<{ field: BurstField; label: string; step: number; hint: string }> = [
  { field: 'time', label: 'Quando (s)', step: 0.05, hint: 'Em que segundo a rajada sai, contado do começo do emissor' },
  { field: 'count', label: 'Quantas', step: 1, hint: 'Quantas partículas saem de uma vez' },
  { field: 'cycles', label: 'Vezes', step: 1, hint: 'Quantas vezes a rajada se repete' },
  { field: 'interval', label: 'A cada (s)', step: 0.05, hint: 'Quanto tempo entre uma repetição e a outra' },
  { field: 'probability', label: 'Chance (0 a 1)', step: 0.05, hint: 'A chance de cada partícula nascer: 1 é sempre, 0,5 é metade' },
];

/**
 * **Onde a janela das rajadas abre** — segunda conferência da rodada 16
 * (05/10/2026), defeito 1: em 1920×1080 ela abria por baixo da linha do tempo,
 * com "Mais uma rajada" e "Fechar" escondidos. Ela fica **inteira dentro da
 * tela**: embaixo do botão quando cabe, senão em cima; e nunca passa da borda
 * direita nem da esquerda. Margem de 4 px. Pura: recebe as medidas.
 */
export function burstWindowPlace(
  ancora: { left: number; top: number; bottom: number },
  janela: { width: number; height: number },
  largura: number, altura: number,
): { left: number; top: number } {
  const m = 4;
  const left = Math.max(m, Math.min(ancora.left, largura - janela.width - m));
  const embaixo = ancora.bottom + 2;
  const top = embaixo + janela.height <= altura - m ? embaixo
    : Math.max(m, Math.min(ancora.top - 2 - janela.height, altura - janela.height - m));
  return { left: Math.round(left), top: Math.round(top) };
}

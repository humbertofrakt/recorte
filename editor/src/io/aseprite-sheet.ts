/**
 * A folha animada do Aseprite — §6 item 1, a outra metade.
 *
 * A **pasta numerada** já vira sequência desde o degrau 8: `numberedSequence`,
 * aqui do lado em `drop-plan.ts`, com porta no botão direito da subpasta e no
 * arrasto. O que faltava é a **folha**: um PNG com todos os quadros lado a
 * lado e um `.json` do Aseprite ao lado, dizendo onde cada quadro está.
 *
 * **O que acontecia antes deste módulo:** soltar `fogo.png` + `fogo.json` caía
 * em `{kind: 'outro'}`, o `detectFormat` devolvia `null` — não é Spine, nem
 * DragonBones, nem Spriter —, e a pessoa levava um *"não sei de que programa
 * é"*, com o PNG que veio junto jogado fora. Avisar em vez de improvisar está
 * certo (regra 21). Mas aqui dá para fazer.
 *
 * ## A conta não tem conversão de eixo, e isso não é sorte
 *
 * A **§10.1 põe a origem da região do atlas no canto superior esquerdo, com Y
 * para baixo** — que é exatamente o sistema do Aseprite. O `frame` de cada
 * quadro entra um para um em `x, y, width, height`.
 *
 * **A única conta é o corte.** O Aseprite dá `spriteSourceSize.y` contando do
 * **topo**; o `offsetY` da §10.3 conta de **baixo** (Y para cima, igual ao
 * Spine). Trocar os dois põe o desenho de cabeça para baixo dentro do próprio
 * quadro — e o defeito só aparece em arte cortada, que é a que ninguém testa.
 * Quem mexer nisto daqui a um ano vai procurar por esta frase.
 *
 * ## Onde ela desemboca
 *
 * Os quadros saem nomeados na convenção da §7.10 — `fogo_01`, `fogo_02`, … —,
 * e por isso o `numberedSequence` os reconhece **sem uma linha nova**. O anexo
 * `sequence`, o menu do botão direito e o comando de soltar continuam sendo os
 * mesmos. Uma folha e uma pasta numerada chegam ao mesmo lugar por caminhos
 * diferentes, que é o que elas são.
 *
 * Módulo puro: entra texto, sai a decisão. Nada de `File`, nada de DOM.
 */

/** Um quadro da folha, já no sistema de coordenadas da §10.3. */
export interface SheetFrame {
  /** O nome da região: `fogo_01`. */
  name: string;
  /** Canto superior esquerdo na página, Y para baixo (§10.3). */
  x: number;
  y: number;
  width: number;
  height: number;
  /** Só quando o Aseprite cortou a borda transparente. */
  offsetX?: number;
  /** **De baixo** (§10.3), já convertido do `spriteSourceSize.y`, que é de cima. */
  offsetY?: number;
  originalWidth?: number;
  originalHeight?: number;
}

/** Uma etiqueta do Aseprite: o trecho de quadros que forma uma animação. */
export interface SheetTag {
  name: string;
  /** Índices em `frames`, inclusivos nas duas pontas — como o Aseprite escreve. */
  from: number;
  to: number;
  /**
   * Como a etiqueta toca, com o TEXTO que o Aseprite escreveu: `forward`,
   * `reverse`, `pingpong` ou `pingpong_reverse` (`src/doc/anidir.cpp`). Ausente
   * no JSON = `forward`. Um texto que não é nenhum dos quatro fica como veio:
   * quem traduz é que diz "não sei" (regra 21), em vez de este leitor chutar.
   */
  direction: string;
  /**
   * Quantas vezes toca, quando o Aseprite escreveu (`"repeat": "3"`, um TEXTO).
   * `null` = não escreveu = repete sempre. No vai-e-volta cada SENTIDO conta
   * uma vez (`src/doc/playback.cpp`).
   */
  repeat: number | null;
}

/** A folha inteira, lida. */
export interface AsepriteSheet {
  /** O PNG: o `meta.image`, ou o nome do arquivo que veio no arrasto. */
  image: string;
  /** Tamanho da página, em px. */
  width: number;
  height: number;
  frames: SheetFrame[];
  /** Os nomes dos quadros, na ordem. É uma corrida numerada da §7.10. */
  names: string[];
  /** Quanto cada quadro dura, em milissegundos, como o Aseprite gravou. */
  durations: number[];
  tags: SheetTag[];
}

// ---------------------------------------------------------------------------
// Reconhecer
// ---------------------------------------------------------------------------

/** O JSON lido, ou `null` quando o texto não é JSON de objeto. */
function parse(text: string): Record<string, unknown> | null {
  const clean = text.replace(/^﻿/, '').trimStart();
  if (clean === '') return null;
  let data: unknown;
  try {
    data = JSON.parse(clean);
  } catch {
    return null;
  }
  if (data === null || typeof data !== 'object' || Array.isArray(data)) return null;
  return data as Record<string, unknown>;
}

const obj = (value: unknown): Record<string, unknown> | null =>
  (value !== null && typeof value === 'object' && !Array.isArray(value)) ? value as Record<string, unknown> : null;

const num = (value: unknown): number | null =>
  (typeof value === 'number' && Number.isFinite(value)) ? value : null;

/** Os quadros crus, na ordem, venha `frames` como lista ou como objeto. */
function rawFrames(data: Record<string, unknown>): Array<Record<string, unknown>> {
  const frames = data['frames'];
  // "Array": cada item traz o `filename`. "Hash": a chave é o nome, e a ordem
  // é a de inserção do JSON — que é a ordem dos quadros, porque é assim que o
  // Aseprite escreve.
  if (Array.isArray(frames)) return frames.map(obj).filter((f): f is Record<string, unknown> => f !== null);
  const como = obj(frames);
  if (como === null) return [];
  return Object.values(como).map(obj).filter((f): f is Record<string, unknown> => f !== null);
}

/**
 * `true` quando este texto é a exportação de uma folha do Aseprite.
 *
 * **O que manda é o conteúdo, e não a extensão.** `.json` é a extensão mais
 * disputada do arrasto: Spine, DragonBones e o `.scon` do Spriter terminam
 * todos nela, e o atlas do próprio Recorte também. Reconhecer pela extensão
 * seria roubar o arquivo de outro importador.
 *
 * As três perguntas, e as três têm de dar sim: o `meta.app` diz Aseprite, há
 * `frames`, e há **pelo menos um** quadro. Um `frames` vazio não é folha —
 * não há o que cortar, e tratá-lo como folha daria um anexo sem imagem.
 */
export function isAsepriteSheet(text: string): boolean {
  const data = parse(text);
  if (data === null) return false;
  const meta = obj(data['meta']);
  if (meta === null) return false;
  const app = typeof meta['app'] === 'string' ? meta['app'].toLowerCase() : '';
  if (!app.includes('aseprite')) return false;
  return rawFrames(data).length > 0;
}

// ---------------------------------------------------------------------------
// Nomear
// ---------------------------------------------------------------------------

/**
 * Os nomes dos `count` quadros de `base`, na convenção da §7.10.
 *
 * `fogo`, 3 → `fogo_01, fogo_02, fogo_03`. A quantidade de algarismos é a do
 * ÚLTIMO número (dois, no mínimo), e é a mesma em todos: é o que o
 * `numberedSequence` exige, e é o que faz cem quadros ordenarem certo
 * (`chuva_099` antes de `chuva_100`).
 *
 * O nome do Aseprite (`"fogo 0.aseprite"`) não é usado: ele carrega a extensão
 * do arquivo de origem e um espaço, e nem toda exportação o traz. O que o
 * formato precisa é de uma corrida, e a corrida se conta do zero.
 */
export function asepriteFrameNames(base: string, count: number): string[] {
  // Dois algarismos no mínimo: `fogo_01` e não `fogo_1`. É o que a §7.10
  // chama de `digits`, e é o que faz a lista ordenar certo em qualquer
  // lugar que ordene por texto — inclusive a pasta do sistema.
  const digits = Math.max(2, String(count).length);
  const out: string[] = [];
  for (let i = 1; i <= count; i++) out.push(`${base}_${String(i).padStart(digits, '0')}`);
  return out;
}

/** `imagens/fogo.png` → `fogo`: sem a pasta e sem a extensão. */
function baseNameOf(path: string): string {
  const last = path.split(/[\\/]/).pop() ?? path;
  const dot = last.lastIndexOf('.');
  return dot > 0 ? last.slice(0, dot) : last;
}

// ---------------------------------------------------------------------------
// Cortar
// ---------------------------------------------------------------------------

/**
 * A folha lida, ou `null` quando este texto não é uma.
 *
 * `imagePath` é o PNG que veio no arrasto: ele dá o nome da base dos quadros e,
 * quando o `meta.image` falta, dá também a página.
 */
export function asepriteSheet(text: string, imagePath: string): AsepriteSheet | null {
  if (!isAsepriteSheet(text)) return null;
  const data = parse(text)!;
  const meta = obj(data['meta'])!;
  const crus = rawFrames(data);

  const base = baseNameOf(imagePath);
  const names = asepriteFrameNames(base, crus.length);

  const frames: SheetFrame[] = [];
  const durations: number[] = [];
  for (let i = 0; i < crus.length; i++) {
    const cru = crus[i]!;
    const rect = obj(cru['frame']);
    const x = num(rect?.['x']) ?? 0;
    const y = num(rect?.['y']) ?? 0;
    const width = num(rect?.['w']) ?? 0;
    const height = num(rect?.['h']) ?? 0;
    const frame: SheetFrame = { name: names[i]!, x, y, width, height };

    // **O corte, e a única conversão de eixo do módulo.** O Aseprite conta o
    // `spriteSourceSize.y` do TOPO; a §10.3 conta o `offsetY` de BAIXO.
    const fonte = obj(cru['sourceSize']);
    const dentro = obj(cru['spriteSourceSize']);
    const ow = num(fonte?.['w']);
    const oh = num(fonte?.['h']);
    if (ow !== null && oh !== null && (ow !== width || oh !== height)) {
      const dx = num(dentro?.['x']) ?? 0;
      const dy = num(dentro?.['y']) ?? 0;
      frame.offsetX = dx;
      frame.offsetY = oh - dy - height;
      frame.originalWidth = ow;
      frame.originalHeight = oh;
    }
    frames.push(frame);
    durations.push(num(cru['duration']) ?? 100);
  }

  const size = obj(meta['size']);
  const tags: SheetTag[] = [];
  const cruas = meta['frameTags'];
  if (Array.isArray(cruas)) {
    for (const item of cruas) {
      const tag = obj(item);
      const name = typeof tag?.['name'] === 'string' ? tag['name'] : null;
      const from = num(tag?.['from']);
      const to = num(tag?.['to']);
      if (name === null || from === null || to === null) continue;
      const direction = typeof tag?.['direction'] === 'string' ? tag['direction'] : 'forward';
      // O Aseprite grava o `repeat` entre aspas; um leitor que só aceitasse
      // número perderia todos. Zero ou lixo = não escreveu.
      const cru = tag?.['repeat'];
      const vezes = typeof cru === 'string' ? Number(cru) : num(cru);
      const repeat = vezes !== null && Number.isInteger(vezes) && vezes > 0 ? vezes : null;
      tags.push({ name, from, to, direction, repeat });
    }
  }

  return {
    image: typeof meta['image'] === 'string' && meta['image'] !== '' ? meta['image'] : imagePath,
    // Sem `meta.size`, a página é o que os quadros alcançam: nunca um palpite
    // redondo, que faria as UVs saírem tortas sem ninguém saber por quê.
    width: num(size?.['w']) ?? frames.reduce((w, f) => Math.max(w, f.x + f.width), 0),
    height: num(size?.['h']) ?? frames.reduce((h, f) => Math.max(h, f.y + f.height), 0),
    frames,
    names,
    durations,
    tags,
  };
}

/** A frase da dica e do rodapé, para quem soltou saber o que vai entrar. */
export function sheetNotice(sheet: AsepriteSheet): string {
  const quadros = `${sheet.frames.length} quadro${sheet.frames.length === 1 ? '' : 's'}`;
  const etiquetas = sheet.tags.length === 0
    ? ''
    : `, com ${sheet.tags.length} etiqueta${sheet.tags.length === 1 ? '' : 's'} (${sheet.tags.map((t) => t.name).join(', ')})`;
  return `Folha do Aseprite: ${quadros} em ${sheet.image}${etiquetas}`;
}

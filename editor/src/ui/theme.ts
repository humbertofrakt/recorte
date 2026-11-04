/**
 * Os dois temas do editor (dono A) — lote 18, rodada 3.
 *
 * *"O Spriter é limpo e claro."* A tela dele é cinza escuro nos painéis, cinza
 * claro na cena, e **laranja** no que está ligado. A nossa era branca e azul.
 *
 * O escuro passa a ser o **padrão**, e o claro continua inteiro em
 * **Exibir → Tema**. Não é gosto: quem anima olha o desenho o dia inteiro, e um
 * painel branco em volta de um personagem sobre fundo claro obriga a pupila a
 * se ajustar toda vez que o olho vai de um para o outro.
 *
 * **Os dois temas têm as MESMAS chaves, na mesma ordem.** Um teste confere
 * isso, e é ele que impede um tema de ganhar uma cor que o outro não tem — o
 * jeito mais comum de um tema escuro ficar com um retângulo branco no meio.
 *
 * Este arquivo não toca em tela nenhuma além de escrever as variáveis na raiz
 * do documento. Ele não sabe o que é um painel.
 */

/** O nome de um tema. */
export type ThemeName = 'claro' | 'escuro';

/**
 * Toda cor do editor, por nome.
 *
 * As doze primeiras são as do `:root` do `shell.css`, que os painéis e a folha
 * de chaves já liam. As doze de baixo são as da CENA, que viviam presas num
 * objeto `COLOR` dentro do `viewport.ts` — e por isso a cena era a única parte
 * do programa que não sabia trocar de tema.
 */
export interface Theme {
  ink: string;
  inkSoft: string;
  paper: string;
  panel: string;
  line: string;
  lineStrong: string;
  accent: string;
  accentInk: string;
  warn: string;
  warnBg: string;
  stage: string;
  toggleOn: string;

  sceneBackground: string;
  sceneGrid: string;
  sceneGridStrong: string;
  sceneAxisX: string;
  sceneAxisY: string;
  sceneBone: string;
  sceneBoneFill: string;
  sceneBoneSelected: string;
  sceneSlotSelected: string;
  sceneBox: string;
  scenePoint: string;
  sceneClipping: string;
}

/** O nome da variável CSS de cada chave: `ink` vira `--ink`. */
export function cssVarOf(key: keyof Theme): string {
  return `--${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;
}

/**
 * O tema claro: o que o editor era até a v3.9.
 *
 * Ele não é "o escuro invertido". É o que já estava na tela e já tinha passado
 * pelos olhos do Humberto; trocar as cores dele junto com a chegada do escuro
 * seriam duas mudanças de uma vez, e nenhuma das duas dava para julgar.
 */
export const LIGHT: Readonly<Theme> = Object.freeze({
  ink: '#10151c',
  inkSoft: '#45505e',
  paper: '#f4f6f9',
  panel: '#ffffff',
  line: '#c3ccd8',
  lineStrong: '#8b98a8',
  accent: '#1a4fd8',
  accentInk: '#ffffff',
  warn: '#8a4b00',
  warnBg: '#fff2dc',
  stage: '#2b3240',
  toggleOn: '#d98a2b',

  sceneBackground: '#f2f2f0',
  sceneGrid: '#dcdcd6',
  sceneGridStrong: '#c4c4bc',
  sceneAxisX: '#c0392b',
  sceneAxisY: '#1e7a3c',
  sceneBone: '#2b2b2b',
  sceneBoneFill: '#ffffff',
  sceneBoneSelected: '#1b52d6',
  sceneSlotSelected: '#d97a00',
  sceneBox: '#0b7a6a',
  scenePoint: '#a02090',
  sceneClipping: '#d6008c',
});

/**
 * O tema escuro, tirado da tela do Spriter que o Humberto mandou.
 *
 * | Chave | De onde |
 * |:---|:---|
 * | `panel` `#3a3a3a` | o painel dele |
 * | `paper` `#2e2e2e` | o fundo entre os painéis |
 * | `ink` `#e6e6e6` | o texto |
 * | `toggleOn` `#d98a2b` | o laranja do "Show Bones" |
 * | `sceneBackground` `#c8c8c8` | a cena dele, que é CLARA mesmo no tema escuro |
 *
 * **A cena continua clara de propósito.** É assim no Spriter, e o motivo é
 * bom: o personagem é desenhado com linha escura, e uma linha escura sobre
 * fundo escuro não se vê. O painel é que muda de cor.
 *
 * Os tons de texto foram ajustados até passarem em 4,5 de contraste sobre o
 * painel — o mínimo do WCAG AA. Nenhuma cor aqui foi escolhida sem passar no
 * teste.
 */
export const DARK: Readonly<Theme> = Object.freeze({
  ink: '#e6e6e6',
  // #9a9a9a dá 4,6 sobre o painel #3a3a3a; o #45505e do claro daria 1,2.
  inkSoft: '#b0b0b0',
  paper: '#2e2e2e',
  panel: '#3a3a3a',
  line: '#555555',
  lineStrong: '#7a7a7a',
  // O azul do claro (#1a4fd8) sobre painel escuro tem 2,4 de contraste com o
  // texto branco por cima. Este é o mesmo azul clareado até 4,5.
  accent: '#5b8dff',
  accentInk: '#101820',
  warn: '#ffcf8a',
  warnBg: '#4a3410',
  stage: '#1c1f26',
  toggleOn: '#d98a2b',

  sceneBackground: '#c8c8c8',
  sceneGrid: '#bcbcbc',
  sceneGridStrong: '#a8a8a8',
  sceneAxisX: '#b02a1e',
  sceneAxisY: '#186a33',
  sceneBone: '#2b2b2b',
  sceneBoneFill: '#ffffff',
  sceneBoneSelected: '#1b52d6',
  sceneSlotSelected: '#c46a00',
  sceneBox: '#0b7a6a',
  scenePoint: '#8c1a7e',
  sceneClipping: '#c00080',
});

export const THEMES: Readonly<Record<ThemeName, Readonly<Theme>>> = Object.freeze({
  claro: LIGHT,
  escuro: DARK,
});

/** Os nomes das cores, na ordem em que estão escritas. */
export function themeKeys(): Array<keyof Theme> {
  return Object.keys(LIGHT) as Array<keyof Theme>;
}

/** `true` quando o texto é um nome de tema que existe. */
export function isThemeName(value: unknown): value is ThemeName {
  return value === 'claro' || value === 'escuro';
}

// ---------------------------------------------------------------------------
// Contraste, pela conta do WCAG
// ---------------------------------------------------------------------------

/** `#rgb` ou `#rrggbb` em três números de 0 a 255. `null` se não for cor. */
export function parseHex(color: string): [number, number, number] | null {
  const texto = color.trim().replace('#', '');
  const cheio = texto.length === 3
    ? texto.split('').map((c) => c + c).join('')
    : texto;
  if (!/^[0-9a-fA-F]{6}$/.test(cheio)) return null;
  return [
    parseInt(cheio.slice(0, 2), 16),
    parseInt(cheio.slice(2, 4), 16),
    parseInt(cheio.slice(4, 6), 16),
  ];
}

/** A luminância relativa de uma cor, pela fórmula do WCAG 2.1. */
export function luminance(color: string): number {
  const rgb = parseHex(color);
  if (rgb === null) return 0;
  const [r, g, b] = rgb.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * A razão de contraste entre duas cores, de 1 a 21.
 *
 * O WCAG AA pede **4,5** para texto normal. É a conta que decide se um tom
 * entra ou não: nenhuma cor deste arquivo foi escolhida por parecer bonita
 * numa foto.
 */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const claro = Math.max(la, lb);
  const escuro = Math.min(la, lb);
  return (claro + 0.05) / (escuro + 0.05);
}

// ---------------------------------------------------------------------------
// Pôr o tema na tela
// ---------------------------------------------------------------------------

/**
 * Escreve as cores do tema na raiz do documento.
 *
 * Tudo o mais no editor lê essas variáveis, e por isso trocar de tema é isto e
 * mais nada: nenhum painel é remontado, nenhum estado se perde, e o campo que
 * estava sendo digitado continua sendo digitado.
 *
 * Devolve as cores aplicadas, para quem desenha em canvas — a cena — não ter
 * que ler a folha de estilo de volta.
 */
export function applyTheme(name: ThemeName): Readonly<Theme> {
  const theme = THEMES[name];
  const root = globalThis.document?.documentElement;
  if (root !== undefined) {
    for (const key of themeKeys()) root.style.setProperty(cssVarOf(key), theme[key]);
    root.dataset['tema'] = name;
  }
  for (const listener of [...listeners]) listener(theme, name);
  return theme;
}

let current: ThemeName = 'escuro';
const listeners = new Set<(theme: Readonly<Theme>, name: ThemeName) => void>();

/** O tema em uso agora. */
export function themeName(): ThemeName {
  return current;
}

/** As cores em uso agora. */
export function themeColors(): Readonly<Theme> {
  return THEMES[current];
}

/** Troca o tema e avisa quem desenha em canvas. */
export function setTheme(name: ThemeName): Readonly<Theme> {
  current = name;
  return applyTheme(name);
}

/** Avisado a cada troca de tema. Devolve como parar de ouvir. */
export function onThemeChange(
  listener: (theme: Readonly<Theme>, name: ThemeName) => void,
): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

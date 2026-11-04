/**
 * A pasta do projeto (dono A) — lote 59, plano pasta do projeto.
 *
 * O Humberto, 10/09/2026: *"para começar o projeto, a gente segue o caminho do
 * Spriter. Ele pede para abrir uma pasta. Os arquivos da pasta ficam na
 * lateral, e a gente arrasta para dentro para montar o personagem."* E: *"no
 * Spriter não existe importar imagens."*
 *
 * Até aqui era o contrário. **Importar → Imagens…** empacotava na hora e jogava
 * cada imagem na cena, numa fila: doze imagens de 580 px viraram uma fila de
 * 7.000 px, e a cena foi a 9%. Com a pasta, **imagem não entra na cena
 * sozinha**. Ela fica na aba Imagens, por subpasta, e só entra quando é
 * arrastada, onde foi solta.
 *
 * Duas metades, e a de cima é pura:
 *
 * - a **conta** — que nome tem cada imagem, em que subpasta ela mora, em que
 *   ordem aparecem (`01 (2)` antes de `01 (10)`), o que o Recarregar mudou;
 * - o **navegador** — `showDirectoryPicker`, o `<input webkitdirectory>` de
 *   quem não tem ele, a varredura das subpastas, e a leitura preguiçosa: os
 *   pixels de uma imagem só são lidos quando ela aparece na aba ou entra na
 *   cena. Quinhentas imagens abrem sem travar.
 *
 * A pasta NÃO vai para o `.bone`. É o lugar de trabalho, como o arquivo aberto:
 * o `.bone` guarda os caminhos das imagens (o nome da região é o caminho
 * relativo, `maos/mao_aberta`, que a §10.3 já permite), e quem abre a pasta de
 * novo reencontra as mesmas imagens pelos mesmos nomes.
 */

import { regionNameFromPath } from '../../../ferramentas/src/atlas/packer.js';
import type { BoneFile } from '../../../runtime/src/index.js';
import type { EditorDoc } from '../contract.js';
import { readEditorState } from '../contract.js';
import { pastePivot, roundPivot } from './pivot-model.js';
import { recentFiles, recentHandles, rememberRecent } from './recent.js';

/** As imagens que a pasta mostra. Qualquer uma que o navegador decodifica. */
export const FOLDER_IMAGE_TYPES = ['.png', '.webp', '.jpg', '.jpeg', '.gif', '.bmp'] as const;

// ---------------------------------------------------------------------------
// A conta, sem navegador
// ---------------------------------------------------------------------------

/** `true` para um arquivo de imagem, pelo nome. */
export function isFolderImage(path: string): boolean {
  const lower = path.toLowerCase();
  return FOLDER_IMAGE_TYPES.some((ext) => lower.endsWith(ext));
}

/**
 * Pasta que a varredura pula: escondida (`.git`, `.claude`) e `node_modules`.
 * Nenhuma delas guarda arte, e a `node_modules` sozinha tem milhares de PNG.
 */
export function skipFolderEntry(name: string): boolean {
  return name.startsWith('.') || name === 'node_modules';
}

/** O nome da imagem: o caminho relativo, sem a extensão (§10.3). */
export function imageNameOf(relativePath: string): string {
  return regionNameFromPath(relativePath);
}

/**
 * O caminho dentro da pasta, a partir do `webkitRelativePath`.
 *
 * O `<input webkitdirectory>` escreve o nome da pasta escolhida na frente —
 * `exemplos/maos/a.png` —, e o nome da imagem não pode levar esse pedaço: com
 * ele, abrir a mesma pasta por outro caminho daria outros nomes.
 */
export function relativeInsideFolder(webkitRelativePath: string): string {
  const clean = webkitRelativePath.replace(/\\/g, '/');
  const cut = clean.indexOf('/');
  return cut < 0 ? clean : clean.slice(cut + 1);
}

/** A subpasta de um nome: `maos/mao_aberta` dá `maos`; sem barra, `''`. */
export function folderOf(name: string): string {
  const cut = name.lastIndexOf('/');
  return cut < 0 ? '' : name.slice(0, cut);
}

/** O último pedaço de um nome: `maos/mao_aberta` dá `mao_aberta`. */
export function baseOf(name: string): string {
  const cut = name.lastIndexOf('/');
  return cut < 0 ? name : name.slice(cut + 1);
}

/** Separa os números do texto, para comparar `2` com `10` como números. */
function chunks(text: string): Array<string | number> {
  const out: Array<string | number> = [];
  for (const part of text.match(/\d+|\D+/g) ?? []) {
    out.push(/^\d/.test(part) ? Number(part) : part.toLowerCase());
  }
  return out;
}

/**
 * A ordem natural: `01 (2)` antes de `01 (10)`, e `mao_9` antes de `mao_10`.
 *
 * É a ordem do Explorador do Windows, e a que qualquer um espera. A ordem das
 * letras poria `01 (10)`, `01 (11)` e `01 (12)` antes de `01 (2)`.
 */
export function naturalCompare(a: string, b: string): number {
  const x = chunks(a);
  const y = chunks(b);
  for (let i = 0; i < Math.min(x.length, y.length); i++) {
    const p = x[i]!;
    const q = y[i]!;
    if (p === q) continue;
    if (typeof p === 'number' && typeof q === 'number') return p - q;
    return String(p) < String(q) ? -1 : 1;
  }
  if (x.length !== y.length) return x.length - y.length;
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Uma subpasta, com as imagens dela. `folder` vazio é a raiz. */
export interface FolderSection {
  folder: string;
  /** Os nomes inteiros (`maos/mao_aberta`), em ordem natural. */
  images: string[];
}

/**
 * A lista de nomes, virada em subpastas.
 *
 * As subpastas em ordem natural, e a **raiz por último**: quem organizou as
 * mãos numa pasta e as cabeças noutra quer ver as pastas primeiro; o que ficou
 * solto na raiz é o resto. Subpasta dentro de subpasta vira uma seção com o
 * caminho inteiro (`personagem/maos`).
 */
export function folderTree(names: readonly string[]): FolderSection[] {
  const byFolder = new Map<string, string[]>();
  for (const name of new Set(names)) {
    const folder = folderOf(name);
    const list = byFolder.get(folder) ?? [];
    list.push(name);
    byFolder.set(folder, list);
  }
  const folders = [...byFolder.keys()].sort((a, b) => {
    if (a === '' || b === '') return a === '' ? (b === '' ? 0 : 1) : -1;
    return naturalCompare(a, b);
  });
  return folders.map((folder) => ({
    folder,
    images: byFolder.get(folder)!.sort((a, b) => naturalCompare(baseOf(a), baseOf(b))),
  }));
}

/** O que o Recarregar achou de diferente, antes de mexer em qualquer coisa. */
export interface ReloadPlan {
  /** Imagens novas na pasta. */
  added: string[];
  /** Apagadas da pasta e sem uso: saem da aba. */
  removed: string[];
  /** Apagadas da pasta, mas um desenho usa: ficam, marcadas "arquivo sumiu". */
  missing: string[];
  /** O arquivo mudou (data diferente): miniatura e cena se refazem. */
  changed: string[];
}

/**
 * A conta do **Recarregar**.
 *
 * `before` e `after` são as imagens da pasta antes e agora, com a data do
 * arquivo; `used` são os nomes que algum desenho do arquivo mostra. Imagem
 * apagada que está em uso **não some da aba**: apagar a aba debaixo de um
 * desenho deixaria o desenho sem nome de onde veio.
 */
export function reloadPlan(
  before: ReadonlyArray<{ name: string; modified?: number }>,
  after: ReadonlyArray<{ name: string; modified?: number }>,
  used: ReadonlySet<string>,
): ReloadPlan {
  const old = new Map(before.map((image) => [image.name, image.modified]));
  const now = new Map(after.map((image) => [image.name, image.modified]));
  const plan: ReloadPlan = { added: [], removed: [], missing: [], changed: [] };
  for (const [name, modified] of now) {
    if (!old.has(name)) plan.added.push(name);
    else if (modified !== old.get(name)) plan.changed.push(name);
  }
  for (const name of old.keys()) {
    if (now.has(name)) continue;
    if (used.has(name)) plan.missing.push(name);
    else plan.removed.push(name);
  }
  for (const list of Object.values(plan)) list.sort(naturalCompare);
  return plan;
}

/** A frase do rodapé depois do Recarregar. */
export function reloadNotice(folder: string, plan: ReloadPlan): string {
  const parts: string[] = [];
  const count = (n: number, one: string, many: string): string => (n === 1 ? one : `${n} ${many}`);
  if (plan.added.length > 0) parts.push(count(plan.added.length, '1 imagem nova', 'imagens novas'));
  if (plan.changed.length > 0) parts.push(count(plan.changed.length, '1 mudou', 'mudaram'));
  if (plan.removed.length > 0) parts.push(count(plan.removed.length, '1 saiu', 'saíram'));
  if (plan.missing.length > 0) {
    parts.push(`${count(plan.missing.length, '1 sumiu', 'sumiram')} da pasta e continua${
      plan.missing.length === 1 ? '' : 'm'} na aba, porque um desenho usa`);
  }
  const quem = folder === '' ? 'A pasta' : `A pasta ${folder}`;
  return parts.length === 0 ? `${quem} está igual. Nada mudou` : `${quem} foi relida: ${parts.join(', ')}`;
}

/**
 * As imagens da **mesma subpasta** que `name` — lote 60. É a lista que o
 * campo de imagem do Spriter abre: trocar a mão mostra as mãos, e não a
 * cabeça. Imagem da raiz dá só as da raiz. Em ordem natural.
 */
export function sameFolderImages(names: readonly string[], name: string): string[] {
  const folder = folderOf(name);
  return [...new Set(names)]
    .filter((other) => folderOf(other) === folder)
    .sort((a, b) => naturalCompare(baseOf(a), baseOf(b)));
}

// ---------------------------------------------------------------------------
// Trocar a pasta de origem — degrau 8, tarefa 8.3 (I4)
// ---------------------------------------------------------------------------

/*
 * Ideia do Humberto, 16/09: *"apontar para outra pasta e trocar todo o acervo
 * pelas imagens de mesmo nome"*. É o **character map por nome de arquivo**: a
 * mesma montagem, com a arte do herói de armadura, ou a do herói ferido.
 *
 * O **Recarregar** relê a MESMA pasta e não serve para isso: ele compara nomes
 * inteiros (`maos/mao_aberta`), e a pasta nova tem os mesmos nomes em outro
 * lugar. O que casa aqui é o **nome do arquivo**, sem a subpasta.
 *
 * **Nome repetido avisa, não escolhe** (I4, palavra dele). Se a pasta nova tem
 * `mao_aberta` em duas subpastas, o programa não tem como saber qual é a certa,
 * e escolher uma seria trocar a arte errada em silêncio — o defeito da regra 21.
 * Aquela imagem fica como está, e a barra diz quais eram as candidatas.
 */

/** Uma troca de imagem: a que sai e a que entra, as duas pelo nome inteiro. */
export interface FolderSwap {
  from: string;
  to: string;
}

/** O que a troca de pasta vai fazer, antes de mexer em coisa alguma. */
export interface FolderSwapPlan {
  /** As trocas que dá para fazer, em ordem natural pelo nome que sai. */
  swaps: FolderSwap[];
  /** Nomes de arquivo que aparecem em mais de um lugar na pasta nova. */
  ambiguous: Array<{ base: string; from: string; candidates: string[] }>;
  /** As imagens de hoje que a pasta nova não tem. Ficam como estão. */
  missing: string[];
  /**
   * As imagens de hoje que a pasta nova tem **no mesmo caminho** — rodada 44,
   * lote 1. Não há o que trocar, e não é palpite: quando um dos candidatos é o
   * nome inteiro de agora, ele É a imagem de agora. É o jeito do Spriter: a
   * roupa de inverno numa subpasta com os mesmos nomes (`inverno/body`) não
   * torna o `body` da raiz ambíguo.
   */
  same: string[];
}

/**
 * O plano da troca: o que casa por **nome de arquivo**, o que está repetido e
 * o que não tem par. Puro: entram duas listas de nomes, sai a decisão.
 *
 * Uma imagem que casa com ela mesma (mesmo nome inteiro) fica de fora das
 * trocas: não há o que trocar, e contá-la infla o número do rodapé.
 */
export function folderSwapPlan(
  current: readonly string[], incoming: readonly string[],
): FolderSwapPlan {
  const porBase = new Map<string, string[]>();
  for (const name of new Set(incoming)) {
    const base = baseOf(name);
    const lista = porBase.get(base);
    if (lista === undefined) porBase.set(base, [name]);
    else lista.push(name);
  }

  const plan: FolderSwapPlan = { swaps: [], ambiguous: [], missing: [], same: [] };
  for (const from of [...new Set(current)].sort(naturalCompare)) {
    const candidatos = porBase.get(baseOf(from));
    if (candidatos === undefined) {
      plan.missing.push(from);
      continue;
    }
    if (candidatos.includes(from)) {
      plan.same.push(from);
      continue;
    }
    if (candidatos.length > 1) {
      plan.ambiguous.push({ base: baseOf(from), from, candidates: [...candidatos].sort(naturalCompare) });
      continue;
    }
    const to = candidatos[0]!;
    if (to !== from) plan.swaps.push({ from, to });
  }
  return plan;
}

/**
 * `true` quando a pasta nova **vira a origem** — rodada 44, lote 1. Basta ela
 * ter um nome em comum com o personagem; antes, só quando havia troca, e a
 * pasta de mesmos nomes (ou de nomes repetidos) não entrava, enquanto o
 * rodapé dizia "virou a origem".
 */
export function folderBecomesSource(plan: FolderSwapPlan): boolean {
  return plan.swaps.length + plan.ambiguous.length + plan.same.length > 0;
}

/**
 * Quantas imagens da pasta nova **entram** na aba Imagens sem trocar nada —
 * rodada 44, lote 1: a arma nova, a roupa de inverno. O rodapé diz o número.
 */
export function folderSwapNewImages(
  current: readonly string[], incoming: readonly string[], plan: FolderSwapPlan,
): number {
  const conhecidas = new Set([...current, ...plan.swaps.map((s) => s.to)]);
  return [...new Set(incoming)].filter((name) => !conhecidas.has(name)).length;
}

/** A frase do rodapé depois de trocar a pasta de origem. */
/**
 * Até três nomes, e "e mais N" — rodada 44, lote 5. O rodapé dizia só a conta
 * ("8 não existem lá"), e quem lê não sabia QUAIS ir procurar.
 */
export function namesForNotice(names: readonly string[], max = 3): string {
  const mostra = names.slice(0, max).join(', ');
  return names.length > max ? `${mostra} e mais ${names.length - max}` : mostra;
}

/**
 * O que aconteceu com as imagens de MESMO nome — rodada 44, lote 5. A pasta
 * nova é outra pasta: o mesmo nome é outro arquivo (o conferente apontou a
 * subpasta `alt`, de cores invertidas, e ouviu "já eram dela" com a cena
 * igual). `recarregadas` = as da pasta, que a cena passou a mostrar; o resto
 * mora num atlas salvo, e a cena continua com ele.
 */
export interface SameNameOutcome {
  recarregadas: readonly string[];
  noAtlas: readonly string[];
}

export function folderSwapNotice(
  folder: string, plan: FolderSwapPlan, novas = 0, mesmos?: SameNameOutcome,
): string {
  const partes: string[] = [];
  partes.push(plan.swaps.length === 0 ? 'nenhuma imagem trocada'
    : plan.swaps.length === 1 ? '1 imagem trocada' : `${plan.swaps.length} imagens trocadas`);
  if (mesmos !== undefined) {
    const r = mesmos.recarregadas.length;
    const a = mesmos.noAtlas.length;
    if (r > 0) partes.push(r === 1 ? '1 de mesmo nome: a cena mostra a de lá' : `${r} de mesmo nome: a cena mostra as de lá`);
    if (a > 0) {
      partes.push(`${a === 1 ? '1 de mesmo nome está' : `${a} de mesmo nome estão`} no atlas salvo, e a cena continua com `
        + `${a === 1 ? 'ela' : 'elas'} (${namesForNotice(mesmos.noAtlas)})`);
    }
  } else if (plan.same.length > 0) {
    partes.push(plan.same.length === 1
      ? '1 já era dela (mesmo nome, mesmo lugar)'
      : `${plan.same.length} já eram dela (mesmo nome, mesmo lugar)`);
  }
  if (novas > 0) partes.push(novas === 1 ? '1 imagem nova na aba Imagens' : `${novas} imagens novas na aba Imagens`);
  if (plan.missing.length > 0) {
    partes.push(plan.missing.length === 1
      ? `1 não existe lá e ficou como estava (${plan.missing[0]})`
      : `${plan.missing.length} não existem lá e ficaram como estavam (${namesForNotice(plan.missing)})`);
  }
  if (plan.ambiguous.length > 0) {
    const um = plan.ambiguous[0]!;
    partes.push(plan.ambiguous.length === 1
      ? `1 nome está repetido lá e NÃO foi trocado: "${um.base}" está em ${um.candidates.join(' e ')}`
      : `${plan.ambiguous.length} nomes estão repetidos lá e NÃO foram trocados — o primeiro: `
        + `"${um.base}" está em ${um.candidates.join(' e ')}`);
  }
  const quem = folder === '' ? 'A pasta' : `A pasta ${folder}`;
  // Sem troca nenhuma e sem nome repetido, o acervo ficou igual — e dizer
  // "0 imagens trocadas" no meio de uma lista faria parecer que algo se mexeu.
  return !folderBecomesSource(plan)
    ? `${quem} não tem nenhuma imagem com os nomes deste personagem. Nada mudou`
    : `${quem} virou a origem: ${partes.join('; ')}`;
}

// ---------------------------------------------------------------------------
// A região provisória — lote 60
// ---------------------------------------------------------------------------

/*
 * Uma imagem da pasta que entra na cena ganha uma **região provisória**: uma
 * página que é a própria imagem, e uma região que é a imagem inteira. Nada é
 * empacotado. A cena, as miniaturas, o pivô e a troca pelo pivô (lote 56)
 * funcionam igual: é uma região como outra. O atlas de verdade nasce ao salvar
 * (lote 62), só com as provisórias em uso.
 *
 * A página provisória leva um `image` com o prefixo `.pasta/`, que nunca vai
 * para o disco: a imagem `heroi.png` da pasta não pode tapar a página
 * `heroi.png` do atlas do herói na hora de a cena procurar os pixels.
 */

/** O prefixo do `image` de uma página provisória. Nunca vai para o disco. */
export const PROVISIONAL_IMAGE = '.pasta/';
/** O prefixo do nome de uma página provisória. */
export const PROVISIONAL_PAGE = 'pasta:';

/** A região provisória de uma imagem da pasta, com o pivô guardado quando há. */
export interface ProvisionalRegion {
  name: string;
  /** O caminho da imagem na pasta: a página é ela. */
  page: string;
  x: 0;
  y: 0;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  pivotX?: number;
  pivotY?: number;
}

/** A região de uma imagem da pasta: a imagem inteira, na página que é ela. */
export function provisionalRegion(
  image: { name: string; path: string; width?: number; height?: number },
  pivot?: readonly [number, number],
): ProvisionalRegion {
  const width = image.width ?? 0;
  const height = image.height ?? 0;
  const region: ProvisionalRegion = {
    name: image.name, page: image.path, x: 0, y: 0, width, height,
    originalWidth: width, originalHeight: height,
  };
  if (pivot !== undefined) {
    region.pivotX = pivot[0];
    region.pivotY = pivot[1];
  }
  return region;
}

/** `true` para o atlas das regiões provisórias: toda página dele é da pasta. */
export function isProvisionalAtlas(atlas: { pages: readonly { image: string }[] }): boolean {
  return atlas.pages.length > 0 && atlas.pages.every((page) => page.image.startsWith(PROVISIONAL_IMAGE));
}

import type { AsepriteSheet } from './aseprite-sheet.js';

/** Uma página do atlas provisório, como o `.atlas.json` a escreve (§10.2). */
interface TreePage { name: string; image: string; width: number; height: number }
/** Uma região do atlas provisório (§10.3). */
interface TreeRegion {
  name: string; page: number; x: number; y: number; width: number; height: number;
  pivotX?: number; pivotY?: number; [key: string]: unknown;
}
/** O atlas provisório como árvore. */
export interface ProvisionalTree {
  atlas: { version: string; generator: string };
  scale?: number;
  pages: TreePage[];
  regions: TreeRegion[];
}

/**
 * A árvore do atlas provisório com mais esta imagem — ou com ela trocada, se já
 * estava (o Recarregar trouxe pixels novos). Puro: a árvore de entrada não muda.
 *
 * O pivô que a região já tinha **fica**: foi alguém que o definiu. Sem ele, o
 * `pivot` dado (o guardado para a pasta, lote 61).
 */
/**
 * A árvore do atlas provisório com uma **folha do Aseprite** dentro: UMA página
 * (o PNG inteiro) e uma região por quadro. Puro, como o `withProvisional`.
 *
 * É a diferença entre a folha e a pasta numerada, e é toda a diferença: uma
 * pasta traz N imagens, e cada uma vira uma página de uma região só; uma folha
 * traz UMA imagem, e ela vira uma página de N regiões. Daí para a frente as
 * duas são a mesma coisa — os nomes saem na convenção da §7.10, e o
 * `numberedSequence` as reconhece igual.
 *
 * **Sem conversão de eixo:** a §10.1 põe a origem da região no canto superior
 * esquerdo, Y para baixo, que é o sistema do Aseprite. Quem já converteu o que
 * havia para converter — o `offsetY` do quadro cortado — foi o
 * `io/aseprite-sheet.ts`.
 *
 * `path` é o caminho do PNG dentro da pasta do projeto, como o
 * `withProvisional` o usa: é por ele que os pixels são achados depois.
 */
export function withSheet(
  tree: ProvisionalTree | null, sheet: AsepriteSheet, path: string,
): ProvisionalTree {
  const out: ProvisionalTree = tree === null
    ? { atlas: { version: '1.0', generator: 'Recorte editor (pasta)' }, pages: [], regions: [] }
    : JSON.parse(JSON.stringify(tree)) as ProvisionalTree;

  const pageName = PROVISIONAL_PAGE + sheet.image;
  const page: TreePage = {
    name: pageName, image: PROVISIONAL_IMAGE + path, width: sheet.width, height: sheet.height,
  };
  let index = out.pages.findIndex((p) => p.name === pageName);
  if (index < 0) {
    out.pages.push(page);
    index = out.pages.length - 1;
  } else {
    out.pages[index] = page;
  }

  for (const frame of sheet.frames) {
    const region: TreeRegion = {
      name: frame.name, page: index,
      x: frame.x, y: frame.y, width: frame.width, height: frame.height,
    };
    // Campo ausente diz o mesmo que zero (§10.3), e um arquivo sem campo morto
    // é um arquivo que se lê. Só o quadro CORTADO carrega os quatro.
    if (frame.offsetX !== undefined) region['offsetX'] = frame.offsetX;
    if (frame.offsetY !== undefined) region['offsetY'] = frame.offsetY;
    if (frame.originalWidth !== undefined) region['originalWidth'] = frame.originalWidth;
    if (frame.originalHeight !== undefined) region['originalHeight'] = frame.originalHeight;
    // Soltar a mesma folha duas vezes troca no lugar: o Recarregar faz isso, e
    // uma região repetida seria um nome duplicado no atlas (§10.3, L1).
    const at = out.regions.findIndex((r) => r.name === frame.name);
    if (at < 0) out.regions.push(region);
    else out.regions[at] = region;
  }
  return out;
}

export function withProvisional(
  tree: ProvisionalTree | null,
  image: { name: string; path: string; width: number; height: number },
  pivot?: readonly [number, number],
): ProvisionalTree {
  const out: ProvisionalTree = tree === null
    ? { atlas: { version: '1.0', generator: 'Recorte editor (pasta)' }, pages: [], regions: [] }
    : JSON.parse(JSON.stringify(tree)) as ProvisionalTree;
  const pageName = PROVISIONAL_PAGE + image.name;
  const page: TreePage = {
    name: pageName, image: PROVISIONAL_IMAGE + image.path, width: image.width, height: image.height,
  };
  let index = out.pages.findIndex((p) => p.name === pageName);
  if (index < 0) {
    out.pages.push(page);
    index = out.pages.length - 1;
  } else {
    out.pages[index] = page;
  }
  const old = out.regions.find((r) => r.name === image.name);
  const region: TreeRegion = { name: image.name, page: index, x: 0, y: 0, width: image.width, height: image.height };
  const px = old?.pivotX ?? pivot?.[0];
  const py = old?.pivotY ?? pivot?.[1];
  if (px !== undefined) region.pivotX = px;
  if (py !== undefined) region.pivotY = py;
  const at = out.regions.findIndex((r) => r.name === image.name);
  if (at < 0) out.regions.push(region);
  else out.regions[at] = region;
  return out;
}

// ---------------------------------------------------------------------------
// O pivô por pasta — lote 61
// ---------------------------------------------------------------------------

/*
 * O Humberto: *"as mãos saem do Photoshop alinhadas, eu clico no pivô de uma e
 * peço para repetir para todas da mesma pasta. Não conflita com braço nem
 * arma: cada um tem a sua pasta."*
 *
 * A imagem que já tem região (está na cena, ou num atlas) guarda o pivô na
 * região (§10.3). A que ainda está só na pasta não tem região — e a região
 * provisória não vai para o arquivo —, então o pivô dela mora no estado do
 * editor, `RECORTE_editor_state.folderPivots` (regra 6: estado só do editor,
 * que os leitores ignoram). Quando ela entra na cena, o pivô vai para a região;
 * ao salvar, as que já têm região saem da lista.
 */

/** A chave dentro de `RECORTE_editor_state`. */
export const FOLDER_PIVOTS = 'folderPivots';

/** Os pivôs guardados para imagens da pasta: nome → `[x, y]`, px da imagem, de baixo. */
export type FolderPivots = Record<string, [number, number]>;

/** Lê os pivôs da pasta do arquivo. Valor estragado é ignorado, nunca estoura. */
export function readFolderPivots(file: BoneFile): FolderPivots {
  const raw = (readEditorState(file) as Record<string, unknown>)[FOLDER_PIVOTS];
  const out: FolderPivots = {};
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) return out;
  for (const [name, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!Array.isArray(value) || value.length !== 2) continue;
    const [x, y] = value as unknown[];
    if (typeof x !== 'number' || typeof y !== 'number' || !Number.isFinite(x) || !Number.isFinite(y)) continue;
    out[name] = [x, y];
  }
  return out;
}

/** Os pivôs que continuam na lista: os das imagens que NÃO estão em `used`. */
export function keepFolderPivots(pivots: FolderPivots, used: ReadonlySet<string>): FolderPivots {
  const out: FolderPivots = {};
  for (const [name, value] of Object.entries(pivots)) if (!used.has(name)) out[name] = value;
  return out;
}

/** Um pivô a gravar: a imagem e onde, em px dela, da esquerda e de baixo. */
export interface PivotPlanItem {
  name: string;
  x: number;
  y: number;
}

/**
 * **Repetir para a pasta**: o pivô de `source` em toda imagem da mesma subpasta.
 *
 * Mesmo tamanho = mesmo pixel (a mão saiu do Photoshop alinhada, e é o caso
 * comum). Tamanho diferente = a mesma **proporção**, que é a regra do Colar
 * pivô do lote 58. **Nada atravessa pastas**: o braço e a arma têm as suas.
 * Imagem da raiz não tem grupo: o plano é só ela.
 */
export function folderPivotPlan(
  images: ReadonlyArray<{ name: string; width: number; height: number }>,
  source: string,
  pivot: { x: number; y: number },
): PivotPlanItem[] {
  const own = { name: source, x: roundPivot(pivot.x), y: roundPivot(pivot.y) };
  const src = images.find((image) => image.name === source);
  const folder = folderOf(source);
  if (src === undefined || folder === '') return [own];
  return images
    .filter((image) => folderOf(image.name) === folder)
    .sort((a, b) => naturalCompare(baseOf(a.name), baseOf(b.name)))
    .map((image) => {
      if (image.width === src.width && image.height === src.height) return { ...own, name: image.name };
      const at = pastePivot(pivot, { ow: src.width, oh: src.height }, { ow: image.width, oh: image.height });
      return { name: image.name, x: at.x, y: at.y };
    });
}

/**
 * **Tamanho diferente avisa** — degrau 8, tarefa 8.4 (I8).
 *
 * O padrão da arte é **sem recorte** (I1, palavra dele): a mesma tela, o
 * encaixe no mesmo pixel. Quando as imagens de uma pasta têm telas de tamanhos
 * diferentes, esse alinhamento simplesmente não existe, e o pivô passa a
 * viajar por **proporção** — um palpite razoável, e não a verdade.
 *
 * Então se diz. Sem isto, o número sai torto e parece um defeito do programa;
 * com isto, quem desenhou sabe o que conferir. `null` quando está tudo do
 * mesmo tamanho, ou quando não há o que comparar.
 */
export function folderSizeWarning(
  folder: string, images: ReadonlyArray<{ name: string; width: number; height: number }>,
): string | null {
  if (images.length < 2) return null;
  const tamanhos = new Set(images.map((image) => `${image.width}×${image.height}`));
  if (tamanhos.size <= 1) return null;
  const quem = folder === '' ? 'Estas imagens' : `As imagens da pasta ${folder}`;
  const lista = [...tamanhos].sort().join(', ');
  return `${quem} têm telas de tamanhos diferentes (${lista}). O padrão é desenhar cada `
    + 'variação na MESMA tela, com a articulação no mesmo pixel; enquanto não for assim, '
    + 'o pivô é repetido por proporção, que é aproximado';
}

/** A frase do rodapé depois de repetir o pivô para a pasta. */
export function folderPivotNotice(folder: string, count: number, moved: number): string {
  const imagens = count === 1 ? '1 imagem' : `${count} imagens`;
  const quem = moved === 0 ? '' : moved === 1 ? '. 1 desenho recolocado' : `. ${moved} desenhos recolocados`;
  return `Pivô repetido para a pasta ${folder}: ${imagens}${quem}`;
}

/** Os nomes de imagem que algum desenho do arquivo mostra (o `path`, ou o nome). */
export function imagesInUse(file: BoneFile): Set<string> {
  const used = new Set<string>();
  for (const skin of file.skins ?? []) {
    for (const porSlot of Object.values(skin.attachments ?? {})) {
      for (const [name, def] of Object.entries(porSlot ?? {})) {
        if (def === null || typeof def !== 'object') continue;
        for (const image of imagesOfAttachment(name, def as ImageHolder)) used.add(image);
      }
    }
  }
  return used;
}

/** Os tipos de anexo que têm imagem (§7.2: `path` só vale nestes). Sem `type` = `region`. */
const IMAGE_ATTACHMENTS = new Set(['region', 'mesh', 'linkedmesh']);

/** A vista frouxa de um anexo que pode ter imagem. */
interface ImageHolder {
  type?: string;
  path?: string;
  sequence?: { count?: number; frames?: string[]; start?: number; digits?: number };
}

/**
 * As imagens que UM anexo usa — E4, rodada final (29/09/2026).
 *
 * Duas coisas contavam errado, e as duas saíam no Salvar, que empacota só as
 * imagens em uso (`folder-save.ts`, `atlasForSave`):
 *
 * - **a caixa, o ponto, o recorte, o caminho** entravam pelo NOME do anexo. A
 *   caixa `corte` do projeto do Spriter virava a imagem `corte`;
 * - **a sequência** entrava só pelo prefixo (`olho_`), e nenhum quadro
 *   (`olho_01`, `olho_02`…) estava "em uso". Salvar uma pasta numerada ou uma
 *   folha do Aseprite deixava os quadros de fora do atlas.
 *
 * A forma: *contei o nome do anexo como nome de imagem*. Os quadros saem como a
 * §7.10 os nomeia: `frames[i]`, ou `path + formatar(start + i, digits)`.
 */
export function imagesOfAttachment(name: string, def: ImageHolder): string[] {
  if (!IMAGE_ATTACHMENTS.has(def.type ?? 'region')) return [];
  const path = def.path !== undefined && def.path !== '' ? def.path : name;
  const sequence = def.sequence;
  if (sequence === undefined) return [path];
  if (Array.isArray(sequence.frames)) return sequence.frames.filter((frame) => typeof frame === 'string');
  const count = typeof sequence.count === 'number' ? sequence.count : 0;
  const start = typeof sequence.start === 'number' ? sequence.start : 1;
  const digits = typeof sequence.digits === 'number' ? sequence.digits : 0;
  const out: string[] = [];
  for (let i = 0; i < count; i++) out.push(path + String(start + i).padStart(digits, '0'));
  return out;
}

/** A frase do rodapé depois de abrir a pasta. */
export function openedNotice(folder: string, names: readonly string[]): string {
  const sections = folderTree(names);
  const subpastas = sections.filter((s) => s.folder !== '').length;
  const imagens = names.length === 1 ? '1 imagem' : `${names.length} imagens`;
  const onde = subpastas === 0 ? '' : subpastas === 1 ? ' em 1 subpasta' : ` em ${subpastas} subpastas`;
  if (names.length === 0) return `A pasta ${folder} não tem imagens. Ponha PNGs nela e aperte Recarregar`;
  return `Pasta ${folder}: ${imagens}${onde}, na aba Imagens. Arraste uma para a cena`;
}

// ---------------------------------------------------------------------------
// A pasta aberta, guardada por documento
// ---------------------------------------------------------------------------

/** Um arquivo da pasta, pelo jeito que o navegador deixa ler. */
export interface FolderFileHandle {
  readonly kind?: 'file';
  readonly name: string;
  getFile(): Promise<File>;
}

/** A pasta, pela API de arquivos do navegador. Só o que este módulo usa. */
export interface FolderDirectoryHandle {
  readonly kind?: 'directory';
  readonly name: string;
  values(): AsyncIterable<FolderFileHandle | FolderDirectoryHandle>;
  queryPermission?(options?: { mode?: string }): Promise<string>;
  requestPermission?(options?: { mode?: string }): Promise<string>;
  /** Lote 62: gravar na pasta — o atlas e as páginas, ao lado do `.bone`. */
  getFileHandle?(name: string, options?: { create?: boolean }): Promise<FolderFileHandle & {
    createWritable(): Promise<{ write(data: Blob | string): Promise<void>; close(): Promise<void> }>;
  }>;
  getDirectoryHandle?(name: string): Promise<FolderDirectoryHandle>;
  /** Onde um arquivo cai dentro desta pasta, ou `null` quando está fora dela. */
  resolve?(handle: unknown): Promise<string[] | null>;
}

/** Uma imagem da pasta. Os pixels não estão aqui: `read` busca quando precisar. */
export interface FolderImage {
  /** O caminho dentro da pasta, com a extensão: `maos/mao_aberta.png`. */
  readonly path: string;
  /** O nome da imagem, que é o nome da região: `maos/mao_aberta`. */
  readonly name: string;
  /** Lê o arquivo do disco. Chamado só quando a imagem aparece ou entra na cena. */
  read(): Promise<File>;
  /** A data do arquivo, para o Recarregar saber quem mudou. */
  readonly modified?: number;
  /** O tamanho, conhecido depois da primeira leitura. */
  width?: number;
  height?: number;
  /** Sumiu da pasta no último Recarregar, mas um desenho usa. */
  missing?: boolean;
}

/** A pasta do projeto. */
export interface ProjectFolder {
  /** O nome da pasta. Vazio para imagens soltas na janela, sem pasta. */
  readonly name: string;
  /**
   * O jeito de reler e de gravar na pasta. `null` quando veio pelo
   * `<input webkitdirectory>` (só leitura) ou quando são imagens soltas.
   */
  readonly handle: FolderDirectoryHandle | null;
  /** As imagens, por nome. */
  readonly images: Map<string, FolderImage>;
}

const folders = new WeakMap<EditorDoc, ProjectFolder>();
const listeners = new Set<() => void>();

/** A pasta deste documento, ou `null`. */
export function projectFolder(doc: EditorDoc): ProjectFolder | null {
  return folders.get(doc) ?? null;
}

/** Os nomes das imagens da pasta deste documento. */
export function folderImageNames(doc: EditorDoc): string[] {
  return [...(folders.get(doc)?.images.keys() ?? [])];
}

/** Uma imagem da pasta pelo nome, ou `null`. */
export function folderImage(doc: EditorDoc, name: string): FolderImage | null {
  return folders.get(doc)?.images.get(name) ?? null;
}

/**
 * Avisa quem desenha a aba quando a pasta muda. A pasta não é o documento: abrir
 * uma, ou soltar PNG na janela, não é passo de desfazer nem suja o arquivo.
 */
export function onFolderChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function changed(): void {
  for (const listener of [...listeners]) listener();
}

/** Põe esta pasta no documento, no lugar da que houver. */
export function setProjectFolder(doc: EditorDoc, folder: ProjectFolder): void {
  folders.set(doc, folder);
  changed();
}

/** Esquece a pasta — Arquivo → Novo. */
export function forgetProjectFolder(doc: EditorDoc): void {
  if (!folders.has(doc)) return;
  folders.delete(doc);
  changed();
}

/**
 * Junta imagens à pasta. Sem pasta aberta, nasce uma pasta sem nome, só na
 * memória: é onde caem os PNG soltos na janela.
 *
 * Imagem de mesmo nome **substitui** a de antes — é o mesmo arquivo, mais novo.
 */
export function addFolderImages(
  doc: EditorDoc, images: readonly FolderImage[],
): { added: string[]; replaced: string[] } {
  let folder = folders.get(doc);
  if (folder === undefined) {
    folder = { name: '', handle: null, images: new Map() };
    folders.set(doc, folder);
  }
  const added: string[] = [];
  const replaced: string[] = [];
  for (const image of images) {
    (folder.images.has(image.name) ? replaced : added).push(image.name);
    folder.images.set(image.name, image);
  }
  changed();
  return { added, replaced };
}

/** Uma imagem da pasta a partir de um `File` que já está na mão. */
export function imageFromFile(file: File, relativePath?: string): FolderImage {
  const path = relativePath ?? file.name;
  return {
    path,
    name: imageNameOf(path),
    read: () => Promise.resolve(file),
    modified: file.lastModified,
  };
}

/**
 * **Soltar PNG na janela**: as imagens vão para a aba Imagens, e nada vai para a
 * cena. Não é comando e não suja o arquivo — a imagem só vira parte do
 * personagem quando é arrastada para a cena.
 */
export function addLooseFiles(
  doc: EditorDoc, files: readonly File[],
): { added: string[]; replaced: string[] } {
  const images = files.filter((file) => isFolderImage(file.name)).map((file) => {
    const inside = (file as File & { webkitRelativePath?: string }).webkitRelativePath;
    return imageFromFile(file, inside !== undefined && inside !== '' ? inside : file.name);
  });
  return addFolderImages(doc, images);
}

// ---------------------------------------------------------------------------
// O navegador: escolher, varrer, lembrar
// ---------------------------------------------------------------------------

interface PickerWindow {
  showDirectoryPicker?(options?: unknown): Promise<FolderDirectoryHandle>;
}

/** `true` quando o navegador abre pasta com escrita (Chrome, Edge). */
export function hasFolderPicker(): boolean {
  return typeof (globalThis as unknown as PickerWindow).showDirectoryPicker === 'function';
}

function isDirectory(entry: FolderFileHandle | FolderDirectoryHandle): entry is FolderDirectoryHandle {
  return entry.kind === 'directory' || typeof (entry as FolderDirectoryHandle).values === 'function';
}

/**
 * Varre a pasta e as subpastas. Lê só o NOME e a data de cada arquivo; os
 * pixels ficam para quando a imagem aparecer.
 */
export async function scanDirectory(
  directory: FolderDirectoryHandle, prefix = '',
): Promise<FolderImage[]> {
  const out: FolderImage[] = [];
  for await (const entry of directory.values()) {
    if (isDirectory(entry)) {
      if (skipFolderEntry(entry.name)) continue;
      out.push(...await scanDirectory(entry, `${prefix}${entry.name}/`));
      continue;
    }
    if (!isFolderImage(entry.name)) continue;
    const path = `${prefix}${entry.name}`;
    let modified: number | undefined;
    try {
      modified = (await entry.getFile()).lastModified;
    } catch {
      continue; // Arquivo sem permissão ou apagado no meio da varredura.
    }
    out.push({ path, name: imageNameOf(path), read: () => entry.getFile(), modified });
  }
  return out;
}

/** A pasta pelo `<input webkitdirectory>`: só leitura, e sem jeito de reler. */
function pickWithInput(): Promise<ProjectFolder | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.setAttribute('webkitdirectory', '');
    input.style.display = 'none';
    input.addEventListener('change', () => {
      const files = input.files === null ? [] : [...input.files];
      input.remove();
      if (files.length === 0) {
        resolve(null);
        return;
      }
      const first = (files[0] as File & { webkitRelativePath?: string }).webkitRelativePath ?? '';
      const name = first.split('/')[0] || 'pasta';
      const images = new Map<string, FolderImage>();
      for (const file of files) {
        const rel = relativeInsideFolder((file as File & { webkitRelativePath?: string }).webkitRelativePath ?? file.name);
        if (!isFolderImage(rel) || rel.split('/').some(skipFolderEntry)) continue;
        const image = imageFromFile(file, rel);
        images.set(image.name, image);
      }
      resolve({ name, handle: null, images });
    });
    input.addEventListener('cancel', () => { input.remove(); resolve(null); });
    document.body.append(input);
    input.click();
  });
}

/**
 * Pede a pasta. Com `showDirectoryPicker`, ela vem com escrita — é para lá que
 * o Salvar vai mandar o atlas. Sem, vem só para ler. `null` = cancelou.
 */
export async function pickProjectFolder(): Promise<ProjectFolder | null> {
  const w = globalThis as unknown as PickerWindow;
  if (typeof w.showDirectoryPicker !== 'function') return pickWithInput();
  let handle: FolderDirectoryHandle;
  try {
    handle = await w.showDirectoryPicker({ id: 'recorte-pasta', mode: 'readwrite' });
  } catch {
    return null; // Fechou a janela.
  }
  return folderFromHandle(handle);
}

/**
 * Os nomes dos arquivos da RAIZ da pasta — rodada 7. Só os nomes: é para saber
 * se a pasta já tem um projeto, e se o Salvar pisaria em algum.
 */
export async function rootFileNames(handle: FolderDirectoryHandle | null): Promise<string[]> {
  if (handle === null) return [];
  const out: string[] = [];
  try {
    for await (const entry of handle.values()) if (!isDirectory(entry)) out.push(entry.name);
  } catch {
    // Sem permissão de ler: devolve o que deu. Quem chama trata a pasta como vazia.
  }
  return out;
}

export async function folderFromHandle(handle: FolderDirectoryHandle): Promise<ProjectFolder> {
  const images = new Map<string, FolderImage>();
  for (const image of await scanDirectory(handle)) images.set(image.name, image);
  return { name: handle.name, handle, images };
}

// ---------------------------------------------------------------------------
// Continuar de onde parou — lote 62
// ---------------------------------------------------------------------------

/** Onde fica, no navegador, o `.bone` que foi salvo em cada pasta. */
export const FOLDER_BONE_KEY = 'RECORTE_pasta_bone';

/** Lê o mapa pasta → `.bone`. Texto estragado devolve mapa vazio. */
export function parseFolderBones(raw: string | null): Record<string, string> {
  if (raw === null) return {};
  try {
    const data = JSON.parse(raw) as unknown;
    if (data === null || typeof data !== 'object' || Array.isArray(data)) return {};
    const out: Record<string, string> = {};
    for (const [folder, bone] of Object.entries(data)) if (typeof bone === 'string') out[folder] = bone;
    return out;
  } catch {
    return {};
  }
}

function folderBoneStorage(): { getItem(k: string): string | null; setItem(k: string, v: string): void } | null {
  try {
    return (globalThis as { localStorage?: { getItem(k: string): string | null; setItem(k: string, v: string): void } }).localStorage ?? null;
  } catch {
    return null;
  }
}

/** Anota que o `.bone` desta pasta é `bone`: reabrir a pasta reabre ele. */
export function rememberFolderBone(folder: string, bone: string): void {
  const store = folderBoneStorage();
  if (store === null || folder === '') return;
  const map = parseFolderBones(store.getItem(FOLDER_BONE_KEY));
  map[folder] = bone;
  try {
    store.setItem(FOLDER_BONE_KEY, JSON.stringify(map));
  } catch {
    // Sem armazenamento: reabrir a pasta começa vazio, como antes.
  }
}

/**
 * As pastas lembradas cujo `.bone` salvo se chama `bone` — J1 (29/09/2026).
 * É o nome que o aviso dá: *"escolha a pasta boneco"*.
 */
export function foldersOfBone(bone: string): string[] {
  const store = folderBoneStorage();
  if (store === null) return [];
  const map = parseFolderBones(store.getItem(FOLDER_BONE_KEY));
  return Object.keys(map).filter((folder) => map[folder] === bone);
}

/** Os jeitos de reabrir as pastas dos recentes, as mais novas primeiro. */
export async function rememberedFolders(): Promise<FolderDirectoryHandle[]> {
  const out: FolderDirectoryHandle[] = [];
  for (const recent of recentFiles()) {
    if (!isRecentFolder(recent.name)) continue;
    const [handle] = (await recentHandles(recent.name)) as FolderDirectoryHandle[];
    if (handle !== undefined) out.push(handle);
  }
  return out;
}

/**
 * **Abrir o `.bone` e vir com as imagens** — J1 (29/09/2026).
 *
 * Quem escolhia só o `.bone` em "Abrir projeto…" recebia a Árvore sem
 * imagem nenhuma, e um rodapé *"Abra o atlas junto"*, sem dizer onde. No
 * Spriter o `.scml` mora na pasta do projeto e abre com as imagens; aqui o
 * navegador não diz de que pasta o arquivo veio — mas o programa LEMBRA as
 * pastas que abriu, e cada uma sabe responder se o arquivo está dentro dela
 * (`resolve`).
 *
 * | Resposta | Quer dizer |
 * |:---|:---|
 * | `{ folder, files }` | a pasta tem o `.bone` na raiz e a permissão já está dada: o atlas e as páginas vêm junto |
 * | `{ folder, files: null }` | achou a pasta, mas sem permissão: o aviso diz o NOME dela |
 * | `null` | nenhuma pasta lembrada tem este arquivo |
 *
 * Nunca pede permissão: pedir abriria a pergunta do navegador no meio de um
 * abrir que a pessoa já deu por feito.
 */
export async function companionFiles(
  boneHandle: unknown, folders: readonly FolderDirectoryHandle[],
): Promise<{ folder: FolderDirectoryHandle; files: File[] | null } | null> {
  for (const dir of folders) {
    if (typeof dir.resolve !== 'function') continue;
    let path: string[] | null;
    try {
      path = await dir.resolve(boneHandle);
    } catch {
      continue;
    }
    if (path === null || path.length !== 1) continue;
    if (typeof dir.queryPermission === 'function') {
      let estado: string;
      try {
        estado = await dir.queryPermission({ mode: 'read' });
      } catch {
        estado = 'denied';
      }
      if (estado !== 'granted') return { folder: dir, files: null };
    }
    const found = await boneFilesInFolder(dir, path[0]!);
    if (found === null) continue;
    return { folder: dir, files: found.files.slice(1) };
  }
  return null;
}

/** O `.bone` salvo nesta pasta, ou `null`. */
export function folderBone(folder: string): string | null {
  const store = folderBoneStorage();
  if (store === null) return null;
  return parseFolderBones(store.getItem(FOLDER_BONE_KEY))[folder] ?? null;
}

/**
 * Os arquivos para reabrir o `.bone` que mora na raiz da pasta: ele primeiro,
 * depois cada `.atlas.json` da raiz, as páginas que esses atlas citam, e os
 * outros `.bone` (que podem ser esqueletos filhos, §7.11). Só a raiz, e só as
 * páginas citadas: uma pasta de 500 imagens não é lida inteira para isso.
 * `null` quando o `.bone` não está lá.
 */
export async function boneFilesInFolder(
  directory: FolderDirectoryHandle, bone: string,
): Promise<{ files: File[]; handle: FolderFileHandle } | null> {
  const root = new Map<string, FolderFileHandle>();
  for await (const entry of directory.values()) {
    if (!isDirectory(entry)) root.set(entry.name, entry);
  }
  const main = root.get(bone);
  if (main === undefined) return null;
  const files: File[] = [await main.getFile()];
  const pages = new Set<string>();
  for (const [name, handle] of root) {
    if (name === bone) continue;
    const lower = name.toLowerCase();
    if (lower.endsWith('.atlas.json')) {
      const file = await handle.getFile();
      files.push(file);
      try {
        const tree = JSON.parse(await file.text()) as { pages?: Array<{ image?: string }> };
        for (const page of tree.pages ?? []) if (typeof page.image === 'string') pages.add(page.image);
      } catch {
        // Atlas estragado: o leitor diz o que houve ao abrir.
      }
    } else if (lower.endsWith('.bone')) {
      files.push(await handle.getFile());
    }
  }
  for (const page of pages) {
    const handle = root.get(page);
    if (handle !== undefined) files.push(await handle.getFile());
  }
  return { files, handle: main };
}

/** O nome com que a pasta entra nos recentes: a barra no fim diz "é pasta". */
export function recentFolderKey(folder: string): string {
  return `${folder}/`;
}

/** `true` para uma linha dos recentes que é pasta. */
export function isRecentFolder(name: string): boolean {
  return name.endsWith('/');
}

/** Anota a pasta nos recentes, com o jeito de reabrir. */
export async function rememberFolder(folder: ProjectFolder): Promise<void> {
  if (folder.name === '') return;
  await rememberRecent(recentFolderKey(folder.name), folder.handle === null ? [] : [folder.handle]);
}

/**
 * Reabre uma pasta dos recentes. Pedir a permissão de novo exige o clique da
 * pessoa: o do próprio item da janela de recentes.
 */
export async function reopenRecentFolder(
  key: string,
): Promise<{ folder: ProjectFolder } | { erro: 'sem-jeito' | 'sem-permissao' | 'sumiu' }> {
  const [handle] = (await recentHandles(key)) as FolderDirectoryHandle[];
  if (handle === undefined) return { erro: 'sem-jeito' };
  try {
    if (typeof handle.queryPermission === 'function') {
      let estado = await handle.queryPermission({ mode: 'readwrite' });
      if (estado !== 'granted' && typeof handle.requestPermission === 'function') {
        estado = await handle.requestPermission({ mode: 'readwrite' });
      }
      if (estado !== 'granted') return { erro: 'sem-permissao' };
    }
    const folder = await folderFromHandle(handle);
    void rememberFolder(folder);
    return { folder };
  } catch {
    return { erro: 'sumiu' };
  }
}

/**
 * **Recarregar**: relê a pasta. Imagem nova entra, apagada sai (a que está em
 * uso fica, marcada), e a que mudou perde a miniatura guardada. `null` quando a
 * pasta não tem jeito de ser relida (veio pelo `<input>`, ou são PNG soltos).
 */
export async function reloadFolder(
  doc: EditorDoc, used: ReadonlySet<string>,
): Promise<ReloadPlan | null> {
  const folder = folders.get(doc);
  if (folder === undefined || folder.handle === null) return null;
  const now = await scanDirectory(folder.handle);
  const plan = reloadPlan([...folder.images.values()], now, used);
  const fresh = new Map(now.map((image) => [image.name, image]));
  for (const name of plan.missing) {
    const kept = folder.images.get(name);
    if (kept !== undefined) fresh.set(name, { ...kept, missing: true });
  }
  folder.images.clear();
  for (const [name, image] of fresh) folder.images.set(name, image);
  changed();
  return plan;
}

// ---------------------------------------------------------------------------
// Os pixels, lidos só quando precisam
// ---------------------------------------------------------------------------

const bitmaps = new WeakMap<FolderImage, Promise<ImageBitmap | null>>();
const thumbs = new WeakMap<FolderImage, Map<number, Promise<string | null>>>();

/**
 * Os pixels da imagem, decodificados uma vez. Guardado pelo OBJETO da imagem:
 * o Recarregar troca o objeto de quem mudou, e a leitura velha morre junto.
 */
export function folderBitmap(image: FolderImage): Promise<ImageBitmap | null> {
  let made = bitmaps.get(image);
  if (made === undefined) {
    made = image.read()
      .then((file) => createImageBitmap(file))
      .then((bitmap) => {
        image.width = bitmap.width;
        image.height = bitmap.height;
        return bitmap;
      })
      .catch(() => null);
    bitmaps.set(image, made);
  }
  return made;
}

/** A miniatura da imagem, encaixada num quadrado sem esticar, como `data:` URL. */
export function folderThumbnail(image: FolderImage, size: number): Promise<string | null> {
  let bySize = thumbs.get(image);
  if (bySize === undefined) {
    bySize = new Map();
    thumbs.set(image, bySize);
  }
  let made = bySize.get(size);
  if (made === undefined) {
    made = folderBitmap(image).then((bitmap) => {
      if (bitmap === null || typeof document === 'undefined') return null;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx === null) return null;
      const scale = size / Math.max(1, bitmap.width, bitmap.height);
      const w = bitmap.width * scale;
      const h = bitmap.height * scale;
      ctx.drawImage(bitmap, (size - w) / 2, (size - h) / 2, w, h);
      return canvas.toDataURL('image/png');
    });
    bySize.set(size, made);
  }
  return made;
}

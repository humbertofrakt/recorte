/**
 * **Usar animações de outro boneco…** — a conta, sem DOM (regra 8).
 * Reaproveitar animação, noite de 04/11/2026.
 *
 * 🗣️ *"o Fortnite tem vários personagens, mas usa as mesmas animações base"*.
 * O desenho está em `documentos/projeto do programa/noite/reaproveitar-o-desenho.md`.
 *
 * | De onde | O que é |
 * |:---|:---|
 * | **Esqueleto padrão** | as quatro de fábrica (`formato/rigs/humanoide-v1-animacoes.bone`) |
 * | **outra base do projeto** | as animações dela; ela vira a DONA, e o Salvar grava `<base>-animacoes.bone` |
 * | **um arquivo** | qualquer `.bone` com animações (o herói, um arquivo exportado) |
 *
 * | Como entram | O que acontece |
 * |:---|:---|
 * | **Ligadas** | o boneco cita o arquivo (`assets.animations`, §2.8). Os ossos daqui que não têm o nome de lá **ganham** o nome de lá: o leitor do jogo liga pelo nome, e sem campo novo no formato (regra 7) é o único jeito de ligar |
 * | **Cópia** | as animações entram no boneco com os nomes daqui (`ImportAnimationCopy`, com o ajuste de tamanho do runtime) |
 *
 * Cada gesto é UM passo de desfazer.
 */

import type { BoneFile } from '../../../runtime/src/index.js';
import type { ChangeKind, Command, EditorDoc } from '../contract.js';
import { readEditorState, writeEditorState } from '../contract.js';
import {
  bonesUsedBy, matchBones, rememberedOf, renamesFor, translateAnimations,
} from '../anim/bone-match.js';
import type { BoneMatch, BoneRename } from '../anim/bone-match.js';
import { buildAnimationFile, ImportAnimationCopy } from '../io/export-animation.js';
import { renameBoneEverywhere } from './rename.js';
import { composeShared, sharedUrisOf } from '../doc/shared-animations.js';
export { ownerSharedFile } from '../io/shared-save.js';

// ---------------------------------------------------------------------------
// De onde
// ---------------------------------------------------------------------------

/** De que tipo é a fonte. */
export type ReuseKind = 'padrao' | 'base' | 'arquivo';

/** Uma fonte de animações. */
export interface ReuseSource {
  kind: ReuseKind;
  /** O que a janela escreve: `Esqueleto padrão`, `cavaleiro — base deste projeto`. */
  label: string;
  /** O uri que vai para `assets.animations` quando entram ligadas. */
  uri: string;
  /** O arquivo de animações (para a base: o que o Salvar vai gravar). */
  file: BoneFile;
  /** As animações que ela traz. */
  animations: string[];
  /** Base: o uri da base dona no projeto. */
  owner?: string;
}

/** O nome com que se chama o Esqueleto padrão na tela. */
export const PADRAO_LABEL = 'Esqueleto padrão';

/** O arquivo de fábrica das quatro animações. */
export const PADRAO_URI = 'humanoide-v1-animacoes.bone';

/** O nome do arquivo que a base dona grava: `cavaleiro-animacoes.bone`. */
export function sharedFileName(ownerUri: string): string {
  const nome = ownerUri.slice(ownerUri.lastIndexOf('/') + 1).replace(/\.bone[bz]?$/i, '');
  const limpo = nome.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
  return `${limpo === '' ? 'base' : limpo}-animacoes.bone`;
}

/** As animações próprias de um arquivo (as daqui; as de fora não). */
export function ownAnimationNames(file: BoneFile): string[] {
  return (file.animations ?? []).map((a) => a.name).filter((n): n is string => typeof n === 'string');
}

/** A fonte "outra base do projeto": o arquivo que ela compartilha, montado agora. */
export function baseSource(ownerUri: string, label: string, owner: BoneFile): ReuseSource | null {
  const nomes = ownOwnerNames(owner);
  if (nomes.length === 0) return null;
  const arquivo = readEditorState(owner).compartilha?.arquivo ?? sharedFileName(ownerUri);
  const built = buildAnimationFile(owner, nomes);
  if (built === null) return null;
  return {
    kind: 'base', label: `${label} — base deste projeto`, uri: arquivo,
    file: built.file, animations: built.report.animations, owner: ownerUri,
  };
}

function ownOwnerNames(owner: BoneFile): string[] {
  return ownAnimationNames(owner);
}

// ---------------------------------------------------------------------------
// A tabela, para uma fonte
// ---------------------------------------------------------------------------

/** Os ossos que as animações escolhidas pedem: o `rig.bones` e os alvos. */
export function neededBones(source: ReuseSource, names: readonly string[]): string[] {
  const escolhidas = (source.file.animations ?? []).filter((a) => names.includes(a.name));
  const usados = bonesUsedBy(escolhidas);
  // A raiz não conta: a raiz de lá não move nada aqui (§2.8 ignora `bones`).
  return usados;
}

/** A tabela já preenchida: mesmo nome, o lembrado desta fonte, o parecido. */
export function initialMatch(host: BoneFile, source: ReuseSource, names: readonly string[]): BoneMatch {
  const lembrado = readEditorState(host).mapaDeOssos?.[source.uri] ?? {};
  return matchBones(neededBones(source, names), (host.bones ?? []).map((b) => b.name), lembrado);
}

// ---------------------------------------------------------------------------
// Os comandos
// ---------------------------------------------------------------------------

/**
 * Um passo de desfazer feito de uma mudança qualquer no arquivo: guarda o
 * arquivo inteiro antes e depois, e volta exato. Os gestos daqui mexem em
 * ossos, slots, regras, animações e no estado do editor de uma vez, e uma
 * foto inteira é o desfazer que não esquece nada.
 */
export class FileSnapshotCommand implements Command {
  readonly kind: ChangeKind = 'structure';
  private before: string | null = null;
  private after: string | null = null;

  constructor(readonly label: string, private readonly change: (file: BoneFile) => void) {}

  apply(doc: EditorDoc): void {
    if (this.after === null) {
      this.before = JSON.stringify(doc.file);
      this.change(doc.file);
      this.after = JSON.stringify(doc.file);
      return;
    }
    replaceFile(doc.file, this.after);
  }

  revert(doc: EditorDoc): void {
    if (this.before !== null) replaceFile(doc.file, this.before);
  }
}

/** Troca o conteúdo do arquivo no lugar (o objeto é o mesmo: quem o segura continua certo). */
function replaceFile(file: BoneFile, json: string): void {
  const alvo = file as unknown as Record<string, unknown>;
  const novo = JSON.parse(json) as Record<string, unknown>;
  for (const k of Object.keys(alvo)) if (!(k in novo)) delete alvo[k];
  for (const [k, v] of Object.entries(novo)) alvo[k] = v;
}

/** Renomeia vários ossos de uma vez, sem um nome atropelar o outro (dois tempos). */
export function renameBones(file: BoneFile, renames: readonly BoneRename[]): void {
  const temp = renames.map((r, i) => ({ ...r, meio: `__reaproveitar_${i}_${r.de}` }));
  for (const r of temp) renameBoneEverywhere(file, r.de, r.meio);
  for (const r of temp) renameBoneEverywhere(file, r.meio, r.para);
}

/** Lembra a tabela no estado do editor, pela fonte. */
function rememberMatch(file: BoneFile, uri: string, match: BoneMatch): void {
  const state = readEditorState(file);
  const tabela = rememberedOf(match);
  const mapa = { ...(state.mapaDeOssos ?? {}) };
  if (Object.keys(tabela).length === 0) delete mapa[uri];
  else mapa[uri] = tabela;
  const novo = { ...state };
  if (Object.keys(mapa).length === 0) delete novo.mapaDeOssos;
  else novo.mapaDeOssos = mapa;
  writeEditorState(file, novo);
}

/** O que o gesto fez, para o rodapé. */
export interface ReuseReport {
  mode: 'ligadas' | 'copia';
  /** As animações que passaram a tocar aqui. */
  brought: string[];
  /** As que não entraram porque já havia uma com o mesmo nome aqui (a daqui vale). */
  skipped: string[];
  /** Ossos daqui que mudaram de nome (ligadas). */
  renamed: BoneRename[];
  /** As linhas que ficaram de fora (cópia), por extenso. */
  dropped: string[];
}

/**
 * **Ligadas.** Renomeia os ossos daqui para os nomes de lá, cita o arquivo em
 * `assets.animations`, e lembra a tabela. Recusa (devolve a frase) quando há
 * conflito de nome — nunca dois ossos com o mesmo nome.
 */
export function linkCommand(
  host: BoneFile, source: ReuseSource, match: BoneMatch,
): { command: FileSnapshotCommand; report: ReuseReport } | { refused: string } {
  const { renames, conflicts } = renamesFor(match, (host.bones ?? []).map((b) => b.name));
  if (conflicts.length > 0) {
    return {
      refused: `Este boneco já tem ${conflicts.length === 1 ? 'um osso chamado' : 'ossos chamados'} `
        + `${conflicts.map((c) => `"${c}"`).join(', ')}, fora da tabela. Ligar daria dois ossos com o mesmo nome. `
        + 'Combine esse osso na tabela, ou escolha Cópia',
    };
  }
  const daqui = new Set(ownAnimationNames(host));
  const skipped = source.animations.filter((n) => daqui.has(n));
  const brought = source.animations.filter((n) => !daqui.has(n));
  const command = new FileSnapshotCommand('Usar animações (ligadas)', (file) => {
    renameBones(file, renames);
    const f = file as unknown as { assets?: { animations?: string[] } };
    f.assets ??= {};
    const lista = f.assets.animations ?? [];
    if (!lista.includes(source.uri)) f.assets.animations = [...lista, source.uri];
    rememberMatch(file, source.uri, match);
  });
  return { command, report: { mode: 'ligadas', brought, skipped, renamed: renames, dropped: [] } };
}

/**
 * **Cópia.** As animações de lá com os nomes daqui, pelo `ImportAnimationCopy`
 * (a conta do runtime: a daqui vale, o `rig.reference` ajusta o tamanho).
 */
export function copyCommand(
  host: BoneFile, source: ReuseSource, names: readonly string[], match: BoneMatch,
): { command: Command; report: ReuseReport; copy: ImportAnimationCopy } {
  const escolhidas = (source.file.animations ?? []).filter((a) => names.includes(a.name));
  const { animations, dropped } = translateAnimations(
    escolhidas, match, (host.slots ?? []).map((s) => s.name),
  );
  const para = new Map(match.rows.filter((r) => r.to !== null).map((r) => [r.from, r.to!]));
  const rig = (source.file as unknown as { rig?: { reference?: { bone?: string; length?: number } } }).rig;
  const ref = rig?.reference;
  const refBone = ref?.bone !== undefined ? para.get(ref.bone) : undefined;
  const externo = {
    bone: { version: '1.0', minVersion: '1.0', generator: 'Recorte' },
    skeleton: { name: 'copia' },
    rig: {
      bones: bonesUsedBy(animations),
      ...(refBone !== undefined && typeof ref?.length === 'number' && ref.length > 0
        ? { reference: { bone: refBone, length: ref.length } } : {}),
    },
    bones: [{ name: 'raiz' }],
    animations,
  } as unknown as BoneFile;
  const copy = new ImportAnimationCopy(source.uri, externo);
  const daqui = new Set(ownAnimationNames(host));
  const skipped = names.filter((n) => daqui.has(n));
  const lembrar = new FileSnapshotCommand('Lembrar os ossos', (file) => rememberMatch(file, source.uri, match));
  const command: Command = {
    label: 'Usar animações (cópia)',
    kind: 'structure',
    apply(doc) { copy.apply(doc); lembrar.apply(doc); },
    revert(doc) { lembrar.revert(doc); copy.revert(doc); },
  };
  return {
    command, copy,
    report: { mode: 'copia', brought: names.filter((n) => !daqui.has(n)), skipped, renamed: [], dropped },
  };
}

/**
 * **A base dona.** Marca, no estado do editor dela, que ela compartilha estas
 * animações no arquivo `arquivo`. Junta com o que ela já compartilhava.
 */
export function shareCommand(arquivo: string, names: readonly string[]): FileSnapshotCommand {
  return new FileSnapshotCommand('Compartilhar animações', (file) => {
    const state = readEditorState(file);
    const antes = state.compartilha?.arquivo === arquivo ? state.compartilha.animacoes : [];
    const animacoes = [...antes];
    for (const n of names) if (!animacoes.includes(n)) animacoes.push(n);
    writeEditorState(file, { ...state, compartilha: { arquivo, animacoes } });
  });
}

/** A frase do rodapé. */
export function reuseNotice(source: ReuseSource, report: ReuseReport): string {
  const quantas = report.brought.length === 1 ? `"${report.brought[0]!}"` : `${report.brought.length} animações`;
  const partes = [report.mode === 'ligadas'
    ? `${quantas} de ${source.label.replace(/ — .*$/, '')}, ligadas: mudam junto com o original`
    : `${quantas} de ${source.label.replace(/ — .*$/, '')}, copiadas: são só deste boneco`];
  if (report.renamed.length > 0) {
    partes.push(`${report.renamed.length} ${report.renamed.length === 1 ? 'osso mudou' : 'ossos mudaram'} de nome `
      + `(${report.renamed.slice(0, 3).map((r) => `${r.de} → ${r.para}`).join(', ')}${report.renamed.length > 3 ? '…' : ''})`);
  }
  if (report.skipped.length > 0) {
    partes.push(`já havia aqui: ${report.skipped.join(', ')} (a daqui vale)`);
  }
  if (report.dropped.length > 0) {
    partes.push(`${report.dropped.length} ${report.dropped.length === 1 ? 'linha ficou' : 'linhas ficaram'} de fora `
      + `(${report.dropped.slice(0, 2).join('; ')}${report.dropped.length > 2 ? '…' : ''})`);
  }
  // O rodapé mostra a PRIMEIRA frase: tudo numa frase só, com ponto e vírgula.
  return partes.join('; ');
}

// ---------------------------------------------------------------------------
// A lista "Compartilhadas" da aba Animações
// ---------------------------------------------------------------------------

/** Uma linha da seção Compartilhadas. */
export interface SharedRow {
  /** O nome da animação, ou `null` numa linha de arquivo não achado. */
  name: string | null;
  uri: string;
  duration: number;
  loop: boolean;
  /** Quem é a dona no projeto (o uri da base), ou `null`: arquivo solto. */
  owner: string | null;
}

/**
 * As compartilhadas que este boneco toca, uma linha por animação, com a
 * origem. Arquivo citado que não se achou vira uma linha **"não achado"**.
 * `ownerOf` responde qual base do projeto é dona de um uri.
 */
export function listShared(file: BoneFile, ownerOf: (uri: string) => string | null = () => null): SharedRow[] {
  if (sharedUrisOf(file).length === 0) return [];
  const c = composeShared(file);
  const rows: SharedRow[] = [];
  for (const a of c.animations as Array<{ name?: unknown; duration?: unknown; loop?: unknown }>) {
    const name = typeof a.name === 'string' ? a.name : null;
    if (name === null) continue;
    const uri = c.origins.get(name);
    if (uri === undefined) continue;
    rows.push({
      name, uri, duration: typeof a.duration === 'number' ? a.duration : 0,
      loop: a.loop === true, owner: ownerOf(uri),
    });
  }
  for (const uri of c.missing) rows.push({ name: null, uri, duration: 0, loop: false, owner: ownerOf(uri) });
  return rows;
}

/** De onde, em palavras: `do cavaleiro`, `de humanoide-v1-animacoes.bone`. */
export function sharedFrom(row: SharedRow, nameOf: (uri: string) => string = (u) => u): string {
  if (row.owner !== null) return `do ${nameOf(row.owner)}`;
  if (row.uri === PADRAO_URI) return `do ${PADRAO_LABEL}`;
  return `de ${row.uri}`;
}

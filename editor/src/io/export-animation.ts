/**
 * **Exportar animação… / Importar animação…** — degrau 12, parte `B`.
 *
 * 🗣️ *"o que você acha do Mixamo?"* — o Humberto. Sair com **parado, andar,
 * correr, pular** prontos, e cada um caindo em qualquer personagem que siga a
 * convenção de nomes (`formato/rigs/humanoide-v1.bone`).
 *
 * O FORMATO JÁ FAZ TUDO ISTO, e nada aqui o refaz:
 *
 * | Camada | O que ela já garante |
 * |:---|:---|
 * | §2.8 `assets.animations` | as `animations` de um `.bone` externo entram neste esqueleto **pelo nome**; `bones`, `slots`, `constraints` e `events` do arquivo externo são ignorados |
 * | §4.8 `rig` | `{name, bones[], slots[], reference}` é o que o arquivo **exige** do hospedeiro |
 * | Nome que não bate | um aviso L2 `RIG_UNMET` por nome. **O arquivo abre**; a timeline órfã é ignorada. Nunca fatal |
 * | `rig.reference` | `k = comprimento do osso no hospedeiro / comprimento da referência`, multiplicando `value` e `cy` das timelines de **translação** (`x`, `y`). Rotação, escala e cisalhamento não mudam. Sem `reference`, `k = 1` |
 * | Os dois runtimes | `runtime/src/externos.ts` e `runtime-python/`. Casos C-275, C-276, C-277, C-279, C-294 e C-297 |
 *
 * **O buraco era só a tela**: o editor exportava e importava PELE
 * (`export-skin.ts`) e não exportava nem importava ANIMAÇÃO. Este arquivo é o
 * irmão daquele, escrito contra ele linha a linha — a pele e a animação são as
 * duas metades da mesma frase da §2.8, e quem ler os dois lado a lado tem de
 * ver a mesma forma.
 *
 * | `export-skin.ts` | aqui |
 * |:---|:---|
 * | `buildSkinFile` | `buildAnimationFile` |
 * | `skinFileNotice` | `animationFileNotice` |
 * | `ImportSkinFile` | `ImportAnimationFile` |
 * | `importedSkinUris` | `importedAnimationUris` |
 * | `importSkinNotice` | `importAnimationNotice` |
 * | `unmetRig` | o mesmo `unmetRig`, importado de lá: a conta é uma só |
 *
 * **O que muda entre os dois, e é a §4.8 quem manda:** uma pele declara no
 * `rig` os slots que preenche e os ossos em que pendura os seus; um arquivo de
 * animações declara **todo `target` de timeline `bone`** e os alvos das
 * timelines `slot`, `deform`, `weights` e `sequence` — mais o `reference`, que
 * só existe em arquivo de animação.
 */

import type { BoneFile } from '../../../runtime/src/index.js';
import { composeExternals } from '../../../runtime/src/index.js';
import type { ChangeKind, Command, EditorDoc } from '../contract.js';
// O `unmetRig` é o mesmo dos dois lados (4.8): quem confere é o leitor do
// hospedeiro, e a conta não muda por ser pele ou animação. Uma cópia aqui
// seriam duas verdades sobre o mesmo aviso.
import { BONE_EXTENSION, unmetRig } from './export-skin.js';
// O `el` é um só, em `ui/dom.ts`, desde o lote A4 — a exceção escrita no
// `contract.ts`: `io/` pode importá-lo, e só a ele, de `ui/`.
import { el } from '../ui/dom.js';

export { BONE_EXTENSION, unmetRig };

// ---------------------------------------------------------------------------
// A convenção: de onde sai o `rig.reference`
// ---------------------------------------------------------------------------

/**
 * O osso de referência da convenção do projeto (`formato/rigs/humanoide-v1`).
 *
 * É o `tronco`, e não a raiz: a raiz de um humanoide costuma ter comprimento
 * zero, e um divisor zero não escala coisa nenhuma. O tronco tem comprimento
 * em todo corpo que segue a convenção, e é ele que dá a altura.
 */
export const CONVENTION_REFERENCE_BONE = 'tronco';

/** O que o `extras.convencao` de um corpo da convenção guarda (4.8, 14.4). */
interface ConventionExtras {
  convencao?: { referencia_para_rig_reference?: { bone?: unknown; length?: unknown } };
}

/**
 * O nome do osso que vai virar `rig.reference.bone`, na ordem em que se
 * procura — e **nunca inventado**: sem nenhum destes, o arquivo sai sem
 * `reference`, e a janela diz que a animação não se ajusta ao tamanho.
 *
 * 1. o `extras.convencao.referencia_para_rig_reference.bone` deste arquivo (é
 *    o que o `humanoide-v1.bone` grava, e o que um corpo feito dele herda);
 * 2. o `rig.reference.bone` que o arquivo já declare;
 * 3. o `tronco` da convenção, **se este corpo tiver um osso com esse nome**.
 */
export function referenceBoneName(file: BoneFile): string | null {
  const extras = (file as unknown as { extras?: ConventionExtras }).extras;
  const daConvencao = extras?.convencao?.referencia_para_rig_reference?.bone;
  if (typeof daConvencao === 'string' && daConvencao !== '') return daConvencao;
  const doRig = (file as unknown as { rig?: { reference?: { bone?: unknown } } }).rig?.reference?.bone;
  if (typeof doRig === 'string' && doRig !== '') return doRig;
  const tem = (file.bones ?? []).some((bone) => bone.name === CONVENTION_REFERENCE_BONE);
  return tem ? CONVENTION_REFERENCE_BONE : null;
}

/**
 * O `rig.reference` deste corpo: o osso da convenção e **o comprimento que ele
 * tem aqui** (4.8: *"o comprimento que ele tinha no esqueleto em que a animação
 * foi gravada"*).
 *
 * `null` quando não há osso de referência, quando o corpo não tem esse osso, ou
 * quando o comprimento dele é zero — a spec pede `length > 0` (L1
 * `RIG_REFERENCE`), e gravar zero faria um arquivo inválido. Nesse caso `k = 1`
 * e a animação entra no tamanho em que foi gravada; a janela diz isso por
 * extenso, em vez de deixar passar calado (regra 21).
 */
export function referenceOf(file: BoneFile): { bone: string; length: number } | null {
  const nome = referenceBoneName(file);
  if (nome === null) return null;
  const osso = (file.bones ?? []).find((bone) => bone.name === nome);
  const length = typeof osso?.length === 'number' ? osso.length : 0;
  if (osso === undefined || !(length > 0)) return null;
  return { bone: nome, length };
}

// ---------------------------------------------------------------------------
// O `rig` gerado do conteúdo (4.8)
// ---------------------------------------------------------------------------

/** Os tipos de timeline cujo `target` é um **slot** (9.1). */
const SLOT_TIMELINES = new Set(['slot', 'deform', 'weights', 'sequence', 'nested']);

/** Uma timeline, só o que se lê daqui. */
interface TimelineShape { type?: unknown; target?: unknown }

/** Uma animação do arquivo, só o que se lê daqui. */
interface AnimationShape { name?: unknown; timelines?: unknown }

/**
 * O que estas animações **exigem** do hospedeiro: os ossos e os slots que as
 * timelines nomeiam (4.8).
 *
 * *"Um arquivo de animações lista aqui todo `target` de timeline `bone`"*, e em
 * `slots`, *"os alvos das timelines `slot`, `deform`, `weights` e `sequence`"*.
 * A ordem é a de aparição, para que dois arquivos gravados do mesmo corpo saiam
 * com a mesma lista, na mesma ordem — um `.bone` que muda de bytes sem mudar de
 * conteúdo é ruído no controle de versão de quem recebe.
 */
export function rigOfAnimations(
  animations: readonly unknown[],
): { bones: string[]; slots: string[] } {
  const bones: string[] = [];
  const slots: string[] = [];
  for (const animation of animations) {
    const timelines = (animation as AnimationShape)?.timelines;
    if (!Array.isArray(timelines)) continue;
    for (const raw of timelines) {
      const tl = raw as TimelineShape;
      const target = typeof tl?.target === 'string' ? tl.target : null;
      if (target === null || target === '') continue;
      const type = typeof tl?.type === 'string' ? tl.type : '';
      if (type === 'bone') { if (!bones.includes(target)) bones.push(target); }
      else if (SLOT_TIMELINES.has(type)) { if (!slots.includes(target)) slots.push(target); }
      // `drawOrder`, `event`, `tag` e `body` não têm alvo; `constraint`,
      // `parameter`, `morph` e `variable` apontam para coisas que a §2.8
      // IGNORA num arquivo externo — pôr esses nomes no `rig` faria o
      // hospedeiro reclamar de um nome que nunca vai ser usado.
    }
  }
  return { bones, slots };
}

// ---------------------------------------------------------------------------
// O arquivo de animações
// ---------------------------------------------------------------------------

/** O que sai num arquivo de animações, para a janela dizer antes de gravar. */
export interface AnimationFileReport {
  /** As animações que foram, na ordem do arquivo. */
  animations: string[];
  /** O que o `rig` exige do hospedeiro: ossos. */
  needsBones: string[];
  /** O que o `rig` exige do hospedeiro: slots. */
  needsSlots: string[];
  /** O `rig.reference` gravado, ou `null` quando este corpo não tem um. */
  reference: { bone: string; length: number } | null;
  /** Quantas chaves foram, somadas. */
  keys: number;
  /**
   * O que o arquivo **não leva**, por extenso, quando havia o que deixar: os
   * eventos que as chaves `event` citam, e as regras que as timelines
   * `constraint` citam. A §2.8 ignora os dois num arquivo externo, e quem
   * exporta tem de saber disso **antes** de mandar o arquivo a alguém.
   */
  dropped: string[];
}

/** A contagem de chaves de uma animação. */
function keyCount(animation: unknown): number {
  const timelines = (animation as AnimationShape)?.timelines;
  if (!Array.isArray(timelines)) return 0;
  let total = 0;
  for (const tl of timelines) {
    const keys = (tl as { keys?: unknown })?.keys;
    if (Array.isArray(keys)) total += keys.length;
  }
  return total;
}

/** O que a §2.8 vai jogar fora deste arquivo: eventos e regras citados. */
function droppedNames(animations: readonly unknown[]): string[] {
  const eventos: string[] = [];
  const regras: string[] = [];
  for (const animation of animations) {
    const timelines = (animation as AnimationShape)?.timelines;
    if (!Array.isArray(timelines)) continue;
    for (const raw of timelines) {
      const tl = raw as TimelineShape & { keys?: unknown };
      const type = typeof tl?.type === 'string' ? tl.type : '';
      if (type === 'constraint') {
        const target = typeof tl.target === 'string' ? tl.target : '';
        if (target !== '' && !regras.includes(target)) regras.push(target);
      } else if (type === 'event' && Array.isArray(tl.keys)) {
        for (const key of tl.keys) {
          const nome = (key as { event?: unknown })?.event;
          if (typeof nome === 'string' && nome !== '' && !eventos.includes(nome)) eventos.push(nome);
        }
      }
    }
  }
  return [
    ...eventos.map((nome) => `evento "${nome}"`),
    ...regras.map((nome) => `regra "${nome}"`),
  ];
}

/**
 * O `.bone` de um punhado de animações, pronto para `assets.animations` de
 * outro corpo (2.8).
 *
 * Não mexe no documento. O `rig` sai do conteúdo, como a spec pede de um
 * gravador (4.8), e o `reference` sai da convenção deste corpo.
 *
 * **O osso raiz vai junto, e só ele.** `bones` é obrigatório (2.2) e um arquivo
 * sem osso nenhum não carrega; mas a §2.8 ignora os `bones` de um arquivo de
 * animações, então levar o esqueleto inteiro só engordaria o arquivo e faria
 * quem o abrisse pensar que ele traz um corpo. Vai a raiz, pelada.
 *
 * Devolve `null` quando nenhum dos nomes pedidos existe: um arquivo de
 * animações sem animação nenhuma não é um arquivo de animações.
 */
export function buildAnimationFile(
  file: BoneFile, names: readonly string[],
): { file: BoneFile; report: AnimationFileReport } | null {
  const todas = (file.animations ?? []) as unknown as AnimationShape[];
  const pedidas = new Set(names);
  const escolhidas = todas.filter((a) => typeof a.name === 'string' && pedidas.has(a.name));
  if (escolhidas.length === 0) return null;

  const { bones: needsBones, slots: needsSlots } = rigOfAnimations(escolhidas);
  const reference = referenceOf(file);

  // A raiz: o primeiro osso sem `parent`, ou o primeiro do arquivo. Sai com o
  // nome e nada mais — a pose dela não vale nada do outro lado (2.8).
  const ossos = file.bones ?? [];
  const raiz = ossos.find((bone) => bone.parent === undefined || bone.parent === null) ?? ossos[0];
  const nomeRaiz = raiz?.name ?? 'raiz';

  const rigName = (file as unknown as { rig?: { name?: unknown } }).rig?.name;
  const skeletonName = (file as unknown as { skeleton?: { name?: unknown } }).skeleton?.name;

  const saida = {
    // O cabeçalho vem do corpo de origem, e não inventado aqui: `minVersion` é
    // obrigatório (§2.1), e um arquivo sem ele não carrega — o tipo de defeito
    // que só aparece na máquina de quem recebeu. É a mesma linha do
    // `buildSkinFile`, e é de propósito.
    bone: {
      ...JSON.parse(JSON.stringify(file.bone ?? { version: '1.0', minVersion: '1.0' })),
      generator: 'Recorte',
    },
    skeleton: { name: escolhidas.length === 1 ? String(escolhidas[0]!.name) : 'animacoes' },
    rig: {
      name: typeof rigName === 'string' && rigName !== '' ? rigName
        : typeof skeletonName === 'string' && skeletonName !== '' ? `${skeletonName}-v1`
          : 'animacoes-v1',
      ...(needsBones.length === 0 ? {} : { bones: needsBones }),
      ...(needsSlots.length === 0 ? {} : { slots: needsSlots }),
      ...(reference === null ? {} : { reference }),
    },
    bones: [{ name: nomeRaiz }],
    animations: JSON.parse(JSON.stringify(escolhidas)),
  } as unknown as BoneFile;

  return {
    file: saida,
    report: {
      animations: escolhidas.map((a) => String(a.name)),
      needsBones,
      needsSlots,
      reference,
      keys: escolhidas.reduce((total, a) => total + keyCount(a), 0),
      dropped: droppedNames(escolhidas),
    },
  };
}

/** A frase do rodapé depois de gravar as animações. */
export function animationFileNotice(name: string, report: AnimationFileReport): string {
  const quantas = report.animations.length === 1
    ? `a animação "${report.animations[0]!}"`
    : `${report.animations.length} animações`;
  const exige = report.needsBones.length + report.needsSlots.length;
  const contrato = exige === 0 ? ''
    : `; ${exige === 1 ? 'ela exige 1 nome' : `elas exigem ${exige} nomes`} de quem as usar`;
  const escala = report.reference === null
    ? '. Sem osso de referência: ela entra no tamanho em que foi gravada'
    : `. O tamanho se ajusta pelo osso "${report.reference.bone}" (${report.reference.length})`;
  return `${name}: ${quantas}, ${report.keys} chave(s)${contrato}${escala}`;
}

/** A lista que a janela mostra depois de gravar: uma linha por coisa. */
export function animationFileReport(report: AnimationFileReport): string[] {
  const linhas: string[] = [];
  for (const nome of report.animations) linhas.push(`Animação ${nome}`);
  for (const nome of report.needsBones) linhas.push(`Exige o osso "${nome}" de quem a usar`);
  for (const nome of report.needsSlots) linhas.push(`Exige o slot "${nome}" de quem a usar`);
  if (report.reference === null) {
    linhas.push('Sem rig.reference: a animação entra no tamanho em que foi gravada');
  } else {
    linhas.push(
      `rig.reference: o osso "${report.reference.bone}", de comprimento ${report.reference.length}`,
    );
  }
  for (const nome of report.dropped) linhas.push(`Fica de fora: ${nome} (2.8 ignora)`);
  return linhas;
}

// ---------------------------------------------------------------------------
// Importar animação
// ---------------------------------------------------------------------------

/**
 * **Importar animação…**: põe o uri do arquivo em `assets.animations` (2.8).
 *
 * As animações de fora **não são copiadas** para dentro do corpo, e é de
 * propósito: elas continuam sendo um arquivo, que se troca sem reabrir o
 * personagem. É a mesma escolha da pele de fora (`ImportSkinFile`), e é o que
 * o runtime já monta.
 */
export class ImportAnimationFile implements Command {
  readonly label = 'Importar animação';
  readonly kind: ChangeKind = 'structure';
  private had = false;
  private before: string[] = [];

  constructor(private readonly uri: string) {}

  apply(doc: EditorDoc): void {
    const file = doc.file as unknown as { assets?: { animations?: string[] } };
    file.assets ??= {};
    this.had = Array.isArray(file.assets.animations);
    this.before = this.had ? [...file.assets.animations!] : [];
    if (this.before.includes(this.uri)) return;
    file.assets.animations = [...this.before, this.uri];
  }

  revert(doc: EditorDoc): void {
    const file = doc.file as unknown as { assets?: { animations?: string[] } };
    if (file.assets === undefined) return;
    if (this.had) file.assets.animations = [...this.before];
    else delete file.assets.animations;
  }
}

/**
 * **Importar animação…, copiando** — M17, rodada 3 (04/10/2026): a mesma forma
 * da pele, *"o que eu gravo, eu não consigo ler"*. A Importar só escrevia o
 * uri em `assets.animations`, e o editor monta o corpo sem ler arquivo de fora:
 * a animação aparecia em "De fora" pelo nome, e não tocava.
 *
 * Agora ela entra no corpo, pela conta do runtime (`composeExternals`, 2.8):
 * o nome que já existe aqui não entra por cima (o daqui vale), e o
 * `rig.reference` multiplica as translações pelo fator que a janela mostrou.
 */
export class ImportAnimationCopy implements Command {
  readonly label = 'Importar animação';
  readonly kind: ChangeKind = 'structure';
  /** Os avisos da composição (2.8), com o código na frente. */
  warnings: string[] = [];
  /** Os nomes que entraram. */
  brought: string[] = [];
  private had = false;
  private before: unknown = undefined;
  private after: unknown = null;

  constructor(private readonly uri: string, private readonly external: BoneFile) {}

  apply(doc: EditorDoc): void {
    const file = doc.file as unknown as Record<string, unknown>;
    if (this.after === null) {
      this.had = 'animations' in file;
      this.before = JSON.parse(JSON.stringify(file['animations'] ?? null));
      const host = JSON.parse(JSON.stringify(file)) as Record<string, unknown>;
      const assets = { ...((host['assets'] as Record<string, unknown> | undefined) ?? {}) };
      assets['animations'] = [this.uri];
      delete assets['skins'];
      host['assets'] = assets;
      const external = JSON.parse(JSON.stringify(this.external)) as unknown;
      const composed = composeExternals(host, '', () => external);
      this.warnings = [...composed.warnings];
      this.after = (composed.tree as Record<string, unknown>)['animations'] ?? [];
      const antes = new Set(((this.before ?? []) as Array<{ name?: string }>).map((a) => a.name));
      this.brought = (this.after as Array<{ name?: string }>)
        .map((a) => a.name).filter((n): n is string => typeof n === 'string' && !antes.has(n));
    }
    file['animations'] = JSON.parse(JSON.stringify(this.after));
  }

  revert(doc: EditorDoc): void {
    const file = doc.file as unknown as Record<string, unknown>;
    if (this.had) file['animations'] = JSON.parse(JSON.stringify(this.before));
    else delete file['animations'];
  }
}

/** Os uris de animação de fora que este corpo já cita. */
export function importedAnimationUris(file: BoneFile): string[] {
  return [...((file as unknown as { assets?: { animations?: string[] } }).assets?.animations ?? [])];
}

// ---------------------------------------------------------------------------
// O que o editor SABE de um arquivo de fora — degrau 12, parte `B`, lote 2
// ---------------------------------------------------------------------------

/*
 * **Por que isto existe, e por que NÃO vai para dentro do documento.**
 *
 * O `assets.animations` guarda uris, não nomes: os nomes moram no arquivo de
 * fora, e é o LEITOR do hospedeiro que os copia ao carregar (2.8). O editor não
 * resolve caminho de disco sozinho, então, de um `.bone` aberto que já citava um
 * arquivo externo, ele não sabe que animações são aquelas.
 *
 * O que ele sabe é o que passou pelas mãos dele nesta sessão: quem importou ou
 * trouxe da biblioteca teve o arquivo aberto e lido aqui dentro. Esses nomes
 * ficam neste mapa, que é **estado de sessão**, como o `fromOutside` do
 * `io/open-save.ts` — e **não** um campo novo no `RECORTE_editor_state`. Gravar
 * os nomes no documento criaria uma segunda verdade: o arquivo de fora pode
 * mudar no disco, e o que estivesse gravado aqui passaria a mentir.
 *
 * O que o editor não sabe, ele **diz que não sabe** (regra 21): a janela
 * Animação mostra o uri e escreve que os nomes aparecem quando o arquivo for
 * aberto. Nunca um palpite.
 */
const knownNames = new Map<string, string[]>();

/** Anota as animações que um arquivo de fora trouxe, nesta sessão. */
export function rememberAnimationNames(uri: string, names: readonly string[]): void {
  knownNames.set(uri, [...names]);
}

/** As animações que este arquivo de fora traz, ou `null` se o editor não sabe. */
export function knownAnimationNames(uri: string): string[] | null {
  const names = knownNames.get(uri);
  return names === undefined ? null : [...names];
}

/** Esquece tudo: o projeto é outro. */
export function forgetAnimationNames(): void {
  knownNames.clear();
}

/**
 * O fator de tamanho que o runtime vai aplicar às translações (2.8, F24), para
 * a tela poder dizê-lo **antes** de importar.
 *
 * `k = hospedeiro.bones[reference.bone].length / reference.length`. Sem
 * `reference`, ou com um osso que o hospedeiro não tem, ou de comprimento zero:
 * `k = 1` — e aí o aviso já está na lista do `unmetRig`.
 *
 * A conta é a do `runtime/src/externos.ts`, `referenceFactor`; ela mora lá, e
 * aqui só se repete o suficiente para a frase da tela dizer a verdade. Um
 * número diferente do runtime seria pior do que nenhum.
 */
export function referenceFactorFor(host: BoneFile, external: BoneFile): number {
  const reference = (external as unknown as {
    rig?: { reference?: { bone?: unknown; length?: unknown } };
  }).rig?.reference;
  const bone = typeof reference?.bone === 'string' ? reference.bone : null;
  const length = typeof reference?.length === 'number' ? reference.length : 0;
  if (bone === null || !(length > 0)) return 1;
  const doHospedeiro = (host.bones ?? []).find((b) => b.name === bone);
  const aqui = typeof doHospedeiro?.length === 'number' ? doHospedeiro.length : 0;
  if (!(aqui > 0)) return 1;
  return aqui / length;
}

/**
 * As linhas que a janela mostra **antes de aplicar** uma animação de fora: o
 * que entra, o que este corpo não tem, e em que tamanho ela vai entrar.
 *
 * Quem confere de verdade é o leitor do hospedeiro, e ele avisa `RIG_UNMET`
 * (4.8); o editor diz a mesma coisa aqui, em português, porque é **aqui** que
 * ainda dá para escolher outro corpo ou outro arquivo (regra 21).
 */
export function importAnimationLines(
  host: BoneFile, external: BoneFile, names: readonly string[],
): string[] {
  const linhas = names.map((nome) => `Entra a animação "${nome}"`);
  const falta = unmetRig(host, external);
  for (const nome of falta) linhas.push(`Esta base NÃO tem o ${nome}: o que depender dele fica de fora`);
  const k = referenceFactorFor(host, external);
  linhas.push(k === 1
    ? 'Tamanho: a animação entra como foi gravada (k = 1)'
    : `Tamanho: as translações entram multiplicadas por ${k.toFixed(3).replace('.', ',')}`);
  return linhas;
}

/** A frase do rodapé ao importar. Diz o que falta, quando falta. */
export function importAnimationNotice(
  uri: string, names: readonly string[], unmet: readonly string[],
): string {
  const animacoes = names.length === 0 ? 'nenhuma animação'
    : names.length === 1 ? `a animação "${names[0]!}"` : `${names.length} animações`;
  if (unmet.length === 0) return `${uri}: ${animacoes}, agora na lista de Animações`;
  return `${uri}: ${animacoes}. Esta base não tem ${unmet.join(', ')} — as animações entram assim `
    + 'mesmo, e o que depender desses nomes fica de fora';
}

// ---------------------------------------------------------------------------
// A janela de exportar
// ---------------------------------------------------------------------------
//
// Sem folha de estilo nova: as linhas pegam emprestadas as classes do painel
// "Propriedades" (`prop-linha`, `prop-rotulo`) e a moldura, as da janela de
// mensagem (`dialog-veil`, `dialog-box`) — exatamente como o `export-skin.ts`.

/** O que a pessoa marcou. */
export interface AnimationExportChoice {
  readonly animations: readonly string[];
}

/** O que saiu. */
export interface AnimationExportRun {
  readonly choice: AnimationExportChoice;
  readonly report: AnimationFileReport;
  readonly name: string;
  readonly size: number;
}

/** As animações que este arquivo oferece, na ordem do arquivo. */
export function animationNames(file: BoneFile): string[] {
  return ((file.animations ?? []) as unknown as AnimationShape[])
    .map((a) => String(a.name ?? ''))
    .filter((name) => name !== '');
}

/** Os bytes de um texto, contados como um arquivo os conta. */
export function textBytes(text: string): number {
  return new TextEncoder().encode(text).length;
}

/** Os bytes que esta janela gravaria. */
export function animationText(file: BoneFile): string {
  return `${JSON.stringify(file, null, 2)}\n`;
}

/**
 * O nome sugerido: uma animação sozinha leva o nome dela; várias levam o nome
 * do rig, que é o que as junta.
 */
export function suggestedAnimationName(file: BoneFile, choice: AnimationExportChoice): string {
  if (choice.animations.length === 1) return `${choice.animations[0]!}${BONE_EXTENSION}`;
  const rigName = (file as unknown as { rig?: { name?: unknown } }).rig?.name;
  // QA 04/11/2026 (D13): sem rig, saía "animacoes-animacoes.bone". O nome da
  // base vem no lugar do rig; sem nenhum dos dois, "animacoes.bone".
  const skeletonName = (file as unknown as { skeleton?: { name?: unknown } }).skeleton?.name;
  const base = typeof rigName === 'string' && rigName !== '' ? rigName
    : typeof skeletonName === 'string' && skeletonName !== '' ? skeletonName : null;
  return base === null ? `animacoes${BONE_EXTENSION}` : `${base}-animacoes${BONE_EXTENSION}`;
}

/** Uma caixa de marcar com as palavras ao lado, e as palavras são o rótulo. */
function tickRow(name: string, checked: boolean, id: string): {
  row: HTMLElement; box: HTMLInputElement;
} {
  const row = el('div', 'prop-linha');
  const words = el('label', 'prop-rotulo', name);
  words.htmlFor = id;
  const box = el('input', 'prop-marca') as HTMLInputElement;
  box.type = 'checkbox';
  box.checked = checked;
  box.id = id;
  row.append(words, box);
  return { row, box };
}

/**
 * Abre "Exportar animação…". Resolve com `null` quando a janela foi fechada
 * sem exportar.
 *
 * Nada é gravado até o botão ser apertado, e o arquivo que alimenta os números
 * é montado na memória, numa cópia: uma janela aberta por engano não custa
 * nada e não muda nada. É a promessa do `exportSkinWindow`, e é a mesma aqui.
 *
 * `write` é quem grava — o painel passa o seletor de arquivo de verdade
 * (`putBoneFile`), e o teste passa um que devolve um nome de mentira, sem DOM.
 */
export function exportAnimationWindow(
  file: BoneFile,
  write: (suggested: string, text: string) => Promise<string | null>,
  host?: HTMLElement,
): Promise<AnimationExportRun | null> {
  const parent = host ?? document.body;
  const animations = animationNames(file);
  const aberta = animations;

  const box = el('div', 'dialog-box');
  // As classes de `prop-*` leem variáveis que só existem dentro de `.painel`.
  // Fora dele o `grid-template-columns` fica inválido e o rótulo cai POR CIMA
  // do campo. As variáveis vão aqui, com os mesmos valores de `panels.css`.
  for (const [name, value] of [
    ['--painel-rotulo', '70%'],
    ['--painel-linha', '#c3ccd8'],
    ['--painel-campo', '#f4f6f9'],
    ['--painel-texto', '#10151c'],
    ['--painel-texto-fraco', '#45505e'],
    ['--painel-realce', '#1a4fd8'],
  ]) box.style.setProperty(name, value);
  box.style.overflowY = 'auto';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Exportar animação');

  const veil = el('div', 'dialog-veil');
  veil.append(box);

  box.append(el('h2', 'dialog-title', 'Exportar animação'));
  box.append(el('p', 'dialog-lead',
    'Marque as animações que este arquivo tem de levar. Ele sai com o contrato '
    + 'de rig gerado do conteúdo — os ossos e os slots que as chaves nomeiam — e '
    + 'entra noutra base por Importar animação. A base, os desenhos e as skins '
    + 'NÃO vão junto: quem os lê é a base que receber o arquivo.'));

  const boxesByAnimation = new Map<string, HTMLInputElement>();
  box.append(el('h3', 'dialog-lead', 'Animações'));
  if (animations.length === 0) {
    box.append(el('p', 'dialog-lead', 'Este arquivo não tem animação nenhuma.'));
  }
  for (const name of aberta) {
    const { row, box: tick } = tickRow(name, true, `exportar-animacao-${name}`);
    boxesByAnimation.set(name, tick);
    box.append(row);
  }

  box.append(el('h3', 'dialog-lead', 'O que o arquivo vai exigir de quem o usar'));
  const valueNodes = new Map<string, HTMLElement>();
  for (const label of ['Ossos', 'Slots', 'Chaves', 'Tamanho em bytes']) {
    const row = el('div', 'prop-linha');
    const value = el('span', undefined, '—');
    row.append(el('span', 'prop-rotulo', label), value);
    valueNodes.set(label, value);
    box.append(row);
  }

  const nomes = el('p', 'dialog-lead', '');
  const escala = el('p', 'dialog-lead', '');
  const fora = el('p', 'dialog-lead', '');
  box.append(nomes, escala, fora);

  const go = el('button', 'dialog-close', 'Exportar') as HTMLButtonElement;
  go.type = 'button';
  const cancel = el('button', 'dialog-close', 'Fechar sem exportar') as HTMLButtonElement;
  cancel.type = 'button';
  const buttons = el('div', 'dialog-buttons');
  buttons.append(go, cancel);
  box.append(buttons);

  const chosen = (): AnimationExportChoice => ({
    animations: animations.filter((name) => boxesByAnimation.get(name)?.checked ?? false),
  });

  let latest: { file: BoneFile; report: AnimationFileReport } | null = null;
  let latestText = '';

  const refresh = (): void => {
    const choice = chosen();
    const built = buildAnimationFile(file, choice.animations);
    latest = built;
    if (built === null) {
      go.disabled = true;
      for (const node of valueNodes.values()) node.textContent = '—';
      nomes.textContent = 'Marque pelo menos uma animação: um arquivo de animações sem '
        + 'animação nenhuma não é um arquivo de animações.';
      escala.textContent = '';
      fora.textContent = '';
      return;
    }
    go.disabled = false;
    latestText = animationText(built.file);
    const { report } = built;
    const conta = new Map([
      ['Ossos', report.needsBones.length],
      ['Slots', report.needsSlots.length],
      ['Chaves', report.keys],
      ['Tamanho em bytes', textBytes(latestText)],
    ]);
    for (const [label, node] of valueNodes) {
      node.textContent = (conta.get(label) ?? 0).toLocaleString('pt-BR');
    }
    // Os nomes por extenso, e não só a contagem: é a lista que quem receber o
    // arquivo vai ter de ter, e ela cabe na tela.
    const exigidos = [
      ...report.needsBones.map((n) => `osso "${n}"`),
      ...report.needsSlots.map((n) => `slot "${n}"`),
    ];
    nomes.textContent = exigidos.length === 0
      ? 'Estas animações não nomeiam osso nem slot nenhum: elas cabem em qualquer base.'
      : `Quem usar este arquivo precisa ter: ${exigidos.join(', ')}.`;
    escala.textContent = report.reference === null
      ? 'Sem osso de referência: a animação entra no tamanho em que foi gravada. Para que ela '
        + 'se ajuste a bases de outro tamanho, a base precisa de um osso "'
        + `${CONVENTION_REFERENCE_BONE}" com comprimento, como na convenção humanoide-v1.`
      : `O tamanho se ajusta pelo osso "${report.reference.bone}", que aqui mede `
        + `${report.reference.length}. Numa base de outro tamanho as translações entram `
        + 'multiplicadas pela razão entre os dois comprimentos.';
    fora.textContent = report.dropped.length === 0 ? ''
      : `Fica de fora, porque a §2.8 ignora num arquivo de animações: ${report.dropped.join(', ')}.`;
  };

  for (const tick of boxesByAnimation.values()) tick.addEventListener('change', refresh);
  refresh();

  return new Promise<AnimationExportRun | null>((resolve) => {
    let open = true;
    const finish = (value: AnimationExportRun | null): void => {
      if (!open) return;
      open = false;
      document.removeEventListener('keydown', onKey, true);
      veil.remove();
      resolve(value);
    };

    function onKey(event: KeyboardEvent): void {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      finish(null);
    }

    cancel.addEventListener('click', () => finish(null));
    veil.addEventListener('pointerdown', (event) => {
      if (event.target === veil) finish(null);
    });
    document.addEventListener('keydown', onKey, true);

    go.addEventListener('click', () => {
      const built = latest;
      if (built === null) return;
      const choice = chosen();
      void write(suggestedAnimationName(file, choice), latestText).then((name) => {
        if (name === null) return; // A pessoa fechou a janela de gravar.
        finish({ choice, report: built.report, name, size: textBytes(latestText) });
      });
    });

    parent.append(veil);
    go.focus();
  });
}

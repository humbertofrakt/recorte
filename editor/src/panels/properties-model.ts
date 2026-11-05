/**
 * Model behind the "Propriedades" panel.
 *
 * Everything here is pure: it turns a `BoneFile` plus a `Selection` into a flat
 * description of the fields to draw, and it produces the `SetProperty` commands
 * that write those fields back into the file. No DOM, so it is testable without
 * a browser.
 */

import { comRegua, medidaDoCaminho, medidaDoComando } from './regua-numeros.js';
import type { Unidade } from './regua-numeros.js';
import type {
  BoneFile, ConstraintDef, KeyValue, MeshAttachmentDef,
  RegionAttachmentDef, SlotDef,
} from '../../../runtime/src/index.js';
import { isOwnBone, ownBoneOfSlot, shownBone, shownBoneOfSlot, slotKindWord } from '../doc/own-bone.js';
import type { ChangeKind, Command, EditorDoc, Selection } from '../contract.js';
import { corpoDe } from '../contract.js';
import { BONE_ICONS, DEFAULT_BONE_COLOR } from '../viewport/bone-icons.js';
import { getAtPointer, hasAtPointer, pointerOf, setAtPointer } from './json-pointer.js';
import { PARTICLE_TYPE, rootHidden } from './tree-model.js';
import { keyCreatedNotice, revealKey, roundTime, sameTime, targetForPointer } from '../anim/keying.js';
// Degrau 12, porta D3: os parâmetros (§8.1) e os alvos do Comando (§8.2).
import {
  AddDriverTarget, DRIVER_PROPERTIES, RemoveDriverTarget, driverProblems, driverTargets,
  parameterRange, parameterRow, RenameParameter,
} from './rules-model.js';
// Porta G9/P15: as variáveis (§8.4).
import {
  RenameVariable, SetVariableType, VARIABLE_TYPES, variableRow,
} from './rules-vars.js';
// Degrau 9 (9.9): a ficha da chave `body` — a pilha passa na virada?
import { bodyKeys } from '../anim/body.js';
import { setPropertyOrKey } from '../anim/pose-mode.js';
import { attachmentField, writeImageValue, writeInnerAsKey } from './image-key.js';
import {
  PICK_SKIN_NOTICE, SetSkinRequired, ToggleSkinMember, skinForRequired, skinsListing,
  type SkinMemberKind,
} from './skins-model.js';
// `findAttachment` mora em `doc/attachments.ts` desde o lote A4.
import { findAttachment } from '../doc/attachments.js';
import { particleSheetTabs, type SheetTab } from './particle-sheet.js';
import { emitterWeight, skeletonWeight, type Weight } from './particle-weight.js';
import { entityNameFor } from '../doc/drop-entity.js';
export { findAttachment } from '../doc/attachments.js';

// ---------------------------------------------------------------------------
// Field description
// ---------------------------------------------------------------------------

/** How a field is drawn and edited. */
export type FieldKind =
  | 'text' | 'number' | 'checkbox' | 'select' | 'color' | 'color3'
  /**
   * Rodada 16, lotes 4 e 5: as chaves ao longo da vida do emissor (uma curva
   * de 0 a 1 da vida), o gradiente de cor, e a lista de rajadas. O valor é a
   * lista inteira, e o painel desenha o editor de cada uma
   * (`life-curve.ts`, `burst-list.ts`).
   */
  | 'lifeCurve' | 'lifeGradient' | 'bursts'
  /**
   * Uma lista de caixas: o valor é um array de nomes.
   *
   * A máscara precisa dela — "Só estes" é uma lista de slots, e §7.7 diz que
   * ela manda no `end` quando existe. Uma lista escrita à mão num campo de
   * texto daria nomes errados que não dão erro: dariam uma máscara que não
   * recorta e ninguém sabe por quê.
   */
  | 'checklist';

/** What a name field renames, because a rename must also fix every reference. */
export type RenameKind = 'bone' | 'slot' | 'constraint' | 'attachment' | 'animation' | 'skin';

export interface FieldOption {
  value: string;
  /** Shown to the user, in Portuguese. */
  label: string;
}

export interface FieldDef {
  /** Stable id, unique inside the model. */
  key: string;
  /** Shown in the left column, in Portuguese. */
  label: string;
  /**
   * Rodada 16: a dica do campo. A ficha do emissor em abas mostra um rótulo
   * curto e guarda aqui o inteiro, para nada se perder (`particle-sheet.ts`).
   */
  hint?: string;
  /**
   * A unidade do número, escrita ao lado do campo — rodada 43, lote 1 (doc
   * `51`, §4): `px`, `°`, `×` ou `%`. A régua do doc `26`: nenhum número solto.
   */
  unit?: Exclude<Unidade, ''>;
  /**
   * O número na tela é o do arquivo vezes isto — rodada 47, lote 2. O que é de
   * 0 a 1 no arquivo (as forças, a inércia) aparece de 0 a 100 %. Sem, 1.
   */
  scale?: number;
  /**
   * Segunda conferência da rodada 16: um nome curtíssimo escrito AO LADO do
   * campo, quando três números dividem uma linha (a folha de quadros:
   * *qtd. · 1º · díg.*). O nome inteiro continua na dica.
   */
  short?: string;
  kind: FieldKind;
  /** Where the value lives in the file. Empty for fields that are not a property. */
  pointer: string;
  /** Value the format assumes when the property is absent. */
  fallback?: unknown;
  options?: FieldOption[];
  /** World units (or degrees) per pixel dragged. */
  step?: number;
  min?: number;
  max?: number;
  /** Set on name fields: editing them runs a rename, not a plain write. */
  renameOf?: RenameKind;
  /** Extra context for the rename command (the slot that owns an attachment). */
  renameScope?: { slot: string; skin: string };
  /** How the document changed, so the shell knows what to rebuild. */
  changeKind?: ChangeKind;
  /**
   * Set on a `select` whose empty option means "not written at all".
   *
   * The bone icon is the case: picking "Nenhum" must REMOVE `icon` from the
   * file, not write `"icon": ""`. An empty string is a value the format does
   * not define, and it would survive every round trip.
   */
  dropWhenEmpty?: boolean;
  /**
   * A caixa **Só com a pele** de um osso ou de uma regra — lote 39.
   *
   * Ela não é uma escrita simples de `skinRequired`: marcar põe o nome na
   * pele do lápis, e desmarcar o tira de toda pele. Ver `SetSkinRequired`.
   */
  skinRequiredOf?: { kind: SkinMemberKind; name: string };
  /**
   * A lista **Peles que ativam** — lote 39. O valor é a lista de peles que
   * citam o nome em `bones` ou `constraints`; ela não mora num ponteiro só,
   * mora uma vez em cada pele. Cada caixa é um `ToggleSkinMember`.
   */
  skinMember?: { kind: SkinMemberKind; name: string };
  /**
   * O comando que este campo roda, em vez da escrita simples no ponteiro —
   * degrau 12, porta D3.
   *
   * Existe para o campo que precisa arrastar mais coisa junto do que o valor.
   * O nome de um parâmetro é o caso: ele é citado pela regra Comando
   * (`constraint.parameter`) e pela timeline `parameter`, e uma escrita simples
   * trocaria o nome deixando as duas apontando para um nome que não existe.
   *
   * `null` quer dizer "não há o que fazer com este valor", e aí nada é gravado.
   */
  commandFor?(doc: EditorDoc, value: unknown): Command | null;
  /**
   * Qual componente de uma faixa `[min, max]` este campo mostra — extensão
   * `BONE_particles`, lote 3.
   *
   * O `pointer` de um campo de faixa aponta para a **faixa inteira**, porque é
   * ela que se grava (ver `rangeFieldCommand`: gravar só um componente criaria
   * um array de um elemento, e o schema exige dois). Então o `fieldValue`
   * precisa saber que o número a mostrar é o `[0]` ou o `[1]` do que está ali —
   * sem isto o campo "Vida (mínimo)" mostraria `1,1` em vez de `1`.
   */
  component?: number;
}

/**
 * Um botão em ícone no título de um grupo — degrau 12, porta D3.
 *
 * Existe porque um grupo pode ter **quantos** um documento disser: os alvos de
 * uma regra Comando são um array, e um array precisa de "mais um" e de "tira
 * este". Um campo não dá conta disso — campo escreve um valor num ponteiro.
 *
 * `command` é puro: devolve o `Command` a rodar, ou `null` quando não há o que
 * fazer. O painel só desenha o botão e roda o que vier. Ícone com o nome na
 * dica, pela regra da casa.
 */
export interface GroupAction {
  key: string;
  /** O ícone em `ui/icons.ts`. */
  icon: string;
  /** O nome, que vai na dica e no `aria-label`. */
  hint: string;
  command(doc: EditorDoc): Command | null;
}

export interface FieldGroup {
  /** Shown above the group, in Portuguese. */
  title: string;
  fields: FieldDef[];
  /** Botões em ícone ao lado do título. Vazio na maioria dos grupos. */
  actions?: GroupAction[];
  /** Uma frase em vermelho embaixo do grupo: o que está errado nele. */
  problem?: string;
}

export type SubjectKind =
  | 'skeleton' | 'bone' | 'slot' | 'attachment' | 'constraint' | 'parameter' | 'variable'
  | 'many' | 'none';

export interface PropertiesModel {
  /** Panel heading, e.g. "Osso: quadril". */
  title: string;
  /**
   * A linha embaixo do título — rodada 43, lote 1: *"imagem hand · no osso
   * torso"*. Diz onde o desenho está sem rolar até o campo Osso (doc `51`, T5).
   */
  subtitle?: string;
  subject: SubjectKind;
  groups: FieldGroup[];
  /** Shown instead of the fields when there is nothing to edit. */
  message?: string;
  /**
   * Rodada 16, lote 1: a ficha do emissor em abas. Quando existe, o painel
   * desenha as abas em vez dos grupos (`particle-sheet.ts`).
   */
  tabs?: SheetTab[];
  /** Rodada 16, lote 6: o peso do emissor e o do boneco inteiro (`particle-weight.ts`). */
  weight?: { emissor: Weight; boneco: Weight };
}

/**
 * As ferramentas em que "Compensar" quer dizer alguma coisa.
 *
 * São as três que mexem no osso e podem arrastar os filhos e os desenhos junto,
 * e o Transformar (lote 47), que é as três numa caixa só. Criar osso, Malha,
 * Pesos e Posar não têm o que compensar.
 */
const COMPENSATION_TOOLS: ReadonlySet<string> = new Set(['translate', 'rotate', 'scale', 'transform']);

/**
 * **O bloco "Compensar" aparece?** — decisão P6, defeitos D1 e B3 (29/09/2026).
 *
 * Até aqui bastava a ferramenta: com Transformar na mão o bloco aparecia para
 * QUALQUER escolha — um parâmetro, um emissor, um evento, nada — e vinha antes
 * da ficha, empurrando-a para baixo da borda. O título dizia "Parâmetro:
 * parametro" e o que se via eram três marcas de arrasto de osso.
 *
 * Compensar é o que fica parado enquanto **um osso** se mexe: os filhos, os
 * desenhos, as caixas. Sem osso escolhido não há o que compensar. As três
 * marcas continuam no menu Esqueleto, para quem quer ligá-las antes.
 */
export function compensationApplies(toolId: string, selection: Selection): boolean {
  return COMPENSATION_TOOLS.has(toolId) && selection.bones.length > 0;
}

/** Reads the current value of a field, falling back to the format default. */
export function fieldValue(file: BoneFile, field: FieldDef): unknown {
  if (field.pointer === '') return field.fallback;
  const value = getAtPointer(file, field.pointer);
  // Um campo de faixa aponta para o par e mostra UM componente dele. Um par
  // torto no arquivo cai no padrão da extensão em vez de mostrar `undefined`
  // num campo de número — o que apareceria como campo vazio e faria a pessoa
  // achar que o valor é zero.
  if (field.component !== undefined) {
    if (!Array.isArray(value)) return field.fallback;
    const parte = value[field.component];
    return typeof parte === 'number' ? parte : field.fallback;
  }
  return value === undefined ? field.fallback : value;
}

/** `true` when the property is written in the file (not just a default). */
export function fieldIsSet(file: BoneFile, field: FieldDef): boolean {
  return field.pointer !== '' && hasAtPointer(file, field.pointer);
}

// ---------------------------------------------------------------------------
// Simple arithmetic in numeric fields ("100/2" -> 50)
// ---------------------------------------------------------------------------

type Token = { type: 'number'; value: number } | { type: 'op'; value: string };

function tokenize(text: string): Token[] | null {
  const tokens: Token[] = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i]!;
    if (ch === ' ' || ch === '\t') { i++; continue; }
    if (ch >= '0' && ch <= '9' || ch === '.') {
      let j = i;
      while (j < text.length && (text[j]! >= '0' && text[j]! <= '9' || text[j] === '.')) j++;
      const value = Number(text.slice(i, j));
      if (!Number.isFinite(value)) return null;
      tokens.push({ type: 'number', value });
      i = j;
      continue;
    }
    if ('+-*/()'.includes(ch)) { tokens.push({ type: 'op', value: ch }); i++; continue; }
    return null;
  }
  return tokens;
}

const PRECEDENCE: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2 };

/**
 * Evaluates the small arithmetic a numeric field accepts: `+ - * /`, brackets
 * and a leading sign. The decimal separator may be a comma, because that is
 * what a Portuguese keyboard types. Returns `null` when the text is not a
 * valid expression, so the caller can keep the old value.
 */
export function evalNumberExpression(text: string): number | null {
  const normalized = text.trim().replace(/,/g, '.');
  if (normalized === '') return null;
  const tokens = tokenize(normalized);
  if (!tokens) return null;

  const values: number[] = [];
  const ops: string[] = [];

  const applyTop = (): boolean => {
    const op = ops.pop();
    if (op === undefined || op === '(') return false;
    const b = values.pop();
    const a = values.pop();
    if (a === undefined || b === undefined) return false;
    if (op === '+') values.push(a + b);
    else if (op === '-') values.push(a - b);
    else if (op === '*') values.push(a * b);
    else if (op === '/') values.push(b === 0 ? NaN : a / b);
    else return false;
    return true;
  };

  let expectValue = true;
  for (const token of tokens) {
    if (token.type === 'number') {
      if (!expectValue) return null;
      values.push(token.value);
      expectValue = false;
      continue;
    }
    if (token.value === '(') {
      if (!expectValue) return null;
      ops.push('(');
      continue;
    }
    if (token.value === ')') {
      if (expectValue) return null;
      while (ops.length > 0 && ops[ops.length - 1] !== '(') {
        if (!applyTop()) return null;
      }
      if (ops.pop() !== '(') return null;
      continue;
    }
    if (expectValue) {
      // Unary sign: rewrite `-x` as `0 - x`.
      if (token.value === '-' || token.value === '+') {
        values.push(0);
        ops.push(token.value);
        continue;
      }
      return null;
    }
    while (ops.length > 0 && ops[ops.length - 1] !== '('
      && PRECEDENCE[ops[ops.length - 1]!]! >= PRECEDENCE[token.value]!) {
      if (!applyTop()) return null;
    }
    ops.push(token.value);
    expectValue = true;
  }

  if (expectValue) return null;
  while (ops.length > 0) {
    if (ops[ops.length - 1] === '(') return null;
    if (!applyTop()) return null;
  }
  if (values.length !== 1) return null;
  const result = values[0]!;
  return Number.isFinite(result) ? result : null;
}

/** Shows a number the way a Portuguese reader expects: comma, no noise digits. */
/**
 * **O nome da barrinha da cor** — rodada 38, lote 3 (doc 31). Ela dizia só
 * "transparência": nem o número, nem a faixa. Agora diz quanto está e o que as
 * pontas são, e muda enquanto se arrasta (`properties.ts`).
 */
/** Rodada 38, lote 5 (doc 35): a Cor na vida sem cor nenhuma era uma barra branca, muda. */
export function emptyGradientSays(): string {
  return 'Sem cor na vida: vale a Cor ao nascer. Clique na barra para pôr uma cor';
}

/** O que cabe DENTRO da barra (~20 letras em 1280×720); a frase inteira vai na dica. */
export const EMPTY_GRADIENT_SHORT = 'Só a Cor ao nascer';

/** O que o rodapé diz enquanto se arrasta a barrinha — doc 37: na faixa de duas cores ela era muda. */
export function alphaDragSays(label: string, percent: number): string {
  return `${label}: opacidade ${Math.round(percent)} %`;
}

/** O número da opacidade que se lê AO LADO da barrinha — lote 4b (doc 33): "100 %". */
export function alphaShown(percent: number): string {
  return `${Math.round(percent)} %`;
}

export function alphaTip(label: string, percent: number): string {
  return `${label}, opacidade: ${Math.round(percent)} % (de 0 a 100 %: 0 é invisível, 100 é cheia)`;
}

export function formatNumberField(value: number): string {
  if (!Number.isFinite(value)) return '0';
  const rounded = Math.round(value * 1000) / 1000;
  return String(rounded).replace('.', ',');
}

// ---------------------------------------------------------------------------
// As setas num campo de número — lote 48
// ---------------------------------------------------------------------------

/** As teclas que mudam o tamanho do passo. */
export interface StepModifiers {
  /** Dez passos. */
  shift?: boolean;
  /** Um décimo de passo. */
  alt?: boolean;
}

/** `↑` é +1, `↓` é −1, qualquer outra tecla é 0 — e 0 quer dizer "não é minha". */
/**
 * O que uma tecla faz num campo de número — QA da noite de 04/11/2026.
 * `passo`: as setas andam o número. `cancelar`: o Esc devolve o número de
 * antes e sai do campo (como no Photoshop) — antes o texto digitado ficava,
 * e a seta seguinte o gravava. `null`: a tecla é do próprio campo.
 */
export function fieldKeyAction(key: string): 'passo' | 'cancelar' | null {
  if (key === 'Escape') return 'cancelar';
  return arrowDirection(key) === 0 ? null : 'passo';
}

export function arrowDirection(key: string): 1 | -1 | 0 {
  if (key === 'ArrowUp') return 1;
  if (key === 'ArrowDown') return -1;
  return 0;
}

/**
 * O número depois de um toque de seta — lote 48.
 *
 * Um `step` por toque; `Shift` anda dez, `Alt` anda um décimo. É o gesto do
 * Spine e do Moho, e o arrasto de lado (`attachDrag`) já anda o mesmo `step`.
 *
 * Arredondado a **6 casas**: 0,35 + 0,1 dá 0,44999… em ponto flutuante, e um
 * campo que mostra 0,45 e grava 0,44999 é um campo que mente.
 */
export function stepValue(
  value: number, direction: number, step: number, modifiers: StepModifiers = {},
): number {
  const base = Number.isFinite(value) ? value : 0;
  const size = Number.isFinite(step) && step > 0 ? step : 1;
  const factor = modifiers.shift === true ? 10 : modifiers.alt === true ? 0.1 : 1;
  const next = base + Math.sign(direction) * size * factor;
  // `+ 0` troca o −0 por 0: o campo não tem por que escrever "-0".
  return Math.round(next * 1e6) / 1e6 + 0;
}

// ---------------------------------------------------------------------------
// O número se mexe e fala — rodada 43, lote 2 (doc `51`, §2.3)
// ---------------------------------------------------------------------------

/**
 * **O que se digita num campo de número**, sobre o valor de agora — rodada 43.
 *
 * A conta de sempre (`evalNumberExpression`: `90+15`, `100/2`, vírgula) e, como
 * no Spine (manual p.34), a conta **sobre o valor do campo** quando o texto
 * começa por operador: `*2` dobra, `/2` divide, `+10` soma, `+-10` tira. Um
 * `-10` sozinho é o número −10, não "tirar dez". `null` quando não é número.
 */
export function evalFieldInput(text: string, current: number): number | null {
  const t = text.trim();
  if (t === '') return null;
  const atual = Number.isFinite(current) ? current : 0;
  const op = t[0];
  if (op === '*' || op === '/' || op === '+') {
    const resto = evalNumberExpression(t.slice(1));
    if (resto === null) return null;
    const valor = op === '*' ? atual * resto : op === '/' ? (resto === 0 ? NaN : atual / resto) : atual + resto;
    return Number.isFinite(valor) ? Math.round(valor * 1e6) / 1e6 + 0 : null;
  }
  return evalNumberExpression(t);
}

/**
 * A recusa, em voz alta — rodada 43, lote 2 (regra 21). "90+15" e "abc"
 * voltavam ao número velho sem uma palavra: quem digitou não sabia se valeu.
 */
export function notNumberSays(text: string, label: string, shown: string, unit?: string): string {
  const u = unit === undefined ? '' : unit === '°' ? '°' : ` ${unit}`;
  return `"${text.trim()}" não é número: ${label} ficou ${shown}${u}`;
}

/**
 * O número durante o arrasto do RÓTULO — rodada 43, lote 2. Um `step` por
 * pixel, Shift dez, Alt um décimo: o *scrubby* do Photoshop, com as teclas das
 * setas do lote 48. Seis casas, pela mesma razão do `stepValue`.
 */
export function scrubValue(anchor: number, dx: number, step: number, modifiers: StepModifiers = {}): number {
  const base = Number.isFinite(anchor) ? anchor : 0;
  const size = Number.isFinite(step) && step > 0 ? step : 1;
  const factor = modifiers.shift === true ? 10 : modifiers.alt === true ? 0.1 : 1;
  return Math.round((base + dx * size * factor) * 1e6) / 1e6 + 0;
}

// ---------------------------------------------------------------------------
// SetProperty — the one command every field uses
// ---------------------------------------------------------------------------

/**
 * Writes one value at one JSON Pointer, and puts it back on undo.
 *
 * Consecutive writes to the same pointer merge, so dragging a numeric field
 * leaves a single entry in the undo stack.
 */
export class SetProperty implements Command {
  readonly label: string;
  readonly kind: ChangeKind;
  readonly pointer: string;
  private readonly value: unknown;
  private oldValue: unknown = undefined;
  private oldExisted = false;
  private created: string[] = [];
  private captured = false;

  // `structure` and not `transform`: this command writes into `doc.file` and
  // nowhere else, so the document has to reload the file for the drawing to
  // catch up. A `transform` only re-poses, and a re-pose reads the setup pose
  // out of the already loaded data — which would still hold the old number.
  constructor(pointer: string, value: unknown, label: string, kind: ChangeKind = 'structure') {
    this.pointer = pointer;
    this.value = value;
    this.label = label;
    this.kind = kind;
  }

  apply(doc: EditorDoc): void {
    if (!this.captured) {
      this.oldExisted = hasAtPointer(doc.file, this.pointer);
      this.oldValue = getAtPointer(doc.file, this.pointer);
      this.captured = true;
    }
    this.created = setAtPointer(doc.file, this.pointer, this.value);
  }

  revert(doc: EditorDoc): void {
    setAtPointer(doc.file, this.pointer, this.oldExisted ? this.oldValue : undefined);
    // Remove containers this command had to invent, deepest first.
    for (const path of [...this.created].reverse()) {
      setAtPointer(doc.file, path, undefined);
    }
    this.created = [];
  }

  mergeWith(previous: Command): boolean {
    if (!(previous instanceof SetProperty)) return false;
    if (previous.pointer !== this.pointer) return false;
    this.oldExisted = previous.oldExisted;
    this.oldValue = previous.oldValue;
    this.created = previous.created.length > 0 ? previous.created : this.created;
    this.captured = true;
    return true;
  }
}

/** Builds the command a field produces for a new value. */
/**
 * **A Cor ao nascer se grava aos pares** — QA de 04/11/2026 (D9). `startColor`
 * é `[cor, cor]` (§9.7 da `BONE_particles`, `minItems: 2`). Gravar uma ponta
 * num emissor que ainda não tinha o par criava `[[cor]]` (ou `[null, cor]`), e
 * o `.bone` salvo não passava no validador. A ponta que falta entra branca —
 * é o que o leitor usa na falta dela, e o que a ficha mostrava.
 */
export function startColorCommand(
  file: BoneFile, pairPointer: string, index: 0 | 1, value: unknown, label: string,
): SetProperty {
  const branco = [1, 1, 1, 1];
  const atual = getAtPointer(file as unknown as Record<string, unknown>, pairPointer);
  const lido = Array.isArray(atual) ? atual : [];
  const ponta = (i: number): unknown => (Array.isArray(lido[i]) ? [...(lido[i] as unknown[])] : [...branco]);
  const par = [ponta(0), ponta(1)];
  par[index] = value;
  return new SetProperty(pairPointer, par, label, 'structure');
}

export function setFieldCommand(field: FieldDef, value: unknown): SetProperty {
  return new SetProperty(field.pointer, value, `Mudar ${field.label}`, field.changeKind ?? 'structure');
}

/**
 * Escreve o valor de um campo obedecendo à regra dos dois modos.
 *
 * Com a base aberta escreve na base. Com uma animação aberta, um campo animável
 * grava uma CHAVE no tempo do cursor — sempre: editar sempre grava (degrau 4a,
 * 17/09/2026). Devolve `'recusado'` só quando não há onde escrever (a animação
 * aberta sumiu do arquivo), para quem chamou dizer; `null` quando escreveu.
 *
 * Mora aqui, e não dentro do painel Propriedades, porque a Árvore também
 * escreve `slot.attachment` desde o lote 3a — pela bolinha de cada anexo. Dois
 * caminhos até o mesmo campo é onde a regra dos dois modos se perde num deles.
 */
export function writeFieldValue(
  doc: EditorDoc, field: FieldDef, value: unknown,
): 'recusado' | null {
  // Um campo com comando próprio manda: ele arrasta as referências junto, e a
  // regra dos dois modos não vale para ele (nome não é valor animável).
  if (field.commandFor !== undefined) {
    const command = field.commandFor(doc, value);
    if (command !== null) corpoDe(doc).run(command);
    return null;
  }
  if (field.pointer === '') return null;
  // Degrau 4b: o campo é do corpo do instante; a chave, da animação deste arquivo.
  const corpo = corpoDe(doc);
  // Rodada 13 (K9, e o conserto 4 da ficha): numa animação, um número de
  // IMAGEM (x, y, giro, escala do anexo) não tem linha do tempo — gravá-lo no
  // anexo mudava a BASE. Vira chave do osso próprio, como no arrasto
  // (`image-key.ts`); sem osso próprio, ele nasce no pivô, no mesmo passo.
  const imagem = doc.animation === null || field.kind !== 'number' ? null : attachmentField(field.pointer);
  if (imagem !== null && typeof value === 'number') {
    const lido = getAtPointer(corpo.file as unknown as Record<string, unknown>, field.pointer);
    const shown = typeof lido === 'number' ? lido : typeof field.fallback === 'number' ? field.fallback : 0;
    const own = ownBoneOfSlot(corpo.file, imagem.slot);
    if (own !== null) return writeInnerAsKey(doc, own, imagem.prop, value, shown, field.label);
    const feito = writeImageValue(doc, field.pointer.slice(0, field.pointer.lastIndexOf('/')), imagem.prop, value, shown, field.label);
    if (feito !== undefined) return feito;
  }
  const target = doc.animation === null ? null : targetForPointer(corpo.file, field.pointer);
  if (target === null) {
    corpo.run(setFieldCommand(field, value));
    return null;
  }
  const outcome = setPropertyOrKey(doc, target, value as KeyValue, {
    label: `Chavear ${field.label.toLowerCase()}`,
    kind: field.changeKind ?? 'structure',
  });
  // P12 (29/09/2026): a chave de VARIÁVEL nascida aqui se MOSTRA — a linha do
  // tempo abre os Detalhes, escolhe a chave e rola até ela, e o rodapé diz o
  // que nasceu. Só a variável: os números do osso chaveiam a cada seta, e
  // pular a linha do tempo a cada seta seria barulho.
  // Segunda conferência da rodada 16 (05/10), defeito 2: a chave de EMITINDO
  // também se mostra. A linha do emissor é a última da folha, e ficava fora da
  // vista — quem tentava arrastar a chave pegava o vazio.
  if (outcome === 'chave' && (target.type === 'variable' || target.type === 'BONE_particle')) {
    const time = roundTime(doc.time);
    revealKey({ target, time });
    doc.notice(keyCreatedNotice(target, time, doc.file));
  }
  return outcome === 'recusado' ? 'recusado' : null;
}

/**
 * A frase de quando um campo não achou onde escrever. Substitui a
 * `BLOCKED_MESSAGE` do "Gravar sozinho desligado", que saiu no degrau 4a.
 */
export const REFUSED_MESSAGE =
  'Este valor não tem onde ser gravado: a animação aberta não está no arquivo.';

// ---------------------------------------------------------------------------
// Locating things in the file
// ---------------------------------------------------------------------------

export function boneIndex(file: BoneFile, name: string): number {
  return (file.bones ?? []).findIndex((bone) => bone.name === name);
}

export function slotIndex(file: BoneFile, name: string): number {
  return (file.slots ?? []).findIndex((slot) => slot.name === name);
}

export function constraintIndex(file: BoneFile, name: string): number {
  return (file.constraints ?? []).findIndex((c) => c.name === name);
}

export function skinIndex(file: BoneFile, name: string): number {
  return (file.skins ?? []).findIndex((skin) => skin.name === name);
}

/** A pele que vale quando nenhuma foi escolhida. É o nome da §4.4. */
export const DEFAULT_SKIN_NAME = 'default';

/**
 * Os desenhos que um slot pode mostrar, nas peles visíveis.
 *
 * O campo "Anexo" era um campo de TEXTO: para trocar a mão aberta pela mão
 * fechada era preciso saber o nome de cor e digitar sem errar uma letra. Um
 * nome errado não dá erro: dá um slot vazio, e o desenho some sem uma palavra.
 * Uma lista mostra o que existe, e o que não existe não dá para escolher.
 *
 * A união das peles visíveis, sem repetir nome: um slot que tem `mao` na pele
 * `default` e `mao` na pele `armadura` tem UM desenho chamado `mao` para quem
 * escolhe — qual das duas aparece é assunto da ordem das peles.
 *
 * `(nenhum)` vem primeiro e vale a string vazia: um slot pode não mostrar nada,
 * e isso também se escolhe.
 */
export function attachmentOptions(
  file: BoneFile, slot: string, visibleSkins: readonly string[] = [],
): FieldOption[] {
  const wanted = visibleSkins.length > 0 ? visibleSkins : [DEFAULT_SKIN_NAME];
  const names: string[] = [];
  const seen = new Set<string>();
  for (const skinName of wanted) {
    const skin = (file.skins ?? []).find((s) => s.name === skinName);
    for (const name of Object.keys(skin?.attachments?.[slot] ?? {})) {
      if (seen.has(name)) continue;
      seen.add(name);
      names.push(name);
    }
  }
  return [
    { value: '', label: '(nenhum)' },
    ...names.map((name) => ({ value: name, label: name })),
  ];
}

/**
 * Os desenhos que podem emprestar a silhueta a uma máscara — item 48.
 *
 * Só `region` e `mesh`: são os que têm imagem. Uma caixa de colisão ou outra
 * máscara não têm silhueta a emprestar — elas não desenham nada.
 *
 * O valor é `slot/anexo`, porque um nome de anexo só é único DENTRO do slot.
 */
export function silhouetteSources(
  file: BoneFile, visibleSkins: readonly string[] = [],
): FieldOption[] {
  const wanted = visibleSkins.length > 0 ? visibleSkins : [DEFAULT_SKIN_NAME];
  const out: FieldOption[] = [];
  const seen = new Set<string>();
  for (const skinName of wanted) {
    const skin = (file.skins ?? []).find((s) => s.name === skinName);
    for (const [slot, attachments] of Object.entries(skin?.attachments ?? {})) {
      for (const [name, def] of Object.entries(attachments ?? {})) {
        const type = (def as { type?: string } | null)?.type;
        if (type !== 'region' && type !== 'mesh') continue;
        const value = `${slot}/${name}`;
        if (seen.has(value)) continue;
        seen.add(value);
        out.push({ value, label: value });
      }
    }
  }
  return out;
}

/**
 * Os ossos de uma lista. A raiz escondida não entra — lote 63a: ela é o mundo,
 * e o usuário nunca a vê. Só fica quando já é o valor do campo (`keep`), para
 * a lista não mostrar um valor que não existe.
 */
/**
 * As malhas do MESMO slot, para o campo `mesh` do emissor (§9.4 da extensão).
 *
 * A extensão exige que a malha nomeada esteja no slot do emissor, e é por isso
 * que a lista não varre o arquivo inteiro: uma lista com todas as malhas do
 * boneco deixaria escolher uma que o leitor vai recusar, e a recusa só
 * apareceria depois, na barra de avisos.
 */
export function meshOptionsInSlot(file: BoneFile, slot: string): FieldOption[] {
  const nomes = new Set<string>();
  for (const skin of file.skins ?? []) {
    const porSlot = (skin.attachments ?? {})[slot] as Record<string, { type?: string }> | undefined;
    for (const [nome, def] of Object.entries(porSlot ?? {})) {
      if (def.type === 'mesh' || def.type === 'linkedmesh') nomes.add(nome);
    }
  }
  return [...nomes].sort().map((nome) => ({ value: nome, label: nome }));
}

function boneOptions(file: BoneFile, keep: readonly string[] = []): FieldOption[] {
  const root = rootHidden(file) ? file.bones?.[0]?.name : undefined;
  return (file.bones ?? [])
    .filter((bone) => bone.name !== root || keep.includes(bone.name))
    // O osso próprio de uma imagem não é escolha de ninguém (rodada 8d).
    .filter((bone) => !isOwnBone(file, bone.name) || keep.includes(bone.name))
    .map((bone) => ({ value: bone.name, label: bone.name }));
}

/**
 * Os ossos que um slot pode ter — lote 60a. A raiz escondida é o mundo:
 * desenho nela é desenho solto, e a lista diz **nenhum (livre)**. Escolher
 * um osso prende sem mover, pelo `Reparent` de sempre.
 */
function slotBoneOptions(file: BoneFile): FieldOption[] {
  const hidden = rootHidden(file);
  // O osso próprio de uma imagem (8d) fica na lista só para o slot que está
  // nele mostrar o valor certo, e se lê pelo osso que se vê.
  return (file.bones ?? []).map((bone, i) => ({
    value: bone.name,
    label: i === 0 ? (hidden ? 'nenhum (livre)' : 'raiz (o mundo)')
      : isOwnBone(file, bone.name) ? `${shownBone(file, bone.name)} (a imagem anda sozinha)` : bone.name,
  }));
}

function slotOptions(file: BoneFile): FieldOption[] {
  return (file.slots ?? []).map((slot) => ({ value: slot.name, label: slot.name }));
}

// ---------------------------------------------------------------------------
// Field builders
// ---------------------------------------------------------------------------

function num(
  key: string, label: string, pointer: string, fallback: number, step = 1,
): FieldDef {
  return { key, label, kind: 'number', pointer, fallback, step };
}

function flag(key: string, label: string, pointer: string, fallback: boolean, hint?: string): FieldDef {
  return hint === undefined
    ? { key, label, kind: 'checkbox', pointer, fallback }
    : { key, label, kind: 'checkbox', pointer, fallback, hint };
}

/**
 * Um número **com unidade e dica** — rodada 43, lote 1 (doc `51`, §4). O `num`
 * de sempre fica para quem ainda não foi medido pela régua do doc `26`.
 */
function med(
  key: string, label: string, pointer: string, fallback: number,
  unit: NonNullable<FieldDef['unit']>, hint: string, step = 1,
): FieldDef {
  return { key, label, kind: 'number', pointer, fallback, step, unit, hint };
}

// As frases dos números de posição e forma — iguais às da ficha rápida.
// Rodada 47, lote 5 (nota 4 do doc 85): a faixa "de X a Y" em toda dica (+∞ no que não tem fim).
const MED_X = 'Posição X, em px, de −∞ a +∞, no espaço do osso pai: positivo vai para a direita';
const MED_Y = 'Posição Y, em px, de −∞ a +∞, no espaço do osso pai: positivo vai para cima';
const MED_GIRO = 'Rotação, em graus (°), de −∞ a +∞ (360° é uma volta), contra o relógio: 0° aponta para a direita, 90° para cima';
const medEscala = (eixo: string): string =>
  `Escala ${eixo}, em × (vezes), de −∞ a +∞: 1 é o tamanho de montar, 2 o dobro; negativo espelha`;
const medInclina = (eixo: string): string =>
  `Inclinação ${eixo}, em graus (°), de −90 a 90: entorta o osso e o que ele leva; 0° é reto`;

function choice(
  key: string, label: string, pointer: string, fallback: string, options: FieldOption[],
): FieldDef {
  return { key, label, kind: 'select', pointer, fallback, options, changeKind: 'structure' };
}

const BLEND_OPTIONS: FieldOption[] = [
  { value: 'normal', label: 'normal' },
  { value: 'additive', label: 'aditiva' },
  { value: 'multiply', label: 'multiplicar' },
  { value: 'screen', label: 'clarear' },
];

const POSITION_MODE_OPTIONS: FieldOption[] = [
  { value: 'percent', label: 'porcentagem' },
  { value: 'fixed', label: 'fixa' },
];

const SPACING_MODE_OPTIONS: FieldOption[] = [
  { value: 'length', label: 'comprimento' },
  { value: 'fixed', label: 'fixo' },
  { value: 'percent', label: 'porcentagem' },
  { value: 'proportional', label: 'proporcional' },
];

const ROTATE_MODE_OPTIONS: FieldOption[] = [
  { value: 'tangent', label: 'tangente' },
  { value: 'chain', label: 'corrente' },
  { value: 'chainScale', label: 'corrente com escala' },
];

const DRIVER_MODE_OPTIONS: FieldOption[] = [
  { value: 'replace', label: 'substituir' },
  { value: 'add', label: 'somar' },
];

/** The icon menu of `viewport/bone-icons.ts`, as options for a `select`. */
const ICON_OPTIONS: FieldOption[] = BONE_ICONS.map((icon) => ({
  value: icon.id,
  label: icon.glyph === '' ? icon.label : `${icon.glyph}  ${icon.label}`,
}));

/**
 * **Só com a pele** e, quando marcada, **Peles que ativam** — lote 39.
 *
 * Antes deste lote a caixa existia só na regra, e a lista `skin.bones` só se
 * escrevia no arquivo à mão. Agora a caixa vale para osso e regra, e a lista
 * aparece logo embaixo dela: uma caixa por pele.
 *
 * A `default` fica fora das opções — ela está sempre ligada, e pôr um osso
 * nela é o mesmo que não marcar nada. Só aparece se o arquivo já a cita, para
 * a tela nunca esconder o que está escrito.
 */
function skinRequiredFields(
  file: BoneFile, kind: SkinMemberKind, name: string, pointer: string, on: boolean,
): FieldDef[] {
  const caixa: FieldDef = {
    ...flag('skinRequired', 'Só com a skin', pointer, false,
      'Ligado: só existe quando uma skin que o lista está vestida (o rabo do lobisomem). Desligado: existe sempre'),
    changeKind: 'structure',
    skinRequiredOf: { kind, name },
  };
  if (!on) return [caixa];
  const listed = skinsListing(file, kind, name);
  const options = (file.skins ?? [])
    .map((skin) => skin.name)
    .filter((skin) => skin !== DEFAULT_SKIN_NAME || listed.includes(skin))
    .map((skin) => ({ value: skin, label: skin }));
  return [caixa, {
    key: 'skinMembers', label: 'Skins que ativam', kind: 'checklist', pointer: '',
    fallback: listed, options, changeKind: 'structure', skinMember: { kind, name },
  }];
}

/**
 * O comando que as duas caixas de pele produzem, e a frase do rodapé.
 *
 * Puro, para o teste não precisar de navegador: o painel só chama `run` e
 * `notice` com o que sai daqui.
 */
export function skinFieldCommand(
  file: BoneFile, visibleSkins: readonly string[], field: FieldDef, value: unknown,
): { command: Command | null; notice: string | null } {
  if (field.skinRequiredOf !== undefined) {
    const { kind, name } = field.skinRequiredOf;
    const on = value === true;
    const into = on ? skinForRequired(file, visibleSkins) : null;
    return {
      command: new SetSkinRequired(kind, name, on, into),
      notice: on && into === null ? PICK_SKIN_NOTICE : null,
    };
  }
  if (field.skinMember !== undefined) {
    const { kind, name } = field.skinMember;
    const before = new Set(skinsListing(file, kind, name));
    const after = new Set(Array.isArray(value) ? (value as string[]) : []);
    const toggled = [...before].find((skin) => !after.has(skin))
      ?? [...after].find((skin) => !before.has(skin));
    return {
      command: toggled === undefined ? null : new ToggleSkinMember(kind, toggled, name),
      notice: null,
    };
  }
  return { command: null, notice: null };
}

/** Fields of one bone. */
export function boneFields(file: BoneFile, name: string): FieldGroup[] {
  const i = boneIndex(file, name);
  if (i < 0) return [];
  const at = (prop: string): string => pointerOf('bones', i, prop);
  const bone = (file.bones ?? [])[i]!;
  return [
    {
      title: 'Osso',
      fields: [
        {
          key: 'name', label: 'Nome', kind: 'text', pointer: at('name'),
          fallback: name, renameOf: 'bone', changeKind: 'structure',
          hint: 'O nome do osso. Trocar aqui conserta as regras e as chaves que o citam',
        },
        med('length', 'Comprimento', at('length'), 0, 'px',
          'Comprimento do osso, em px, de 0 a +∞: só o desenho do osso na cena; não mexe na arte'),
      ],
    },
    {
      // Requirement R2. Both fields already exist in the format (spec 4.2:
      // `color` and `icon` are "no editor", never pixels of the drawing), so
      // they are written straight into `file.bones[i]` and travel with the
      // file. Neither is animatable, so `targetForPointer` answers `null` for
      // them and the panel keeps writing the file in both modes — which is
      // right: an icon has no timeline it could live on.
      title: 'Marcação no editor',
      fields: [
        {
          key: 'boneColor', label: 'Cor do osso', kind: 'color',
          pointer: at('color'), fallback: [...DEFAULT_BONE_COLOR],
          changeKind: 'structure',
          // Rodada 47, lote 5b (notas do doc 86), nota 4.
          hint: 'Cor do osso: a cor com que o osso aparece na cena e na Árvore. Só no editor; não muda a arte',
        },
        {
          key: 'icon', label: 'Ícone', kind: 'select', pointer: at('icon'),
          fallback: '', options: ICON_OPTIONS, changeKind: 'structure',
          dropWhenEmpty: true,
          hint: 'Ícone: o desenho ao lado do nome do osso na Árvore, para achá-lo de relance. Nenhum: o de sempre',
        },
      ],
    },
    {
      title: 'Posição e forma',
      fields: [
        med('x', 'Posição X', at('x'), 0, 'px', MED_X),
        med('y', 'Posição Y', at('y'), 0, 'px', MED_Y),
        med('rotation', 'Rotação', at('rotation'), 0, '°', MED_GIRO),
        med('scaleX', 'Escala X', at('scaleX'), 1, '×', medEscala('X'), 0.01),
        med('scaleY', 'Escala Y', at('scaleY'), 1, '×', medEscala('Y'), 0.01),
        med('shearX', 'Inclinação X', at('shearX'), 0, '°', medInclina('X')),
        med('shearY', 'Inclinação Y', at('shearY'), 0, '°', medInclina('Y')),
      ],
    },
    {
      title: 'Herança do osso pai',
      fields: [
        flag('inheritRotation', 'Herda rotação', at('inheritRotation'), true,
          'Ligado: o osso gira junto com o pai. Desligado: fica no mesmo ângulo na tela'),
        flag('inheritScale', 'Herda escala', at('inheritScale'), true,
          'Ligado: o osso cresce e encolhe junto com o pai. Desligado: guarda o próprio tamanho'),
        flag('inheritReflection', 'Herda espelhamento', at('inheritReflection'), true,
          'Ligado: quando o pai espelha (escala negativa), este osso espelha junto'),
      ],
    },
    {
      title: 'Skins',
      fields: skinRequiredFields(file, 'bones', name, at('skinRequired'), bone.skinRequired === true),
    },
  ];
}

/** Fields of one slot. */
export function slotFields(
  file: BoneFile, name: string, visibleSkins: readonly string[] = [],
): FieldGroup[] {
  const i = slotIndex(file, name);
  if (i < 0) return [];
  const slot = (file.slots ?? [])[i] as SlotDef;
  const at = (prop: string): string => pointerOf('slots', i, prop);
  return [
    {
      // Rodada 43, lote 1: na tela é "desenho"; "slot" fica só na dica — a
      // decisão do Diretor sobre o doc `51` (a mesma peça tinha três nomes).
      title: 'Desenho',
      fields: [
        {
          key: 'name', label: 'Nome', kind: 'text', pointer: at('name'),
          fallback: name, renameOf: 'slot', changeKind: 'structure',
          hint: 'O nome do desenho (o lugar, ou slot). Trocar aqui conserta as chaves que o citam',
        },
        {
          ...choice('bone', 'Osso', at('bone'), slot.bone, slotBoneOptions(file)),
          hint: 'O osso que leva este desenho: trocar aqui muda o pai, como arrastar na Árvore',
        },
        // Uma LISTA, não um campo de texto: ver o item 9 em `attachmentOptions`.
        // `dropWhenEmpty` porque `(nenhum)` tem que TIRAR o campo do arquivo, e
        // não gravar `"attachment": ""`, que é um valor que o formato não tem.
        {
          key: 'attachment', label: 'Mostra', kind: 'select', pointer: at('attachment'),
          fallback: '', options: attachmentOptions(file, name, visibleSkins),
          dropWhenEmpty: true, changeKind: 'structure',
          hint: 'Qual imagem este lugar (slot) mostra agora. Nenhuma: o lugar fica vazio',
        },
        flag('visible', 'Visível', at('visible'), true,
          'Desligado: o desenho não aparece na cena nem no jogo, mas continua no arquivo'),
      ],
    },
    {
      title: 'Cor',
      fields: [
        {
          key: 'color', label: 'Cor', kind: 'color', pointer: at('color'), fallback: [1, 1, 1, 1],
          hint: 'A tinta do desenho: branco não muda nada. A opacidade vai em %',
        },
        {
          key: 'darkColor', label: 'Cor escura', kind: 'color3', pointer: at('darkColor'), fallback: [0, 0, 0],
          hint: 'A cor das sombras (tinta de duas cores): preto não muda nada',
        },
        {
          ...choice('blend', 'Mistura', at('blend'), 'normal', BLEND_OPTIONS),
          hint: 'Como o desenho se mistura com o que está atrás: normal; aditiva clareia (fogo, brilho); multiplicar escurece; clarear',
        },
      ],
    },
  ];
}

/** Fields of one attachment. Only `region` and `mesh` have editable geometry. */
// ---------------------------------------------------------------------------
// As faixas `[min, max]` do emissor — extensão `BONE_particles`, lote 3
// ---------------------------------------------------------------------------

/**
 * **Um componente de uma faixa `[min, max]`, escrito sem quebrar o par.**
 *
 * Meia dúzia de campos do emissor são faixas: `lifetime`, `speed`, `angle`,
 * `angularVelocity`, `scale`, `startFrame` (§9.2, §9.3, §9.6, §9.8) e mais os
 * pares `gravity` e `size`, que são `[x, y]` e `[w, h]`. Cada um é **um** campo
 * no arquivo e **dois** campos na ficha.
 *
 * **Por que não dá para apontar direto para `/…/lifetime/0`.** O
 * `setAtPointer` cria o recipiente que falta e, vendo um índice numérico
 * adiante, cria um **array** — mas com **um** elemento só. O schema da extensão
 * exige `minItems: 2` na faixa, e o runtime lê `faixa[1]` para o máximo: um
 * `"lifetime": [2]` daria máximo `undefined`, e a vida de toda partícula sairia
 * `NaN`. **O arquivo ficaria inválido de um jeito que a tela não mostra**, que é
 * a pior espécie — e foi medido no `setAtPointer` antes de se escrever uma
 * linha desta ficha.
 *
 * Então a faixa se escreve **inteira, sempre**: lê o par que está lá (ou o
 * padrão da extensão, quando o campo está ausente), troca um componente e grava
 * os dois. É um `SetProperty` comum no ponteiro da faixa, e por isso o desfazer
 * e a fusão de arrasto continuam valendo de graça.
 *
 * `fallback` é o padrão da extensão, e ele é obrigatório: sem ele, escrever o
 * máximo de um `speed` ausente gravaria `[0, x]` — uma velocidade mínima zero
 * que ninguém pediu.
 */
export function rangeFieldCommand(
  file: BoneFile, pointer: string, index: 0 | 1, value: unknown,
  fallback: readonly [number, number], label: string,
): SetProperty {
  const atual = getAtPointer(file, pointer);
  const par: [number, number] = [fallback[0], fallback[1]];
  if (Array.isArray(atual)) {
    // Um array torto (um elemento, ou um texto no lugar do número) NÃO é
    // motivo para gravar outro torto: o que não se entende volta ao padrão, e
    // o componente que a pessoa acabou de digitar manda.
    if (typeof atual[0] === 'number') par[0] = atual[0];
    if (typeof atual[1] === 'number') par[1] = atual[1];
  }
  par[index] = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(par[index])) par[index] = fallback[index];
  return new SetProperty(pointer, par, label, 'structure');
}

/**
 * Os dois campos de uma faixa, prontos para a ficha.
 *
 * `rotulos` são os nomes das duas pontas — quase sempre "mínimo" e "máximo", e
 * "X"/"Y" no `gravity`, "Largura"/"Altura" no `size`. O `key` leva o índice,
 * para dois campos da mesma faixa não terem a mesma chave.
 */
export function rangeFields(
  pointer: string, nome: string, fallback: readonly [number, number],
  rotulos: readonly [string, string] = ['mínimo', 'máximo'], step = 1,
): FieldDef[] {
  return [0, 1].map((i) => {
    const index = i as 0 | 1;
    const label = `${nome} (${rotulos[index]})`;
    return {
      key: `${pointer}#${index}`,
      label,
      kind: 'number' as FieldKind,
      // O ponteiro é o da FAIXA, e não o do componente: é ele que o
      // `fieldValue` lê para mostrar, e é ele que o comando grava inteiro.
      pointer,
      fallback: fallback[index],
      step,
      component: index,
      changeKind: 'structure' as ChangeKind,
      commandFor: (doc: EditorDoc, value: unknown): Command =>
        rangeFieldCommand(corpoDe(doc).file, pointer, index, value, fallback, `Mudar ${label}`),
    };
  });
}

/**
 * **A linha do emissor** (`edge`, §9.4): `[x0, y0, x1, y1]`, quatro números num
 * campo só — rodada 16, lote 2. Como a faixa, ela se grava **inteira, sempre**
 * (`setAtPointer` criaria um array de um elemento), e o que falta vem do padrão
 * da extensão, `[0, 0, 0, 0]`.
 */
export function edgeFieldCommand(
  file: BoneFile, pointer: string, index: number, value: unknown, label: string,
): SetProperty {
  const atual = getAtPointer(file, pointer);
  const linha = [0, 0, 0, 0];
  if (Array.isArray(atual)) {
    for (let i = 0; i < 4; i++) if (typeof atual[i] === 'number') linha[i] = atual[i] as number;
  }
  const n = typeof value === 'number' ? value : Number(value);
  linha[index] = Number.isFinite(n) ? n : 0;
  return new SetProperty(pointer, linha, label, 'structure');
}

/** Os quatro campos da linha: início X e Y, fim X e Y. */
export function edgeFields(pointer: string): FieldDef[] {
  const nomes = ['Linha: início X', 'Linha: início Y', 'Linha: fim X', 'Linha: fim Y'];
  return nomes.map((label, index) => ({
    key: `${pointer}#${index}`,
    label,
    kind: 'number' as FieldKind,
    pointer,
    fallback: 0,
    step: 1,
    component: index,
    changeKind: 'structure' as ChangeKind,
    commandFor: (doc: EditorDoc, value: unknown): Command =>
      edgeFieldCommand(corpoDe(doc).file, pointer, index, value, `Mudar ${label}`),
  }));
}

/**
 * **A folha de quadros do emissor** — rodada 16, lote 9. Três números do
 * objeto `sequence` (§7.10 da spec): quantos quadros, o número do primeiro e
 * quantos dígitos. O objeto se grava **inteiro**, e `0` quadros o tira do
 * arquivo — um `sequence` sem quadro seria um valor que o validador recusa.
 * Os nomes das imagens são o da partícula mais o número: `fx/chama_` com 8
 * quadros, começando em 1 com 2 dígitos, dá `fx/chama_01` a `fx/chama_08`.
 */
export function sequenceCommand(
  file: BoneFile, pointer: string, campo: 'count' | 'start' | 'digits', value: unknown,
): SetProperty {
  const atual = getAtPointer(file, pointer);
  const base: Record<string, unknown> = atual !== null && typeof atual === 'object' && !Array.isArray(atual)
    ? { ...(atual as Record<string, unknown>) } : {};
  const n = Math.round(typeof value === 'number' ? value : Number(value));
  if (campo === 'count' && !(n > 0)) return new SetProperty(pointer, undefined, 'Tirar a folha de quadros', 'structure');
  const limpo = campo === 'count' ? Math.max(1, n) : campo === 'start' ? Math.max(0, Number.isFinite(n) ? n : 1) : Math.min(8, Math.max(0, Number.isFinite(n) ? n : 0));
  base[campo] = limpo;
  if (typeof base.count !== 'number') base.count = 1;
  const nomes = { count: 'quadros', start: 'primeiro número', digits: 'dígitos' } as const;
  return new SetProperty(pointer, base, `Folha de quadros: ${nomes[campo]}`, 'structure');
}

function sequenceFields(file: BoneFile, pointer: string): FieldDef[] {
  const atual = getAtPointer(file, pointer) as Record<string, unknown> | undefined;
  const ler = (campo: string, padrao: number): number => (typeof atual?.[campo] === 'number' ? atual[campo] as number : padrao);
  const curtos = { count: 'qtd.', start: '1º', digits: 'díg.' } as const;
  const campo = (key: string, label: string, nome: 'count' | 'start' | 'digits', valor: number): FieldDef => ({
    key, label, kind: 'number', pointer: '', fallback: valor, step: 1, min: 0, changeKind: 'structure',
    // Segunda conferência, defeito 5: o nome curto ao lado de cada número.
    short: curtos[nome],
    commandFor: (doc: EditorDoc, value: unknown): Command => sequenceCommand(corpoDe(doc).file, pointer, nome, value),
  });
  return [
    campo('sequenceCount', 'Folha: quadros', 'count', atual === undefined ? 0 : ler('count', 1)),
    campo('sequenceStart', 'Folha: primeiro número', 'start', ler('start', 1)),
    campo('sequenceDigits', 'Folha: dígitos', 'digits', ler('digits', 0)),
  ];
}

/**
 * **Os caminhos do boneco**, para a forma "caminho" do emissor — rodada 16,
 * lote 8. Todo anexo `path` de qualquer slot e de qualquer pele, uma vez cada,
 * com o valor que a extensão grava (`"<slot>/<anexo>"`, §9.4.2) e o nome que a
 * pessoa conhece: o do anexo, e o slot entre parênteses só quando é outro.
 */
export function pathOptions(file: BoneFile): FieldOption[] {
  const vistos = new Set<string>();
  const out: FieldOption[] = [];
  for (const skin of file.skins ?? []) {
    const porSlot = (skin.attachments ?? {}) as Record<string, Record<string, { type?: string }>>;
    for (const [slot, porNome] of Object.entries(porSlot)) {
      // O leitor separa no PRIMEIRO "/": um slot com "/" no nome não se acharia.
      if (slot.includes('/')) continue;
      for (const [nome, def] of Object.entries(porNome ?? {})) {
        if (def?.type !== 'path') continue;
        const value = `${slot}/${nome}`;
        if (vistos.has(value)) continue;
        vistos.add(value);
        out.push({ value, label: nome === slot ? nome : `${nome} (slot ${slot})` });
      }
    }
  }
  return out;
}

export function attachmentFields(file: BoneFile, slot: string, name: string): FieldGroup[] {
  const found = findAttachment(file, slot, name);
  if (!found) return [];
  const at = (prop: string): string =>
    pointerOf('skins', found.skin, 'attachments', slot, name, prop);

  const nameField: FieldDef = {
    key: 'name', label: 'Nome', kind: 'text', pointer: '', fallback: name,
    renameOf: 'attachment', renameScope: { slot, skin: found.skinName },
    changeKind: 'structure',
    hint: 'O nome desta imagem do desenho (o anexo). As chaves que a trocam mudam junto',
  };
  // Rodada 43, lote 1: "Desenho" na tela, e não "Anexo" (doc `51`).
  const identity: FieldGroup = {
    title: 'Desenho',
    fields: [
      nameField,
      // Rodada 47, lote 5 (R13 do doc 68): "Imagem" aparecia duas vezes na ficha
      // de um desenho — a da Ficha rápida (QUAL imagem o desenho mostra) e
      // esta (o ARQUIVO dela). Duas coisas, um nome: esta passa a ser Arquivo.
      {
        key: 'path', label: 'Arquivo', kind: 'text', pointer: at('path'), fallback: name, changeKind: 'structure',
        hint: 'Arquivo: o nome do arquivo da imagem na pasta do projeto, sem o .png. Vazio: o mesmo nome da imagem',
      },
    ],
  };

  // Um `point` e um `boundingbox` NÃO têm imagem: eles não desenham nada. Um
  // campo "Imagem" neles seria um campo que não muda coisa alguma na tela, e um
  // campo assim é pior do que campo nenhum.
  const bareIdentity: FieldGroup = { title: 'Desenho', fields: [nameField] };

  // --- Emissor de partículas (extensão `BONE_particles`) ------------------
  //
  // Os campos da **1ª fase**, e só eles: a tabela está em
  // `documentos/programa-novo/07`. Ficam de fora a taxa animada por integral
  // (§4.2), o sub-emissor, o rastro e o ruído — tudo 2ª fase.
  //
  // O campo "Imagem" do anexo comum NÃO aparece aqui, e o `path` aparece com
  // outro nome: num emissor ele é a imagem de **cada partícula** (§9.8), não o
  // desenho do anexo, e "Imagem" sozinho faria pensar que é o segundo.
  if (found.def.type === PARTICLE_TYPE) {
    const faixa = (
      campo: string, nome: string, padrao: readonly [number, number],
      rotulos?: readonly [string, string], step?: number,
    ): FieldDef[] => rangeFields(at(campo), nome, padrao, rotulos, step);
    // Rodada 15 (linha 4): o OSSO do emissor, que se troca aqui — era "No slot",
    // só leitura. O ponteiro é o do slot (`/slots/i/bone`), e o painel o passa
    // pelo `runReparent`, a mesma porta da tecla P e da Árvore: o emissor fica
    // onde está na tela.
    const si = slotIndex(file, slot);
    const slotDef = si < 0 ? undefined : (file.slots ?? [])[si];
    const ossoDoEmissor: FieldDef[] = slotDef === undefined ? [] : [
      choice('bone', 'Osso', pointerOf('slots', si, 'bone'), slotDef.bone, slotBoneOptions(file)),
    ];
    return [
      // Rodada 4, consertos (05/10/2026): o primeiro grupo de um emissor se
      // chama "Emissor". O título do painel já dizia "Emissor: …" e a seção
      // dizia "ANEXO" (conferência da rodada 24, linha A8).
      { title: 'Emissor', fields: [nameField] },
      {
        // Rodada 15 (linha 3): onde o emissor está, dentro do osso (§9.10 da
        // extensão). Os mesmos nomes da imagem; sem escala, que ele não tem.
        // Com o osso próprio (8d), `throughOwnBone` aponta os três para ele.
        title: 'Onde está',
        fields: [
          ...ossoDoEmissor,
          ...[
            num('x', 'X', at('x'), 0),
            num('y', 'Y', at('y'), 0),
            num('rotation', 'Giro (°)', at('rotation'), 0),
          ].map((f) => comRegua(f, 'ponto')),
        ],
      },
      {
        title: 'O emissor',
        fields: [
          // A semente é SEMPRE fixa e `0` é semente válida (§9.9). Não existe
          // semente automática: é exatamente o que a régua da extensão proíbe
          // (§3.4), porque é ela que faz a agulha para trás devolver o mesmo
          // quadro. Duplicar um emissor dá semente nova — isso é o comando de
          // criar quem faz, não este campo.
          {
            key: 'seed', label: 'Semente', kind: 'number', pointer: at('seed'),
            fallback: 0, step: 1, min: 0, max: 4294967295, changeKind: 'structure',
          },
          {
            key: 'space', label: 'Espaço', kind: 'select', pointer: at('space'),
            fallback: 'local', changeKind: 'structure',
            // Rodada 15 (pedido do Diretor): dizer o que SEGUE o emissor e o
            // que FICA no mundo — a gravidade inclusive (§9.10). Conserto 6 da
            // conferência (05/10): a frase cortava na lista; vai na dica.
            hint: 'Espaço — do emissor: as partículas e a gravidade seguem o emissor · '
              + 'do mundo: soltas ao nascer, e a gravidade fica no mundo',
            options: [
              { value: 'local', label: 'do emissor' },
              { value: 'world', label: 'do mundo' },
            ],
          },
        ],
      },
      {
        title: 'Quando nasce',
        fields: [
          // §9.1: na 1ª fase `rate` é fixo e quem anima é `emitting`. A dica
          // está no rótulo, para ninguém procurar a curva da taxa.
          flag('emitting', 'Emitindo (se anima)', at('emitting'), true),
          num('rate', 'Taxa por segundo', at('rate'), 10, 1),
          num('startDelay', 'Atraso', at('startDelay'), 0, 0.01),
          // §4.4: a janela da explosividade é o `duration`, e NÃO a duração da
          // animação — o rótulo diz, porque os dois se confundem.
          num('explosiveness', 'Explosividade', at('explosiveness'), 0, 0.01),
          num('duration', 'Janela da explosividade', at('duration'), 1, 0.01),
          num('randomness', 'Tremor', at('randomness'), 0, 0.01),
          // Rodada 16, lote 5: as rajadas (§4.3), que só os modelos escreviam.
          {
            key: 'bursts', label: 'Rajadas', kind: 'bursts', pointer: at('bursts'),
            fallback: [], changeKind: 'structure',
          },
        ],
      },
      {
        title: 'Vida e teto',
        fields: [
          // §9.2: `lifetime` NÃO é animável de propósito — é o `max` que define
          // a janela de quem olhar (§5). Com chaves, a janela viraria uma curva.
          ...faixa('lifetime', 'Vida', [1, 1], ['mínimo', 'máximo'], 0.05),
          // §7.1 e §10: o teto do formato é 10 000, e desenha as mais NOVAS.
          {
            key: 'maxParticles', label: 'Máximo de vivas', kind: 'number',
            pointer: at('maxParticles'), fallback: 1000, step: 10, min: 1, max: 10000,
            changeKind: 'structure',
          },
        ],
      },
      {
        title: 'Para onde vai',
        fields: [
          ...faixa('speed', 'Velocidade', [100, 100], ['mínimo', 'máximo'], 5),
          num('direction', 'Direção', at('direction'), 90),
          // §9.3: `spread` é MEIA-abertura, e o rótulo diz, porque quem espera
          // a abertura inteira põe o dobro sem saber.
          num('spread', 'Abertura para cada lado', at('spread'), 0),
          num('spherizeDirection', 'Para fora', at('spherizeDirection'), 0, 0.01),
          flag('alignToVelocity', 'Virar para onde vai', at('alignToVelocity'), false),
        ],
      },
      {
        title: 'De onde sai',
        fields: [
          {
            key: 'shape', label: 'Forma', kind: 'select', pointer: at('shape'),
            fallback: 'point', changeKind: 'structure',
            options: [
              { value: 'point', label: 'ponto — tudo do mesmo lugar' },
              { value: 'circle', label: 'círculo' },
              { value: 'rectangle', label: 'retângulo' },
              { value: 'edge', label: 'linha' },
              { value: 'bone', label: 'osso — ao longo do osso do slot' },
              { value: 'mesh', label: 'malha — de uma malha do mesmo slot' },
              // Rodada 16, lote 8: a forma nova da extensão 1.1 (§9.4.2).
              { value: 'path', label: 'caminho — ao longo de uma curva' },
            ],
          },
          num('radius', 'Raio', at('radius'), 0),
          num('radiusThickness', 'Espessura', at('radiusThickness'), 1, 0.01),
          num('arc', 'Trecho', at('arc'), 360),
          ...faixa('size', 'Retângulo', [0, 0], ['largura', 'altura']),
          // Rodada 16, lote 2: a linha tinha forma e não tinha campo — tudo
          // nascia em (0,0), sem a tela dizer por quê.
          ...edgeFields(at('edge')),
          // Rodada 16, lote 8: QUAL caminho (§9.4.2: `"<slot>/<anexo>"`), de
          // qualquer slot — o caminho que o boneco já tem mora no slot dele.
          // A lista, e não um texto: um nome errado não daria erro.
          {
            key: 'curve', label: 'Caminho', kind: 'select', pointer: at('curve'),
            fallback: '', dropWhenEmpty: true, changeKind: 'structure',
            options: [{ value: '', label: '(nenhum)' }, ...pathOptions(file)],
          },
          // A malha se escolhe por NOME, entre as do MESMO slot (§9.4). Um
          // campo de texto daria um nome errado que não dá erro; a lista, não.
          {
            key: 'mesh', label: 'Malha (deste slot)', kind: 'select', pointer: at('mesh'),
            fallback: '', dropWhenEmpty: true, changeKind: 'structure',
            options: [
              { value: '', label: '(nenhuma)' },
              ...meshOptionsInSlot(file, slot),
            ],
          },
          {
            key: 'meshMode', label: 'Onde na malha', kind: 'select', pointer: at('meshMode'),
            fallback: 'vertex', changeKind: 'structure',
            options: [
              { value: 'vertex', label: 'nos vértices' },
              { value: 'edge', label: 'nas arestas' },
              { value: 'triangle', label: 'dentro dos triângulos' },
            ],
          },
        ],
      },
      {
        title: 'Forças',
        fields: [
          // §9.5, nota honesta da extensão: a gravidade é lida NO NASCIMENTO.
          // Uma chave que a muda não entorta as partículas já no ar, e é o
          // preço da conta fechada.
          ...faixa('gravity', 'Gravidade', [0, 0], ['X', 'Y'], 5),
          num('drag', 'Freio', at('drag'), 0, 0.05),
        ],
      },
      {
        title: 'Giro e tamanho',
        fields: [
          ...faixa('angle', 'Giro inicial', [0, 0], ['mínimo', 'máximo']),
          ...faixa('angularVelocity', 'Giro', [0, 0], ['mínimo', 'máximo'], 5),
          ...faixa('scale', 'Tamanho', [1, 1], ['mínimo', 'máximo'], 0.05),
          // Rodada 16, lote 4: o tamanho ao longo da vida (§9.6), uma curva.
          {
            key: 'scaleOverLifetime', label: 'Tamanho na vida', kind: 'lifeCurve',
            pointer: at('scaleOverLifetime'), fallback: [], changeKind: 'structure',
          },
        ],
      },
      {
        title: 'Cor',
        fields: [
          // §9.7: `startColor` é um par de cores, e UMA só sorte escolhe entre
          // as duas — os quatro componentes andam juntos. Dois campos de cor,
          // um por ponta; o gradiente ao longo da vida é 2ª fase de tela.
          {
            key: 'startColor0', label: 'Cor ao nascer (de)', kind: 'color',
            // O índice vai COLADO, e não como token do `pointerOf`: ele escapa
            // a barra de um token (`startColor/0` sairia `startColor~10`), e o
            // ponteiro deixaria de achar o campo. Medido pelo teste.
            pointer: `${at('startColor')}/0`, fallback: [1, 1, 1, 1], changeKind: 'structure',
            // QA 04/11/2026 (D9): a escrita é do PAR — `startColor/0` sozinho
            // criava `[[cor]]`, e o schema pede duas cores.
            commandFor: (doc: EditorDoc, value: unknown): Command =>
              startColorCommand(corpoDe(doc).file, at('startColor'), 0, value, 'Mudar cor ao nascer (de)'),
          },
          {
            key: 'startColor1', label: 'Cor ao nascer (até)', kind: 'color',
            pointer: `${at('startColor')}/1`, fallback: [1, 1, 1, 1], changeKind: 'structure',
            commandFor: (doc: EditorDoc, value: unknown): Command =>
              startColorCommand(corpoDe(doc).file, at('startColor'), 1, value, 'Mudar cor ao nascer (até)'),
          },
          // Rodada 16, lote 4: o gradiente, a transparência ao longo da vida
          // (§9.7) e a cor do anexo, que multiplica tudo.
          {
            key: 'colorOverLifetime', label: 'Cor na vida', kind: 'lifeGradient',
            pointer: at('colorOverLifetime'), fallback: [], changeKind: 'structure',
          },
          {
            key: 'alphaOverLifetime', label: 'Some na vida', kind: 'lifeCurve',
            pointer: at('alphaOverLifetime'), fallback: [], changeKind: 'structure',
          },
          {
            key: 'color', label: 'Cor do emissor', kind: 'color', pointer: at('color'),
            fallback: [1, 1, 1, 1], changeKind: 'structure',
          },
        ],
      },
      {
        title: 'A imagem de cada partícula',
        fields: [
          // "Imagem da partícula", e não "Imagem": num emissor o `path` é a
          // figura de CADA partícula, não o desenho do anexo (§9.8).
          {
            key: 'path', label: 'Imagem da partícula', kind: 'text', pointer: at('path'),
            fallback: name, changeKind: 'structure',
          },
          {
            key: 'frameMode', label: 'A folha corre', kind: 'select',
            pointer: at('frameMode'), fallback: 'lifetime', changeKind: 'structure',
            options: [
              { value: 'lifetime', label: 'ao longo da vida da partícula' },
              { value: 'fps', label: 'a tantos quadros por segundo' },
            ],
          },
          // Rodada 16, lote 9: a FOLHA de quadros (§9.8: o `Sequence` da §7.10
          // da spec). Sem ela, "a folha corre", voltas e quadro de partida não
          // mudavam nada — e apareciam assim mesmo.
          ...sequenceFields(file, at('sequence')),
          num('cycles', 'Voltas na vida', at('cycles'), 1, 0.1),
          num('fps', 'Quadros por segundo', at('fps'), 12, 1),
          ...faixa('startFrame', 'Quadro de partida', [0, 0], ['mínimo', 'máximo']),
        ],
      },
      {
        title: 'A volta e a ordem',
        fields: [
          flag('looping', 'Repetir com a animação', at('looping'), true),
          // §6: o `prewarm` só vale com `looping` desligado. O rótulo diz.
          num('prewarm', 'Pré-aquecer (só sem repetir)', at('prewarm'), 0, 0.05),
          {
            key: 'sortMode', label: 'Quem fica na frente', kind: 'select',
            pointer: at('sortMode'), fallback: 'youngestInFront', changeKind: 'structure',
            options: [
              { value: 'youngestInFront', label: 'as mais novas na frente' },
              { value: 'oldestInFront', label: 'as mais velhas na frente' },
            ],
          },
        ],
      },
    ];
  }

  // --- Ponto (§7.9) — item 12 ---------------------------------------------
  if (found.def.type === 'point') {
    return [
      bareIdentity,
      {
        title: 'Onde o ponto está',
        fields: [
          ...[
            num('x', 'Posição X', at('x'), 0),
            num('y', 'Posição Y', at('y'), 0),
            num('rotation', 'Rotação', at('rotation'), 0),
          ].map((f) => comRegua(f, 'ponto')),
        ],
      },
      {
        title: 'Cor no editor',
        fields: [
          { key: 'color', label: 'Cor', kind: 'color', pointer: at('color'), fallback: [1, 1, 1, 1] },
        ],
      },
    ];
  }

  // --- Máscara (§7.7) — item 47 -------------------------------------------
  if (found.def.type === 'clipping') {
    const mask = found.def as {
      vertices?: readonly number[]; end?: string; slots?: readonly string[];
    };
    const cantos = Math.floor((mask.vertices?.length ?? 0) / 2);
    return [
      bareIdentity,
      {
        title: 'O que ela recorta',
        fields: [
          // "Recorta até": do slot dela em diante, até este, inclusive.
          {
            key: 'end', label: 'Recorta até', kind: 'select', pointer: at('end'),
            fallback: '', options: [{ value: '', label: '(nada)' }, ...slotOptions(file)],
            dropWhenEmpty: true, changeKind: 'structure',
          },
          // "Só estes" MANDA no "Recorta até" quando tem algum marcado — é o
          // que §7.7 diz, e é o modelo do Live2D. A dica avisa.
          {
            key: 'slots', label: 'Só estes', kind: 'checklist', pointer: at('slots'),
            fallback: [], options: slotOptions(file),
            dropWhenEmpty: true, changeKind: 'structure',
          },
          flag('invert', 'Inverter: recorta o que está dentro', at('invert'), false),
        ],
      },
      {
        title: 'Contorno',
        fields: [
          {
            key: 'vertices',
            label: 'Cantos',
            kind: 'text',
            pointer: '',
            // Degrau 7, tarefa 7.4 (defeito A3): a frase era verdadeira só na
            // intenção — a Malha não pegava caixa nem máscara. Agora pega, e
            // a dica diz a tecla, porque a frase manda para uma ferramenta.
            fallback: `${cantos} cantos — arraste com a ferramenta Malha (M)`,
          },
        ],
      },
      {
        title: 'Cor no editor',
        fields: [
          { key: 'color', label: 'Cor', kind: 'color', pointer: at('color'), fallback: [1, 0.2, 0.6, 1] },
        ],
      },
    ];
  }

  // --- Caixa de colisão (§7.6) — item 13 ----------------------------------
  if (found.def.type === 'boundingbox') {
    const box = found.def as { vertices?: readonly number[]; shape?: string };
    const cantos = Math.floor((box.vertices?.length ?? 0) / 2);
    return [
      bareIdentity,
      {
        title: 'Contorno',
        fields: [
          {
            // Só leitura: os vértices se editam ARRASTANDO, com a ferramenta
            // Malha. Uma lista de dezesseis números num campo de texto é um
            // convite a quebrar o contorno sem perceber.
            key: 'vertices',
            label: 'Cantos',
            kind: 'text',
            pointer: '',
            // Degrau 7, tarefa 7.4 (defeito A3): a frase era verdadeira só na
            // intenção — a Malha não pegava caixa nem máscara. Agora pega, e
            // a dica diz a tecla, porque a frase manda para uma ferramenta.
            fallback: `${cantos} cantos — arraste com a ferramenta Malha (M)`,
          },
        ],
      },
      {
        title: 'Cor no editor',
        fields: [
          { key: 'color', label: 'Cor', kind: 'color', pointer: at('color'), fallback: [0.38, 0.94, 0, 1] },
        ],
      },
    ];
  }

  // --- A entidade (§7.11) — rodada 8a, C16 e achado 3 ----------------------
  // Ela segue a imagem: o mesmo `x, y, rotation, scaleX, scaleY` no espaço do
  // osso. Antes caía no fim desta função, só com Nome e um "Imagem" que dizia
  // o nome do desenho antigo — e X e Y não apareciam.
  if (found.def.type === 'skeleton') {
    const uri = (found.def as { uri?: string }).uri ?? '';
    return [
      bareIdentity,
      {
        title: 'Entidade',
        fields: [
          // Só leitura: troca-se pela grade do botão direito, que mostra as
          // entidades do projeto. Um campo de texto aqui trocaria o arquivo
          // por um nome digitado, sem mostrar o que existe.
          {
            key: 'uri', label: 'Mostra', kind: 'text', pointer: '',
            fallback: uri === '' ? '(sem arquivo)' : `${entityNameFor(uri)} (${uri})`,
          },
        ],
      },
      {
        title: 'Posição e forma',
        fields: [
          med('x', 'Posição X', at('x'), 0, 'px', 'Posição X da entidade no osso, em px, de −∞ a +∞: positivo vai para a direita'),
          med('y', 'Posição Y', at('y'), 0, 'px', 'Posição Y da entidade no osso, em px, de −∞ a +∞: positivo vai para cima'),
          med('rotation', 'Rotação', at('rotation'), 0, '°', MED_GIRO),
          med('scaleX', 'Escala X', at('scaleX'), 1, '×', medEscala('X'), 0.01),
          med('scaleY', 'Escala Y', at('scaleY'), 1, '×', medEscala('Y'), 0.01),
        ],
      },
    ];
  }

  if (found.def.type === 'region') {
    const def = found.def as RegionAttachmentDef;
    return [
      identity,
      {
        title: 'Posição e forma',
        fields: [
          med('x', 'Posição X', at('x'), 0, 'px', 'Posição X do desenho no osso, em px, de −∞ a +∞: positivo vai para a direita'),
          med('y', 'Posição Y', at('y'), 0, 'px', 'Posição Y do desenho no osso, em px, de −∞ a +∞: positivo vai para cima'),
          med('rotation', 'Rotação', at('rotation'), 0, '°', MED_GIRO),
          med('scaleX', 'Escala X', at('scaleX'), 1, '×', medEscala('X'), 0.01),
          med('scaleY', 'Escala Y', at('scaleY'), 1, '×', medEscala('Y'), 0.01),
          med('width', 'Largura', at('width'), def.width ?? 0, 'px',
            'Largura do desenho, em px, de 0 a +∞, antes da escala: nasce do tamanho da imagem'),
          med('height', 'Altura', at('height'), def.height ?? 0, 'px',
            'Altura do desenho, em px, de 0 a +∞, antes da escala: nasce do tamanho da imagem'),
        ],
      },
      {
        title: 'Cor',
        fields: [
          { key: 'color', label: 'Cor', kind: 'color', pointer: at('color'), fallback: [1, 1, 1, 1] },
        ],
      },
    ];
  }

  if (found.def.type === 'mesh') {
    const def = found.def as MeshAttachmentDef;
    return [
      identity,
      {
        title: 'Tamanho da imagem',
        fields: [
          med('width', 'Largura', at('width'), def.width ?? 0, 'px',
            'Largura da imagem da malha, em px, de 0 a +∞. A forma da malha não muda por aqui: mexa nos vértices'),
          med('height', 'Altura', at('height'), def.height ?? 0, 'px',
            'Altura da imagem da malha, em px, de 0 a +∞. A forma da malha não muda por aqui: mexa nos vértices'),
        ],
      },
      {
        title: 'Cor',
        fields: [
          { key: 'color', label: 'Cor', kind: 'color', pointer: at('color'), fallback: [1, 1, 1, 1] },
        ],
      },
    ];
  }

  return [identity];
}

/** Fields of one constraint, by type. */
export function constraintFields(file: BoneFile, name: string): FieldGroup[] {
  const i = constraintIndex(file, name);
  if (i < 0) return [];
  const def = (file.constraints ?? [])[i] as ConstraintDef;
  const at = (prop: string): string => pointerOf('constraints', i, prop);

  const common: FieldGroup = {
    title: 'Regra',
    fields: [
      {
        key: 'name', label: 'Nome', kind: 'text', pointer: at('name'),
        fallback: name, renameOf: 'constraint', changeKind: 'structure',
      },
      comRegua(num('mix', 'Força', at('mix'), 1, 0.01), 'regra'),
      ...skinRequiredFields(file, 'constraints', name, at('skinRequired'), def.skinRequired === true),
    ],
  };

  /**
   * **Ossos da cadeia** — o campo que faltava, lote 28, anotação 13.
   *
   * Sem ele, uma regra de IK criada com um osso nunca virava uma de dois: a
   * única saída era apagar e refazer. Ele vale para os três tipos que têm
   * cadeia — IK, transformação e caminho.
   *
   * A ordem gravada é a **ordem do arquivo**, que é a ordem em que o
   * `checklist` escreve. E é o certo: no formato o pai vem sempre antes do
   * filho na lista de ossos (§4.1), então a ordem do arquivo **é** pai → filho,
   * que é a ordem que a IK precisa. Marcar de trás para frente deixa de ser
   * um jeito de quebrar a regra sem perceber.
   */
  const chain: FieldDef = {
    key: 'bones', label: 'Ossos da cadeia', kind: 'checklist', pointer: at('bones'),
    fallback: [], options: boneOptions(file, 'bones' in def && Array.isArray(def.bones) ? def.bones : []),
    changeKind: 'structure',
  };

  if (def.type === 'ik') {
    return [common, {
      title: 'Cinemática inversa',
      fields: [
        chain,
        choice('target', 'Alvo', at('target'), def.target, boneOptions(file, [def.target])),
        flag('bendPositive', 'Dobra para o lado positivo', at('bendPositive'), true),
        flag('compress', 'Encolhe', at('compress'), false),
        flag('stretch', 'Estica', at('stretch'), false),
        flag('uniform', 'Escala uniforme', at('uniform'), false),
        comRegua(num('softness', 'Suavidade', at('softness'), 0), 'ik'),
      ],
    }];
  }

  if (def.type === 'transform') {
    return [common, {
      title: 'Transformação',
      fields: [
        chain,
        choice('target', 'Alvo', at('target'), def.target, boneOptions(file, [def.target])),
        flag('local', 'Espaço local', at('local'), false),
        flag('relative', 'Relativo', at('relative'), false),
        comRegua(num('offsetRotation', 'Deslocar rotação', at('offsetRotation'), 0), 'transformacao'),
        comRegua(num('offsetX', 'Deslocar X', at('offsetX'), 0), 'transformacao'),
        comRegua(num('offsetY', 'Deslocar Y', at('offsetY'), 0), 'transformacao'),
        comRegua(num('offsetScaleX', 'Deslocar escala X', at('offsetScaleX'), 0, 0.01), 'transformacao'),
        comRegua(num('offsetScaleY', 'Deslocar escala Y', at('offsetScaleY'), 0, 0.01), 'transformacao'),
        comRegua(num('offsetShearY', 'Deslocar inclinação Y', at('offsetShearY'), 0), 'transformacao'),
      ],
    }, {
      title: 'Força de cada parte',
      fields: [
        comRegua(num('mixRotation', 'Força da rotação', at('mixRotation'), 1, 0.01), 'transformacao'),
        comRegua(num('mixX', 'Força de X', at('mixX'), 1, 0.01), 'transformacao'),
        comRegua(num('mixY', 'Força de Y', at('mixY'), 1, 0.01), 'transformacao'),
        comRegua(num('mixScaleX', 'Força da escala X', at('mixScaleX'), 1, 0.01), 'transformacao'),
        comRegua(num('mixScaleY', 'Força da escala Y', at('mixScaleY'), 1, 0.01), 'transformacao'),
        comRegua(num('mixShearY', 'Força da inclinação Y', at('mixShearY'), 1, 0.01), 'transformacao'),
      ],
    }];
  }

  if (def.type === 'path') {
    return [common, {
      title: 'Caminho',
      fields: [
        chain,
        choice('target', 'Slot do caminho', at('target'), def.target, slotOptions(file)),
        choice('positionMode', 'Modo da posição', at('positionMode'), 'percent', POSITION_MODE_OPTIONS),
        choice('spacingMode', 'Modo do espaço', at('spacingMode'), 'length', SPACING_MODE_OPTIONS),
        choice('rotateMode', 'Modo da rotação', at('rotateMode'), 'tangent', ROTATE_MODE_OPTIONS),
        comRegua(num('offsetRotation', 'Deslocar rotação', at('offsetRotation'), 0), 'caminho'),
        comRegua(num('position', 'Posição', at('position'), 0, 0.01), 'caminho',
          medidaDoCaminho('position', def.positionMode ?? 'percent')),
        comRegua(num('spacing', 'Espaço', at('spacing'), 0), 'caminho',
          medidaDoCaminho('spacing', def.spacingMode ?? 'length')),
      ],
    }, {
      title: 'Força de cada parte',
      fields: [
        comRegua(num('mixRotation', 'Força da rotação', at('mixRotation'), 1, 0.01), 'caminho'),
        comRegua(num('mixX', 'Força de X', at('mixX'), 1, 0.01), 'caminho'),
        comRegua(num('mixY', 'Força de Y', at('mixY'), 1, 0.01), 'caminho'),
      ],
    }];
  }

  if (def.type === 'physics') {
    return [common, {
      title: 'Física',
      fields: [
        choice('bone', 'Osso', at('bone'), def.bone, boneOptions(file, [def.bone])),
        // Rodada 47, lote 2: de 0 a 1 no arquivo, de 0 a 100 % na tela. O giro
        // tinha passo 1 num campo de 0 a 1: um pixel de arrasto ia ao máximo.
        ...[
          num('x', 'Força em X', at('x'), 0, 0.01),
          num('y', 'Força em Y', at('y'), 0, 0.01),
          num('rotation', 'Rotação', at('rotation'), 0, 0.01),
          num('scaleX', 'Escala X', at('scaleX'), 0, 0.01),
          num('shearX', 'Inclinação X', at('shearX'), 0, 0.01),
        ].map((f) => comRegua(f, 'fisica')),
      ],
    }, {
      title: 'Comportamento',
      fields: [
        // Defeito A5 (degrau 9): o campo mostrava `1` quando o valor não está
        // escrito, e o padrão da spec (§6.5) é `0,5`. Quem lia a ficha de uma
        // física recém-criada via o dobro da inércia que o runtime usava.
        ...[
          num('inertia', 'Inércia', at('inertia'), 0.5, 0.01),
          num('strength', 'Força', at('strength'), 100),
          num('damping', 'Amortecimento', at('damping'), 1, 0.01),
          num('mass', 'Massa', at('mass'), 1, 0.01),
          num('wind', 'Vento', at('wind'), 0),
          num('gravity', 'Gravidade', at('gravity'), 0),
          num('limit', 'Limite', at('limit'), 5000),
          num('fps', 'Quadros por segundo', at('fps'), 60),
        ].map((f) => comRegua(f, 'fisica')),
      ],
    }];
  }

  return driverFields(file, name, i, def, common);
}

// ---------------------------------------------------------------------------
// D3 — a ficha da regra Comando, com os alvos (§8.2)
// ---------------------------------------------------------------------------

/** Os parâmetros do arquivo, para as listas. */
function parameterOptions(file: BoneFile): FieldOption[] {
  return (file.parameters ?? []).map((p) => ({ value: p.name, label: p.name }));
}

/** As animações do arquivo, mais `(nenhuma)`, para o modo contínuo. */
function animationOptions(file: BoneFile): FieldOption[] {
  return [
    { value: '', label: '(nenhuma)' },
    ...Object.keys(file.animations ?? {}).map((name) => ({ value: name, label: name })),
  ];
}

/**
 * A ficha da regra **Comando** — degrau 12, porta D3.
 *
 * O que havia: dois campos de TEXTO (`Parâmetro` e `Animação`) e cinco números
 * do modo contínuo. Escrever o nome do parâmetro à mão não dá erro quando erra
 * a letra: dá uma regra que o runtime ignora, calada. E do **modo alvos** — o
 * modo que a regra criada pelo editor usa — não havia campo nenhum: os
 * `targets` só se editavam abrindo o `.bone` num editor de texto.
 *
 * Agora: os dois nomes viram listas do que existe, e cada alvo ganha um grupo
 * com o osso, a propriedade, o modo e **uma linha por chave**, com o valor do
 * parâmetro escrito no rótulo. Mais dois botões em ícone: um alvo novo, e
 * tirar este.
 */
export function driverFields(
  file: BoneFile, name: string, i: number, def: ConstraintDef, common: FieldGroup,
): FieldGroup[] {
  const at = (prop: string): string => pointerOf('constraints', i, prop);
  const d = def as { parameter?: string; targets?: unknown[]; animation?: string };
  const range = parameterRange(file, d.parameter ?? '');
  const alvos = driverTargets(file, name);
  const contínuo = typeof d.animation === 'string' && d.animation !== '';

  const cabeça: FieldGroup = {
    title: 'Comando por parâmetro',
    fields: [
      choice('parameter', 'Parâmetro', at('parameter'), d.parameter ?? '', parameterOptions(file)),
      choice('animation', 'Animação inteira', at('animation'), '', animationOptions(file)),
    ],
    problem: driverProblems(def, file)[0],
  };

  // Modo contínuo (§8.2): o parâmetro vira TEMPO numa animação de controle. Os
  // cinco números só querem dizer alguma coisa aí; com o modo alvos ligado
  // eles seriam cinco linhas que não mexem em nada — e um campo que não mexe
  // em nada é a mentira mais barata que uma tela conta.
  const contínuoGrupo: FieldGroup = {
    title: 'Modo contínuo',
    fields: [
      num('from', 'De (parâmetro)', at('from'), range.min, 0.01),
      num('to', 'Até (parâmetro)', at('to'), range.max, 0.01),
      num('timeFrom', 'Tempo inicial', at('timeFrom'), 0, 0.01),
      num('timeTo', 'Tempo final', at('timeTo'), 1, 0.01),
      choice('mode', 'Modo', at('mode'), 'replace', DRIVER_MODE_OPTIONS),
    ],
  };

  if (contínuo) return [common, cabeça, contínuoGrupo];

  const novoAlvo: GroupAction = {
    key: 'driver-novo-alvo',
    icon: 'plus',
    hint: 'Mais um alvo: outro osso que este comando mexe',
    command: (doc) => {
      const livre = (doc.file.bones ?? [])
        .map((b) => b.name)
        .find((b) => !alvos.some((a) => a.target === b))
        ?? (doc.file.bones ?? [])[0]?.name;
      return livre === undefined
        ? null
        : new AddDriverTarget(name, livre, 'rotation', parameterRange(doc.file, d.parameter ?? ''));
    },
  };

  const grupos: FieldGroup[] = alvos.map((alvo) => {
    const ponto = (prop: string): string => pointerOf('constraints', i, 'targets', alvo.index, prop);
    const campos: FieldDef[] = [
      choice(`alvo${alvo.index}-osso`, 'Osso', ponto('target'), alvo.target,
        boneOptions(file, [alvo.target])),
      choice(`alvo${alvo.index}-prop`, 'Propriedade', ponto('property'), 'rotation',
        DRIVER_PROPERTIES.map((o) => ({ value: o.value, label: o.label }))),
      choice(`alvo${alvo.index}-modo`, 'Modo', ponto('mode'), 'replace', DRIVER_MODE_OPTIONS),
    ];
    // Uma linha por chave, e o rótulo diz em que valor do parâmetro ela vale.
    // "Em −1" e "Em 1" se leem; `keys/0/value` não.
    for (let k = 0; k < alvo.keys.length; k++) {
      // Rodada 47, lote 3 (notas do doc 84): "Em −1", com a unidade da propriedade e a dica.
      const entrada = formatNumberField(alvo.keys[k]!.input);
      const propriedade = (alvo as { property?: string }).property ?? 'rotation';
      campos.push(comRegua(num(
        `alvo${alvo.index}-chave${k}`,
        `Com o parâmetro em ${entrada}`,
        pointerOf('constraints', i, 'targets', alvo.index, 'keys', k, 'value'),
        0, 0.1,
      ), 'comando', medidaDoComando(propriedade, entrada)));
    }
    return {
      title: alvo.keys.length === 0
        ? `Alvo ${alvo.index + 1}`
        : `Alvo ${alvo.index + 1}: ${alvo.target}`,
      fields: campos,
      problem: alvo.problems[0],
      actions: [{
        key: `driver-tira-${alvo.index}`,
        icon: 'trash',
        hint: `Tirar este alvo da regra "${name}"`,
        command: () => new RemoveDriverTarget(name, alvo.index),
      }],
    };
  });

  if (grupos.length === 0) {
    // §8.2 pede um dos dois modos. Sem alvo e sem animação o runtime ignora a
    // regra inteira — e o grupo diz isso, com o botão de consertar ao lado.
    grupos.push({
      title: 'Alvos',
      fields: [],
      problem: 'esta regra não manda em nada: o runtime a ignora enquanto ela estiver sem alvo',
      actions: [novoAlvo],
    });
    return [common, cabeça, ...grupos];
  }

  grupos[0]!.actions = [novoAlvo, ...(grupos[0]!.actions ?? [])];
  return [common, cabeça, ...grupos];
}

// ---------------------------------------------------------------------------
// D3 — a ficha de um parâmetro (§8.1)
// ---------------------------------------------------------------------------

/**
 * O campo do **valor** de um parâmetro, para a barra da lista.
 *
 * Devolve o mesmo `FieldDef` que a ficha usa, e por isso a barra passa pelo
 * `writeFieldValue` como qualquer outro campo: com a base aberta escreve o
 * `default`; com uma animação aberta vira **chave** na timeline `parameter`
 * (a `anim/keying.ts` já mapeia `/parameters/i/default` para o alvo
 * `parameter`). Um caminho só até o valor, e a regra dos dois modos de graça.
 */
export function parameterValueField(file: BoneFile, name: string): FieldDef | null {
  const i = (file.parameters ?? []).findIndex((p) => p.name === name);
  if (i < 0) return null;
  return num('default', 'Valor', pointerOf('parameters', i, 'default'), 0, 0.01);
}

/** As sete propriedades de osso que um parâmetro pode LER (§8.1 `source`). */
const SOURCE_PROPERTY_OPTIONS: FieldOption[] = DRIVER_PROPERTIES
  .map((o) => ({ value: o.value, label: o.label }));

/**
 * A ficha de um parâmetro — a porta D3.
 *
 * Até aqui o parâmetro nascia pelo menu Novo ▾ com `min: -1, max: 1,
 * default: 0` e **não tinha onde ser visto**. Faixa, padrão, repetição e a
 * origem (`source`, o Smart Bone do Moho) existiam no formato e no runtime, e
 * na tela não existiam.
 *
 * A **origem** está num grupo próprio, e o rótulo diz o que ela faz: com ela
 * ligada o valor deixa de ser editável — é conta do osso, e a barra da lista
 * fica travada em vez de escrever um número que o runtime joga fora.
 */
export function parameterFields(file: BoneFile, name: string): FieldGroup[] {
  const i = (file.parameters ?? []).findIndex((p) => p.name === name);
  if (i < 0) return [];
  const p = (file.parameters ?? [])[i] as unknown as Record<string, unknown>;
  const at = (prop: string): string => pointerOf('parameters', i, prop);
  const naOrigem = (prop: string): string => pointerOf('parameters', i, 'source', prop);
  const temOrigem = p['source'] !== undefined && p['source'] !== null;
  const row = parameterRow(file, name);

  const grupos: FieldGroup[] = [{
    title: 'Parâmetro',
    fields: [
      {
        key: 'name', label: 'Nome', kind: 'text', pointer: at('name'),
        fallback: name, changeKind: 'structure',
        commandFor: (_doc, value) => {
          const novo = String(value ?? '').trim();
          return novo === '' || novo === name ? null : new RenameParameter(name, novo);
        },
      },
      { key: 'displayName', label: 'Nome para ler', kind: 'text', pointer: at('displayName'), fallback: '', changeKind: 'structure' },
      { key: 'group', label: 'Pasta', kind: 'text', pointer: at('group'), fallback: '', changeKind: 'structure' },
    ],
    problem: row?.problems[0],
  }, {
    title: 'Faixa',
    fields: [
      num('min', 'Mínimo', at('min'), 0, 0.01),
      num('max', 'Máximo', at('max'), 1, 0.01),
      // O `default` É o valor: é o que a setup pose usa (`setToSetupPose`
      // copia `default` para `Skeleton.parameters`), e é o que a barra da
      // lista escreve. Por isso o rótulo diz "Valor", e não "Padrão": o que
      // se arrasta e o que se grava são a mesma coisa.
      num('default', 'Valor', at('default'), 0, 0.01),
      flag('repeat', 'Dá a volta (o máximo emenda no mínimo)', at('repeat'), false),
    ],
  }];

  grupos.push({
    title: 'Vem de um osso',
    fields: temOrigem
      ? [
        choice('source-bone', 'Osso', naOrigem('bone'), '', boneOptions(file)),
        choice('source-property', 'O que ele lê', naOrigem('property'), 'rotation', SOURCE_PROPERTY_OPTIONS),
        num('source-from', 'De', naOrigem('from'), 0, 0.01),
        num('source-to', 'Até', naOrigem('to'), 1, 0.01),
      ]
      : [],
    problem: temOrigem ? row?.problems.find((t) => t.includes('osso')) : undefined,
    actions: [temOrigem
      ? {
        key: 'parametro-sem-origem',
        icon: 'trash',
        hint: 'Tirar a origem: o valor volta a ser arrastado à mão',
        command: () => new SetProperty(at('source'), undefined, 'Tirar a origem do parâmetro'),
      }
      : {
        key: 'parametro-com-origem',
        icon: 'plus',
        hint: 'Fazer um osso mandar no valor deste parâmetro',
        command: (doc) => {
          const osso = (doc.file.bones ?? [])[0]?.name;
          return osso === undefined ? null : new SetProperty(
            at('source'),
            { bone: osso, property: 'rotation', from: 0, to: 1 },
            'Pôr a origem do parâmetro',
          );
        },
      }],
  });

  return grupos;
}

/** Fields of the skeleton itself, shown when nothing is selected. */
export function skeletonFields(file: BoneFile): FieldGroup[] {
  const at = (prop: string): string => pointerOf('skeleton', prop);
  return [
    {
      title: 'Base',
      fields: [
        { key: 'name', label: 'Nome', kind: 'text', pointer: at('name'), fallback: '', changeKind: 'structure' },
        comRegua(num('fps', 'Quadros por segundo', at('fps'), 30), 'base'),
        flag('pixelArt', 'Arte em pixel', at('pixelArt'), false),
      ],
    },
    {
      title: 'Área de desenho',
      fields: [
        ...[
          num('x', 'Posição X', at('x'), 0),
          num('y', 'Posição Y', at('y'), 0),
          num('width', 'Largura', at('width'), 0),
          num('height', 'Altura', at('height'), 0),
        ].map((f) => comRegua(f, 'base')),
        // Defeito A6 (degrau 9): o padrão da spec (§3.5) é `100` pixels por
        // unidade de física, e a ficha dizia `1`. Cem vezes errado, e só a
        // física sentia — o osso ficava colado no pai e ninguém sabia por quê.
        comRegua(num('referenceScale', 'Escala de referência', at('referenceScale'), 100, 0.01), 'base'),
      ],
    },
  ];
}

/**
 * O nome da entidade que o desenho `slot/attachment` mostra (`espada`), ou
 * `null` quando ele não é uma entidade — rodada 8a.
 */
export function entityShownName(file: BoneFile, slot: string, attachment: string): string | null {
  const found = findAttachment(file, slot, attachment);
  if (found === null || found.def.type !== 'skeleton') return null;
  const uri = (found.def as { uri?: string }).uri;
  return typeof uri === 'string' && uri !== '' ? entityNameFor(uri) : 'sem arquivo';
}

/**
 * Decides what the panel shows for the current selection.
 *
 * Order: bone, then attachment, then constraint, then slot. With nothing
 * selected the skeleton itself is shown, so the panel is never empty.
 */
/**
 * **A imagem com osso próprio mostra os números do osso dela** — rodada 8d.
 *
 * Depois que a imagem anda numa animação, a posição, o giro e a escala dela
 * moram no osso próprio (`doc/own-bone.ts`), e o anexo fica no zero dele. A
 * ficha que mostrasse o anexo diria "X 0, Y 0" com a imagem longe dali. Os cinco
 * campos passam a apontar para o osso próprio: na base escrevem a pose de
 * repouso dele, numa animação viram chave dele — o mesmo que as ferramentas
 * fazem. Largura, altura, cor e o resto continuam sendo do anexo.
 */
const OWN_BONE_KEYS = new Set(['x', 'y', 'rotation', 'scaleX', 'scaleY']);
function throughOwnBone(file: BoneFile, slot: string, groups: FieldGroup[]): FieldGroup[] {
  const own = ownBoneOfSlot(file, slot);
  if (own === null) return groups;
  const index = boneIndex(file, own);
  if (index < 0) return groups;
  return groups.map((group) => ({
    ...group,
    fields: group.fields.map((field) => (OWN_BONE_KEYS.has(field.key)
      ? { ...field, pointer: pointerOf('bones', index, field.key), fallback: field.key.startsWith('scale') ? 1 : 0 }
      : field)),
  }));
}

/**
 * **O que fica embaixo da ficha rápida** — rodada 43, lote 1 (doc `51`, §2.3).
 *
 * A ficha do osso mostrava X, Y, giro e escala DUAS vezes: na ficha rápida e
 * em *Posição e forma*. Os quatro programas mostram uma vez. O modelo continua
 * inteiro (os rótulos, os comandos e quem lê o modelo dependem dele); o painel
 * tira daqui o que a ficha rápida já mostra em cima, e o grupo que esvazia sai.
 */
export function belowQuick(groups: readonly FieldGroup[], shownAbove: readonly string[]): FieldGroup[] {
  if (shownAbove.length === 0) return [...groups];
  const fora = new Set(shownAbove);
  const out: FieldGroup[] = [];
  for (const group of groups) {
    const fields = group.fields.filter((field) => !fora.has(field.key));
    if (fields.length === 0) continue;
    out.push(fields.length === group.fields.length ? group : { ...group, fields });
  }
  return out;
}

/** O nome de cada tipo de desenho que não é imagem, na linha de baixo do título. */
const DRAWING_WORD: Readonly<Record<string, string>> = {
  point: 'ponto', boundingbox: 'caixa', clipping: 'máscara', path: 'caminho', skeleton: 'entidade',
};

/**
 * A linha de baixo do título de um desenho — rodada 43, lote 1 (doc `51`, T1 e
 * T5): *"imagem hand · no osso torso"*. O título dizia "Anexo: hand", o nome
 * da imagem e não o do desenho escolhido, e o osso morava 87 px abaixo da dobra.
 * O osso é o que se vê na Árvore (`shownBoneOfSlot`), não o osso próprio da imagem.
 */
export function drawingSubtitle(file: BoneFile, slot: string, attachment?: string): string | undefined {
  const def = (file.slots ?? []).find((s) => s.name === slot);
  if (def === undefined) return undefined;
  const osso = `no osso ${shownBoneOfSlot(file, slot) ?? def.bone}`;
  const nome = attachment ?? def.attachment;
  if (nome === undefined || nome === null || nome === '') return `sem imagem · ${osso}`;
  const found = findAttachment(file, slot, nome);
  const d = found?.def as { type?: string; path?: string } | undefined;
  const palavra = DRAWING_WORD[d?.type ?? 'region'];
  if (palavra !== undefined) return `${palavra} ${nome} · ${osso}`;
  return `imagem ${d?.path ?? nome} · ${osso}`;
}

export function buildProperties(
  file: BoneFile, selection: Selection, visibleSkins: readonly string[] = [],
): PropertiesModel {
  // Two of the same kind is "several things". One bone plus the slot it moves
  // plus the image in that slot is not: it is one click in the drawing area,
  // and the rule below picks the most specific of the three.
  const several = selection.attachments.length > 1 || selection.constraints.length > 1
    || selection.slots.length > 1 || selection.bones.length > 1
    || (selection.parameters ?? []).length > 1 || (selection.variables ?? []).length > 1;

  if (several) {
    return {
      title: 'Vários itens',
      subject: 'many',
      groups: [],
      message: 'Vários itens selecionados. Escolha um só para ver os campos.',
    };
  }

  // The bone comes first: clicking a drawing in the viewport also selects the
  // bone that moves it, and the panel must then show the same numbers the
  // tools Mover, Girar and Escalar write. Clicking a row in the tree selects
  // only that row, so a slot or an image still opens its own fields.
  const bone = selection.bones[0];
  const attachment = selection.attachments[0];
  // Rodada 8a, achado 3: o nome que se lê é o da ENTIDADE, não o do desenho
  // antigo — a troca guarda o nome do anexo ("face"), para as chaves.
  const entidade = attachment === undefined ? null : entityShownName(file, attachment.slot, attachment.attachment);
  if (bone !== undefined) {
    const groups = boneFields(file, bone);
    if (groups.length > 0) {
      const titulo = entidade === null ? `Osso: ${bone}` : `Osso: ${bone} · entidade ${entidade}`;
      return { title: titulo, subject: 'bone', groups };
    }
  }

  if (attachment) {
    const groups = throughOwnBone(file, attachment.slot, attachmentFields(file, attachment.slot, attachment.attachment));
    if (groups.length > 0) {
      // Rodada 23: o emissor se diz emissor. Rodada 43, lote 1: o resto é
      // "Desenho", com o nome do DESENHO escolhido (o slot), e a imagem e o
      // osso na linha de baixo.
      const ehEmissor = slotKindWord(file, attachment.slot) === 'Emissor';
      const titulo = entidade !== null
        ? `Entidade: ${entidade} (em ${attachment.slot})`
        : ehEmissor ? `Emissor: ${attachment.attachment}` : `Desenho: ${attachment.slot}`;
      const subtitle = entidade === null && !ehEmissor
        ? drawingSubtitle(file, attachment.slot, attachment.attachment) : undefined;
      const def = findAttachment(file, attachment.slot, attachment.attachment)?.def as Record<string, unknown> | undefined;
      if (def?.type === PARTICLE_TYPE) {
        return {
          title: titulo, subject: 'attachment', groups, tabs: particleSheetTabs(groups, def),
          weight: { emissor: emitterWeight(def), boneco: skeletonWeight(file) },
        };
      }
      return subtitle === undefined
        ? { title: titulo, subject: 'attachment', groups }
        : { title: titulo, subtitle, subject: 'attachment', groups };
    }
  }

  // O parâmetro vem antes da regra: escolher um parâmetro na lista da aba
  // Regras limpa a seleção de regra, e o contrário também — mas um documento
  // montado à mão pode trazer os dois, e a ficha que se quer ver é a do que
  // acabou de ser clicado. O painel Regras sempre escolhe um dos dois.
  const parameter = (selection.parameters ?? [])[0];
  if (parameter !== undefined) {
    const groups = parameterFields(file, parameter);
    if (groups.length > 0) {
      return { title: `Parâmetro: ${parameter}`, subject: 'parameter', groups };
    }
  }

  const variable = (selection.variables ?? [])[0];
  if (variable !== undefined) {
    const groups = variableFields(file, variable);
    if (groups.length > 0) {
      return { title: `Variável: ${variable}`, subject: 'variable', groups };
    }
  }

  const constraint = selection.constraints[0];
  if (constraint !== undefined) {
    const groups = constraintFields(file, constraint);
    if (groups.length > 0) {
      return { title: `Regra: ${constraint}`, subject: 'constraint', groups };
    }
  }

  const slot = selection.slots[0];
  if (slot !== undefined) {
    const groups = slotFields(file, slot, visibleSkins);
    if (groups.length > 0) {
      // Rodada 8a: a linha da Ordem escolhe o slot; o título diz a entidade.
      const mostra = (file.slots ?? []).find((s) => s.name === slot)?.attachment;
      const dele = typeof mostra === 'string' && mostra !== '' ? entityShownName(file, slot, mostra) : null;
      // Rodada 43, lote 1: "Desenho", como pela Árvore (doc `51`).
      const subtitle = dele === null ? drawingSubtitle(file, slot) : undefined;
      const title = dele === null ? `Desenho: ${slot}` : `Desenho: ${slot} · entidade ${dele}`;
      return subtitle === undefined ? { title, subject: 'slot', groups } : { title, subtitle, subject: 'slot', groups };
    }
  }

  return { title: 'Base', subject: 'skeleton', groups: skeletonFields(file) };
}

// ---------------------------------------------------------------------------
// A ficha da chave `body`: a pilha passa na virada? — degrau 9, tarefa 9.9
// ---------------------------------------------------------------------------

/*
 * 🗣️ *"Na virada de corpo, a pilha de peles passa ou não: quem faz decide"* —
 * o Humberto, 16/09/2026 (I14). No formato isso é o `keepSkins` da chave
 * `body` (§9.13), que já existe e nasce `true`. O que faltava era a porta:
 * uma virada gravada com a opção errada mudava a roupa do personagem no meio
 * da animação e nada na tela dizia onde mexer.
 */

/** O que a ficha mostra da chave `body` que está no tempo de agora. */
export interface BodyKeyView {
  /** O tempo da chave, em segundos. */
  time: number;
  /** O corpo que entra ali: o uri, ou `null` = o corpo do arquivo. */
  value: string | null;
  /** A pilha de peles passa para o corpo novo. Padrão do formato: `true`. */
  keepSkins: boolean;
}

/** A chave `body` no tempo de agora, ou `null` quando não há virada aqui. */
export function bodyKeyView(
  file: BoneFile, animation: string | null, time: number,
): BodyKeyView | null {
  if (animation === null) return null;
  const key = bodyKeys(file, animation).find((k) => sameTime(k.time, time));
  if (key === undefined) return null;
  return { time: key.time, value: key.value, keepSkins: key.keepSkins !== false };
}

/** O nome do campo, e a frase que explica o que ele faz. */
export const KEEP_SKINS_LABEL = 'A pilha de skins passa';
export const KEEP_SKINS_HINT =
  'Ligado, a base nova entra vestindo as mesmas skins. Desligado, ela entra com a pilha '
  + 'dele — é o que se quer quando o lobisomem não usa a armadura do homem.';

/**
 * Liga e desliga o `keepSkins` de uma chave `body`.
 *
 * Grava a **ausência** quando é `true`: `true` é o padrão do formato (§9.13),
 * e escrever o padrão é ruído no arquivo.
 */
export class SetKeepSkins implements Command {
  readonly label = 'A pilha de skins passa na virada';
  readonly kind: ChangeKind = 'structure';
  private had = false;
  private before: unknown = undefined;

  constructor(
    private readonly animation: string,
    private readonly time: number,
    private readonly on: boolean,
  ) {}

  private target(doc: EditorDoc): { keepSkins?: boolean } | undefined {
    return bodyKeys(doc.file, this.animation).find((key) => sameTime(key.time, this.time));
  }

  apply(doc: EditorDoc): void {
    const key = this.target(doc);
    if (key === undefined) return;
    this.had = Object.prototype.hasOwnProperty.call(key, 'keepSkins');
    this.before = key.keepSkins;
    if (this.on) delete key.keepSkins;
    else key.keepSkins = false;
  }

  revert(doc: EditorDoc): void {
    const key = this.target(doc);
    if (key === undefined) return;
    if (this.had) key.keepSkins = this.before as boolean;
    else delete key.keepSkins;
  }
}

// ---------------------------------------------------------------------------
// G9/P15 — a ficha de uma variável (§8.4)
// ---------------------------------------------------------------------------

/**
 * A ficha de uma variável: nome, tipo e padrão.
 *
 * O campo do **padrão** muda de forma com o tipo: número, texto ou caixa. Um
 * campo de texto para uma variável `bool` deixaria escrever `"talvez"` — que
 * o formato recusa (§8.4, L1) e o runtime ignora, calado.
 *
 * O padrão é `/variables/i/default`, que a `anim/keying.ts` já mapeia para o
 * alvo `variable` (§9.9): com a base aberta ele escreve o padrão, e com uma
 * animação aberta ele vira **chave**. A porta de chavear é a mesma dos outros
 * campos, e não precisou de caminho novo.
 */
export function variableFields(file: BoneFile, name: string): FieldGroup[] {
  const i = (file.variables ?? []).findIndex((v) => v.name === name);
  if (i < 0) return [];
  const row = variableRow(file, name);
  const type = row?.type ?? 'float';
  const at = (prop: string): string => pointerOf('variables', i, prop);

  const padrao: FieldDef = type === 'bool'
    ? flag('default', 'Valor', at('default'), false)
    : type === 'string'
      ? { key: 'default', label: 'Valor', kind: 'text', pointer: at('default'), fallback: '', changeKind: 'structure' }
      : num('default', 'Valor', at('default'), 0, type === 'int' ? 1 : 0.01);

  return [{
    title: 'Variável',
    fields: [
      {
        key: 'name', label: 'Nome', kind: 'text', pointer: at('name'),
        fallback: name, changeKind: 'structure',
        commandFor: (_doc, value) => {
          const novo = String(value ?? '').trim();
          return novo === '' || novo === name ? null : new RenameVariable(name, novo);
        },
      },
      {
        key: 'type', label: 'Tipo', kind: 'select', pointer: at('type'), fallback: type,
        options: VARIABLE_TYPES.map((t) => ({ value: t.value, label: t.label })),
        changeKind: 'structure',
        // Trocar o tipo leva o padrão junto: um `default: 0` que ficasse
        // dentro de uma variável "Sim ou não" é L1 (§8.4), e seria o nosso
        // próprio editor escrevendo um arquivo que o runtime recusa.
        commandFor: (_doc, value) => {
          const novo = String(value ?? '');
          return novo === '' || novo === type ? null : new SetVariableType(name, novo);
        },
      },
      padrao,
    ],
    problem: row?.problems[0],
  }];
}

/**
 * **Quais grupos da ficha completa ficam abertos** — Rodada 47, lote 6c (nota 5 do doc 90).
 *
 * A ficha de um osso tinha 727 px de grupos fixos (Compensar, Osso, Marcação,
 * Posição e forma, Herança) numa caixa de 472 em 1920×1080: o corpo rolava
 * sem ser lista. A regra da Malha (v35.2) vale aqui: abre o grupo que diz O
 * QUE É (o do nome) e o que tem problema; os outros dobram no título, e o que
 * a mão abriu ou fechou fica (por título). Com até dois grupos, nada dobra.
 */
export function groupsOpen(
  groups: ReadonlyArray<{ title: string; fields: ReadonlyArray<{ key: string; renameOf?: unknown }>; problem?: string }>,
  hand: ReadonlyMap<string, boolean> = new Map(),
): boolean[] {
  if (groups.length <= 2) return groups.map(() => true);
  return groups.map((g) => {
    const mao = hand.get(g.title);
    if (mao !== undefined) return mao;
    if (g.problem !== undefined) return true;
    return g.fields.some((f) => f.key === 'name' || f.renameOf !== undefined);
  });
}

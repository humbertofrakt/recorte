/**
 * **Variáveis e marcas** (dono C) — degrau 12, porta G9/P15 (18/09/2026).
 *
 * 🗣️ *"Variáveis e tags pela tela, provavelmente — **com um jeito de
 * desligar**"* — o Humberto, RESPOSTAS Q23, 17/09/2026.
 *
 * O formato tem as duas desde sempre: a `Variable` na §8.4, as tags na §8.5, e
 * as timelines das duas na §9.9. O runtime lê e expõe. E a
 * `editor/src/anim/keying.ts` **já sabia** os dois alvos (`variableTarget`,
 * `tagTarget`) e já tinha o rótulo "Marcas". Só que **nenhum comando criava**
 * uma variável ou uma marca, e não havia painel: o formato sabia, o editor
 * sabia chavear, e não havia por onde declarar nem por onde ver.
 *
 * Os três programas, antes de decidir a tela (regra do Humberto):
 *
 * | Programa | O que faz |
 * |:---|:---|
 * | **Spriter** | tem **variáveis** (da entidade e do objeto), com linha própria na linha do tempo — é o modelo que a §8.4 cita (*"varline do Spriter"*). Não tem tags |
 * | **Spine** | não tem variável nem tag. O que chega perto são os **eventos** com `int`/`float`/`string`, que já temos |
 * | **DragonBones** | não tem nenhuma das duas |
 *
 * Seguimos o Spriter na variável, que é de onde a §8.4 veio. Nas marcas nenhum
 * dos três serve, e aí vale o pedido dele à letra: declarar, chavear, e poder
 * desligar.
 *
 * **O desligar não pode esconder em silêncio.** Um interruptor que faz a coisa
 * sumir sem dizer que ela existe é o defeito que a Janela de Problemas
 * consertou no degrau 11. Desligado, a lista continua mostrando **uma linha**
 * que diz que está desligado — e, quando o arquivo tem variáveis ou marcas
 * escritas, **quantas**, para ninguém achar que o arquivo não tem nada.
 *
 * Sem DOM: a tela é do `rules.ts`.
 */

import type { BoneFile } from '../../../runtime/src/index.js';
import type { ChangeKind, Command, EditorDoc } from '../contract.js';
import { uniqueName } from '../contract.js';
import { prefs, setPrefs } from '../ui/prefs.js';
import { findAnimation } from '../anim/animations.js';
import { sameTime } from '../anim/keying.js';
// P12 (29/09/2026): a chave recém-gravada se MOSTRA na linha do tempo.
import { revealKey, roundTime, tagTarget } from '../anim/keying.js';
import { setPropertyOrKey } from '../anim/pose-mode.js';

// ---------------------------------------------------------------------------
// O jeito de desligar (Q23)
// ---------------------------------------------------------------------------

/** `true` quando as variáveis e as marcas aparecem na tela. */
export function varsOn(): boolean {
  return prefs().showVars;
}

/** Liga e desliga a seção. É preferência de quem usa, e não vai no arquivo. */
export function setVarsOn(on: boolean): void {
  setPrefs({ showVars: on });
}

/**
 * A frase que a lista mostra **quando está desligada**.
 *
 * Nunca é vazia. Com o arquivo limpo ela diz só que está desligado; com
 * variáveis ou marcas escritas ela diz **quantas**, porque esconder conteúdo
 * que existe sem dizer que existe é o mesmo defeito que a Janela de Problemas
 * consertou no degrau 11 — a tela deixa de mentir por omissão.
 */
export function varsOffNotice(file: BoneFile): string {
  const v = (file.variables ?? []).length;
  const t = (file.tags ?? []).length;
  if (v === 0 && t === 0) {
    return 'Variáveis e etiquetas: desligadas. Este arquivo não tem nenhuma.';
  }
  const partes: string[] = [];
  if (v > 0) partes.push(v === 1 ? '1 variável' : `${v} variáveis`);
  if (t > 0) partes.push(t === 1 ? '1 etiqueta' : `${t} etiquetas`);
  return `Variáveis e etiquetas: desligadas — este arquivo tem ${partes.join(' e ')}, `
    + 'escondidas aqui. Ligue para ver.';
}

// ---------------------------------------------------------------------------
// Variáveis (§8.4)
// ---------------------------------------------------------------------------

/** Os quatro tipos da §8.4, com o nome que aparece na tela. */
export const VARIABLE_TYPES: readonly { value: string; label: string }[] = Object.freeze([
  { value: 'float', label: 'Número com vírgula' },
  { value: 'int', label: 'Número inteiro' },
  { value: 'string', label: 'Texto' },
  { value: 'bool', label: 'Sim ou não' },
]);

/** O padrão do formato para cada tipo (§8.4). */
export const VARIABLE_DEFAULTS: Readonly<Record<string, number | string | boolean>> = Object.freeze({
  float: 0, int: 0, string: '', bool: false,
});

/** Uma linha da lista de variáveis. */
export interface VariableRow {
  name: string;
  type: string;
  typeLabel: string;
  value: number | string | boolean;
  /** Quantas animações chaveiam esta variável. */
  keyedIn: string[];
  problems: string[];
}

/** As linhas da lista, na ordem do arquivo. */
export function variableRows(file: BoneFile): VariableRow[] {
  return (file.variables ?? []).map((raw) => {
    const v = raw as unknown as Record<string, unknown>;
    const name = String(v['name'] ?? '');
    const type = String(v['type'] ?? '');
    const value = v['default'] as number | string | boolean | undefined;
    const problems: string[] = [];
    const conhecido = VARIABLE_TYPES.some((t) => t.value === type);
    // Regra 21: um tipo que não é um dos quatro não vira palpite. O runtime
    // não sabe o que fazer com ele, e a tela diz isso em vez de desenhar um
    // campo qualquer e fingir que entendeu.
    if (!conhecido) {
      problems.push(`o tipo "${type}" não é um dos quatro do formato (§8.4)`);
    } else if (value !== undefined && !matchesType(type, value)) {
      // §8.4: "Tem que bater com `type` (L1)".
      problems.push(`o padrão não é do tipo "${labelOfType(type)}" (§8.4, L1)`);
    }
    return {
      name,
      type,
      typeLabel: conhecido ? labelOfType(type) : type,
      value: value ?? (VARIABLE_DEFAULTS[type] ?? 0),
      keyedIn: animationsKeying(file, 'variable', name),
      problems,
    };
  });
}

/** Uma linha só, pelo nome, ou `null`. */
export function variableRow(file: BoneFile, name: string): VariableRow | null {
  return variableRows(file).find((v) => v.name === name) ?? null;
}

/** `true` quando o valor bate com o tipo declarado (§8.4). */
export function matchesType(type: string, value: unknown): boolean {
  switch (type) {
    case 'float': return typeof value === 'number' && Number.isFinite(value);
    case 'int': return typeof value === 'number' && Number.isInteger(value);
    case 'string': return typeof value === 'string';
    case 'bool': return typeof value === 'boolean';
    default: return false;
  }
}

function labelOfType(type: string): string {
  return VARIABLE_TYPES.find((t) => t.value === type)?.label ?? type;
}

/** As animações que têm uma timeline daquele tipo e alvo, pelo nome. */
function animationsKeying(file: BoneFile, type: string, target: string): string[] {
  const out: string[] = [];
  for (const animation of file.animations ?? []) {
    const timelines = (animation as { timelines?: Array<{ type?: string; target?: string }> })
      .timelines ?? [];
    const tem = timelines.some((tl) => tl.type === type
      && (type === 'tag' || tl.target === target));
    if (tem) out.push(animation.name);
  }
  return out;
}

/** Uma variável nova, com o padrão do tipo escolhido. */
export class AddVariable implements Command {
  readonly label = 'Nova variável';
  readonly kind: ChangeKind = 'structure';
  readonly name: string;

  constructor(file: BoneFile, private readonly type = 'float') {
    this.name = uniqueName('variavel', (file.variables ?? []).map((v) => v.name));
  }

  apply(doc: EditorDoc): void {
    const list = doc.file.variables ?? (doc.file.variables = []);
    list.push({
      name: this.name,
      type: this.type,
      default: VARIABLE_DEFAULTS[this.type] ?? 0,
    } as never);
  }

  revert(doc: EditorDoc): void {
    const list = doc.file.variables ?? [];
    const at = list.findIndex((v) => v.name === this.name);
    if (at >= 0) list.splice(at, 1);
  }
}

/**
 * Apaga uma variável **e as chaves dela**.
 *
 * Guarda o arquivo inteiro: o desfazer devolve o mesmo texto, letra por letra.
 */
export class DeleteVariable implements Command {
  readonly label = 'Apagar a variável';
  readonly kind: ChangeKind = 'structure';
  private saved: string | null = null;

  constructor(private readonly name: string) {}

  apply(doc: EditorDoc): void {
    this.saved = JSON.stringify(doc.file);
    const list = doc.file.variables ?? [];
    const at = list.findIndex((v) => v.name === this.name);
    if (at >= 0) list.splice(at, 1);
    for (const animation of doc.file.animations ?? []) {
      const bag = animation as { timelines?: Array<{ type?: string; target?: string }> };
      if (!Array.isArray(bag.timelines)) continue;
      bag.timelines = bag.timelines.filter(
        (tl) => !(tl.type === 'variable' && tl.target === this.name),
      );
    }
  }

  revert(doc: EditorDoc): void {
    if (this.saved === null) return;
    restore(doc, this.saved);
  }
}

/**
 * Renomeia uma variável e arrasta as chaves dela.
 *
 * Como o `RenameParameter`: o `panels/rename.ts` é da parte Árvore, e esta
 * rodada não escreve nela. O efeito é o mesmo.
 */
export class RenameVariable implements Command {
  readonly label = 'Renomear a variável';
  readonly kind: ChangeKind = 'structure';
  private applied = false;

  constructor(private readonly from: string, private readonly to: string) {}

  apply(doc: EditorDoc): void {
    if ((doc.file.variables ?? []).some((v) => v.name === this.to)) {
      doc.notice(`Já existe uma variável chamada "${this.to}"`);
      this.applied = false;
      return;
    }
    this.applied = true;
    moveVariable(doc, this.from, this.to);
  }

  revert(doc: EditorDoc): void {
    if (this.applied) moveVariable(doc, this.to, this.from);
  }
}

function moveVariable(doc: EditorDoc, from: string, to: string): void {
  for (const v of doc.file.variables ?? []) if (v.name === from) v.name = to;
  for (const animation of doc.file.animations ?? []) {
    const timelines = (animation as { timelines?: Array<{ type?: string; target?: string }> })
      .timelines ?? [];
    for (const tl of timelines) {
      if (tl.type === 'variable' && tl.target === from) tl.target = to;
    }
  }
}

/**
 * Troca o **tipo** de uma variável, e leva o padrão junto.
 *
 * Um tipo trocado sem o padrão junto deixa o arquivo com um `default` que não
 * bate — L1 na §8.4, e o runtime recusa. Trocar para "Sim ou não" com um
 * `default: 0` dentro seria um arquivo inválido escrito pela nossa tela.
 */
export class SetVariableType implements Command {
  readonly label = 'Tipo da variável';
  readonly kind: ChangeKind = 'structure';
  private before: { type: unknown; value: unknown } | null = null;

  constructor(private readonly name: string, private readonly type: string) {}

  apply(doc: EditorDoc): void {
    const v = (doc.file.variables ?? []).find((x) => x.name === this.name) as
      { type?: unknown; default?: unknown } | undefined;
    if (v === undefined) return;
    this.before = { type: v.type, value: v.default };
    v.type = this.type as never;
    // Só troca o padrão quando ele deixou de bater: um `0` que já era `int`
    // continua `0` ao virar `float`, e o arquivo não muda à toa.
    if (!matchesType(this.type, v.default)) {
      v.default = VARIABLE_DEFAULTS[this.type] ?? 0;
    }
  }

  revert(doc: EditorDoc): void {
    const v = (doc.file.variables ?? []).find((x) => x.name === this.name) as
      { type?: unknown; default?: unknown } | undefined;
    if (v === undefined || this.before === null) return;
    v.type = this.before.type;
    v.default = this.before.value;
  }
}

// ---------------------------------------------------------------------------
// Marcas (§8.5)
// ---------------------------------------------------------------------------

/** Uma linha da lista de marcas. */
export interface TagRow {
  name: string;
  /** `true` quando a marca vale na animação aberta INTEIRA (`animation.tags`). */
  wholeAnimation: boolean;
  /** `true` quando a última chave `tag` até o cursor traz esta marca. */
  activeNow: boolean;
  /** As animações que citam esta marca, de um jeito ou de outro. */
  usedIn: string[];
  problems: string[];
}

/**
 * As marcas declaradas na raiz (§8.5), com o estado delas na animação aberta.
 *
 * A §8.5 diz: *"O runtime **DEVE** expor `activeTags(animation, time)` =
 * `animation.tags` ∪ valor da última chave `<= time`"*. A lista mostra as duas
 * metades separadas, porque elas se ligam e desligam por caminhos diferentes:
 * a primeira vale a animação inteira, a segunda vale daquele instante em
 * diante.
 */
export function tagRows(file: BoneFile, animation: string | null, time: number): TagRow[] {
  const body = findAnimation(file, animation);
  const inteiras = new Set((body as { tags?: string[] } | null)?.tags ?? []);
  const agora = new Set(activeTagKeyValue(file, animation, time));
  return (file.tags ?? []).map((name) => ({
    name,
    wholeAnimation: inteiras.has(name),
    activeNow: agora.has(name),
    usedIn: animationsUsingTag(file, name),
    problems: [],
  }));
}

/** O valor da última chave `tag` até `time`, ou `[]` antes da primeira (§8.5). */
export function activeTagKeyValue(
  file: BoneFile, animation: string | null, time: number,
): string[] {
  const body = findAnimation(file, animation);
  if (body === null) return [];
  const tl = (body as { timelines?: Array<{ type?: string; keys?: unknown[] }> })
    .timelines?.find((t) => t.type === 'tag');
  if (tl === undefined) return [];
  let out: string[] = [];
  for (const raw of tl.keys ?? []) {
    const key = raw as { time?: number; value?: unknown };
    const t = typeof key.time === 'number' ? key.time : 0;
    if (t > time && !sameTime(t, time)) break;
    out = Array.isArray(key.value) ? key.value.filter((x) => typeof x === 'string') : [];
  }
  return out;
}

/**
 * As marcas que o jogo vê no instante de agora — `activeTags` da §8.5, inteiro.
 *
 * É a união das duas metades, e é o número que importa: nem a lista de cima
 * nem a chave, sozinhas, dizem o que o jogo lê.
 */
export function activeTagsAt(file: BoneFile, animation: string | null, time: number): string[] {
  const body = findAnimation(file, animation);
  const inteiras = (body as { tags?: string[] } | null)?.tags ?? [];
  const chave = activeTagKeyValue(file, animation, time);
  return [...new Set([...inteiras, ...chave])].sort();
}

/** As animações que citam a marca, na lista da animação ou numa chave. */
function animationsUsingTag(file: BoneFile, name: string): string[] {
  const out: string[] = [];
  for (const animation of file.animations ?? []) {
    const bag = animation as {
      tags?: string[];
      timelines?: Array<{ type?: string; keys?: Array<{ value?: unknown }> }>;
    };
    const naLista = (bag.tags ?? []).includes(name);
    const naChave = (bag.timelines ?? []).some((tl) => tl.type === 'tag'
      && (tl.keys ?? []).some((k) => Array.isArray(k.value) && k.value.includes(name)));
    if (naLista || naChave) out.push(animation.name);
  }
  return out;
}

/** Declara uma marca na raiz (§8.5). */
export class AddTag implements Command {
  readonly label = 'Nova etiqueta';
  readonly kind: ChangeKind = 'structure';
  readonly name: string;

  constructor(file: BoneFile) {
    this.name = uniqueName('etiqueta', file.tags ?? []);
  }

  apply(doc: EditorDoc): void {
    const list = doc.file.tags ?? (doc.file.tags = []);
    list.push(this.name);
  }

  revert(doc: EditorDoc): void {
    const list = doc.file.tags ?? [];
    const at = list.indexOf(this.name);
    if (at >= 0) list.splice(at, 1);
  }
}

/**
 * Apaga uma marca **e tira o nome dela de toda animação e de toda chave**.
 *
 * §8.5: *"Tag usada e não declarada: L2"*. Apagar só a declaração deixaria o
 * arquivo acusando em toda animação que ainda a citasse — um aviso que a nossa
 * própria tela teria criado.
 */
export class DeleteTag implements Command {
  readonly label = 'Apagar a etiqueta';
  readonly kind: ChangeKind = 'structure';
  private saved: string | null = null;

  constructor(private readonly name: string) {}

  apply(doc: EditorDoc): void {
    this.saved = JSON.stringify(doc.file);
    const list = doc.file.tags ?? [];
    const at = list.indexOf(this.name);
    if (at >= 0) list.splice(at, 1);
    for (const animation of doc.file.animations ?? []) {
      const bag = animation as {
        tags?: string[];
        timelines?: Array<{ type?: string; keys?: Array<{ value?: unknown }> }>;
      };
      if (Array.isArray(bag.tags)) bag.tags = bag.tags.filter((t) => t !== this.name);
      for (const tl of bag.timelines ?? []) {
        if (tl.type !== 'tag') continue;
        for (const key of tl.keys ?? []) {
          if (Array.isArray(key.value)) {
            key.value = (key.value as string[]).filter((t) => t !== this.name);
          }
        }
      }
    }
  }

  revert(doc: EditorDoc): void {
    if (this.saved === null) return;
    restore(doc, this.saved);
  }
}

/** Renomeia uma marca em todo lugar que a cita. */
export class RenameTag implements Command {
  readonly label = 'Renomear a etiqueta';
  readonly kind: ChangeKind = 'structure';
  private applied = false;

  constructor(private readonly from: string, private readonly to: string) {}

  apply(doc: EditorDoc): void {
    if ((doc.file.tags ?? []).includes(this.to)) {
      doc.notice(`Já existe uma etiqueta chamada "${this.to}"`);
      this.applied = false;
      return;
    }
    this.applied = true;
    moveTag(doc, this.from, this.to);
  }

  revert(doc: EditorDoc): void {
    if (this.applied) moveTag(doc, this.to, this.from);
  }
}

function moveTag(doc: EditorDoc, from: string, to: string): void {
  const list = doc.file.tags ?? [];
  const at = list.indexOf(from);
  if (at >= 0) list[at] = to;
  for (const animation of doc.file.animations ?? []) {
    const bag = animation as {
      tags?: string[];
      timelines?: Array<{ type?: string; keys?: Array<{ value?: unknown }> }>;
    };
    if (Array.isArray(bag.tags)) bag.tags = bag.tags.map((t) => (t === from ? to : t));
    for (const tl of bag.timelines ?? []) {
      if (tl.type !== 'tag') continue;
      for (const key of tl.keys ?? []) {
        if (Array.isArray(key.value)) {
          key.value = (key.value as string[]).map((t) => (t === from ? to : t));
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// As portas do apagar e do renomear — rodada final, lote 1 (28/09/2026)
// ---------------------------------------------------------------------------

/*
 * `DeleteTag` e `RenameTag` existiam desde o degrau 12 e **nenhum botão os
 * chamava**: a aba Regras criava etiqueta e não apagava nem renomeava.
 *
 * O modelo é o do Spine (`REFERENCIA regras 2026-09-28.md`, lote 1): duplo
 * clique no nome renomeia, e a linha tem o lápis e a lixeira. O Spriter tem
 * etiqueta, mas o manual dele não diz como se apaga — "não achei".
 */

/**
 * O que impede renomear a etiqueta `from` para `to`, em português, ou `null`.
 *
 * É a janela que pergunta isto, **antes** de o comando rodar: o `RenameTag`
 * sozinho recusa o nome repetido pelo rodapé, mas deixa um passo vazio na
 * pilha de desfazer. Nome igual ao de antes não é problema: não muda nada.
 */
export function renameTagProblem(file: BoneFile, from: string, to: string): string | null {
  const nome = to.trim();
  if (nome === '') return 'Escreva um nome.';
  if (nome === from) return null;
  if ((file.tags ?? []).includes(nome)) return `Já existe uma etiqueta chamada "${nome}".`;
  return null;
}

/**
 * As animações que apagar esta etiqueta vai mexer — o que a janela de apagar
 * lista **antes** de apagar. Apagar tira o nome de toda animação e de toda
 * chave (§8.5), e isso não pode acontecer calado.
 */
export function tagUsers(file: BoneFile, name: string): string[] {
  return animationsUsingTag(file, name);
}

/**
 * **O que a seção de variáveis e etiquetas mostra**, em partes de assinatura.
 *
 * O defeito que a foto do lote 1 pegou: a assinatura da lista (`shapeNow`, em
 * `rules.ts`) só tinha os parâmetros e as regras. As duas seções que vieram
 * depois — variáveis e etiquetas — **ficaram fora dela**. Abrir uma animação,
 * andar o cursor ou renomear uma etiqueta não mudava a assinatura, o
 * `redrawPlan` respondia "nada", e a linha continuava dizendo *"abra uma
 * animação"* com a animação aberta. A forma: *acrescentei uma seção à tela e
 * não à assinatura que decide quando a tela se refaz.*
 *
 * O instante só entra quando a seção o mostra — uma animação aberta e alguma
 * etiqueta —, para a lista não se refazer a cada quadro por nada.
 */
export function varsShape(
  file: BoneFile, animation: string | null, time: number,
): Array<Array<string | number | boolean | null>> {
  const ligado = varsOn();
  const out: Array<Array<string | number | boolean | null>> = [['vars', ligado]];
  if (!ligado) {
    out.push(['conta', (file.variables ?? []).length, (file.tags ?? []).length]);
    return out;
  }
  out.push(['animacao', animation]);
  for (const v of variableRows(file)) {
    out.push(['v', v.name, v.type, String(v.value), v.keyedIn.join(','), v.problems.join(';')]);
  }
  const tags = tagRows(file, animation, time);
  for (const t of tags) {
    out.push(['t', t.name, t.wholeAnimation, t.activeNow, t.usedIn.join(','), t.problems.join(';')]);
  }
  if (animation !== null && tags.length > 0) {
    out.push(['agora', Math.round(time * 100), activeTagsAt(file, animation, time).join(',')]);
  }
  return out;
}

/**
 * **Chaveia a etiqueta no instante do cursor** e mostra a chave — decisão P12.
 *
 * Uma chave `tag` com a lista inteira daquele momento (§8.5 — *"tags ativas
 * daquele instante até a próxima chave"*), e não só a etiqueta clicada. Morava
 * no painel; veio para cá para o teste alcançá-la sem tela (regra 8).
 *
 * Depois de gravar, `revealKey` abre os Detalhes da linha do tempo, escolhe a
 * chave e rola até ela: a régua do arroz, *"o que eu criei apareceu na tela?"*.
 * Devolve a lista gravada e o instante, ou `null` quando não há animação aberta.
 */
export function keyTagHere(doc: EditorDoc, name: string): { ordem: string[]; time: number } | null {
  const atual = new Set(activeTagKeyValue(doc.file, doc.animation, doc.time));
  if (atual.has(name)) atual.delete(name);
  else atual.add(name);
  const ordem = (doc.file.tags ?? []).filter((t) => atual.has(t));
  const saida = setPropertyOrKey(doc, tagTarget(), ordem as never, {
    label: `Etiquetas em ${doc.time.toFixed(2).replace('.', ',')} s`,
    kind: 'structure',
  });
  if (saida === 'recusado') return null;
  const time = roundTime(doc.time);
  revealKey({ target: tagTarget(), time });
  return { ordem, time };
}

/**
 * Liga e desliga a marca na **animação inteira** (§8.5 `animation.tags`).
 *
 * É a metade estática: ela vale do começo ao fim, e não tem chave. A outra
 * metade — "a partir deste instante" — é uma chave na timeline `tag`, e passa
 * pelo caminho de sempre (`setPropertyOrKey`).
 */
export class ToggleAnimationTag implements Command {
  readonly label = 'Etiqueta na animação inteira';
  readonly kind: ChangeKind = 'structure';
  private before: string[] | undefined;
  private had = false;

  constructor(private readonly animation: string, private readonly tag: string) {}

  apply(doc: EditorDoc): void {
    const body = findAnimation(doc.file, this.animation) as { tags?: string[] } | null;
    if (body === null) return;
    this.had = Array.isArray(body.tags);
    this.before = this.had ? [...body.tags!] : undefined;
    const atual = new Set(body.tags ?? []);
    if (atual.has(this.tag)) atual.delete(this.tag);
    else atual.add(this.tag);
    // A ordem gravada é a da declaração, e não a dos cliques: assim o arquivo
    // não muda quando ninguém mudou nada de verdade.
    const ordem = (doc.file.tags ?? []).filter((t) => atual.has(t));
    if (ordem.length === 0 && !this.had) delete body.tags;
    else body.tags = ordem;
  }

  revert(doc: EditorDoc): void {
    const body = findAnimation(doc.file, this.animation) as { tags?: string[] } | null;
    if (body === null) return;
    if (this.had) body.tags = this.before!;
    else delete body.tags;
  }
}

/** Devolve o arquivo inteiro ao texto guardado, sem trocar o objeto. */
function restore(doc: EditorDoc, saved: string): void {
  const before = JSON.parse(saved) as BoneFile;
  const file = doc.file as unknown as Record<string, unknown>;
  for (const key of Object.keys(file)) delete file[key];
  Object.assign(file, before);
}

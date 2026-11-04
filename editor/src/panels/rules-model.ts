/**
 * A conta da aba **Regras** (dono C) — lote 28, anotação 13.
 *
 * Nas palavras do Humberto, 09/09/2026: *"entendi as 5 regras. Mas não sei como
 * usar, e está escondido."*
 *
 * A varredura no código achou pior do que "escondido": **pela tela não dava
 * para montar uma regra de IK de dois ossos**, que é a do próprio manual.
 *
 * | O que havia | O problema |
 * |:---|:---|
 * | `buildConstraint` grava `bones: [primeiro osso]` | cadeia de **um** osso, mesmo com dois escolhidos. Perna de IK não dobra |
 * | `target` = "o primeiro osso do arquivo fora da cadeia" | ninguém perguntou. Pode cair num osso sem relação nenhuma |
 * | Propriedades da regra: Nome, Força, Alvo, Dobra, Encolhe, Estica, Suavidade | **não tem o campo da cadeia**. Não dava para pôr o segundo osso depois |
 * | alvo igual a um osso da cadeia | nada impedia, e o manual diz que não pode |
 *
 * **Nenhum campo novo no formato**: `bones`, `target`, `mix` e os demais já
 * existem na §6. O que faltava era a tela e as perguntas.
 *
 * Sem DOM. A tela é do `rules.ts`.
 */

import type { BoneFile, ConstraintDef, DriverTargetDef, NumericKeys } from '../../../runtime/src/index.js';
// Rodada final, lote 3: o valor de agora de um alvo sai da MESMA conta do jogo.
import { evaluateNumber } from '../../../runtime/src/index.js';
import type { ChangeKind, Command, EditorDoc } from '../contract.js';
import { uniqueName } from '../contract.js';
import { constraintTypeLabel } from './tree-model.js';

/** Os cinco tipos, na ordem em que aparecem na janela de criar. */
export type RuleType = 'ik' | 'transform' | 'path' | 'physics' | 'driver';

export const RULE_TYPES: readonly RuleType[] = Object.freeze([
  'ik', 'transform', 'path', 'physics', 'driver',
]);

/**
 * O que cada tipo de regra faz, **em palavras simples**, com o exemplo do herói.
 *
 * Ele leu a lista de cinco e entendeu os nomes; o que faltava era saber o que
 * fazer com eles. A frase de cada janela é esta, e ela cita o `heroi.bone`,
 * que é o arquivo que está na pasta e que ele pode abrir para ver funcionando.
 */
export interface RuleTypeInfo {
  type: RuleType;
  /** O nome do tipo, o mesmo do resto do editor. */
  label: string;
  /** O ícone em `ui/icons.ts`. */
  icon: string;
  /** Uma frase: o que esta regra faz. */
  what: string;
  /** Uma frase: o exemplo do herói. */
  example: string;
  /** `true` nos três tipos que têm uma cadeia de ossos. */
  hasChain: boolean;
}

export const RULE_INFO: Readonly<Record<RuleType, RuleTypeInfo>> = Object.freeze({
  ik: {
    type: 'ik',
    label: constraintTypeLabel('ik'),
    icon: 'rule-ik',
    what: 'Os ossos dobram sozinhos para alcançar um alvo. É como se põe o pé no chão.',
    example: 'No herói: `ik_arm` faz o braço perseguir a mão.',
    hasChain: true,
  },
  transform: {
    type: 'transform',
    label: constraintTypeLabel('transform'),
    icon: 'rule-transform',
    what: 'Um osso copia a posição, o giro ou a escala de outro.',
    example: 'No herói: `head_lean` faz a cabeça acompanhar o tronco.',
    hasChain: true,
  },
  path: {
    type: 'path',
    label: constraintTypeLabel('path'),
    icon: 'rule-path',
    what: 'Os ossos deslizam por cima de um caminho desenhado.',
    example: 'No herói: `cape_follow` faz a capa correr pelo caminho dela.',
    hasChain: true,
  },
  physics: {
    type: 'physics',
    label: constraintTypeLabel('physics'),
    icon: 'rule-physics',
    what: 'Um osso balança sozinho, com peso, vento e gravidade.',
    example: 'No herói: `hair_physics` faz o cabelo balançar.',
    hasChain: false,
  },
  driver: {
    type: 'driver',
    label: constraintTypeLabel('driver'),
    icon: 'rule-driver',
    what: 'Um número de fora (um parâmetro) mexe em outra coisa.',
    example: 'No herói: `look_driver` gira os olhos pelo parâmetro de olhar.',
    hasChain: false,
  },
});

// ---------------------------------------------------------------------------
// Ler uma regra
// ---------------------------------------------------------------------------

/** A cadeia de ossos da regra, na ordem gravada. Vazia nos tipos sem cadeia. */
export function chainOf(def: ConstraintDef): string[] {
  const withChain = def as { bones?: unknown; bone?: unknown };
  if (Array.isArray(withChain.bones)) return withChain.bones.filter((b) => typeof b === 'string');
  if (typeof withChain.bone === 'string') return [withChain.bone];
  return [];
}

/** O alvo da regra, ou `null` nos tipos que não têm um. */
export function targetOf(def: ConstraintDef): string | null {
  const alvo = (def as { target?: unknown }).target;
  return typeof alvo === 'string' && alvo !== '' ? alvo : null;
}

/** A força da regra. Sem `mix` escrito, o formato diz 1 (§6). */
export function mixOf(def: ConstraintDef): number {
  const mix = (def as { mix?: unknown }).mix;
  return typeof mix === 'number' && Number.isFinite(mix) ? mix : 1;
}

/** Uma linha da aba Regras. */
export interface RuleRow {
  name: string;
  type: string;
  typeLabel: string;
  icon: string;
  /** Os ossos que a regra mexe, na ordem. */
  chain: string[];
  /** O alvo, ou `null`. */
  target: string | null;
  /** A força de agora, de 0 a 1. */
  mix: number;
  /** `true` quando `mix` é zero: a regra está desligada, mas não apagada. */
  off: boolean;
  /**
   * O que está errado nesta regra, em português, ou `[]`.
   *
   * A alça da regra na cena só aparece quando o alvo e os ossos existem; um
   * nome errado fazia a regra **sumir sem aviso**. Aqui ela fica na lista, em
   * vermelho, dizendo qual nome não existe.
   */
  problems: string[];
}

/**
 * O que falta numa regra **Comando** para ela fazer alguma coisa — defeito A4.
 *
 * Os dois modos da §8.2 são exclusivos: ou `targets` (com pelo menos um), ou
 * `animation`. Sem nenhum dos dois a regra é uma casca: o validador a recusa
 * (L1) e o runtime a ignora. Dizer isso na lista é mais barato que descobrir
 * depois de animar meia hora.
 */
export function driverProblems(def: ConstraintDef, file?: BoneFile): string[] {
  const d = def as { parameter?: unknown; targets?: unknown; animation?: unknown };
  const problems: string[] = [];
  if (typeof d.parameter !== 'string' || d.parameter === '') {
    problems.push('esta regra Comando não lê parâmetro nenhum');
  } else if (file !== undefined
    && !(file.parameters ?? []).some((p) => p.name === d.parameter)) {
    // Porta D3: apagar o parâmetro deixava a regra apontando para um nome que
    // não existe, e o runtime a ignora em silêncio. A lista diz qual sumiu.
    problems.push(`o parâmetro "${String(d.parameter)}" não existe`);
  }
  const alvos = Array.isArray(d.targets) ? d.targets.length : 0;
  const animacao = typeof d.animation === 'string' && d.animation !== '';
  if (alvos === 0 && !animacao) {
    problems.push('esta regra Comando não manda em nada: escolha os alvos, ou a animação, em Propriedades');
  }
  if (alvos > 0 && animacao) {
    problems.push('esta regra Comando tem alvos E animação: a spec pede um dos dois');
  }
  return problems;
}

/** O ícone do tipo, ou o genérico quando o tipo não é um dos cinco. */
function iconFor(type: string): string {
  const info = RULE_INFO[type as RuleType];
  return info === undefined ? 'rule-ik' : info.icon;
}

/** As linhas da aba, na ordem do arquivo. */
export function ruleRows(file: BoneFile): RuleRow[] {
  const bones = new Set((file.bones ?? []).map((b) => b.name));
  const slots = new Set((file.slots ?? []).map((s) => s.name));
  return (file.constraints ?? []).map((def) => {
    const chain = chainOf(def);
    const target = targetOf(def);
    const problems: string[] = [];
    // Cadeia vazia: a regra existe e não faz nada. Ela some da cena sem aviso,
    // e era assim que uma IK mal criada passava despercebida.
    if (chain.length === 0 && def.type !== 'driver') {
      problems.push('esta regra não tem osso nenhum');
    }
    // Defeito A4 (degrau 9, 18/09/2026): a regra **Comando** nascia com
    // `targets: []`, sem animação e às vezes sem parâmetro. Ela existia, não
    // fazia nada, e nada na tela dizia isso — quem a criou ficava mexendo nos
    // valores esperando ver o boneco andar. A spec (§8.2) pede **um** dos dois
    // modos, com pelo menos um alvo; enquanto nenhum estiver escolhido, a
    // linha fica em vermelho como qualquer outro nome que não existe.
    if (def.type === 'driver') {
      for (const problem of driverProblems(def, file)) problems.push(problem);
    }
    for (const bone of chain) {
      if (!bones.has(bone)) problems.push(`o osso "${bone}" não existe`);
    }
    if (target !== null) {
      // A regra de caminho aponta para um SLOT, e não para um osso: o alvo
      // dela é o desenho do caminho (§6.3).
      const conhecido = def.type === 'path' ? slots.has(target) : bones.has(target);
      if (!conhecido) {
        problems.push(def.type === 'path'
          ? `o slot "${target}" não existe`
          : `o osso "${target}" não existe`);
      }
    }
    if (target !== null && chain.includes(target)) {
      problems.push('o alvo não pode ser um dos ossos que dobram');
    }
    const mix = mixOf(def);
    return {
      name: def.name,
      type: def.type,
      typeLabel: constraintTypeLabel(def.type),
      icon: iconFor(def.type),
      chain,
      target,
      mix,
      off: mix === 0,
      problems,
    };
  });
}

// ---------------------------------------------------------------------------
// A janela guiada
// ---------------------------------------------------------------------------

/** O que a janela de "Nova regra" devolve. */
export interface NewRulePlan {
  type: RuleType;
  /** Os ossos que a regra mexe, na ordem pai → filho. */
  chain: string[];
  /** O alvo: um osso, ou o slot do caminho. Vazio nos tipos sem alvo. */
  target: string;
  /** Só na IK: para que lado a cadeia dobra. */
  bendPositive?: boolean;
  /** Só no comando: qual parâmetro manda. */
  parameter?: string;
  /**
   * Só no comando: **em que osso ele manda** — degrau 12, porta D3.
   *
   * A regra nascia com `targets: []`, e o runtime ignora regra sem alvo
   * (`constraints/driver.ts`: `if (data.targets.length === 0) this.active =
   * false`). Quem criava um slider via a regra na lista e não via efeito
   * nenhum. A janela passou a perguntar, e a regra nasce mandando.
   */
  driverBone?: string;
  /** Só no comando: que propriedade do osso ele mexe. */
  driverProperty?: string;
}

/**
 * O que está errado com o plano, em português, ou `null`.
 *
 * A janela **não fecha** com erro. Uma janela que fecha e depois mostra um
 * aviso no rodapé faz a pessoa refazer o caminho todo para consertar uma
 * palavra.
 */
export function validateNewRule(file: BoneFile, plan: NewRulePlan): string | null {
  const bones = new Set((file.bones ?? []).map((b) => b.name));
  const slots = new Set((file.slots ?? []).map((s) => s.name));
  const info = RULE_INFO[plan.type];

  if (info.hasChain || plan.type === 'physics') {
    if (plan.chain.length === 0) return 'Escolha ao menos um osso.';
    for (const bone of plan.chain) {
      if (!bones.has(bone)) return `O osso "${bone}" não existe.`;
    }
    if (new Set(plan.chain).size !== plan.chain.length) {
      return 'O mesmo osso está na cadeia duas vezes.';
    }
  }
  if (plan.type === 'ik' && plan.chain.length > 2) {
    return 'Uma regra de IK dobra um ou dois ossos. Escolha até dois.';
  }

  if (plan.type === 'path') {
    if (plan.target === '') return 'Escolha o caminho por onde os ossos deslizam.';
    if (!slots.has(plan.target)) return `O slot "${plan.target}" não existe.`;
    return null;
  }

  if (info.hasChain) {
    if (plan.target === '') return 'Escolha o osso que eles perseguem.';
    if (!bones.has(plan.target)) return `O osso "${plan.target}" não existe.`;
    // A frase é a do plano, e é a frase que ele vai ler na janela.
    if (plan.chain.includes(plan.target)) {
      return 'O alvo não pode ser um dos ossos que dobram.';
    }
  }

  if (plan.type === 'driver') {
    if ((plan.parameter ?? '') === '') return 'Escolha o parâmetro que manda na regra.';
    // Porta D3: sem osso a regra nasceria com `targets: []`, e o runtime a
    // ignora. A janela não fecha sem a resposta — é mais barato perguntar
    // agora que deixar a pessoa procurar um efeito que nunca vem.
    if ((plan.driverBone ?? '') === '') return 'Escolha o osso em que o comando manda.';
    if (!bones.has(plan.driverBone!)) return `O osso "${plan.driverBone}" não existe.`;
    if (!DRIVER_PROPERTIES.some((o) => o.value === (plan.driverProperty ?? ''))) {
      return 'Escolha a propriedade que o comando mexe.';
    }
  }
  return null;
}

/**
 * O que a regra recém-criada **já faz**, em uma frase, ou `null`.
 *
 * Era o contrário: até o degrau 12 o Comando nascia com `targets: []` e a
 * frase avisava *"ela ainda não manda em nada"*. Isso descrevia o defeito em
 * vez de consertá-lo. Agora a janela pergunta o osso e a propriedade, a regra
 * nasce **mandando**, e a frase diz de quanto até quanto — para a pessoa saber
 * o que vai ver ao arrastar a barra, e onde mudar os números.
 */
export function newRuleNotice(plan: NewRulePlan): string | null {
  if (plan.type !== 'driver') return null;
  const property = plan.driverProperty ?? '';
  const label = DRIVER_PROPERTIES.find((o) => o.value === property)?.label ?? property;
  const span = DRIVER_SPAN[property] ?? 1;
  return `ela mexe "${label.toLowerCase()}" de ${fmt(-span)} a ${fmt(span)} em "${plan.driverBone ?? ''}"`
    + ' — os números estão em Propriedades';
}

/** Um número do jeito que ele se lê em português: vírgula, sem casa à toa. */
function fmt(value: number): string {
  return String(Math.round(value * 1000) / 1000).replace('.', ',');
}

/** O nome que a regra nova vai ter, já livre. */
const RULE_PREFIX: Record<RuleType, string> = {
  ik: 'ik',
  transform: 'transformar',
  path: 'caminho',
  physics: 'fisica',
  driver: 'comando',
};

/**
 * Cria a regra **como a janela perguntou**.
 *
 * O `AddConstraint` do `tree-model.ts` continua existindo para o "Novo ▾ →
 * Regra", e continua adivinhando: um osso e um alvo qualquer. Este aqui não
 * adivinha nada — cada campo dele foi respondido.
 */
export class AddGuidedRule implements Command {
  readonly label: string;
  readonly kind: ChangeKind = 'structure';
  readonly name: string;

  constructor(file: BoneFile, private readonly plan: NewRulePlan) {
    this.name = uniqueName(
      RULE_PREFIX[plan.type],
      (file.constraints ?? []).map((c) => c.name),
    );
    this.label = `Nova regra de ${RULE_INFO[plan.type].label}`;
  }

  apply(doc: EditorDoc): void {
    const list = doc.file.constraints ?? (doc.file.constraints = []);
    list.push(buildFromPlan(this.name, this.plan, parameterRange(doc.file, this.plan.parameter ?? '')));
  }

  revert(doc: EditorDoc): void {
    const list = doc.file.constraints ?? [];
    const at = list.findIndex((c) => c.name === this.name);
    if (at >= 0) list.splice(at, 1);
  }
}

/** A faixa de um parâmetro (§8.1), com os padrões do formato. */
export function parameterRange(file: BoneFile, name: string): { min: number; max: number } {
  const p = (file.parameters ?? []).find((x) => x.name === name) as
    { min?: number; max?: number } | undefined;
  const min = typeof p?.min === 'number' && Number.isFinite(p.min) ? p.min : 0;
  const max = typeof p?.max === 'number' && Number.isFinite(p.max) ? p.max : 1;
  return max > min ? { min, max } : { min, max: min + 1 };
}

/** A regra que o plano descreve. Exportada para o teste ler sem rodar comando. */
export function buildFromPlan(
  name: string, plan: NewRulePlan, range: { min: number; max: number } = { min: -1, max: 1 },
): ConstraintDef {
  switch (plan.type) {
    case 'ik':
      return {
        type: 'ik',
        name,
        bones: [...plan.chain],
        target: plan.target,
        mix: 1,
        bendPositive: plan.bendPositive ?? true,
      };
    case 'transform':
      return { type: 'transform', name, bones: [...plan.chain], target: plan.target, mix: 1 };
    case 'path':
      return { type: 'path', name, bones: [...plan.chain], target: plan.target, mix: 1 };
    case 'physics':
      return { type: 'physics', name, bone: plan.chain[0] ?? '', mix: 1, rotation: 1 };
    case 'driver':
    default:
      return {
        type: 'driver', name, parameter: plan.parameter ?? '', mix: 1,
        targets: [bornDriverTarget(plan.driverBone ?? '', plan.driverProperty ?? 'rotation', range)],
      };
  }
}

// ---------------------------------------------------------------------------
// D3 — o alvo com que o Comando nasce
// ---------------------------------------------------------------------------

/**
 * As propriedades de osso que um alvo de `driver` sabe mexer (§8.2 + §9.1).
 *
 * São as sete numéricas da pose aplicada. `inherit*` é booleano e não
 * interpola; ele existe no formato e fica para quem editar o alvo à mão, e não
 * na pergunta da janela — uma pergunta que oferece o que quase nunca serve é
 * uma pergunta que atrapalha.
 */
export const DRIVER_PROPERTIES: readonly { value: string; label: string }[] = Object.freeze([
  { value: 'rotation', label: 'Rotação' },
  { value: 'x', label: 'Posição X' },
  { value: 'y', label: 'Posição Y' },
  { value: 'scaleX', label: 'Escala X' },
  { value: 'scaleY', label: 'Escala Y' },
  { value: 'shearX', label: 'Inclinação X' },
  { value: 'shearY', label: 'Inclinação Y' },
]);

/**
 * De quanto o alvo recém-criado varia, por propriedade.
 *
 * **Não é palpite silencioso** (regra 21): o número aparece no rodapé na hora
 * da criação, aparece escrito em Propriedades, e se muda ali. O que ele evita
 * é a regra que nasce com duas chaves iguais — válida, rodando, e sem efeito
 * nenhum na tela, que é o mesmo engano com outra cara.
 *
 * Trinta graus é um giro que se vê; trinta pixels, um passo; 0,3 de escala,
 * um terço a mais. `mode: 'add'` soma ao setup, então os números são desvio e
 * não valor absoluto — 0 no meio da faixa deixa o osso onde ele está.
 */
export const DRIVER_SPAN: Readonly<Record<string, number>> = Object.freeze({
  rotation: 30, x: 30, y: 30, scaleX: 0.3, scaleY: 0.3, shearX: 30, shearY: 30,
});

/**
 * O alvo com que uma regra Comando nasce: um osso, uma propriedade, e as duas
 * pontas da faixa do parâmetro.
 *
 * `input` são o `min` e o `max` **daquele** parâmetro (§8.1), lidos do arquivo
 * e não supostos: uma faixa de 0 a 100 põe as chaves em 0 e em 100. Fora das
 * chaves a §8.2 manda travar na primeira ou na última, então a barra anda até
 * a ponta e para — nunca dá valor inventado.
 */
export function bornDriverTarget(
  bone: string, property: string, range: { min: number; max: number } = { min: -1, max: 1 },
): DriverTargetDef {
  const span = DRIVER_SPAN[property] ?? 1;
  return {
    type: 'bone', target: bone, property, mode: 'add',
    keys: [{ input: range.min, value: -span }, { input: range.max, value: span }],
  };
}

// ---------------------------------------------------------------------------
// Mexer numa regra que já existe
// ---------------------------------------------------------------------------

/**
 * Troca a cadeia de ossos de uma regra — o campo que faltava em Propriedades.
 *
 * É por aqui que uma IK de um osso vira uma de dois **depois** de criada. Sem
 * ele, a única saída era apagar a regra e fazer outra.
 */
export class SetRuleChain implements Command {
  readonly label = 'Ossos da cadeia';
  readonly kind: ChangeKind = 'structure';
  private before: string[] = [];
  private wasSingle = false;

  constructor(private readonly rule: string, private readonly chain: readonly string[]) {}

  apply(doc: EditorDoc): void {
    const def = find(doc.file, this.rule);
    if (def === null) return;
    this.before = chainOf(def);
    const alvo = def as { bones?: string[]; bone?: string };
    this.wasSingle = alvo.bones === undefined;
    if (this.wasSingle) alvo.bone = this.chain[0] ?? '';
    else alvo.bones = [...this.chain];
  }

  revert(doc: EditorDoc): void {
    const def = find(doc.file, this.rule);
    if (def === null) return;
    const alvo = def as { bones?: string[]; bone?: string };
    if (this.wasSingle) alvo.bone = this.before[0] ?? '';
    else alvo.bones = [...this.before];
  }
}

/**
 * **Trocar os ossos** — a porta do `SetRuleChain`, rodada final, lote 2
 * (28/09/2026).
 *
 * O plano da troca: a cadeia nova **na ordem do arquivo** (pai → filho, que é
 * o que a IK precisa, e que a criação já fazia), ou a frase do que impede. A
 * régua é a MESMA da criação (`validateNewRule`), com o alvo que a regra tem
 * agora: uma troca que a janela de criar recusaria é recusada aqui também.
 *
 * O modelo é o lápis do Spine (`REFERENCIA regras 2026-09-28.md`, lote 2).
 */
export function chainChange(
  file: BoneFile, rule: string, picked: readonly string[],
): string[] | string {
  const def = find(file, rule);
  if (def === null) return `A regra "${rule}" não existe.`;
  const type = def.type as RuleType;
  // Regra 21: um tipo que o editor não conhece não ganha palpite de cadeia.
  if (!RULE_TYPES.includes(type)) return `O tipo "${String(def.type)}" não é um dos cinco que o editor conhece.`;
  if (type === 'driver') return 'A regra Comando não tem ossos de cadeia: ela manda pelo parâmetro.';
  const ordem = (file.bones ?? []).map((b) => b.name);
  const chain = ordem.filter((name) => picked.includes(name));
  // Um nome que não está no arquivo fica na lista, para a régua dizer qual é.
  for (const name of picked) if (!ordem.includes(name)) chain.push(name);
  if (type === 'physics' && chain.length > 1) return 'A física balança um osso só. Escolha um.';
  const problema = validateNewRule(file, { type, chain, target: targetOf(def) ?? '' });
  return problema ?? chain;
}

/** A frase do rodapé depois da troca. */
export function chainChangeNotice(rule: string, before: readonly string[], after: readonly string[]): string {
  if (before.join('\u0000') === after.join('\u0000')) return `Os ossos de "${rule}" ficaram como estavam`;
  return `Regra "${rule}": ${before.join(' → ') || 'nenhum osso'} agora é ${after.join(' → ')}`;
}

/**
 * A força que cada regra tinha **antes de ser desligada**.
 *
 * Desligar é `mix` zero, e o zero apaga o número que estava lá. Sem esta
 * memória, ligar de volta devolveria `1` — o padrão do formato, e quase nunca
 * o que a pessoa tinha ajustado. Um `mix` de 0,4 ajustado a dedo voltaria 1 e
 * a cena mudaria sem ninguém pedir.
 *
 * Ela é da **sessão**, e não do arquivo: nenhum campo novo no formato (regra 7
 * da casa), e uma regra que nasce desligada no arquivo volta em 1, que é o
 * único palpite honesto.
 */
const rememberedMix = new Map<string, number>();

/** Esquece as forças guardadas. Para o teste começar limpo. */
export function forgetRuleMix(): void {
  rememberedMix.clear();
}

/**
 * O olho da lista: liga e desliga a regra **sem apagar a força**.
 *
 * Desligar guarda o valor e escreve zero. Ligar devolve o valor guardado.
 * Desfazer devolve o que estava, nos dois sentidos.
 */
export class ToggleRule implements Command {
  readonly label = 'Ligar e desligar a regra';
  readonly kind: ChangeKind = 'structure';
  private before = 1;

  constructor(private readonly rule: string) {}

  apply(doc: EditorDoc): void {
    const def = find(doc.file, this.rule);
    if (def === null) return;
    const agora = mixOf(def);
    this.before = agora;
    if (agora === 0) {
      (def as { mix?: number }).mix = rememberedMix.get(this.rule) ?? 1;
      return;
    }
    rememberedMix.set(this.rule, agora);
    (def as { mix?: number }).mix = 0;
  }

  revert(doc: EditorDoc): void {
    const def = find(doc.file, this.rule);
    if (def === null) return;
    (def as { mix?: number }).mix = this.before;
  }
}

/** Escreve a força da regra, pela barra da lista. */
export class SetRuleMix implements Command {
  readonly label = 'Força da regra';
  readonly kind: ChangeKind = 'structure';
  private before = 1;

  constructor(private readonly rule: string, private readonly mix: number) {}

  apply(doc: EditorDoc): void {
    const def = find(doc.file, this.rule);
    if (def === null) return;
    this.before = mixOf(def);
    (def as { mix?: number }).mix = Math.min(1, Math.max(0, this.mix));
  }

  revert(doc: EditorDoc): void {
    const def = find(doc.file, this.rule);
    if (def === null) return;
    (def as { mix?: number }).mix = this.before;
  }
}

function find(file: BoneFile, name: string): ConstraintDef | null {
  return (file.constraints ?? []).find((c) => c.name === name) ?? null;
}

/** Os ossos que TÊM regra, para a Árvore marcar cada um com um ícone. */
export function bonesWithRules(file: BoneFile): Set<string> {
  const out = new Set<string>();
  for (const def of file.constraints ?? []) {
    for (const bone of chainOf(def)) out.add(bone);
  }
  return out;
}

// A frase do rodapé da ferramenta Posar mora no `ui/toolbar-model.ts`, junto
// com as outras frases de rodapé — é texto de tela, e não conta de regra.

// ---------------------------------------------------------------------------
// D3 — os parâmetros (§8.1), a porta que faltava
// ---------------------------------------------------------------------------

/**
 * **A ficha de um parâmetro**, para a lista e para Propriedades — degrau 12.
 *
 * O parâmetro já existia no formato, o runtime já o lia (`parameters.ts`), e o
 * editor já sabia **criar** um (`AddParameter`, do menu Novo ▾). Só que depois
 * de criado ele não aparecia em lugar nenhum: nem na Árvore, nem em
 * Propriedades, nem em lista alguma. Nascia e sumia.
 *
 * Os três programas, antes de decidir onde ele mora:
 *
 * | Programa | O que faz |
 * |:---|:---|
 * | **Spriter** | não tem parâmetro. Tem *variáveis*, numa janela à parte do objeto |
 * | **Spine** (4.3) | o **Slider** é um item da árvore, com uma barra na própria linha; a ficha (mín., máx., padrão) abre no painel de propriedades da direita |
 * | **DragonBones** | não tem |
 *
 * Seguimos o Spine, que é o único dos três que tem a coisa: **linha com barra
 * + ficha em Propriedades**. A lista mora na aba Regras, e não numa aba nova,
 * porque é a regra Comando que lê o parâmetro — as duas se leem juntas, e uma
 * aba nova custaria uma coluna de tela que a medição já acusa apertada.
 */
export interface ParameterRow {
  name: string;
  /** O nome para ler, quando o arquivo traz um (§8.1 `displayName`). */
  label: string;
  /** A pasta do editor (§8.1 `group`), ou `null`. */
  group: string | null;
  min: number;
  max: number;
  /** O valor de agora: o `default`, que é o que a setup pose usa. */
  value: number;
  repeat: boolean;
  /**
   * `true` quando um **osso** manda no valor (§8.1 `source`).
   *
   * A barra não se arrasta nesse caso, e ela diz por quê: o valor é conta do
   * osso, e escrever nela seria escrever um número que o runtime joga fora no
   * quadro seguinte — um controle que parece funcionar e não funciona.
   */
  driven: boolean;
  /** As regras Comando que leem este parâmetro, na ordem do arquivo. */
  usedBy: string[];
  /** O que está errado, em português, ou `[]`. */
  problems: string[];
}

function numberAt(bag: Record<string, unknown>, key: string, fallback: number): number {
  const value = bag[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/** As linhas da lista de parâmetros, na ordem do arquivo. */
export function parameterRows(file: BoneFile): ParameterRow[] {
  const bones = new Set((file.bones ?? []).map((b) => b.name));
  const drivers = (file.constraints ?? []).filter((c) => c.type === 'driver');
  const keyed = new Set<string>();
  // `file.animations` é um array de `{ name, timelines }` (§4.6).
  for (const animation of file.animations ?? []) {
    const timelines = (animation as { timelines?: Array<{ type?: string; target?: string }> })
      .timelines ?? [];
    for (const tl of timelines) {
      if (tl.type === 'parameter' && typeof tl.target === 'string') keyed.add(tl.target);
    }
  }
  return (file.parameters ?? []).map((raw) => {
    const p = raw as unknown as Record<string, unknown>;
    const name = String(p['name'] ?? '');
    const min = numberAt(p, 'min', 0);
    const max = numberAt(p, 'max', 1);
    const value = numberAt(p, 'default', 0);
    const source = p['source'] as Record<string, unknown> | undefined;
    const problems: string[] = [];
    // §8.1: `max > min` é L1. Sem isso o runtime trava tudo no `min` e a barra
    // fica de enfeite — quem arrasta não vê nada e não sabe por quê.
    if (!(max > min)) problems.push('o máximo tem de ser maior que o mínimo');
    if (max > min && (value < min || value > max)) {
      problems.push(`o padrão ${value} está fora da faixa de ${min} a ${max}`);
    }
    if (source !== undefined) {
      const bone = String(source['bone'] ?? '');
      if (!bones.has(bone)) problems.push(`o osso "${bone}" não existe`);
      if (numberAt(source, 'to', 1) === numberAt(source, 'from', 0)) {
        problems.push('a faixa lida do osso é vazia: "De" e "Até" são o mesmo número');
      }
      // §8.1, última linha: um parâmetro com `source` **NÃO DEVE** ter timeline.
      if (keyed.has(name)) {
        problems.push('este parâmetro é dirigido por um osso e mesmo assim tem chaves (§8.1)');
      }
    }
    const usedBy = drivers
      .filter((c) => (c as { parameter?: unknown }).parameter === name)
      .map((c) => c.name);
    // Regra 21: um parâmetro que ninguém lê é uma barra que não move nada.
    // Não é erro de formato — é a informação que falta para entender a tela.
    if (usedBy.length === 0) {
      problems.push('nenhuma regra Comando lê este parâmetro: ele ainda não mexe em nada');
    }
    return {
      name,
      label: typeof p['displayName'] === 'string' && p['displayName'] !== ''
        ? String(p['displayName']) : name,
      group: typeof p['group'] === 'string' && p['group'] !== '' ? String(p['group']) : null,
      min,
      max,
      value,
      repeat: p['repeat'] === true,
      driven: source !== undefined,
      usedBy,
      problems,
    };
  });
}

/** Uma linha só, pelo nome, ou `null`. */
export function parameterRow(file: BoneFile, name: string): ParameterRow | null {
  return parameterRows(file).find((p) => p.name === name) ?? null;
}

// ---------------------------------------------------------------------------
// D3 — os alvos de uma regra Comando (§8.2)
// ---------------------------------------------------------------------------

/** Uma chave de alvo: o valor do parâmetro, e o que a propriedade vale ali. */
export interface DriverKeyRow {
  input: number;
  value: number;
}

/** Um alvo de uma regra Comando, já lido. */
export interface DriverTargetRow {
  /** Posição no array `targets`, que é como o ponteiro JSON o acha. */
  index: number;
  type: string;
  target: string;
  property: string;
  /** `"replace"` leva ao valor; `"add"` soma o desvio em relação ao setup. */
  mode: string;
  keys: DriverKeyRow[];
  problems: string[];
}

/** Os alvos de uma regra Comando, na ordem do arquivo. */
export function driverTargets(file: BoneFile, rule: string): DriverTargetRow[] {
  const def = find(file, rule);
  if (def === null) return [];
  const list = (def as { targets?: unknown }).targets;
  if (!Array.isArray(list)) return [];
  const bones = new Set((file.bones ?? []).map((b) => b.name));
  return list.map((raw, index) => {
    const t = (raw ?? {}) as Record<string, unknown>;
    const type = String(t['type'] ?? 'bone');
    const target = String(t['target'] ?? '');
    const property = String(t['property'] ?? '');
    const rawKeys = Array.isArray(t['keys']) ? (t['keys'] as unknown[]) : [];
    const keys = rawKeys.map((k) => {
      const key = (k ?? {}) as Record<string, unknown>;
      return { input: numberAt(key, 'input', 0), value: numberAt(key, 'value', 0) };
    });
    const problems: string[] = [];
    if (type === 'bone' && !bones.has(target)) problems.push(`o osso "${target}" não existe`);
    // §8.2: mínimo 1 chave, ordenadas por `input` e sem repetição (L1).
    if (keys.length === 0) problems.push('este alvo não tem chave nenhuma');
    for (let i = 1; i < keys.length; i++) {
      if (keys[i]!.input <= keys[i - 1]!.input) {
        problems.push('as chaves têm de ir do menor para o maior, sem repetir');
        break;
      }
    }
    return { index, type, target, property, mode: String(t['mode'] ?? 'replace'), keys, problems };
  });
}

/** Acrescenta um alvo à regra Comando. */
export class AddDriverTarget implements Command {
  readonly label = 'Novo alvo do comando';
  readonly kind: ChangeKind = 'structure';

  constructor(
    private readonly rule: string,
    private readonly bone: string,
    private readonly property: string,
    private readonly range: { min: number; max: number },
  ) {}

  apply(doc: EditorDoc): void {
    const def = find(doc.file, this.rule);
    if (def === null) return;
    const bag = def as { targets?: unknown[] };
    bag.targets ??= [];
    bag.targets.push(bornDriverTarget(this.bone, this.property, this.range));
  }

  revert(doc: EditorDoc): void {
    const def = find(doc.file, this.rule);
    if (def === null) return;
    const bag = def as { targets?: unknown[] };
    bag.targets?.pop();
  }
}

/**
 * Tira um alvo da regra Comando.
 *
 * Tirar o **último** deixa a regra sem alvo nenhum, e o runtime a ignora — é
 * o mesmo buraco de nascença que a porta D3 fechou, só que feito à mão desta
 * vez. A regra continua na lista, em vermelho, com a frase de `driverProblems`
 * dizendo o que falta: quem esvaziou sabe o que fez, e vê o aviso.
 */
export class RemoveDriverTarget implements Command {
  readonly label = 'Tirar o alvo do comando';
  readonly kind: ChangeKind = 'structure';
  private saved: unknown = null;

  constructor(private readonly rule: string, private readonly at: number) {}

  apply(doc: EditorDoc): void {
    const def = find(doc.file, this.rule);
    if (def === null) return;
    const bag = def as { targets?: unknown[] };
    if (!Array.isArray(bag.targets)) return;
    this.saved = bag.targets[this.at];
    bag.targets.splice(this.at, 1);
  }

  revert(doc: EditorDoc): void {
    const def = find(doc.file, this.rule);
    if (def === null) return;
    const bag = def as { targets?: unknown[] };
    if (!Array.isArray(bag.targets)) return;
    bag.targets.splice(this.at, 0, this.saved);
  }
}

/**
 * Grava uma chave de alvo **no valor em que o parâmetro está agora** — o gesto
 * do Live2D e do Spine: ponha a barra onde quiser, pose o osso, grave.
 *
 * O `input` é o valor corrente do parâmetro (o `default`, que é o que a setup
 * pose usa e o que a barra da lista escreve). Uma chave já existente naquele
 * mesmo `input` é **substituída**, e não duplicada: a §8.2 proíbe `input`
 * repetido (L1), e duplicar daria um arquivo que o validador recusa.
 */
export class KeyDriverTarget implements Command {
  readonly label = 'Gravar a chave do comando';
  readonly kind: ChangeKind = 'structure';
  private before: unknown[] = [];

  constructor(
    private readonly rule: string,
    private readonly at: number,
    private readonly input: number,
    private readonly value: number,
  ) {}

  apply(doc: EditorDoc): void {
    const alvo = this.targetBag(doc);
    if (alvo === null) return;
    const keys = Array.isArray(alvo['keys']) ? (alvo['keys'] as unknown[]) : [];
    this.before = keys.map((k) => ({ ...(k as object) }));
    const rest = keys.filter((k) => (k as { input?: number }).input !== this.input);
    rest.push({ input: this.input, value: this.value });
    rest.sort((a, b) => ((a as { input: number }).input) - ((b as { input: number }).input));
    alvo['keys'] = rest;
  }

  revert(doc: EditorDoc): void {
    const alvo = this.targetBag(doc);
    if (alvo === null) return;
    alvo['keys'] = this.before;
  }

  private targetBag(doc: EditorDoc): Record<string, unknown> | null {
    const def = find(doc.file, this.rule);
    if (def === null) return null;
    const list = (def as { targets?: unknown[] }).targets;
    if (!Array.isArray(list)) return null;
    const alvo = list[this.at];
    return alvo !== null && typeof alvo === 'object'
      ? (alvo as Record<string, unknown>) : null;
  }
}

// ---------------------------------------------------------------------------
// Rodada final, lote 3 (29/09/2026) — a porta do `KeyDriverTarget`
// ---------------------------------------------------------------------------

/**
 * Um alvo do Comando, com o que ele vale **agora** — uma linha da janela
 * "Gravar a chave aqui".
 *
 * O modelo é o [+] do Live2D (`REFERENCIA regras 2026-09-28.md`, lote 3):
 * ponha a barra do parâmetro onde quiser e grave uma chave **naquele valor**.
 * Aqui o valor do alvo vem ESCRITO na janela — o número que ele dá agora — e
 * quem grava muda o número. Posar o osso na cena não serve: com a base aberta
 * isso mexe no setup, e o Comando soma por cima dele.
 */
export interface DriverKeyPlan {
  rule: string;
  /** Posição do alvo no array `targets`. */
  at: number;
  /** `look_driver → head, Rotação`. */
  label: string;
  /** O valor do parâmetro agora: o `input` da chave nova. */
  input: number;
  /** O que o alvo vale agora, pela conta do runtime (curvas inclusive), ou `null`. */
  now: number | null;
}

/**
 * Os alvos que leem o parâmetro, com o valor de agora — ou a frase que diz por
 * que não há o que gravar. Nunca uma lista vazia calada (regra 21).
 */
export function driverKeyPlans(doc: EditorDoc, parameter: string): DriverKeyPlan[] | string {
  const row = parameterRow(doc.file, parameter);
  if (row === null) return `O parâmetro "${parameter}" não existe.`;
  if (row.driven) {
    return `"${row.label}" vem do osso: o valor é conta da origem. Grave a chave em Propriedades, no número.`;
  }
  const regras = (doc.file.constraints ?? []).filter(
    (c) => c.type === 'driver' && (c as { parameter?: string }).parameter === parameter,
  );
  if (regras.length === 0) {
    return `Nenhuma regra Comando lê "${row.label}". Crie uma em Nova regra → Comando.`;
  }
  const out: DriverKeyPlan[] = [];
  for (const regra of regras) {
    for (const alvo of driverTargets(doc.file, regra.name)) {
      const prop = DRIVER_PROPERTIES.find((o) => o.value === alvo.property)?.label ?? alvo.property;
      out.push({
        rule: regra.name,
        at: alvo.index,
        label: `${regra.name} → ${alvo.target}, ${prop}`,
        input: row.value,
        now: targetValueNow(doc, regra.name, alvo.index, row.value),
      });
    }
  }
  if (out.length === 0) {
    return `A regra Comando que lê "${row.label}" ainda não manda em nada: dê um alvo a ela em Propriedades.`;
  }
  return out;
}

/** O que o alvo `at` da regra vale em `input`, pela conta do runtime. */
function targetValueNow(doc: EditorDoc, rule: string, at: number, input: number): number | null {
  const def = doc.data?.findConstraint(rule) as { targets?: ReadonlyArray<{ timeline: unknown }> | null } | null;
  const tl = def?.targets?.[at]?.timeline as { keys?: NumericKeys } | undefined;
  const keys = tl?.keys;
  if (keys === undefined || keys.components !== 1 || keys.times.length === 0) return null;
  return Math.round(evaluateNumber(keys, input) * 1000) / 1000;
}

/**
 * Renomeia um parâmetro **e arrasta quem o cita** — degrau 12, porta D3.
 *
 * Um parâmetro é citado de dois lugares: a regra Comando (`constraint.parameter`,
 * §8.2) e a timeline `parameter` (§9.9). Trocar o nome sem trocar os dois deixa
 * a regra lendo um nome que não existe — e o runtime ignora a regra, calado.
 *
 * Mora aqui e não no `panels/rename.ts` porque o `rename.ts` é de outra parte
 * (a Árvore) e esta rodada não escreve nela; o efeito é o mesmo, e o
 * `driverProblems` continua vermelho para o caso de alguém renomear por fora.
 *
 * Um nome já usado por outro parâmetro é recusado com o rodapé dizendo — dois
 * parâmetros com o mesmo nome são L1 (§8.1).
 */
export class RenameParameter implements Command {
  readonly label = 'Renomear o parâmetro';
  readonly kind: ChangeKind = 'structure';
  private applied = false;

  constructor(private readonly from: string, private readonly to: string) {}

  apply(doc: EditorDoc): void {
    const taken = (doc.file.parameters ?? []).some((p) => p.name === this.to);
    if (taken) {
      doc.notice(`Já existe um parâmetro chamado "${this.to}"`);
      this.applied = false;
      return;
    }
    this.applied = true;
    move(doc, this.from, this.to);
  }

  revert(doc: EditorDoc): void {
    if (!this.applied) return;
    move(doc, this.to, this.from);
  }
}

function move(doc: EditorDoc, from: string, to: string): void {
  for (const p of doc.file.parameters ?? []) if (p.name === from) p.name = to;
  for (const c of doc.file.constraints ?? []) {
    const d = c as { type: string; parameter?: string };
    if (d.type === 'driver' && d.parameter === from) d.parameter = to;
  }
  for (const animation of doc.file.animations ?? []) {
    const timelines = (animation as { timelines?: Array<{ type?: string; target?: string }> })
      .timelines ?? [];
    for (const tl of timelines) {
      if (tl.type === 'parameter' && tl.target === from) tl.target = to;
    }
  }
}

// ---------------------------------------------------------------------------
// A barra da aba Regras — rodada 17, PL-10 (05/10/2026)
// ---------------------------------------------------------------------------

/**
 * **O que o "Apagar" apaga**: o que está escolhido na lista — a regra, o
 * parâmetro ou a variável, nessa ordem. Eram três lixeiras iguais na barra,
 * e a pessoa tinha de saber qual era de quê pela dica. `null` = nada
 * escolhido, e o rodapé diz o que escolher.
 */
export type RulesDeleteTarget = 'regra' | 'parametro' | 'variavel';

export function rulesDeleteTarget(selection: {
  constraints: readonly string[]; parameters?: readonly string[]; variables?: readonly string[];
}): RulesDeleteTarget | null {
  if (selection.constraints.length > 0) return 'regra';
  if ((selection.parameters ?? []).length > 0) return 'parametro';
  if ((selection.variables ?? []).length > 0) return 'variavel';
  return null;
}

/** O que o **Novo ▾** da aba Regras cria, na ordem do menu. */
export const RULES_NEW_ITEMS = Object.freeze(['Regra…', 'Parâmetro', 'Variável', 'Etiqueta'] as const);

/** A frase do Apagar sem nada escolhido. */
export const RULES_DELETE_NOTHING = 'Escolha na lista a regra, o parâmetro ou a variável a apagar';

// ---------------------------------------------------------------------------
// As seções da aba dobram no título — Rodada 47, lote 6d (doc 90; o detalhe do conferente)
// ---------------------------------------------------------------------------

/** Uma seção da aba Regras (Parâmetros, Regras, Variáveis, Etiquetas), contada. */
export interface RulesSection {
  readonly title: string;
  readonly count: number;
  readonly chosen: boolean;
  readonly problem: boolean;
}

/**
 * **Quais seções da aba Regras ficam abertas.** A aba tinha 721 px de
 * conteúdo em 472 (1920×1080) e rolava como um corpo só. A regra da Malha e da
 * ficha: abre a seção de que a aba trata (Regras), a vazia (é curta e diz o que
 * a seção é), a que tem um item escolhido e a que tem problema; as outras dobram
 * no título, que diz quantas há dentro. O que a mão abriu ou fechou fica.
 */
export function sectionsOpen(
  sections: readonly RulesSection[],
  hand: ReadonlyMap<string, boolean> = new Map(),
): boolean[] {
  return sections.map((s) => {
    const mao = hand.get(s.title);
    if (mao !== undefined) return mao;
    return s.title === 'Regras' || s.count === 0 || s.chosen || s.problem;
  });
}

/** O título da seção dobrada: o nome e quantas há dentro ("Variáveis · 3"). */
export function sectionTitle(title: string, count: number): string {
  return count === 0 ? title : `${title} · ${count}`;
}

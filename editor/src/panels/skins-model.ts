/**
 * A conta da aba **Peles** (dono C) — lote 27, anotação 12.
 *
 * Nas palavras do Humberto, 09/09/2026: *"não sei onde estão as skins e como
 * faço para usar. Skin é importante, não deixa escondido."*
 *
 * Ele tinha razão três vezes: a pele morava em **três lugares** e em nenhum
 * deles inteira.
 *
 * | Onde | O que dava para fazer |
 * |:---|:---|
 * | Seção **Peles** da Árvore | ver os nomes e os anexos de cada uma |
 * | Painel **Exibição** | ligar "Mostrar" e escolher "Editar aqui" |
 * | **Novo ▾ → Pele**, na Árvore | criar |
 *
 * Quem procurava "onde ligo a armadura" tinha de saber que a resposta estava no
 * painel de exibição, que é onde moram grade, eixos e cebola. Agora é **uma aba
 * só**, na coluna da direita, ao lado de Animações e Histórico — o botão
 * **Char Maps** do Spriter, que fica à vista no alto do painel de animações.
 *
 * Sem DOM. A tela é do `skins.ts`.
 */

import type { BoneFile } from '../../../runtime/src/index.js';
import { findAtlasRegion } from '../../../runtime/src/index.js';
import type { ChangeKind, Command, EditorDoc } from '../contract.js';
import { restoreDef, snapshotDef, swapImage, type DefSnapshot } from '../io/pivot-model.js';
import { DEFAULT_SKIN, skinNames } from '../viewport/onion.js';
import { uniqueName } from '../contract.js';

/** Cópia funda por JSON, a mesma do `tree-model.ts`. */
function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Uma linha da aba Peles. */
export interface SkinRow {
  /** Nome como está escrito no arquivo. */
  name: string;
  /** `true` enquanto ela está na pilha, ou seja, sendo desenhada. */
  visible: boolean;
  /** `true` na única em que um anexo novo nasce. */
  editable: boolean;
  /** `true` na `default`. Desde o degrau 9 ela também sai da pilha (I10). */
  isDefault: boolean;
  /** Quantos slots esta pele veste. É o número que diz se ela é grande. */
  slots: number;
  /**
   * **A pele veio de fora** — degrau 9 (F23), spec 2.8.
   *
   * Ela mora noutro arquivo, citado em `assets.skins`, e entra neste corpo com
   * os ossos que traz. Liga, desliga e reordena como as outras; renomear e
   * apagar, não — quem manda nelas é o arquivo delas.
   */
  external?: boolean;
}

/** Quantos slots uma pele veste: um slot com dois desenhos conta uma vez. */
function slotsDressed(file: BoneFile, name: string): number {
  const attachments = (file.skins ?? []).find((skin) => skin.name === name)?.attachments ?? {};
  return Object.keys(attachments)
    .filter((slot) => Object.keys(attachments[slot] ?? {}).length > 0).length;
}

/**
 * **Feitas**: todas as peles do arquivo, na ordem do arquivo — degrau 9 (I7).
 *
 * A contagem é de **slots vestidos**, e não de anexos: um slot com a mão aberta
 * e a mão fechada na mesma pele é **um** lugar do corpo que essa pele veste, e
 * é isso que a pessoa está contando quando olha a lista.
 *
 * `stack` é a pilha (de baixo para cima) e `editing` é o lápis. Eram uma lista
 * só até o D8; ver `viewport/onion.ts`, seção "A pilha e o lápis".
 */
export function skinTabRows(
  file: BoneFile, stack: readonly string[], editing: string | null = null,
  /** As peles que o runtime montou e o arquivo não tem: as de fora (F23). */
  external: readonly string[] = [],
): SkinRow[] {
  const ativas = new Set(stack);
  const daqui = skinNames(file);
  const linha = (name: string, deFora: boolean): SkinRow => ({
    name,
    visible: ativas.has(name),
    editable: name === editing,
    isDefault: name === DEFAULT_SKIN,
    slots: slotsDressed(file, name),
    ...(deFora ? { external: true } : {}),
  });
  return [
    ...daqui.map((name) => linha(name, false)),
    ...external.filter((name) => !daqui.includes(name)).map((name) => linha(name, true)),
  ];
}

/**
 * **Ativas**: a pilha, **a de cima primeiro** — degrau 9 (I7, I7c).
 *
 * A lista da tela é a pilha de cabeça para baixo, e é de propósito: na pilha
 * (§4.4) a última vence, e na tela quem vence tem de estar em cima, onde a mão
 * o arrasta. *"O esqueleto em cima e o anjo embaixo dá tronco de esqueleto e
 * pernas de anjo"* — o Humberto, 16/09.
 *
 * Nome de pele que o arquivo não tem fica **fora e contado**: ele aparece no
 * aviso do painel, e não numa linha que ninguém sabe o que é (regra 21).
 */
export function activeStackRows(
  file: BoneFile, stack: readonly string[], editing: string | null = null,
  external: readonly string[] = [],
): SkinRow[] {
  const known = new Set([...skinNames(file), ...external]);
  const rows: SkinRow[] = [];
  for (const name of stack) {
    if (!known.has(name) || rows.some((row) => row.name === name)) continue;
    rows.push({
      name,
      visible: true,
      editable: name === editing,
      isDefault: name === DEFAULT_SKIN,
      slots: slotsDressed(file, name),
      ...(external.includes(name) && !skinNames(file).includes(name) ? { external: true } : {}),
    });
  }
  return rows.reverse();
}

/** Os nomes da pilha que o arquivo não tem mais, para o painel poder avisar. */
export function lostSkins(
  file: BoneFile, stack: readonly string[], external: readonly string[] = [],
): string[] {
  const known = new Set([...skinNames(file), ...external]);
  return stack.filter((name) => !known.has(name));
}

// ---------------------------------------------------------------------------
// Arrastar: liga, tira e reordena — degrau 9 (I7)
// ---------------------------------------------------------------------------

/*
 * Três contas puras, sem DOM e sem documento. A tela só diz "este nome caiu
 * nesta posição da lista de Ativas"; qual é a pilha que sai disso é aqui.
 *
 * **A posição é a da TELA** (0 = o topo, que é quem vence), e não a do array:
 * confundir as duas foi o que fez o teste do esqueleto e do anjo nascer.
 */

/** A pilha com `name` na posição de tela `at` (0 = topo). Já estava? Move. */
export function stackDrop(
  stack: readonly string[], name: string, at: number,
): string[] {
  const sem = stack.filter((item) => item !== name);
  const alvo = Math.max(0, Math.min(at, sem.length));
  // Tela de cima para baixo, array de baixo para cima: a posição 0 da tela é o
  // fim do array.
  const at_ = sem.length - alvo;
  return [...sem.slice(0, at_), name, ...sem.slice(at_)];
}

/** A pilha sem `name`. Desligar a pele é tirá-la da pilha, e nada mais. */
export function stackRemove(stack: readonly string[], name: string): string[] {
  return stack.filter((item) => item !== name);
}

/** A pilha com `name` no topo: o que "ligar" faz sem dizer onde. */
export function stackAddOnTop(stack: readonly string[], name: string): string[] {
  return [...stack.filter((item) => item !== name), name];
}

// ---------------------------------------------------------------------------
// O que a pele MOSTRA de fato — defeito 4 (21/09/2026)
// ---------------------------------------------------------------------------

/*
 * O rodapé dizia *"Pele 'armadura' ligada"* e o personagem não mudava nada:
 * a pele caía **embaixo** da `default`, e embaixo a de cima vence (§4.4). A
 * frase afirmava um efeito que não houve — a regra 21 pelo avesso.
 *
 * Para dizer a verdade é preciso **contar quem vence**, e isso é a resolução
 * da §4.4 feita aqui, sem runtime: a lista de resolução (cada pele da pilha,
 * de baixo para cima, com os `includes` dela expandidos antes dela) e, por
 * par `(slot, placeholder)`, **a última da lista ganha**.
 */

/** A lista de resolução da §4.4: os `includes` de cada pele, e então ela. */
function resolutionList(file: BoneFile, stack: readonly string[]): string[] {
  const byName = new Map((file.skins ?? []).map((skin) => [skin.name, skin]));
  const out: string[] = [];
  const expand = (name: string, seen: Set<string>): void => {
    if (seen.has(name)) return; // ciclo cortado (L1), como o runtime faz
    seen.add(name);
    for (const inc of byName.get(name)?.includes ?? []) expand(inc, seen);
    out.push(name);
  };
  for (const name of stack) expand(name, new Set());
  return out;
}

/**
 * Os pares `slot/placeholder` que uma pele **veste** — com os `null` dentro.
 *
 * O `null` esconde (§4.4), e **esconder também é um efeito**: a `armadura` do
 * herói tem `hair: null`, que é o elmo tapando o cabelo. Contá-lo fora daria
 * *"nada dela aparece"* numa pele que, no topo, tira o cabelo da cena — a
 * mesma mentira que este lote veio consertar, do outro lado.
 */
function dressedPairs(file: BoneFile, name: string): Array<[string, string]> {
  const skin = (file.skins ?? []).find((s) => s.name === name);
  const pairs: Array<[string, string]> = [];
  for (const [slot, defs] of Object.entries(skin?.attachments ?? {})) {
    for (const placeholder of Object.keys(defs ?? {})) pairs.push([slot, placeholder]);
  }
  return pairs;
}

/** O que sobra de uma pele depois de a pilha resolver quem vence (§4.4). */
export interface SkinShowing {
  /**
   * Lugares do corpo em que esta pele **vence**, e portanto muda a cena:
   * pondo o desenho dela, ou tirando o de baixo com um `null`.
   */
  wins: number;
  /** Lugares que ela veste e que peles de cima cobrem por inteiro. */
  covered: number;
  /** Quem cobre, da mais alta para a mais baixa. Vazio quando nada cobre. */
  coveredBy: string[];
  /** A pele não está no arquivo (veio de fora, F23): não dá para contar. */
  unknown: boolean;
}

/**
 * Quanto da pele `name` **vale**, com a pilha `stack` (de baixo para cima).
 *
 * Conta por **slot**, e não por par, porque é o que a pessoa vê: o tronco
 * trocou ou não trocou. Um slot conta quando pelo menos um par dela vence ali.
 */
export function skinShowing(
  file: BoneFile, name: string, stack: readonly string[],
): SkinShowing {
  const daqui = new Set(skinNames(file));
  if (!daqui.has(name)) return { wins: 0, covered: 0, coveredBy: [], unknown: true };

  const lista = resolutionList(file, stack);
  // Quem ganha cada par: a última da lista de resolução que o define — com
  // `null` e tudo, porque esconder também é ganhar.
  const vencedor = new Map<string, string>();
  for (const skin of lista) {
    const attachments = (file.skins ?? []).find((s) => s.name === skin)?.attachments ?? {};
    for (const [slot, defs] of Object.entries(attachments)) {
      for (const placeholder of Object.keys(defs ?? {})) vencedor.set(`${slot} ${placeholder}`, skin);
    }
  }

  const ganhos = new Set<string>();
  const perdidos = new Set<string>();
  const cobrem = new Set<string>();
  for (const [slot, placeholder] of dressedPairs(file, name)) {
    const quem = vencedor.get(`${slot} ${placeholder}`);
    if (quem === name) ganhos.add(slot);
    else {
      perdidos.add(slot);
      if (quem !== undefined) cobrem.add(quem);
    }
  }
  for (const slot of ganhos) perdidos.delete(slot);

  // A ordem de quem cobre é a da TELA: a de cima primeiro, que é a que a mão
  // vai ter de ultrapassar.
  const coveredBy = [...stack].reverse().filter((skin) => cobrem.has(skin));
  return { wins: ganhos.size, covered: perdidos.size, coveredBy, unknown: false };
}

/** O que um arrasto deixa: a pilha nova e a frase honesta do rodapé. */
export interface SkinDrop {
  stack: string[];
  notice: string;
}

/**
 * **Soltar na COLUNA Ativas** — o gesto de *ligar*, e o defeito 4 (21/09/2026).
 *
 * Era o fundo da pilha (`stackDrop` com a posição do fim), e embaixo a
 * `default` cobre tudo: o rodapé dizia "ligada" e o personagem não mudava
 * nada. Passa a ser **o topo**, que é o que o painel Exibição sempre fez
 * (`stackAddOnTop`) e o que a mão espera de *"arraste para Ativas para ligar"*.
 *
 * A decisão mora aqui, e não no painel, porque é a decisão que o teste julga:
 * o defeito passou por 3.801 verdes justamente por estar num `addEventListener`.
 */
export function dropOnColumn(
  file: BoneFile, stack: readonly string[], name: string,
): SkinDrop {
  const depois = stackAddOnTop(stack, name);
  return { stack: depois, notice: skinOnNotice(file, name, depois, stack.includes(name)) };
}

/**
 * **Soltar numa posição ESCOLHIDA** — numa linha da pilha, ou na faixa "embaixo
 * de todas". Continua sendo onde a mão soltou: aquele é o gesto de ordenar, e
 * ele é útil. O que muda é a frase, que agora diz quando nada aparece.
 */
export function dropAt(
  file: BoneFile, stack: readonly string[], name: string, at: number,
): SkinDrop {
  const depois = stackDrop(stack, name, at);
  return { stack: depois, notice: skinOnNotice(file, name, depois, stack.includes(name)) };
}

/**
 * A frase do rodapé ao LIGAR ou MOVER uma pele — defeito 4, regra 21.
 *
 * Quando nada dela aparece, a frase **diz isso e diz por quê**, em vez de
 * afirmar um efeito que não houve. `moved` troca "ligada" por "movida": a pele
 * já estava na pilha e o gesto foi de reordenar.
 */
export function skinOnNotice(
  file: BoneFile, name: string, stack: readonly string[], moved = false,
): string {
  const verbo = moved ? 'movida' : 'ligada';
  const showing = skinShowing(file, name, stack);
  if (showing.unknown) return `Skin "${name}" ${verbo}`;
  if (showing.wins > 0) return `Skin "${name}" ${verbo}`;
  if (showing.covered === 0) {
    return `Skin "${name}" ${verbo}, mas ela não veste nenhum lugar da base: nada muda na cena`;
  }
  const quantos = showing.covered === 1
    ? 'o único lugar que ela veste está coberto'
    : `os ${showing.covered} lugares que ela veste estão cobertos`;
  const quem = showing.coveredBy.length === 0 ? ''
    : ` por ${showing.coveredBy.map((s) => `"${s}"`).join(' e ')}, que ${showing.coveredBy.length === 1 ? 'está' : 'estão'} por cima`;
  return `Skin "${name}" ${verbo}, mas nada dela aparece na cena: ${quantos}${quem}. `
    + 'Arraste-a para o topo da coluna Ativas';
}

// ---------------------------------------------------------------------------
// O que some quando a pele sai — degrau 9 (I6)
// ---------------------------------------------------------------------------

/** O que existia SÓ por causa de uma pele, contado por tipo. */
export interface SkinOnly {
  /** Ossos `skinRequired` que só esta pele liga. */
  bones: string[];
  /** Regras `skinRequired` que só esta pele liga. */
  constraints: string[];
  /** Slots que só esta pele veste, entre as peles ativas. */
  slots: number;
}

/**
 * O que some da cena ao tirar `name` da pilha — I6, *"tira a pele e o
 * personagem volta ao normal"*.
 *
 * Quem faz sumir é o runtime: um osso `skinRequired` só aparece com a pele que
 * o lista (§7.1). O editor não precisa apagar nada — precisa **dizer**, porque
 * ver o rabo do lobisomem desaparecer junto com a roupa assusta quem não sabia
 * que o rabo era da roupa (regra 21).
 */
export function skinOnly(
  file: BoneFile, name: string, stack: readonly string[],
): SkinOnly {
  const outras = (file.skins ?? []).filter((skin) => skin.name !== name && stack.includes(skin.name));
  const esta = (file.skins ?? []).find((skin) => skin.name === name);
  const soDela = (kind: SkinMemberKind): string[] => {
    const outrasTem = new Set(outras.flatMap((skin) => skin[kind] ?? []));
    return (esta?.[kind] ?? []).filter((item) => !outrasTem.has(item));
  };
  const vestidosPorOutras = new Set(outras.flatMap((skin) => Object.keys(skin.attachments ?? {})));
  const slots = Object.entries(esta?.attachments ?? {})
    .filter(([slot, defs]) => Object.keys(defs ?? {}).length > 0 && !vestidosPorOutras.has(slot))
    .length;
  return { bones: soDela('bones'), constraints: soDela('constraints'), slots };
}

/** A frase do rodapé ao desligar `name`: o `skinOnly` já contado. */
export function skinOff(file: BoneFile, name: string, stack: readonly string[]): string {
  return skinOffNotice(name, skinOnly(file, name, stack));
}

/** A frase do rodapé ao desligar uma pele. Vazia quando nada só dela sai. */
export function skinOffNotice(name: string, only: SkinOnly): string {
  const partes: string[] = [];
  if (only.slots > 0) partes.push(only.slots === 1 ? '1 desenho' : `${only.slots} desenhos`);
  if (only.bones.length > 0) {
    partes.push(only.bones.length === 1 ? '1 osso' : `${only.bones.length} ossos`);
  }
  if (only.constraints.length > 0) {
    partes.push(only.constraints.length === 1 ? '1 regra' : `${only.constraints.length} regras`);
  }
  if (partes.length === 0) return `Skin "${name}" desligada`;
  const lista = partes.length === 1 ? partes[0]!
    : `${partes.slice(0, -1).join(', ')} e ${partes[partes.length - 1]!}`;
  // Rodada 12: "saíram 1 osso que só existiam" se lia errado. Um só, singular.
  const um = partes.length === 1 && /^1 /.test(partes[0]!);
  return um
    ? `Skin "${name}" desligada: saiu ${lista} que só existia nela`
    : `Skin "${name}" desligada: saíram ${lista} que só existiam nela`;
}

/**
 * A frase de uma linha, no topo da aba.
 *
 * Ela aparece enquanto há **uma** pele, e sai na segunda: quem já tem duas
 * roupas no personagem já sabe o que uma pele é, e a explicação passa a ser
 * três linhas tiradas da lista numa coluna de 260px. Num arquivo sem pele
 * nenhuma ela também não aparece — seria explicar algo que não está na tela.
 *
 * É o mesmo lugar da frase de ajuda da janela Character Maps do Spriter, que
 * também explica o que a lista é antes de a pessoa mexer nela.
 */
export const SKIN_HELP =
  'Skin é uma roupa. A base é a mesma, só o desenho muda. Nova skin para criar outra.';

/** Se dá para apagar esta pele. A `default` nunca sai: ela é o corpo. */
/**
 * **Quem inclui esta skin** (§4.4, `includes`) — rodada 17, M12a. Apagar a
 * `armadura` tira o que a `armadura_capa` herdava dela; a pergunta de apagar
 * diz isso pelo nome, em vez de só contar os slots.
 */
export function skinDependents(file: BoneFile, name: string): string[] {
  return (file.skins ?? [])
    .filter((skin) => {
      const inclui = (skin as { includes?: unknown }).includes;
      return Array.isArray(inclui) && inclui.includes(name);
    })
    .map((skin) => skin.name);
}

/** A frase da pergunta de apagar: os slots, e quem depende dela. */
export function deleteSkinLead(slots: number, dependents: readonly string[]): string {
  // Rodada 44, lote 5: o plural certo, e não "slot(s)".
  const base = `Ela veste ${slots === 1 ? '1 slot' : `${slots} slots`}. As linhas de tempo que só ela tinha saem junto.`;
  const quem = dependents.length === 0 ? ''
    : dependents.length === 1
      ? ` A skin "${dependents[0]}" inclui esta: perde o que vinha daqui, e a barra de avisos diz isso até ela voltar (importar a skin de volta religa).`
      : ` As skins ${dependents.map((d) => `"${d}"`).join(', ')} incluem esta: perdem o que vinha daqui, e a barra de avisos diz isso até ela voltar (importar a skin de volta religa).`;
  return `${base}${quem} Ctrl+Z devolve tudo.`;
}

export function canDeleteSkin(name: string): boolean {
  return name !== DEFAULT_SKIN;
}

// ---------------------------------------------------------------------------
// Os comandos
// ---------------------------------------------------------------------------

/**
 * Copia uma pele inteira, com os anexos.
 *
 * É como se faz a segunda armadura: duplica a primeira e troca dois desenhos.
 * Do zero seriam vinte e três anexos escritos à mão.
 */
export class DuplicateSkin implements Command {
  readonly label = 'Duplicar skin';
  readonly kind: ChangeKind = 'structure';
  readonly name: string;

  constructor(file: BoneFile, private readonly from: string) {
    this.name = uniqueName(from, (file.skins ?? []).map((s) => s.name));
  }

  apply(doc: EditorDoc): void {
    const list = doc.file.skins ?? (doc.file.skins = []);
    const origem = list.find((skin) => skin.name === this.from);
    if (origem === undefined) return;
    list.push({ ...cloneJson(origem), name: this.name });
  }

  revert(doc: EditorDoc): void {
    const list = doc.file.skins ?? [];
    const at = list.findIndex((skin) => skin.name === this.name);
    if (at >= 0) list.splice(at, 1);
  }
}

/**
 * Apaga uma pele, **e as linhas de tempo que só ela tinha**.
 *
 * Um `deform` ou um `sequence` guardam o nome da pele (§12.2). Apagar a pele e
 * deixar a linha de tempo apontando para ela deixaria o arquivo com uma
 * referência para o nada — carregaria, mas não desenharia, e ninguém saberia
 * por quê.
 */
export class DeleteSkin implements Command {
  readonly label = 'Apagar skin';
  readonly kind: ChangeKind = 'structure';
  private savedSkins: BoneFile['skins'] = [];
  private savedAnimations: BoneFile['animations'] = [];

  constructor(private readonly name: string) {}

  apply(doc: EditorDoc): void {
    if (!canDeleteSkin(this.name)) return;
    const file = doc.file;
    this.savedSkins = cloneJson(file.skins ?? []);
    this.savedAnimations = cloneJson(file.animations ?? []);

    const list = file.skins ?? [];
    const at = list.findIndex((skin) => skin.name === this.name);
    if (at >= 0) list.splice(at, 1);

    for (const animation of file.animations ?? []) {
      animation.timelines = (animation.timelines ?? [])
        .filter((timeline) => timeline.skin !== this.name);
    }
  }

  revert(doc: EditorDoc): void {
    const file = doc.file;
    file.skins = cloneJson(this.savedSkins ?? []);
    file.animations = cloneJson(this.savedAnimations ?? []);
  }
}

/**
 * Troca o nome de uma pele **em toda parte**.
 *
 * O nome dela aparece em dois lugares: na lista de peles e no campo `skin` de
 * cada linha de tempo de `deform` e `sequence` (§12.2). Trocar num e não no
 * outro quebra a animação em silêncio.
 *
 * O inverso é exato: renomear de volta. Por isso não há foto guardada.
 */
export class RenameSkin implements Command {
  readonly label = 'Renomear a skin';
  readonly kind: ChangeKind = 'structure';
  readonly to: string;

  constructor(file: BoneFile, private readonly from: string, wanted: string) {
    const taken = (file.skins ?? []).map((s) => s.name).filter((name) => name !== from);
    const limpo = wanted.trim() === '' ? from : wanted.trim();
    this.to = uniqueName(limpo, taken);
  }

  apply(doc: EditorDoc): void {
    renameSkinIn(doc.file, this.from, this.to);
  }

  revert(doc: EditorDoc): void {
    renameSkinIn(doc.file, this.to, this.from);
  }
}

function renameSkinIn(file: BoneFile, from: string, to: string): void {
  if (from === to) return;
  for (const skin of file.skins ?? []) {
    if (skin.name === from) skin.name = to;
    // Rodada 17 (a forma do M12a): o nome também mora no `includes` de quem a
    // inclui. Sem isto, renomear "armadura" deixava a capa incluindo um nome
    // que não existe mais.
    const inclui = (skin as { includes?: string[] }).includes;
    if (Array.isArray(inclui)) (skin as { includes?: string[] }).includes = inclui.map((n) => (n === from ? to : n));
  }
  for (const animation of file.animations ?? []) {
    for (const timeline of animation.timelines ?? []) {
      if (timeline.skin === from) timeline.skin = to;
    }
  }
}

// ---------------------------------------------------------------------------
// Lote 39 — `skin.bones` e `skin.constraints` na tela (Spine 3)
// ---------------------------------------------------------------------------

/**
 * Qual das duas listas da pele: a de ossos ou a de regras.
 *
 * As duas são iguais no formato (§4.4): nomes de coisas com `skinRequired`
 * que aquela pele liga. Uma classe só serve às duas.
 */
export type SkinMemberKind = 'bones' | 'constraints';

/** As peles que listam `name` em `bones` ou `constraints`, na ordem do arquivo. */
export function skinsListing(file: BoneFile, kind: SkinMemberKind, name: string): string[] {
  return (file.skins ?? [])
    .filter((skin) => (skin[kind] ?? []).includes(name))
    .map((skin) => skin.name);
}

/**
 * A pele que entra sozinha quando se marca **Só com a pele**, ou `null`.
 *
 * É **a pele do lápis** (degrau 9, I5): o osso e a regra novos nascem nela,
 * como o desenho sempre nasceu. A `default` não conta: um osso que só vale
 * "quando a `default` está ligada" é um osso comum — marcar a caixa e pô-lo
 * nela seria o mesmo que não marcar. Sem lápis aceso noutra pele, a tela
 * pergunta em que pele, em vez de adivinhar (regra 21).
 *
 * Aceita o lápis (`string | null`) ou, para quem ainda fala a vista velha, a
 * lista com o lápis na frente.
 */
export function skinForRequired(
  file: BoneFile, editing: string | null | readonly string[],
): string | null {
  const name = Array.isArray(editing) ? editing[0] : (editing as string | null);
  if (name === undefined || name === null || name === DEFAULT_SKIN) return null;
  return (file.skins ?? []).some((skin) => skin.name === name) ? name : null;
}

/** A frase do rodapé quando não há pele em edição para receber o osso. */
export const PICK_SKIN_NOTICE = 'Marque em que skin, em Propriedades';

/** A ordem do arquivo: os nomes de `bones` ou de `constraints`, como estão. */
function fileOrder(file: BoneFile, kind: SkinMemberKind): string[] {
  const list = kind === 'bones' ? file.bones ?? [] : file.constraints ?? [];
  return list.map((item) => item.name);
}

/**
 * Uma foto das listas `bones` e `constraints` de todas as peles.
 *
 * `undefined` quer dizer "o campo não estava escrito", e volta assim: um
 * `revert` que devolvesse `[]` onde não havia nada mudaria o arquivo.
 */
type ListsPhoto = Array<{ bones?: string[]; constraints?: string[] }>;

function photoLists(file: BoneFile): ListsPhoto {
  return (file.skins ?? []).map((skin) => ({
    ...(skin.bones === undefined ? {} : { bones: [...skin.bones] }),
    ...(skin.constraints === undefined ? {} : { constraints: [...skin.constraints] }),
  }));
}

function restoreLists(file: BoneFile, photo: ListsPhoto): void {
  (file.skins ?? []).forEach((skin, i) => {
    const saved = photo[i] ?? {};
    for (const kind of ['bones', 'constraints'] as const) {
      const value = saved[kind];
      if (value === undefined) delete skin[kind];
      else skin[kind] = [...value];
    }
  });
}

/**
 * Põe ou tira `name` da lista `kind` da pele `skin`. Marcar duas vezes tira.
 *
 * O nome **nunca** entra duas vezes, e a lista fica na ordem do arquivo — a
 * dos ossos ou a das regras —, e não na dos cliques: o arquivo não muda
 * quando ninguém mudou nada de verdade. Tirar o último nome tira o campo,
 * porque `[]` é o padrão (§4.4) e escrever o padrão é ruído.
 */
export class ToggleSkinMember implements Command {
  readonly label: string;
  readonly kind: ChangeKind = 'structure';
  private photo: ListsPhoto = [];

  constructor(
    private readonly member: SkinMemberKind,
    private readonly skin: string,
    private readonly name: string,
  ) {
    this.label = member === 'bones' ? 'Skin liga o osso' : 'Skin liga a regra';
  }

  apply(doc: EditorDoc): void {
    const file = doc.file;
    this.photo = photoLists(file);
    const skin = (file.skins ?? []).find((s) => s.name === this.skin);
    if (skin === undefined) return;
    const atual = new Set(skin[this.member] ?? []);
    if (atual.has(this.name)) atual.delete(this.name);
    else atual.add(this.name);
    const ordem = fileOrder(file, this.member);
    // Nome que não está no arquivo (escrito à mão, de outro programa) vai para
    // o fim, sem se perder: esta caixa não é lugar de consertar o arquivo.
    const lista = [
      ...ordem.filter((n) => atual.has(n)),
      ...[...atual].filter((n) => !ordem.includes(n)),
    ];
    if (lista.length === 0) delete skin[this.member];
    else skin[this.member] = lista;
  }

  revert(doc: EditorDoc): void {
    restoreLists(doc.file, this.photo);
  }
}

/** `ToggleSkinMember` para ossos: o nome que o plano da rodada 4 usa. */
export class ToggleSkinBone extends ToggleSkinMember {
  constructor(skin: string, bone: string) { super('bones', skin, bone); }
}

/** `ToggleSkinMember` para regras. */
export class ToggleSkinConstraint extends ToggleSkinMember {
  constructor(skin: string, constraint: string) { super('constraints', skin, constraint); }
}

/**
 * Marca ou desmarca **Só com a pele** num osso ou numa regra, **e arruma as
 * peles junto**, num passo de desfazer.
 *
 * - Marcar com uma pele em edição (`skinForRequired`) já põe o nome nela.
 * - Desmarcar tira o nome de **toda** pele. Deixá-lo lá seria o aviso
 *   `HINT_SKIN_BONE` (§13, L2): "osso sem `skinRequired` em `skin.bones`".
 *
 * Desmarcar grava a ausência, e não `false`: `false` é o padrão (§4.2).
 */
export class SetSkinRequired implements Command {
  readonly label: string;
  readonly kind: ChangeKind = 'structure';
  private photo: ListsPhoto = [];
  private had = false;
  private before: unknown = undefined;

  constructor(
    private readonly member: SkinMemberKind,
    private readonly name: string,
    private readonly on: boolean,
    /** A pele que recebe o nome ao marcar, ou `null`. */
    private readonly into: string | null,
  ) {
    this.label = on ? 'Marcar só com a skin' : 'Desmarcar só com a skin';
  }

  private target(file: BoneFile): { skinRequired?: boolean } | undefined {
    const list = this.member === 'bones' ? file.bones ?? [] : file.constraints ?? [];
    return (list as Array<{ name: string; skinRequired?: boolean }>)
      .find((item) => item.name === this.name);
  }

  apply(doc: EditorDoc): void {
    const file = doc.file;
    const item = this.target(file);
    if (item === undefined) return;
    this.photo = photoLists(file);
    this.had = Object.prototype.hasOwnProperty.call(item, 'skinRequired');
    this.before = item.skinRequired;

    if (this.on) {
      item.skinRequired = true;
      const skin = (file.skins ?? []).find((s) => s.name === this.into);
      if (skin !== undefined && !(skin[this.member] ?? []).includes(this.name)) {
        const atual = new Set([...(skin[this.member] ?? []), this.name]);
        skin[this.member] = fileOrder(file, this.member).filter((n) => atual.has(n));
      }
      return;
    }
    delete item.skinRequired;
    for (const skin of file.skins ?? []) {
      const lista = (skin[this.member] ?? []).filter((n) => n !== this.name);
      if (skin[this.member] === undefined) continue;
      if (lista.length === 0) delete skin[this.member];
      else skin[this.member] = lista;
    }
  }

  revert(doc: EditorDoc): void {
    const file = doc.file;
    const item = this.target(file);
    if (item === undefined) return;
    if (this.had) item.skinRequired = this.before as boolean;
    else delete item.skinRequired;
    restoreLists(file, this.photo);
  }
}

// ---------------------------------------------------------------------------
// Nascer na pele do lápis — degrau 9 (18/09/2026), I5
// ---------------------------------------------------------------------------

/*
 * *"O lápis não faz nada"* — o Humberto, testando ao vivo em 16/09/2026, ao
 * criar um osso com a pele `lobisomem` em edição e ver o osso nascer do corpo,
 * e não da roupa.
 *
 * O desenho sempre nasceu na pele do lápis; o **osso** e a **regra** não,
 * porque nasciam por comandos que não sabiam que peles existiam. Esta classe
 * faz o osso novo (ou a regra nova) sair do forno já `skinRequired` e já
 * listado na pele — **num passo de desfazer só**, que é o que a regra 6 da
 * casa pede: um `Ctrl+Z` tira o osso e a marca juntos, como entraram.
 */

/** Um comando de criar, com a marca da pele grudada nele. */
export class BornInSkin implements Command {
  readonly label: string;
  readonly kind: ChangeKind;
  private readonly mark: SetSkinRequired;

  constructor(
    private readonly inner: Command,
    member: SkinMemberKind,
    name: string,
    skin: string,
  ) {
    this.label = inner.label;
    this.kind = inner.kind;
    this.mark = new SetSkinRequired(member, name, true, skin);
  }

  apply(doc: EditorDoc): void {
    this.inner.apply(doc);
    // A marca vem DEPOIS: o osso tem de existir para poder ser marcado.
    this.mark.apply(doc);
  }

  revert(doc: EditorDoc): void {
    // Ao contrário, como se desempilha: a marca sai antes do osso.
    this.mark.revert(doc);
    this.inner.revert(doc);
  }
}

/**
 * Roda `command` e, **se houver lápis aceso numa pele que não é a `default`**,
 * faz o que ele criou nascer dentro dela.
 *
 * `name` é o nome do que vai nascer — os comandos de criar o publicam antes de
 * aplicar (`AddBone.name`), justamente para casos assim. Devolve a pele em que
 * nasceu, ou `null` quando nasceu no corpo, para quem chama poder dizer no
 * rodapé (regra 21: o programa avisa onde pôs a coisa).
 */
export function runBornInSkin(
  doc: EditorDoc, command: Command, member: SkinMemberKind, name: string,
  editing: string | null,
): string | null {
  const skin = skinForRequired(doc.file, editing);
  if (skin === null) {
    doc.run(command);
    return null;
  }
  doc.run(new BornInSkin(command, member, name, skin));
  return skin;
}

/** A frase do rodapé quando o osso ou a regra nasce dentro de uma pele. */
export function bornInSkinNotice(what: string, skin: string): string {
  return `${what} nasceu na skin "${skin}": ele some quando ela sai da pilha`;
}

// ---------------------------------------------------------------------------
// Lote 39 — trocar a imagem em todas as peles (Spriter 7)
// ---------------------------------------------------------------------------

/** Os tipos de anexo que têm imagem: só neles `path` quer dizer alguma coisa. */
const WITH_IMAGE = new Set(['region', 'mesh', 'linkedmesh']);

/**
 * A imagem que um anexo mostra: `path`, ou o próprio nome quando `path` não
 * está escrito (§7.2). Um anexo sem imagem devolve `null`.
 */
export function imageOf(name: string, def: unknown): string | null {
  const d = def as { type?: string; path?: string } | null;
  if (d === null || typeof d !== 'object' || !WITH_IMAGE.has(d.type ?? '')) return null;
  return d.path ?? name;
}

/** O que o painel Imagens precisa saber para trocar a imagem em todas as peles. */
export interface SwapPick {
  slot: string;
  /** O anexo que foi clicado, só para a frase. */
  attachment: string;
  /** A imagem que sai. */
  from: string;
  /** As peles que vão mudar. */
  skins: string[];
}

/**
 * Prepara a troca a partir do desenho escolhido, ou `null` quando ele não tem
 * imagem — ponto, caixa, máscara e caminho não desenham nada.
 */
export function swapPickFor(file: BoneFile, slot: string, attachment: string): SwapPick | null {
  for (const skin of file.skins ?? []) {
    const def = skin.attachments?.[slot]?.[attachment];
    if (def === undefined) continue;
    const from = imageOf(attachment, def);
    if (from === null) return null;
    return { slot, attachment, from, skins: skinsWithImage(file, slot, from) };
  }
  return null;
}

/** A frase do rodapé depois da troca. */
export function swapNotice(pick: SwapPick, to: string, changed: number): string {
  if (changed === 0) return `Nada mudou: ${to} já é a imagem de ${pick.slot}`;
  const peles = pick.skins.length === 1 ? '1 skin' : `${pick.skins.length} skins`;
  return `${pick.from} → ${to} no slot ${pick.slot}, em ${peles}`;
}

/** Quantas peles têm, no slot, um anexo com a imagem `path`. */
export function skinsWithImage(file: BoneFile, slot: string, path: string): string[] {
  return (file.skins ?? [])
    .filter((skin) => Object.entries(skin.attachments?.[slot] ?? {})
      .some(([name, def]) => imageOf(name, def) === path))
    .map((skin) => skin.name);
}

/**
 * **Trocar a imagem em todas as peles** — o `Swap image in all character maps`
 * do Spriter.
 *
 * Em cada pele, todo anexo do slot `slot` cuja imagem é `from` passa a mostrar
 * `to`. Pele sem aquele slot fica intacta, e anexo com outra imagem no mesmo
 * slot também: `hand` e `hand_fist` são dois desenhos, e trocar a mão aberta
 * não troca a fechada.
 *
 * Lote 56, plano pivô: a imagem nova **cai no lugar pelo pivô dela** — `x/y`
 * por `placeByPivot`, e `width/height` saem, para ela não sair esticada no
 * tamanho da velha. Sem pivô na região nova, `x/y` ficam. Malha: só o `path`.
 *
 * O `revert` devolve cada anexo como estava, por texto — o `path` inclusive
 * **ausente**, quando a imagem vinha do nome do anexo.
 */
export class SwapImageEverywhere implements Command {
  readonly label = 'Trocar a imagem em todas as skins';
  readonly kind: ChangeKind = 'structure';
  /** Quantos anexos a última aplicação trocou, para a frase do rodapé. */
  changed = 0;
  private saved: Array<{ skin: string; attachment: string; before: DefSnapshot }> = [];

  constructor(
    private readonly slot: string,
    private readonly from: string,
    private readonly to: string,
  ) {}

  apply(doc: EditorDoc): void {
    this.saved = [];
    if (this.from === this.to) { this.changed = 0; return; }
    // Documento sem atlas (um teste, um arquivo aberto sem as imagens): sem
    // pivô, e a troca segue só com o `path` e o tamanho da imagem nova.
    const region = findAtlasRegion(doc.atlases ?? [], this.to);
    for (const skin of doc.file.skins ?? []) {
      const porSlot = skin.attachments?.[this.slot];
      if (porSlot === undefined) continue;
      for (const [name, def] of Object.entries(porSlot)) {
        if (imageOf(name, def) !== this.from) continue;
        const anexo = def as unknown as Record<string, unknown>;
        this.saved.push({ skin: skin.name, attachment: name, before: snapshotDef(anexo) });
        swapImage(anexo, this.to, region, region?.scale ?? 1);
      }
    }
    this.changed = this.saved.length;
  }

  revert(doc: EditorDoc): void {
    for (const item of this.saved) {
      const skin = (doc.file.skins ?? []).find((s) => s.name === item.skin);
      const anexo = skin?.attachments?.[this.slot]?.[item.attachment];
      if (anexo === undefined || anexo === null) continue;
      restoreDef(anexo as unknown as Record<string, unknown>, item.before);
    }
  }
}

// ---------------------------------------------------------------------------
// Fazer a pele como o Spriter — degrau 9 (18/09/2026), I9
// ---------------------------------------------------------------------------

/*
 * 🗣️ *"Seguir o Spriter para fazer a pele: clicar na pele → fazer o character
 * map dela. Trocar **uma imagem por vez ou a pasta inteira** de uma vez. PSD
 * aceito: grupo do PSD = pasta."* — o Humberto, respostas Q17/Q18.
 *
 * Uma imagem por vez já existia (o botão direito no desenho, lote 39). O que
 * faltava era **a pasta inteira**: o jeito do Dota 2, em que a roupa nova é
 * uma pasta de imagens com os mesmos nomes da roupa velha.
 *
 * A conta é por NOME, e não por objeto — é isto que o Spriter não tem, e é o
 * limite que o Humberto apontou nele: lá toda variação precisa que o objeto já
 * exista na entidade base.
 */

/** O nome da pasta de uma imagem (`lobisomem/cabeca` → `lobisomem`), ou `''`. */
export function folderOf(image: string): string {
  const at = image.lastIndexOf('/');
  return at < 0 ? '' : image.slice(0, at);
}

/** O nome da imagem sem a pasta (`lobisomem/cabeca` → `cabeca`). */
export function baseNameOf(image: string): string {
  const at = image.lastIndexOf('/');
  return at < 0 ? image : image.slice(at + 1);
}

/**
 * As pastas que as imagens carregadas têm, em ordem, sem repetir.
 *
 * É a lista que a janela oferece. Um grupo do PSD chega aqui como pasta,
 * porque o importador grava o nome do grupo na frente do nome da imagem — é o
 * mesmo dado, e por isso não há um caminho separado para PSD.
 */
export function imageFolders(images: Iterable<string>): string[] {
  const out: string[] = [];
  for (const image of images) {
    const folder = folderOf(image);
    if (folder === '' || out.includes(folder)) continue;
    out.push(folder);
  }
  return out;
}

/** Um desenho que a pasta nova cobre. */
export interface FolderSkinMatch {
  slot: string;
  /** O nome do anexo na pele de origem, que é o nome que a pele nova usa. */
  attachment: string;
  /** A imagem de antes. */
  from: string;
  /** A imagem da pasta nova. */
  to: string;
}

/** O que a pasta cobre, e o que ela deixa de fora. */
export interface FolderSkinPlan {
  matched: FolderSkinMatch[];
  /** Desenhos da pele de origem que a pasta não tem: ficam como estão. */
  missing: string[];
}

/**
 * O que sairia de fazer uma pele com a pasta `folder`, a partir de `from`.
 *
 * Para cada desenho da pele de origem procura, na pasta, uma imagem com o
 * **mesmo nome de arquivo**. O que ela não tem entra em `missing` e é DITO na
 * janela: uma pele que troca quinze dos vinte desenhos e cala sobre os cinco é
 * a regra 21 quebrada — a pessoa descobre o buraco depois de animar.
 */
export function folderSkinPlan(
  file: BoneFile, from: string, folder: string, images: Iterable<string>,
): FolderSkinPlan {
  const daPasta = new Map<string, string>();
  for (const image of images) {
    if (folderOf(image) !== folder) continue;
    daPasta.set(baseNameOf(image), image);
  }
  const origem = (file.skins ?? []).find((skin) => skin.name === from);
  const matched: FolderSkinMatch[] = [];
  const missing: string[] = [];
  for (const [slot, anexos] of Object.entries(origem?.attachments ?? {})) {
    for (const [name, def] of Object.entries(anexos ?? {})) {
      const atual = imageOf(name, def);
      // Ponto, caixa, máscara e caminho não têm imagem: a pasta não os troca,
      // e eles também não são falta nenhuma.
      if (atual === null) continue;
      const nova = daPasta.get(baseNameOf(atual));
      if (nova === undefined) missing.push(`${slot}/${name}`);
      else matched.push({ slot, attachment: name, from: atual, to: nova });
    }
  }
  return { matched, missing };
}

/** A frase da janela: o que a pasta cobre, e o que ela não cobre. */
export function folderSkinNotice(folder: string, plan: FolderSkinPlan): string {
  const quantos = plan.matched.length;
  if (quantos === 0) return `A pasta "${folder}" não tem nenhum desenho com estes nomes`;
  const cobre = quantos === 1 ? '1 desenho' : `${quantos} desenhos`;
  if (plan.missing.length === 0) return `A pasta "${folder}" cobre ${cobre}`;
  const falta = plan.missing.length === 1
    ? `1 continua o de baixo (${plan.missing[0]!})`
    : `${plan.missing.length} continuam os de baixo`;
  return `A pasta "${folder}" cobre ${cobre}; ${falta}`;
}

/**
 * **Fazer a pele de uma pasta** (I9): uma pele nova com os desenhos da pasta,
 * nos mesmos slots e com a mesma geometria da pele de origem.
 *
 * A geometria vem da origem de propósito: a arte da roupa nova é desenhada em
 * cima da velha, no mesmo lugar e no mesmo tamanho — é a régua de pivô do
 * Humberto (*exportar sem recorte, mesma tela, ponto de encaixe no mesmo
 * pixel*). Trocar só o `path` é o que faz a roupa cair no lugar sem ninguém
 * posicionar nada.
 */
export class MakeSkinFromFolder implements Command {
  readonly label = 'Fazer a skin de uma pasta';
  readonly kind: ChangeKind = 'structure';
  readonly name: string;

  constructor(
    file: BoneFile,
    private readonly from: string,
    private readonly plan: FolderSkinPlan,
    wanted: string,
  ) {
    this.name = uniqueName(wanted, (file.skins ?? []).map((s) => s.name));
  }

  apply(doc: EditorDoc): void {
    const list = doc.file.skins ?? (doc.file.skins = []);
    const origem = list.find((skin) => skin.name === this.from);
    const attachments: Record<string, Record<string, unknown>> = {};
    for (const match of this.plan.matched) {
      const def = origem?.attachments?.[match.slot]?.[match.attachment];
      const copia = cloneJson(def ?? { type: 'region' }) as Record<string, unknown>;
      copia['path'] = match.to;
      attachments[match.slot] ??= {};
      attachments[match.slot]![match.attachment] = copia;
    }
    list.push({ name: this.name, attachments } as never);
  }

  revert(doc: EditorDoc): void {
    const list = doc.file.skins ?? [];
    const at = list.findIndex((skin) => skin.name === this.name);
    if (at >= 0) list.splice(at, 1);
  }
}

// ---------------------------------------------------------------------------
// Promover pele → base — degrau 9 (18/09/2026), I13, F25
// ---------------------------------------------------------------------------

/** Um deslocamento de `skin.drawOrder` (§4.4), como o arquivo o escreve. */
interface OrderOffset { slot: string; offset: number }

/**
 * A ordem com os deslocamentos aplicados — a mesma conta da aba Ordem, escrita
 * aqui para a assadura não depender dela.
 */
function applyOrderOffsets(order: readonly string[], entries: readonly OrderOffset[]): string[] {
  const out = [...order];
  for (const entry of entries) {
    const at = out.indexOf(entry.slot);
    if (at < 0) continue;
    out.splice(at, 1);
    const alvo = Math.max(0, Math.min(at + entry.offset, out.length));
    out.splice(alvo, 0, entry.slot);
  }
  return out;
}

/**
 * 🗣️ *"Lobisomem: os dois."* — o Humberto, Q38. A pele pode virar **base**:
 * faz-se a base do homem, anima-se, faz-se a pele lobisomem, e ela vira um
 * corpo por direito, com animações próprias.
 *
 * O corpo novo é a cópia deste com a pilha **assada** na `default`:
 *
 * | O quê | Como fica |
 * |:---|:---|
 * | os anexos | a pilha achatada, anexo por anexo, **a de cima vence** |
 * | ossos e regras `skinRequired` da pilha | viram comuns: o rabo passa a ser do corpo |
 * | as peles assadas | saem da lista: elas viraram o corpo |
 * | `skin.drawOrder` das assadas | vira a ordem do array `slots` |
 *
 * **Zero campo novo** (`ARQUITETO 3` §5.4). Puro: devolve o `BoneFile` do
 * corpo novo e não toca no de origem.
 */
export function bakeSkinBase(file: BoneFile, stack: readonly string[], name: string): BoneFile {
  const novo = cloneJson(file);
  const assadas = (novo.skins ?? []).filter((skin) => stack.includes(skin.name));
  const ordem = stack.filter((nome) => assadas.some((skin) => skin.name === nome));

  // 1. Os anexos, de baixo para cima: a de cima sobrescreve a de baixo.
  const base: Record<string, Record<string, unknown>> = {};
  for (const nome of ordem) {
    const skin = assadas.find((s) => s.name === nome)!;
    for (const [slot, anexos] of Object.entries(skin.attachments ?? {})) {
      base[slot] ??= {};
      for (const [anexo, def] of Object.entries(anexos ?? {})) {
        base[slot]![anexo] = cloneJson(def);
      }
    }
  }

  // 2. `drawOrder` das assadas vira a ordem do array `slots`, na mesma ordem em
  // que o runtime as aplicaria (§4.4).
  let slots = (novo.slots ?? []).map((slot) => slot.name);
  for (const nome of ordem) {
    const skin = assadas.find((s) => s.name === nome)! as { drawOrder?: unknown };
    const entries = Array.isArray(skin.drawOrder) ? skin.drawOrder : [];
    if (entries.length > 0) slots = applyOrderOffsets(slots, entries as OrderOffset[]);
  }
  const porNome = new Map((novo.slots ?? []).map((slot) => [slot.name, slot]));
  novo.slots = slots
    .map((nome) => porNome.get(nome))
    .filter((slot): slot is NonNullable<typeof slot> => slot !== undefined);

  // 3. Ossos e regras que só existiam com essas peles passam a ser do corpo.
  const ossos = new Set(assadas.flatMap((skin) => skin.bones ?? []));
  const regras = new Set(assadas.flatMap((skin) => skin.constraints ?? []));
  for (const bone of (novo.bones ?? []) as Array<{ name: string; skinRequired?: boolean }>) {
    if (ossos.has(bone.name)) delete bone.skinRequired;
  }
  for (const rule of (novo.constraints ?? []) as Array<{ name: string; skinRequired?: boolean }>) {
    if (regras.has(rule.name)) delete rule.skinRequired;
  }

  // 4. As peles assadas saem, e a `default` passa a ser o que a pilha mostrava.
  novo.skins = [
    { name: DEFAULT_SKIN, attachments: base } as never,
    ...(novo.skins ?? []).filter((skin) => !stack.includes(skin.name)),
  ];

  // 5. As linhas de tempo que citavam uma pele assada passam a citar a
  // `default`: elas continuam valendo, porque a arte delas é a que ficou.
  for (const animation of novo.animations ?? []) {
    for (const timeline of animation.timelines ?? []) {
      if (typeof timeline.skin === 'string' && stack.includes(timeline.skin)) {
        timeline.skin = DEFAULT_SKIN;
      }
    }
  }

  novo.skeleton = { ...(novo.skeleton ?? {}), name } as BoneFile['skeleton'];
  const ext = (novo as { extensions?: Record<string, unknown> }).extensions;
  if (ext !== undefined) delete ext['RECORTE_editor_state'];
  return novo;
}

/** A frase do rodapé de Promover pele a base. */
export function promoteSkinNotice(name: string, stack: readonly string[]): string {
  const peles = stack.length === 1 ? `a skin "${stack[0]!}"` : `${stack.length} skins`;
  const assadas = stack.length === 1 ? 'assada' : 'assadas';
  return `"${name}" entrou em Bases, com ${peles} ${assadas} na base`;
}

// ---------------------------------------------------------------------------
// Trocar · ignorar · esconder, por imagem — rodada 12 (04/10/2026), S3 e S4
// ---------------------------------------------------------------------------

/*
 * O Spriter, na janela *Edit Character Map* (manual oficial 1.4, pág. 22):
 * escolhe-se a imagem na coluna da esquerda e aperta-se **Set Ignored** (a
 * pele deixa de mexer nela) ou **Set Hidden** (ela não é desenhada); vale para
 * várias de uma vez, com Ctrl. O formato já diz as três coisas (§4.4):
 *
 * | O que a pele faz com o desenho | No arquivo |
 * |:---|:---|
 * | **troca** | um anexo em `skin.attachments[slot][placeholder]` |
 * | **ignora** | a chave não existe: vale o de baixo na pilha |
 * | **esconde** | `null` |
 *
 * Campo novo: nenhum.
 */

/** O que uma pele faz com um desenho. */
export type SkinVerdict = 'troca' | 'ignora' | 'esconde';

/** O que a pele `skin` faz com o desenho `slot/placeholder`. */
export function skinVerdict(file: BoneFile, skin: string, slot: string, placeholder: string): SkinVerdict {
  const porSlot = (file.skins ?? []).find((s) => s.name === skin)?.attachments?.[slot];
  if (porSlot === undefined || !Object.prototype.hasOwnProperty.call(porSlot, placeholder)) return 'ignora';
  return porSlot[placeholder] === null ? 'esconde' : 'troca';
}

/** Um desenho, pelo slot e pelo nome dele no slot (o placeholder). */
export interface SkinPair {
  slot: string;
  attachment: string;
}

/**
 * Os desenhos que a seleção aponta: os desenhos escolhidos, ou, para um slot
 * escolhido sozinho (a linha da Árvore), o desenho de setup dele. Sem repetir.
 */
export function pairsOfSelection(
  file: BoneFile, selection: { slots: readonly string[]; attachments: ReadonlyArray<SkinPair> },
): SkinPair[] {
  const out: SkinPair[] = [];
  const push = (pair: SkinPair): void => {
    if (!out.some((p) => p.slot === pair.slot && p.attachment === pair.attachment)) out.push({ ...pair });
  };
  for (const pair of selection.attachments) push(pair);
  for (const slot of selection.slots) {
    if (out.some((p) => p.slot === slot)) continue;
    const setup = (file.slots ?? []).find((s) => s.name === slot)?.attachment;
    if (typeof setup === 'string') push({ slot, attachment: setup });
  }
  return out;
}

/** A frase do rodapé quando não há pele no lápis para esconder ou ignorar. */
export const NO_SKIN_FOR_VERDICT =
  'Esconder e Ignorar são de uma skin: acenda o lápis numa skin que não seja a default, na aba Skins';

/**
 * **Esconder** ou **Ignorar** desenhos na pele `skin` — S4 e S3.
 *
 * Esconder grava `null` (e tira a troca que havia: a pele passa a esconder em
 * vez de trocar). Ignorar tira a chave, e o slot que fica sem nenhuma sai da
 * pele: o arquivo de quem trocou e ignorou volta letra por letra.
 *
 * O `revert` devolve o `attachments` da pele como texto — a ordem das chaves
 * inclusive.
 */
export class SetSkinVerdict implements Command {
  readonly label: string;
  readonly kind: ChangeKind = 'structure';
  /** Quantos desenhos mudaram de verdade na última aplicação. */
  changed = 0;
  private before: string | null = null;
  private hadAttachments = false;

  constructor(
    private readonly skin: string,
    private readonly pairs: readonly SkinPair[],
    private readonly to: 'esconde' | 'ignora',
  ) {
    this.label = to === 'esconde' ? 'Esconder nesta skin' : 'Ignorar nesta skin';
  }

  apply(doc: EditorDoc): void {
    const skin = (doc.file.skins ?? []).find((s) => s.name === this.skin);
    this.changed = 0;
    if (skin === undefined) return;
    this.hadAttachments = skin.attachments !== undefined;
    this.before = JSON.stringify(skin.attachments ?? {});
    const attachments = (skin.attachments ??= {}) as Record<string, Record<string, unknown>>;
    for (const { slot, attachment } of this.pairs) {
      const antes = skinVerdict(doc.file, this.skin, slot, attachment);
      if (antes === this.to) continue;
      this.changed++;
      if (this.to === 'esconde') {
        (attachments[slot] ??= {})[attachment] = null;
        continue;
      }
      delete attachments[slot]![attachment];
      if (Object.keys(attachments[slot]!).length === 0) delete attachments[slot];
    }
    if (!this.hadAttachments && Object.keys(attachments).length === 0) delete skin.attachments;
  }

  revert(doc: EditorDoc): void {
    const skin = (doc.file.skins ?? []).find((s) => s.name === this.skin);
    if (skin === undefined || this.before === null) return;
    if (this.hadAttachments) skin.attachments = JSON.parse(this.before) as typeof skin.attachments;
    else delete skin.attachments;
  }
}

/** A frase do rodapé depois de Esconder ou Ignorar (regra 21: o que houve de fato). */
export function verdictNotice(
  skin: string, pairs: readonly SkinPair[], to: 'esconde' | 'ignora', changed: number,
): string {
  const nomes = pairs.map((p) => p.attachment).join(', ');
  if (changed === 0) {
    return to === 'esconde'
      ? `${nomes} já ${pairs.length === 1 ? 'estava escondida' : 'estavam escondidas'} na skin "${skin}"`
      : `A skin "${skin}" já não mexia em ${nomes}: nada mudou`;
  }
  return to === 'esconde'
    ? `${nomes}: ${changed === 1 ? 'escondida' : `${changed} escondidas`} na skin "${skin}". `
      + 'Com ela vestida, não é desenhada. A base não muda'
    : `${nomes}: a skin "${skin}" deixa de mexer ${changed === 1 ? 'nela' : 'nelas'}. `
      + 'Vale o desenho de baixo, o da base';
}

/** Uma linha da lista "Nesta pele", na aba Peles. */
export interface SkinEffect {
  kind: 'troca' | 'esconde' | 'osso';
  slot: string;
  /** O nome do desenho no slot; vazio na linha de osso. */
  attachment: string;
  /** O que se lê: a imagem nova, "escondida", ou "osso apagado". */
  text: string;
}

/**
 * **O que a pele faz**, desenho por desenho — a coluna da esquerda do *Edit
 * Character Map* do Spriter. Cada linha tem o botão de voltar a ignorar.
 * `removedBones` são os ossos que ela apagou (S9), na frente.
 */
export function skinEffects(file: BoneFile, skin: string, removedBones: readonly string[] = []): SkinEffect[] {
  const out: SkinEffect[] = removedBones.map((bone) => ({
    kind: 'osso', slot: bone, attachment: '', text: `osso ${bone} apagado`,
  }));
  const pele = (file.skins ?? []).find((s) => s.name === skin);
  for (const [slot, defs] of Object.entries(pele?.attachments ?? {})) {
    for (const [attachment, def] of Object.entries(defs ?? {})) {
      if (def === null) {
        out.push({ kind: 'esconde', slot, attachment, text: `${attachment} · escondida` });
        continue;
      }
      const imagem = imageOf(attachment, def);
      out.push({ kind: 'troca', slot, attachment, text: `${attachment} → ${imagem ?? (def as { type?: string }).type ?? '?'}` });
    }
  }
  return out;
}

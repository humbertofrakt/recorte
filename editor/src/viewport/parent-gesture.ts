/**
 * O gesto de prender filhos — anotação 17, lote 31.
 *
 * O `P` do editor era o do Spine: escolhe os filhos, aperta P, clica no pai.
 * O Humberto pediu o **B do Spriter**, que é ao contrário: escolhe o pai,
 * segura a tecla, clica em cada filho; cada clique prende um, clicar de novo
 * solta, soltar a tecla termina.
 *
 * **Lote 63a: o P é um gesto só.** Havia um segundo, o do Spine (escolhe os
 * filhos, P, clica no pai), e a janela "Virar filho de qual osso?". O
 * Humberto, 11/09: *"O QUE É ISSO? ISSO NÃO TEM NO SPRITER. É SÓ ESCOLHER O
 * OSSO, APERTAR P E IR VIRANDO PAI DE QUEM EU CLICAR."* Os dois saíram. Com
 * a seleção que não é um osso só, o P diz no rodapé o que fazer, e mais nada.
 *
 * Módulo puro: nada de DOM, nada de `EditorDoc`. Ele lê o `BoneFile` e diz o
 * que o clique significa; quem roda o comando é a ferramenta Selecionar.
 */

import type { BoneFile } from '../../../runtime/src/index.js';
import type { Selection } from '../contract.js';
import { reparentVerdict, type ParentMap } from '../doc/bones.js';

/** O que a tecla P faz agora. */
export type ParentGesture =
  /** Um osso escolhido: ele é o pai, e os cliques vão prendendo filhos. */
  | 'pegar-filhos'
  /** Qualquer outra seleção: não há gesto, só o recado de escolher um osso. */
  | 'nada';

/**
 * O que a tecla P faz com esta seleção: um osso, e só ele → `pegar-filhos`.
 * Dois ossos, um desenho junto, ou nada → `nada` (lote 63a).
 */
export function parentGesture(selection: Selection): ParentGesture {
  const drawings = selection.slots.length + selection.attachments.length;
  return selection.bones.length === 1 && drawings === 0 ? 'pegar-filhos' : 'nada';
}

/** Um alvo de clique dentro do gesto: um osso, ou o slot de um desenho. */
export interface GrabTarget {
  kind: 'bone' | 'slot';
  name: string;
}

/** O que um clique fez, ou por que não fez nada. Vira comando e vira recado. */
export type GrabStep =
  | { do: 'prender'; target: GrabTarget; from: string }
  | { do: 'soltar'; target: GrabTarget; back: string }
  /** Já era filho antes do gesto: sai de baixo do pai e fica solto (P1). */
  | { do: 'desafilhar'; target: GrabTarget; to: string }
  /** O alvo é ancestral do pai: os dois trocam de lugar (P2). */
  | { do: 'trocar'; target: GrabTarget; from: string }
  | { do: 'nada'; why: string };

/**
 * Quem **já é filho** do osso escolhido — item P1, 13/09/2026.
 *
 * O Humberto: *"quando eu seleciono um osso e aperto P, os ossos deviam
 * mostrar quem é filho desse osso; o Spriter faz isso com cor e opacidade
 * leve, aí eu posso clicar para transformar em filho ou desafilhar."* Antes, o
 * `P` afilhava às cegas: não dava para ver o que já estava preso.
 *
 * Filhos diretos, e só: quem está mais fundo é filho de outro osso, e pintar
 * a árvore inteira diria que tudo aquilo depende deste — o contrário do que a
 * pintura tem que contar. Os slots entram porque o desenho também é filho.
 *
 * Puro: quem pinta é a ferramenta Selecionar, no `drawOverlay`.
 */
export function grabChildren(
  file: BoneFile, parent: string, applied?: ParentMap,
): { bones: string[]; slots: string[] } {
  const paiDe = (name: string, doArquivo: string | undefined): string | undefined =>
    (applied?.has(name) === true ? applied.get(name) : doArquivo);
  return {
    bones: (file.bones ?? []).filter((b) => paiDe(b.name, b.parent) === parent).map((b) => b.name),
    slots: (file.slots ?? []).filter((s) => s.bone === parent).map((s) => s.name),
  };
}

/** A chave do mapa: o mesmo nome pode ser de um osso e de um slot. */
function keyOf(target: GrabTarget): string {
  return `${target.kind}:${target.name}`;
}

/**
 * O pai de agora, ou `null` quando o alvo não existe no arquivo.
 *
 * Com o mapa do instante (§9.4), o pai é o **daquele quadro**: no quadro 12 a
 * arma está nas costas, e clicar nela ali tem que ver as costas, não a mão.
 */
function currentParent(file: BoneFile, target: GrabTarget, applied?: ParentMap): string | null {
  if (target.kind === 'bone') {
    const bone = (file.bones ?? []).find((b) => b.name === target.name);
    if (bone === undefined) return null;
    if (applied?.has(target.name) === true) return applied.get(target.name) ?? null;
    return bone.parent ?? null;
  }
  const slot = (file.slots ?? []).find((s) => s.name === target.name);
  return slot === undefined ? null : slot.bone;
}

/**
 * Um gesto em andamento: o pai escolhido e o que já foi preso nele.
 *
 * Guardar o pai antigo de cada um é o que faz o segundo clique **soltar**: ele
 * não desfaz o passo anterior (o histórico é uma linha só, e desfazer no meio
 * dela é outra coisa), ele anda para a frente devolvendo o filho a quem o
 * tinha. Três cliques, três passos de desfazer.
 */
export class ChildGrab {
  /** Filho preso neste gesto → o pai que ele tinha antes. */
  private readonly taken = new Map<string, string>();
  constructor(readonly parent: string) {}

  /** Quantos estão presos agora. O recado do fim conta por aqui. */
  get count(): number {
    return this.taken.size;
  }

  /** `true` se este alvo foi preso neste gesto e ainda está preso. */
  holds(target: GrabTarget): boolean {
    return this.taken.has(keyOf(target));
  }

  /**
   * O que este clique faz, já anotado no gesto.
   *
   * `null` é clique no vazio. Chamar de novo com o mesmo alvo alterna: prende,
   * solta, prende.
   */
  click(file: BoneFile, target: GrabTarget | null, applied?: ParentMap): GrabStep {
    if (target === null) {
      return { do: 'nada', why: 'Nenhum osso nem desenho aqui. Clique em cima de um, ou solte P' };
    }
    const key = keyOf(target);
    const back = this.taken.get(key);
    if (back !== undefined) {
      this.taken.delete(key);
      return { do: 'soltar', target, back };
    }
    if (target.kind === 'bone' && target.name === this.parent) {
      return { do: 'nada', why: `${target.name} não pode ser filho de si mesmo` };
    }
    const old = currentParent(file, target, applied);
    if (old === null) {
      return target.kind === 'bone'
        ? { do: 'nada', why: `${target.name} é a raiz: a raiz não vira filho de ninguém` }
        : { do: 'nada', why: `${target.name} não está no arquivo` };
    }
    // Item P1: já era filho antes do gesto, então o clique **desafilha** — é
    // o "clicar de novo" que ele pediu, e o par do que a pintura mostra. Sai
    // de baixo do pai e fica solto, na raiz: o mesmo "solto" da Árvore.
    const raiz = (file.bones ?? [])[0]?.name ?? null;
    if (old === this.parent) {
      if (raiz === null || raiz === this.parent) {
        return { do: 'nada', why: `${target.name} já está solto na raiz` };
      }
      return { do: 'desafilhar', target, to: raiz };
    }
    if (target.kind === 'bone') {
      const veredito = reparentVerdict(file, target.name, this.parent, applied);
      // Item P2: o alvo está ACIMA do pai escolhido. Pendurar um debaixo do
      // outro seria um ciclo; o gesto é trocar os dois de lugar, o mesmo que o
      // arrasto da Árvore faz desde a v12.0. Não entra no `taken`: um segundo
      // clique encontra o alvo já filho e desafilha, que é um passo para a
      // frente, e o `Ctrl+Z` continua desfazendo a troca inteira.
      if (veredito === 'swap') return { do: 'trocar', target, from: old };
      if (veredito === 'no') {
        return { do: 'nada', why: `${target.name} não pode virar filho de ${this.parent}` };
      }
    }
    this.taken.set(key, old);
    return { do: 'prender', target, from: old };
  }
}

// ---------------------------------------------------------------------------
// Os recados do rodapé, num lugar só
// ---------------------------------------------------------------------------

/**
 * O convite quando o gesto abre pelo MENU — rodada 17, J2 (05/10/2026).
 *
 * Base → *Virar filho de…* só repetia a frase do P ("Segure P…") e não fazia
 * nada. A janela com a lista de ossos saiu por ordem do Humberto (lote 63a: *"é
 * só escolher o osso, apertar P e ir virando pai de quem eu clicar"*); o item
 * agora **abre o mesmo gesto**, sem a tecla embaixo: cada clique prende ou
 * solta, e o Esc (ou o item de novo) termina.
 */
export function grabMenuNotice(parent: string): string {
  return `Virar filho de ${parent}: clique em quem vira filho (clicar de novo solta). Esc termina`;
}

/** O convite, quando P desce com um osso escolhido. */
export function grabOpenNotice(parent: string): string {
  return `Segure P: o que está pintado já é filho de ${parent}. Clique para prender ou soltar`;
}

/**
 * O recado do P quando a seleção não é um osso só — lote 63a.
 *
 * Rodada 23, defeito 7: com um filho possível escolhido (o emissor, uma
 * imagem), o recado diz o nome dele e a ordem inteira. A ordem é uma só, a do
 * menu Base → Virar filho de… e a da Árvore: **o osso primeiro**, depois P
 * segurado e o clique no filho.
 */
export function chooseBoneNotice(child?: string | null): string {
  if (child === undefined || child === null) return 'Escolha um osso. Depois segure P e clique em quem vira filho dele';
  return `Para prender ${child}: o osso vem primeiro. Escolha o osso, depois segure P e clique em ${child}`;
}

/**
 * O clique num osso com o P embaixo, depois do recado acima — rodada 23.
 *
 * A forma: *"o gesto na ordem trocada caía num clique comum, calado"*. O
 * clique escolhia o osso e ninguém dizia nada; quem seguia a outra ordem
 * (a do Spine: o filho primeiro) achava que o P não funcionava. Agora o osso
 * fica escolhido, e o rodapé diz o passo que falta.
 */
export function boneFirstNotice(bone: string, child: string): string {
  return `${bone} escolhido. Agora segure P de novo e clique em ${child}: ele vira filho de ${bone}`;
}

/** O filho possível na seleção, pelo nome que o rodapé diz, ou `null`. */
export function childInSelection(selection: Selection): string | null {
  if (selection.bones.length > 0) return null;
  return selection.attachments[0]?.slot ?? selection.slots[0] ?? null;
}

/** O recado de cada clique que fez alguma coisa. */
export function stepNotice(step: GrabStep, parent: string): string {
  if (step.do === 'nada') return step.why;
  if (step.do === 'prender') return `${step.target.name} virou filho de ${parent}`;
  if (step.do === 'desafilhar') return `${step.target.name} saiu de ${parent} e ficou solto`;
  if (step.do === 'trocar') return `${step.target.name} e ${parent} trocaram de lugar: ${step.target.name} agora é filho de ${parent}`;
  return `${step.target.name} voltou para ${step.back}`;
}

/** O recado do fim, quando a tecla sobe. */
export function grabCloseNotice(parent: string, count: number): string {
  if (count === 0) return 'Terminou sem pegar ninguém';
  return `${parent} ficou com ${count} ${count === 1 ? 'filho novo' : 'filhos novos'}`;
}

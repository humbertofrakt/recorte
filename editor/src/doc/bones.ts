/**
 * Quem é pai de quem — lote A4, plano arrumação (v10.7).
 *
 * `canReparent`, `isDescendantBone` e `sortBonesTopologically` moravam em
 * `panels/tree-model.ts`, e `doc/reparent.ts` (base) importava de um painel.
 * A ordem "pai antes dos filhos" (`bonesDepthFirst`) é a mesma que a Árvore
 * usa para desenhar as linhas; ela continua exportando os mesmos nomes, daqui.
 */

import type { BoneDef, BoneFile } from '../../../runtime/src/index.js';

/**
 * O pai de cada osso **no instante de agora** — lote 1 de 14/09/2026.
 *
 * A chave `parent` (§9.4) muda quem é pai de quem dentro da animação: no
 * quadro 12 a arma está nas costas, e não na mão. Quem pergunta "isto pode
 * virar filho daquilo?" — e quem desenha a Árvore — tem que olhar a árvore
 * **daquele quadro**, senão o editor mostra uma hierarquia que não é a da tela
 * e oferece trocas que o runtime vai ignorar com `PARENT_CYCLE`.
 *
 * O mapa sai do esqueleto vivo da cena (`appliedParents`, em `doc/reparent.ts`),
 * que já aplica a chave. Sem mapa, vale a árvore do arquivo: o caso da Montagem.
 */
export type ParentMap = ReadonlyMap<string, string | undefined>;

/**
 * Os ossos em profundidade: pai antes dos filhos, cada filho logo depois do
 * pai, com o nível de cada um. Um osso num ciclo sai no fim, no nível 0, para
 * quem usa conseguir consertar.
 */
export function bonesDepthFirst(
  bones: readonly BoneDef[], applied?: ParentMap,
): Array<{ index: number; depth: number }> {
  const byName = new Map<string, number>();
  bones.forEach((bone, i) => { if (!byName.has(bone.name)) byName.set(bone.name, i); });

  const children = new Map<string, number[]>();
  const roots: number[] = [];
  bones.forEach((bone, i) => {
    // Com o mapa do instante (§9.4), a árvore desenhada é a DAQUELE quadro: no
    // quadro 12 a arma está nas costas, e a Árvore tem que dizer isso.
    const parent = i === 0 ? undefined
      : applied?.has(bone.name) === true ? applied.get(bone.name) : bone.parent;
    if (parent === undefined || !byName.has(parent) || byName.get(parent) === i) {
      roots.push(i);
      return;
    }
    const list = children.get(parent);
    if (list) list.push(i);
    else children.set(parent, [i]);
  });

  const out: Array<{ index: number; depth: number }> = [];
  const seen = new Set<number>();
  const walk = (index: number, depth: number): void => {
    if (seen.has(index)) return;
    seen.add(index);
    out.push({ index, depth });
    for (const child of children.get(bones[index]!.name) ?? []) walk(child, depth + 1);
  };
  for (const root of roots) walk(root, 0);
  // Anything left is part of a cycle; show it flat so the user can fix it.
  bones.forEach((_, i) => walk(i, 0));
  return out;
}

/**
 * O pai de cada osso **no instante de agora** — lote 1 de 14/09/2026.
 *
 * A chave `parent` (§9.4) muda quem é pai de quem dentro da animação: no
 * quadro 12 a arma está nas costas, e não na mão. Quem pergunta "isto pode
 * virar filho daquilo?" tem que perguntar contra a árvore **daquele quadro**,
 * senão o editor oferece uma troca que o runtime vai ignorar com
 * `PARENT_CYCLE` — um editor que mente para quem está animando.
 *
 * O mapa sai do esqueleto vivo da cena (`doc.skeleton`), que já aplica a
 * chave; aqui ele é só um `Map<filho, pai>` para as funções puras deste
 * arquivo. Sem mapa, vale a árvore do arquivo, que é o caso da Montagem.
 */
/** `true` when `name` is `ancestor` or lives under it. */
export function isDescendantBone(
  file: BoneFile, name: string, ancestor: string, applied?: ParentMap,
): boolean {
  const parents = new Map<string, string | undefined>();
  for (const bone of file.bones ?? []) parents.set(bone.name, bone.parent);
  if (applied !== undefined) for (const [filho, pai] of applied) parents.set(filho, pai);
  let current: string | undefined = name;
  const guard = new Set<string>();
  while (current !== undefined) {
    if (current === ancestor) return true;
    if (guard.has(current)) return false;
    guard.add(current);
    current = parents.get(current);
  }
  return false;
}

/**
 * O que soltar `child` em cima de `parent` faz — item 3.2, 13/09/2026.
 *
 * | Resposta | Quando | O que acontece |
 * |:---|:---|:---|
 * | `ok` | o caso de sempre | `child` vira filho de `parent` |
 * | `swap` | `parent` está **debaixo** de `child` | os dois **trocam de lugar** |
 * | `no` | falta um dos dois, são o mesmo, ou `child` é a raiz | nada |
 *
 * O `swap` é o pedido do Humberto: *"mandei um osso filho virar o pai do pai
 * dele e ele não virou"*. Pendurar o pai debaixo do próprio filho seria um
 * ciclo, e o arquivo não aguenta um — recusar era o certo para o arquivo e o
 * errado para a mão. O gesto que falta é trocar os dois de lugar, e quem faz
 * isso é o `SwapBones` de `doc/reparent.ts`.
 *
 * A raiz nunca sai do lugar: ela é o mundo (lote 60a), e o formato pede
 * exatamente um osso sem pai (§4.2).
 */
export type ReparentVerdict = 'ok' | 'swap' | 'no';

export function reparentVerdict(
  file: BoneFile, child: string, parent: string, applied?: ParentMap,
): ReparentVerdict {
  const bones = file.bones ?? [];
  if (bones.length === 0) return 'no';
  if (child === parent) return 'no';
  if (bones[0]!.name === child) return 'no';
  if (!bones.some((b) => b.name === child)) return 'no';
  if (!bones.some((b) => b.name === parent)) return 'no';
  return isDescendantBone(file, parent, child, applied) ? 'swap' : 'ok';
}

/**
 * `true` when dragging `child` onto `parent` is allowed: both must exist, the
 * root bone cannot be moved, and a bone cannot become its own descendant.
 *
 * Continua sendo a pergunta do caminho comum. Quem quer saber se o gesto de
 * **trocar de lugar** cabe pergunta ao `reparentVerdict`.
 */
export function canReparent(
  file: BoneFile, child: string, parent: string, applied?: ParentMap,
): boolean {
  return reparentVerdict(file, child, parent, applied) === 'ok';
}

/**
 * Os ossos de uma lista que **mandam** no gesto: os que não têm nenhum
 * ancestral dentro da própria lista — item 2.1 do plano de 13/09/2026.
 *
 * O Humberto: *"seleciono vários objetos e eles viram bagunça quando movo"*.
 * Um osso filho já anda junto com o pai, porque a pose dele é relativa ao pai.
 * Escrever o mesmo deslocamento nos dois faz o filho andar **duas vezes** — uma
 * pelo pai, outra por ele mesmo — e a seleção se desmancha. A regra é a dos
 * três programas: escolheu pai e filho, quem recebe a conta é só o pai.
 *
 * Morava em `viewport/tools/translate.ts`, e subiu para cá no lote do `P`
 * (v12.1): as setas do teclado precisam da mesma conta, e elas moram em
 * `tools/select.ts`, que é quem o `translate.ts` importa — pedir de volta faria
 * um círculo. Quem é pai de quem é assunto deste arquivo.
 *
 * Puro: recebe o arquivo e os nomes, devolve os nomes, na mesma ordem.
 */
export function topLevelBones(file: BoneFile, names: readonly string[]): string[] {
  const chosen = new Set(names);
  const parents = new Map<string, string | undefined>(
    (file.bones ?? []).map((bone) => [bone.name, bone.parent]),
  );
  return names.filter((name) => {
    // O `guard` para a volta num arquivo com ciclo: o formato não permite,
    // mas um arquivo de fora pode chegar torto e isto não pode travar a cena.
    const guard = new Set<string>([name]);
    let up = parents.get(name);
    while (up !== undefined && !guard.has(up)) {
      if (chosen.has(up)) return false;
      guard.add(up);
      up = parents.get(up);
    }
    return true;
  });
}

/** Re-sorts bones depth first so every parent comes before its children. */
export function sortBonesTopologically(bones: BoneDef[]): BoneDef[] {
  const sorted = bonesDepthFirst(bones).map(({ index }) => bones[index]!);
  return sorted.length === bones.length ? sorted : bones.slice();
}

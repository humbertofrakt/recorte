/**
 * **Que ossos existem com esta pilha de peles** — rodada 12 (04/10/2026), S8 e S9.
 *
 * O Spine tem duas caixas, *Hide skin bones* (na Árvore) e *Hide viewport skin
 * bones* (na cena): o osso de uma skin que não está à vista **some** dos dois
 * lugares (Spine User Guide, pág. 115). O nosso fazia sumir só a imagem: o osso
 * ficava na cena e na Árvore, e o rodapé tinha acabado de dizer que ele
 * sumiria (rodada 1, S8, foto `62`).
 *
 * Some, com a pilha de agora:
 *
 * | Quem | Por quê |
 * |:---|:---|
 * | osso `skinRequired` que nenhuma pele da pilha liga | é o osso de uma skin que saiu (§7.1) — S8 |
 * | osso que uma pele da pilha **apagou** | decisão 5 das skins: apagar com a skin no lápis apaga só nela — S9 |
 * | os filhos de quem some | o Spine também: filho de osso inativo não aparece |
 *
 * **O formato não sabe dizer "este osso não existe nesta skin"** (`skin.bones`
 * é união: só LIGA osso). O que a skin apaga, ela esconde pelo que o formato já
 * tem — `null` em cada desenho pendurado (§4.4) —, e o NOME do osso apagado é
 * marca do editor, em `skin.extensions.RECORTE_editor_state.ossosApagados`
 * (regra 6): o jogo calcula o osso e não desenha nada nele; a Árvore e a cena
 * deixam de mostrá-lo. Plano mandado ao Diretor antes de escrever.
 *
 * Puro: nada de DOM. A Árvore, a cena e a aba Peles perguntam aqui.
 */

import type { BoneFile } from '../../../runtime/src/index.js';
import { EDITOR_EXTENSION } from '../contract.js';

/** O campo da marca, dentro de `skin.extensions.RECORTE_editor_state`. */
export const REMOVED_BONES_FIELD = 'ossosApagados';

type SkinDef = NonNullable<BoneFile['skins']>[number] & { extensions?: Record<string, unknown> };

function skinDef(file: BoneFile, name: string): SkinDef | undefined {
  return (file.skins ?? []).find((skin) => skin.name === name) as SkinDef | undefined;
}

/** Os ossos que a pele `skin` apagou só nela (S9), na ordem em que foram apagados. */
export function removedBonesOf(file: BoneFile, skin: string): string[] {
  const state = skinDef(file, skin)?.extensions?.[EDITOR_EXTENSION] as Record<string, unknown> | undefined;
  const list = state?.[REMOVED_BONES_FIELD];
  return Array.isArray(list) ? list.filter((name): name is string => typeof name === 'string') : [];
}

/**
 * Grava a lista de ossos apagados da pele, **tirando o campo** quando ela fica
 * vazia — e a extensão inteira, quando não sobra nada nela: o arquivo de quem
 * apagou e devolveu tem de voltar letra por letra.
 */
export function writeRemovedBones(file: BoneFile, skin: string, bones: readonly string[]): void {
  const def = skinDef(file, skin);
  if (def === undefined) return;
  if (bones.length === 0) {
    const ext = def.extensions;
    const state = ext?.[EDITOR_EXTENSION] as Record<string, unknown> | undefined;
    if (state === undefined) return;
    delete state[REMOVED_BONES_FIELD];
    if (Object.keys(state).length === 0) delete ext![EDITOR_EXTENSION];
    if (Object.keys(ext!).length === 0) delete def.extensions;
    return;
  }
  def.extensions ??= {};
  const state = (def.extensions[EDITOR_EXTENSION] ??= {}) as Record<string, unknown>;
  state[REMOVED_BONES_FIELD] = [...bones];
}

/** A lista de resolução da §4.4: os `includes` de cada pele, e então ela. */
function resolution(file: BoneFile, stack: readonly string[]): string[] {
  const out: string[] = [];
  const expand = (name: string, seen: Set<string>): void => {
    if (seen.has(name)) return;
    seen.add(name);
    for (const inc of skinDef(file, name)?.includes ?? []) expand(inc, seen);
    if (!out.includes(name)) out.push(name);
  };
  for (const name of stack) expand(name, new Set());
  return out;
}

/** O osso e todos os de baixo dele, pelo pai escrito no arquivo. */
export function boneAndBelow(file: BoneFile, roots: Iterable<string>): Set<string> {
  const out = new Set<string>(roots);
  let grew = true;
  while (grew) {
    grew = false;
    for (const bone of file.bones ?? []) {
      if (bone.parent !== undefined && out.has(bone.parent) && !out.has(bone.name)) {
        out.add(bone.name);
        grew = true;
      }
    }
  }
  return out;
}

/**
 * Os ossos que **não existem** com a pilha `stack` (de baixo para cima): os de
 * skin que nenhuma pele ligada liga, os que uma pele ligada apagou, e os filhos
 * de todos eles. A raiz nunca some: ela é o mundo.
 */
export function bonesGone(file: BoneFile, stack: readonly string[]): Set<string> {
  const lista = resolution(file, stack);
  const ligados = new Set(lista.flatMap((name) => skinDef(file, name)?.bones ?? []));
  const raizes: string[] = [];
  for (const bone of file.bones ?? []) {
    if (bone.skinRequired === true && !ligados.has(bone.name)) raizes.push(bone.name);
  }
  for (const name of lista) raizes.push(...removedBonesOf(file, name));
  const gone = boneAndBelow(file, raizes);
  const root = file.bones?.[0]?.name;
  if (root !== undefined) gone.delete(root);
  return gone;
}

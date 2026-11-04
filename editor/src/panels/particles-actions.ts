/**
 * A porta **Partículas → Prender ao osso escolhido** — rodada 6 (05/10/2026),
 * `05 O DESENHO DOS MENUS`, §9.
 *
 * A rodada 15 fez o emissor se prender pela tecla P, pela Árvore e pelo campo
 * Osso da ficha: os três passam por `runReparent`, e o emissor fica onde está
 * na tela. O menu chama o MESMO `runReparent`. O osso é o escolhido junto com
 * o emissor; sem osso escolhido, a janela pergunta qual.
 */

import type { EditorDoc } from '../contract.js';
import { corpoDe } from '../contract.js';
import { registerAction } from '../ui/actions.js';
import { askPick } from '../ui/dialog.js';
import { runReparent } from '../doc/reparent.js';
import { selectedEmitter, selectionForRow } from './particles-model.js';

/** Por que não dá para prender agora, ou `null`. */
export function whyCannotAttachEmitter(doc: EditorDoc): string | null {
  return selectedEmitter(corpoDe(doc).file, doc.selection) === null
    ? 'Escolha um emissor primeiro (clique na estrela dele na cena, ou no painel Partículas)'
    : null;
}

/** **Prender ao osso escolhido**: o emissor vira filho do osso, sem sair do lugar. */
export async function attachEmitterToBone(doc: EditorDoc): Promise<boolean> {
  const file = corpoDe(doc).file;
  const row = selectedEmitter(file, doc.selection);
  if (row === null) { doc.notice(whyCannotAttachEmitter(doc) ?? ''); return false; }
  let osso: string | null = doc.selection.bones[0] ?? null;
  if (osso === null) {
    const nomes = (file.bones ?? []).map((bone) => bone.name);
    osso = await askPick({
      title: `Prender ${row.slot} a um osso`,
      placeholder: 'Qual osso?',
      search: (text) => nomes
        .filter((nome) => nome.toLowerCase().includes(String(text).trim().toLowerCase()))
        .map((nome) => ({ id: nome, label: nome, ...(nome === row.bone ? { aside: 'agora' } : {}) })),
    });
    if (osso === null) return false;
  }
  if (osso === row.bone) {
    doc.notice(`${row.slot} já está preso a ${osso}`);
    return false;
  }
  const { bones, slots, attachments } = selectionForRow(row);
  runReparent(doc, { bones, slots, attachments }, osso, `Prender ${row.slot} a ${osso}`);
  return true;
}

/** Registra a porta. Devolve como tirá-la. */
export function registerParticleActions(doc: EditorDoc): Array<() => void> {
  return [
    registerAction('prender-emissor', {
      run: () => { void attachEmitterToBone(doc); },
      enabled: () => whyCannotAttachEmitter(doc) === null,
      why: () => whyCannotAttachEmitter(doc),
    }),
  ];
}

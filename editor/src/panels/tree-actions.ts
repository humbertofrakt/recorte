/**
 * As ações da Árvore que não precisam da Árvore na tela — lote A2 (v10.5).
 *
 * Criar osso, ponto, caixa, máscara, evento e parâmetro, apagar, duplicar e
 * limpar os desenhos vazios: a conta mora nos comandos de `tree-model.ts` e em
 * `doc/duplicate.ts`, e nada aqui lê o DOM do painel. Por isso elas são
 * registradas uma vez, no arranque (`ui/register-actions.ts`), e o menu
 * Esqueleto funciona com a aba Árvore fechada. Os botões da Árvore chamam as
 * MESMAS funções daqui: uma função, um dono.
 */

import type { EditorDoc, Selection } from '../contract.js';
import { emptySelection, corpoDe } from '../contract.js';
import { Duplicate, runDuplicate } from '../doc/duplicate.js';
import { DiscardGuarded, guardNotice, guardedByPiece, readGuarded } from '../doc/guarded-keys.js';
import type { BoneFile } from '../../../runtime/src/index.js';
import { askUser } from '../ui/dialog.js';
import { registerAction } from '../ui/actions.js';
import { editingSkinOf, visibleSkinsOf } from '../viewport/onion.js';
// Degrau 9 (I5): o osso novo nasce na pele do lápis, num desfazer só.
import { bornInSkinNotice, runBornInSkin } from './skins-model.js';
import { DeleteInSkin, deleteInSkinNotice, planDeleteInSkin } from './skins-delete.js';
import { setActiveTool } from '../viewport/tools/registry.js';
import { chooseEvent } from './event-key-editor.js';
import { EMPTY_PRESET, addPresetEmitter } from './particle-presets.js';
import {
  AddBone, AddClipping, AddEvent, AddParameter, CleanEmptySlots, DeleteItems,
  canDeleteSelection, shapeTarget,
} from './tree-model.js';
import { deleteCount, deleteNeedsAsking, deletePlan, deleteSays, deleteWho, type DeletePlan } from './tree-rows.js';

/**
 * Osso novo, filho do osso escolhido; sem osso escolhido, solto.
 *
 * **Com o lápis aceso numa pele, ele nasce dentro dela** — degrau 9 (I5). Era
 * a queixa do teste ao vivo de 16/09: *"o lápis não faz nada"*. O desenho já
 * nascia na pele; o osso, não.
 */
export function addBone(doc: EditorDoc): void {
  const parent = doc.selection.bones[0] ?? null;
  const corpo = corpoDe(doc);
  const command = new AddBone(corpo.file, parent);
  const skin = runBornInSkin(corpo, command, 'bones', command.name, editingSkinOf(doc));
  // J3: nasce ESCOLHIDO (a Árvore abre e rola até ele) e o rodapé diz onde.
  doc.select({ ...emptySelection(), bones: [command.name] });
  if (skin !== null) doc.notice(bornInSkinNotice(`O osso "${command.name}"`, skin));
  else doc.notice(newBoneNotice(command.name, parent === corpo.file.bones?.[0]?.name ? null : parent));
}

/** O rodapé do osso novo — J3: onde ele nasceu, e o passo seguinte. */
export function newBoneNotice(name: string, parent: string | null): string {
  return parent === null
    ? `Osso "${name}" criado, solto, na origem. Arraste a ponta para esticar`
    : `Osso "${name}" criado, filho de "${parent}", na ponta dele. Arraste a ponta para esticar`;
}

/**
 * **Limpar desenhos vazios** — 13/09/2026.
 *
 * "Novo → Slot" saiu junto com esta função nascer: ele criava um slot vazio, e
 * era a única porta que fazia isso sem ninguém pedir. Aqui é o contrário: a
 * vassoura dos que ficaram, dos arquivos que vêm de fora, e de quando se apaga
 * um desenho de dentro de um slot que tinha mais de um.
 *
 * A conta está em `emptySlots`; aqui só o aviso e o passo de desfazer.
 */
export function cleanEmptySlots(doc: EditorDoc): void {
  const command = new CleanEmptySlots(corpoDe(doc).file);
  if (!command.hasWork) {
    doc.notice('Nenhum desenho vazio');
    return;
  }
  const quantos = command.names.length;
  corpoDe(doc).run(command);
  doc.notice(quantos === 1 ? '1 desenho vazio apagado' : `${quantos} desenhos vazios apagados`);
}

/**
 * Evento novo — e, desde o lote 1 do chat D (28/09), **escolhido e dito**.
 *
 * A régua do arroz: *"o que eu criei apareceu na tela?"* e *"o programa disse
 * o que aconteceu?"*. Antes ele nascia, o rodapé dizia "Novo evento", e não
 * havia linha nenhuma para achar. Agora ele é o escolhido (Propriedades abre
 * na ficha dele, e a linha acende no fim da Árvore), e o rodapé diz onde ele
 * mora e qual é o passo seguinte.
 */
export function addEvent(doc: EditorDoc): void {
  const command = new AddEvent(corpoDe(doc).file);
  corpoDe(doc).run(command);
  chooseEvent(command.name);
  doc.select(emptySelection());
  doc.notice(addedEventNotice(command.name));
}

/** Parâmetro novo, escolhido e dito — o mesmo do `addEvent`. */
export function addParameter(doc: EditorDoc): void {
  const command = new AddParameter(corpoDe(doc).file);
  corpoDe(doc).run(command);
  doc.select({ ...emptySelection(), parameters: [command.name] });
  doc.notice(addedParameterNotice(command.name));
}

/** O rodapé do evento novo: onde ele está, e o passo seguinte. */
export function addedEventNotice(name: string): string {
  return `Evento "${name}" criado, no fim da Árvore. O som fica em Propriedades`;
}

/** O rodapé do parâmetro novo. */
export function addedParameterNotice(name: string): string {
  return `Parâmetro "${name}" criado, no fim da Árvore. A faixa fica em Propriedades`;
}

/**
 * A máscara NÃO precisa de gesto: ela nasce num quadrado de 100 e se ajusta
 * arrastando os vértices com a Malha, ou copiando a silhueta de um desenho.
 * Por isso ela é criada direto pelo menu.
 */
export function addClipping(doc: EditorDoc): void {
  const bone = doc.selection.bones[0] ?? corpoDe(doc).file.bones?.[0]?.name;
  if (bone === undefined) {
    doc.notice('Crie um osso antes de criar uma máscara');
    return;
  }
  const command = new AddClipping(corpoDe(doc).file, bone, visibleSkinsOf(doc));
  corpoDe(doc).run(command);
  doc.select({
    ...emptySelection(),
    attachments: [{ slot: command.name, attachment: command.name }],
  });
  doc.notice(`Máscara ${command.name} criada. Ajuste "Recorta até" nas Propriedades`);
}

/**
 * **Emissor de partículas** — o volante da extensão `BONE_particles`.
 *
 * Como a máscara, e pelo mesmo motivo: o emissor **não precisa de gesto na
 * cena**. Ele é um ponto preso ao osso, e onde esse ponto está é `shape` e
 * `radius` na ficha, não um arrasto. Um gesto obrigatório aqui só faria a
 * pessoa clicar num lugar qualquer para depois arrumar nos campos.
 *
 * Nasce escolhido, para Propriedades abrir na ficha dele.
 */
export function addParticleEmitter(doc: EditorDoc): void {
  // Rodada 15 (linhas 6 e 7): o vazio é o modelo `EMPTY_PRESET` — nasce com o
  // ponto suave, e, sem nada escolhido, no osso mais perto do meio da cena. Um
  // gesto, um dono: o mesmo `addPresetEmitter` dos quatro modelos.
  addPresetEmitter(doc, EMPTY_PRESET);
}

/** Por que "Chaves guardadas…" está cinza. */
export const NO_GUARDED_KEYS = 'Nenhuma chave guardada: elas aparecem quando se tira da base uma peça que tinha chaves';

/** As linhas da janela das chaves guardadas, uma por peça. */
export function guardedLines(file: BoneFile): string[] {
  const tipo = { osso: 'osso', imagem: 'imagem', regra: 'regra' } as const;
  return guardedByPiece(file).map((row) => `${tipo[row.tipo]} "${row.nome}": `
    + `${row.keys === 1 ? '1 chave' : `${row.keys} chaves`}, `
    + `em ${row.animations === 1 ? '1 animação' : `${row.animations} animações`}`);
}

/**
 * **Chaves guardadas…** — rodada 13. Mostra o que está guardado, de quem, e
 * deixa jogar fora de propósito (regra 21: nada escondido). Ctrl+Z devolve.
 */
export async function showGuardedKeys(doc: EditorDoc): Promise<void> {
  const corpo = corpoDe(doc);
  const lines = guardedLines(corpo.file);
  if (lines.length === 0) {
    doc.notice(NO_GUARDED_KEYS);
    return;
  }
  const jogar = await askUser({
    title: 'Chaves guardadas',
    lead: 'São as chaves das peças tiradas da base. Ponha na base uma peça com o mesmo nome '
      + 'e do mesmo tipo, e elas voltam para as animações.',
    lines,
    yesLabel: 'Jogar fora todas',
    noLabel: 'Guardar',
  });
  if (!jogar) return;
  const command = new DiscardGuarded();
  corpo.run(command);
  doc.notice(`${command.dropped === 1 ? '1 chave guardada jogada fora' : `${command.dropped} chaves guardadas jogadas fora`}. Ctrl+Z devolve`);
}

/** Apaga o que está escolhido. Só a raiz escolhida: diz, em vez de sujar o arquivo. */
export function deleteSelected(
  doc: EditorDoc,
  /**
   * Rodada 43, lote 4 (S1, decisão do Diretor): o osso com gente embaixo
   * PERGUNTA antes, dizendo quantos ossos e desenhos vão junto — o Spine e o
   * DragonBones perguntam. Quem passa a pergunta é a porta de gente (a tecla,
   * o menu, a lixeira); sem ela (os testes), apaga direto, como sempre.
   */
  ask?: (selection: Selection, plan: DeletePlan) => Promise<boolean>,
): void {
  const selection = doc.selection;
  const count = selection.bones.length + selection.slots.length
    + selection.constraints.length + selection.attachments.length;
  if (count === 0) return;
  // Only the root bone picked: say so instead of running a command that
  // deletes nothing but still dirties the file and fills the undo stack.
  if (!canDeleteSelection(corpoDe(doc).file, selection)) {
    doc.notice('O osso raiz não pode ser apagado');
    return;
  }
  // Rodada 12 (S9), decisão 5 das skins: com o lápis numa skin que não é a
  // default, o osso apagado sai SÓ daquela skin, com os filhos, e o rodapé diz
  // quantos. A base e as outras skins não mudam.
  const lapis = editingSkinOf(doc);
  if (lapis !== null && lapis !== 'default' && selection.bones.length > 0) {
    const corpo = corpoDe(doc);
    const plan = planDeleteInSkin(corpo.file, lapis, selection.bones);
    if (plan !== null) {
      corpo.run(new DeleteInSkin(plan));
      doc.select(emptySelection());
      doc.notice(deleteInSkinNotice(plan));
      return;
    }
  }
  const plan = deletePlan(corpoDe(doc).file, selection);
  const apagar = (): void => {
    const command = new DeleteItems(selection);
    corpoDe(doc).run(command);
    // Rodada 43, lote 4: o rodapé diz QUEM e QUANTO (era "Apagar."). Rodada 13
    // (regra 21): as chaves guardadas não somem caladas — vêm no fim.
    const guardadas = guardNotice(command.guarded);
    doc.notice(guardadas === '' ? deleteSays(selection, plan) : `${deleteSays(selection, plan)}. ${guardadas}`);
  };
  if (ask !== undefined && deleteNeedsAsking(selection, plan)) {
    void ask(selection, plan).then((sim) => { if (sim) apagar(); });
    return;
  }
  apagar();
}

/**
 * **A pergunta do Delete** — rodada 43, lote 4 (S1). O botão diz o que vai
 * acontecer, com a conta; a lista diz quem. Esc, ou clicar fora, não apaga.
 */
export function askDelete(selection: Selection, plan: DeletePlan): Promise<boolean> {
  const quanto = deleteCount(plan, selection.attachments.length);
  return askUser({
    title: `Apagar ${deleteWho(selection)}?`,
    lead: `Vão junto: ${quanto}. Ctrl+Z volta tudo.`,
    lines: [...plan.bones.map((b) => `osso ${b}`), ...plan.slots.map((s) => `desenho ${s}`), ...plan.constraints.map((c) => `regra ${c}`)],
    yesLabel: `Apagar ${quanto}`,
    noLabel: 'Deixar como está',
  });
}

/**
 * Escolhe uma ferramenta e diz o gesto na barra de baixo.
 *
 * O menu não cria o Ponto nem a Caixa por conta própria: os dois precisam de
 * um lugar na cena, e escolher a ferramenta é o que dá esse lugar à pessoa.
 */
export function startShapeTool(doc: EditorDoc, id: 'point' | 'box'): void {
  setActiveTool(id, doc);
  const target = shapeTarget(corpoDe(doc).file, doc.selection);
  const onde = target?.kind === 'slot' ? `, dentro do slot ${target.slot}` : '';
  doc.notice(id === 'point'
    ? `Ferramenta Ponto: segure Alt e arraste na cena para criar${onde}`
    : `Ferramenta Caixa: segure Alt e arraste na cena para desenhar${onde}`);
}

/** O slot de "Ponto neste slot": o escolhido, ou o do desenho escolhido. */
export function slotForShape(selection: Selection): string | null {
  if (selection.slots.length === 1) return selection.slots[0]!;
  if (selection.slots.length === 0 && selection.attachments.length === 1) {
    return selection.attachments[0]!.slot;
  }
  return null;
}

/**
 * **Ponto neste slot** e **Caixa neste slot** — lote 40.
 *
 * Deixam escolhido **só o slot** e pegam a ferramenta. É a seleção que diz à
 * ferramenta onde o anexo nasce (`shapeTarget`): com o osso junto, ela criaria
 * um slot novo, que é o gesto de todo dia.
 */
export function startShapeToolInSlot(doc: EditorDoc, id: 'point' | 'box'): void {
  const slot = slotForShape(doc.selection);
  if (slot === null) {
    doc.notice('Escolha um slot na Árvore primeiro');
    return;
  }
  doc.select({ ...emptySelection(), slots: [slot] });
  startShapeTool(doc, id);
}

/** Registra as ações de criar, apagar e duplicar. Devolve como tirá-las. */
export function registerTreeActions(doc: EditorDoc): Array<() => void> {
  return [
    // Duplicar — anotação 26, lote 37. Um osso leva o membro inteiro.
    registerAction('duplicar', {
      run: () => { runDuplicate(doc); },
      enabled: () => new Duplicate(corpoDe(doc).file, doc.selection).hasWork,
    }),
    registerAction('novo-osso', { run: () => addBone(doc) }),
    registerAction('novo-evento', { run: () => addEvent(doc) }),
    registerAction('novo-parametro', { run: () => addParameter(doc) }),
    // "Novo → Ponto" e "Novo → Caixa" ESCOLHEM A FERRAMENTA em vez de criar
    // no escuro. A barra de baixo diz o gesto.
    registerAction('novo-ponto', { run: () => startShapeTool(doc, 'point') }),
    registerAction('novo-caixa', { run: () => startShapeTool(doc, 'box') }),
    // Lote 40: o mesmo gesto, mas o anexo entra no slot escolhido.
    registerAction('novo-ponto-no-slot', {
      run: () => startShapeToolInSlot(doc, 'point'),
      enabled: () => slotForShape(doc.selection) !== null,
    }),
    registerAction('novo-caixa-no-slot', {
      run: () => startShapeToolInSlot(doc, 'box'),
      enabled: () => slotForShape(doc.selection) !== null,
    }),
    registerAction('novo-mascara', { run: () => addClipping(doc) }),
    // Extensão `BONE_particles`: UM id, como manda a regra 17 da casa.
    registerAction('novo-emissor', { run: () => addParticleEmitter(doc) }),
    registerAction('apagar', {
      run: () => deleteSelected(doc, askDelete),
      enabled: () => canDeleteSelection(corpoDe(doc).file, doc.selection),
    }),
    registerAction('limpar-slots-vazios', {
      run: () => { cleanEmptySlots(doc); },
      enabled: () => new CleanEmptySlots(corpoDe(doc).file).hasWork,
    }),
    // Rodada 13: o lugar onde se vê o que ficou guardado, e se joga fora.
    registerAction('chaves-guardadas', {
      run: async () => { await showGuardedKeys(doc); },
      enabled: () => readGuarded(corpoDe(doc).file).length > 0,
      why: () => NO_GUARDED_KEYS,
    }),
  ];
}

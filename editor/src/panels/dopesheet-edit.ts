/**
 * A linha do tempo: os botões que escrevem — lote A5b, plano arrumação (v10.9).
 *
 * Chavear e apagar a chave, marcas e trecho de laço, Repetir, apagar e
 * recortar chaves, esticar, espelhar no tempo e os lados, fechar o ciclo,
 * copiar e colar (as chaves escolhidas e a pose), apagar as linhas e limpar a
 * animação. Cortado de `dopesheet.ts` pelas seções "Buttons that write" e
 * "Marcas e trecho de laço": cada método virou uma função que recebe o painel
 * (`panel`), e a classe guarda um método de uma linha.
 */

import { askChoice, askForm, askUser } from '../ui/dialog.js';
import { clearAnimation, cleanRepeatedKeys, copyKeys, durationOf, findAnimation, moveKeys, offsetInLoop, pasteKeys, pasteKeysInLoop, poseAt, removeKey, removeTimelines, rippleMove, roundTime, scaleKeys, targetKey } from '../anim/keying.js';
import type { CleanKeysReport } from '../anim/keying.js';
import { selectChildren } from '../doc/duplicate.js';
import type { KeyRef } from '../anim/keying.js';
import {
  DEFAULT_MIRROR_RULES, allTargetsOf, animatedBones, closeLoop, findMirrorPairs,
  mirrorClipboard, mirrorClipboardIn, mirroredPasteNotice, mirrorKeysInTime, parseMirrorRules, stretchSelection, swapMirroredBones,
  type MirrorPair,
} from '../anim/timeline-tools.js';
import { EditKeys, keyTargetsNow, targetsForSelection, unkeyTargetsNow } from '../anim/pose-mode.js';
import type { TimelineTarget } from '../anim/keying.js';
import { FRAMES_OR_SECONDS_HINT, clipThatFits, copyNotice, formatSeconds, framesAndSeconds, loopClosedNotice, parseFramesOrSeconds, pasteDoneNotice, pasteEnd, pastedKeysSummary, pushNotice } from './dopesheet-model.js';
import { bodyKeyRemovedNotice, bodyKeys, removeKeyRef } from '../anim/body.js';
import { bodyShortName } from '../anim/keying.js';
import type { BoneFile } from '../../../runtime/src/index.js';
import { copyPose as copyPoseNow, keyClipboard, pasteToAll as pasteToAllNow, setKeyClipboard } from './dopesheet-actions.js';
import { SetAnimationLoop } from './animations-model.js';
import { transport } from '../anim/transport.js';
import { addMarker, markerAt, markerLabel, nextMarker, previousMarker, readTimelineStates, removeMarker, setLoopFrom, setLoopTo, stateOf, writeTimelineStates, type Marker, type TimelineState } from '../anim/markers.js';
import { fpsOf } from './dopesheet.js';
import type { DopesheetPanel } from './dopesheet.js';

// -------------------------------------------------------------------------
// Buttons that write
// -------------------------------------------------------------------------

/**
 * Properties "Chavear" writes when no row is picked: the five an artist
 * animates on a bone, and the two on a slot. Keying all seven bone numbers
 * would fill the sheet with lines nobody asked for.
 */
/**
 * O que Chavear grava agora.
 *
 * Uma linha escolhida na folha manda: chavear com uma linha marcada grava
 * SÓ ela. Sem linha marcada vale a seleção da cena, e aí a conta é a mesma
 * que pinta o botão de verde ou de vermelho — `targetsForSelection`, pura, em
 * `anim/pose-mode.ts`. Duas listas separadas dariam um botão verde que grava
 * por cima de uma chave.
 */
export function targetsToKey(panel: DopesheetPanel): TimelineTarget[] {
  const doc = panel.doc;
  if (doc === null) return [];
  if (panel.pickedRows.size > 0) return [...panel.pickedRows.values()];
  return targetsForSelection(doc.selection);
}

// -------------------------------------------------------------------------
// Marcas e trecho de laço — itens 81 e 82
// -------------------------------------------------------------------------

/** Os slots que a seleção alcança, contando o de cada desenho escolhido. */
export function selectedSlotNames(panel: DopesheetPanel): string[] {
  const doc = panel.doc;
  if (doc === null) return [];
  const names = new Set(doc.selection.slots);
  for (const item of doc.selection.attachments) names.add(item.slot);
  return [...names];
}

/** O que o editor guarda desta animação: trecho de laço e marcas. */
export function timeline(panel: DopesheetPanel): TimelineState {
  const doc = panel.doc;
  if (doc === null) return {};
  return stateOf(readTimelineStates(doc.file), doc.animation);
}

/** As marcas desta animação, em ordem. */
export function markers(panel: DopesheetPanel): Marker[] {
  return panel.timeline().markers ?? [];
}

/**
 * Grava o trecho e as marcas no arquivo, e redesenha.
 *
 * Escreve direto em `RECORTE_editor_state`, sem passar por um `Command`, pelo
 * mesmo motivo das travas e das opções de exibição: isto não é o desenho nem
 * a animação, é como esta pessoa está olhando para eles. Encher a pilha de
 * desfazer com "pus uma marca" tiraria dela o passo que interessa.
 */
export function saveTimeline(panel: DopesheetPanel, patch: Partial<TimelineState>): void {
  const doc = panel.doc;
  if (doc === null || doc.animation === null) return;
  const all = readTimelineStates(doc.file);
  const next: TimelineState = { ...stateOf(all, doc.animation), ...patch };
  if (next.loop === undefined) delete next.loop;
  if (next.markers !== undefined && next.markers.length === 0) delete next.markers;
  all[doc.animation] = next;
  writeTimelineStates(doc.file, all);
  // O tocador precisa saber do trecho na hora: ele é quem obedece a ele.
  transport.setRange(next.loop ?? null);
  panel.render();
}

/** Põe ou tira a marca do tempo atual — item 82, tecla `M`. */
export function toggleMarker(panel: DopesheetPanel): void {
  const doc = panel.doc;
  if (doc === null || doc.animation === null) return;
  const time = roundTime(doc.time);
  const markers = panel.markers();
  if (markerAt(markers, time) !== null) {
    panel.saveTimeline({ markers: removeMarker(markers, time) });
    doc.notice(`Marca tirada de ${formatSeconds(time)}`);
    return;
  }
  panel.saveTimeline({ markers: addMarker(markers, time) });
  doc.notice(`Marca em ${formatSeconds(time)}. Duplo clique nela para dar nome`);
}

/** Pula para a marca anterior ou seguinte — `Ctrl+↑` e `Ctrl+↓`. */
export function stepMarker(panel: DopesheetPanel, direction: number): void {
  const doc = panel.doc;
  if (doc === null) return;
  const markers = panel.markers();
  if (markers.length === 0) {
    doc.notice('Não há marca nesta animação. Aperte M para pôr uma');
    return;
  }
  const found = direction < 0
    ? previousMarker(markers, doc.time)
    : nextMarker(markers, doc.time);
  if (found === null) {
    doc.notice(direction < 0 ? 'Não há marca antes daqui' : 'Não há marca depois daqui');
    return;
  }
  panel.goTo(found.time);
  doc.notice(`Marca: ${markerLabel(found)}`);
}

/** Marca o começo ou o fim do trecho de laço — item 81, `Alt` + clique. */
export function setLoopEdge(panel: DopesheetPanel, which: 'from' | 'to', time: number): void {
  const doc = panel.doc;
  if (doc === null || doc.animation === null) return;
  const loop = panel.timeline().loop;
  const next = which === 'from'
    ? setLoopFrom(loop ?? { from: 0, to: panel.endTime() }, roundTime(time))
    : setLoopTo(loop, roundTime(time));
  panel.saveTimeline({ loop: next ?? undefined });
  if (next === null) {
    doc.notice('Trecho tirado: o começo tem que vir antes do fim');
    return;
  }
  doc.notice(
    `Trecho de ${formatSeconds(next.from)} a ${formatSeconds(next.to)}. Tocar repete só ele`,
  );
}

/** Tira o trecho: volta a tocar a animação inteira. */
export function clearLoopRange(panel: DopesheetPanel): void {
  panel.saveTimeline({ loop: undefined });
  panel.doc?.notice('Trecho tirado. Tocar volta a rodar a animação inteira');
}

/** `true` quando a animação aberta repete. Lido do ARQUIVO, não da sessão. */
export function loopNow(panel: DopesheetPanel): boolean {
  const doc = panel.doc;
  if (doc === null) return false;
  return findAnimation(doc.file, doc.animation)?.loop === true;
}

/**
 * Liga e desliga o Repetir — e GRAVA no arquivo.
 *
 * Era uma caixinha de sessão no painel Animações, que morria ao fechar a aba.
 * O campo `loop` existe no formato desde a §4.6 e o runtime sempre o leu; só
 * o editor não escrevia. Agora escreve, num passo de desfazer.
 */
export function toggleLoop(panel: DopesheetPanel): void {
  const doc = panel.doc;
  if (doc === null || doc.animation === null) return;
  const name = doc.animation;
  const on = !panel.loopNow();
  doc.run(new SetAnimationLoop(name, on));
  doc.notice(on ? `Repetir ligado em ${name}` : `Repetir desligado em ${name}`);
}

export function keyNow(panel: DopesheetPanel): void {
  const doc = panel.doc;
  if (doc === null) return;
  if (doc.animation === null) {
    window.alert('Abra uma animação antes de chavear.');
    return;
  }
  const targets = panel.targetsToKey();
  if (targets.length === 0) {
    window.alert('Escolha um osso, um slot ou uma linha para chavear.');
    return;
  }
  keyTargetsNow(doc, targets);
  panel.render();
}

export function unkeyNow(panel: DopesheetPanel): void {
  const doc = panel.doc;
  if (doc === null || doc.animation === null) return;
  const targets = panel.targetsToKey();
  if (targets.length === 0) return;
  unkeyTargetsNow(doc, targets);
  panel.render();
}

export function deleteSelected(panel: DopesheetPanel): void {
  const doc = panel.doc;
  if (doc === null || doc.animation === null) return;
  const refs = panel.selectedRefs;
  if (refs.length === 0) return;
  const label = refs.length === 1 ? 'Apagar chave' : 'Apagar chaves';
  // P9 (chat D, 2a): a virada de corpo sai pelo dono dela, o `removeBodyKey`.
  const aviso = bodyRemovalNotice(doc.file, doc.animation, refs);
  doc.run(new EditKeys(doc.animation, label, (file, animation) => {
    for (const ref of refs) removeKeyRef(file, animation, ref);
  }));
  if (aviso !== null) doc.notice(aviso);
  panel.selected.clear();
  panel.render();
}

/**
 * Estica, encolhe ou espelha as chaves escolhidas em volta do tempo atual.
 *
 * `scaleKeys` já existia em `anim/keying.ts`, pronta e testada, e não estava
 * ligada a botão nenhum nem a atalho nenhum. Esticar é o comando que mais se
 * usa depois de mover: é como se ajusta o ritmo de um ciclo já animado. Um
 * fator negativo espelha — inverte a ordem das chaves no tempo.
 */
export function scaleSelected(panel: DopesheetPanel, factor: number): void {
  const doc = panel.doc;
  if (doc === null || doc.animation === null) return;
  const refs = panel.selectedRefs;
  if (refs.length < 2) {
    doc.notice('Escolha ao menos duas chaves para esticar');
    return;
  }
  const pivot = doc.time;
  const label = factor < 0
    ? 'Espelhar chaves'
    : (factor > 1 ? 'Esticar chaves' : 'Encolher chaves');
  let written: KeyRef[] = [];
  doc.run(new EditKeys(doc.animation, label, (file, animation) => {
    written = scaleKeys(file, animation, refs, pivot, factor);
  }));
  panel.selectKeys(written, 'trocar', true);
}

// -- esticar, espelhar e fechar o ciclo (A1 e A6) ---------------------------

/** The number in the "Fator" box, comma or point, or `null` when it is junk. */
export function readFactor(panel: DopesheetPanel): number | null {
  const text = (panel.factorBox?.value ?? '').trim().replace(',', '.');
  const value = Number(text);
  return Number.isFinite(value) && value !== 0 ? value : null;
}

/**
 * "Esticar seleção": scales the chosen keys in time, holding the FIRST key of
 * the selection still — the same thing dragging the right-hand edge of the
 * selection does.
 */
export function stretchByField(panel: DopesheetPanel): void {
  const doc = panel.doc;
  if (doc === null || doc.animation === null) return;
  const refs = panel.selectedRefs;
  if (refs.length < 2) {
    doc.notice('Escolha ao menos duas chaves para esticar');
    return;
  }
  const factor = panel.readFactor();
  if (factor === null) {
    doc.notice('O fator tem que ser um número diferente de zero');
    return;
  }
  let written: KeyRef[] = [];
  doc.run(new EditKeys(doc.animation, 'Esticar seleção', (file, animation) => {
    written = stretchSelection(file, animation, refs, factor);
  }));
  doc.notice(`Trecho esticado por ${String(factor).replace('.', ',')}`);
  panel.selectKeys(written, 'trocar', true);
}

/** "Espelhar no tempo": reverses the order of the chosen keys, in place. */
export function mirrorInTime(panel: DopesheetPanel): void {
  const doc = panel.doc;
  if (doc === null || doc.animation === null) return;
  const refs = panel.selectedRefs;
  if (refs.length < 2) {
    doc.notice('Escolha ao menos duas chaves para espelhar');
    return;
  }
  let written: KeyRef[] = [];
  doc.run(new EditKeys(doc.animation, 'Espelhar no tempo', (file, animation) => {
    written = mirrorKeysInTime(file, animation, refs);
  }));
  doc.notice(`${written.length} chaves invertidas no tempo`);
  panel.selectKeys(written, 'trocar', true);
}

/**
 * "Empurrar as chaves…" — item 4, 15/09/2026.
 *
 * `rippleMove` (`anim/keying.ts`) já existia, com teste, verde há semanas, e
 * sem gesto: as três teclas do arrasto de uma chave já tinham dono (`Ctrl`
 * clona — item 6, `Shift` soma à seleção, `Alt` tira o encaixe do quadro).
 * Este comando é a PORTA — número de quadros e lado —, não conta nova.
 *
 * Duas contas, escolhidas na própria janela: **estas e tudo o que vem
 * depois** (o pedido dele: abrir espaço no meio de uma animação pronta) usa
 * `rippleMove`; **só as chaves marcadas** usa `moveKeys`, a mesma conta do
 * arrasto do mouse.
 */
export async function askPushKeys(panel: DopesheetPanel): Promise<void> {
  const doc = panel.doc;
  if (doc === null || doc.animation === null) return;
  const refs = panel.selectedRefs;
  if (refs.length === 0) {
    doc.notice('Marque uma ou mais chaves na folha para empurrar');
    return;
  }
  const fps = fpsOf(doc);
  const answer = await askForm({
    title: 'Empurrar as chaves',
    // Rodada 40, lote 4: em quadros E segundos, e dizendo que só as linhas
    // das chaves marcadas andam (`rippleMove`).
    lead: `${refs.length} chave${refs.length === 1 ? '' : 's'} marcada${refs.length === 1 ? '' : 's'}. `
      + `Só as linhas delas andam. Quantos quadros, e para que lado — em ${fps} quadros por segundo `
      + `(${framesAndSeconds(1, fps)}).`,
    fields: [
      { id: 'quadros', label: 'Quadros ou segundos', hint: `${FRAMES_OR_SECONDS_HINT}. ${framesAndSeconds(6, fps)}.`, value: '1' },
      {
        id: 'lado', label: 'Lado',
        choices: [
          { value: 'frente', label: 'Para a frente' },
          { value: 'tras', label: 'Para trás' },
        ],
        value: 'frente',
      },
      {
        id: 'conta', label: 'O que anda',
        choices: [
          { value: 'tudo', label: 'Estas e tudo o que vem depois — abre espaço' },
          { value: 'so', label: 'Só as chaves marcadas' },
        ],
        value: 'tudo',
      },
    ],
    // Rodada 47, lote 3 (doc 68, a nota do doc 54): o texto errado não fecha a janela; ela diz como escrever.
    validate: (v) => (parseFramesOrSeconds(v['quadros'] ?? '', fps) === null
      ? `Não entendi "${(v['quadros'] ?? '').trim()}". ${FRAMES_OR_SECONDS_HINT}`
      : null),
    yesLabel: 'Empurrar',
  });
  if (answer === null) return;

  // Rodada 40, lote 5 (nota do doc 50): quadros OU segundos na mesma caixa.
  const quadros = parseFramesOrSeconds(answer['quadros'] ?? '', fps);
  if (quadros === null) {
    doc.notice(`Não entendi "${(answer['quadros'] ?? '').trim()}". ${FRAMES_OR_SECONDS_HINT}`);
    return;
  }
  const delta = (answer['lado'] === 'tras' ? -1 : 1) * (quadros / fps);
  const empurraTudo = answer['conta'] !== 'so';
  const animation = doc.animation;
  const owner = findAnimation(doc.file, animation);
  const antes = owner === null ? 0 : durationOf(owner);
  let written: KeyRef[] = [];
  doc.run(new EditKeys(animation, 'Empurrar as chaves', (file, name) => {
    written = empurraTudo ? rippleMove(file, name, refs, delta) : moveKeys(file, name, refs, delta);
  }));
  const depois = (() => { const found = findAnimation(doc.file, animation); return found === null ? antes : durationOf(found); })();
  // Rodada 40, lote 4 (nota do doc 45): o crescimento vai para o rodapé.
  doc.notice(pushNotice(written.length, quadros, answer['lado'] === 'tras' ? 'tras' : 'frente', fps, antes, depois));
  panel.selectKeys(written, 'trocar', true);
}

/** The pairs the rule box finds right now, in the open animation. */
export function currentPairs(panel: DopesheetPanel): MirrorPair[] {
  const doc = panel.doc;
  if (doc === null || doc.animation === null) return [];
  const rules = parseMirrorRules(panel.rulesBox?.value ?? DEFAULT_MIRROR_RULES);
  if (rules.length === 0) return [];
  return findMirrorPairs(animatedBones(doc.file, doc.animation), rules);
}

/**
 * Shows the pairs BEFORE anything is swapped, which is the whole point: a
 * rule that matches the wrong bones has to be visible while it is still
 * harmless.
 */
export function renderPairs(panel: DopesheetPanel): void {
  const node = panel.pairsNode;
  if (node === null) return;
  const doc = panel.doc;
  if (doc === null || doc.animation === null) {
    node.textContent = '';
    return;
  }
  const pairs = panel.currentPairs();
  if (pairs.length === 0) {
    node.textContent = 'Nenhum par de nome espelhado nesta animação.';
    return;
  }
  const list = pairs.map((pair) => `${pair.a} ↔ ${pair.b}`).join('   ');
  node.textContent = `${pairs.length} pares: ${list}`;
}

/** "Espelhar esquerda e direita": swaps the timelines of the paired bones. */
export async function mirrorLeftRight(panel: DopesheetPanel): Promise<void> {
  const doc = panel.doc;
  if (doc === null || doc.animation === null) return;
  const pairs = panel.currentPairs();
  panel.renderPairs();
  if (pairs.length === 0) {
    doc.notice('Nenhum par de nome espelhado. Confira a regra em ⋯ Mais → Pares de nome, na linha do tempo');
    return;
  }
  // A janela é a do editor, não o `confirm` do navegador: os pares aparecem
  // um por linha e cada botão diz o que faz, em vez de "OK" e "Cancelar".
  const ok = await askUser({
    title: 'Trocar os lados desta animação',
    lead: `As linhas de tempo destes ${pairs.length} pares vão trocar de osso. `
      + 'Nada mais muda, e Ctrl+Z desfaz.',
    lines: pairs.map((pair) => `${pair.a} ↔ ${pair.b}`),
    yesLabel: 'Trocar os lados',
    noLabel: 'Deixar como está',
  });
  if (!ok) return;
  let moved = 0;
  doc.run(new EditKeys(doc.animation, 'Espelhar esquerda e direita', (file, animation) => {
    moved = swapMirroredBones(file, animation, pairs);
  }));
  panel.selected.clear();
  doc.notice(`${moved} linhas trocadas entre ${pairs.length} pares`);
  panel.render();
}

/**
 * "Fechar ciclo": the first key of each chosen timeline is written again at
 * the end of the animation, and the tangents are matched so the loop does not
 * jerk when it wraps. With nothing chosen it closes every timeline.
 */
export function closeTheLoop(panel: DopesheetPanel): void {
  const doc = panel.doc;
  if (doc === null || doc.animation === null) {
    doc?.notice('Abra uma animação antes de fechar o ciclo');
    return;
  }
  const chosen = new Map<string, TimelineTarget>();
  for (const ref of panel.selectedRefs) chosen.set(targetKey(ref.target), ref.target);
  for (const [id, target] of panel.pickedRows) chosen.set(id, target);
  const targets = chosen.size > 0
    ? [...chosen.values()]
    : allTargetsOf(doc.file, doc.animation);
  if (targets.length === 0) {
    doc.notice('Esta animação não tem nenhuma linha para fechar');
    return;
  }

  let closed = 0;
  let matched = 0;
  doc.run(new EditKeys(doc.animation, 'Fechar ciclo', (file, animation) => {
    closed = 0;
    matched = 0;
    for (const report of closeLoop(file, animation, targets)) {
      if (report.keyed) closed += 1;
      if (report.tangent) matched += 1;
    }
  }));
  doc.notice(loopClosedNotice(closed, matched));
  panel.render();
}

/**
 * "Limpar chaves repetidas" — item 8: tira a chave que não muda nada, o
 * lixo que o gravar-sozinho deixa. Linha escolhida (marcada na folha, ou
 * pela seleção de linhas) limpa só ela; sem nenhuma, limpa a animação
 * inteira — a mesma conta de "Fechar ciclo".
 */
export function cleanRepeatedKeysNow(panel: DopesheetPanel): void {
  const doc = panel.doc;
  if (doc === null || doc.animation === null) {
    doc?.notice('Abra uma animação antes de limpar as chaves');
    return;
  }
  const chosen = new Map<string, TimelineTarget>();
  for (const ref of panel.selectedRefs) chosen.set(targetKey(ref.target), ref.target);
  for (const [id, target] of panel.pickedRows) chosen.set(id, target);
  const targets = chosen.size > 0 ? [...chosen.values()] : null;

  const animation = doc.animation;
  let report: CleanKeysReport = { removed: 0, edges: 0 };
  doc.run(new EditKeys(animation, 'Limpar chaves repetidas', (file, name) => {
    report = cleanRepeatedKeys(file, name, targets);
  }));
  if (report.removed === 0) {
    doc.notice('Nenhuma chave repetida para tirar');
    return;
  }
  const plural = report.removed === 1 ? '' : 's';
  const verbo = report.removed === 1 ? 'saiu' : 'saíram';
  const pontas = report.edges === 0 ? '' : `, ${report.edges} na ponta da linha`;
  doc.notice(`${report.removed} chave${plural} repetida${plural} ${verbo}${pontas}`);
  panel.render();
}

/**
 * Copia a POSE inteira do instante — item 85, `Ctrl+Shift+C`.
 *
 * Copia o valor de TODA linha da animação naquele tempo, interpolado quando
 * não há chave ali. É a pose que está na tela, e ela pode ser colada em outra
 * animação com `Ctrl+V`.
 */
export function copyPose(panel: DopesheetPanel): void {
  if (panel.doc !== null) copyPoseNow(panel.doc);
}

/** Cola o valor copiado em toda chave da linha — item 86, `Ctrl+Shift+V`. */
export function pasteToAll(panel: DopesheetPanel): void {
  if (panel.doc !== null) pasteToAllNow(panel.doc);
}

/** Apaga as linhas do tempo do escolhido — item 87, `Shift+Delete`. */
export function removeLines(panel: DopesheetPanel): void {
  const doc = panel.doc;
  if (doc === null || doc.animation === null) return;
  const targets = panel.targetsToKey();
  if (targets.length === 0) {
    doc.notice('Escolha um osso, um slot ou uma linha da folha');
    return;
  }
  const animation = doc.animation;
  let count = 0;
  doc.run(new EditKeys(animation, 'Apagar linhas do tempo', (file, name) => {
    count = removeTimelines(file, name, targets);
  }));
  doc.notice(count === 0
    ? 'Não havia linha do tempo para o escolhido'
    : `${count} linha${count === 1 ? '' : 's'} do tempo apagada${count === 1 ? '' : 's'}. O osso volta à pose de repouso ali`);
}

/** Apaga TODAS as linhas da animação — item 88. Pergunta antes. */
export async function clearAll(panel: DopesheetPanel): Promise<void> {
  const doc = panel.doc;
  if (doc === null || doc.animation === null) return;
  const animation = doc.animation;
  const quantas = (findAnimation(doc.file, animation)?.timelines ?? []).length;
  if (quantas === 0) {
    doc.notice(`${animation} já está vazia`);
    return;
  }
  // Perguntar, e com a frase inteira no botão: isto apaga a animação inteira,
  // e um "OK" não diz o que vai acontecer.
  const sim = await askUser({
    title: `Limpar a animação ${animation}?`,
    lead: `As ${quantas} linhas do tempo desta animação serão apagadas. `
      + 'A pose de repouso não muda, e Ctrl+Z devolve tudo.',
    yesLabel: `Apagar as ${quantas} linhas`,
  });
  if (!sim) return;
  let count = 0;
  doc.run(new EditKeys(animation, 'Limpar a animação', (file, name) => {
    count = clearAnimation(file, name);
  }));
  doc.notice(`${animation} limpa: ${count} linha${count === 1 ? '' : 's'} apagada${count === 1 ? '' : 's'}`);
}

/** Chavear TUDO: todo osso e todo slot animável — item 84, `Ctrl+K`. */
export function keyAllNow(panel: DopesheetPanel): void {
  const doc = panel.doc;
  if (doc === null || doc.animation === null) return;
  // Todo osso e todo slot, e não só as linhas que já existem: "chavear tudo"
  // é gravar a pose inteira, inclusive a do osso que ainda não foi animado.
  // As linhas que já existem entram também, sem repetir.
  const seen = new Set<string>();
  const targets: TimelineTarget[] = [];
  const push = (target: TimelineTarget): void => {
    const id = targetKey(target);
    if (seen.has(id)) return;
    seen.add(id);
    targets.push(target);
  };
  for (const target of targetsForSelection({
    bones: doc.file.bones.map((bone) => bone.name),
    slots: (doc.file.slots ?? []).map((slot) => slot.name),
  })) push(target);
  for (const target of allTargetsOf(doc.file, doc.animation)) push(target);

  const count = keyTargetsNow(doc, targets, 'Chavear tudo');
  doc.notice(count === 0
    ? 'Não havia o que chavear'
    : `${count} valores gravados no tempo atual`);
}

/** Recortar: copia e apaga — item 91, `Ctrl+X`. */
export function cutSelected(panel: DopesheetPanel): void {
  const doc = panel.doc;
  if (doc === null) return;
  const refs = panel.selectedRefs;
  if (refs.length === 0) {
    doc.notice('Escolha as chaves a recortar');
    return;
  }
  panel.copySelected();
  panel.deleteSelected();
  doc.notice(`${refs.length} chave${refs.length === 1 ? '' : 's'} recortada${refs.length === 1 ? '' : 's'}`);
}

/**
 * Copiar — itens 11 e 1 ("pego o braço inteiro e colo").
 *
 * Com chave marcada na folha, copia SÓ ela, como sempre. Sem nenhuma marcada,
 * vale a seleção da cena ou da Árvore, e vale o MEMBRO inteiro: o ombro
 * escolhido leva as chaves dele e as de todos os filhos — a mesma conta do
 * `Duplicar` (`doc/duplicate.ts`), sem precisar apertar `Escolher filhos`
 * antes. Colar (`pasteHere`) já aceita outro tempo e outra animação, sem
 * mudança: o clipboard não sabe de onde veio.
 *
 * **Rodada 50, lote 3 (doc `98`, item B11): o membro, NA AGULHA.** Copiava as
 * chaves do membro em TODOS os tempos: em 0 s, Ctrl+A e Ctrl+C levavam as de
 * 0 e as de 0,5, e o Ctrl+V em 1,0 colava as duas, esticando a animação até
 * 1,5 s com a pose girada no fim. Como no Spine, sem chave marcada copia-se o
 * QUADRO: a pose do escolhido no tempo da agulha (`poseAt`). Quem quer as
 * chaves de vários tempos as marca na folha.
 */
export function copySelected(panel: DopesheetPanel): void {
  const doc = panel.doc;
  if (doc === null || doc.animation === null) return;
  const picked = panel.selectedRefs;
  if (picked.length > 0) {
    setKeyClipboard(copyKeys(doc.file, doc.animation, picked));
    // Rodada 40, lote 4 (nota do doc 45): o Copiar da barra não dizia nada.
    doc.notice(copyNotice(picked.length));
    return;
  }
  const targets = targetsForSelection(selectChildren(doc.file, doc.selection));
  if (targets.length === 0) {
    doc.notice(copyNotice(0));
    return;
  }
  const pose = poseAt(doc.file, doc.animation, doc.time, targets);
  if (pose.items.length === 0) {
    doc.notice('O escolhido não tem valor nesta animação');
    return;
  }
  setKeyClipboard(pose);
  const n = pose.items.length;
  doc.notice(`Pose de ${formatSeconds(doc.time)} copiada: ${n} valor${n === 1 ? '' : 'es'} do escolhido. Ctrl+V cola na agulha`);
}

/**
 * Colar na agulha.
 *
 * **Rodada 50, lote 3 (doc `98`, item B11):** o colar que passa do fim de uma
 * animação a ESTICA — e esticava calado. Agora ele sabe antes (`pasteEnd`) e
 * pergunta: colar e esticar, colar só o que cabe, ou nada. O rodapé conta
 * todas as coladas, com os tempos (`pasteDoneNotice`).
 */
export async function pasteHere(panel: DopesheetPanel): Promise<void> {
  const doc = panel.doc;
  let clip = keyClipboard();
  if (doc === null || doc.animation === null || clip === null || clip.items.length === 0) return;
  const animation = doc.animation;
  const time = doc.time;
  const owner = findAnimation(doc.file, animation);
  const antes = owner === null ? 0 : durationOf(owner);
  const fim = pasteEnd(clip, time);
  let deFora = 0;
  if (owner !== null && antes > 0 && fim > antes + 1e-6) {
    const escolha = await askChoice({
      title: 'O colar passa do fim da animação',
      lead: `Colar em ${formatSeconds(time)} vai até ${formatSeconds(fim)}: "${animation}" tem ${formatSeconds(antes)} e cresceria para ${formatSeconds(fim)}.`,
      options: [
        { id: 'esticar', label: 'Colar e esticar', hint: `Cola tudo, e a animação passa a ter ${formatSeconds(fim)}` },
        { id: 'cabe', label: 'Colar só o que cabe', hint: `Cola até ${formatSeconds(antes)}; o que passaria do fim fica de fora` },
        { id: 'cancelar', label: 'Cancelar', hint: 'Nada é colado' },
      ],
      cancelId: 'cancelar',
    });
    if (escolha === 'cancelar') {
      doc.notice('Nada colado: a animação ficou como estava');
      return;
    }
    if (escolha === 'cabe') {
      const todas = clip.items.length;
      clip = clipThatFits(clip, time, antes);
      deFora = todas - clip.items.length;
    }
    if (clip.items.length === 0) {
      doc.notice('Nada cabia antes do fim: nada colado');
      return;
    }
  }
  // A janela esperou a resposta: se a animação aberta mudou nesse meio, não cola na errada.
  if (doc.animation !== animation) return;
  const cola = clip;
  let written: KeyRef[] = [];
  doc.run(new EditKeys(animation, 'Colar chaves', (file, name) => {
    written = pasteKeys(file, name, cola, time);
  }));
  panel.selectKeys(written, 'trocar', true);
  const depoisAnim = findAnimation(doc.file, animation);
  doc.notice(pasteDoneNotice(written, antes, depoisAnim === null ? antes : durationOf(depoisAnim), deFora));
}

/**
 * Colar espelhado — item 2: "o braço direito animado vira o esquerdo".
 *
 * A mesma regra de nome da caixa "Pares de nome" de Espelhar esquerda e
 * direita (`_e/_d` por padrão); um alvo sem par cola com o nome de sempre.
 */
export function pasteMirrored(panel: DopesheetPanel): void {
  const doc = panel.doc;
  const clip = keyClipboard();
  if (doc === null || doc.animation === null || clip === null || clip.items.length === 0) return;
  const rules = parseMirrorRules(panel.rulesBox?.value ?? DEFAULT_MIRROR_RULES);
  // K5: só vale o par que existe no arquivo, e o rodapé diz quem ficou sem.
  const present = new Set([
    ...(doc.file.bones ?? []).map((bone) => bone.name),
    ...(doc.file.slots ?? []).map((slot) => slot.name),
  ]);
  const { clipboard: mirrored, unpaired, swapped } = mirrorClipboardIn(clip, rules, present);
  const time = doc.time;
  // Rodada 40, lote 4: numa animação que repete, o colar DÁ A VOLTA (o Offset
  // do Spine) e a duração fica; sem repetir, ela cresce, e o rodapé diz.
  const owner = findAnimation(doc.file, doc.animation);
  const repete = (owner as { loop?: boolean } | null)?.loop === true;
  const antes = owner === null ? 0 : durationOf(owner);
  let written: KeyRef[] = [];
  doc.run(new EditKeys(doc.animation, 'Colar espelhado', (file, animation) => {
    written = repete ? pasteKeysInLoop(file, animation, mirrored, time) : pasteKeys(file, animation, mirrored, time);
  }));
  panel.selectKeys(written, 'trocar', true);
  const depoisAnim = findAnimation(doc.file, doc.animation);
  const depois = depoisAnim === null ? antes : durationOf(depoisAnim);
  const fim = repete
    ? '. Deu a volta no fim do laço: a duração não mudou'
    : depois > antes + 1e-6 ? `. A animação cresceu de ${formatSeconds(antes)} para ${formatSeconds(depois)}` : '';
  doc.notice(`${mirroredPasteNotice(swapped, unpaired, rules)}. ${pastedKeysSummary(written)}${fim}`);
}

/**
 * O rodapé quando uma virada de corpo sai — P9: *"Tirada a virada para
 * lobisomem, em 0,50 s"*. Só quando há UMA virada entre as chaves que saem;
 * com outras junto, o "Apagar chaves" de sempre já diz.
 */
export function bodyRemovalNotice(file: BoneFile, animation: string, refs: readonly KeyRef[]): string | null {
  const viradas = refs.filter((ref) => ref.target.type === 'body');
  if (viradas.length !== 1 || refs.length !== 1) return null;
  const time = viradas[0]!.time;
  const chave = bodyKeys(file, animation).find((key) => Math.abs(key.time - time) < 1e-6);
  if (chave === undefined) return null;
  return bodyKeyRemovedNotice(chave.value, time, bodyShortName);
}

/**
 * **Deslocar em laço…** — rodada 40, lote 4 (o Offset do Spine, doc 39, §1.2).
 *
 * As LINHAS das chaves marcadas andam inteiras, e o que passa do fim volta no
 * começo: a duração não muda. É o que defasa a perna de trás meio ciclo num
 * andar pronto, sem refazer chave nenhuma.
 */
export async function askOffsetInLoop(panel: DopesheetPanel): Promise<void> {
  const doc = panel.doc;
  if (doc === null || doc.animation === null) return;
  const refs = panel.selectedRefs.filter((ref) => ref.target.type !== 'event');
  if (refs.length === 0) {
    doc.notice('Marque uma chave em cada linha que vai andar: o Deslocar em laço anda a linha inteira');
    return;
  }
  const targets: TimelineTarget[] = [];
  const vistos = new Set<string>();
  for (const ref of refs) {
    const id = targetKey(ref.target);
    if (vistos.has(id)) continue;
    vistos.add(id);
    targets.push(ref.target);
  }
  const fps = fpsOf(doc);
  const owner = findAnimation(doc.file, doc.animation);
  const duracao = owner === null ? 0 : durationOf(owner);
  const meio = Math.max(1, Math.round((duracao * fps) / 2));
  const answer = await askForm({
    title: 'Deslocar em laço',
    lead: `${targets.length === 1 ? '1 linha. Ela anda inteira' : `${targets.length} linhas. Elas andam inteiras`}, e o que passa do fim `
      + `volta no começo: a animação continua com ${formatSeconds(duracao)}. Em ${fps} quadros por segundo.`,
    fields: [
      { id: 'quadros', label: 'Quadros ou segundos', hint: `${FRAMES_OR_SECONDS_HINT}. Meia volta (${framesAndSeconds(meio, fps)}) põe a perna de trás no passo oposto.`, value: String(meio) },
      {
        id: 'lado', label: 'Lado',
        choices: [
          { value: 'frente', label: 'Para a frente' },
          { value: 'tras', label: 'Para trás' },
        ],
        value: 'frente',
      },
    ],
    // Rodada 47, lote 3 (doc 68, a nota do doc 54): o texto errado não fecha a janela; ela diz como escrever.
    validate: (v) => (parseFramesOrSeconds(v['quadros'] ?? '', fps) === null
      ? `Não entendi "${(v['quadros'] ?? '').trim()}". ${FRAMES_OR_SECONDS_HINT}`
      : null),
    yesLabel: 'Deslocar',
  });
  if (answer === null) return;
  const quadros = parseFramesOrSeconds(answer['quadros'] ?? '', fps);
  if (quadros === null) {
    doc.notice(`Não entendi "${(answer['quadros'] ?? '').trim()}". ${FRAMES_OR_SECONDS_HINT}`);
    return;
  }
  const delta = (answer['lado'] === 'tras' ? -1 : 1) * (quadros / fps);
  let written: KeyRef[] = [];
  doc.run(new EditKeys(doc.animation, 'Deslocar em laço', (file, name) => {
    written = offsetInLoop(file, name, targets, delta);
  }));
  doc.notice(`${targets.length} linha${targets.length === 1 ? '' : 's'} deslocada${targets.length === 1 ? '' : 's'} `
    + `${framesAndSeconds(quadros, fps)}, dando a volta no fim`);
  panel.selectKeys(written, 'trocar', true);
}

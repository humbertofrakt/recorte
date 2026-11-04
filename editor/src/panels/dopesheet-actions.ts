/**
 * A área de transferência das chaves, e as duas ações que só precisam dela —
 * lote A2 (v10.5).
 *
 * Copiar a pose inteira (Ctrl+Shift+C) e Colar em todas as chaves
 * (Ctrl+Shift+V) não leem nada da folha: a pose sai de `poseAt`, e colar é
 * `pasteToAllKeys`. Por isso são registradas no arranque, e valem com a linha
 * do tempo fechada. A área de transferência veio para cá para a folha e as
 * duas ações lerem a mesma — uma só para o editor inteiro, como sempre foi.
 */

import type { EditorDoc } from '../contract.js';
import { skeletonsDe } from '../contract.js';
import { entityShortName } from '../anim/entity-band.js';
import type { EntitySlot } from '../anim/entity-band.js';
import { findTimeline, nestedTarget, revealKey, roundTime, setKey } from '../anim/keying.js';
import { entityStartValue } from './dopesheet-model.js';
import type { KeyClipboard } from '../anim/keying.js';
import { pasteToAllKeys, poseAt } from '../anim/keying.js';
import { EditKeys, targetsForSelection } from '../anim/pose-mode.js';
import { selectChildren } from '../doc/duplicate.js';
import { registerAction } from '../ui/actions.js';
import { END_MODES, transport } from '../anim/transport.js';
import type { EndMode } from '../anim/transport.js';
import { formatSeconds } from './dopesheet-model.js';

/** Keys copied with Ctrl+C. One clipboard for the whole editor. */
let clipboard: KeyClipboard | null = null;

/** O que está copiado agora, ou `null`. */
export function keyClipboard(): KeyClipboard | null {
  return clipboard;
}

/** Troca o que está copiado. */
export function setKeyClipboard(clip: KeyClipboard | null): void {
  clipboard = clip;
}

/** `true` quando há alguma chave copiada para colar. */
export function hasKeysCopied(): boolean {
  return clipboard !== null && clipboard.items.length > 0;
}

/**
 * Copia a POSE inteira no tempo de agora — item 85, `Ctrl+Shift+C`.
 *
 * SEMPRE a pose inteira, não importa o que esteja escolhido. Um botão que
 * muda de sentido conforme a seleção é armadilha: o Humberto escolhe um osso
 * para mexer nele, depois pede a pose inteira, e levaria só o braço sem
 * entender por quê. "Key all" e "Key selected" são dois botões no Spriter —
 * `copyPoseOfSelection` é o segundo.
 */
export function copyPose(doc: EditorDoc): void {
  if (doc.animation === null) return;
  const pose = poseAt(doc.file, doc.animation, doc.time);
  clipboard = pose;
  doc.notice(pose.items.length === 0
    ? 'Esta animação não tem linha nenhuma para copiar'
    : `Pose de ${formatSeconds(doc.time)} copiada: ${pose.items.length} valores`);
}

/**
 * Copia a pose só do ESCOLHIDO — item 9, comando PRÓPRIO, nunca o mesmo
 * `copyPose` mudando de sentido. Osso ou slot escolhido na cena ou na
 * Árvore: a pose do MEMBRO (ele e os filhos), no menu Animação.
 */
export function copyPoseOfSelection(doc: EditorDoc): void {
  if (doc.animation === null) return;
  const membro = targetsForSelection(selectChildren(doc.file, doc.selection));
  if (membro.length === 0) {
    doc.notice('Escolha um osso ou um slot, na cena ou na Árvore, para copiar a pose dele');
    return;
  }
  const pose = poseAt(doc.file, doc.animation, doc.time, membro);
  clipboard = pose;
  doc.notice(pose.items.length === 0
    ? 'O escolhido não tem valor nesta animação'
    : `Pose de ${formatSeconds(doc.time)} copiada: ${pose.items.length} valor${pose.items.length === 1 ? '' : 'es'} do escolhido`);
}

/** Cola o valor copiado em toda chave da linha — item 86, `Ctrl+Shift+V`. */
export function pasteToAll(doc: EditorDoc): void {
  const clip = clipboard;
  if (doc.animation === null || clip === null || clip.items.length === 0) {
    doc.notice('Não há nada copiado');
    return;
  }
  const animation = doc.animation;
  let count = 0;
  doc.run(new EditKeys(animation, 'Colar em todas as chaves', (file, name) => {
    count = pasteToAllKeys(file, name, clip);
  }));
  doc.notice(count === 0
    ? 'Nenhuma chave para escrever'
    : `${count} chave${count === 1 ? '' : 's'} com o valor colado`);
}

/** Uma entrada do "No fim" — a4: troca o modo, diz no rodapé, marca no menu. */
function endModeAction(doc: EditorDoc, value: EndMode): { run: () => void; checked: () => boolean } {
  const label = END_MODES.find((mode) => mode.value === value)?.label ?? value;
  return {
    run: () => {
      transport.setEndMode(value);
      doc.notice(`No fim: ${label}`);
    },
    checked: () => transport.endMode() === value,
  };
}

/** Registra as duas ações. Devolve como tirá-las. */
/**
 * Grava a chave `nested/animation` no tempo de agora — E12b, spec 9.9. Era o
 * corpo de `setEntityAnimation`, no painel da folha; desde a rodada 6 o menu
 * Entidades → Escolher a animação da entidade… chama a mesma.
 */
export function setEntityAnimationAt(doc: EditorDoc, entity: EntitySlot, animation: string | null): void {
  if (doc.animation === null) return;
  const time = doc.time;
  // K15 (29/09): a primeira troca depois de 0 leva junto o que valia antes,
  // no mesmo passo — senão ela valeria desde o começo (9.10).
  const child = skeletonsDe(doc).get(entity.uri) ?? null;
  const inicio = entityStartValue(entity, doc.animation, child === null ? null : child.animations.map((a) => a.name));
  doc.run(new EditKeys(doc.animation, 'Trocar a animação da entidade', (file, name) => {
    const alvo = nestedTarget(entity.slot, 'animation');
    if (roundTime(time) > 0 && inicio !== null && findTimeline(file, name, alvo) === null) {
      setKey(file, name, 0, alvo, inicio.value);
    }
    setKey(file, name, time, alvo, animation);
  }));
  revealKey({ target: nestedTarget(entity.slot, 'animation'), time: roundTime(time) });
  doc.notice(animation === null
    ? `${entityShortName(entity.uri)}: nenhuma animação por cima, de ${formatSeconds(time)} em diante`
    : `${entityShortName(entity.uri)} toca ${animation} de ${formatSeconds(time)} em diante`);
}

export function registerTimelineActions(doc: EditorDoc): Array<() => void> {
  const open = (): boolean => doc.animation != null;
  return [
    // a4 (chat O, 29/09): o "No fim" morava só no ⋯ Mais da linha do tempo.
    // Cinco ids, um por modo, para o menu Animação — de arranque, porque o
    // tocador é um só para o editor inteiro (o mesmo motivo do `tocar`).
    // Escritos por extenso, um por linha: a régua da casa procura o id na fonte.
    registerAction('fim-arquivo', endModeAction(doc, 'arquivo')),
    registerAction('fim-parar', endModeAction(doc, 'parar')),
    registerAction('fim-repetir', endModeAction(doc, 'repetir')),
    registerAction('fim-vai-e-volta', endModeAction(doc, 'vai-e-volta')),
    registerAction('fim-voltar', endModeAction(doc, 'voltar')),
    registerAction('copiar-pose', { run: () => copyPose(doc), enabled: open }),
    registerAction('copiar-pose-escolhido', { run: () => copyPoseOfSelection(doc), enabled: open }),
    registerAction('colar-todas-chaves', {
      run: () => pasteToAll(doc),
      enabled: () => open() && hasKeysCopied(),
    }),
    /*
     * **O tocador é de ARRANQUE, e não do painel** — 22/09/2026.
     *
     * `tocar` e `tocar-tras` nasciam no `mount()` da linha do tempo, e a
     * tabela os declarava `where: 'painel'` — o que **promete que eles podem
     * sumir**. Com o painel desmontado a ação não existe, o `runAction`
     * devolve `false`, e a **BARRA DE ESPAÇO não toca, não pausa e não diz
     * nada**: a tecla mais usada do programa, muda.
     *
     * **Hoje isso não acontece, e é por acidente.** A faixa de baixo nunca
     * desmonta — `ui/shell.ts:783`: *"todos os painéis são montados de uma vez
     * e o que não está à frente fica só escondido"* —, então o `mount()` corre
     * no arranque e nunca é desfeito. **A casca salva a tabela sem saber.** No
     * dia em que a faixa montar preguiçosamente, por desempenho, a barra de
     * espaço morre em silêncio e ninguém liga uma coisa à outra.
     *
     * Aqui não há o que salvar nem o que lembrar: os dois só precisam do
     * documento e do tocador, que é um só para o editor inteiro. O painel
     * continua desenhando os botões; quem responde é isto.
     */
    registerAction('tocar', {
      run: () => transport.toggle(doc),
      enabled: open,
      checked: () => transport.isPlaying(),
    }),
    // Tocar para trás — anotação 22. Mesma forma, mesma razão: ele também era
    // `where: 'painel'` e também não precisa de painel nenhum.
    registerAction('tocar-tras', {
      run: () => {
        if (transport.isPlaying()) transport.pause();
        else transport.play(doc, -1);
      },
      enabled: open,
    }),
  ];
}

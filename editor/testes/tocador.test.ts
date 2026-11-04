/**
 * Tocador, Chavear e Resumo — os testes por assunto (lote A3, v10.6).
 *
 * Um `describe` por arquivo antigo, com o nome e o cabeçalho dele, e os
 * mesmos testes dentro. O miolo vai sem recuo: um texto de várias linhas
 * não pode mudar.
 *
 * Juntou: `lote2-tocador`, `lote15-tocador`, `lote3a-desenho-e-semaforo`, `lote3b-resumo`.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, beforeEach } from 'vitest';
import type { BoneFile } from '../../runtime/src/index.js';
import { Doc } from '../src/doc/document.js';
import { SetAnimationLoop, animationDuration, findAnimation, SPEED_OPTIONS, parseTime } from '../src/panels/animations-model.js';
import { createTransport, playbackOf } from '../src/anim/transport.js';
import type { TransportClock } from '../src/anim/transport.js';
import { BASE_CLOCK, BASE_SHEET_NOTE, PLAYER_CONTROLS, controlLabel, MORE_CONTROLS, SPEED_MAX, SPEED_MIN, baseOpenHint, moreMenuItems, sliderFromSpeed, speedFromSlider } from '../src/panels/dopesheet-model.js';
import { KEY_HINTS, flatEntries, animationMenu, allMenus } from '../src/ui/menus.js';
import type { MenuGroupDef, MenuState } from '../src/ui/menus.js';
import { EditKeys, currentValueOf, keyTargetsNow, targetsForSelection } from '../src/anim/pose-mode.js';
import * as poseMode from '../src/anim/pose-mode.js';
import { findAnimation as findAnimation__2, findTimeline, setDuration, isKeyed, allKeyTimes, moveKeys, sameTime, valueAt } from '../src/anim/keying.js';
import { viewMenuState } from './ajuda-view.js';
import { emptySelection } from '../src/contract.js';
import type { Selection } from '../src/contract.js';
import { attachmentOptions, buildProperties, slotFields, writeFieldValue } from '../src/panels/properties-model.js';
import type { FieldDef, FieldGroup } from '../src/panels/properties-model.js';
import { isCurrentAttachment } from '../src/panels/tree-model.js';
import { isMixedTime, refsAtTime, summaryMarks, summaryTimes } from '../src/anim/summary.js';

// ---------------------------------------------------------------------------
// tocador (lote 2) — era `lote2-tocador.test.ts`
// ---------------------------------------------------------------------------

describe('tocador (lote 2)', () => {
/**
 * Lote 2 (v1.8): o tocador na linha do tempo, e o Repetir gravado no arquivo.
 *
 * Sem DOM. O motor de tocar recebe o relógio de fora, então um teste de
 * "tocou 200 ms" não espera 200 ms de verdade — um teste que espera é um teste
 * que às vezes falha por causa da máquina, e não por causa do código.
 *
 * O comando do Repetir é conferido comparando o JSON do arquivo POR TEXTO antes
 * e depois de desfazer: é a única prova de que desfazer devolveu o arquivo, e
 * não algo parecido com ele.
 */
const EXAMPLE = resolve(__dirname, '../../formato/exemplos/heroi.bone');
const RAW = readFileSync(EXAMPLE, 'utf8');

function exampleDoc(): Doc {
  return new Doc(JSON.parse(RAW) as BoneFile);
}

/**
 * O `.bone` como texto.
 *
 * `doc.serialize()` também escreve a câmera e a seleção dentro de `extensions`,
 * que mudam por conta própria e não são o que estes testes estão provando. O
 * que se compara aqui é o arquivo em si.
 */
function texto(doc: Doc): string {
  return JSON.stringify(doc.file, null, 2);
}

/** Um relógio de mentira: o teste diz que horas são. */
function fakeClock(): TransportClock & { fire(stampMs: number): void; pending(): number } {
  let next = 1;
  const jobs = new Map<number, (stampMs: number) => void>();
  return {
    now: () => 0,
    schedule(run) {
      const id = next++;
      jobs.set(id, run);
      return id;
    },
    cancel(id) {
      jobs.delete(id);
    },
    fire(stampMs) {
      const todo = [...jobs.entries()];
      jobs.clear();
      for (const [, run] of todo) run(stampMs);
    },
    pending: () => jobs.size,
  };
}

// ---------------------------------------------------------------------------
// Repetir vai para o arquivo
// ---------------------------------------------------------------------------

describe('SetAnimationLoop', () => {
  it('desfazer devolve o arquivo letra por letra', () => {
    const doc = exampleDoc();
    const antes = texto(doc);
    doc.run(new SetAnimationLoop('walk', false));
    expect(findAnimation(doc.file, 'walk')?.loop).toBe(false);
    doc.undo();
    expect(texto(doc)).toBe(antes);
  });

  it('numa animação sem `loop` escrito, desfazer devolve a AUSÊNCIA', () => {
    const doc = exampleDoc();
    // O herói escreve `loop` nas três animações, então este teste tira o campo
    // primeiro: o caso que importa é o arquivo que não diz nada sobre laço.
    const walk = findAnimation(doc.file, 'walk');
    expect(walk).not.toBeNull();
    delete (walk as { loop?: boolean }).loop;
    const antes = texto(doc);
    // `idle` e `attack` continuam com o campo; quem não tem é o `walk`.
    expect(JSON.stringify(walk)).not.toContain('"loop"');

    doc.run(new SetAnimationLoop('walk', true));
    expect(findAnimation(doc.file, 'walk')?.loop).toBe(true);

    doc.undo();
    expect(texto(doc)).toBe(antes);
    // Não basta o texto bater: o campo não pode existir valendo `undefined`.
    expect(Object.prototype.hasOwnProperty.call(walk as object, 'loop')).toBe(false);
  });

  it('diz que mexeu numa animação só, para o arquivo inteiro não recarregar', () => {
    const command = new SetAnimationLoop('walk', true);
    expect(command.animationOnly).toBe('walk');
    expect(command.kind).toBe('transform');
  });

  it('o nome do passo diz o que aconteceu', () => {
    expect(new SetAnimationLoop('walk', true).label).toBe('Ligar repetir');
    expect(new SetAnimationLoop('walk', false).label).toBe('Desligar repetir');
  });

  it('uma animação que não existe não quebra nem suja o arquivo', () => {
    const doc = exampleDoc();
    const antes = texto(doc);
    doc.run(new SetAnimationLoop('nao-existe', true));
    expect(texto(doc)).toBe(antes);
    doc.undo();
    expect(texto(doc)).toBe(antes);
  });

  it('refazer põe de volta o valor novo', () => {
    const doc = exampleDoc();
    doc.run(new SetAnimationLoop('attack', true));
    expect(findAnimation(doc.file, 'attack')?.loop).toBe(true);
    doc.undo();
    expect(findAnimation(doc.file, 'attack')?.loop).toBe(false);
    doc.redo();
    expect(findAnimation(doc.file, 'attack')?.loop).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// O motor de tocar
// ---------------------------------------------------------------------------

describe('o motor de tocar', () => {
  let doc: Doc;

  beforeEach(() => {
    doc = exampleDoc();
    doc.animation = 'walk';
    doc.time = 0;
  });

  it('lê a duração e o laço do ARQUIVO, não de uma caixinha de sessão', () => {
    expect(playbackOf(doc)).toEqual({ duration: 1, loop: true });
    doc.run(new SetAnimationLoop('walk', false));
    expect(playbackOf(doc)).toEqual({ duration: 1, loop: false });
  });

  it('com a base aberta não há o que tocar — mas o relógio diz 0,00 s (M5)', () => {
    doc.animation = null;
    expect(playbackOf(doc)).toBeNull();
    // O tocador nunca apaga: o que ele mostra com a base aberta é um quadro só.
    expect(BASE_CLOCK).toBe('0,00 s');
    expect(BASE_SHEET_NOTE).toContain('um quadro só');
  });

  it('duas batidas de 100 ms andam 0,2 s na velocidade normal', () => {
    const clock = fakeClock();
    const player = createTransport(clock);
    player.play(doc);
    clock.fire(100);
    clock.fire(200);
    expect(doc.time).toBeCloseTo(0.2, 6);
    expect(player.isPlaying()).toBe(true);
  });

  it('na metade da velocidade, 100 ms andam 0,05 s', () => {
    const clock = fakeClock();
    const player = createTransport(clock);
    player.setSpeed(0.5);
    expect(player.speed()).toBe(0.5);
    player.play(doc);
    clock.fire(100);
    expect(doc.time).toBeCloseTo(0.05, 6);
  });

  it('sem laço, no modo "como o arquivo diz", a agulha para NO fim', () => {
    doc.run(new SetAnimationLoop('walk', false));
    const clock = fakeClock();
    const player = createTransport(clock);
    // Desde o lote 25 (anotação 14) o padrão do TOCADOR é Repetir, sempre.
    // "Como o arquivo diz" continua existindo, e é o que se pede aqui.
    player.setEndMode('arquivo');
    player.play(doc);
    // `walk` dura 1 s: 1500 ms passam do fim.
    clock.fire(1500);
    expect(doc.time).toBeCloseTo(1, 6);
    expect(player.isPlaying()).toBe(false);
    // E nada mais foi agendado: parado é parado.
    expect(clock.pending()).toBe(0);
  });

  it('com laço, passar do fim dá a volta e continua tocando', () => {
    const clock = fakeClock();
    const player = createTransport(clock);
    player.play(doc);
    // 1,25 s numa animação de 1 s: dá a volta e para em 0,25.
    clock.fire(1250);
    expect(doc.time).toBeCloseTo(0.25, 6);
    expect(player.isPlaying()).toBe(true);
  });

  it('toca, pausa, e a agulha fica onde estava', () => {
    const clock = fakeClock();
    const player = createTransport(clock);
    player.toggle(doc);
    expect(player.isPlaying()).toBe(true);
    clock.fire(300);
    player.toggle(doc);
    expect(player.isPlaying()).toBe(false);
    expect(doc.time).toBeCloseTo(0.3, 6);
    // Pausado, uma batida atrasada não pode andar com a agulha.
    clock.fire(900);
    expect(doc.time).toBeCloseTo(0.3, 6);
  });

  it('avisa quem desenha, e para de avisar quando pedido', () => {
    const clock = fakeClock();
    const player = createTransport(clock);
    let contou = 0;
    const stop = player.onChange(() => { contou += 1; });
    player.play(doc);
    clock.fire(100);
    expect(contou).toBeGreaterThan(1);
    const antes = contou;
    stop();
    clock.fire(200);
    expect(contou).toBe(antes);
  });

  it('uma animação de duração zero não toca: o botão não pode mentir', () => {
    const vazio = exampleDoc();
    vazio.run(new (class {
      readonly label = 'teste';
      readonly kind = 'structure' as const;
      apply(d: Doc): void { (d.file.animations ?? [])[1].duration = 0; }
      revert(): void {}
    })() as never);
    vazio.animation = 'walk';
    const clock = fakeClock();
    const player = createTransport(clock);
    player.play(vazio);
    expect(player.isPlaying()).toBe(false);
  });

  it('`forget` para o tocador, para trocar de animação nunca deixar tocando', () => {
    const clock = fakeClock();
    const player = createTransport(clock);
    player.play(doc);
    player.forget();
    expect(player.isPlaying()).toBe(false);
    expect(clock.pending()).toBe(0);
  });

  it('velocidade zero ou negativa não existe: pausa é `pause`', () => {
    const player = createTransport(fakeClock());
    player.setSpeed(0);
    expect(player.speed()).toBe(1);
    player.setSpeed(-2);
    expect(player.speed()).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Os treze controles da primeira linha
// ---------------------------------------------------------------------------

describe('os controles do tocador', () => {
  it('são treze, e nenhum fica sem se explicar', () => {
    // Eram treze no lote 2; o lote 9 acrescentou a lista "No fim" (item 100);
    // o degrau 4a tirou o "Gravar sozinho" (M6: editar sempre grava).
    expect(PLAYER_CONTROLS).toHaveLength(13);
    for (const control of PLAYER_CONTROLS) {
      expect(control.name.trim(), `${control.id} sem nome`).not.toBe('');
      expect(control.hint.trim(), `${control.id} sem dica`).not.toBe('');
    }
  });

  it('nenhuma tecla se repete entre eles', () => {
    const teclas = PLAYER_CONTROLS
      .map((c) => c.shortcut)
      .filter((k): k is string => k !== null);
    expect(new Set(teclas).size).toBe(teclas.length);
  });

  it('nenhum símbolo se repete: dois botões iguais ninguém distingue', () => {
    const simbolos = PLAYER_CONTROLS.map((c) => c.symbol).filter((sym) => sym !== '');
    expect(new Set(simbolos).size).toBe(simbolos.length);
  });

  it('a dica carrega o nome, a frase e a tecla entre parênteses', () => {
    const chavear = PLAYER_CONTROLS.find((c) => c.id === 'chavear');
    expect(chavear).toBeDefined();
    // O lote 15 partiu o Chavear em dois — "Chavear escolhidos" (K) e
    // "Chavear tudo" (Ctrl+K), com a palavra no botão, como no Spriter. A dica
    // continua sendo nome + frase + tecla, que é o que este teste prende.
    expect(controlLabel(chavear as never)).toBe(
      'Chavear escolhidos: Grava uma chave no tempo atual, só para o que está escolhido. Protege a pose (K)',
    );
    const tempo = PLAYER_CONTROLS.find((c) => c.id === 'tempo');
    expect(controlLabel(tempo as never)).not.toContain('(');
  });

  it('as teclas batem com as do menu Animação: uma fonte só', () => {
    const menu = new Map(
      flatEntries(animationMenu({ animating: true, loop: false }))
        .map((entry) => [entry.action, entry.shortcut]),
    );
    for (const control of PLAYER_CONTROLS) {
      if (control.shortcut === null || !menu.has(control.id)) continue;
      expect(menu.get(control.id), `${control.id} discorda do menu`).toBe(control.shortcut);
    }
  });

  it('os sete de andar no tempo vêm antes dos dois de gravar, e o Gravar sozinho saiu', () => {
    const ordem = PLAYER_CONTROLS.map((c) => c.id);
    expect(ordem.indexOf('chavear')).toBeGreaterThan(ordem.indexOf('ir-fim'));
    expect(ordem.indexOf('chavear-tudo')).toBeGreaterThan(ordem.indexOf('repetir'));
    // Degrau 4a, M6: o botão e a tecla A não existem mais.
    expect(ordem).not.toContain('gravar-sozinho');
    expect(PLAYER_CONTROLS.some((c) => c.shortcut === 'A')).toBe(false);
    expect(ordem[0]).toBe('ir-inicio');
  });
});

// ---------------------------------------------------------------------------
// A lista de animações mostra o laço, mas não o liga
// ---------------------------------------------------------------------------

describe('a lista do painel Animações', () => {
  it('sabe dizer quais animações repetem', () => {
    const doc = exampleDoc();
    const porNome = new Map(
      (doc.file.animations ?? []).map((a) => [a.name, a.loop === true]),
    );
    expect(porNome.get('walk')).toBe(true);
    expect(porNome.get('attack')).toBe(false);
  });

  it('a duração continua saindo do arquivo', () => {
    const doc = exampleDoc();
    const walk = findAnimation(doc.file, 'walk');
    expect(walk).not.toBeNull();
    expect(animationDuration(walk as never)).toBe(1);
  });
});
});

// ---------------------------------------------------------------------------
// tocador (lote 15) — era `lote15-tocador.test.ts`
// ---------------------------------------------------------------------------

describe('tocador (lote 15)', () => {
/**
 * Lote 15 (v3.7): o tocador como o do Spriter.
 *
 * Sem DOM. A barra de velocidade é uma conta (`speedFromSlider`), a linha 1 é
 * uma lista de dados (`PLAYER_CONTROLS`), e mudar a duração pelo campo é o
 * mesmo `setDuration` que o menu chama — com um passo de desfazer e nada mais.
 *
 * O pedido: *"barra de velocidade com número, tempo atual / duração para
 * digitar, e os dois de Chavear na linha"*, como na tela do Spriter Pro.
 */
const findAnimation = findAnimation__2;
const EXAMPLE = resolve(__dirname, '../../formato/exemplos/heroi.bone');
const RAW = readFileSync(EXAMPLE, 'utf8');

function heroi(): Doc {
  return new Doc(JSON.parse(RAW) as BoneFile, { path: EXAMPLE });
}

function state(patch: Partial<MenuState> = {}): MenuState {
  return {
    canRepack: false,
    canUndo: false,
    undoLabel: null,
    canRedo: false,
    redoLabel: null,
    view: viewMenuState(),
    lockBones: false,
    lockDrawings: false,
    space: 'local',
    compensation: { children: false, drawings: false, boxes: false },
    animating: true,
    loop: false,
    open: {},
    ...patch,
  };
}

function menus(): MenuGroupDef[] {
  return allMenus(state());
}

function control(id: string) {
  const found = PLAYER_CONTROLS.find((c) => c.id === id);
  expect(found, `o controle ${id} tem que existir`).toBeDefined();
  return found!;
}

// ---------------------------------------------------------------------------
// A barra de velocidade
// ---------------------------------------------------------------------------

describe('a barra de velocidade', () => {
  it('a barra anda em por cento e devolve o fator', () => {
    expect(speedFromSlider(100)).toBe(1);
    expect(speedFromSlider(25)).toBe(0.25);
    expect(speedFromSlider(50)).toBe(0.5);
    expect(speedFromSlider(200)).toBe(2);
  });

  it('valor fora dos limites fica preso nos limites', () => {
    // O plano pede 500 → 2: a barra vai até 200 por cento.
    expect(speedFromSlider(500)).toBe(2);
    expect(speedFromSlider(0)).toBe(SPEED_MIN / 100);
    expect(speedFromSlider(-40)).toBe(SPEED_MIN / 100);
    expect(speedFromSlider(Number.NaN)).toBe(1);
  });

  it('0,25 é 0,25 exato, e não 0,25000000000000006', () => {
    expect(String(speedFromSlider(25))).toBe('0.25');
    expect(String(speedFromSlider(33))).toBe('0.33');
  });

  it('o caminho de volta põe a barra onde a velocidade está', () => {
    expect(sliderFromSpeed(1)).toBe(100);
    expect(sliderFromSpeed(0.25)).toBe(25);
    expect(sliderFromSpeed(9)).toBe(SPEED_MAX);
    expect(sliderFromSpeed(0)).toBe(SPEED_MIN);
  });

  it('ida e volta não perde nada, em toda a faixa', () => {
    for (let percent = SPEED_MIN; percent <= SPEED_MAX; percent += 1) {
      expect(sliderFromSpeed(speedFromSlider(percent))).toBe(percent);
    }
  });

  it('a lista antiga de quatro velocidades continua exportada', () => {
    // Os testes do lote 2 a citam. Ela só saiu da tela.
    expect(SPEED_OPTIONS.map((o) => o.value)).toEqual([0.25, 0.5, 1, 2]);
  });
});

// ---------------------------------------------------------------------------
// A linha 1
// ---------------------------------------------------------------------------

describe('a linha 1 do tocador', () => {
  it('a velocidade virou barra e a duração virou campo', () => {
    expect(control('velocidade').kind).toBe('barra');
    expect(control('duracao').kind).toBe('campo');
    expect(control('tempo').kind).toBe('campo');
  });

  it('os dois de Chavear estão na linha, com palavra e com tecla', () => {
    const escolhidos = control('chavear');
    const tudo = control('chavear-tudo');
    expect(escolhidos.kind).toBe('botao-texto');
    expect(tudo.kind).toBe('botao-texto');
    expect(escolhidos.shortcut).toBe('K');
    expect(tudo.shortcut).toBe('Ctrl+K');
    // A palavra aparece no botão; o nome inteiro fica na dica.
    expect(escolhidos.symbol).toBe('Chavear');
    expect(tudo.symbol).toBe('Chavear tudo');
    expect(escolhidos.name).toBe('Chavear escolhidos');
  });

  it('com a base aberta a dica diz por que o botão está cinza (M5)', () => {
    const dica = baseOpenHint(control('chavear'));
    expect(dica).toContain('base aberta');
    expect(dica).toContain('(K)');
    expect(baseOpenHint(control('chavear-tudo'))).toContain('(Ctrl+K)');
    // Os de tocar dizem que a base tem um quadro só, com a tecla.
    expect(baseOpenHint(control('tocar'))).toContain('um quadro só');
    expect(baseOpenHint(control('tocar'))).toContain('(Espaço)');
    // Com a animação aberta é a dica normal, que diz o que o botão faz.
    expect(controlLabel(control('chavear'))).toContain('escolhido');
    expect(controlLabel(control('chavear'))).toContain('Protege a pose');
  });

  it('o modo de fim saiu da linha e foi para o ⋯ Mais', () => {
    expect(PLAYER_CONTROLS.find((c) => c.id === 'modo-de-fim')).toBeUndefined();
    const mais = moreMenuItems();
    expect(mais.find((m) => m.id === 'modo-de-fim')?.kind).toBe('lista');
    // "Tirar trecho de laço" já morava lá; os dois têm que continuar juntos.
    expect(mais.find((m) => m.id === 'tirar-trecho')).toBeDefined();
    expect(MORE_CONTROLS.length).toBe(mais.length);
  });

  it('nenhum controle da linha ficou sem dica, e todo botão tem nome', () => {
    for (const c of PLAYER_CONTROLS) {
      expect(c.hint.length, c.id).toBeGreaterThan(10);
      expect(c.name.length, c.id).toBeGreaterThan(0);
      expect(controlLabel(c)).toContain(c.name);
    }
  });
});

// ---------------------------------------------------------------------------
// Digitar no tempo e na duração
// ---------------------------------------------------------------------------

describe('os dois campos de tempo', () => {
  it('o campo do tempo entende vírgula, ponto e o "s" no fim', () => {
    expect(parseTime('0,5')).toBeCloseTo(0.5, 9);
    expect(parseTime('0.5')).toBeCloseTo(0.5, 9);
    expect(parseTime('0,50 s')).toBeCloseTo(0.5, 9);
    expect(parseTime('abc')).toBeNull();
  });

  it('digitar 2 na duração do walk muda o arquivo, num passo de desfazer', () => {
    const doc = heroi();
    doc.animation = 'walk';
    expect(animationDuration(findAnimation(doc.file, 'walk')!)).toBeCloseTo(1, 9);

    doc.run(new EditKeys('walk', 'Mudar a duração', (file, name) => {
      setDuration(file, name, 2, false);
    }));
    expect(animationDuration(findAnimation(doc.file, 'walk')!)).toBeCloseTo(2, 9);
    expect(doc.undoLabel).toBe('Mudar a duração');

    doc.undo();
    expect(animationDuration(findAnimation(doc.file, 'walk')!)).toBeCloseTo(1, 9);
  });

  it('pelo campo as chaves NÃO esticam: só o número muda', () => {
    const doc = heroi();
    doc.animation = 'walk';
    const antes = JSON.stringify(findAnimation(doc.file, 'walk')?.timelines);
    doc.run(new EditKeys('walk', 'Mudar a duração', (file, name) => {
      setDuration(file, name, 2, false);
    }));
    expect(JSON.stringify(findAnimation(doc.file, 'walk')?.timelines)).toBe(antes);
  });
});

// ---------------------------------------------------------------------------
// A porta que pergunta continua existindo
// ---------------------------------------------------------------------------

describe('Animação → Mudar duração…', () => {
  it('deixou de ser um item cinza', () => {
    const animacao = menus().find((g) => g.label === 'Animação');
    expect(animacao).toBeDefined();
    const item = flatEntries(animacao?.entries ?? [])
      .find((e) => e.action === 'mudar-duracao');
    expect(item).toBeDefined();
    expect(item?.enabled).toBe(true);
    // Rodada 40, lote 5 (nota do doc 50): aceso, ele NÃO diz "Abra uma animação
    // primeiro" — essa dica é só do item cinza. E nunca mais "vem no lote 13".
    expect(item?.hint ?? '').not.toContain('Abra uma animação primeiro');
    expect(item?.hint ?? '').not.toContain('lote 13');
  });
});
});

// ---------------------------------------------------------------------------
// desenho e semaforo (lote 3a) — era `lote3a-desenho-e-semaforo.test.ts`
// ---------------------------------------------------------------------------

describe('desenho e semaforo (lote 3a)', () => {
/**
 * Lote 3a (v1.9): trocar o desenho por lista, e o semáforo do Chavear.
 *
 * Degrau 4a (17/09/2026): o semáforo saiu (G13) e editar sempre grava (M6).
 * Os testes dele foram reescritos para provar o novo: Chavear protege a pose,
 * sem cor, e nada recusa.
 */
const EXAMPLE = resolve(__dirname, '../../formato/exemplos/heroi.bone');
const RAW = readFileSync(EXAMPLE, 'utf8');

function example(): BoneFile {
  return JSON.parse(RAW) as BoneFile;
}

function exampleDoc(): Doc {
  return new Doc(example());
}

function pick(patch: Partial<Selection>): Selection {
  return { ...emptySelection(), ...patch };
}

/** Todo campo de um modelo, pela sua chave. */
function fieldsOf(groups: readonly FieldGroup[]): Map<string, FieldDef> {
  const out = new Map<string, FieldDef>();
  for (const group of groups) for (const field of group.fields) out.set(field.key, field);
  return out;
}

/** O primeiro slot que tem mais de um desenho na pele default. */
function slotComVarios(file: BoneFile): { slot: string; nomes: string[] } {
  const skin = (file.skins ?? []).find((s) => s.name === 'default');
  for (const [slot, attachments] of Object.entries(skin?.attachments ?? {})) {
    const nomes = Object.keys(attachments ?? {});
    if (nomes.length > 1) return { slot, nomes };
  }
  const [slot, attachments] = Object.entries(skin?.attachments ?? {})[0] ?? ['', {}];
  return { slot, nomes: Object.keys(attachments ?? {}) };
}

// ---------------------------------------------------------------------------
// Item 9 — a lista de desenhos
// ---------------------------------------------------------------------------

describe('a lista de desenhos do slot', () => {
  it('sem pele escolhida, mostra os anexos da pele default', () => {
    const file = example();
    const { slot, nomes } = slotComVarios(file);
    const options = attachmentOptions(file, slot, []);
    expect(options[0]).toEqual({ value: '', label: '(nenhum)' });
    expect(options.slice(1).map((o) => o.value)).toEqual(nomes);
  });

  it('`(nenhum)` vem primeiro e vale a string vazia', () => {
    const file = example();
    const { slot } = slotComVarios(file);
    const [primeiro] = attachmentOptions(file, slot, ['default']);
    expect(primeiro.value).toBe('');
    expect(primeiro.label).toBe('(nenhum)');
  });

  it('com duas peles visíveis, a união — e nenhum nome duas vezes', () => {
    const file = example();
    const peles = (file.skins ?? []).map((s) => s.name);
    expect(peles.length).toBeGreaterThan(1);
    const { slot } = slotComVarios(file);
    const uma = attachmentOptions(file, slot, [peles[0]]).map((o) => o.value);
    const duas = attachmentOptions(file, slot, [peles[0], peles[1]]).map((o) => o.value);
    // A união contém tudo o que a primeira tinha…
    for (const nome of uma) expect(duas).toContain(nome);
    // …e nada aparece repetido.
    expect(new Set(duas).size).toBe(duas.length);
  });

  it('um slot que não existe dá só `(nenhum)`', () => {
    const options = attachmentOptions(example(), 'nao-existe', []);
    expect(options).toEqual([{ value: '', label: '(nenhum)' }]);
  });

  it('o campo "Anexo" virou LISTA, e não é mais um campo de texto', () => {
    const file = example();
    const { slot, nomes } = slotComVarios(file);
    const campo = fieldsOf(slotFields(file, slot, [])).get('attachment');
    expect(campo?.kind).toBe('select');
    expect(campo?.options?.map((o) => o.value)).toEqual(['', ...nomes]);
    // `(nenhum)` tem que TIRAR o campo do arquivo, não gravar `""`.
    expect(campo?.dropWhenEmpty).toBe(true);
  });

  it('`buildProperties` leva as peles visíveis até a lista', () => {
    const file = example();
    const peles = (file.skins ?? []).map((s) => s.name);
    const { slot } = slotComVarios(file);
    const model = buildProperties(file, pick({ slots: [slot] }), [peles[0], peles[1]]);
    const campo = fieldsOf(model.groups).get('attachment');
    const esperado = attachmentOptions(file, slot, [peles[0], peles[1]]);
    expect(campo?.options).toEqual(esperado);
  });

  it('trocar o desenho em Montagem, e desfazer, devolve o arquivo por texto', () => {
    const doc = exampleDoc();
    const { slot, nomes } = slotComVarios(doc.file);
    expect(nomes.length).toBeGreaterThan(1);
    const outro = nomes.find((n) => !isCurrentAttachment(doc.file, slot, n));
    expect(outro).toBeDefined();

    const antes = JSON.stringify(doc.file, null, 2);
    const campo = fieldsOf(slotFields(doc.file, slot, [])).get('attachment') as FieldDef;
    expect(writeFieldValue(doc, campo, outro)).toBeNull();
    expect(isCurrentAttachment(doc.file, slot, outro as string)).toBe(true);

    doc.undo();
    expect(JSON.stringify(doc.file, null, 2)).toBe(antes);
  });

  it('com uma animação aberta, trocar o desenho cria a chave de Desenho', () => {
    const doc = exampleDoc();
    const { slot, nomes } = slotComVarios(doc.file);
    const outro = nomes.find((n) => !isCurrentAttachment(doc.file, slot, n)) as string;
    doc.animation = 'walk';
    doc.time = 0.5;

    const campo = fieldsOf(slotFields(doc.file, slot, [])).get('attachment') as FieldDef;
    expect(writeFieldValue(doc, campo, outro)).toBeNull();

    const alvo = { type: 'slot' as const, target: slot, property: 'attachment' };
    expect(isKeyed(doc.file, 'walk', 0.5, alvo)).toBe(true);
    // E a pose de repouso NÃO mudou: chavear não mexe na montagem.
    expect(isCurrentAttachment(doc.file, slot, outro)).toBe(false);
  });

  it('com uma animação aberta a troca nunca é recusada, e um desfazer a devolve (M6)', () => {
    const doc = exampleDoc();
    const { slot, nomes } = slotComVarios(doc.file);
    const outro = nomes.find((n) => !isCurrentAttachment(doc.file, slot, n)) as string;
    doc.animation = 'walk';
    doc.time = 0.333;
    const antes = JSON.stringify(doc.file, null, 2);

    const campo = fieldsOf(slotFields(doc.file, slot, [])).get('attachment') as FieldDef;
    // Não existe mais "Gravar sozinho desligado": a saída é sempre escrever.
    expect(writeFieldValue(doc, campo, outro)).toBeNull();
    const alvo = { type: 'slot' as const, target: slot, property: 'attachment' };
    expect(isKeyed(doc.file, 'walk', 0.333, alvo)).toBe(true);
    doc.undo();
    expect(JSON.stringify(doc.file, null, 2)).toBe(antes);
  });

  it('a bolinha da Árvore lê o mesmo campo que a lista escreve', () => {
    const file = example();
    const { slot, nomes } = slotComVarios(file);
    const atual = (file.slots ?? []).find((s) => s.name === slot)?.attachment;
    for (const nome of nomes) {
      expect(isCurrentAttachment(file, slot, nome)).toBe(nome === atual);
    }
  });
});

// ---------------------------------------------------------------------------
// Item 10 — o Chavear. O semáforo saiu no degrau 4a (G13): sobra o que o
// botão faz, que é proteger a pose.
// ---------------------------------------------------------------------------

describe('o Chavear sem semáforo: protege a pose', () => {
  it('com a base aberta Chavear não grava nada: mexer já vai para a base', () => {
    const doc = exampleDoc();
    doc.animation = null;
    const antes = JSON.stringify(doc.file);
    const alvos = targetsForSelection(pick({ bones: ['hips'] }));
    expect(keyTargetsNow(doc, alvos)).toBe(0);
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('com uma animação aberta e nada escolhido, não há o que chavear', () => {
    const doc = exampleDoc();
    doc.animation = 'walk';
    expect(keyTargetsNow(doc, targetsForSelection(emptySelection()))).toBe(0);
  });

  it('no tempo 0 do `walk`, com o `hips` escolhido, grava por cima sem duplicar', () => {
    const doc = exampleDoc();
    doc.animation = 'walk';
    doc.time = 0;
    const alvos = targetsForSelection(pick({ bones: ['hips'] }));
    // O `walk` do herói tem chave de `hips` em 0, em alguma propriedade.
    const girar = alvos.find((a) => isKeyed(doc.file, 'walk', 0, a))!;
    expect(girar).toBeDefined();
    const quantas = findTimeline(doc.file, 'walk', girar)?.keys?.length;
    expect(keyTargetsNow(doc, alvos)).toBeGreaterThan(0);
    expect(findTimeline(doc.file, 'walk', girar)?.keys?.length).toBe(quantas);
  });

  it('num tempo sem chave nenhuma, grava o valor que a tela mostra — a pose fica protegida', () => {
    const doc = exampleDoc();
    doc.animation = 'walk';
    // 0,333 s não é tempo de chave em animação nenhuma do exemplo.
    doc.time = 0.333;
    const alvos = targetsForSelection(pick({ bones: ['hips'] }));
    const girar = alvos.find((a) => a.property === 'rotation')!;
    expect(isKeyed(doc.file, 'walk', 0.333, girar)).toBe(false);
    const naTela = currentValueOf(doc, girar);
    expect(keyTargetsNow(doc, alvos)).toBeGreaterThan(0);
    expect(isKeyed(doc.file, 'walk', 0.333, girar)).toBe(true);
    expect(valueAt(doc.file, 'walk', 0.333, girar)).toEqual(naTela);
  });

  it('osso e slot juntos: um passo de desfazer devolve os dois', () => {
    const doc = exampleDoc();
    doc.animation = 'walk';
    doc.time = 0.333;
    const { slot } = slotComVarios(doc.file);
    const antes = JSON.stringify(doc.file);
    const alvos = targetsForSelection(pick({ bones: ['hips'], slots: [slot] }));
    expect(keyTargetsNow(doc, alvos)).toBeGreaterThan(1);
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('as dicas dizem "protege a pose", e o semáforo saiu do código e do CSS', () => {
    expect(KEY_HINTS.chavear).toContain('Protege a pose');
    expect(KEY_HINTS.tudo).toContain('Protege a pose');
    expect(KEY_HINTS.base).toContain('base aberta');
    expect(PLAYER_CONTROLS.find((c) => c.id === 'chavear-tudo')?.hint).toContain('Protege a pose');
    // G13: nem a função da cor, nem a da dica por cor, nem a cor no CSS.
    expect('keyButtonState' in poseMode).toBe(false);
    expect('keyButtonHint' in poseMode).toBe(false);
    const css = readFileSync(resolve(__dirname, '../src/panels/dopesheet.css'), 'utf8');
    expect(css).not.toMatch(/dope-chavear-(verde|vermelho|inativo)/);
    expect(css).not.toContain('dope-toc-gravar-sozinho');
  });

  it('os alvos do botão são os mesmos que Chavear grava', () => {
    const alvos = targetsForSelection(pick({ bones: ['hips'], slots: ['corpo'] }));
    const ossos = alvos.filter((a) => a.type === 'bone').map((a) => a.property);
    // `shearX` e `shearY` entraram no lote 13, com a ferramenta Inclinar (item
    // 21): sem eles, inclinar em Animando daria um valor que a animação
    // esqueceria no próximo Chavear.
    expect(ossos).toEqual(['rotation', 'x', 'y', 'scaleX', 'scaleY', 'shearX', 'shearY']);
    const slots = alvos.filter((a) => a.type === 'slot').map((a) => a.property);
    expect(slots).toEqual(['color', 'attachment']);
  });

  it('sem nada escolhido não há alvo nenhum', () => {
    expect(targetsForSelection(emptySelection())).toEqual([]);
  });
});
});

// ---------------------------------------------------------------------------
// resumo (lote 3b) — era `lote3b-resumo.test.ts`
// ---------------------------------------------------------------------------

describe('resumo (lote 3b)', () => {
/**
 * Lote 3b (v2.0): a linha Resumo da folha de chaves.
 *
 * Sem DOM. O Resumo é uma conta sobre o `.bone` — quais tempos têm chave, quais
 * chaves estão em cada tempo, e se aquele tempo junta mais de um tipo de alvo —
 * e mover os losangos é o MESMO `EditKeys` com `moveKeys` que o arrasto de
 * chave já usava. É isso que se prova aqui.
 */
const EXAMPLE = resolve(__dirname, '../../formato/exemplos/heroi.bone');
const RAW = readFileSync(EXAMPLE, 'utf8');

/**
 * Uma animação escrita à mão, com chaves em 0, 0,17 e 0,5.
 *
 * Em 0,17 há um osso E um evento: é o tempo "misto" que o losango branco marca.
 */
function testFile(): BoneFile {
  return {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [{ name: 'root' }, { name: 'braco', parent: 'root', x: 100, length: 40 }],
    events: [{ name: 'passo' }],
    animations: [{
      name: 'acenar',
      duration: 1,
      timelines: [
        {
          type: 'bone', target: 'braco', property: 'rotation',
          keys: [{ time: 0, value: 0 }, { time: 0.17, value: 20 }, { time: 0.5, value: 0 }],
        },
        {
          type: 'bone', target: 'braco', property: 'x',
          keys: [{ time: 0, value: 100 }, { time: 0.5, value: 120 }],
        },
        {
          type: 'event',
          keys: [{ time: 0.17, event: 'passo' }],
        },
      ],
    }],
  } as BoneFile;
}

function testDoc(): Doc {
  return new Doc(testFile());
}

function texto(doc: Doc): string {
  return JSON.stringify(doc.file, null, 2);
}

// ---------------------------------------------------------------------------
// Quais tempos têm chave
// ---------------------------------------------------------------------------

describe('os tempos do Resumo', () => {
  it('uma animação com chaves em 0, 0,17 e 0,5 dá três tempos', () => {
    expect(summaryTimes(testFile(), 'acenar')).toEqual([0, 0.17, 0.5]);
  });

  it('é a MESMA lista que as setas ↑ e ↓ andam', () => {
    const file = testFile();
    expect(summaryTimes(file, 'acenar')).toEqual(allKeyTimes(file, 'acenar'));
  });

  it('uma animação sem chave nenhuma não tem losango', () => {
    const file = testFile();
    (file.animations ?? [])[0].timelines = [];
    expect(summaryTimes(file, 'acenar')).toEqual([]);
    expect(summaryMarks(file, 'acenar')).toEqual([]);
  });

  it('uma animação que não existe não inventa tempo', () => {
    expect(summaryTimes(testFile(), 'nao-existe')).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Quais chaves estão em cada tempo
// ---------------------------------------------------------------------------

describe('as chaves de um tempo', () => {
  it('em 0,17 estão as de TODAS as linhas daquele tempo', () => {
    const refs = refsAtTime(testFile(), 'acenar', 0.17);
    // A rotação do braço e o evento. O `x` não tem chave em 0,17.
    expect(refs).toHaveLength(2);
    expect(refs.every((ref) => sameTime(ref.time, 0.17))).toBe(true);
    expect(refs.map((ref) => ref.target.type).sort()).toEqual(['bone', 'event']);
  });

  it('em 0 estão as duas linhas de osso, e nenhum evento', () => {
    const refs = refsAtTime(testFile(), 'acenar', 0);
    expect(refs).toHaveLength(2);
    expect(refs.map((ref) => ref.target.type)).toEqual(['bone', 'bone']);
  });

  it('num tempo sem chave, nenhuma', () => {
    expect(refsAtTime(testFile(), 'acenar', 0.33)).toEqual([]);
  });

  it('a soma dos losangos é o total de chaves da animação', () => {
    const marks = summaryMarks(testFile(), 'acenar');
    expect(marks.map((m) => m.count)).toEqual([2, 2, 2]);
    expect(marks.reduce((total, m) => total + m.count, 0)).toBe(6);
  });
});

// ---------------------------------------------------------------------------
// O losango branco
// ---------------------------------------------------------------------------

describe('o tempo misto', () => {
  it('um tempo só com ossos não é misto', () => {
    expect(isMixedTime(testFile(), 'acenar', 0)).toBe(false);
    expect(isMixedTime(testFile(), 'acenar', 0.5)).toBe(false);
  });

  it('um tempo com osso e evento é misto', () => {
    expect(isMixedTime(testFile(), 'acenar', 0.17)).toBe(true);
  });

  it('`summaryMarks` marca o misto na mesma passada', () => {
    const marks = summaryMarks(testFile(), 'acenar');
    expect(marks.map((m) => m.mixed)).toEqual([false, true, false]);
  });

  it('um tempo sem chave não é misto', () => {
    expect(isMixedTime(testFile(), 'acenar', 0.9)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Arrastar o losango move tudo, num passo só
// ---------------------------------------------------------------------------

describe('mover as chaves de um tempo', () => {
  it('de 0,17 para 0,2: todas vão, e nenhuma fica para trás', () => {
    const doc = testDoc();
    const refs = refsAtTime(doc.file, 'acenar', 0.17);
    doc.run(new EditKeys('acenar', 'Mover chaves', (file, name) => {
      moveKeys(file, name, refs, 0.03);
    }));

    expect(summaryTimes(doc.file, 'acenar')).toEqual([0, 0.2, 0.5]);
    expect(refsAtTime(doc.file, 'acenar', 0.2)).toHaveLength(2);
    expect(refsAtTime(doc.file, 'acenar', 0.17)).toEqual([]);
    // O evento foi junto: o tempo continua misto no lugar novo.
    expect(isMixedTime(doc.file, 'acenar', 0.2)).toBe(true);
  });

  it('é UM passo de desfazer, e desfazer devolve o arquivo por texto', () => {
    const doc = testDoc();
    const antes = texto(doc);
    const refs = refsAtTime(doc.file, 'acenar', 0.17);
    doc.run(new EditKeys('acenar', 'Mover chaves', (file, name) => {
      moveKeys(file, name, refs, 0.03);
    }));
    expect(texto(doc)).not.toBe(antes);
    doc.undo();
    expect(texto(doc)).toBe(antes);
  });

  it('o comando diz que mexeu numa animação só', () => {
    const command = new EditKeys('acenar', 'Mover chaves', () => {});
    expect(command.animationOnly).toBe('acenar');
  });

  it('mover para cima de outro tempo funde os dois losangos', () => {
    const doc = testDoc();
    const refs = refsAtTime(doc.file, 'acenar', 0.17);
    // 0,17 + 0,33 = 0,5, onde já há duas chaves.
    doc.run(new EditKeys('acenar', 'Mover chaves', (file, name) => {
      moveKeys(file, name, refs, 0.33);
    }));
    expect(summaryTimes(doc.file, 'acenar')).toEqual([0, 0.5]);
    // A rotação foi por cima da que estava lá; o evento se somou.
    expect(refsAtTime(doc.file, 'acenar', 0.5)).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// E no arquivo de verdade
// ---------------------------------------------------------------------------

describe('no herói', () => {
  it('cada animação tem um Resumo com pelo menos um losango', () => {
    const file = JSON.parse(RAW) as BoneFile;
    for (const animation of file.animations ?? []) {
      const marks = summaryMarks(file, animation.name);
      expect(marks.length, `${animation.name} sem losango`).toBeGreaterThan(0);
      for (const mark of marks) expect(mark.count).toBeGreaterThan(0);
    }
  });

  it('todo losango cai num tempo que as setas também encontram', () => {
    const file = JSON.parse(RAW) as BoneFile;
    for (const animation of file.animations ?? []) {
      const times = allKeyTimes(file, animation.name);
      for (const mark of summaryMarks(file, animation.name)) {
        expect(times.some((t) => sameTime(t, mark.time))).toBe(true);
      }
    }
  });
});
});

// Rodada 47, lote 6b (nota do doc 88)
describe('rodada 47, lote 6b: com o foco na barra de velocidade, as setas são da barra', () => {
  it('a folha deixa as setas, PageUp/Down, Home e End para a barrinha com o foco', async () => {
    const { barKeepsKey } = await import('../src/panels/dopesheet.js');
    const barra = { tagName: 'INPUT', type: 'range' } as unknown as EventTarget;
    const texto = { tagName: 'INPUT', type: 'text' } as unknown as EventTarget;
    expect(barKeepsKey({ target: barra, key: 'ArrowRight' })).toBe(true);
    expect(barKeepsKey({ target: barra, key: 'PageUp' })).toBe(true);
    expect(barKeepsKey({ target: barra, key: ' ' })).toBe(false);
    expect(barKeepsKey({ target: texto, key: 'ArrowRight' })).toBe(false);
    expect(barKeepsKey({ target: null, key: 'ArrowRight' })).toBe(false);
  });
});

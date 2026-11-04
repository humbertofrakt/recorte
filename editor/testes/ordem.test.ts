/**
 * Ordem de desenho — os testes por assunto (lote A3, v10.6).
 *
 * Um `describe` por arquivo antigo, com o nome e o cabeçalho dele, e os
 * mesmos testes dentro. O miolo vai sem recuo: um texto de várias linhas
 * não pode mudar.
 *
 * Juntou: `lote25-ordem-e-previa`, `lote35-botoes-da-ordem`, `lote50-entre-linhas`, `lote66-ordem-spriter`.
 */

import { readFileSync } from 'node:fs';
// Rodada 8c, o salto.
import { readFileSync as readFileSyncSalto } from 'node:fs';
import { loadSkeletonData as loadSkeletonDataSalto } from '../../runtime/src/index.js';
import { Doc as DocSalto } from '../src/doc/document.js';
import { skeletonThumbnail as skeletonThumbnailSalto } from '../src/panels/thumbnails.js';
import { resolve } from 'node:path';
import { describe, expect, it, afterEach } from 'vitest';
import { loadAnimationsFor, loadSkeletonData, Skeleton, pose } from '../../runtime/src/index.js';
import type { BoneFile, AtlasData, AtlasPageData, SkeletonData } from '../../runtime/src/index.js';
import { Doc } from '../src/doc/document.js';
import { MoveFolder, PutInFolder, RenameFolder, TakeOutOfFolder, folderMembers, mergeOnRename, mergeWarning, renameNotice, movedCount, orderEntries, orderPieces, slotLook, stepIndex, ORDER_BUTTONS, arrayZone, dropZone, insertIndex, baseOrder, drawOrderAt, moveBlock, offsetsFor, orderKeyDir, orderTargets, orderWithOffsets, copyOrderNotice, copyOrderTimes, runCopyOrderToAnimation, runOrderStep, stepOrder, orderRowSelection } from '../src/panels/draw-order-model.js';
import { MoveSlot } from '../src/panels/tree-model.js';
import { DOCK_PANELS } from '../src/ui/shell.js';
import { RIGHT_GROUPS, allTabs, defaultLayout, parseLayout, sideOf } from '../src/ui/layout-model.js';
import { DEFAULT_END_MODE, createTransport } from '../src/anim/transport.js';
import { onRevealKey } from '../src/anim/keying.js';
import type { KeyRef } from '../src/anim/keying.js';
import type { TransportClock } from '../src/anim/transport.js';
import { SetAnimationLoop } from '../src/panels/animations-model.js';
import { emptySelection } from '../src/contract.js';
import type { Command, EditorDoc, Selection } from '../src/contract.js';
import { hasIcon } from '../src/ui/icons.js';
import { allMenus, flatEntries } from '../src/ui/menus.js';
import { viewMenuState } from './ajuda-view.js';
import * as propertiesModel from '../src/panels/properties-model.js';

// ---------------------------------------------------------------------------
// ordem e previa (lote 25) — era `lote25-ordem-e-previa.test.ts`
// ---------------------------------------------------------------------------

describe('ordem e previa (lote 25)', () => {
/**
 * Lote 25 (v4.8): as anotações 5, 8, 9, 11 e 14 do Humberto.
 *
 * | # | Nas palavras dele |
 * |:---:|:---|
 * | 5 | *"Muda isso de lugar, não faz sentido tá aí"* — a Prévia, na faixa de baixo |
 * | 8 | *"Ordem é de cima pra baixo, e você ainda colocou um texto kkkk. Muda isso."* |
 * | 9 | *"O que é isso?"*, apontando `hitbox`, `hand_point` e `cape_path` |
 * | 11 | *"Deixar criar pastas para guardar imagens na Ordem."* |
 * | 14 | *"Quando clico numa animação sem laço, ela roda uma vez. Deveria rodar sempre."* |
 *
 * Sem DOM. A ordem, as pastas e o tocador são conta pura; o que precisa de tela
 * está no `draw-order.ts`, e o que se prova aqui é o que ele desenha.
 */
const EXAMPLE = resolve(__dirname, '../../formato/exemplos/heroi.bone');
const RAW = readFileSync(EXAMPLE, 'utf8');
const PANEL_SOURCE = resolve(__dirname, '../src/panels/draw-order.ts');

function heroi(): Doc {
  return new Doc(JSON.parse(RAW) as BoneFile, { path: EXAMPLE });
}

/** O `.bone` como texto, para provar que desfazer devolve o arquivo. */
function texto(doc: Doc): string {
  return JSON.stringify(doc.file, null, 2);
}

function nomes(doc: Doc): string[] {
  return (doc.file.slots ?? []).map((s) => s.name);
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
// Anotação 9 — só desenho entra na aba Ordem
// ---------------------------------------------------------------------------

describe('anotação 9 — a aba Ordem só lista desenhos', () => {
  it('caixa, ponto, caminho e máscara ficam de fora', () => {
    const doc = heroi();
    const lista = orderPieces(doc.file).map((p) => p.name);
    expect(lista).not.toContain('hitbox');
    expect(lista).not.toContain('hand_point');
    expect(lista).not.toContain('cape_path');
    expect(lista).not.toContain('mask');
    expect(lista).toContain('hand');
  });

  it('cada um deles diz por si que está fora', () => {
    const doc = heroi();
    expect(slotLook(doc.file, 'hitbox')).toBe('fora');
    expect(slotLook(doc.file, 'hand_point')).toBe('fora');
    expect(slotLook(doc.file, 'cape_path')).toBe('fora');
    expect(slotLook(doc.file, 'mask')).toBe('fora');
    expect(slotLook(doc.file, 'hand')).toBe('desenho');
    // `weapon` é um esqueleto de fora encaixado: ele desenha, e entra.
    expect(slotLook(doc.file, 'weapon')).toBe('desenho');
  });

  it('sem desenho NESTA pele, mas com ordem: entra apagado', () => {
    const doc = heroi();
    const slot = (doc.file.slots ?? []).find((s) => s.name === 'hand');
    expect(slot).toBeDefined();
    delete slot!.attachment;
    expect(slotLook(doc.file, 'hand')).toBe('sem-imagem');
    const linha = orderPieces(doc.file).find((p) => p.name === 'hand');
    expect(linha?.faded).toBe(true);
  });

  it('slot sem desenho em pele nenhuma some: ele não tem o que ordenar', () => {
    const doc = heroi();
    expect(slotLook(doc.file, 'hitbox')).toBe('fora');
    expect(orderPieces(doc.file).some((p) => p.name === 'hitbox')).toBe(false);
  });

  // Rodada 38, lote 1 (06/10/2026). O Humberto: "as partículas devem aparecer
  // na ordem de desenho". O emissor DESENHA no lugar do slot (§9.9 da extensão),
  // e por isso tem ordem; a aba o deixava de fora, junto da caixa e do ponto.
  it('o emissor de partículas entra na Ordem, como qualquer desenho', () => {
    const doc = heroi();
    const file = doc.file;
    file.slots!.splice(3, 0, { name: 'fogo', bone: 'foot_b', attachment: 'fogo' });
    const pele = file.skins![0]!;
    (pele.attachments as Record<string, unknown>)['fogo'] = { fogo: { type: 'BONE_particle', seed: 0 } };
    expect(slotLook(file, 'fogo')).toBe('desenho');
    const pecas = orderPieces(file);
    const linha = pecas.find((p) => p.name === 'fogo');
    expect(linha).toBeDefined();
    // No lugar dele: entre o que vem antes e o que vem depois no array.
    const nomes = pecas.map((p) => p.name);
    expect(nomes.indexOf('fogo')).toBe(nomes.indexOf('hair') + 1);
    // E a MoveSlot que a aba roda o leva para a frente de tudo (o resto do teste).
    const de = file.slots!.findIndex((s) => s.name === 'fogo');
    new MoveSlot(de, file.slots!.length - 1).apply(doc);
    expect(file.slots!.at(-1)!.name).toBe('fogo');
    expect(orderEntries(file)[0]).toMatchObject({ kind: 'peca', piece: { name: 'fogo' } });
  });

  // Rodada 38, lote 3 — conferência da v30.2 (doc 30, nota a): "Mandar para
  // trás" no emissor do topo dizia que andou, e ele ficava na posição 0 da lista
  // e a cena não mudava. O passo trocava com o `cape_path`, um caminho, que a
  // aba não mostra e que não desenha. O passo tem de pular o que não se vê.
  it('o passo de um lugar anda até o vizinho que SE VÊ, pulando caixa, ponto e caminho', () => {
    const doc = heroi();
    const file = doc.file;
    file.slots!.push({ name: 'fogo', bone: 'foot_b', attachment: 'fogo' });
    (file.skins![0]!.attachments as Record<string, unknown>)['fogo'] = { fogo: { type: 'BONE_particle', seed: 0 } };
    const lista = (): string[] => orderPieces(file).map((p) => p.name).reverse(); // de cima para baixo
    expect(lista()[0]).toBe('fogo');
    doc.select({ ...emptySelection(), slots: ['fogo'] });
    expect(runOrderStep(doc, 'fundo-1')).toBe(true);
    // Uma casa para baixo NA LISTA: o de baixo dele passou para cima.
    expect(lista().indexOf('fogo')).toBe(1);
    expect(runOrderStep(doc, 'frente-1')).toBe(true);
    expect(lista()[0]).toBe('fogo');
    // E o que não se vê fica onde estava, um em relação ao outro.
    const fora = file.slots!.map((s) => s.name).filter((n) => !lista().includes(n));
    expect(fora).toEqual(['mask', 'hitbox', 'hand_point', 'cape_path']);
  });

  it('escolher o emissor na Ordem abre a ficha DELE, como o nó no Godot; a imagem abre a do slot', () => {
    const doc = heroi();
    const file = doc.file;
    file.slots!.push({ name: 'fogo', bone: 'foot_b', attachment: 'fogo' });
    (file.skins![0]!.attachments as Record<string, unknown>)['fogo'] = { fogo: { type: 'BONE_particle', seed: 0 } };
    expect(orderRowSelection(file, 'fogo')).toEqual({ ...emptySelection(), attachments: [{ slot: 'fogo', attachment: 'fogo' }] });
    expect(orderRowSelection(file, 'hand')).toEqual({ ...emptySelection(), slots: ['hand'] });
  });
});

// ---------------------------------------------------------------------------
// Anotação 8 — a lista de ponta-cabeça
// ---------------------------------------------------------------------------

describe('anotação 8 — o de cima da lista fica NA FRENTE', () => {
  it('a primeira linha é o último do array', () => {
    const doc = heroi();
    const pecas = orderPieces(doc.file);
    const ultima = pecas[pecas.length - 1]!;
    const entries = orderEntries(doc.file);
    const primeira = entries[0]!;
    const nome = primeira.kind === 'peca' ? primeira.piece.name : primeira.pieces[0]!.name;
    expect(nome).toBe(ultima.name);
  });

  it('Ctrl+↑ leva para a frente, que é o FIM do array', () => {
    const doc = heroi();
    const antes = nomes(doc);
    const pecas = orderPieces(doc.file);
    // A SEGUNDA linha da tela é a penúltima peça visível.
    const segunda = pecas[pecas.length - 2]!;
    const alvo = stepIndex(segunda.index, true, antes.length);
    expect(alvo).toBe(segunda.index + 1);

    doc.run(new MoveSlot(segunda.index, alvo as number));
    // Ela andou para o fim do array, que é para a frente do desenho.
    expect(nomes(doc)[segunda.index + 1]).toBe(segunda.name);
    // E virou a primeira linha da tela.
    const primeira = orderEntries(doc.file)[0]!;
    const nome = primeira.kind === 'peca' ? primeira.piece.name : primeira.pieces[0]!.name;
    expect(nome).toBe(segunda.name);
  });

  it('a frase que explicava o contrário saiu do painel', () => {
    const fonte = readFileSync(PANEL_SOURCE, 'utf8');
    expect(fonte).not.toContain('é desenhado primeiro e fica ATRÁS');
    expect(fonte).not.toContain('ordem-aviso');
  });
});

// ---------------------------------------------------------------------------
// Anotação 11 — as pastas
// ---------------------------------------------------------------------------

describe('anotação 11 — pastas na aba Ordem', () => {
  it('as peças vizinhas da mesma pasta viram uma pasta só', () => {
    const doc = heroi();
    const entries = orderEntries(doc.file);
    const capa = entries.find((e) => e.kind === 'pasta' && e.folder === 'capa');
    expect(capa).toBeDefined();
    if (capa === undefined || capa.kind !== 'pasta') throw new Error('a pasta capa sumiu');
    // `cape_path` também é da pasta `capa`, mas é um caminho: ele não entra na
    // lista, e por isso não quebra a pasta em duas.
    expect(capa.pieces.length).toBe(2);
    expect(capa.parts).toBe(1);
    expect(folderMembers(doc.file, 'capa').sort())
      .toEqual(['cape_lower', 'cape_upper']);
  });

  it('mover a pasta leva as peças juntas, e a ordem interna não muda', () => {
    const doc = heroi();
    const antes = texto(doc);
    const lista = nomes(doc);
    const de = lista.indexOf('cape_upper');
    const ate = lista.indexOf('cape_lower');
    expect(ate - de).toBe(1);

    doc.run(new MoveFolder(de, 2, de + 1));
    const depois = nomes(doc);
    const de2 = depois.indexOf('cape_upper');
    const ate2 = depois.indexOf('cape_lower');
    expect(de2).toBe(de + 1);
    // A distância entre as duas é a mesma: a ordem interna ficou.
    expect(ate2 - de2).toBe(1);
    expect(doc.undoLabel).toBe('Mover pasta');

    doc.undo();
    expect(texto(doc)).toBe(antes);
  });

  it('mover a pasta nas pontas não perde peça nenhuma', () => {
    const doc = heroi();
    const total = nomes(doc).length;
    doc.run(new MoveFolder(0, 2, 0));
    expect(nomes(doc).length).toBe(total);
    doc.run(new MoveFolder(0, 2, 999));
    expect(nomes(doc).length).toBe(total);
    expect(nomes(doc).slice(-2)).toEqual(['cape_upper', 'cape_lower']);
  });

  it('pôr numa pasta avisa quantas peças mudam de lugar, ANTES', () => {
    const doc = heroi();
    // Duas já vizinhas: nada muda de lugar, e a janela diz isso.
    expect(movedCount(doc.file, ['hair', 'arm_back'])).toBe(0);
    // Duas longe uma da outra: uma é puxada para junto da outra.
    expect(movedCount(doc.file, ['hair', 'body'])).toBe(1);
  });

  it('pôr numa pasta grava a pasta e deixa as peças vizinhas', () => {
    const doc = heroi();
    const antes = texto(doc);
    doc.run(new PutInFolder(['hair', 'body'], 'cabeça'));

    const lista = nomes(doc);
    const a = lista.indexOf('hair');
    const b = lista.indexOf('body');
    expect(b - a).toBe(1);
    const slots = doc.file.slots ?? [];
    expect(slots[a]?.folder).toBe('cabeça');
    expect(slots[b]?.folder).toBe('cabeça');
    expect(doc.undoLabel).toBe('Pôr numa pasta');

    doc.undo();
    expect(texto(doc)).toBe(antes);
  });

  it('tirar da pasta apaga o campo e NÃO mexe na ordem', () => {
    const doc = heroi();
    const antes = nomes(doc);
    doc.run(new TakeOutOfFolder(['cape_upper']));
    expect(nomes(doc)).toEqual(antes);
    const slot = (doc.file.slots ?? []).find((s) => s.name === 'cape_upper');
    expect(slot).toBeDefined();
    expect('folder' in (slot as object)).toBe(false);
  });

  it('renomear a pasta troca o nome em todas as peças dela', () => {
    const doc = heroi();
    const antes = texto(doc);
    doc.run(new RenameFolder('capa', 'manto'));
    expect(folderMembers(doc.file, 'manto').sort()).toEqual(['cape_lower', 'cape_upper']);
    expect(folderMembers(doc.file, 'capa')).toEqual([]);
    // `cape_path` está na pasta `capa` e não entra na lista, mas o nome dele
    // também tem que mudar: senão sobraria uma pasta fantasma no arquivo.
    const path = (doc.file.slots ?? []).find((s) => s.name === 'cape_path');
    expect(path?.folder).toBe('manto');

    doc.undo();
    expect(texto(doc)).toBe(antes);
  });

  /*
   * Renomear para o nome de OUTRA pasta funde as duas (28/09/2026).
   *
   * Achado na auditoria de 27/09: o comando trocava o nome e pronto. Duas
   * pastas viravam uma, a janela não dizia nada antes e o rodapé dizia
   * "Pasta perna agora é atras" depois — verdade, e calando a metade que
   * importa. A forma: *avisei do que fiz e não do que isso causou*.
   */
  it('nome livre: não há fusão, e a janela não inventa aviso', () => {
    const doc = heroi();
    expect(mergeOnRename(doc.file, 'capa', 'manto')).toBeNull();
    expect(mergeWarning(doc.file, 'capa', 'manto')).toBe('');
    expect(renameNotice('capa', 'manto', null)).toBe('Pasta capa agora é manto');
    // O mesmo nome, e o nome vazio, também não são fusão.
    expect(mergeOnRename(doc.file, 'capa', 'capa')).toBeNull();
    expect(mergeOnRename(doc.file, 'capa', '')).toBeNull();
  });

  it('nome de outra pasta: a janela diz ANTES quantas peças cada uma tem', () => {
    const doc = heroi();
    const fusao = mergeOnRename(doc.file, 'perna', 'atras');
    // `atras` tem seis peças e `perna` tem três — contadas no arquivo.
    expect(fusao).toEqual({ from: 'perna', to: 'atras', moving: 3, already: 6, parts: 2 });
    const aviso = mergeWarning(doc.file, 'perna', 'atras');
    expect(aviso).toContain('Já existe a pasta atras');
    expect(aviso).toContain('6 peças');
    expect(aviso).toContain('3 peças');
    // As duas moram longe uma da outra: a pasta vai aparecer em pedaços.
    expect(aviso).toContain('2 pedaços');
    expect(renameNotice('perna', 'atras', fusao))
      .toBe('Pasta perna entrou em atras: agora são 9 peças, em 2 pedaços');
  });

  it('a conta dos pedaços é a MESMA que a aba mostra depois de renomear', () => {
    const doc = heroi();
    const fusao = mergeOnRename(doc.file, 'perna', 'atras')!;
    doc.run(new RenameFolder('perna', 'atras'));
    const pedacos = orderEntries(doc.file)
      .filter((e) => e.kind === 'pasta' && e.folder === 'atras');
    expect(pedacos.length).toBe(fusao.parts);
    expect((doc.file.slots ?? []).filter((s) => s.folder === 'atras').length)
      .toBe(fusao.moving + fusao.already);
  });

  it('pastas vizinhas viram UMA, e o aviso não fala em pedaços', () => {
    const doc = heroi();
    // `hair` vai para uma pasta só dele, encostada na `capa`.
    doc.run(new PutInFolder(['hair'], 'cabelo'));
    const fusao = mergeOnRename(doc.file, 'cabelo', 'capa')!;
    expect(fusao.parts).toBe(1);
    expect(mergeWarning(doc.file, 'cabelo', 'capa')).not.toContain('pedaços');
  });

  it('pasta com peça de fora no meio aparece quebrada, e diz em quantos pedaços', () => {
    const doc = heroi();
    // Põe `hair` (que não é da capa) entre as duas peças da capa.
    const lista = nomes(doc);
    doc.run(new MoveSlot(lista.indexOf('hair'), lista.indexOf('cape_lower')));

    const pedacos = orderEntries(doc.file)
      .filter((e) => e.kind === 'pasta' && e.folder === 'capa');
    expect(pedacos.length).toBe(2);
    for (const pedaco of pedacos) {
      if (pedaco.kind !== 'pasta') continue;
      expect(pedaco.parts).toBe(2);
    }

    // E "Juntar" arruma: uma pasta só de novo.
    doc.run(new PutInFolder(folderMembers(doc.file, 'capa'), 'capa'));
    const juntas = orderEntries(doc.file)
      .filter((e) => e.kind === 'pasta' && e.folder === 'capa');
    expect(juntas.length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Anotação 5 — a Prévia volta para a coluna da direita
// ---------------------------------------------------------------------------

describe('anotação 5 — a Prévia sai da faixa de baixo', () => {
  it('a faixa fica só com a Linha do tempo e as Curvas', () => {
    expect(DOCK_PANELS).toEqual(['linha-do-tempo', 'curvas']);
  });

  it('ela nasce na coluna da direita, ao lado de Imagens e Exibição', () => {
    // A **Entidades** entrou entre Imagens e Exibição no degrau 5 (E15) e o
    // **Pivôs** logo depois dela no degrau 8 (C4): o grupo cresceu duas vezes,
    // e o que este teste prova continua sendo o mesmo — a Prévia está aqui, e
    // não na faixa de baixo.
    // E a **Partículas** depois do Pivôs, na rodada 15 (04/10/2026).
    expect(RIGHT_GROUPS[0]).toEqual(['imagens', 'entidades', 'pivos', 'malha', 'particulas', 'exibicao', 'previa']);
    const known = [
      'arvore', 'ordem', 'propriedades', 'animacoes', 'exibicao', 'malha',
      'historico', 'imagens', 'previa',
    ];
    expect(sideOf(defaultLayout(known), 'previa')).toBe('right');
  });

  it('arquivo gravado com a Prévia na faixa não perde a Prévia', () => {
    const known = [
      'arvore', 'ordem', 'propriedades', 'animacoes', 'exibicao', 'malha',
      'historico', 'imagens', 'previa',
    ];
    // Uma bancada do lote 24: a `previa` não está em nenhuma das colunas,
    // porque ela morava na faixa de baixo.
    const gravado = {
      left: { groups: [['arvore', 'ordem'], ['propriedades']], active: ['arvore', 'propriedades'], split: 0.5 },
      right: { groups: [['imagens', 'exibicao'], ['animacoes', 'historico', 'malha']], active: ['imagens', 'animacoes'], split: 0.5 },
      widths: [260, 260],
      hidden: false,
    };
    const layout = parseLayout(gravado, known);
    expect(allTabs(layout)).toContain('previa');
    expect(sideOf(layout, 'previa')).toBe('right');
  });
});

// ---------------------------------------------------------------------------
// Anotação 14 — o tocador repete sempre
// ---------------------------------------------------------------------------

describe('anotação 14 — o tocador do editor repete, sempre', () => {
  it('o modo de fim de fábrica é Repetir', () => {
    expect(DEFAULT_END_MODE).toBe('repetir');
    expect(createTransport(fakeClock()).endMode()).toBe('repetir');
  });

  it('animação sem laço continua tocando, e dá a volta', () => {
    const doc = heroi();
    doc.animation = 'attack';
    doc.time = 0;
    expect(doc.file.animations?.find((a) => a.name === 'attack')?.loop).not.toBe(true);

    const clock = fakeClock();
    const player = createTransport(clock);
    player.play(doc);
    // `attack` dura 0,6 s. Dois segundos passam do fim três vezes.
    clock.fire(2000);
    expect(player.isPlaying()).toBe(true);
    expect(doc.time).toBeLessThan(0.6);
    expect(clock.pending()).toBeGreaterThan(0);
  });

  it('"Como o arquivo diz" continua existindo, e aí ela para no fim', () => {
    const doc = heroi();
    doc.animation = 'attack';
    doc.time = 0;
    const clock = fakeClock();
    const player = createTransport(clock);
    player.setEndMode('arquivo');
    player.play(doc);
    clock.fire(2000);
    expect(player.isPlaying()).toBe(false);
    expect(doc.time).toBeCloseTo(0.6, 6);
  });

  it('o `loop` do arquivo não mudou: ele é o que o JOGO faz', () => {
    const doc = heroi();
    const antes = texto(doc);
    const clock = fakeClock();
    const player = createTransport(clock);
    doc.animation = 'attack';
    player.play(doc);
    clock.fire(2000);
    player.pause();
    doc.time = 0;
    expect(texto(doc)).toBe(antes);

    // E mexer no `loop` continua sendo um comando do arquivo, com desfazer.
    doc.run(new SetAnimationLoop('attack', true));
    expect(doc.file.animations?.find((a) => a.name === 'attack')?.loop).toBe(true);
    doc.undo();
    expect(texto(doc)).toBe(antes);
  });
});
});

// ---------------------------------------------------------------------------
// botoes da ordem (lote 35) — era `lote35-botoes-da-ordem.test.ts`
// ---------------------------------------------------------------------------

describe('botoes da ordem (lote 35)', () => {
/**
 * Lote 35 — anotação 25: a aba Ordem ganha botões.
 *
 * Ela tinha **zero botões**: mudar a ordem de desenho era arrastar a linha, ou
 * uma tecla escrita só na dica dela. Foi a linha 4 da lista "O básico que
 * falta", levantada percorrendo o capítulo 00 no editor rodando.
 *
 * Sem DOM: a lista dos seis botões é escrita (`ORDER_BUTTONS`), e o que eles
 * fazem são os comandos do modelo, que já eram puros.
 */
const HEROI = resolve(__dirname, '..', '..', 'formato', 'exemplos', 'heroi.bone');

function heroi(): BoneFile {
  return JSON.parse(readFileSync(HEROI, 'utf8')) as BoneFile;
}

class TestDoc implements EditorDoc {
  file: BoneFile;
  path: string | null = null;
  dirty = false;
  atlases: readonly AtlasData[] = [];
  selection: Selection = emptySelection();
  time = 0;
  animation: string | null = null;
  warnings: readonly string[] = [];
  visibleSkins: string[] = [];
  notices: string[] = [];

  private skeletonData: SkeletonData | null = null;
  private instance: Skeleton | null = null;
  private done: Command[] = [];

  constructor(file: BoneFile) {
    this.file = file;
    this.rebuild();
  }

  get data(): SkeletonData | null { return this.skeletonData; }
  get skeleton(): Skeleton | null { return this.instance; }
  imageFor(_page: AtlasPageData): CanvasImageSource | null { return null; }
  select(selection: Selection): void { this.selection = selection; }
  notice(text: string): void { this.notices.push(text); }

  run(command: Command): void {
    command.apply(this);
    this.done.push(command);
    this.dirty = true;
    this.rebuild();
  }
  undo(): void {
    const command = this.done.pop();
    if (command === undefined) return;
    command.revert(this);
    this.rebuild();
  }
  redo(): void {}
  get canUndo(): boolean { return this.done.length > 0; }
  get canRedo(): boolean { return false; }
  get undoLabel(): string | null { return this.done[this.done.length - 1]?.label ?? null; }
  get redoLabel(): string | null { return null; }
  get undoCount(): number { return this.done.length; }

  rebuild(): void {
    this.skeletonData = loadSkeletonData(this.file);
    this.instance = new Skeleton(this.skeletonData);
    this.instance.updateWorldTransform(this.time);
  }
  rebuildAnimations(): void {
    const data = this.skeletonData;
    if (data === null) { this.rebuild(); return; }
    data.replaceAnimations(loadAnimationsFor(data, this.file).animations);
    this.repose();
  }
  repose(): void { this.instance?.updateWorldTransform(this.time); }
  on(): () => void { return () => {}; }
}

/** Os nomes dos slots, na ordem do array — que é a ordem de desenho. */
function ordem(doc: TestDoc): string[] {
  return (doc.file.slots ?? []).map((slot) => slot.name);
}

describe('os seis botões da aba Ordem', () => {
  it('são seis, cada um com ícone que existe, nome e dica', () => {
    expect(ORDER_BUTTONS.length).toBe(6);
    for (const botao of ORDER_BUTTONS) {
      expect(hasIcon(botao.icon), botao.icon).toBe(true);
      expect(botao.label.trim().length, botao.action).toBeGreaterThan(2);
      expect(botao.hint.trim().length, botao.action).toBeGreaterThan(10);
      expect(botao.action.trim(), botao.label).not.toBe('');
    }
  });

  it('nenhuma ação repetida, e as quatro primeiras movem', () => {
    const acoes = ORDER_BUTTONS.map((b) => b.action);
    expect(new Set(acoes).size).toBe(acoes.length);
    expect(acoes.slice(0, 4)).toEqual([
      'subir-ordem', 'descer-ordem', 'frente-de-tudo', 'fundo-de-tudo',
    ]);
    expect(acoes.slice(4)).toEqual(['nova-pasta', 'tirar-da-pasta']);
  });

  it('as quatro ações de mover têm tecla, e as duas de pasta não', () => {
    const porAcao = new Map(ORDER_BUTTONS.map((b) => [b.action, b]));
    expect(porAcao.get('subir-ordem')?.shortcut).toBe('Ctrl+↑');
    expect(porAcao.get('descer-ordem')?.shortcut).toBe('Ctrl+↓');
    // Lote 66: frente e fundo de tudo são Ctrl+→ e Ctrl+←, como no Spriter.
    // Ctrl+Shift+↑ e ↓ continuam no menu Esqueleto (o teste de baixo).
    expect(porAcao.get('frente-de-tudo')?.shortcut).toBe('Ctrl+→');
    expect(porAcao.get('fundo-de-tudo')?.shortcut).toBe('Ctrl+←');
    expect(porAcao.get('nova-pasta')?.shortcut).toBeUndefined();
    expect(porAcao.get('tirar-da-pasta')?.shortcut).toBeUndefined();
  });

  it('as seis ações estão no menu Base (era Esqueleto), com a mesma tecla', () => {
    const menus = allMenus({
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
    });
    // Rodada 6 (05/10/2026): o menu Esqueleto passou a se chamar Base.
    const base = menus.find((m) => m.label === 'Base');
    expect(base).toBeDefined();
    const itens = new Map(flatEntries(base!.entries).map((e) => [e.action, e]));
    for (const acao of ['frente-de-tudo', 'fundo-de-tudo', 'nova-pasta', 'tirar-da-pasta']) {
      expect(itens.has(acao), acao).toBe(true);
      expect(itens.get(acao)!.enabled, acao).toBe(true);
    }
    // As duas de mover já estavam lá desde o lote 16, com `+` e `−`.
    expect(itens.get('subir-ordem')?.shortcut).toBe('+');
    expect(itens.get('frente-de-tudo')?.shortcut).toBe('Ctrl+Shift+↑');
  });
});

describe('o que os botões fazem no herói', () => {
  it('"Frente de tudo" no cape_upper leva o PEDAÇO da pasta, não a pasta pelo nome', () => {
    const doc = new TestDoc(heroi());
    const antes = ordem(doc);
    const de = antes.indexOf('cape_upper');
    expect(de).toBe(0);
    // O bloco que se move é o PEDAÇO vizinho da pasta, e não tudo o que tem o
    // mesmo nome de pasta no arquivo: no herói, `cape_path` também é `capa` e
    // mora no fim do array — mas ele é um caminho, não entra na lista, e juntar
    // os dois pelo nome arrastaria o personagem inteiro no meio.
    const entrada = orderEntries(doc.file).find(
      (e) => e.kind === 'pasta' && de >= e.from && de <= e.to,
    );
    expect(entrada?.kind).toBe('pasta');
    const pedaco = entrada as { kind: 'pasta'; folder: string; from: number; to: number };
    expect(pedaco.folder).toBe('capa');
    const quantas = pedaco.to - pedaco.from + 1;
    expect(quantas).toBe(2);
    // A prova de que o pedaço não é a pasta inteira do arquivo:
    expect((doc.file.slots ?? []).filter((slot) => slot.folder === 'capa').length).toBe(3);

    doc.run(new MoveFolder(pedaco.from, quantas, (doc.file.slots ?? []).length - quantas));

    const nomes = ordem(doc);
    expect(nomes.slice(-quantas)).toEqual(['cape_upper', 'cape_lower']);
    expect(doc.undoCount).toBe(1);
    doc.undo();
    expect(ordem(doc)).toEqual(antes);
  });

  it('uma peça solta vai para o fim do array num passo de desfazer só', () => {
    const doc = new TestDoc(heroi());
    const slots = doc.file.slots ?? [];
    const solta = slots.findIndex((s) => s.folder === undefined);
    expect(solta).toBeGreaterThanOrEqual(0);
    const nome = slots[solta]!.name;

    doc.run(new MoveSlot(solta, slots.length - 1));

    expect(ordem(doc).at(-1)).toBe(nome);
    expect(doc.undoCount).toBe(1);
    doc.undo();
    expect(ordem(doc).at(-1)).not.toBe(nome);
  });

  it('"Fundo de tudo" põe a peça no começo do array', () => {
    const doc = new TestDoc(heroi());
    const slots = doc.file.slots ?? [];
    const de = slots.findIndex((s) => s.folder === undefined && s.name !== slots[0]!.name);
    const nome = slots[de]!.name;
    doc.run(new MoveSlot(de, 0));
    expect(ordem(doc)[0]).toBe(nome);
  });

  it('Nova pasta junta as escolhidas, e Tirar da pasta desfaz o agrupamento', () => {
    const doc = new TestDoc(heroi());
    const nomes = ['hand', 'weapon'];
    doc.run(new PutInFolder(nomes, 'mão armada'));
    const pecas = orderPieces(doc.file);
    for (const nome of nomes) {
      expect(pecas.find((p) => p.name === nome)?.folder, nome).toBe('mão armada');
    }
    // Elas ficam vizinhas: é o que a pasta promete.
    const posicoes = nomes.map((n) => ordem(doc).indexOf(n)).sort((a, b) => a - b);
    expect(posicoes[1]! - posicoes[0]!).toBe(1);

    doc.run(new TakeOutOfFolder(nomes));
    for (const nome of nomes) {
      expect(doc.file.slots?.find((s) => s.name === nome)?.folder, nome).toBeUndefined();
    }
  });
});
});

// ---------------------------------------------------------------------------
// entre linhas (lote 50) — era `lote50-entre-linhas.test.ts`
// ---------------------------------------------------------------------------

describe('entre linhas (lote 50)', () => {
/**
 * Lote 50 — arrastar para ENTRE duas linhas na aba Ordem.
 * Plano: `documentos/planos/PLANO rodada 5 - acabamento 2026-09-10.md`.
 *
 * Os três terços da linha, a conversão da tela de ponta-cabeça para o array,
 * o índice de destino (peça e pasta), e o "pronto quando" do plano: `hair`
 * entre `cape_upper` e `cape_lower` num arrasto, e o desfazer devolve numa vez.
 */
const EXEMPLOS = 'C:/Users/F-rak/Desktop/animador/formato/exemplos/';

function heroi(): BoneFile {
  return JSON.parse(readFileSync(`${EXEMPLOS}heroi.bone`, 'utf8')) as BoneFile;
}

const names = (file: BoneFile): string[] => (file.slots ?? []).map((s) => s.name);

describe('os três terços', () => {
  it('dropZone: (3, 30) antes; (15, 30) em cima; (27, 30) depois', () => {
    expect(dropZone(3, 30)).toBe('antes');
    expect(dropZone(15, 30)).toBe('em-cima');
    expect(dropZone(27, 30)).toBe('depois');
    expect(dropZone(5, 0)).toBe('em-cima');
  });

  it('a aba é de ponta-cabeça: acima na tela é depois no arquivo', () => {
    expect(arrayZone('antes')).toBe('depois');
    expect(arrayZone('depois')).toBe('antes');
    expect(arrayZone('em-cima')).toBe('em-cima');
  });
});

describe('insertIndex', () => {
  it('a tabela do plano', () => {
    expect(insertIndex(5, 2, 'antes', 10)).toBe(2);
    expect(insertIndex(5, 2, 'depois', 10)).toBe(3);
    expect(insertIndex(1, 4, 'antes', 10)).toBe(3);
    expect(insertIndex(1, 4, 'depois', 10)).toBe(4);
    expect(insertIndex(3, 3, 'antes', 10)).toBeNull();
    expect(insertIndex(3, 3, 'depois', 10)).toBeNull();
  });

  it('vizinho que já está no lugar: nada muda', () => {
    expect(insertIndex(2, 1, 'depois', 10)).toBeNull();
    expect(insertIndex(2, 3, 'antes', 10)).toBeNull();
  });

  it('pasta inteira: um bloco de 3 saindo do 1 para antes do 6 → to = 3', () => {
    expect(insertIndex(1, 6, 'antes', 10, 3)).toBe(3);
    // Soltar dentro do próprio bloco não faz nada.
    expect(insertIndex(1, 2, 'depois', 10, 3)).toBeNull();
  });
});

describe('pronto quando', () => {
  it('hair vai para entre cape_upper e cape_lower num arrasto; desfazer devolve numa vez', () => {
    const file = heroi();
    const doc = { file } as unknown as EditorDoc;
    const antes = JSON.stringify(file);
    const hair = names(file).indexOf('hair');
    const lower = names(file).indexOf('cape_lower');
    // Na tela, logo ABAIXO de cape_lower (terço de baixo): no arquivo, antes dela.
    const to = insertIndex(hair, lower, arrayZone('depois') as 'antes' | 'depois', names(file).length)!;
    const command = new MoveSlot(hair, to);
    command.apply(doc);
    const depois = names(file);
    expect(depois.indexOf('hair')).toBe(depois.indexOf('cape_upper') + 1);
    expect(depois.indexOf('cape_lower')).toBe(depois.indexOf('hair') + 1);
    command.revert(doc);
    expect(JSON.stringify(file)).toBe(antes);
  });

  it('a pasta vai inteira para o índice que a conta dá', () => {
    const file = { slots: ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((name) => ({ name, bone: 'root' })) } as unknown as BoneFile;
    const doc = { file } as unknown as EditorDoc;
    const to = insertIndex(1, 6, 'antes', 7, 3)!;
    new MoveFolder(1, 3, to).apply(doc);
    expect(names(file)).toEqual(['a', 'e', 'f', 'b', 'c', 'd', 'g']);
  });
});
});

// ---------------------------------------------------------------------------
// ordem spriter (lote 66) — era `lote66-ordem-spriter.test.ts`
// ---------------------------------------------------------------------------

describe('ordem spriter (lote 66)', () => {
/**
 * Lote 66 — a ordem de desenho como o Z-Order do Spriter.
 *
 * Sem DOM. O Humberto, 11/09/2026: *"ORDEM: olha o manual do Spriter."* Lá,
 * Ctrl + ↑ / ↓ sobe e desce uma casa e Ctrl + → / ← manda para a frente e para
 * o fundo, na cena; em Animando a ordem é por quadro-chave; e Edit → Copy
 * Z-order To All Keyframes deixa a animação inteira com a ordem de agora.
 */
const SRC = resolve(__dirname, '../src');
const HEROI = readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8');
const ler = (caminho: string): string => readFileSync(resolve(SRC, caminho), 'utf8').replace(/\r\n/g, '\n');

/** O herói aberto, com o `arm_back` escolhido e o rodapé anotado. */
function heroi(): { doc: Doc; ditos: string[] } {
  const doc = new Doc(JSON.parse(HEROI) as BoneFile);
  const ditos: string[] = [];
  const dizer = doc.notice.bind(doc);
  doc.notice = (texto: string): void => { ditos.push(texto); dizer(texto); };
  doc.select({ ...emptySelection(), slots: ['arm_back'] });
  return { doc, ditos };
}

/** A ordem que o RUNTIME monta em `time`, para conferir as contas do editor. */
function doRuntime(file: BoneFile, animation: string, time: number): string[] {
  const data = loadSkeletonData(file);
  const skeleton = new Skeleton(data);
  pose(skeleton, data.findAnimation(animation)!, time);
  return skeleton.drawOrder.map((slot) => slot.data.name);
}

function drawOrderKeys(file: BoneFile, animation: string): Array<{ time: number; value: unknown }> {
  const anim = file.animations!.find((a) => a.name === animation)!;
  const linha = (anim.timelines ?? []).find((t) => t.type === 'drawOrder') as unknown as
    { keys: Array<{ time: number; value: unknown }> } | undefined;
  return linha?.keys ?? [];
}


describe('stepOrder: os quatro passos (o último está na frente)', () => {
  const abcd = ['a', 'b', 'c', 'd'];

  it('uma casa e de tudo, para a frente e para o fundo', () => {
    expect(stepOrder(abcd, ['b'], 'frente-1').order).toEqual(['a', 'c', 'b', 'd']);
    expect(stepOrder(abcd, ['b'], 'fundo-1').order).toEqual(['b', 'a', 'c', 'd']);
    expect(stepOrder(abcd, ['b'], 'frente').order).toEqual(['a', 'c', 'd', 'b']);
    expect(stepOrder(abcd, ['b'], 'fundo').order).toEqual(['b', 'a', 'c', 'd']);
  });

  it('dois vizinhos andam juntos e mantêm a ordem entre si; já no topo, nada', () => {
    expect(stepOrder(abcd, ['b', 'c'], 'frente-1').order).toEqual(['a', 'd', 'b', 'c']);
    expect(stepOrder(abcd, ['b', 'c'], 'fundo-1').order).toEqual(['b', 'c', 'a', 'd']);
    expect(stepOrder(abcd, ['d'], 'frente-1')).toEqual({ order: abcd, moved: false });
    expect(stepOrder(abcd, ['c', 'd'], 'frente')).toEqual({ order: abcd, moved: false });
  });
});

describe('offsetsFor: a chave drawOrder, ida e volta pelo runtime', () => {
  it('base [a,b,c,d] → [a,c,b,d]: uma entrada só', () => {
    expect(offsetsFor(['a', 'b', 'c', 'd'], ['a', 'c', 'b', 'd'])).toEqual([{ slot: 'c', offset: -1 }]);
    expect(offsetsFor(['a', 'b', 'c'], ['a', 'b', 'c'])).toEqual([]);
  });

  it('qualquer ordem volta igual pelo algoritmo do runtime (§9.5)', () => {
    const base = ['a', 'b', 'c', 'd', 'e', 'f'];
    const casos = [
      ['f', 'e', 'd', 'c', 'b', 'a'], ['b', 'a', 'd', 'c', 'f', 'e'], ['c', 'a', 'b', 'f', 'd', 'e'],
      ['a', 'b', 'c', 'd', 'f', 'e'], ['e', 'b', 'c', 'd', 'a', 'f'],
    ];
    for (const wanted of casos) expect(orderWithOffsets(base, offsetsFor(base, wanted))).toEqual(wanted);
  });

  it('moveBlock faz a conta do MoveSlot e do MoveFolder', () => {
    expect(moveBlock(['a', 'b', 'c', 'd'], 0, 1, 2)).toEqual(['b', 'c', 'a', 'd']);
    expect(moveBlock(['a', 'b', 'c', 'd'], 1, 2, 0)).toEqual(['b', 'c', 'a', 'd']);
  });
});

describe('Ctrl + setas, pela mesma porta', () => {
  it('a tecla: ↑ ↓ uma casa, → ← de tudo; sem Ctrl ou num campo de texto, nada', () => {
    expect(orderKeyDir('ArrowUp', true, false, false)).toBe('frente-1');
    expect(orderKeyDir('ArrowDown', true, false, false)).toBe('fundo-1');
    expect(orderKeyDir('ArrowRight', true, false, false)).toBe('frente');
    expect(orderKeyDir('ArrowLeft', true, false, false)).toBe('fundo');
    expect(orderKeyDir('ArrowUp', true, true, false)).toBe('frente');
    expect(orderKeyDir('ArrowUp', false, false, false)).toBeNull();
    expect(orderKeyDir('ArrowUp', true, false, true)).toBeNull();
  });

  it('o desenho escolhido na cena conta: o slot dele entra', () => {
    const { doc } = heroi();
    expect(orderTargets(doc.file, { ...emptySelection(), attachments: [{ slot: 'head', attachment: 'face' }] }))
      .toEqual(['head']);
  });

  it('Montagem: Ctrl+↑ muda o array slots; nenhuma animação muda; um passo de desfazer', () => {
    const { doc } = heroi();
    const texto = JSON.stringify(doc.file);
    const animacoes = JSON.stringify(doc.file.animations);
    const antes = doc.file.slots!.map((s) => s.name);
    expect(runOrderStep(doc, 'frente-1')).toBe(true);
    expect(doc.file.slots!.map((s) => s.name)).toEqual(stepOrder(antes, ['arm_back'], 'frente-1').order);
    expect(JSON.stringify(doc.file.animations)).toBe(animacoes);
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(texto);
  });

  it('Animando, walk em 0,4, Gravar ligado: vira chave; slots não muda; o runtime concorda', () => {
    const { doc } = heroi();
    doc.animation = 'walk';
    doc.time = 0.4;
    const texto = JSON.stringify(doc.file);
    const slots = JSON.stringify(doc.file.slots);
    const em04 = drawOrderAt(doc.file, 'walk', 0.4);
    const em0 = drawOrderAt(doc.file, 'walk', 0);
    expect(runOrderStep(doc, 'frente-1')).toBe(true);
    expect(JSON.stringify(doc.file.slots)).toBe(slots);
    expect(drawOrderKeys(doc.file, 'walk').map((k) => k.time)).toContain(0.4);
    const esperada = stepOrder(em04, ['arm_back'], 'frente-1').order;
    expect(drawOrderAt(doc.file, 'walk', 0.4)).toEqual(esperada);
    expect(doRuntime(doc.file, 'walk', 0.4)).toEqual(esperada);
    // Em 0, a antiga.
    expect(drawOrderAt(doc.file, 'walk', 0)).toEqual(em0);
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(texto);
  });

  it('a primeira chave de ordem depois do 0 guarda o começo: idle ganha [] em 0', () => {
    const { doc } = heroi();
    doc.animation = 'idle';
    doc.time = 0.5;
    expect(drawOrderKeys(doc.file, 'idle')).toEqual([]);
    runOrderStep(doc, 'frente');
    const chaves = drawOrderKeys(doc.file, 'idle');
    expect(chaves.map((k) => k.time)).toEqual([0, 0.5]);
    expect(chaves[0]!.value).toEqual([]);
    expect(drawOrderAt(doc.file, 'idle', 0)).toEqual(baseOrder(doc.file));
    expect(doRuntime(doc.file, 'idle', 0.5)).toEqual(drawOrderAt(doc.file, 'idle', 0.5));
  });

  it('não há mais "Gravar desligado": só recusa onde não há onde gravar, e diz por quê', () => {
    // Degrau 4a (M6): a frase da gravação desligada saiu junto com ela.
    expect('BLOCKED_MESSAGE' in propertiesModel).toBe(false);
    const { doc, ditos } = heroi();
    // A animação aberta sumiu do arquivo: a regra 21 manda dizer, não palpitar.
    doc.animation = 'nao-existe';
    doc.time = 0.4;
    const texto = JSON.stringify(doc.file);
    expect(runOrderStep(doc, 'frente-1')).toBe(false);
    expect(ditos.at(-1)).toContain('não está no arquivo');
    expect(JSON.stringify(doc.file)).toBe(texto);
  });
});

describe('Editar → Copiar a ordem para toda a animação', () => {
  /*
   * Degrau 8, tarefa 8.2 (G3) — **chave a chave**, palavra do Humberto.
   *
   * Até aqui a cópia apagava a linha de ordem inteira e gravava UMA chave em 0.
   * O resultado na tela era o mesmo, e por isso o defeito passou despercebido:
   * os TEMPOS das chaves — que são trabalho de alguém — iam para o lixo, e não
   * havia de onde tirá-los de volta. Agora a ordem de agora é escrita em cada
   * chave que existe, e em 0.
   */
  it('a ordem de agora vai para CADA chave de ordem, e para a de 0; idle intocada; um passo', () => {
    const { doc } = heroi();
    doc.animation = 'walk';
    doc.time = 0.4;
    runOrderStep(doc, 'frente-1');
    // O `walk` do herói já tem chaves de ordem; o passo acrescentou a de 0,4.
    const antes = drawOrderKeys(doc.file, 'walk').map((k) => k.time);
    expect(antes.length).toBeGreaterThan(1);
    const agora = drawOrderAt(doc.file, 'walk', 0.4);
    const idle = JSON.stringify(doc.file.animations!.find((a) => a.name === 'idle'));
    const texto = JSON.stringify(doc.file);
    expect(runCopyOrderToAnimation(doc)).toBe(true);
    const chaves = drawOrderKeys(doc.file, 'walk');
    // **Nenhum tempo se perde**: era isto que a cópia velha jogava fora.
    expect(chaves.map((k) => k.time)).toEqual(antes);
    const esperado = offsetsFor(baseOrder(doc.file), agora);
    for (const chave of chaves) expect(chave.value).toEqual(esperado);
    for (const t of [0, 0.25, 0.4, 0.8]) expect(doRuntime(doc.file, 'walk', t)).toEqual(agora);
    expect(JSON.stringify(doc.file.animations!.find((a) => a.name === 'idle'))).toBe(idle);
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(texto);
  });

  it('sem chave de ordem nenhuma, nasce uma em 0 — e só ela', () => {
    const { doc } = heroi();
    doc.animation = 'idle';
    doc.time = 0.6;
    expect(drawOrderKeys(doc.file, 'idle')).toEqual([]);
    expect(runCopyOrderToAnimation(doc)).toBe(true);
    expect(drawOrderKeys(doc.file, 'idle').map((k) => k.time)).toEqual([0]);
  });

  it('a conta dos tempos é pura: cada chave que existe, mais o zero, em ordem', () => {
    const { doc } = heroi();
    doc.animation = 'idle';
    for (const t of [0.75, 0.25]) {
      doc.time = t;
      runOrderStep(doc, 'frente-1');
    }
    expect(copyOrderTimes(doc.file, 'idle')).toEqual([0, 0.25, 0.75]);
    // Uma animação sem linha de ordem tem só o zero para escrever.
    expect(copyOrderTimes(doc.file, 'run')).toEqual([0]);
  });

  it('o rodapé diz em quantas chaves gravou', () => {
    const { doc, ditos } = heroi();
    doc.animation = 'idle';
    doc.time = 0.4;
    runOrderStep(doc, 'frente-1');
    runCopyOrderToAnimation(doc);
    expect(ditos.at(-1)).toContain('2 chaves');
    expect(copyOrderNotice('walk', 1)).toContain('1 chave');
  });

  it('em Montagem não há o que copiar: diz, e nada muda', () => {
    const { doc, ditos } = heroi();
    const texto = JSON.stringify(doc.file);
    expect(runCopyOrderToAnimation(doc)).toBe(false);
    expect(ditos.at(-1)).toContain('Abra uma animação');
    expect(JSON.stringify(doc.file)).toBe(texto);
  });
});

describe('as portas', () => {
  it('a cena, a aba Ordem, o menu Editar e os botões com as teclas novas', () => {
    // Lote A1: a tecla da cena vem da tabela de `ui/keys.ts`.
    expect(ler('viewport/viewport.ts')).toContain("orderDirOfActions(actionsFor('cena', keyOf(e, true)))");
    // Lote A2: a ação mora com a ordem, registrada no arranque.
    expect(ler('panels/draw-order-actions.ts')).toContain("registerAction('copiar-ordem-animacao'");
    expect(ler('panels/draw-order.ts')).toContain('runOrderStep(doc, dir)');
    expect(ler('ui/menus.ts')).toContain("label: 'Copiar a ordem na animação', action: 'copiar-ordem-animacao'");
    const porAcao = new Map(ORDER_BUTTONS.map((b) => [b.action, b.shortcut]));
    expect([porAcao.get('subir-ordem'), porAcao.get('descer-ordem'), porAcao.get('frente-de-tudo'), porAcao.get('fundo-de-tudo')])
      .toEqual(['Ctrl+↑', 'Ctrl+↓', 'Ctrl+→', 'Ctrl+←']);
  });
});
});

// ---------------------------------------------------------------------------
// Degrau 4b (17/09/2026): a Ordem lê o corpo do instante (9.13, M12)
// ---------------------------------------------------------------------------

import { parseBoneText } from '../../runtime/src/index.js';
import { Projeto, emptyManifest, readProjectLists, writeProjectLists } from '../src/doc/projeto.js';
import { corpoDe } from '../src/contract.js';
import { createEmptyFile } from '../src/doc/new-file.js';
import { drawOrderNow, runOrderChange } from '../src/panels/draw-order-model.js';

describe('a Ordem é a do corpo do instante', () => {
  const C290 = resolve(__dirname, '../../conformidade/casos/C-290-virada-corte-seco');
  const lerCorpo = (nome: string): BoneFile => parseBoneText(readFileSync(resolve(C290, nome), 'utf8')) as BoneFile;

  function projeto(): Doc {
    const doc = new Doc(createEmptyFile());
    const projeto = new Projeto(doc);
    const homem = lerCorpo('entrada.bone');
    const lobo = lerCorpo('lobisomem.bone');
    // O lobisomem ganha uma segunda peça, para a ordem dele ser outra.
    lobo.slots = [...(lobo.slots ?? []), { name: 'rabo', bone: 'rabo', attachment: 'rabo' }];
    const pele = (lobo.skins ?? [])[0]! as { attachments?: Record<string, unknown> };
    (pele.attachments ??= {})['rabo'] = { rabo: { type: 'region', width: 10, height: 10, path: 'rabo' } };
    const manifest = writeProjectLists(emptyManifest('entrada.bone'), {
      corpos: ['entrada.bone', 'lobisomem.bone'], entidades: [], emFoco: 'entrada.bone',
    });
    projeto.open(manifest, readProjectLists(manifest), new Map([
      ['entrada.bone', { file: homem, options: {} }],
      ['lobisomem.bone', { file: lobo, options: {} }],
    ]));
    doc.animation = 'transformar';
    return doc;
  }

  it('em 0,25 a lista é a do homem; em 0,75, a do lobisomem, com o rabo', () => {
    const doc = projeto();
    doc.time = 0.25;
    expect(drawOrderNow(doc)).toEqual(['corpo']);
    expect(orderEntries(corpoDe(doc).file, drawOrderNow(doc)).map((e) => (e.kind === 'peca' ? e.piece.name : e.folder))).toEqual(['corpo']);
    doc.time = 0.75;
    expect(drawOrderNow(doc)).toEqual(['corpo', 'rabo']);
    // A lista da aba é de ponta-cabeça: o de cima está na frente (anotação 8).
    expect(orderEntries(corpoDe(doc).file, drawOrderNow(doc)).map((e) => (e.kind === 'peca' ? e.piece.name : e.folder))).toEqual(['rabo', 'corpo']);
    // Com a base aberta, o array do arquivo (`undefined` = vale a lista dele).
    doc.animation = null;
    expect(drawOrderNow(doc)).toBeUndefined();
  });

  it('mudar a ordem em 0,75 grava a chave na animação do homem, medida da base do lobisomem', () => {
    const doc = projeto();
    doc.time = 0.75;
    const antesLobo = JSON.stringify(corpoDe(doc).file);
    expect(runOrderChange(doc, ['rabo', 'corpo'], 'Mudar a ordem de desenho')).toBe('chave');
    // A chave está no homem, que é dono da animação; o lobisomem não mudou.
    const transformar = (doc.file.animations ?? []).find((a) => a.name === 'transformar')!;
    expect((transformar.timelines ?? []).some((line) => (line as { type: string }).type === 'drawOrder')).toBe(true);
    expect(JSON.stringify(corpoDe(doc).file)).toBe(antesLobo);
    // E a ordem posada de agora já é a nova.
    expect(drawOrderNow(doc)).toEqual(['rabo', 'corpo']);
    doc.undo();
    expect(drawOrderNow(doc)).toEqual(['corpo', 'rabo']);
  });

  it('drawOrderAt aceita o arquivo das chaves à parte, e sem ele lê o mesmo arquivo', () => {
    const homem = lerCorpo('entrada.bone');
    expect(drawOrderAt(homem, 'transformar', 0.75)).toEqual(['corpo']);
    expect(drawOrderAt(homem, 'transformar', 0.75, [], homem)).toEqual(['corpo']);
  });
});

// ---------------------------------------------------------------------------
// A ordem base segue a PILHA, e a `default` que saiu não manda (degrau 9, I10)
// ---------------------------------------------------------------------------

import { baseOrder as baseOrderP, drawOrderAt as drawOrderAtP, orderSkins as pelesDaOrdem } from '../src/panels/draw-order-model.js';
import { Doc as DocP } from '../src/doc/document.js';
import type { BoneFile as BoneFileP } from '../../runtime/src/index.js';

describe('a ordem base é a da pilha (degrau 9, I10)', () => {
/**
 * Achado pelo D9 no fecho do degrau 9, e consertado aqui porque a conta é da
 * aba Ordem.
 *
 * Até aqui `baseOrder` punha a `default` na frente da lista **sempre**, e
 * tirava-a das peles recebidas. Era a leitura certa enquanto a `default`
 * estava obrigada a ficar por baixo de tudo. Com a pilha (spec §4.4) ela é uma
 * pele como as outras e **pode sair** — e a conta velha continuava aplicando o
 * `drawOrder` de uma pele desligada: a aba Ordem mostrava uma ordem que a cena
 * não desenhava.
 *
 * O que uma tela mostra e o desenho não faz é o defeito da regra 21 outra vez,
 * e por isso o teste que faltava está aqui: uma `default` com `drawOrder`,
 * FORA da pilha, não mexe na ordem.
 */

/** Três slots, e uma `default` que joga o `c` para trás de tudo. */
function comDefault(): BoneFileP {
  return {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [{ name: 'root' }],
    slots: ['a', 'b', 'c'].map((name) => ({ name, bone: 'root', attachment: name })),
    skins: [
      {
        name: 'default',
        // `c` sai do fim e vai para o começo: a ordem vira c, a, b.
        drawOrder: [{ slot: 'c', offset: -2 }],
        attachments: Object.fromEntries(['a', 'b', 'c'].map((n) => [n, { [n]: { type: 'region' } }])),
      },
      {
        name: 'armadura',
        // `a` vai para o fim: a ordem vira b, c, a.
        drawOrder: [{ slot: 'a', offset: 2 }],
        attachments: { a: { a: { type: 'region' } } },
      },
    ],
  } as unknown as BoneFileP;
}

it('a `default` FORA da pilha não mexe na ordem — era o defeito', () => {
  const file = comDefault();
  // A pilha só com a armadura: a `default` está desligada, e o `drawOrder`
  // dela não vale. Antes, `c` vinha para a frente do mesmo jeito.
  expect(baseOrderP(file, ['armadura'])).toEqual(['b', 'c', 'a']);
  // E com a pilha vazia, a ordem é o array `slots`, limpa.
  expect(baseOrderP(file, [])).toEqual(['a', 'b', 'c']);
});

it('a `default` DENTRO da pilha manda, como qualquer outra', () => {
  const file = comDefault();
  expect(baseOrderP(file, ['default'])).toEqual(['c', 'a', 'b']);
});

it('a de cima vence: a pilha é aplicada de baixo para cima', () => {
  const file = comDefault();
  // `default` embaixo, `armadura` em cima: primeiro c, a, b; depois o `a` vai
  // para o fim.
  expect(baseOrderP(file, ['default', 'armadura'])).toEqual(['c', 'b', 'a']);

  /*
   * E a ORDEM da pilha muda o resultado quando duas peles mexem na mesma
   * peça, porque cada `offset` é medido na ordem que já veio de baixo. Aqui a
   * `capa` puxa o `a` uma casa para trás:
   *
   * - `default` e depois `capa`: c, a, b → a anda uma casa → c, b, a… não:
   *   a sai da casa 1 para a 0, e dá a, c, b;
   * - `capa` e depois `default`: o `a` já está na casa 0 e não tem para onde
   *   voltar, então só a `default` vale, e dá c, a, b.
   */
  const comCapa = comDefault();
  comCapa.skins![1] = { name: 'capa', drawOrder: [{ slot: 'a', offset: -1 }], attachments: {} } as never;
  expect(baseOrderP(comCapa, ['default', 'capa'])).toEqual(['a', 'c', 'b']);
  expect(baseOrderP(comCapa, ['capa', 'default'])).toEqual(['c', 'a', 'b']);
});

it('a ordem posada também segue a pilha, e não a `default` por fora', () => {
  const file = comDefault();
  file.animations = [{ name: 'andar', duration: 1, timelines: [] }] as never;
  expect(drawOrderAtP(file, 'andar', 0, ['armadura'])).toEqual(['b', 'c', 'a']);
  expect(drawOrderAtP(file, 'andar', 0, ['default'])).toEqual(['c', 'a', 'b']);
});

it('as peles que a Ordem enxerga são a PILHA, não a vista do lápis', () => {
  /*
   * `visibleSkins` é o lápis PRIMEIRO e as outras depois; a pilha é de baixo
   * para cima. Ler a vista daria a ordem ao contrário assim que alguém
   * estivesse editando uma pele que não é a de baixo.
   */
  const doc = new DocP(comDefault());
  (doc as unknown as { pilha: string[] }).pilha = ['default', 'armadura'];
  doc.visibleSkins = ['armadura', 'default'];
  expect(pelesDaOrdem(doc)).toEqual(['default', 'armadura']);
  // Sem pilha nenhuma (um documento de teste da vista velha), a conta de antes
  // continua valendo: a `default` embaixo.
  const velho = new DocP(comDefault());
  expect(pelesDaOrdem(velho)[0]).toBe('default');
});
});

// ---------------------------------------------------------------------------
// P12 — a chave que nasce se mostra (29/09/2026)
// ---------------------------------------------------------------------------

describe('a chave de ordem e a virada de corpo se mostram na linha do tempo (P12)', () => {
  it('trocar a ordem com uma animação aberta pede à linha do tempo para mostrar a chave', () => {
    const doc = new Doc(JSON.parse(readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8')) as BoneFile);
    doc.select({ ...emptySelection(), slots: ['arm_back'] });
    doc.animation = 'walk';
    doc.time = 0.4;
    const pedidos: KeyRef[] = [];
    const parar = onRevealKey((ref) => pedidos.push(ref));
    // Sem ouvinte, o `revealKey` GUARDA o pedido e o entrega a quem ligar
    // depois: um teste anterior deste arquivo deixa um guardado. Fora ele.
    pedidos.length = 0;
    try {
      expect(runOrderStep(doc, 'frente-1')).toBe(true);
    } finally {
      parar();
    }
    expect(pedidos).toEqual([{ target: { type: 'drawOrder' }, time: 0.4 }]);
  });

  it('com a base aberta não há chave, e nada é pedido', () => {
    const doc = new Doc(JSON.parse(readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8')) as BoneFile);
    doc.select({ ...emptySelection(), slots: ['arm_back'] });
    const pedidos: KeyRef[] = [];
    const parar = onRevealKey((ref) => pedidos.push(ref));
    // Sem ouvinte, o `revealKey` GUARDA o pedido e o entrega a quem ligar
    // depois: um teste anterior deste arquivo deixa um guardado. Fora ele.
    pedidos.length = 0;
    try {
      expect(runOrderStep(doc, 'frente-1')).toBe(true);
    } finally {
      parar();
    }
    expect(pedidos).toEqual([]);
  });

  it('"Colar corpo aqui" pede para mostrar a chave da virada, no tempo em que colou', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/ui/shell-actions.ts'), 'utf8');
    expect(fonte).toContain('if (frase !== null) revealKey({ target: bodyTarget(), time: quando });');
    expect(fonte.indexOf('const quando = roundTime(doc.time);'))
      .toBeLessThan(fonte.indexOf('const frase = pasteBodyHere('));
  });
});


// ---------------------------------------------------------------------------
// Rodada 8c, o salto da espada: a miniatura não mexe no esqueleto vivo
// ---------------------------------------------------------------------------

describe('a miniatura da entidade não põe a espada viva em repouso (rodada 8c, o salto)', () => {
  const EX = 'C:/Users/F-rak/Desktop/animador/formato/exemplos/';
  const lerTexto = (nome: string): string => readFileSyncSalto(EX + nome, 'utf8');

  it('desenhar a miniatura do slot weapon deixa a lâmina da espada onde a animação a pôs', () => {
    const espada = loadSkeletonDataSalto(JSON.parse(lerTexto('espada.bone')));
    const doc = new DocSalto(JSON.parse(lerTexto('heroi.bone')), {
      path: 'heroi.bone', skeletons: new Map([['espada.bone', espada]]),
    });
    doc.animation = 'idle';
    doc.time = 0.5;
    doc.repose();
    const lamina = (): number => doc.skeleton!.findSlot('weapon')!.nestedSkeleton()!.skeleton.findBone('lamina')!.rotation;
    const antes = lamina();
    expect(antes).not.toBe(0);
    // Um navegador de mentira: o bastante para a miniatura chegar a desenhar.
    const ctx = new Proxy({} as Record<string | symbol, unknown>, {
      get: (alvo, chave) => (chave in alvo ? alvo[chave] : () => undefined),
      set: (alvo, chave, valor) => { alvo[chave] = valor; return true; },
    });
    const g = globalThis as { document?: unknown };
    const tinha = g.document;
    g.document = { createElement: () => ({ width: 0, height: 0, getContext: () => ctx, toDataURL: () => 'data:,' }) };
    try {
      skeletonThumbnailSalto(doc, 'weapon');
    } finally {
      g.document = tinha;
    }
    expect(lamina()).toBe(antes);
  });
});

// ---------------------------------------------------------------------------
// Rodada 43, lote 4 — a Ordem diz onde a peça ficou, e pula a pasta (doc `51`)
// ---------------------------------------------------------------------------

import * as DO43 from '../src/panels/draw-order-model.js';

const heroi43 = (): BoneFile => JSON.parse(readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8')) as BoneFile;

describe('rodada 43, lote 4: a Ordem diz onde, e pula a pasta', () => {
  it('a Ordem diz onde a peça ficou: posição, de quantas, entre quem', () => {
    const ordem = ['a', 'b', 'c', 'd']; // o último está na frente
    const vis = new Set(ordem);
    expect(DO43.orderPlaceSays(ordem, vis, 'c')).toBe('c: 2ª de 4, entre d e b');
    expect(DO43.orderPlaceSays(ordem, vis, 'd')).toBe('d: 1ª de 4, na frente de tudo');
    expect(DO43.orderPlaceSays(ordem, vis, 'a')).toBe('a: 4ª de 4, atrás de tudo');
  });
  it('a peça solta pula a pasta inteira com Ctrl+↑/↓, sem parti-la', () => {
    const f = heroi43();
    // forearm (solta) e logo atrás dela vem a pasta perna (foot_front, shin_front, leg_front)
    const ordem = (f.slots ?? []).map((s) => s.name);
    const vis = new Set(DO43.orderPieces(f).map((p) => p.name));
    const pasta = (n: string) => (f.slots ?? []).find((s) => s.name === n)?.folder ?? null;
    let atual = ordem;
    for (let k = 0; k < 3; k++) {
      const passo = DO43.stepOrderOverFolders(f, atual, ['forearm'], 'fundo-1', vis);
      expect(passo.moved).toBe(true);
      atual = passo.order;
      const visto = atual.filter((n: string) => vis.has(n));
      const i = visto.indexOf('forearm');
      const antes = visto[i - 1]; const depois = visto[i + 1];
      // os vizinhos dela nunca são da MESMA pasta: ela não ficou no meio de uma
      expect(pasta(antes) !== null && pasta(antes) === pasta(depois), `passo ${k + 1}`).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// Rodada 43, lote 5 — cabe (doc `51`)
// ---------------------------------------------------------------------------

describe('rodada 43, lote 5: a Ordem mostra mais peças sem perder a miniatura', () => {
  const css = readFileSync(resolve(__dirname, '../src/panels/draw-order.css'), 'utf8');
  const bloco = (sel: string): string => {
    const i = css.indexOf(`${sel} {`);
    return i < 0 ? '' : css.slice(i, css.indexOf('}', i));
  };
  it('o nome e a imagem numa linha só (eram duas, ~52px por peça)', () => {
    expect(bloco('.ordem-nomes')).toContain('flex-direction: row');
  });
  it('a miniatura continua de 40px: é ela que distingue a bota esquerda da direita', () => {
    expect(bloco('.ordem-mini')).toContain('width: 40px');
  });
  it('a linha aperta o respiro de cima e de baixo', () => {
    expect(bloco('.ordem-linha')).toContain('padding: 2px 10px');
  });
});

// Rodada 47, lote 6 (doc 69): arrastar uma peça não parte pasta nenhuma
describe('rodada 47, lote 6: a peça arrastada entra na pasta onde cai, ou sai da sua', () => {
  const s = (name: string, folder?: string) => (folder === undefined ? { name, bone: 'root' } : { name, bone: 'root', folder });

  it('solta entre duas da mesma pasta: entra nela (a pasta não se parte)', async () => {
    const { folderAfterMove } = await import('../src/panels/draw-order-model.js');
    const slots = [s('a'), s('b1', 'braco'), s('b2', 'braco'), s('c', 'cabeca')] as never;
    expect(folderAfterMove(slots, 3, 2)).toBe('braco');
  });

  it('solta fora de pasta: sai da sua; solta colada à própria pasta: fica nela', async () => {
    const { folderAfterMove } = await import('../src/panels/draw-order-model.js');
    const slots = [s('a'), s('x'), s('b1', 'braco'), s('b2', 'braco')] as never;
    expect(folderAfterMove(slots, 3, 1)).toBeUndefined();
    expect(folderAfterMove(slots, 3, 2)).toBe('braco');
  });

  it('o comando move e acerta a pasta num passo só, e desfaz voltando tudo', async () => {
    const { MoveSlotKeepingFolders } = await import('../src/panels/draw-order-model.js');
    const file = { skeleton: { name: 't' }, bones: [{ name: 'root' }], slots: [s('a'), s('b1', 'braco'), s('b2', 'braco'), s('c', 'cabeca')] };
    const doc = { file } as never;
    const antes = JSON.stringify(file.slots);
    const cmd = new MoveSlotKeepingFolders(3, 2);
    cmd.apply(doc);
    expect(file.slots.map((x: { name: string; folder?: string }) => `${x.name}:${x.folder ?? ''}`)).toEqual(['a:', 'b1:braco', 'c:braco', 'b2:braco']);
    cmd.revert(doc);
    expect(JSON.stringify(file.slots)).toBe(antes);
  });

  it('o rodapé diz quando a pasta mudou', async () => {
    const { folderMoveSays } = await import('../src/panels/draw-order-model.js');
    expect(folderMoveSays('c', 'cabeca', 'braco')).toBe('c saiu da pasta cabeca e entrou na pasta braco');
    expect(folderMoveSays('c', undefined, 'braco')).toBe('c entrou na pasta braco');
    expect(folderMoveSays('c', 'braco', undefined)).toBe('c saiu da pasta braco');
    expect(folderMoveSays('c', 'braco', 'braco')).toBe('');
  });
});

// Rodada 47, lote 6c (nota 1 do doc 90), e rodada 48 (o Diretor, 07/10): a
// v35.8 pôs três linhas em 720 encolhendo a linha para 22 px — alvo apertado.
// Reescrito de propósito na rodada 48: a linha volta a ter 29 px (≥ 28 de alvo
// de clique), e os px saem da barra (botões de 28, a medida mínima de alvo) e
// da ponta "frente", que em tela baixa mora na barra e não na lista.
describe('rodada 48: a Ordem em 1280×720, três linhas de alvo inteiro', () => {
  const css = readFileSync(resolve(__dirname, '../src/panels/draw-order.css'), 'utf8');
  const tela = css.slice(css.indexOf('@media (max-height: 800px)'));
  const px = (re: RegExp): number => Number(re.exec(tela)?.[1]);
  it('a linha tem pelo menos 28 px de altura clicável', () => {
    const mini = px(/\.ordem-mini \{[^}]*height: (\d+)px/);
    const respiro = px(/\.ordem-linha \{[^}]*padding: (\d+)px 10px/);
    expect(mini + 2 * respiro).toBeGreaterThanOrEqual(28);
  });
  it('a conta: a barra e três linhas cabem nos 122 px do corpo do conferente', () => {
    const botao = px(/\.ordem-barra \.painel-botao \{[^}]*min-height: (\d+)px/);
    const barraPad = px(/\.ordem-barra \{[^}]*padding: (\d+)px 6px/);
    const mini = px(/\.ordem-mini \{[^}]*height: (\d+)px/);
    const respiro = px(/\.ordem-linha \{[^}]*padding: (\d+)px 10px/);
    expect(botao).toBeGreaterThanOrEqual(28);
    const barra = botao + 2 * barraPad + 1; // + a borda de baixo
    const linha = mini + 2 * respiro + 1; // + a borda de baixo
    expect(barra + 3 * linha).toBeLessThanOrEqual(122);
  });
  it('a ponta "frente" sai da lista e vai para a barra, onde não come linha', () => {
    expect(tela).toMatch(/\.ordem-lista > \.ordem-ponta:first-child \{\s*display: none;/);
    expect(tela).toMatch(/\.ordem-barra::after \{[^}]*content: 'frente ↓'/);
  });
});

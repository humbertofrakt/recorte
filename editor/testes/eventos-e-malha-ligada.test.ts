/**
 * Duas coisas que o formato já tinha e o editor não deixava fazer.
 *
 *   1. QUAL EVENTO A CHAVE DISPARA (requisito A3, §9.7 e §8.6). Toda
 *      propriedade já podia ter chave, `event` inclusive — mas uma chave de
 *      evento não tem `value`: ela tem um NOME, dizendo qual evento de
 *      `file.events` dispara, e cinco campos que sobrescrevem a definição.
 *      Aqui se prova o nome, os cinco campos, o campo apagado voltando para a
 *      definição, duas chaves no mesmo instante (que só `event` permite) e o
 *      desfazer.
 *
 *   2. MALHA LIGADA (§7.5). O formato tem e o runtime lê; faltava o botão.
 *      Aqui se prova que o arquivo escrito NÃO COPIA geometria nenhuma, e que
 *      o runtime, ao carregar, aponta a malha ligada para os MESMOS arrays do
 *      pai — vértices, pesos, UVs, triângulos, contorno e arestas. A conta é
 *      de identidade (`toBe`), não de igualdade: dois arrays iguais que fossem
 *      cópias passariam num `toEqual` e quebrariam a promessa de 7.5.
 *
 * Sem DOM: o projeto não tem jsdom, então tudo o que decide alguma coisa mora
 * em `anim/event-keys.ts` e `mesh/linked-mesh.ts`, que são puros.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

import type {
  BoneFile, LinkedMeshAttachmentDef, MeshAttachmentDef,
} from '../../runtime/src/index.js';
import {
  LinkedMeshAttachment, MeshAttachment, loadAtlas, loadSkeletonData,
} from '../../runtime/src/index.js';
import { Doc } from '../src/doc/document.js';
import {
  EVENT_FIELDS, eventAudio, eventDefaults, eventDefinition, eventFieldViews, eventKeys,
  eventKeysAt, eventNames, eventTimelinePointer, hasEventKey, keyEvent, unkeyEvent,
} from '../src/anim/event-keys.js';
// Degrau 12, porta D5: o som do evento (§4.5, §2.8, §8.6).
import {
  animationSounds, audioBaseOf, eventDefProblems, eventFirings, resolvedEventAudio,
} from '../src/anim/event-keys.js';
import {
  createLinkedMesh, linkMesh, linkedMeshLine, linkedMeshName, linkedMeshParents,
  namesInSlot, whyNotLink,
} from '../src/mesh/linked-mesh.js';

const EXEMPLOS = 'C:/Users/F-rak/Desktop/animador/formato/exemplos/';
const CRU = readFileSync(`${EXEMPLOS}heroi.bone`, 'utf8');

/** Uma cópia nova do exemplo, para um caso nunca herdar o estado do outro. */
function heroi(): BoneFile {
  return JSON.parse(CRU) as BoneFile;
}

// ===========================================================================
// 1. Qual evento a chave dispara
// ===========================================================================

/** Um arquivo mínimo com dois eventos declarados e uma animação vazia. */
function comEventos(): BoneFile {
  return {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    skeleton: { name: 'teste', fps: 30 },
    bones: [{ name: 'root' }],
    events: [
      { name: 'passo', int: 1, string: 'esquerdo' },
      { name: 'som', audio: 'passo.ogg', volume: 0.8, balance: 0 },
    ],
    animations: [{ name: 'walk', duration: 1 }],
  } as unknown as BoneFile;
}

describe('a lista de eventos do arquivo', () => {
  it('traz os nomes na ordem em que foram escritos', () => {
    expect(eventNames(comEventos())).toEqual(['passo', 'som']);
  });

  it('o exemplo do herói tem os dois eventos que a spec anuncia', () => {
    expect(eventNames(heroi()).length).toBeGreaterThanOrEqual(2);
  });

  it('a definição responde pelo que a chave não escrever (8.6)', () => {
    const file = comEventos();
    expect(eventDefaults(file, 'passo')).toEqual({ int: 1, string: 'esquerdo' });
    expect(eventDefaults(file, 'som')).toEqual({ volume: 0.8, balance: 0 });
    expect(eventDefaults(file, 'não existe')).toEqual({});
  });

  it('o som vem sempre da definição, nunca da chave (8.6)', () => {
    const file = comEventos();
    expect(eventAudio(file, 'som')).toBe('passo.ogg');
    expect(eventAudio(file, 'passo')).toBeNull();
    expect(eventDefinition(file, 'som')?.audio).toBe('passo.ogg');
  });

  it('os cinco campos estão na ordem da tabela de 9.2, com rótulo por extenso', () => {
    expect(EVENT_FIELDS.map((f) => f.key)).toEqual(['int', 'float', 'string', 'volume', 'balance']);
    expect(EVENT_FIELDS.map((f) => f.label))
      .toEqual(['Inteiro', 'Decimal', 'Texto', 'Volume', 'Balanço']);
  });
});

describe('chavear um evento', () => {
  it('a chave grava QUAL evento dispara, e a timeline nasce do tipo event', () => {
    const doc = new Doc(comEventos());
    doc.run(keyEvent('walk', 0.4, 'passo'));
    expect(eventTimelinePointer(doc.file, 'walk')).toBe('/animations/0/timelines/0');
    const rows = eventKeys(doc.file, 'walk');
    expect(rows).toHaveLength(1);
    expect(rows[0]!.event).toBe('passo');
    expect(rows[0]!.time).toBe(0.4);
    // Uma chave de evento NÃO tem `value` (9.7).
    const timeline = doc.file.animations![0]!.timelines![0]!;
    expect(timeline.type).toBe('event');
    expect(timeline.keys[0]!.value).toBeUndefined();
  });

  it('os cinco valores entram na chave, cada um no seu campo', () => {
    const doc = new Doc(comEventos());
    doc.run(keyEvent('walk', 0.25, 'som', {
      int: 7, float: 1.5, string: 'chão', volume: 0.4, balance: -1,
    }));
    const key = doc.file.animations![0]!.timelines![0]!.keys[0]!;
    expect(key.event).toBe('som');
    expect(key.int).toBe(7);
    expect(key.float).toBe(1.5);
    expect(key.string).toBe('chão');
    expect(key.volume).toBe(0.4);
    expect(key.balance).toBe(-1);
  });

  it('o campo inteiro é arredondado; o decimal não', () => {
    const doc = new Doc(comEventos());
    doc.run(keyEvent('walk', 0, 'passo', { int: 3.7, float: 3.7 }));
    const key = doc.file.animations![0]!.timelines![0]!.keys[0]!;
    expect(key.int).toBe(4);
    expect(key.float).toBe(3.7);
  });

  it('dois eventos podem dividir o mesmo instante — só event permite (9.7)', () => {
    const doc = new Doc(comEventos());
    doc.run(keyEvent('walk', 0.5, 'passo'));
    doc.run(keyEvent('walk', 0.5, 'som'));
    const aqui = eventKeysAt(doc.file, 'walk', 0.5);
    expect(aqui.map((row) => row.event).sort()).toEqual(['passo', 'som']);
    expect(doc.file.animations![0]!.timelines![0]!.keys).toHaveLength(2);
  });

  it('chavear o MESMO evento duas vezes no mesmo instante atualiza, não duplica', () => {
    const doc = new Doc(comEventos());
    doc.run(keyEvent('walk', 0.5, 'passo', { int: 1 }));
    doc.run(keyEvent('walk', 0.5, 'passo', { int: 2 }));
    expect(eventKeysAt(doc.file, 'walk', 0.5)).toHaveLength(1);
    expect(doc.file.animations![0]!.timelines![0]!.keys[0]!.int).toBe(2);
  });

  it('mudar um campo não apaga os outros da mesma chave', () => {
    const doc = new Doc(comEventos());
    doc.run(keyEvent('walk', 0.2, 'som', { volume: 0.5, string: 'areia' }));
    doc.run(keyEvent('walk', 0.2, 'som', { volume: 0.9 }));
    const key = doc.file.animations![0]!.timelines![0]!.keys[0]!;
    expect(key.volume).toBe(0.9);
    expect(key.string).toBe('areia');
  });

  it('apagar um campo tira ele da chave, e a definição volta a responder', () => {
    const doc = new Doc(comEventos());
    doc.run(keyEvent('walk', 0.2, 'som', { volume: 0.5 }));
    expect(doc.file.animations![0]!.timelines![0]!.keys[0]!.volume).toBe(0.5);
    doc.run(keyEvent('walk', 0.2, 'som', { volume: null }));
    const key = doc.file.animations![0]!.timelines![0]!.keys[0]!;
    expect('volume' in key).toBe(false);
    // Sem o campo, quem responde é a definição: 0,8.
    const view = eventFieldViews(eventKeysAt(doc.file, 'walk', 0.2)[0]!)
      .find((v) => v.field.key === 'volume')!;
    expect(view.value).toBe(0.8);
    expect(view.origem).toBe('definição');
  });

  it('cada campo diz de onde veio: da chave, da definição, ou de lugar nenhum', () => {
    const doc = new Doc(comEventos());
    doc.run(keyEvent('walk', 0, 'passo', { float: 2.5 }));
    const views = eventFieldViews(eventKeysAt(doc.file, 'walk', 0)[0]!);
    const por = (key: string) => views.find((v) => v.field.key === key)!;
    expect(por('float')).toMatchObject({ value: 2.5, origem: 'chave' });
    expect(por('int')).toMatchObject({ value: 1, origem: 'definição' });
    expect(por('string')).toMatchObject({ value: 'esquerdo', origem: 'definição' });
    expect(por('volume')).toMatchObject({ value: undefined, origem: 'vazio' });
  });

  it('apagar a chave apaga a do evento certo, e só ela', () => {
    const doc = new Doc(comEventos());
    doc.run(keyEvent('walk', 0.5, 'passo'));
    doc.run(keyEvent('walk', 0.5, 'som'));
    doc.run(unkeyEvent('walk', 0.5, 'passo'));
    expect(eventKeysAt(doc.file, 'walk', 0.5).map((r) => r.event)).toEqual(['som']);
  });

  it('hasEventKey só responde sim para o evento que está mesmo ali', () => {
    const doc = new Doc(comEventos());
    doc.run(keyEvent('walk', 0.5, 'passo'));
    expect(hasEventKey(doc.file, 'walk', 0.5, 'passo')).toBe(true);
    expect(hasEventKey(doc.file, 'walk', 0.5, 'som')).toBe(false);
    expect(hasEventKey(doc.file, 'walk', 0.6, 'passo')).toBe(false);
  });

  it('desfazer devolve o arquivo exatamente como estava, sem timeline vazia', () => {
    const antes = JSON.stringify(comEventos());
    const doc = new Doc(comEventos());
    doc.run(keyEvent('walk', 0.4, 'passo', { int: 9, string: 'x' }));
    expect(JSON.stringify(doc.file)).not.toBe(antes);
    doc.undo();
    expect(doc.file.animations![0]!.timelines).toBeUndefined();
  });

  it('desfazer o campo apagado traz o campo de volta', () => {
    const doc = new Doc(comEventos());
    doc.run(keyEvent('walk', 0.2, 'som', { volume: 0.5 }));
    doc.run(keyEvent('walk', 0.2, 'som', { volume: null }));
    doc.undo();
    expect(doc.file.animations![0]!.timelines![0]!.keys[0]!.volume).toBe(0.5);
  });

  it('uma chave que aponta para um evento apagado é marcada, não escondida', () => {
    const doc = new Doc(comEventos());
    doc.run(keyEvent('walk', 0.3, 'passo'));
    doc.file.events = doc.file.events!.filter((e) => e.name !== 'passo');
    const row = eventKeys(doc.file, 'walk')[0]!;
    expect(row.unknownEvent).toBe(true);
  });

  it('as chaves saem em ordem de tempo, mesmo escritas fora de ordem', () => {
    const doc = new Doc(comEventos());
    doc.run(keyEvent('walk', 0.8, 'som'));
    doc.run(keyEvent('walk', 0.1, 'passo'));
    expect(eventKeys(doc.file, 'walk').map((r) => r.time)).toEqual([0.1, 0.8]);
  });
});

// ===========================================================================
// 2. Malha ligada
// ===========================================================================

/** Uma malha quadrada com pesos, para o pai ter `binding` e não `vertices`. */
function malhaComPesos(): MeshAttachmentDef {
  return {
    type: 'mesh',
    binding: {
      counts: [1, 1, 1, 1],
      bones: [0, 0, 0, 0],
      positions: [-20, -20, 20, -20, 20, 20, -20, 20],
      weights: [1, 1, 1, 1],
    },
    uvs: [0, 1, 1, 1, 1, 0, 0, 0],
    triangles: [0, 1, 2, 0, 2, 3],
    edges: [0, 1, 1, 2, 2, 3, 3, 0],
    hull: 4,
    width: 40,
    height: 40,
  } as unknown as MeshAttachmentDef;
}

/** Um arquivo com um slot, uma malha e uma região no mesmo slot. */
function comMalha(): BoneFile {
  return {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    skeleton: { name: 'teste', fps: 30 },
    bones: [{ name: 'root' }],
    slots: [{ name: 'mao', bone: 'root', attachment: 'mao_aberta' }],
    skins: [
      {
        name: 'default',
        attachments: {
          mao: {
            mao_aberta: malhaComPesos(),
            mao_inteira: { type: 'region', width: 40, height: 40 },
          },
        },
      },
      { name: 'inverno', attachments: { mao: { mao_luva: malhaComPesos() } } },
    ],
  } as unknown as BoneFile;
}

describe('quem pode servir de origem', () => {
  it('só malhas, e só do MESMO slot — em qualquer pele (7.5)', () => {
    const parents = linkedMeshParents(comMalha(), 'mao');
    expect(parents.map((p) => p.attachment).sort()).toEqual(['mao_aberta', 'mao_luva']);
    // A região do mesmo slot não entra: uma malha ligada empresta geometria.
    expect(parents.some((p) => p.attachment === 'mao_inteira')).toBe(false);
    const luva = parents.find((p) => p.attachment === 'mao_luva')!;
    expect(luva.skin).toBe('inverno');
    expect(luva.vertexCount).toBe(4);
    expect(luva.weighted).toBe(true);
    expect(luva.label).toContain('skin inverno');
  });

  it('um slot sem malha nenhuma diz por que não dá', () => {
    const file = comMalha();
    delete (file.skins![0]!.attachments!['mao'] as Record<string, unknown>)['mao_aberta'];
    delete file.skins![1];
    file.skins = [file.skins![0]!];
    expect(whyNotLink(file, 'mao')).toContain('nenhuma malha');
    expect(whyNotLink(file, null)).toContain('Escolha um slot');
    expect(whyNotLink(comMalha(), 'não existe')).toContain('não existe');
    expect(whyNotLink(comMalha(), 'mao')).toBeNull();
  });

  it('o nome novo não pisa em nome usado, em pele nenhuma', () => {
    const file = comMalha();
    expect(namesInSlot(file, 'mao').sort()).toEqual(['mao_aberta', 'mao_inteira', 'mao_luva']);
    expect(linkedMeshName(file, 'mao', 'mao_aberta')).toBe('mao_aberta_ligada');
    (file.skins![0]!.attachments!['mao'] as Record<string, unknown>)['mao_aberta_ligada'] = { type: 'region' };
    expect(linkedMeshName(file, 'mao', 'mao_aberta')).toBe('mao_aberta_ligada2');
  });
});

describe('criar a malha ligada', () => {
  it('escreve três campos e NENHUM número de geometria', () => {
    const doc = new Doc(comMalha());
    const parents = linkedMeshParents(doc.file, 'mao');
    const alvo = parents.find((p) => p.attachment === 'mao_aberta')!;
    const result = linkMesh(doc, 'mao', alvo, { name: 'mao_fechada' });
    expect(result.name).toBe('mao_fechada');

    const def = doc.file.skins![0]!.attachments!['mao']!['mao_fechada'] as LinkedMeshAttachmentDef;
    expect(def.type).toBe('linkedmesh');
    expect(def.parent).toBe('mao_aberta');
    // O pai está na pele default, então `skin` nem é escrito (é o padrão).
    expect(def.skin).toBeUndefined();
    // Nada de geometria: é isso que 7.5 promete.
    const bruto = def as unknown as Record<string, unknown>;
    for (const campo of ['vertices', 'binding', 'uvs', 'triangles', 'hull', 'edges']) {
      expect(bruto[campo]).toBeUndefined();
    }
    expect(def.width).toBe(40);
    expect(def.height).toBe(40);
    // A imagem começa igual à do pai: um placeholder sem imagem no atlas é
    // INVISÍVEL, e o botão faria o desenho sumir da tela.
    expect(def.path).toBe('mao_aberta');
  });

  it('a imagem começa igual à do pai, e pode ser escolhida na hora', () => {
    const doc = new Doc(comMalha());
    const alvo = linkedMeshParents(doc.file, 'mao')[0]!;
    linkMesh(doc, 'mao', alvo, { name: 'a' });
    linkMesh(doc, 'mao', alvo, { name: 'b', path: 'mao_fechada_png' });
    const mao = doc.file.skins![0]!.attachments!['mao']!;
    expect((mao['a'] as LinkedMeshAttachmentDef).path).toBe('mao_aberta');
    expect((mao['b'] as LinkedMeshAttachmentDef).path).toBe('mao_fechada_png');
  });

  it('escreve a pele do pai quando ele não está na default', () => {
    const doc = new Doc(comMalha());
    const luva = linkedMeshParents(doc.file, 'mao').find((p) => p.attachment === 'mao_luva')!;
    linkMesh(doc, 'mao', luva, { name: 'mao_ligada' });
    const def = doc.file.skins![0]!.attachments!['mao']!['mao_ligada'] as LinkedMeshAttachmentDef;
    expect(def.parent).toBe('mao_luva');
    expect(def.skin).toBe('inverno');
  });

  it('o slot passa a mostrar o desenho novo, e desfazer devolve o anterior', () => {
    const doc = new Doc(comMalha());
    const alvo = linkedMeshParents(doc.file, 'mao')[0]!;
    expect(doc.file.slots![0]!.attachment).toBe('mao_aberta');
    const result = linkMesh(doc, 'mao', alvo, { name: 'mao_nova' });
    expect(result.shown).toBe(true);
    expect(doc.file.slots![0]!.attachment).toBe('mao_nova');
    doc.undo();
    expect(doc.file.slots![0]!.attachment).toBe('mao_aberta');
    expect(doc.file.skins![0]!.attachments!['mao']!['mao_nova']).toBeUndefined();
  });

  it('quem não quer mostrar pede para não mostrar', () => {
    const doc = new Doc(comMalha());
    const alvo = linkedMeshParents(doc.file, 'mao')[0]!;
    const result = linkMesh(doc, 'mao', alvo, { name: 'escondida', show: false });
    expect(result.shown).toBe(false);
    expect(doc.file.slots![0]!.attachment).toBe('mao_aberta');
  });

  it('inheritDeform só é escrito quando é false — true é o padrão do formato', () => {
    const doc = new Doc(comMalha());
    const alvo = linkedMeshParents(doc.file, 'mao')[0]!;
    linkMesh(doc, 'mao', alvo, { name: 'a' });
    linkMesh(doc, 'mao', alvo, { name: 'b', inheritDeform: false });
    const mao = doc.file.skins![0]!.attachments!['mao']!;
    expect((mao['a'] as LinkedMeshAttachmentDef).inheritDeform).toBeUndefined();
    expect((mao['b'] as LinkedMeshAttachmentDef).inheritDeform).toBe(false);
  });

  it('uma origem de outro slot é recusada com uma frase em português (7.5)', () => {
    const file = comMalha();
    (file.slots as unknown[]).push({ name: 'pe', bone: 'root' });
    expect(() => createLinkedMesh(file, 'pe', {
      attachment: 'mao_aberta', skin: 'default', skinIndex: 0,
      vertexCount: 4, weighted: true, label: 'mao_aberta',
    })).toThrow(/mesmo slot/);
  });

  it('um nome já usado é recusado antes de escrever qualquer coisa', () => {
    const file = comMalha();
    const alvo = linkedMeshParents(file, 'mao')[0]!;
    expect(() => createLinkedMesh(file, 'mao', alvo, { name: 'mao_inteira' }))
      .toThrow(/Já existe/);
  });

  it('a linha do painel diz o que foi criado e de que malha', () => {
    const doc = new Doc(comMalha());
    const luva = linkedMeshParents(doc.file, 'mao').find((p) => p.attachment === 'mao_luva')!;
    const linha = linkedMeshLine(linkMesh(doc, 'mao', luva, { name: 'x' }));
    expect(linha).toContain('"x" criada');
    expect(linha).toContain('mao_luva');
    expect(linha).toContain('skin inverno');
    expect(linha).toContain('Propriedades');
  });
});

describe('o runtime compartilha os arrays do pai, sem copiar nada (7.5)', () => {
  /** Carrega o arquivo pelo runtime e devolve as duas malhas. */
  function carregar(file: BoneFile): { parent: MeshAttachment; linked: LinkedMeshAttachment } {
    const data = loadSkeletonData(file as unknown as Record<string, unknown>);
    const skin = data.skins.find((s) => s.name === 'default')!;
    const slot = data.slots.findIndex((entry) => entry.name === 'mao');
    const parent = skin.getAttachment(slot, 'mao_aberta') as MeshAttachment;
    const linked = skin.getAttachment(slot, 'mao_fechada') as LinkedMeshAttachment;
    return { parent, linked };
  }

  it('vértices, pesos, UVs, triângulos, contorno e arestas são os MESMOS arrays', () => {
    const doc = new Doc(comMalha());
    const alvo = linkedMeshParents(doc.file, 'mao')[0]!;
    linkMesh(doc, 'mao', alvo, { name: 'mao_fechada' });

    const { parent, linked } = carregar(doc.file);
    expect(linked).toBeInstanceOf(LinkedMeshAttachment);
    expect(linked.parent).toBe(parent);
    // Identidade, não igualdade: uma cópia passaria num toEqual e quebraria 7.5.
    expect(linked.uvs).toBe(parent.uvs);
    expect(linked.triangles).toBe(parent.triangles);
    expect(linked.edges).toBe(parent.edges);
    expect(linked.hull).toBe(parent.hull);
    expect(linked.binding).toBe(parent.binding);
    expect(linked.vertexCount).toBe(parent.vertexCount);
  });

  it('sem pesos, o array de vértices também é o mesmo', () => {
    const file = comMalha();
    const mao = file.skins![0]!.attachments!['mao'] as Record<string, unknown>;
    mao['mao_aberta'] = {
      type: 'mesh',
      vertices: [-20, -20, 20, -20, 20, 20, -20, 20],
      uvs: [0, 1, 1, 1, 1, 0, 0, 0],
      triangles: [0, 1, 2, 0, 2, 3],
      hull: 4,
    };
    const doc = new Doc(file);
    const alvo = linkedMeshParents(doc.file, 'mao').find((p) => p.attachment === 'mao_aberta')!;
    linkMesh(doc, 'mao', alvo, { name: 'mao_fechada' });
    const { parent, linked } = carregar(doc.file);
    expect(linked.vertices).toBe(parent.vertices);
  });

  it('com inheritDeform, o deform do pai é o deform do filho', () => {
    const doc = new Doc(comMalha());
    const alvo = linkedMeshParents(doc.file, 'mao')[0]!;
    linkMesh(doc, 'mao', alvo, { name: 'mao_fechada' });
    const { parent, linked } = carregar(doc.file);
    // §7.5: com `inheritDeform: true` a timeline de deform do pai vale para os
    // dois, e o runtime marca isso apontando o alvo da timeline para o pai.
    expect(linked.timelineAttachment).toBe(parent);
  });

  it('o arquivo escrito pelo editor carrega sem aviso nenhum', () => {
    const doc = new Doc(comMalha());
    const alvo = linkedMeshParents(doc.file, 'mao')[0]!;
    linkMesh(doc, 'mao', alvo, { name: 'mao_fechada' });
    const data = loadSkeletonData(doc.file as unknown as Record<string, unknown>);
    expect(data.warnings).toEqual([]);
  });
});

describe('no arquivo de exemplo de verdade', () => {
  it('o herói já traz uma malha ligada, e ela compartilha os arrays', () => {
    const file = heroi();
    const atlas = loadAtlas(JSON.parse(readFileSync(`${EXEMPLOS}heroi.atlas.json`, 'utf8')));
    const data = loadSkeletonData(file as unknown as Record<string, unknown>, { atlases: [atlas] });
    let achou = 0;
    for (const skin of data.skins) {
      for (const holder of skin.attachments.values()) {
        for (const att of holder.values()) {
        if (!(att instanceof LinkedMeshAttachment)) continue;
        achou++;
        expect(att.uvs).toBe(att.parent.uvs);
        expect(att.triangles).toBe(att.parent.triangles);
        }
      }
    }
    expect(achou).toBeGreaterThan(0);
  });

  it('o painel acha origens para o slot da malha ligada do herói', () => {
    const file = heroi();
    let slotComMalha: string | null = null;
    for (const skin of file.skins ?? []) {
      for (const [slot, holder] of Object.entries(skin.attachments ?? {})) {
        if (Object.values(holder).some((def) => def?.type === 'mesh')) slotComMalha = slot;
      }
    }
    expect(slotComMalha).not.toBeNull();
    expect(whyNotLink(file, slotComMalha)).toBeNull();
    expect(linkedMeshParents(file, slotComMalha!).length).toBeGreaterThan(0);
  });
});

// ===========================================================================
// 3. D5 — a definição do evento, a pasta dos sons, e o som na linha do tempo
//    (degrau 12, 18/09/2026)
// ===========================================================================

/**
 * A porta D5. O formato tinha `audio`, `volume` e `balance` na definição
 * (§4.5), a junção `assets.audioBase + event.audio` está na §2.8, e o
 * `runtime/src/animation.ts` já entregava o evento no instante certo (§8.6).
 *
 * A tela tinha metade: a **chave** editava volume e balanço, e o caminho do
 * som aparecia **só para ler**. A definição não tinha campo nenhum, a pasta de
 * sons não tinha campo nenhum, e o editor não tocava som nenhum.
 */
describe('D5 — a pasta dos sons e o caminho do arquivo (§2.8)', () => {
  it('junta a base com o nome, e põe a barra quando falta', () => {
    const file = heroi();
    expect(audioBaseOf(file)).toBe('audio/');
    expect(resolvedEventAudio(file, 'step')).toBe('audio/step.ogg');
    (file as { assets: { audioBase: string } }).assets.audioBase = 'sons';
    expect(resolvedEventAudio(file, 'step')).toBe('sons/step.ogg');
  });

  it('sem base, o caminho é o nome cru; sem som, é `null`', () => {
    const file = comEventos();
    expect(resolvedEventAudio(file, 'som')).toBe('passo.ogg');
    expect(resolvedEventAudio(file, 'passo')).toBe(null);
  });
});

describe('D5 — a ficha da definição avisa o que o jogo não vai poder tocar', () => {
  it('som sem extensão é dito (§4.5 pede o nome com extensão)', () => {
    const file = comEventos();
    file.events![1]!.audio = 'passo';
    expect(eventDefProblems(file, 'som')).toContain(
      'o som precisa do nome com extensão (por exemplo `passo.ogg`)',
    );
  });

  it('volume e balanço fora da faixa são ditos, com o número', () => {
    const file = comEventos();
    file.events![1]!.volume = 3;
    file.events![1]!.balance = -9;
    const ditos = eventDefProblems(file, 'som');
    expect(ditos).toContain('o volume 3 está fora de 0 a 1');
    expect(ditos).toContain('o balanço −9 está fora de −1 a 1');
  });

  it('evento que nenhuma chave dispara é dito: ele não vai tocar nunca', () => {
    expect(eventDefProblems(comEventos(), 'som')).toContain(
      'nenhuma chave dispara este evento: ele não vai tocar nunca',
    );
    // No herói o `step` é disparado de verdade, e aí não há o que avisar.
    expect(eventDefProblems(heroi(), 'step')).toEqual([]);
  });

  it('e diz onde cada disparo está: a animação e o tempo', () => {
    const disparos = eventFirings(heroi(), 'step');
    expect(disparos.length).toBeGreaterThan(0);
    // A animação vem pelo NOME, e não pelo índice: `file.animations` é um
    // array de `{ name, timelines }` (§4.6), e um `Object.entries` daria "0".
    expect(disparos[0]!.animation).not.toBe('0');
    expect(typeof disparos[0]!.time).toBe('number');
  });
});

describe('D5 — os sons de uma animação, em ordem de tempo', () => {
  it('traz o instante, o evento, o arquivo já juntado e o volume que vale', () => {
    const file = heroi();
    const nome = eventFirings(file, 'step')[0]!.animation;
    const sons = animationSounds(file, nome);
    expect(sons.length).toBeGreaterThan(0);
    const passo = sons.find((s) => s.event === 'step')!;
    expect(passo.audio).toBe('audio/step.ogg');
    // A definição do `step` diz `volume: 0.8`; a chave não sobrescreve.
    expect(passo.volume).toBe(0.8);
    expect(sons.map((s) => s.time)).toEqual([...sons.map((s) => s.time)].sort((a, b) => a - b));
  });

  it('a chave MUDA fica na lista, marcada — some da lista seria mentir', () => {
    const file = comEventos();
    const doc = new Doc(file);
    doc.run(keyEvent('walk', 0.25, 'passo'));
    const sons = animationSounds(doc.file, 'walk');
    expect(sons).toHaveLength(1);
    expect(sons[0]).toMatchObject({ time: 0.25, event: 'passo', audio: null });
  });

  it('a chave que aponta para um evento apagado é marcada, e não some', () => {
    const doc = new Doc(comEventos());
    doc.run(keyEvent('walk', 0.5, 'som'));
    doc.file.events = doc.file.events!.filter((e) => e.name !== 'som');
    const sons = animationSounds(doc.file, 'walk');
    expect(sons[0]!.unknownEvent).toBe(true);
  });

  it('sem animação aberta, a lista é vazia — e não um erro', () => {
    expect(animationSounds(heroi(), null)).toEqual([]);
  });
});

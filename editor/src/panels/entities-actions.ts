/**
 * As portas do menu **Entidades** — rodada 6 (05/10/2026), `05 O DESENHO DOS
 * MENUS`, §8. *"Encaixar. Onde cabe uma imagem, cabe uma entidade."*
 *
 * Cada uma existia só como gesto: pôr na cena era arrastar da aba Entidades;
 * promover era o botão direito na aba; escolher a animação da entidade era o
 * botão direito na faixa da linha do tempo. O menu chama a MESMA conta, e
 * pergunta pela lista o que o gesto sabia pelo lugar do clique.
 *
 * | id | O que faz |
 * |:---|:---|
 * | `por-entidade` | a entidade entra presa ao osso escolhido (ou na raiz) |
 * | `promover-entidade` | a entidade passa para a lista de bases |
 * | `escolher-animacao-entidade` | grava a chave da animação dela no instante |
 *
 * O item cinza diz por quê (régua 3).
 */

import type { EditorDoc } from '../contract.js';
import { corpoDe, emptySelection, skeletonsDe, wentToBase } from '../contract.js';
import { registerAction } from '../ui/actions.js';
import { askForm, askPick } from '../ui/dialog.js';
import { Doc } from '../doc/document.js';
import { projetoDe } from '../doc/projeto.js';
import {
  MarkAsSlot, UnmarkSlot, markTarget, suggestedSlotName, takenBaseUris, unmarkTarget, whyBadName, whyCannotMark,
  whyCannotUnmark,
} from './slot-base-model.js';
import { DropEntityAsSlot, entityDropNotice, entityDropPlace, firstAnimationOf } from '../doc/drop-entity.js';
import type { EntityDropPlace } from '../doc/drop-entity.js';
import { viewCenter } from '../viewport/view-center.js';
import { garantirAninhado } from '../doc/projeto.js';
import { SetEntityLoop, bandMenu, entityBand, entityShortName, entitySlots } from '../anim/entity-band.js';
import type { EntitySlot } from '../anim/entity-band.js';
import { SetEntityAround, aroundCount, aroundNotice, aroundOf, markerCandidates } from '../anim/entity-around.js';
import { NO_ENTITIES, listEntities } from './palette-entities-model.js';
import type { EntityRow } from './palette-entities-model.js';
import {
  animaChoices, cardSkins, chainUp, dropOnSlot, skinChoices, testAllEqual, testCardLabel, testCards, testLinks,
  testSlotHere, toggleTestSkin, unplug, unplugUp, whyCannotTest, whyNoCardAnima, whyNoTestHere, whyNoUnplugHere,
} from './entities-cards-model.js';
import type { EntityCard } from './entities-cards-model.js';
import { chooseIntoProject, promoteEntityRow, putProjectInside, setCardAnima } from './palette-entities.js';
import { setEntityAnimationAt } from './dopesheet-actions.js';

/** Por que as portas estão cinzas. */
export const ENTITY_WHY = Object.freeze({
  nenhuma: NO_ENTITIES,
  animacao: 'Abra uma animação primeiro: a animação da entidade se escolhe na animação de quem a recebe',
  escolher: 'Escolha a entidade primeiro (clique nela na cena, ou na Árvore)',
});

/** Qual entidade da lista: uma só vai direto, na hora; mais, pergunta. */
function withEntity(doc: EditorDoc, title: string, faz: (row: EntityRow) => void): void {
  const rows = listEntities(doc);
  if (rows.length === 0) { doc.notice(NO_ENTITIES); return; }
  if (rows.length === 1) { faz(rows[0]!); return; }
  void askPick({
    title,
    placeholder: 'Qual entidade?',
    search: (text) => rows
      .filter((row) => row.name.toLowerCase().includes(String(text).trim().toLowerCase()))
      .map((row) => ({ id: row.uri, label: row.name, hint: row.uri })),
  }).then((id) => {
    const row = rows.find((r) => r.uri === id);
    if (row !== undefined) faz(row);
  });
}

/**
 * **Entidades → Pôr entidade na cena…** — o arrasto da aba, pelo menu. Presa
 * ao osso escolhido, como o "Pôr imagem na cena…"; sem osso, no mesmo lugar
 * em que o arrasto solta no meio da cena (a raiz).
 */
export function putEntityInScene(doc: EditorDoc): void {
  withEntity(doc, 'Pôr entidade na cena', (row) => { putEntityRow(doc, row); });
}

/**
 * Pendura `row` **de pé**: no osso escolhido, ou, sem osso, no meio do que a
 * cena mostra, presa ao osso mais perto — rodada 23, defeito 5.
 *
 * A forma: *"a porta do menu não fazia a conta do gesto"*. O arrasto (rodada
 * 8b, A2) já punha a entidade de pé e no osso mais perto; o menu, que devia
 * chamar a mesma conta, punha no `(0, 0)` do osso escolhido sem o giro, ou na
 * raiz — deitada no chão do herói.
 */
export function entityMenuPlace(doc: EditorDoc): EntityDropPlace {
  const corpo = corpoDe(doc);
  const osso = doc.selection.bones[0];
  const vivo = osso === undefined ? null : doc.skeleton?.findBone(osso) ?? null;
  if (osso !== undefined) {
    // O giro que desfaz o do osso no mundo: a raiz da entidade fica de pé.
    const giro = vivo === null ? 0 : -vivo.worldRotationX;
    return { bone: osso, x: 0, y: 0, rotation: Math.abs(giro) < 1e-6 ? 0 : giro };
  }
  const meio = viewCenter() ?? { x: 0, y: 0 };
  return entityDropPlace(doc.skeleton, corpo.file, meio.x, meio.y);
}

/** Pendura `row` de pé, no lugar de `entityMenuPlace`. */
export function putEntityRow(doc: EditorDoc, row: EntityRow): void {
  const corpo = corpoDe(doc);
  const lugar = entityMenuPlace(doc);
  const appear = doc.animation !== null ? { animation: doc.animation, time: doc.time } : null;
  // Rodada 8b, C18: a entidade trazida de fora passa a ser conhecida da base.
  garantirAninhado(doc, row.uri);
  const toca = firstAnimationOf(skeletonsDe(corpo), row.uri);
  const command = new DropEntityAsSlot(corpo.file, row.uri, lugar.bone, doc.visibleSkins, lugar.x, lugar.y, appear, lugar.rotation, toca);
  corpo.run(command);
  doc.select({ ...emptySelection(), slots: [command.name] });
  doc.notice(entityDropNotice(command.name, lugar.bone, appear, toca));
}

/** A entidade encaixada no slot escolhido, ou `null`. */
export function selectedEntitySlot(doc: EditorDoc): EntitySlot | null {
  const slots = new Set([
    ...doc.selection.slots,
    ...doc.selection.attachments.map((a) => a.slot),
  ]);
  return entitySlots(doc.file).find((entity) => slots.has(entity.slot)) ?? null;
}

/** Por que não dá para escolher a animação da entidade agora, ou `null`. */
export function whyNoEntityAnimation(doc: EditorDoc): string | null {
  if (doc.animation === null) return ENTITY_WHY.animacao;
  return selectedEntitySlot(doc) === null ? ENTITY_WHY.escolher : null;
}

/**
 * **Entidades → Escolher a animação da entidade…** — o botão direito na faixa
 * (E12b), pelo menu. A lista sai do arquivo da entidade; sem ele, o rodapé diz.
 */
export async function chooseEntityAnimation(doc: EditorDoc): Promise<boolean> {
  const why = whyNoEntityAnimation(doc);
  const entity = selectedEntitySlot(doc);
  if (why !== null || entity === null || doc.animation === null) { doc.notice(why ?? ''); return false; }
  const child = skeletonsDe(doc).get(entity.uri) ?? null;
  if (child === null) {
    doc.notice(`O arquivo de ${entityShortName(entity.uri)} não está aberto: o editor não sabe que animações ela tem`);
    return false;
  }
  const agora = entityBand(doc.file, doc.animation, entity)
    .find((s) => doc.time >= s.from && doc.time <= s.to)?.animation ?? entity.animation;
  const itens = bandMenu(child.animations.map((a) => a.name), agora);
  const id = await askPick({
    title: `Animação de ${entityShortName(entity.uri)}`,
    placeholder: 'Qual animação toca daqui em diante?',
    search: (text) => itens
      .filter((item) => item.label.toLowerCase().includes(String(text).trim().toLowerCase()))
      .map((item) => ({ id: item.animation ?? '', label: item.label, hint: item.hint, ...(item.current ? { aside: 'agora' } : {}) })),
  });
  if (id === null) return false;
  setEntityAnimationAt(doc, entity, id === '' ? null : id);
  return true;
}

/**
 * **Entidades → Em laço** — rodada 8c, C15. Liga e desliga o laço da entidade
 * escolhida (o `loop` do anexo, 7.11). Em laço ela roda sozinha, sem fim; sem
 * laço, toca uma volta e para no último quadro. Vai para a base: é do anexo.
 */
export function toggleEntityLoop(doc: EditorDoc, alvo?: EntitySlot): boolean {
  const entity = alvo ?? selectedEntitySlot(doc);
  if (entity === null) { doc.notice(ENTITY_WHY.escolher); return false; }
  const nome = entityShortName(entity.uri);
  corpoDe(doc).run(new SetEntityLoop(entity.slot, entity.attachment, entity.skin, !entity.loop));
  doc.notice(entity.loop
    ? `${nome} sem laço: toca uma volta e para no último quadro. A faixa passa a ter tamanho`
    : `${nome} em laço: roda sozinha, a partir de onde entra, sem fim`);
  return true;
}

// ---------------------------------------------------------------------------
// "Este boneco" — rodada 11 (05/10/2026), spec 7.11 `around`
// ---------------------------------------------------------------------------

/** Por que as duas portas do "Este boneco" estão cinzas. */
export const AROUND_WHY = Object.freeze({
  semMarca: 'A entidade escolhida não tem a marca Este boneco: ela já é desenhada em bloco',
  fechada: (uri: string): string => `O arquivo de ${entityShortName(uri)} não está aberto: `
    + 'o editor não sabe que imagens ela tem para marcar o meio',
});

/**
 * A entidade escolhida, pelo placeholder que o slot está mostrando AGORA. Com
 * a marca ligada só num trecho da animação o slot tem dois placeholders da
 * mesma entidade; o que vale é o do instante, e não o primeiro do arquivo.
 */
export function entityNow(doc: EditorDoc): EntitySlot | null {
  const escolhida = selectedEntitySlot(doc);
  if (escolhida === null) return null;
  const agora = doc.skeleton?.findSlot(escolhida.slot)?.attachmentName ?? null;
  return entitySlots(doc.file).find((e) => e.slot === escolhida.slot && e.attachment === agora) ?? escolhida;
}

/** Por que não dá para marcar o meio agora, ou `null`. */
export function whyNoAround(doc: EditorDoc): string | null {
  const entity = entityNow(doc);
  if (entity === null) return ENTITY_WHY.escolher;
  return skeletonsDe(doc).has(entity.uri) ? null : AROUND_WHY.fechada(entity.uri);
}

/** Por que não dá para tirar a marca agora, ou `null`. */
export function whyNoTakeOffAround(doc: EditorDoc): string | null {
  const entity = entityNow(doc);
  if (entity === null) return ENTITY_WHY.escolher;
  return aroundOf(doc.file, entity) === null ? AROUND_WHY.semMarca : null;
}

/**
 * Grava a marca (`marker`) ou a tira (`null`) na entidade do instante. Na base
 * vale em todas as animações; com uma animação aberta, só nela, do quadro da
 * agulha em diante. Um passo de desfazer. Devolve se gravou.
 */
export function setAround(doc: EditorDoc, marker: string | null, alvo?: EntitySlot): boolean {
  const entity = alvo ?? entityNow(doc);
  if (entity === null) { doc.notice(ENTITY_WHY.escolher); return false; }
  const child = skeletonsDe(doc).get(entity.uri) ?? null;
  if (marker !== null && aroundCount(child, marker) === null) {
    doc.notice(child === null ? AROUND_WHY.fechada(entity.uri)
      : `${entityShortName(entity.uri)} não tem o slot "${marker}": nada foi marcado`);
    return false;
  }
  if (marker === null && aroundOf(doc.file, entity) === null) { doc.notice(AROUND_WHY.semMarca); return false; }
  const at = doc.animation !== null ? { animation: doc.animation, time: doc.time } : null;
  const command = new SetEntityAround(entity.slot, entity.attachment, entity.skin, marker, at);
  // Na base é mexida de estrutura: vai para a base do corpo do instante, como
  // o laço. Numa animação a chave é dela, e o placeholder novo mora com ela.
  (at === null ? corpoDe(doc) : doc).run(command);
  const host = doc.file.skeleton?.name;
  doc.notice(aroundNotice(
    entity.uri, typeof host === 'string' ? host : '', marker,
    marker === null ? null : aroundCount(child, marker), at,
  ));
  return true;
}

/**
 * **Entidades → Este boneco…** — pergunta qual imagem da entidade marca o
 * meio, pela lista dos slots dela (a porta que funciona sem clicar dentro da
 * entidade na cena). Cada linha diz quantas peças ficam atrás e na frente.
 */
export async function chooseAround(doc: EditorDoc): Promise<boolean> {
  const why = whyNoAround(doc);
  const entity = entityNow(doc);
  if (why !== null || entity === null) { doc.notice(why ?? ''); return false; }
  const child = skeletonsDe(doc).get(entity.uri) ?? null;
  const agora = aroundOf(doc.file, entity);
  const linhas = markerCandidates(child).map((slot) => {
    const conta = aroundCount(child, slot);
    return {
      id: slot, label: slot,
      hint: conta === null ? '' : `${conta.behind} atrás do boneco, ${conta.front} na frente`,
      ...(slot === agora ? { aside: 'agora' } : {}),
    };
  });
  const id = await askPick({
    title: `Este boneco: o meio de ${entityShortName(entity.uri)}`,
    placeholder: 'Qual imagem marca o meio? Ela deixa de ser desenhada',
    search: (text) => linhas.filter((l) => l.label.toLowerCase().includes(String(text).trim().toLowerCase())),
  });
  if (id === null) return false;
  return setAround(doc, id, entity);
}

/** Uma linha de opção da grade do botão direito: o nome, a dica e o que faz. */
export interface AroundGridOption {
  readonly label: string;
  readonly hint: string;
  /** `true` quando a imagem clicada JÁ é o meio: o item aparece marcado, e clicar tira. */
  readonly checked: boolean;
  run(): boolean;
}

/**
 * **O primeiro item da grade** — o gesto do Humberto: *"botão direito na imagem
 * do meio do poder; na grade, o primeiro item é Este boneco."*
 *
 * `slot` é o slot de quem recebe (a entidade); `inner` é a imagem DE DENTRO
 * dela em que se clicou (`Pick.inner`). `null` quando o clique não foi numa
 * imagem de dentro de uma entidade aberta: aí a grade não ganha o item.
 * Clicar na imagem que já é o meio tira a marca; em outra, o meio passa a ser ela.
 */
export function aroundGridOption(doc: EditorDoc, slot: string, inner: string | undefined): AroundGridOption | null {
  if (inner === undefined) return null;
  const agora = doc.skeleton?.findSlot(slot)?.attachmentName ?? null;
  const entity = entitySlots(doc.file).find((e) => e.slot === slot && e.attachment === agora)
    ?? entitySlots(doc.file).find((e) => e.slot === slot) ?? null;
  if (entity === null) return null;
  const child = skeletonsDe(doc).get(entity.uri) ?? null;
  const conta = aroundCount(child, inner);
  if (conta === null) return null;
  const nome = entityShortName(entity.uri);
  const meio = aroundOf(doc.file, entity);
  if (meio === inner) {
    return {
      label: 'Este boneco ✓', checked: true,
      hint: `"${inner}" é o meio de ${nome}. Clicar tira a marca: ${nome} volta a ser desenhada em bloco`,
      run: () => setAround(doc, null, entity),
    };
  }
  return {
    label: 'Este boneco', checked: false,
    hint: `A imagem "${inner}" vira o meio de ${nome}: ${conta.behind} atrás do boneco inteiro, ${conta.front} na frente, `
      + 'e ela deixa de ser desenhada'
      + (meio === null ? '' : `. Hoje o meio é "${meio}"`),
    run: () => setAround(doc, inner, entity),
  };
}

/**
 * **Os itens do alto da grade** — v27.7, conferência do "Este boneco" (15).
 *
 * Pelo botão direito não havia como desfazer: com o poder já em volta, a
 * imagem clicada quase nunca é o meio (o meio nem é desenhado), e o item dizia
 * só "Este boneco" — escolher trocava o meio. Agora:
 *
 * - com a marca ligada, em QUALQUER imagem de dentro: **Tirar o Este boneco**
 *   primeiro; e, se a imagem clicada não é o meio, **Este boneco: o meio passa
 *   a ser esta**;
 * - sem a marca: só **Este boneco**.
 */
export function aroundGridOptions(doc: EditorDoc, slot: string, inner: string | undefined): AroundGridOption[] {
  const uma = aroundGridOption(doc, slot, inner);
  if (uma === null || inner === undefined) return [];
  const agora = doc.skeleton?.findSlot(slot)?.attachmentName ?? null;
  const entity = entitySlots(doc.file).find((e) => e.slot === slot && e.attachment === agora)
    ?? entitySlots(doc.file).find((e) => e.slot === slot) ?? null;
  if (entity === null) return [];
  const meio = aroundOf(doc.file, entity);
  if (meio === null) return [uma];
  const nome = entityShortName(entity.uri);
  const tirar: AroundGridOption = {
    label: 'Tirar o Este boneco', checked: true,
    hint: `O meio de ${nome} é "${meio}". Tirar a marca: ${nome} volta a ser desenhada em bloco`,
    run: () => setAround(doc, null, entity),
  };
  if (meio === inner) return [tirar];
  return [tirar, {
    label: 'Este boneco: o meio passa a ser esta', checked: false, hint: uma.hint, run: uma.run,
  }];
}

/**
 * **Marcar como slot** — rodada 9. Pergunta o nome (o da imagem, sugerido), e
 * a imagem vira uma base do projeto com esse nome. Um passo de desfazer.
 */
export async function markAsSlot(doc: EditorDoc): Promise<void> {
  const why = whyCannotMark(doc);
  const alvo = markTarget(doc);
  const projeto = projetoDe(doc);
  const corpo = corpoDe(doc);
  if (why !== null || alvo === null || projeto === null) {
    doc.notice(why ?? 'Marcar como slot precisa de um projeto aberto');
    return;
  }
  const def = (corpo.file.skins ?? []).find((s) => s.name === alvo.skin)?.attachments?.[alvo.slot]?.[alvo.attachment];
  const sugerido = suggestedSlotName(alvo.attachment, (def ?? null) as Record<string, unknown> | null);
  const slots = (corpo.file.slots ?? []).map((s) => s.name);
  // Rodada 17: o que está guardado só para o refazer não prende o nome.
  const uris = takenBaseUris(projeto.corpos.keys(), projeto.entidades, projeto.guardados.keys(), skeletonsDe(corpo).keys());
  const answer = await askForm({
    title: 'Marcar como slot',
    lead: `A imagem "${alvo.attachment}" vira uma base do projeto, com nome e animações próprias. `
      + 'No boneco nada muda no desenho: o mesmo lugar, a mesma ordem, as mesmas chaves.',
    fields: [{ id: 'nome', label: 'Nome da base', hint: 'O slot passa a se chamar assim, e o arquivo é <nome>.bone', value: sugerido }],
    yesLabel: 'Marcar como slot',
    noLabel: 'Desistir',
    preview: (v) => whyBadName(v['nome'] ?? '', slots, alvo.slot, uris) ?? `Nasce ${(v['nome'] ?? '').trim()}.bone, na lista de bases`,
  });
  if (answer === null) return;
  const nome = (answer['nome'] ?? '').trim();
  const ruim = whyBadName(nome, slots, alvo.slot, uris);
  if (ruim !== null) {
    doc.notice(`Marcar como slot: ${ruim}. Nada mudou`);
    return;
  }
  const imagens = corpo instanceof Doc ? corpo.pageImages : new Map<string, CanvasImageSource>();
  corpo.run(new MarkAsSlot(alvo, nome, corpo.atlases, imagens));
  doc.notice(`"${alvo.attachment}" virou a base ${nome}: o slot se chama ${nome}, e ela está na lista de bases. `
    + `Nada mudou no desenho${wentToBase(doc)}`);
}

/** **Desmarcar o slot** — rodada 9. A imagem de antes volta, com o nome de antes. */
export function unmarkSlot(doc: EditorDoc): void {
  const alvo = unmarkTarget(doc);
  if (alvo === null) {
    doc.notice(whyCannotUnmark(doc) ?? 'Escolha o slot marcado primeiro');
    return;
  }
  corpoDe(doc).run(new UnmarkSlot(alvo));
  doc.notice(`${alvo.slot} voltou a ser a imagem de antes, no slot ${alvo.mark.slotDeAntes}. `
    + `A base ${alvo.mark.nome} saiu do projeto${wentToBase(doc)}`);
}

/** Registra as do menu Entidades. Devolve como tirá-las. */
export function registerEntityActions(doc: EditorDoc): Array<() => void> {
  const temEntidade = (): boolean => listEntities(doc).length > 0;
  return [
    registerAction('por-entidade', {
      run: () => { putEntityInScene(doc); },
      enabled: temEntidade,
      why: () => ENTITY_WHY.nenhuma,
    }),
    // Rodada 9: a imagem vira base.
    registerAction('marcar-como-slot', {
      run: () => { void markAsSlot(doc); },
      enabled: () => whyCannotMark(doc) === null,
      why: () => whyCannotMark(doc),
    }),
    registerAction('desmarcar-slot', {
      run: () => { unmarkSlot(doc); },
      enabled: () => whyCannotUnmark(doc) === null,
      why: () => whyCannotUnmark(doc),
    }),
    registerAction('promover-entidade', {
      run: () => { withEntity(doc, 'Promover a base', (row) => { void promoteEntityRow(doc, row); }); },
      enabled: temEntidade,
      why: () => ENTITY_WHY.nenhuma,
    }),
    registerAction('escolher-animacao-entidade', {
      run: () => { void chooseEntityAnimation(doc); },
      enabled: () => whyNoEntityAnimation(doc) === null,
      why: () => whyNoEntityAnimation(doc),
    }),
    // Rodada 8c, C15.
    registerAction('entidade-em-laco', {
      run: () => { toggleEntityLoop(doc); },
      enabled: () => selectedEntitySlot(doc) !== null,
      why: () => ENTITY_WHY.escolher,
      checked: () => selectedEntitySlot(doc)?.loop ?? false,
    }),
    // Rodada 11: "Este boneco", a tomada ao contrário (7.11, `around`).
    registerAction('este-boneco', {
      run: () => { void chooseAround(doc); },
      enabled: () => whyNoAround(doc) === null,
      why: () => whyNoAround(doc),
      checked: () => { const e = entityNow(doc); return e !== null && aroundOf(doc.file, e) !== null; },
    }),
    registerAction('tirar-este-boneco', {
      run: () => { setAround(doc, null); },
      enabled: () => whyNoTakeOffAround(doc) === null,
      why: () => whyNoTakeOffAround(doc),
    }),
    // Rodada 39, lote 2: a montagem de teste, pelo menu. O mesmo que arrastar
    // da prateleira até a linha do slot, na aba Entidades.
    registerAction('por-em-teste', {
      run: () => { putInTestHere(doc); },
      enabled: () => whyNoTestHere(doc) === null && temEntidade(),
      why: () => whyNoTestHere(doc) ?? ENTITY_WHY.nenhuma,
    }),
    registerAction('desligar-teste', {
      run: () => { unplugHere(doc); },
      enabled: () => whyNoUnplugHere(doc) === null,
      why: () => whyNoUnplugHere(doc),
    }),
    // Lote 4: para cima — o projeto (ou o que está em volta dele) dentro de outra entidade.
    registerAction('por-dentro-de', {
      run: () => { withEntity(doc, 'Pôr dentro de', (row) => { void putProjectInside(doc, row.uri); }); },
      enabled: () => projetoDe(doc) !== null && temEntidade(),
      why: () => (projetoDe(doc) === null ? 'A montagem de teste precisa de um projeto aberto' : ENTITY_WHY.nenhuma),
    }),
    // Lote 5: Pôr no projeto — a ligação de teste vai para o arquivo aberto.
    registerAction('por-no-projeto', {
      run: () => { void chooseIntoProject(doc); },
      enabled: () => testLinks(doc).length > 0,
      why: () => 'Não há ligação de teste: arraste uma entidade da prateleira até a linha de um slot, na aba Entidades',
    }),
    registerAction('tirar-de-volta', {
      run: () => { takeOffUp(doc); },
      enabled: () => chainUp(doc).length > 0,
      why: () => 'Nada está em volta do projeto: arraste o cartão AQUI até uma entidade da prateleira',
    }),
    // Rodada 39b, lote 6: o que está no cartão de teste, pelo menu.
    registerAction('anima-do-teste', {
      run: () => { void chooseTestAnima(doc); },
      enabled: () => testCards(doc).length > 0,
      why: () => TEST_WHY.nenhum,
    }),
    registerAction('skins-do-teste', {
      run: () => { void chooseTestSkin(doc); },
      enabled: () => testCards(doc).some((c) => cardSkins(c) !== null),
      why: () => (testCards(doc).length === 0 ? TEST_WHY.nenhum : TEST_WHY.skins),
    }),
    registerAction('teste-nas-iguais', {
      run: () => { void chooseTestAllEqual(doc); },
      enabled: () => testCards(doc).some((c) => c.iguais > 0),
      why: () => (testCards(doc).length === 0 ? TEST_WHY.nenhum : TEST_WHY.iguais),
    }),
  ];
}

/** Por que as portas do cartão de teste estão cinzas — lote 6. */
export const TEST_WHY = Object.freeze({
  nenhum: 'Não há peça de teste: arraste uma entidade da prateleira até a linha de um slot, na aba Entidades',
  skins: 'Nenhuma peça de teste tem skin além da default',
  iguais: 'Nenhuma peça de teste está num slot com iguais (a mesma imagem em outros slots, como as rodas)',
});

/** Qual cartão de teste: um só vai direto; mais, pergunta. */
async function pickTestCard(title: string, cards: readonly EntityCard[]): Promise<EntityCard | null> {
  if (cards.length === 0) return null;
  if (cards.length === 1) return cards[0]!;
  const id = await askPick({
    title,
    placeholder: 'Qual peça de teste?',
    search: (text) => cards
      .map((card, i) => ({ id: String(i), label: testCardLabel(card), hint: card.uri }))
      .filter((item) => item.label.toLowerCase().includes(String(text).trim().toLowerCase())),
  });
  return id === null ? null : cards[Number(id)] ?? null;
}

/** **Entidades → O que a peça de teste toca…** — o "anima ▾" do cartão, pelo menu. */
export async function chooseTestAnima(doc: EditorDoc): Promise<boolean> {
  const card = await pickTestCard('O que a peça de teste toca', testCards(doc));
  if (card === null) { doc.notice(TEST_WHY.nenhum); return false; }
  const porque = whyNoCardAnima(doc, card);
  if (porque !== null) { doc.notice(porque); return false; }
  const itens = animaChoices(doc, card);
  const id = await askPick({
    title: `O que ${card.nome} toca`,
    placeholder: 'Parada, a de quem recebe, ou uma animação dela',
    search: (text) => itens
      .map((c, i) => ({ id: String(i), label: c.label, hint: c.hint, ...(c.atual ? { aside: 'agora' } : {}) }))
      .filter((item) => item.label.toLowerCase().includes(String(text).trim().toLowerCase())),
  });
  if (id === null) return false;
  const escolha = itens[Number(id)];
  return escolha === undefined ? false : setCardAnima(doc, card, escolha.valor);
}

/** **Entidades → Skins da peça de teste…** — o "skins ▾" do cartão, pelo menu. */
export async function chooseTestSkin(doc: EditorDoc): Promise<boolean> {
  const card = await pickTestCard('Skins da peça de teste', testCards(doc).filter((c) => cardSkins(c) !== null));
  if (card === null || card.alvo === null) { doc.notice(TEST_WHY.skins); return false; }
  const alvo = card.alvo;
  const itens = skinChoices(card);
  const id = await askPick({
    title: `Skins de ${card.nome} (teste)`,
    placeholder: 'Qual skin liga ou desliga?',
    search: (text) => itens
      .map((c) => ({ id: c.nome, label: c.nome, hint: c.ligada ? 'Ligada: escolher a desliga' : 'Desligada: escolher a liga', ...(c.ligada ? { aside: 'ligada' } : {}) }))
      .filter((item) => item.label.toLowerCase().includes(String(text).trim().toLowerCase())),
  });
  if (id === null) return false;
  const gesto = toggleTestSkin(doc, alvo, id);
  if (gesto === null) return false;
  doc.run(gesto.command);
  doc.notice(gesto.frase);
  return true;
}

/** **Entidades → Pôr o teste em todas as iguais** — o botão "Trocar todas as iguais (N)" do cartão. */
export async function chooseTestAllEqual(doc: EditorDoc): Promise<boolean> {
  const card = await pickTestCard('Pôr o teste em todas as iguais', testCards(doc).filter((c) => c.iguais > 0));
  const ligacao = card?.ligacao ?? null;
  const gesto = ligacao === null ? null : testAllEqual(doc, ligacao.host, ligacao.slot);
  if (gesto === null) { doc.notice(TEST_WHY.iguais); return false; }
  doc.run(gesto.command);
  doc.notice(gesto.frase);
  return true;
}

/**
 * **Entidades → Pôr em teste neste slot…** — rodada 39, lote 2. A imagem
 * escolhida na cena recebe a entidade em teste: vale só na Prévia, e o
 * arquivo não muda. A aba Entidades mostra o cartão tracejado.
 */
export function putInTestHere(doc: EditorDoc): void {
  const porque = whyNoTestHere(doc);
  const aqui = testSlotHere(doc);
  if (porque !== null || aqui === null) {
    doc.notice(porque ?? 'Escolha uma imagem na cena primeiro');
    return;
  }
  withEntity(doc, 'Pôr em teste neste slot', (row) => {
    const recusa = whyCannotTest(doc, aqui.host, aqui.slot, row.uri);
    if (recusa !== null) {
      doc.notice(recusa);
      return;
    }
    const gesto = dropOnSlot(doc, aqui.host, aqui.slot, row.uri);
    if (gesto === null) {
      doc.notice(`${row.name} já está em teste no slot ${aqui.slot}`);
      return;
    }
    doc.run(gesto.command);
    doc.notice(gesto.frase);
  });
}

/** **Entidades → Tirar de volta** — lote 4: o de fora mais de fora sai. */
export function takeOffUp(doc: EditorDoc): void {
  const cadeia = chainUp(doc);
  const fora = cadeia[cadeia.length - 1];
  const gesto = fora === undefined ? null : unplugUp(doc, fora.uri);
  if (gesto === null) {
    doc.notice('Nada está em volta do projeto');
    return;
  }
  doc.run(gesto.command);
  doc.notice(gesto.frase);
}

/** **Entidades → Desligar o teste deste slot** — rodada 39, lote 2. */
export function unplugHere(doc: EditorDoc): void {
  const aqui = testSlotHere(doc);
  const gesto = aqui === null ? null : unplug(doc, aqui.host, aqui.slot);
  if (gesto === null) {
    doc.notice(whyNoUnplugHere(doc) ?? 'Não há peça de teste aqui');
    return;
  }
  doc.run(gesto.command);
  doc.notice(gesto.frase);
}

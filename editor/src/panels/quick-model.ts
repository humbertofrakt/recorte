/**
 * A **ficha rápida** do painel Propriedades (dono C) — lote 22, rodada 3.
 *
 * No Spriter, `Object Properties` é uma ficha curta e sempre igual: `x`, `y`,
 * `x-scale`, `y-scale`, um **disco** para o ângulo e uma **barra** para o
 * alfa. Seis linhas, no alto, no mesmo lugar, para o que se mexe o dia inteiro.
 *
 * O nosso painel mostra tudo o que o formato tem, na ordem do formato: um osso
 * abre com nome, cor, ícone, comprimento, herança — e a rotação, que é o que
 * mais se mexe, fica na terceira seção. Este arquivo é a ficha que passa a
 * ficar em cima; o resto do painel continua embaixo, e **nada some**.
 *
 * Ele é só a conta: quais seis linhas, para onde cada uma aponta no arquivo, e
 * as duas contas dos controles novos — o ângulo do disco e o alfa da barra.
 */

import type { BoneFile } from '../../../runtime/src/index.js';
import { isEmitterSlot, ownBoneOfSlot } from '../doc/own-bone.js';
import type { EditorDoc, Selection } from '../contract.js';
import { corpoDe } from '../contract.js';
import { targetForPointer, type TimelineTarget } from '../anim/keying.js';
import { currentValueOf } from '../anim/pose-mode.js';
import { getAtPointer, parsePointer, pointerOf } from './json-pointer.js';
import { IMAGE_PROPS, imageNow, writeImageValue, type ImageProp } from './image-key.js';
import { writeFieldValue, type FieldDef } from './properties-model.js';
import { drifted, heldNotice, rulesOn, type BoneNumbers, type Grip } from '../viewport/held-by-rule.js';

/** Como um campo da ficha se mexe. */
export type QuickControl =
  /** Número, com arrasto lateral sobre o rótulo. */
  | 'numero'
  /** Número **e** o disco de girar ao lado. */
  | 'disco'
  /** Número **e** a barra de 0 a 100 ao lado. */
  | 'barra';

/**
 * A unidade de um número da ficha — rodada 43, lote 1 (doc `51`, §4).
 *
 * A régua do doc `26`: nenhum número solto. `px` para posição, `°` para giro,
 * `×` para escala (vezes o tamanho de montar), `%` para o alfa.
 */
export type QuickUnit = 'px' | '°' | '×' | '%';

/** Uma linha da ficha rápida. */
export interface QuickField {
  key: string;
  /** O nome, curto: a ficha é uma coluna estreita. */
  label: string;
  control: QuickControl;
  /**
   * Onde o valor mora no arquivo, ou `null` quando aquela linha **não existe**
   * para este alvo.
   *
   * `null`, e não "cinza": um osso não tem alfa, e um campo cinza que nunca
   * acende é um campo que se aprende a ignorar. A linha aparece vazia, com o
   * nome, e a dica diz por quê — é o desvio 2 do lote 12.
   */
  pointer: string | null;
  /** O que o formato assume quando a propriedade não está escrita. */
  fallback: number;
  /** Unidades por pixel arrastado. */
  step: number;
  /** A frase da dica. Diz a unidade e o que o número quer dizer. */
  hint: string;
  /** A unidade, escrita ao lado do campo (rodada 43). */
  unit: QuickUnit;
  /**
   * Rodada 13: na imagem com osso próprio, o ponteiro do ANEXO. A ficha mostra
   * e grava os números da imagem (`image-key.ts`), e não os do osso — senão
   * digitava-se X = 25 e lia-se 7, o pivô.
   */
  image?: string;
}

/** O que a ficha está editando. */
export type QuickSubject =
  | { kind: 'bone'; name: string }
  | { kind: 'slot'; name: string }
  | { kind: 'none' };

/**
 * O que a ficha edita, a partir da seleção.
 *
 * Um osso ganha na frente de um slot: mexer no osso move o desenho junto, e é
 * o gesto mais comum de todos. Mais de um osso escolhido não abre ficha —
 * seis campos com valores diferentes por trás mostrariam o do primeiro e
 * gravariam em todos.
 */
export function quickSubject(selection: Selection): QuickSubject {
  if (selection.bones.length === 1 && selection.slots.length === 0) {
    return { kind: 'bone', name: selection.bones[0]! };
  }
  if (selection.slots.length === 1 && selection.bones.length === 0) {
    return { kind: 'slot', name: selection.slots[0]! };
  }
  return { kind: 'none' };
}

function boneIndex(file: BoneFile, name: string): number {
  return (file.bones ?? []).findIndex((b) => b.name === name);
}

function slotIndex(file: BoneFile, name: string): number {
  return (file.slots ?? []).findIndex((s) => s.name === name);
}

/**
 * As seis linhas da ficha, na ordem do Spriter.
 *
 * Devolve `[]` quando não há um alvo só — a ficha some inteira, e o painel
 * abre direto no que ele já mostrava.
 */
/** As linhas de Inclinação X e Y de um osso, só as que não são zero — rodada 46, lote 5. */
function inclinacoes(file: BoneFile, i: number, at: (prop: string) => string): QuickField[] {
  const osso = (file.bones ?? [])[i] as { shearX?: number; shearY?: number } | undefined;
  const linhas: QuickField[] = [];
  for (const eixo of ['X', 'Y'] as const) {
    const valor = eixo === 'X' ? osso?.shearX : osso?.shearY;
    if (valor === undefined || valor === 0) continue;
    linhas.push(linha(`shear${eixo}`, `Inclinação ${eixo}`, 'numero', at(`shear${eixo}`), 0, 1,
      `Inclinação ${eixo}, em graus (°), de −90 a 90: entorta o osso e o que ele leva; 0° é reto`, '°'));
  }
  return linhas;
}

export function quickFields(file: BoneFile, subject: QuickSubject): QuickField[] {
  if (subject.kind === 'bone') {
    const i = boneIndex(file, subject.name);
    if (i < 0) return [];
    const at = (prop: string): string => pointerOf('bones', i, prop);
    // Rodada 43, lote 1: toda dica diz a unidade e o que o número quer dizer.
    return [
      linha('x', 'X', 'numero', at('x'), 0, 1, DICA_X_OSSO, 'px'),
      linha('y', 'Y', 'numero', at('y'), 0, 1, DICA_Y_OSSO, 'px'),
      linha('scaleX', 'Escala X', 'numero', at('scaleX'), 1, 0.01, dicaEscala('X'), '×'),
      linha('scaleY', 'Escala Y', 'numero', at('scaleY'), 1, 0.01, dicaEscala('Y'), '×'),
      linha('rotation', 'Ângulo', 'disco', at('rotation'), 0, 1, DICA_ANGULO, '°'),
      // Um OSSO não tem alfa: quem tem cor é o desenho. A linha fica vazia, com o
      // nome, e a dica explica — desvio 2 do lote 12.
      linha('alpha', 'Alfa', 'barra', null, 1, 0.01,
        'Alfa é do desenho, não do osso: escolha um desenho (slot) para mexer nele', '%'),
      // Rodada 46, lote 5 (doc `66`, §2.1): depois de inclinar com Alt, o número
      // não aparecia na ficha. Entra só quando não é zero: quem não inclina não vê.
      ...inclinacoes(file, i, at),
    ];
  }
  if (subject.kind === 'slot') {
    const i = slotIndex(file, subject.name);
    if (i < 0) return [];
    const desenho = attachmentPointer(file, subject.name);
    // Rodada 8d: a imagem com osso próprio guarda posição, giro e escala no
    // osso dela. A ficha lê e escreve ali — numa animação, a chave dele.
    const own = ownBoneOfSlot(file, subject.name);
    const ownIndex = own === null ? -1 : boneIndex(file, own);
    const anexo = desenho === null ? null : ownIndex >= 0 ? pointerOf('bones', ownIndex) : desenho;
    const cor = (n: number): string => pointerOf('slots', i, 'color', String(n));
    // Rodada 15: o emissor tem X, Y e Ângulo (§9.10 da extensão) e não tem
    // escala. A linha fica, apagada, dizendo por quê.
    const emissor = isEmitterSlot(file, subject.name);
    const escala = (eixo: 'scaleX' | 'scaleY'): string | null => (anexo === null || emissor ? null : `${anexo}/${eixo}`);
    const campos = [
      // Rodada 38, lote 4b (doc 33): o emissor diz a unidade e a faixa.
      linha('x', 'X', 'numero', anexo === null ? null : `${anexo}/x`, 0, 1,
        anexo === null ? 'Este desenho (slot) não tem imagem na skin aberta'
          : emissor ? 'Onde o emissor está no osso, em px, qualquer número: positivo vai para a direita' : DICA_X_DESENHO, 'px'),
      linha('y', 'Y', 'numero', anexo === null ? null : `${anexo}/y`, 0, 1,
        anexo === null ? 'Este desenho (slot) não tem imagem na skin aberta'
          : emissor ? 'Onde o emissor está no osso, em px, qualquer número: positivo vai para cima' : DICA_Y_DESENHO, 'px'),
      linha('scaleX', 'Escala X', 'numero', escala('scaleX'), 1, 0.01,
        emissor ? 'O emissor não tem escala (×): o tamanho das partículas é "Tamanho", em Propriedades' : dicaEscala('X'), '×'),
      linha('scaleY', 'Escala Y', 'numero', escala('scaleY'), 1, 0.01,
        emissor ? 'O emissor não tem escala (×): o tamanho das partículas é "Tamanho", em Propriedades' : dicaEscala('Y'), '×'),
      linha('rotation', 'Ângulo', 'disco', anexo === null ? null : `${anexo}/rotation`, 0, 1,
        emissor ? 'Giro do emissor, em graus, de 0 a 360 (°; negativo gira ao contrário): gira a Direção e a forma juntas. Arraste o disco, ou digite'
          : DICA_ANGULO, '°'),
      // O alfa do slot é o quarto número de `color` (§4.3).
      linha('alpha', 'Alfa', 'barra', cor(3), 1, 0.01,
        'Quanto o desenho aparece, em %, de 0 a 100: 0 é invisível, 100 é inteiro', '%'),
    ];
    // Rodada 13: com osso próprio, os números são os DA IMAGEM.
    if (ownIndex >= 0 && desenho !== null) {
      for (const campo of campos) if (IMAGE_PROPS.has(campo.key) && campo.pointer !== null) campo.image = desenho;
    }
    // Rodada 43, lote 1 (doc `51`, foto 27): a MALHA não tem X, Y, giro nem
    // escala no formato — quem a move é o osso, ou os vértices. A linha aceitava
    // 50, o rodapé ficava mudo e a cena não mudava: um campo que finge
    // funcionar (regra 21). Some. Com osso próprio, os números são do osso, e ficam.
    if (ownIndex < 0 && desenho !== null && isMeshAt(file, desenho)) {
      return campos.filter((campo) => !MESH_HAS_NO.has(campo.key));
    }
    return campos;
  }
  return [];
}

function linha(
  key: string, label: string, control: QuickControl, pointer: string | null,
  fallback: number, step: number, hint: string, unit: QuickUnit,
): QuickField {
  return { key, label, control, pointer, fallback, step, hint, unit };
}

// As dicas, com a unidade — rodada 43, lote 1. Uma frase inteira, porque a
// ficha mostra só "X" e "px": o resto mora aqui.
// Rodada 47, lote 5 (nota 4 do doc 85): a faixa "de X a Y" em toda dica (+∞ no que não tem fim).
const DICA_X_OSSO = 'Posição X, em px, de −∞ a +∞, no espaço do osso pai: positivo vai para a direita';
const DICA_Y_OSSO = 'Posição Y, em px, de −∞ a +∞, no espaço do osso pai: positivo vai para cima';
const DICA_X_DESENHO = 'Posição X do desenho no osso, em px, de −∞ a +∞: positivo vai para a direita';
const DICA_Y_DESENHO = 'Posição Y do desenho no osso, em px, de −∞ a +∞: positivo vai para cima';
const DICA_ANGULO = 'Ângulo, em graus (°), de −∞ a +∞ (360° é uma volta), contra o relógio: 0° aponta para a direita, 90° para cima. '
  + 'Arraste o disco ou o rótulo, ou digite (aceita conta: 90+15). '
  + 'Quando o giro no mundo é outro (os pais giram), ele aparece ao lado, em cinza';
function dicaEscala(eixo: 'X' | 'Y'): string {
  return `Escala ${eixo}, em × (vezes), de −∞ a +∞: 1 é o tamanho de montar, 2 o dobro, 0,5 a metade; negativo espelha`;
}

/** O que a malha não tem no formato (§5.3): ela segue o osso e os vértices. */
const MESH_HAS_NO: ReadonlySet<string> = new Set(['x', 'y', 'scaleX', 'scaleY', 'rotation']);

/** `true` quando o anexo naquele ponteiro é uma malha (ou malha ligada). */
function isMeshAt(file: BoneFile, pointer: string): boolean {
  const def = getAtPointer(file as unknown as Record<string, unknown>, pointer) as { type?: unknown } | undefined;
  return def?.type === 'mesh' || def?.type === 'linkedmesh';
}

/**
 * O ponteiro do anexo que o slot mostra agora, ou `null`.
 *
 * Procura na PRIMEIRA pele que tenha o slot, começando pela `default`: é a
 * mesma ordem que o painel Propriedades já usa, e é a que corresponde ao que
 * está desenhado na cena na maioria dos casos.
 */
export function attachmentPointer(file: BoneFile, slotName: string): string | null {
  const i = slotIndex(file, slotName);
  if (i < 0) return null;
  const slot = (file.slots ?? [])[i];
  const querido = slot?.attachment;
  if (querido === undefined || querido === '') return null;
  const skins = file.skins ?? [];
  for (let s = 0; s < skins.length; s++) {
    const porSlot = skins[s]?.attachments?.[slotName];
    if (porSlot === undefined) continue;
    const anexo = porSlot[querido];
    if (anexo === undefined || anexo === null) continue;
    return pointerOf('skins', s, 'attachments', slotName, querido);
  }
  return null;
}

// ---------------------------------------------------------------------------
// Os dois controles novos
// ---------------------------------------------------------------------------

/**
 * O ângulo que o disco mostra, a partir de onde o dedo está.
 *
 * Graus, com **Y para cima**, que é a convenção do formato (§4.2): direita 0,
 * cima 90, esquerda 180, baixo −90. A tela cresce para baixo, e por isso quem
 * chama já entrega `py` no espaço do mundo — o disco não sabe o que é tela.
 */
export function angleFromDial(cx: number, cy: number, px: number, py: number): number {
  const dx = px - cx;
  const dy = py - cy;
  if (dx === 0 && dy === 0) return 0;
  const graus = (Math.atan2(dy, dx) * 180) / Math.PI;
  // −180 e 180 são o mesmo ângulo; o formato escreve 180.
  const limpo = Math.round(graus * 1e6) / 1e6;
  return limpo === -180 ? 180 : limpo;
}

/** Onde a agulha do disco fica, para um ângulo. Devolve o ponto na borda. */
export function dialPoint(angle: number, radius: number): { x: number; y: number } {
  const rad = (angle * Math.PI) / 180;
  return { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius };
}

/**
 * O alfa que a barra quer dizer: 0 a 100 na barra, 0 a 1 no arquivo.
 *
 * Preso em `[0, 1]`: uma barra que devolvesse 1,5 gravaria no arquivo um alfa
 * que o formato não tem, e nenhum runtime saberia o que fazer com ele.
 */
export function alphaFromSlider(value: number): number {
  if (!Number.isFinite(value)) return 1;
  const preso = Math.min(100, Math.max(0, value));
  return Math.round(preso) / 100;
}

/**
 * O valor que está no arquivo naquele ponteiro, ou o padrão do formato.
 *
 * O formato **omite** o que é igual ao padrão: um osso sem `scaleX` escrito
 * tem escala 1. Ler `undefined` como zero encolheria o personagem no primeiro
 * clique da ficha.
 */
export function readQuickValue(file: BoneFile, field: QuickField): number {
  if (field.pointer === null) return field.fallback;
  const lido = getAtPointer(file as unknown as Record<string, unknown>, field.pointer);
  return typeof lido === 'number' && Number.isFinite(lido) ? lido : field.fallback;
}

/**
 * A linha de chave de um campo da ficha, ou `null` quando ele não se anima.
 *
 * É o MESMO `targetForPointer` que a gravação usa (`writeFieldValue`): ler e
 * gravar acham a mesma linha, e não há duas contas. O alfa é o quarto número
 * de `color` do slot — a linha é a da cor inteira, e `component` diz qual.
 */
export function quickTarget(
  file: BoneFile, field: QuickField,
): { target: TimelineTarget; component: number | null } | null {
  if (field.pointer === null) return null;
  const cor = /^(\/slots\/\d+\/color)\/3$/.exec(field.pointer);
  if (cor !== null) {
    const target = targetForPointer(file, cor[1]!);
    return target === null ? null : { target, component: 3 };
  }
  const target = targetForPointer(file, field.pointer);
  return target === null ? null : { target, component: null };
}

/** O que a ficha mostra num campo: o valor do quadro, e o da base ao lado. */
export interface QuickReading {
  /** O valor no quadro da agulha — o que se vê na cena. Sem animação, a base. */
  frame: number;
  /** O valor da base (a pose de montar). */
  base: number;
  /** `true` quando há animação aberta e o campo se anima: a base vale a pena mostrar. */
  animated: boolean;
}

/**
 * **O valor do quadro** — defeito K8, decisão P24 (29/09/2026).
 *
 * A ficha *escrevia no quadro e mostrava a base*: em 0,50 s o Humberto digitou
 * Ângulo −55, a perna mexeu, e o campo continuou −95. A leitura ia sempre ao
 * ponteiro da base, e a gravação, com animação aberta, cria chave.
 *
 * Agora a leitura segue a gravação: com animação aberta, o valor vem de
 * `currentValueOf` (a chave, ou a curva entre duas chaves, ou a base quando a
 * linha não tem chave). Sem animação, é a base, como sempre. É o que o Spine
 * faz: os campos numéricos seguem o quadro onde se está.
 */
export function readQuickNow(doc: EditorDoc, field: QuickField): QuickReading {
  const file = corpoDe(doc).file;
  // Rodada 13: a imagem com osso próprio — o número da IMAGEM, composto.
  if (field.image !== undefined && IMAGE_PROPS.has(field.key)) {
    const slot = parsePointer(field.image)[3] ?? '';
    const quadro = imageNow(doc, slot, field.image, false);
    const base = imageNow(doc, slot, field.image, true);
    if (quadro !== null && base !== null) {
      const k = field.key as ImageProp;
      return { frame: quadro[k], base: base[k], animated: doc.animation !== null };
    }
  }
  const base = readQuickValue(file, field);
  if (doc.animation === null) return { frame: base, base, animated: false };
  const alvo = quickTarget(file, field);
  if (alvo === null) return { frame: base, base, animated: false };
  const valor = currentValueOf(doc, alvo.target);
  const numero = alvo.component === null
    ? valor
    : Array.isArray(valor) ? (valor as readonly unknown[])[alvo.component] : undefined;
  const frame = typeof numero === 'number' && Number.isFinite(numero) ? numero : base;
  return { frame, base, animated: true };
}

/**
 * **Grava um campo da ficha** — pelo mesmo caminho do painel de baixo, com uma
 * exceção que o K8 achou: o **alfa com animação aberta**.
 *
 * O alfa mora em `…/color/3`, e a linha de chave é a da cor inteira. Mandado
 * direto, o ponteiro de quatro partes não achava linha nenhuma e a gravação ia
 * para a BASE — mexer, com animação aberta, não gravava chave. Aqui a cor do
 * quadro é lida, só o quarto número muda, e a cor inteira vira a chave.
 */
export function writeQuickValue(doc: EditorDoc, field: QuickField, valor: number): 'recusado' | null {
  if (field.pointer === null) return null;
  // Rodada 13: a imagem com osso próprio — a ficha mostra e grava os números
  // DA IMAGEM, e o osso recebe o que a põe ali (`image-key.ts`). Sem osso
  // próprio, numa animação, quem cria o osso e a chave é o `writeFieldValue`.
  if (field.image !== undefined && IMAGE_PROPS.has(field.key)) {
    const shown = readQuickNow(doc, field).frame;
    const feito = writeImageValue(doc, field.image, field.key as ImageProp, valor, shown, field.label);
    if (feito !== undefined) return feito;
  }
  const alvo = doc.animation === null ? null : quickTarget(corpoDe(doc).file, field);
  if (alvo !== null && alvo.component !== null) {
    const atual = currentValueOf(doc, alvo.target);
    const cor = Array.isArray(atual) ? [...(atual as number[])] : [1, 1, 1, 1];
    cor[alvo.component] = valor;
    const inteira: FieldDef = {
      key: field.key, label: field.label, kind: 'color',
      pointer: field.pointer.replace(/\/\d+$/, ''), fallback: [1, 1, 1, 1], changeKind: 'structure',
    };
    return writeFieldValue(doc, inteira, cor);
  }
  const como: FieldDef = {
    key: field.key, label: field.label, kind: 'number', pointer: field.pointer,
    fallback: field.fallback, step: field.step, changeKind: 'structure',
  };
  // J9 (rodada 3, 04/10/2026): era `transform`. Com a base aberta o comando
  // escreve SÓ no arquivo, e um `transform` só repõe a pose — lida dos dados já
  // carregados, com o número velho: o campo dizia 90 e o osso ficava onde
  // estava. `structure` relê o arquivo, como o campo de baixo sempre fez.
  // `writeFieldValue` é quem decide entre gravar no arquivo e criar uma
  // CHAVE: com animação aberta, a ficha chaveia como o campo de baixo chaveia.
  return writeFieldValue(doc, como, valor);
}

/**
 * **O giro de um osso no mundo**, só para ler — rodada 43, lote 2 (doc `51`,
 * T5; suposição S2). A ficha grava o giro LOCAL; o Spine troca o número mostrado
 * com Local/Pai/Mundo. Aqui o local continua no campo, e o do mundo vai ao lado,
 * em cinza: é o que responde "quanto gira" sem somar os pais de cabeça.
 *
 * Vem da pose de agora (`doc.skeleton`), na convenção do formato: Y para cima,
 * contra o relógio. `null` quando o osso não existe.
 */
export function worldAngleOf(doc: EditorDoc, bone: string): number | null {
  const osso = corpoDe(doc).skeleton?.findBone(bone) as { a: number; c: number } | null | undefined;
  if (osso === null || osso === undefined) return null;
  const graus = (Math.atan2(osso.c, osso.a) * 180) / Math.PI;
  return Math.round(graus * 100) / 100 + 0;
}

/**
 * O giro no mundo de um campo Ângulo da ficha: o do osso, ou o do osso do
 * desenho mais o giro do desenho. `null` quando o campo não é de giro.
 */
export function worldAngleOfField(doc: EditorDoc, field: QuickField): number | null {
  if (field.key !== 'rotation' || field.pointer === null) return null;
  const file = corpoDe(doc).file;
  const doOsso = /^\/bones\/(\d+)\/rotation$/.exec(field.pointer);
  if (doOsso !== null && field.image === undefined) {
    const nome = (file.bones ?? [])[Number(doOsso[1])]?.name;
    return nome === undefined ? null : worldAngleOf(doc, nome);
  }
  const doDesenho = /^\/skins\/\d+\/attachments\/([^/]+)\//.exec(field.image ?? field.pointer);
  if (doDesenho === null) return null;
  const slot = (file.slots ?? []).find((s) => s.name === doDesenho[1]!.replace(/~1/g, '/').replace(/~0/g, '~'));
  if (slot === undefined) return null;
  const doBone = worldAngleOf(doc, slot.bone);
  if (doBone === null) return null;
  const proprio = field.image === undefined ? readQuickNow(doc, field).frame : 0;
  const soma = doBone + proprio;
  const limpo = ((soma + 180) % 360 + 360) % 360 - 180;
  return Math.round((limpo === -180 ? 180 : limpo) * 100) / 100 + 0;
}

/**
 * O número como ele aparece na ficha.
 *
 * Vírgula, e no máximo duas casas: a ficha é uma coluna estreita, e
 * `0.30000000000000004` não cabe nem se lê.
 */
export function formatQuick(value: number): string {
  if (!Number.isFinite(value)) return '0';
  const arredondado = Math.round(value * 100) / 100;
  return String(arredondado).replace('.', ',');
}

/** O caminho de volta: onde a barra fica para um alfa desses. */
export function sliderFromAlpha(alpha: number): number {
  if (!Number.isFinite(alpha)) return 100;
  return Math.min(100, Math.max(0, Math.round(alpha * 100)));
}

/** Qual parte do osso cada número do arquivo mexe. */
const GRIP_OF_PROPERTY: Readonly<Record<string, Grip>> = {
  x: 'position', y: 'position', rotation: 'rotation',
  scaleX: 'scale', scaleY: 'scale', shearX: 'shear', shearY: 'shear',
};

/**
 * J9 (rodada 3, 04/10/2026): o número foi gravado, e uma **regra** o desfez na
 * tela — no herói, o `ik_arm` manda no giro do `arm`. O rodapé dizia só
 * "Mudar Ângulo", e o osso não se mexia. É o recado que a cena já dava ao
 * gesto de girar (F3, L10, L11: `viewport/held-by-rule.ts`), agora também para
 * quem digita, na ficha rápida e na ficha de baixo.
 *
 * Mede, não adivinha: compara o número pedido com o que a pose aplicou. Devolve
 * a frase, ou `null` quando o ponteiro não é de osso ou nada desfez.
 */
export function heldByRuleAfterWrite(
  doc: EditorDoc, pointer: string | null,
  /**
   * Rodada 43, lote 4 (doc 62, d): `false` é a dica de um campo que ninguém
   * mexeu agora — sem o "Ficou na base: Ctrl+Z desfaz", que é recado de gravação.
   */
  depoisDeGravar = true,
): string | null {
  if (pointer === null) return null;
  const m = /^\/bones\/(\d+)\/([A-Za-z]+)$/.exec(pointer);
  if (m === null) return null;
  const grip = GRIP_OF_PROPERTY[m[2]!];
  if (grip === undefined) return null;
  const file = corpoDe(doc).file;
  const name = (file.bones ?? [])[Number(m[1])]?.name;
  const bone = name === undefined ? null : doc.skeleton?.findBone(name) ?? null;
  if (name === undefined || bone === null) return null;
  if (!drifted(bone as unknown as BoneNumbers, grip)) return null;
  const rules = rulesOn(file, name);
  return rules.length === 0 ? null : heldNotice(name, rules, grip, depoisDeGravar && doc.animation === null);
}

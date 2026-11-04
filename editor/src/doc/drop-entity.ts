/**
 * **Pendurar cria tomada** — E9, spec 7.11; degrau 7, tarefa 7.2.
 *
 * O Humberto, na palavra dele: *"pendurar cria tomada"*. Soltar uma entidade
 * num osso faz o mesmo que soltar uma imagem (lote 57): nasce um slot naquele
 * osso, e dentro dele um anexo — só que o anexo é um `skeleton` (7.11) em vez
 * de uma `region`. A tomada é o slot; o pino é o `x, y` do anexo.
 *
 * **A entidade segue a imagem** (§7.11, E5). Não há socket: o anexo ocupa o
 * mesmo placeholder que uma imagem ocuparia, no mesmo slot, com o mesmo
 * `x, y, rotation, scaleX, scaleY`. Por isso este comando é gêmeo do
 * `DropImageAsSlot` do painel Imagens, e de propósito: dois caminhos diferentes
 * para a mesma coisa seria um deles envelhecer sozinho.
 *
 * **Com uma animação aberta** a entidade entra NESTA animação, a partir de
 * agora — chave `slot/attachment` em `t`, e `null` em 0 —, como a imagem faz
 * desde o lote 57. Com a base aberta, entra na base e aparece em tudo.
 */

import { uniqueName } from '../contract.js';
import type { ChangeKind, Command, EditorDoc } from '../contract.js';
import type { Bone, BoneFile, Skeleton, SkeletonData, SkinDef, SlotDef } from '../../../runtime/src/index.js';
import { setKey } from '../anim/keying.js';
import { isOwnBone } from './own-bone.js';

/** O tipo de arrasto que o painel Entidades põe no `dataTransfer`. */
export const ENTITY_DRAG_TYPE = 'text/x-recorte-entidade';

/** Onde e quando a entidade solta com uma animação aberta aparece. */
export interface EntityAppearAt {
  readonly animation: string;
  readonly time: number;
}

/** O nome do slot a partir do uri: `personagens/espada.bone` vira `espada`. */
export function entityNameFor(uri: string): string {
  const file = uri.split(/[\/]/).pop() ?? uri;
  const sem = file.replace(/\.(bone|boneb|bonez)$/i, '');
  return sem.length > 0 ? sem : 'entidade';
}

/** As chaves de `attachment` que fazem a entidade aparecer em `t`. */
export function entityAppearKeys(t: number, name: string): Array<{ time: number; value: string | null }> {
  return t <= 0 ? [{ time: 0, value: name }] : [{ time: 0, value: null }, { time: t, value: name }];
}

/**
 * **O que a entidade solta toca** — rodada 23, defeito 6.
 *
 * A forma: *"a cópia nova nascia sem animação"*. O anexo não escrevia
 * `animation`, e o filho ficava na pose de montar: mexer a `idle` da espada
 * por dentro girava a da mão (que toca `idle`) e não a solta no antebraço,
 * que não tocava nada. Ela nasce tocando a **primeira animação** do filho, como
 * a espada do herói de exemplo e como o DragonBones faz com a armadura filha
 * (toca a animação padrão dela). `null` quando o filho não está aberto ou não
 * tem animação: aí o rodapé diz que ela fica parada (regra 21).
 */
export function firstAnimationOf(skeletons: ReadonlyMap<string, SkeletonData>, uri: string): string | null {
  return skeletons.get(uri)?.animations[0]?.name ?? null;
}

/** O rodapé depois de pendurar uma entidade. */
export function entityDropNotice(
  name: string, bone: string, appear: EntityAppearAt | null, plays: string | null | undefined = undefined,
): string {
  // `undefined` = quem chama não disse (a frase de antes); `null` = não toca nada.
  const toca = plays === undefined ? ''
    : plays === null ? ' Ela fica parada na pose de montar: o que ela toca se escolhe no botão direito da faixa.'
      : ` Ela toca ${plays}.`;
  if (appear === null) {
    return `"${name}" virou uma tomada no osso ${bone}: a entidade inteira entra nela, com as animações dela.${toca}`.replace(/\.$/, '');
  }
  const quando = `${Math.max(0, appear.time).toFixed(2).replace('.', ',')} s`;
  return `"${name}" virou uma tomada no osso ${bone} e entra nesta animação a partir de ${quando}. `
    + `A base e as outras animações ficam sem ela.${toca}`.replace(/\.$/, '');
}

/** Onde a entidade solta fica: o osso, o ponto no espaço dele e o giro. */
export interface EntityDropPlace {
  readonly bone: string;
  readonly x: number;
  readonly y: number;
  /** O giro do anexo que deixa a entidade de pé como ela foi solta. */
  readonly rotation: number;
}

/** Distância do ponto ao segmento `a`–`b`. */
function distanceToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const vx = bx - ax;
  const vy = by - ay;
  const len2 = vx * vx + vy * vy;
  const t = len2 <= 1e-9 ? 0 : Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / len2));
  return Math.hypot(px - (ax + vx * t), py - (ay + vy * t));
}

/**
 * **A entidade cai onde foi solta, presa ao osso mais perto** — rodada 8b, A2.
 *
 * A imagem nasce na raiz, livre (lote 60: primeiro a arte, depois os ossos).
 * A entidade não: ela já vem montada e animada, e quem a solta na mão do herói
 * quer que ela ande com a mão. O osso é o de corpo (da origem à ponta) mais
 * perto do ponto, como a cena mede o clique no osso. O osso próprio de uma
 * imagem (rodada 8d) fica de fora: ele é da imagem, não de quem solta.
 *
 * O ponto vira ponto do osso, e o giro do anexo desfaz o giro do osso: a
 * entidade aparece **de pé, onde foi solta**, como na miniatura que se arrastou.
 */
export function entityDropPlace(
  skeleton: Skeleton | null, file: BoneFile, worldX: number, worldY: number,
): EntityDropPlace {
  const root = file.bones?.[0]?.name ?? 'root';
  if (skeleton === null) return { bone: root, x: worldX, y: worldY, rotation: 0 };
  let best: Bone | null = null;
  let bestDistance = Infinity;
  for (const bone of skeleton.bones) {
    if (isOwnBone(file, bone.data.name)) continue;
    const tip = bone.localToWorld(bone.data.length, 0);
    const d = distanceToSegment(worldX, worldY, bone.worldX, bone.worldY, tip.x, tip.y);
    if (d < bestDistance - 1e-9) { best = bone; bestDistance = d; }
  }
  if (best === null) return { bone: root, x: worldX, y: worldY, rotation: 0 };
  const local = best.worldToLocal(worldX, worldY);
  const rotation = -best.worldRotationX;
  return {
    bone: best.data.name,
    x: local.x,
    y: local.y,
    rotation: Math.abs(rotation) < 1e-6 ? 0 : rotation,
  };
}

/** A pele em que o anexo novo nasce: a primeira visível, ou a `default`. */
function skinForNew(file: BoneFile, visibleSkins: readonly string[]): string {
  const first = visibleSkins[0];
  if (typeof first === 'string' && first.length > 0) return first;
  return 'default';
}

function round(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

/**
 * Cria o slot e o anexo `skeleton` no osso, num passo de desfazer.
 *
 * O que é guardado para o `revert`: o slot criado, se a pele e o mapa do slot
 * nasceram aqui, e o JSON da animação de antes quando houve chave. Nada é
 * reconstruído de memória na volta.
 */
export class DropEntityAsSlot implements Command {
  readonly label: string;
  readonly kind: ChangeKind = 'structure';
  /** O nome do slot criado, para quem chamou escolher o que acabou de nascer. */
  readonly name: string;
  readonly skin: string;

  /**
   * O slot nasceu aqui — defeito 1 (19/09/2026), a varredura da forma.
   *
   * Era o **objeto** do slot, e o `revert` o procurava com `indexOf`. Quem
   * repõe a lista de slots com cópias (`doc/duplicate.ts`,
   * `panels/draw-order-model.ts`) mata a referência, e o slot fica no arquivo
   * com a pilha vazia. Um `boolean` e o nome bastam, e não há referência a
   * morrer: a forma some em vez de ser consertada.
   */
  private madeSlot = false;
  private madeSkin = false;
  private madeSlotMap = false;
  private savedAnimation: { index: number; json: string } | null = null;

  constructor(
    file: BoneFile,
    private readonly uri: string,
    private readonly bone: string,
    visibleSkins: readonly string[],
    private readonly x: number,
    private readonly y: number,
    private readonly appear: EntityAppearAt | null = null,
    /** O giro do anexo (A2): de pé no mundo, mesmo num osso girado. */
    private readonly rotation = 0,
    /** O que o filho toca ao nascer (rodada 23): `firstAnimationOf`. `null` = nada. */
    private readonly plays: string | null = null,
  ) {
    this.name = uniqueName(entityNameFor(uri), (file.slots ?? []).map((s) => s.name));
    this.skin = skinForNew(file, visibleSkins);
    this.label = appear === null ? 'Pendurar entidade' : 'Pendurar entidade nesta animação';
  }

  apply(doc: EditorDoc): void {
    const file = doc.file;
    const skins = file.skins ?? (file.skins = []);
    this.madeSkin = !skins.some((skin) => skin.name === this.skin);
    let skin = skins.find((s) => s.name === this.skin);
    if (skin === undefined) {
      skin = { name: this.skin, attachments: {} } as SkinDef;
      skins.push(skin);
    }
    const attachments = skin.attachments ?? (skin.attachments = {});
    this.madeSlotMap = attachments[this.name] === undefined;
    // `x, y` é o **pino** de 7.11: a raiz do filho cai onde a entidade foi
    // solta, que é o mesmo par que a imagem do placeholder teria (E7).
    attachments[this.name] = {
      [this.name]: {
        type: 'skeleton',
        uri: this.uri,
        x: round(this.x),
        y: round(this.y),
        ...(this.rotation === 0 ? {} : { rotation: round(this.rotation) }),
        ...(this.plays === null ? {} : { animation: this.plays }),
      },
    } as never;

    const slots = file.slots ?? (file.slots = []);
    const slot: SlotDef = this.appear === null
      ? { name: this.name, bone: this.bone, attachment: this.name }
      : { name: this.name, bone: this.bone };
    this.madeSlot = true;
    // No FIM da ordem de desenho, como a imagem: quem pendura quer ver.
    slots.push(slot);

    const appear = this.appear;
    const index = appear === null ? -1
      : (file.animations ?? []).findIndex((a) => a.name === appear.animation);
    if (appear !== null && index >= 0) {
      this.savedAnimation = { index, json: JSON.stringify(file.animations![index]) };
      const target = { type: 'slot', target: this.name, property: 'attachment' } as const;
      for (const key of entityAppearKeys(appear.time, this.name)) {
        setKey(file, appear.animation, key.time, target as never, key.value as never);
      }
    }
  }

  revert(doc: EditorDoc): void {
    const file = doc.file;
    if (this.savedAnimation !== null && file.animations !== undefined) {
      file.animations[this.savedAnimation.index] = JSON.parse(this.savedAnimation.json) as never;
      this.savedAnimation = null;
    }
    const slots = file.slots ?? [];
    if (this.madeSlot) {
      const at = slots.findIndex((s) => s.name === this.name);
      if (at >= 0) slots.splice(at, 1);
      this.madeSlot = false;
    }
    const skins = file.skins ?? [];
    const skinIndex = skins.findIndex((s) => s.name === this.skin);
    if (skinIndex < 0) return;
    if (this.madeSkin) {
      skins.splice(skinIndex, 1);
      this.madeSkin = false;
      return;
    }
    const attachments = skins[skinIndex]!.attachments;
    if (this.madeSlotMap && attachments !== undefined) {
      delete attachments[this.name];
      this.madeSlotMap = false;
    }
  }
}

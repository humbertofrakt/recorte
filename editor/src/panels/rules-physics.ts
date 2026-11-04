/**
 * **A física na tela** (dono C) — degrau 12, porta D6 (18/09/2026).
 *
 * A regra `physics` já estava **completa** no editor: cria pela janela guiada,
 * catorze campos em Propriedades, alças de vento e gravidade na cena. E ela
 * **simula sempre**. Faltavam os três gestos que o formato prevê e a tela não
 * oferecia:
 *
 * | Gesto | O que é | Onde está no formato |
 * |:---|:---|:---|
 * | **Simular** | o interruptor: parar de simular para posar em paz | — é da tela; nenhum campo novo |
 * | **Reiniciar** | zerar o estado acumulado, desta regra ou de todas | §6.5 `physicsReset`, §9.8 a chave `reset` |
 * | **Assar em chaves** | trocar a simulação por chaves `bone` comuns | §6.5: *"Pode ser convertida em chaves pelo editor (bake)"* |
 *
 * **Por que o assar existe, e por que ele é o item importante.** A §6.5 diz:
 * *"A física é a única simulação do formato. Um quadro dela depende dos
 * anteriores; é a exceção escrita do princípio 11. Arrastar a linha do tempo
 * para trás não devolve o mesmo cabelo."* Assar troca o estado por chaves — e
 * chave não tem estado. Depois de assado, `t = 0,9` dá o mesmo resultado
 * vindo de frente ou de trás, e é isso que o assado compra.
 *
 * Os três programas, antes de decidir a tela (regra do Humberto):
 *
 * | Programa | O que faz |
 * |:---|:---|
 * | **Spriter** | não tem física nenhuma |
 * | **DragonBones** | não tem constraint de física |
 * | **Spine** (4.2+) | de onde a §6.5 foi portada: tem o interruptor de física na barra de reprodução (com modos), tem o reiniciar, e tem "bake" de animação |
 *
 * Só o Spine tem a coisa, e a §6.5 é porte dele: a tela segue o Spine.
 *
 * O **vento no esqueleto inteiro** ("física Global") está **descartado** no
 * `ARQUITETO 2` — é API do jogo, não do editor. Não entra.
 *
 * Este arquivo mexe no esqueleto vivo (ligar e desligar a simulação, zerar o
 * estado) e por isso não é puro; o que decide — o plano do assado — é função
 * de ler, e tem teste sem navegador.
 */

import { PhysicsConstraint, type BoneFile } from '../../../runtime/src/index.js';
import type { ChangeKind, Command, EditorDoc } from '../contract.js';
import { prefs, setPrefs } from '../ui/prefs.js';

// ---------------------------------------------------------------------------
// Simular — o interruptor
// ---------------------------------------------------------------------------

/** `true` quando a física está simulando. É preferência de quem usa. */
export function physicsOn(): boolean {
  return prefs().physicsSim;
}

/**
 * Liga e desliga a simulação, e aplica na hora.
 *
 * Desligar é `active = false` em cada `PhysicsConstraint` **viva** — o campo
 * que o `skeleton.ts` consulta (`if (!c.active || c.mix === 0) continue`). Não
 * é `mix: 0`: `mix` mora no arquivo, e um interruptor de tela que sujasse o
 * `.bone` mandaria a escolha de quem edita junto com o personagem.
 */
export function setPhysicsOn(doc: EditorDoc, on: boolean): void {
  setPrefs({ physicsSim: on });
  // O vigia entra aqui, e não só no `mount` do painel: quem mexe no
  // interruptor tem de ficar com ele valendo, venha de onde vier — do botão,
  // do menu, ou de um teste. Um `rebuild` monta constraints novas, `active =
  // true`, e sem o vigia a física voltaria a simular sem uma palavra.
  watchPhysics(doc);
  if (!on) resetAllPhysics(doc, false);
  doc.repose();
}

/**
 * Põe o interruptor no esqueleto vivo. Barato, e idempotente.
 *
 * Tem de rodar de novo depois de toda mudança estrutural: um `rebuild` monta
 * constraints novas, e elas nascem `active = true`. É o que `watchPhysics`
 * garante — sem ele, acrescentar um osso religaria a física em silêncio, que é
 * exatamente o tipo de coisa que a regra 21 proíbe.
 */
export function applyPhysicsSwitch(doc: EditorDoc): void {
  const on = physicsOn();
  for (const c of doc.skeleton?.constraints ?? []) {
    if (c instanceof PhysicsConstraint) c.active = on;
  }
}

/** Os documentos que já têm o vigia, para não pôr dois no mesmo. */
const watched = new WeakSet<object>();

/**
 * Deixa um vigia no documento que reaplica o interruptor a cada mudança
 * estrutural.
 *
 * O vigia mora no **documento**, e não no painel: um painel some quando a aba
 * dele não está à vista, e um interruptor que para de valer quando se troca de
 * aba é um interruptor que mente. Nunca é removido — é um por documento, e um
 * documento vive o que o arquivo aberto viver.
 */
export function watchPhysics(doc: EditorDoc): void {
  applyPhysicsSwitch(doc);
  if (watched.has(doc)) return;
  watched.add(doc);
  doc.on((change) => {
    if (change.kind === 'structure' || change.kind === 'file') applyPhysicsSwitch(doc);
  });
}

// ---------------------------------------------------------------------------
// Reiniciar — §6.5 `physicsReset`
// ---------------------------------------------------------------------------

/** Zera o estado acumulado de **uma** regra. `false` quando ela não existe. */
export function resetOnePhysics(doc: EditorDoc, rule: string, repose = true): boolean {
  const c = liveConstraint(doc, rule);
  if (c === null) return false;
  c.reset();
  if (repose) doc.repose();
  return true;
}

/** Zera o estado de **todas** (§6.5 `physicsReset`). Devolve quantas zerou. */
export function resetAllPhysics(doc: EditorDoc, repose = true): number {
  let n = 0;
  for (const c of doc.skeleton?.constraints ?? []) {
    if (c instanceof PhysicsConstraint) { c.reset(); n++; }
  }
  if (repose) doc.repose();
  return n;
}

/** A constraint viva de uma regra `physics`, ou `null`. */
function liveConstraint(doc: EditorDoc, rule: string): PhysicsConstraint | null {
  for (const c of doc.skeleton?.constraints ?? []) {
    if (c instanceof PhysicsConstraint && c.data.name === rule) return c;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Assar em chaves — §6.5, decisão A7 do Humberto (17/09/2026)
// ---------------------------------------------------------------------------

/** As propriedades de osso que uma física pode escrever, e o campo que as liga. */
const BAKED: ReadonlyArray<{ property: string; switch: 'x' | 'y' | 'rotation' | 'scaleX' | 'shearX' }> = [
  { property: 'x', switch: 'x' },
  { property: 'y', switch: 'y' },
  { property: 'rotation', switch: 'rotation' },
  { property: 'scaleX', switch: 'scaleX' },
  { property: 'shearX', switch: 'shearX' },
];

/** Onde o valor aplicado de cada propriedade mora no osso vivo (§5.2). */
const APPLIED: Readonly<Record<string, 'ax' | 'ay' | 'arotation' | 'ascaleX' | 'ashearX'>> = {
  x: 'ax', y: 'ay', rotation: 'arotation', scaleX: 'ascaleX', shearX: 'ashearX',
};

/** Uma faixa assada: uma propriedade do osso, quadro a quadro. */
export interface BakedTrack {
  property: string;
  keys: Array<{ time: number; value: number }>;
}

/** O que o assado vai gravar. */
export interface BakePlan {
  rule: string;
  bone: string;
  animation: string;
  fps: number;
  /** Quantos quadros foram medidos, contando o zero. */
  frames: number;
  tracks: BakedTrack[];
}

/**
 * Anda a animação do começo ao fim e **mede** o que a física fez, quadro a
 * quadro. Devolve o plano, ou uma frase dizendo por que não dá.
 *
 * Anda **de `t = 0` para a frente**, um quadro de cada vez, que é a única
 * maneira honesta de medir uma simulação (§12.4 prova a física assim). Zera o
 * estado antes de começar: medir a partir de um cabelo já balançando daria um
 * assado diferente a cada vez que o botão fosse apertado.
 *
 * O valor medido é a pose **aplicada** (§5.2) — o que a animação pôs mais o
 * que a física somou. É o total, e é o que tem de aparecer depois que a
 * simulação se calar.
 */
export function planPhysicsBake(doc: EditorDoc, rule: string): BakePlan | string {
  const def = (doc.file.constraints ?? []).find((c) => c.name === rule);
  if (def === undefined || def.type !== 'physics') {
    return `"${rule}" não é uma regra de física.`;
  }
  const animation = doc.animation;
  if (animation === null) {
    return 'Abra a animação que você quer assar: o assado é dela, e não da base.';
  }
  const body = (doc.file.animations ?? []).find((a) => a.name === animation);
  if (body === undefined) return `A animação "${animation}" não está no arquivo.`;
  const duration = typeof body.duration === 'number' && body.duration > 0 ? body.duration : 0;
  if (duration === 0) return `A animação "${animation}" tem duração zero: não há o que assar.`;

  const bone = (def as { bone?: string }).bone ?? '';
  if (doc.skeleton?.findBone(bone) == null) {
    return `O osso "${bone}" não existe: conserte a regra antes de assar.`;
  }
  const quais = BAKED.filter(({ switch: s }) => {
    const v = (def as unknown as Record<string, unknown>)[s];
    return typeof v === 'number' && v > 0;
  });
  if (quais.length === 0) {
    return `A regra "${rule}" não escreve em nada (X, Y, rotação, escala e inclinação estão em zero).`;
  }

  const fps = frameRate(doc.file);
  const frames = Math.max(2, Math.round(duration * fps) + 1);
  const tracks: BakedTrack[] = quais.map(({ property }) => ({ property, keys: [] }));

  const tempoAntes = doc.time;
  const ligadoAntes = physicsOn();
  setPrefs({ physicsSim: true });
  applyPhysicsSwitch(doc);
  resetAllPhysics(doc, false);
  for (let i = 0; i < frames; i++) {
    const time = Math.min(duration, i / fps);
    doc.time = time;
    doc.repose();
    const vivo = doc.skeleton?.findBone(bone);
    if (vivo == null) break;
    for (const track of tracks) {
      const campo = APPLIED[track.property]!;
      track.keys.push({
        time: Math.round(time * 1e6) / 1e6,
        // Seis casas, como o resto do editor: um número que a tela mostra
        // como 12,345 e o arquivo grava como 12,3450000001 é um arquivo que
        // não bate com a tela.
        value: Math.round((vivo as unknown as Record<string, number>)[campo]! * 1e6) / 1e6,
      });
    }
  }
  setPrefs({ physicsSim: ligadoAntes });
  applyPhysicsSwitch(doc);
  doc.time = tempoAntes;
  doc.repose();

  return { rule, bone, animation, fps, frames, tracks };
}

/** Os quadros por segundo do esqueleto (§4.1), com o padrão do formato. */
function frameRate(file: BoneFile): number {
  const fps = (file.skeleton as { fps?: unknown } | undefined)?.fps;
  return typeof fps === 'number' && fps > 0 ? fps : 30;
}

/** Em uma frase: o que o assado vai fazer, para o rodapé dizer antes e depois. */
export function bakeNotice(plan: BakePlan): string {
  const quais = plan.tracks.map((t) => t.property).join(', ');
  return `"${plan.rule}" assada em ${plan.frames} chaves de "${plan.bone}" (${quais}), `
    + `a ${plan.fps} por segundo — a regra ficou desligada, e a animação agora toca para trás igual`;
}

/**
 * Grava o assado: as faixas viram timelines `bone` comuns, e a regra que as
 * gerou fica com `mix: 0`.
 *
 * **A regra é desligada, e não apagada.** Os catorze campos dela são o trabalho
 * de quem ajustou o balanço; apagar jogaria isso fora, e assar de novo depois
 * de mudar um quadro exigiria remontar tudo. Desligada, ela fica ali para
 * religar e reassar. Se ela continuasse ligada, o balanço entraria **duas
 * vezes** — uma pelas chaves e outra pela simulação.
 *
 * Guarda a animação inteira e a devolve no desfazer: é exato, letra por letra.
 */
export class BakePhysics implements Command {
  readonly label = 'Assar a física em chaves';
  readonly kind: ChangeKind = 'structure';
  private savedAnimation: string | null = null;
  private savedMix: unknown = undefined;
  private hadMix = false;

  constructor(private readonly plan: BakePlan) {}

  apply(doc: EditorDoc): void {
    const body = (doc.file.animations ?? []).find((a) => a.name === this.plan.animation) as
      { timelines?: unknown[] } | undefined;
    if (body === undefined) return;
    this.savedAnimation = JSON.stringify(body);

    body.timelines ??= [];
    for (const track of this.plan.tracks) {
      // A timeline velha daquele osso e daquela propriedade **sai**: duas
      // timelines do mesmo alvo é L1 (§9.1), e manter a velha embaixo faria o
      // assado depender de qual o leitor aplica por último.
      body.timelines = body.timelines.filter((tl) => {
        const t = tl as { type?: string; target?: string; property?: string };
        return !(t.type === 'bone' && t.target === this.plan.bone && t.property === track.property);
      });
      body.timelines.push({
        type: 'bone', target: this.plan.bone, property: track.property,
        keys: track.keys.map((k) => ({ time: k.time, value: k.value })),
      });
    }

    const def = (doc.file.constraints ?? []).find((c) => c.name === this.plan.rule) as
      { mix?: number } | undefined;
    if (def !== undefined) {
      this.hadMix = Object.prototype.hasOwnProperty.call(def, 'mix');
      this.savedMix = def.mix;
      def.mix = 0;
    }
  }

  revert(doc: EditorDoc): void {
    if (this.savedAnimation !== null) {
      const list = doc.file.animations ?? [];
      const at = list.findIndex((a) => a.name === this.plan.animation);
      if (at >= 0) list[at] = JSON.parse(this.savedAnimation);
    }
    const def = (doc.file.constraints ?? []).find((c) => c.name === this.plan.rule) as
      { mix?: number } | undefined;
    if (def === undefined) return;
    if (this.hadMix) def.mix = this.savedMix as number;
    else delete def.mix;
  }
}

// SPDX-License-Identifier: Apache-2.0
/**
 * O tocador do objeto Recorte (rodadas K2 e K4): um esqueleto, uma camada de
 * animação e a pilha de skins, com as palavras do Humberto — tocar, vestir
 * skin, tirar skin. Puro: o `instance.js` do addon só chama estes métodos; o
 * teste faz o mesmo no Node.
 *
 * A pilha é a da spec 4.4: de baixo para cima, a de cima vence. O boneco
 * começa com `default` embaixo. Vestir põe no topo (se já estava vestida, ela
 * SOBE para o topo: é a última vestida que vence, como no Spriter, onde o
 * Character Map aplicado por último vence). Tirar tira só aquela; as outras
 * ficam onde estavam. Skin que traz osso (7.1 `skinRequired`) faz o osso
 * aparecer e sumir com ela — o runtime faz isso sozinho pela pilha.
 *
 * A CONEXÃO (rodada K5; `08`, seção 4; `02`, seção 2): encaixar uma entidade
 * num slot, desencaixar, animar a peça, soltar a peça, encaixar todas. Por
 * dentro, os encaixes do jogo são UMA skin feita na hora, sempre no TOPO da
 * pilha, acima das que o jogo veste: nenhuma chave da animação a desfaz, e
 * nenhuma skin vestida depois a cobre. A entidade cai no pino da imagem que ela
 * substitui, herda a ordem e as chaves dela (se a chave esconde a imagem, a
 * peça some junto), e quando sai, a imagem de antes volta — porque a skin
 * simplesmente deixa de ter aquele slot.
 */

import { SkinData, type SkeletonData, type SlotData } from '../../runtime/src/data.js';
import { Skeleton } from '../../runtime/src/skeleton.js';
import { AnimationState, type TrackEntry } from '../../runtime/src/animation-state.js';
import { applyResets } from '../../runtime/src/animation.js';
import { SkeletonAttachment } from '../../runtime/src/attachments/skeleton-attachment.js';
import { joinUri } from '../../runtime/src/uri.js';
import { composeMatrix, multiplyMatrix, type Matrix2x3 } from '../../runtime/src/math.js';
import { Avisos } from './desenhador.js';

/**
 * O que aconteceu enquanto o boneco andava, para virar gatilho no Construct
 * (rodada K7): uma animação SEM laço chegou ao fim, ou a agulha passou por uma
 * chave de evento do `.bone` (spec 8.6). E, desde a K5, o jogo encaixou uma peça.
 */
export type Ocorrencia =
  | { readonly tipo: 'terminou'; readonly animacao: string }
  | {
    readonly tipo: 'evento'; readonly animacao: string; readonly nome: string;
    readonly inteiro: number; readonly numero: number; readonly texto: string;
  }
  /** O jogo encaixou `caminho` em `slot` (o gatilho "Ao encaixar": o limite é do jogo). */
  | { readonly tipo: 'encaixou'; readonly slot: string; readonly caminho: string };

/**
 * A propriedade "Skins iniciais" do objeto, lida: nomes separados por vírgula,
 * de baixo para cima, sem espaço nas pontas e sem vazio. `"armadura, capa"` →
 * `["armadura", "capa"]`.
 */
export function skinsDaPropriedade(texto: string): string[] {
  return texto.split(',').map((s) => s.trim()).filter((s) => s !== '');
}

/** Um encaixe pedido pelo jogo: a entidade e, quando é EM VOLTA, o slot do meio dela. */
export interface Encaixe {
  /** O arquivo da entidade, a partir da pasta *Files* (é também o nome dela). */
  readonly caminho: string;
  /** O slot da entidade que marca o meio (7.11 `around`), ou `null` = em bloco. */
  readonly emVolta: string | null;
}

/** A ordem do jogo para a peça de um slot ("Animar a peça", "Soltar a peça"). */
export interface Ordem {
  /** A animação da peça; `null` = nenhuma (soltar: a pose de repouso dela). */
  readonly animacao: string | null;
  readonly laco: boolean;
  /** Segundos desde a ordem, já com a velocidade do boneco. */
  relogio: number;
}

/** O nome da skin dos encaixes. Nunca aparece na pilha que o jogo vê. */
export const SKIN_DOS_ENCAIXES = '(encaixes do jogo)';

export class Tocador {
  readonly esqueleto: Skeleton;
  readonly estado = new AnimationState();
  readonly avisos: Avisos;
  /** `true`: o tempo do boneco não anda (a pose fica). */
  pausado = false;
  /**
   * A pasta do `.bone` dentro de *Files* (`""` = a raiz). A `uri` de uma
   * entidade do arquivo é relativa a ela; o jogo fala pelo caminho inteiro.
   */
  pasta = '';
  private readonly fila: Ocorrencia[] = [];
  /** As entidades que o jogo já carregou, por caminho. */
  private readonly entidades = new Map<string, SkeletonData>();
  /** slot → o que o jogo encaixou nele. */
  private readonly encaixes = new Map<string, Encaixe>();
  /** slot → a ordem do jogo para a peça dele. */
  private readonly ordens = new Map<string, Ordem>();
  /** A skin feita na hora, no topo da pilha; `null` sem nenhum encaixe. */
  private skinDosEncaixes: SkinData | null = null;
  /** A entrada da trilha 0 e o tempo dela no passo anterior, para os `reset` da física (9.8). */
  private ultimaEntrada: TrackEntry | null = null;
  private ultimoTempo = Number.NEGATIVE_INFINITY;

  constructor(dados: SkeletonData, avisos: Avisos = new Avisos()) {
    this.avisos = avisos;
    this.esqueleto = new Skeleton(dados);
    this.esqueleto.setToSetupPose();
    this.esqueleto.updateWorldTransform();
    this.estado.addListener({
      // "Terminou" só existe para quem não está em laço: o laço não termina,
      // ele dá a volta (é o "Ao terminar" do Sprite do Construct).
      complete: (entrada) => {
        if (!entrada.loop) this.fila.push({ tipo: 'terminou', animacao: entrada.animation.name });
      },
      event: (entrada, disparo) => {
        const k = disparo.key;
        this.fila.push({
          tipo: 'evento', animacao: entrada.animation.name, nome: k.event.name,
          inteiro: k.int, numero: k.float, texto: k.string,
        });
      },
    });
  }

  /** O que aconteceu desde a última chamada, na ordem; a fila fica vazia. */
  tirarOcorrencias(): Ocorrencia[] {
    return this.fila.splice(0, this.fila.length);
  }

  /** A velocidade da animação: 1 é a do editor, 2 é o dobro, 0,5 a metade. */
  get velocidade(): number {
    return this.estado.timeScale;
  }

  set velocidade(v: number) {
    if (!Number.isFinite(v) || v < 0) {
      this.avisos.avisar(`velocidade:${v}`, `Velocidade ${v} não serve (tem de ser um número de 0 para cima): fica ${this.estado.timeScale}.`);
      return;
    }
    this.estado.timeScale = v;
  }

  /** Está tocando `nome` agora? Uma animação sem laço que já chegou ao fim não está mais tocando. */
  estaTocando(nome: string): boolean {
    const atual = this.estado.getCurrent(0);
    return atual !== null && atual.animation.name === nome && !atual.isComplete;
  }

  /** Os nomes das animações do boneco, na ordem do arquivo. */
  get animacoes(): string[] {
    return this.esqueleto.data.animations.map((a) => a.name);
  }

  /**
   * Toca a animação `nome`, do começo, em laço ou não. Nome que o boneco não
   * tem: não troca nada, avisa (regra 21) e devolve `false`.
   */
  tocar(nome: string, emLaco: boolean): boolean {
    const anim = this.esqueleto.data.animations.find((a) => a.name === nome);
    if (anim === undefined) {
      const tem = this.animacoes.map((n) => `"${n}"`).join(', ') || 'nenhuma';
      this.avisos.avisar(`tocar:${nome}`, `O boneco não tem a animação "${nome}". Tem: ${tem}.`);
      return false;
    }
    this.estado.setAnimation(0, anim, emLaco, 0);
    this.estado.apply(this.esqueleto);
    this.aplicarOrdens();
    this.esqueleto.updateWorldTransform();
    return true;
  }

  /** O nome da animação que está tocando, ou `""` quando nenhuma. */
  get nomeTocando(): string {
    return this.estado.getCurrent(0)?.animation.name ?? '';
  }

  /** Se a animação que está tocando volta ao começo quando acaba. */
  get emLacoTocando(): boolean {
    return this.estado.getCurrent(0)?.loop ?? false;
  }

  /** As skins que o boneco tem, na ordem do arquivo (as de outro arquivo, no fim). */
  get skins(): string[] {
    return this.esqueleto.data.skins.map((k) => k.name);
  }

  /** A pilha vestida agora, de baixo para cima (a skin dos encaixes fica de fora: é do leitor). */
  get pilha(): string[] {
    return this.pilhaDoJogo().map((k) => k.name);
  }

  /** As skins que o jogo vestiu, sem a dos encaixes. */
  private pilhaDoJogo(): SkinData[] {
    return this.esqueleto.skinStack.filter((k) => k !== this.skinDosEncaixes);
  }

  /**
   * Veste a skin `nome`: ela vai para o topo da pilha e vence as de baixo.
   * Nome que o boneco não tem: não muda nada, avisa e devolve `false`.
   */
  vestir(nome: string): boolean {
    const skin = this.esqueleto.data.findSkin(nome);
    if (skin === null) {
      this.avisarSkin(nome);
      return false;
    }
    this.trocarPilha([...this.pilhaDoJogo().filter((k) => k !== skin), skin]);
    return true;
  }

  /**
   * Tira a skin `nome` da pilha. Se ela não estava vestida, nada muda (não é
   * erro: o jogo pode tirar por garantia). Nome que o boneco não tem: avisa.
   */
  tirar(nome: string): boolean {
    const skin = this.esqueleto.data.findSkin(nome);
    if (skin === null) {
      this.avisarSkin(nome);
      return false;
    }
    if (!this.pilhaDoJogo().includes(skin)) return true;
    this.trocarPilha(this.pilhaDoJogo().filter((k) => k !== skin));
    return true;
  }

  private avisarSkin(nome: string): void {
    const tem = this.skins.map((n) => `"${n}"`).join(', ') || 'nenhuma';
    this.avisos.avisar(`skin:${nome}`, `O boneco não tem a skin "${nome}". Tem: ${tem}.`);
  }

  /**
   * Troca a pilha do JOGO e repõe a pose do mesmo instante, para o desenho
   * seguinte já sair certo. A skin dos encaixes volta sempre por cima.
   */
  private trocarPilha(pilha: readonly SkinData[]): void {
    const comEncaixes = this.skinDosEncaixes === null ? pilha : [...pilha, this.skinDosEncaixes];
    this.esqueleto.setSkinStack(comEncaixes);
    this.reposar();
  }

  /** Repõe a pose do mesmo instante (depois de uma pilha ou de uma ordem nova). */
  private reposar(): void {
    this.esqueleto.setToSetupPose();
    if (this.estado.getCurrent(0) !== null) this.estado.apply(this.esqueleto);
    this.aplicarOrdens();
    this.esqueleto.updateWorldTransform();
  }

  /** Anda `dt` segundos: a animação, o relógio da física e a pose de mundo. */
  avancar(dt: number): void {
    const passo = !this.pausado && dt > 0 && Number.isFinite(dt) ? dt : 0;
    this.estado.update(passo);
    const atual = this.estado.getCurrent(0);
    if (atual === null) this.esqueleto.setToSetupPose();
    else this.estado.apply(this.esqueleto);
    this.soltarResets(atual);
    for (const ordem of this.ordens.values()) ordem.relogio += passo * this.estado.timeScale;
    this.aplicarOrdens();
    this.esqueleto.advance(passo);
  }

  /**
   * As chaves `reset` da física (9.8) que a agulha cruzou neste passo, em
   * `(antes, agora]`, como o `pose-dump` da conformidade faz: na primeira vez
   * de uma entrada, `antes` é -∞, e uma chave no tempo 0 dispara uma vez. O
   * `AnimationState` solta os eventos, mas não os `reset` (achado 2 da G6).
   */
  private soltarResets(atual: TrackEntry | null): void {
    if (atual === null) {
      this.ultimaEntrada = null;
      return;
    }
    const antes = atual === this.ultimaEntrada ? this.ultimoTempo : Number.NEGATIVE_INFINITY;
    applyResets(this.esqueleto, atual.animation, antes, atual.trackTime, atual.loop);
    this.ultimaEntrada = atual;
    this.ultimoTempo = atual.trackTime;
  }

  // -------------------------------------------------------------------------
  // A conexão (rodada K5)
  // -------------------------------------------------------------------------

  /** Guarda uma entidade que o jogo carregou da pasta *Files*. Carregar é do `instance.js` (assíncrono). */
  registrarEntidade(caminho: string, dados: SkeletonData): void {
    this.entidades.set(caminho, dados);
  }

  /** Já carregada? */
  temEntidade(caminho: string): boolean {
    return this.entidades.has(caminho);
  }

  /** As entidades carregadas pelo jogo, na ordem em que chegaram. */
  get entidadesCarregadas(): string[] {
    return [...this.entidades.keys()];
  }

  /** Os slots do boneco, na ordem do arquivo. */
  get slots(): string[] {
    return this.esqueleto.slots.map((s) => s.data.name);
  }

  /** Os encaixes feitos pelo jogo, por slot, na ordem em que foram feitos. */
  get encaixesDoJogo(): ReadonlyMap<string, Encaixe> {
    return this.encaixes;
  }

  /** As ordens do jogo para as peças, por slot. */
  get ordensDoJogo(): ReadonlyMap<string, Ordem> {
    return this.ordens;
  }

  /** O slot `nome`, ou `null` com aviso (regra 21). */
  private slotOuAviso(nome: string, gesto: string): SlotData | null {
    const slot = this.esqueleto.data.findSlot(nome);
    if (slot !== null) return slot;
    const tem = this.slots.map((n) => `"${n}"`).join(', ') || 'nenhum';
    this.avisos.avisar(`slot:${gesto}:${nome}`, `${gesto}: o boneco não tem o slot "${nome}". Tem: ${tem}.`);
    return null;
  }

  /**
   * ENCAIXAR: a entidade `caminho` no slot `slot`. Com `emVolta` (o "Este
   * boneco", 7.11 `around`), o nome do slot DA ENTIDADE que marca o meio: o que
   * ela tem antes dele vai para trás do boneco inteiro, o que tem depois vai
   * para a frente. Vazio: em bloco. Só aquele slot muda (as duas armas iguais).
   * O leitor não recusa encaixe: o limite é do jogo, pelo gatilho "Ao encaixar".
   */
  encaixar(slot: string, caminho: string, emVolta = ''): boolean {
    const dados = this.slotOuAviso(slot, `Encaixar "${caminho}"`);
    if (dados === null) return false;
    const entidade = this.entidades.get(caminho);
    if (entidade === undefined) {
      this.avisos.avisar(`entidade:${caminho}`,
        `Encaixar: a peça "${caminho}" não foi carregada (não está na pasta Files, ou não abriu). O slot "${slot}" ficou como estava.`);
      return false;
    }
    const meio = emVolta.trim() === '' ? null : emVolta.trim();
    if (meio !== null && entidade.findSlot(meio) === null) {
      this.avisos.avisar(`em-volta:${caminho}:${meio}`,
        `Encaixar em volta: a peça "${caminho}" não tem o slot "${meio}" para marcar o meio. Ela é desenhada em bloco (7.11).`);
    }
    if (this.nomesDoSlot(dados).length === 0) {
      this.avisos.avisar(`slot-vazio:${slot}`,
        `Encaixar: o slot "${slot}" nunca mostra imagem (nem no repouso, nem numa skin, nem numa chave). A peça "${caminho}" fica guardada nele, mas não aparece.`);
    }
    this.encaixes.delete(slot); // reencaixar põe o slot no fim da ordem dos encaixes
    this.encaixes.set(slot, { caminho, emVolta: meio });
    this.ordens.delete(slot); // peça nova: nenhuma ordem velha manda nela
    this.refazerEncaixes();
    this.fila.push({ tipo: 'encaixou', slot, caminho });
    return true;
  }

  /** DESENCAIXAR: tira o que o jogo encaixou no slot. A imagem de antes volta. */
  desencaixar(slot: string): boolean {
    if (this.slotOuAviso(slot, 'Desencaixar') === null) return false;
    const tinhaOrdem = this.ordens.delete(slot);
    if (!this.encaixes.delete(slot)) {
      if (tinhaOrdem) this.reposar();
      return true; // nada encaixado pelo jogo: não é erro
    }
    this.refazerEncaixes();
    return true;
  }

  /**
   * ENCAIXAR TODAS (as rodas): troca a entidade `de` pela `para` em TODO slot
   * que a mostra agora — os que o jogo encaixou e os que o arquivo traz.
   * Devolve quantos slots trocou; nenhum é aviso.
   */
  encaixarTodas(de: string, para: string, emVolta = ''): number {
    const alvos = this.esqueleto.slots.map((s) => s.data.name).filter((nome) => this.pecaDoSlot(nome) === de);
    if (alvos.length === 0 || de === '') {
      this.avisos.avisar(`todas:${de}`, `Encaixar todas: nenhum slot mostra a peça "${de}" agora. Nada mudou.`);
      return 0;
    }
    let n = 0;
    for (const nome of alvos) if (this.encaixar(nome, para, emVolta)) n++;
    return n;
  }

  /**
   * O que o slot mostra agora: o caminho da entidade (a partir de *Files*), o
   * nome da imagem, ou `""` quando nada.
   */
  pecaDoSlot(slot: string): string {
    if (this.slotOuAviso(slot, 'PecaDoSlot') === null) return '';
    const att = this.esqueleto.findSlot(slot)!.attachment;
    if (att === null) return '';
    if (att instanceof SkeletonAttachment) {
      const doJogo = this.encaixes.get(slot);
      return doJogo !== undefined ? doJogo.caminho : joinUri(this.pasta, att.resolvedUri);
    }
    return att.name;
  }

  /**
   * ANIMAR A PEÇA: a entidade do slot toca `animacao`, do começo, num relógio
   * dela (a velocidade do boneco vale; a pausa também). Vale para a peça que o
   * jogo encaixou e para a que o arquivo traz. Uma chave `nested/animation` da
   * animação de quem recebe vence (quem escolheu na faixa manda, `02`; `08`
   * 6.2): a ordem espera, e o leitor avisa. Animação que a peça não tem: ela
   * fica parada, e avisa. `relogio` só o jogo salvo usa: de onde a peça volta.
   */
  animarPeca(slot: string, animacao: string, laco: boolean, relogio = 0): boolean {
    if (this.slotOuAviso(slot, 'Animar a peça') === null) return false;
    const peca = this.dadosDaPeca(slot);
    if (peca === null) {
      this.avisos.avisar(`sem-peca:${slot}`, `Animar a peça: o slot "${slot}" não mostra entidade agora. Nada mudou.`);
      return false;
    }
    if (peca.findAnimation(animacao) === null) {
      const tem = peca.animations.map((a) => `"${a.name}"`).join(', ') || 'nenhuma';
      this.avisos.avisar(`anim-peca:${slot}:${animacao}`,
        `Animar a peça: a peça do slot "${slot}" não tem a animação "${animacao}". Ela fica parada. Tem: ${tem}.`);
    }
    this.ordens.set(slot, { animacao, laco, relogio: Number.isFinite(relogio) && relogio > 0 ? relogio : 0 });
    this.reposar();
    return true;
  }

  /** SOLTAR A PEÇA: ninguém manda nela — nenhuma animação por cima, a pose de repouso dela. */
  soltarPeca(slot: string): boolean {
    if (this.slotOuAviso(slot, 'Soltar a peça') === null) return false;
    this.ordens.set(slot, { animacao: null, laco: false, relogio: 0 });
    this.reposar();
    return true;
  }

  /**
   * A matriz de mundo do osso `nome`, no espaço do esqueleto (para OssoX,
   * OssoY, OssoAngulo). Osso que não existe: `null`, e avisa.
   */
  matrizDoOsso(nome: string): Matrix2x3 | null {
    const osso = this.esqueleto.findBone(nome);
    if (osso !== null) return osso;
    const tem = this.esqueleto.bones.map((b) => `"${b.data.name}"`).join(', ') || 'nenhum';
    this.avisos.avisar(`osso:${nome}`, `OssoX/OssoY/OssoAngulo: o boneco não tem o osso "${nome}". Tem: ${tem}.`);
    return null;
  }

  /**
   * A matriz do PINO da peça do slot (para SlotX, SlotY, SlotAngulo): o osso
   * do slot (com a chave `slot/bone`, 9.5) vezes o `x, y, rotation, scale` da
   * imagem ou da entidade que ele mostra agora — onde a peça está. Malha ou
   * slot vazio: o osso do slot. Slot que não existe: `null`, e avisa.
   */
  matrizDoSlot(nome: string): Matrix2x3 | null {
    if (this.slotOuAviso(nome, 'SlotX/SlotY/SlotAngulo') === null) return null;
    const slot = this.esqueleto.findSlot(nome)!;
    const att = slot.attachment as unknown as Partial<Record<'x' | 'y' | 'rotation' | 'scaleX' | 'scaleY', number>> | null;
    const osso = slot.boneMatrix;
    if (att === null || typeof att.scaleX !== 'number') return multiplyMatrix(osso, composeMatrix(0, 0, 0, 1, 1));
    return multiplyMatrix(osso, composeMatrix(att.x ?? 0, att.y ?? 0, att.rotation ?? 0, att.scaleX, att.scaleY ?? 1));
  }

  /** Os dados da entidade que o slot mostra agora, ou `null`. */
  private dadosDaPeca(slot: string): SkeletonData | null {
    const att = this.esqueleto.findSlot(slot)?.attachment ?? null;
    return att instanceof SkeletonAttachment ? att.child : null;
  }

  /**
   * Todo placeholder que o slot pode pedir: o do repouso, os de toda skin do
   * arquivo, os das chaves `slot/attachment` de toda animação. A skin dos
   * encaixes cobre todos: é assim que nenhuma chave desfaz o encaixe.
   */
  private nomesDoSlot(slot: SlotData): string[] {
    const nomes = new Set<string>();
    if (slot.attachmentName !== null) nomes.add(slot.attachmentName);
    for (const skin of this.esqueleto.data.skins) {
      for (const nome of skin.attachments.get(slot.index)?.keys() ?? []) nomes.add(nome);
    }
    for (const anim of this.esqueleto.data.animations) {
      for (const tl of anim.timelines) {
        if (tl.kind !== 'slot.attachment' || tl.slot !== slot) continue;
        for (const v of tl.keys.values) if (v !== null) nomes.add(v);
      }
    }
    return [...nomes];
  }

  /** Refaz a skin dos encaixes a partir do mapa, e a põe no topo da pilha. */
  private refazerEncaixes(): void {
    const jogo = this.pilhaDoJogo();
    // O que cada placeholder mostraria SEM os encaixes: as skins do jogo, a de cima vence (4.4).
    const resolucao: SkinData[] = [];
    for (const k of jogo) k.expand(resolucao);
    const debaixo = (slot: number, nome: string) => {
      for (let i = resolucao.length - 1; i >= 0; i--) {
        const a = resolucao[i].getAttachment(slot, nome);
        if (a !== undefined) return a;
      }
      return undefined;
    };
    let skin: SkinData | null = null;
    for (const [nomeDoSlot, encaixe] of this.encaixes) {
      const slot = this.esqueleto.data.findSlot(nomeDoSlot)!;
      const filho = this.entidades.get(encaixe.caminho)!;
      for (const nome of this.nomesDoSlot(slot)) {
        const imagem = debaixo(slot.index, nome);
        // Placeholder escondido de propósito (`null`): a peça some com ele.
        if (imagem === null) continue;
        // O pino: o mesmo `x, y, rotation, scaleX, scaleY` da imagem (7.11, 7.3).
        // SUPOSIÇÃO: imagem sem pino (malha) ou nenhuma imagem → a origem do osso.
        const pino = (imagem !== undefined && 'scaleX' in imagem ? imagem : {}) as Partial<Record<'x' | 'y' | 'rotation' | 'scaleX' | 'scaleY', number>>;
        const att = new SkeletonAttachment(nome, {
          uri: encaixe.caminho, around: encaixe.emVolta, loop: false,
          x: pino.x ?? 0, y: pino.y ?? 0, rotation: pino.rotation ?? 0, scaleX: pino.scaleX ?? 1, scaleY: pino.scaleY ?? 1,
        });
        att.resolvedUri = encaixe.caminho;
        att.child = filho;
        skin ??= new SkinData(-1, SKIN_DOS_ENCAIXES);
        skin.setAttachment(slot.index, nome, att);
      }
    }
    this.skinDosEncaixes = skin;
    this.trocarPilha(jogo);
  }

  /**
   * Escreve as ordens do jogo nos slots, DEPOIS da animação de quem recebe e
   * ANTES da pose de mundo, pelo canal das chaves `nested/animation` e
   * `nested/time` (9.9) — que é o que a 7.11 lê para escolher a animação e o
   * tempo do filho. Nenhuma linha do runtime muda.
   */
  private aplicarOrdens(): void {
    for (const [nome, ordem] of this.ordens) {
      const slot = this.esqueleto.findSlot(nome);
      if (slot === null) continue;
      if (slot.nestedAnimationSet) {
        this.avisos.avisar(`ordem-chave:${nome}:${this.nomeTocando}`,
          `A animação "${this.nomeTocando}" escolhe a animação da peça do slot "${nome}" (chave nested/animation): ela manda, e a ordem do jogo espera (08, 6.2).`);
        continue;
      }
      slot.nestedAnimationSet = true;
      slot.nestedAnimation = ordem.animacao;
      const att = slot.attachment;
      const anim = ordem.animacao === null || !(att instanceof SkeletonAttachment) || att.child === null
        ? null : att.child.findAnimation(ordem.animacao);
      if (anim === null) {
        slot.nestedTime = 0;
        continue;
      }
      const d = anim.duration;
      let t = ordem.relogio;
      if (d > 0) t = ordem.laco ? t - Math.floor(t / d) * d : Math.min(t, d);
      // O anexo do ARQUIVO pode estar em laço (`loop` padrão `true`): o runtime
      // daria a volta em `t = d`, e a peça sem laço voltaria ao primeiro quadro.
      // Ela para no último: o maior número abaixo de `d` (1e-16 × d antes).
      if (!ordem.laco && att instanceof SkeletonAttachment && att.loop && d > 0 && t >= d) t = d - d * Number.EPSILON;
      slot.nestedTime = t;
    }
  }
}

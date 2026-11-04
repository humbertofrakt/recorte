/**
 * O emissor de partículas NA CENA — extensão `BONE_particles`, lote 2.
 *
 * **O desenho das partículas não está aqui, e não precisa estar.** A cena
 * desenha o esqueleto com o `CanvasRenderer` do runtime (`viewport.ts` o monta,
 * `viewport-draw.ts` o chama), e esse desenhador **já sabe** desenhar um
 * emissor: `BONE_particle` está em `DRAWABLE_TYPES`, e o `drawParticles` põe
 * cada partícula onde o `computeParticles` diz. Foi medido na tela em 22/09, às
 * 01h05: um emissor com imagem sai jorrando, e a agulha para trás devolve as
 * MESMAS partículas.
 *
 * O que este módulo resolve é o outro lado, e é o lado que engana:
 *
 * > **Um emissor que não desenha nada desaparece.**
 *
 * E ele não desenha nada em quatro situações que a extensão prevê por escrito:
 * forma desconhecida (§7.4), malha que o leitor não sabe entregar, taxa zero
 * sem rajada, `emitting` desligado — e a mais comum de todas, **um emissor
 * recém-criado, que ainda não tem imagem**. Nesse último caso o `drawParticles`
 * do runtime avisa, por `onWarning`… e **a cena do editor não liga o
 * `onWarning`**: ele cai num `() => {}`. Conferido no disco em 22/09: o único
 * lugar do editor que o liga é `io/export-image.ts`.
 *
 * Então o primeiro gesto de quem usa — criar um emissor e apertar Tocar — dava
 * **tela igual e nenhum aviso**. Indistinguível de um programa quebrado, que é
 * o que a regra 21 da casa proíbe: *onde o programa não entende, ele avisa —
 * não improvisa, e não devolve um verde.*
 *
 * **Por que a conta das vivas não está aqui.** Seria bonito dizer "30 vivas", e
 * custaria caro: o `particleFrame` — a porta que o desenhador usa — não está no
 * `runtime/src/index.ts`, e nenhum arquivo do editor importa um caminho fundo do
 * runtime. Refazer a conta aqui seria uma SEGUNDA conta das mesmas partículas,
 * e uma segunda conta envelhece sozinha: ela começa igual à da tela e um dia
 * deixa de ser, sem ninguém notar. Estes quatro motivos se decidem pelo próprio
 * anexo, sem contar partícula nenhuma, e é isso que este módulo faz.
 *
 * A decisão é PURA: recebe o esqueleto posado e devolve, por emissor, onde ele
 * está e o que há para dizer. Quem desenha é o `viewport-draw.ts`; quem testa
 * não precisa de navegador.
 */

import {
  emitterMatrix, isParticleAttachment, matrixRotationDeg, type BoneFile, type ParticleAttachment, type Skeleton, type Slot,
} from '../../../runtime/src/index.js';

/**
 * **Onde o emissor está na cena** — rodada 15 (04/10/2026).
 *
 * A origem dele no espaço do esqueleto, e para onde as partículas saem, em
 * graus do mundo. É a conta que a marca, o clique e as ferramentas leem: uma
 * conta, um dono. A origem é a do osso do slot (§9.5 da spec), deslocada e
 * girada pelo `x`, `y` e `rotation` do emissor (§9.10 da extensão, lote 3):
 * a marca, o clique e o arrasto andam juntos com as partículas.
 */
export interface EmitterPlace {
  readonly x: number;
  readonly y: number;
  /** Para onde as partículas saem, em graus do mundo: `direction` girado pelo osso. */
  readonly direction: number;
}

export function emitterPlace(slot: Slot, attachment: ParticleAttachment): EmitterPlace {
  // §9.10 da extensão: a matriz do EMISSOR, `M_osso × T(x, y) · R(rotation)` —
  // a mesma função que o runtime usa para as partículas.
  const m = emitterMatrix(attachment, slot.boneMatrix, PLACE_SCRATCH);
  return { x: m.worldX, y: m.worldY, direction: attachment.direction + matrixRotationDeg(m) };
}

const PLACE_SCRATCH = { a: 1, b: 0, c: 0, d: 1, worldX: 0, worldY: 0 };

/**
 * Um emissor da cena, e o que a tela tem a dizer dele.
 *
 * `x` e `y` são a origem do emissor no espaço do esqueleto — o lugar do osso do
 * slot (§9.5 da spec), que é de onde as partículas saem em `space: "local"`.
 */
export interface EmitterMark {
  /** O nome do anexo, que é o nome do emissor. */
  readonly name: string;
  /** O slot dele. */
  readonly slot: string;
  readonly x: number;
  readonly y: number;
  /** Para onde as partículas saem, em graus do mundo (rodada 15: o traço da marca). */
  readonly direction: number;
  /**
   * O que está errado, por extenso e em português, ou `null` quando não há nada
   * a dizer. É a frase que diz **a coisa e o que fazer**.
   */
  readonly problem: string | null;
  /**
   * A MESMA coisa em duas ou três palavras, para caber na cena — `null` junto
   * com o `problem`.
   *
   * As duas existem porque a primeira foto do lote mostrou a frase inteira
   * **correndo para fora da borda do palco**: desenhada no espaço do
   * esqueleto, ela cresce com o zoom e sai da tela pela direita, e o que
   * chegava aos olhos era *"…escolha uma em Prop"*. Um aviso cortado no meio é
   * pior do que um aviso curto.
   *
   * Então a cena mostra o curto, onde o emissor está, e a frase inteira fica
   * para onde há largura: a dica, a barra de avisos, o relatório da exportação.
   */
  readonly short: string | null;
}

/**
 * Por que este emissor não desenha nada, ou `null`.
 *
 * A ordem é a de quem lê: primeiro o que o motor recusa (§7.4 manda não
 * desenhar e avisar), depois a imagem que falta, e só então as duas torneiras
 * fechadas. Cada frase diz **a coisa e o que fazer**, porque um aviso que só
 * diz "não deu" manda a pessoa adivinhar.
 *
 * **`null` não quer dizer "está desenhando".** Um emissor sadio com a agulha
 * antes do primeiro nascimento tem zero partículas e nada errado. Esta função
 * responde "há algo a dizer?", e não "há algo na tela?" — e a diferença está
 * escrita porque confundir as duas é como se inventa um aviso falso.
 */
export interface EmitterProblem {
  /** A frase inteira: a coisa e o que fazer. */
  readonly problem: string;
  /** Duas ou três palavras, para a cena. */
  readonly short: string;
}

export function emitterProblem(attachment: ParticleAttachment, skeleton?: Skeleton): EmitterProblem | null {
  const nome = attachment.name;
  // Rodada 16, lote 8: a forma "caminho" sem caminho, ou com um caminho que
  // foi apagado ou renomeado depois. O runtime não desenha (§9.4.2); a tela
  // diz por quê, com o nome, e o que fazer — nunca um ponto na origem.
  if (attachment.shape === 'path') {
    const curva = attachment.curve;
    if (curva === null || curva === '') {
      return {
        problem: `o emissor "${nome}" usa a forma "caminho" e não diz qual: escolha o caminho em Propriedades, aba Forma`,
        short: 'sem caminho',
      };
    }
    if (skeleton !== undefined && !pathExists(skeleton, curva)) {
      return {
        problem: `o emissor "${nome}" usa o caminho "${curva}", que não existe (apagado ou renomeado): ele não é desenhado; escolha outro em Propriedades, aba Forma`,
        short: 'caminho sumiu',
      };
    }
  }

  // 1. O motor se recusa: forma que este leitor não conhece (§7.4).
  //
  //    **A frase NÃO repete a palavra do arquivo, e isso foi medido.** Seria a
  //    frase melhor, e ela não é possível aqui: o carregador já trocou a forma
  //    desconhecida pelo padrão `point` e só deixou o `shapeKnown: false` — a
  //    palavra crua vive na advertência DELE (`unknown particle shape "…"`),
  //    que vai para a barra de avisos. Então a frase manda para lá, em vez de
  //    imprimir `"point"` e dizer que `point` é desconhecido, que seria falso.
  if (!attachment.shapeKnown) {
    return {
      problem: `o emissor "${nome}" tem uma forma que este programa não conhece: ele não é desenhado (a forma está na barra de avisos)`,
      short: 'forma desconhecida',
    };
  }
  // 2. `shape: "mesh"` sem malha nomeada. A §9.4 exige o nome de um `mesh` do
  //    MESMO slot; sem ele não há de onde sortear ponto nenhum.
  if (attachment.shape === 'mesh' && (attachment.mesh === null || attachment.mesh === '')) {
    return {
      problem: `o emissor "${nome}" usa a forma "malha" e não diz qual malha: escolha uma em Propriedades`,
      short: 'sem malha',
    };
  }
  // 3. Não tem imagem. É o caso do emissor RECÉM-CRIADO, e é o primeiro que
  //    qualquer pessoa encontra. §9.8: sem `path`, o nome do anexo serve de
  //    nome de região — e nome de anexo raramente é nome de imagem, então o
  //    carregador não acha nada e o desenhador desiste do emissor inteiro.
  if (attachment.region === null && attachment.sequence === null) {
    return {
      problem: `o emissor "${nome}" não tem imagem: escolha uma em Propriedades`,
      short: 'sem imagem',
    };
  }
  // 4. As duas torneiras. São escolha de quem anima — e dizer QUAL delas está
  //    fechada poupa a busca, porque as duas dão a mesma tela vazia.
  if (attachment.rate <= 0 && attachment.bursts.length === 0) {
    return {
      problem: `o emissor "${nome}" tem taxa 0 e nenhuma rajada: nada nasce`,
      short: 'taxa 0',
    };
  }
  if (!attachment.emitting) {
    return {
      problem: `o emissor "${nome}" está com a emissão desligada`,
      short: 'emissão desligada',
    };
  }
  return null;
}

/**
 * Os emissores da cena, no instante em que o esqueleto está posado.
 *
 * Só os que estão **à vista**: um slot escondido no editor não tem por que
 * avisar de nada, e um aviso de uma coisa que a pessoa escondeu de propósito é
 * ruído — *esconder também é um efeito*. `hidden` é a pergunta que o
 * `viewport-draw.ts` já sabe responder.
 */
export function emitterMarks(
  skeleton: Skeleton, hidden: (slot: Slot) => boolean = () => false,
): EmitterMark[] {
  const out: EmitterMark[] = [];
  for (const slot of skeleton.drawOrder) {
    const attachment = slot.attachment;
    if (attachment === null || !isParticleAttachment(attachment)) continue;
    if (!slot.visible || hidden(slot)) continue;
    const lugar = emitterPlace(slot, attachment);
    const mal = emitterProblem(attachment, skeleton);
    out.push({
      name: attachment.name,
      slot: slot.data.name,
      x: lugar.x,
      y: lugar.y,
      direction: lugar.direction,
      problem: mal?.problem ?? null,
      short: mal?.short ?? null,
    });
  }
  return out;
}

/**
 * **O raio da marca do emissor, em pixels de tela** — rodada 15.
 *
 * A marca é desenhada com este raio, e o clique a pega com um pouco de folga:
 * os dois números moram juntos para a marca nunca ficar maior do que o lugar
 * que se clica.
 */
export const EMITTER_MARK_PIXELS = 12;
export const EMITTER_PICK_PIXELS = 15;
/** Quão perto de uma partícula o clique precisa cair, em pixels de tela. */
export const PARTICLE_PICK_PIXELS = 8;

/**
 * **O emissor debaixo do ponteiro**, por onde ele se vê — rodada 15, linha 2.
 *
 * Antes o clique **pulava** o emissor: ele não tem contorno (`picking.ts`
 * pulava quem não tem `computeWorldVertices`). Agora ele se acha de duas
 * formas, as duas que a pessoa vê:
 *
 * - **a marca**, na origem dele: `onMark` = `true`. Ela é desenhada por cima
 *   de tudo, então quem a clica quer o emissor antes da imagem de baixo;
 * - **uma partícula viva**, pela mesma conta que as desenha (`particleFrame` do
 *   runtime): `onMark` = `false`. Essa fica na vez do slot na ordem de desenho.
 *
 * `frame` é a porta da conta das partículas; quem testa sem partícula passa
 * `null`, e o emissor se acha só pela marca.
 */
export interface EmitterHit {
  readonly slot: string;
  readonly attachment: string;
  readonly bone: string;
  readonly onMark: boolean;
}

export type ParticlePositions = (slot: Slot, attachment: ParticleAttachment) => ArrayLike<{ x: number; y: number }>;

export function emitterHit(
  slot: Slot, attachment: ParticleAttachment, x: number, y: number, pixelsPerUnit: number,
  particles: ParticlePositions | null = null,
): EmitterHit | null {
  const scale = pixelsPerUnit > 1e-9 ? pixelsPerUnit : 1e-9;
  const lugar = emitterPlace(slot, attachment);
  const base = { slot: slot.data.name, attachment: attachment.name, bone: slot.bone.data.name };
  if (Math.hypot(x - lugar.x, y - lugar.y) <= EMITTER_PICK_PIXELS / scale) return { ...base, onMark: true };
  if (particles === null) return null;
  const raio = PARTICLE_PICK_PIXELS / scale;
  const vivas = particles(slot, attachment);
  for (let i = 0; i < vivas.length; i++) {
    const p = vivas[i]!;
    if (Math.hypot(x - p.x, y - p.y) <= raio) return { ...base, onMark: false };
  }
  return null;
}

/**
 * **Os avisos do emissor, para o botão de avisos** — rodada 15, linha 8.
 *
 * A marca na cena diz o curto, onde o emissor está. A frase inteira tem de ir
 * para onde há largura e onde se procura "o que está errado": o botão de avisos
 * do rodapé e a janela de Problemas. Lá ela chega no formato do documento —
 * `ponteiro: frase` —, e o `warningRow` dá o nome de gente e o **Ir para**.
 *
 * Duas espécies, como a extensão pede:
 *
 * - o que o emissor **é** (`emitterProblem`): sem imagem, forma desconhecida,
 *   taxa 0, emissão desligada;
 * - o que o quadro **corta** (§7.1): *"12 partículas cortadas neste quadro"*,
 *   pela mesma conta que desenha (`particles`).
 *
 * O "sem imagem" NÃO se repete quando o carregador já avisou daquele desenho
 * (`existing`): duas linhas para a mesma falta mandam procurar duas coisas.
 */
export function emitterWarningLines(
  file: BoneFile, skeleton: Skeleton, existing: readonly string[] = [],
  particles: ((slot: Slot, attachment: ParticleAttachment) => { readonly cut: number }) | null = null,
  hidden: (slot: Slot) => boolean = () => false,
): string[] {
  const out: string[] = [];
  for (const slot of skeleton.drawOrder) {
    const attachment = slot.attachment;
    if (attachment === null || !isParticleAttachment(attachment)) continue;
    if (!slot.visible || hidden(slot)) continue;
    const pointer = attachmentPointer(file, slot.data.name, attachment.name);
    const mal = emitterProblem(attachment, skeleton);
    if (mal !== null) {
      const jaDito = existing.some((w) => w.startsWith(`${pointer}: `) || w.startsWith(`${pointer}/`));
      if (!(jaDito && mal.short === 'sem imagem')) out.push(`${pointer}: ${mal.problem}`);
      continue;
    }
    if (particles === null) continue;
    const cut = particles(slot, attachment).cut;
    if (cut > 0) {
      out.push(`${pointer}: ${cut} partícula${cut === 1 ? '' : 's'} cortada${cut === 1 ? '' : 's'} neste quadro: o emissor "${attachment.name}" desenha no máximo ${attachment.maxParticles} (Máximo de vivas, em Propriedades)`);
    }
  }
  return out;
}

/** O ponteiro do anexo no arquivo, `/skins/<i>/attachments/<slot>/<nome>` (§2.5). */
function attachmentPointer(file: BoneFile, slot: string, name: string): string {
  const skins = file.skins ?? [];
  let i = skins.findIndex((s) => (s.attachments as Record<string, Record<string, unknown>> | undefined)?.[slot]?.[name] !== undefined);
  if (i < 0) i = 0;
  const esc = (part: string): string => part.replace(/~/g, '~0').replace(/\//g, '~1');
  return `/skins/${i}/attachments/${esc(slot)}/${esc(name)}`;
}

/** Só os que têm algo a dizer — o que a cena marca. */
export function emittersToWarn(marks: readonly EmitterMark[]): EmitterMark[] {
  return marks.filter((m) => m.problem !== null);
}

/**
 * **Quando o desenho das partículas tem de esquecer o que guardou** — conserto
 * 5 da conferência da rodada 16 (05/10/2026). O `ParticleCache` do runtime
 * guarda a curva de emissão pelo NOME do emissor; um arquivo novo com o mesmo
 * nome e outra taxa seria desenhado com a taxa velha. Toda mudança que troca o
 * arquivo carregado (`file`, `structure`, `assets`) troca o cache. Uma pose
 * (`transform`) não: o anexo é o mesmo.
 */
export function renewsParticleCache(kind: string): boolean {
  return kind === 'file' || kind === 'structure' || kind === 'assets';
}

/**
 * **O caminho `"<slot>/<anexo>"` existe neste esqueleto?** — rodada 16, lote 8.
 * Separa no PRIMEIRO "/", como o leitor (§9.4.2), e pede o anexo pela pilha de
 * peles, como o leitor faz no nascimento.
 */
export function pathExists(skeleton: Skeleton, curve: string): boolean {
  const bar = curve.indexOf('/');
  if (bar <= 0 || bar === curve.length - 1) return false;
  const att = skeleton.getAttachment(curve.slice(0, bar), curve.slice(bar + 1)) as { type?: string } | null;
  return att !== null && att.type === 'path';
}

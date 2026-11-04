// SPDX-License-Identifier: Apache-2.0
/**
 * O desenhador do leitor do Construct (rodadas K2 e K3, 05/10/2026).
 *
 * MÓDULO PURO: recebe um esqueleto já posado e devolve as listas que o
 * `drawMesh` do Construct pede — posições, uv, índices, cores —, agrupadas por
 * página do atlas e modo de mistura. Não toca no Construct, no DOM nem em
 * textura: quem chama o `drawMesh` é o `instance.js` do addon. Por isso roda no
 * Node, e o teste compara estas listas com o que o desenhador do editor
 * (`runtime/src/render/canvas.ts`) desenha para o mesmo herói.
 *
 * Em duas etapas, para a prova poder olhar a do meio:
 *
 *   1. `pecasDoQuadro`  — cada peça desenhável, no espaço do ESQUELETO (Y para
 *      cima), na ordem de desenho (7.13), com a cor final (7.12), a mistura,
 *      e JÁ CORTADA pelas máscaras (7.7; a conta está em `recorte.ts`). A ordem
 *      é a dos três grupos de 7.11 (`collectDrawGroups`, rodada K5): o que um
 *      filho com `around` tem antes da marca vai para trás de quem o recebe
 *      inteiro, o que tem depois vai para a frente. Peça a peça, é a `drawList`
 *      do runtime (`collectDrawList`, 12.4); o teste `conexao.test.ts` compara.
 *   2. `montarLotes`    — as peças levadas para o espaço do LAYOUT do Construct
 *      (Y para baixo) e juntadas em lotes, um `drawMesh` por lote.
 *
 * A virada do eixo Y mora num lugar só: `paraConstruct`.
 *
 * O que ainda não desenha AVISA (regra 21), nunca improvisa em silêncio:
 *   - máscara que se cruza (7.7 proíbe) → a peça sai sem aquele corte, e avisa;
 *   - cor escura / tint black (7.12) → precisa de efeito: sai só com a cor clara, e avisa;
 *   - partículas demais (acima de `TETO_DE_PARTICULAS`) → desenha todas, e avisa o peso.
 */

import type { BlendMode } from '../../runtime/src/types.js';
import type { AtlasPageData, AtlasRegionData } from '../../runtime/src/data.js';
import type { Skeleton, Slot } from '../../runtime/src/skeleton.js';
import type { Attachment } from '../../runtime/src/attachments/attachment.js';
import { aroundMarker, collectDrawGroups, type DrawCut } from '../../runtime/src/render-list.js';
import { computeFinalColor, createFinalColor } from '../../runtime/src/color.js';
import { MAX_NESTED_DEPTH } from '../../runtime/src/nested.js';
import { RegionAttachment, REGION_TRIANGLES } from '../../runtime/src/attachments/region.js';
import { MeshAttachment } from '../../runtime/src/attachments/mesh.js';
import { LinkedMeshAttachment } from '../../runtime/src/attachments/linkedmesh.js';
import { ParticleAttachment } from '../../runtime/src/attachments/particle.js';
import { cortarPeca, triangularMascara, type Mascara } from './recorte.js';
import { computeRegionFrame } from '../../runtime/src/attachments/region.js';
import { particleFrame, particleRegion, ParticleCache } from '../../runtime/src/particles/frame.js';
import { cosDeg, sinDeg } from '../../runtime/src/math.js';

// ---------------------------------------------------------------------------
// Avisos: cada um uma vez só
// ---------------------------------------------------------------------------

/**
 * Junta os avisos do leitor, sem repetir. O desenho roda 60 vezes por segundo:
 * sem a chave, o console do Construct enche em um segundo.
 */
export class Avisos {
  private readonly vistos = new Set<string>();
  private readonly textos: string[] = [];
  private lidos = 0;

  avisar(chave: string, texto: string): void {
    if (this.vistos.has(chave)) return;
    this.vistos.add(chave);
    this.textos.push(texto);
  }

  /** Todos, do primeiro ao último. */
  todos(): readonly string[] {
    return this.textos;
  }

  /** Só os que chegaram desde a última chamada (para o console). */
  novos(): string[] {
    const n = this.textos.slice(this.lidos);
    this.lidos = this.textos.length;
    return n;
  }
}

// ---------------------------------------------------------------------------
// Etapa 1: as peças, no espaço do esqueleto
// ---------------------------------------------------------------------------

/** Uma peça desenhável, como o editor a vê. Espaço do esqueleto: Y para cima. */
export interface Peca {
  /** Nome do slot (o de dentro, se a peça vem de um esqueleto aninhado). */
  readonly slot: string;
  /**
   * `slot/anexo`, com o slot do pai na frente a cada nível aninhado: o mesmo
   * nome da `drawList` do dump (12.4). Ex.: `weapon/blade/blade`.
   */
  readonly nome: string;
  /** Nome do anexo. */
  readonly anexo: string;
  /** `region`, `mesh` ou `linkedmesh`. */
  readonly tipo: string;
  readonly pagina: AtlasPageData;
  readonly mistura: BlendMode;
  /** `x, y` de cada vértice, no espaço do esqueleto de cima. */
  readonly mundo: Float64Array;
  /** `u, v` de cada vértice, de 0 a 1 na página; `v = 0` é o alto da imagem. */
  readonly uvs: Float64Array;
  /** Triângulos, em índices de vértice desta peça. */
  readonly triangulos: ArrayLike<number> & Iterable<number>;
  /** Cor clara final (7.12), RGBA de 0 a 1, alpha reto (não multiplicado). */
  readonly cor: readonly [number, number, number, number];
  /** Quantos esqueletos aninhados por cima (0 = o de fora). */
  readonly profundidade: number;
  /** As máscaras que cortam a peça, de fora para dentro. Vazia = nenhuma. */
  readonly recortes: readonly RecorteDaPeca[];
  /**
   * Só nas partículas: a cor de CADA vértice, RGBA de 0 a 1, alpha reto. Cada
   * partícula tem a sua (9.7 da extensão); é o que deixa todas as de um emissor
   * irem num `drawMesh` só. Quando existe, vale no lugar de `cor`.
   */
  readonly coresPorVertice?: Float64Array;
}

/** A região do atlas que o anexo mostra agora (quadro de sequência incluído). */
function regiaoDe(slot: Slot, anexo: Attachment): AtlasRegionData | null {
  if (anexo instanceof RegionAttachment) return anexo.regionFor(slot);
  if (anexo instanceof MeshAttachment) return anexo.regionFor(slot);
  if (anexo instanceof LinkedMeshAttachment) return anexo.regionFor(slot);
  return null;
}

/** Uma máscara que corta a peça (7.7), como o editor a aplica. */
export interface RecorteDaPeca {
  /** Nome do anexo `clipping`. */
  readonly nome: string;
  /** O polígono da máscara, `x, y` no espaço do esqueleto de cima. */
  readonly poligono: Float64Array;
  readonly inverter: boolean;
}

/** Opções da etapa 1. */
export interface OpcoesDoQuadro {
  /**
   * `false` devolve as peças INTEIRAS, com a lista `recortes` preenchida mas
   * sem cortar. Só a prova usa: é assim que ela compara peça a peça com o editor,
   * que também desenha a peça inteira e deixa o Canvas cortar.
   */
  readonly cortar?: boolean;
  /**
   * As contas guardadas das partículas (a curva de emissão de cada emissor).
   * Só velocidade: o desenho é o mesmo com ou sem. O objeto do Construct
   * guarda uma entre um quadro e outro, como o desenhador do editor.
   */
  readonly particulas?: ParticleCache;
}

/**
 * Acima disto, num emissor, o leitor AVISA o peso (e desenha todas, sem cortar).
 *
 * Por que 300: o manual do Construct diz que passar de "algumas centenas" de
 * partículas pode derrubar o quadro (o `06`, colado pelo Humberto). Algumas
 * centenas é 200 a 500; 300 é o meio. E a conta é nossa, na CPU, a cada quadro:
 * 300 partículas são 1.200 vértices refeitos 60 vezes por segundo, por emissor.
 * O número é um aviso, não uma trava: quem decide é o jogo.
 */
export const TETO_DE_PARTICULAS = 300;

/**
 * As peças de um quadro, na ordem de desenho de 7.13, com os esqueletos
 * aninhados de 7.11 no lugar deles, já cortadas pelas máscaras de 7.7. O
 * esqueleto já tem de estar posado (`updateWorldTransform` chamado).
 */
export function pecasDoQuadro(esqueleto: Skeleton, avisos: Avisos = new Avisos(), opcoes: OpcoesDoQuadro = {}): Peca[] {
  const saida: Peca[] = [];
  const cache = new Map<Float64Array, Mascara | null>();
  const contexto: Contexto = { avisos, saida, cortar: opcoes.cortar !== false, cache, particulas: opcoes.particulas ?? new ParticleCache() };
  juntarPecas(esqueleto, null, '', 0, [], contexto);
  avisosDoAninhado(esqueleto, avisos);
  return saida;
}

/**
 * O que a máquina dos aninhados anotou (7.11): entidade que não carregou,
 * ciclo, profundidade, `around` com um slot que o filho não tem. Sem isto o
 * leitor desenharia em bloco CALADO (regra 21). Fica de fora o `NESTED_GONE`
 * ("a entidade deixou de ser mostrada"): no jogo isso é o Desencaixar, ou uma
 * chave que troca a entidade pela imagem — o que se pediu, não o que falhou.
 */
function avisosDoAninhado(esqueleto: Skeleton, avisos: Avisos): void {
  for (const m of esqueleto.nestedRoot.nestedWarnings) {
    if (m.startsWith('NESTED_GONE')) continue;
    avisos.avisar(`aninhado:${m}`, m);
  }
}

/** O que a volta pelas peças carrega de um nível ao outro. */
interface Contexto {
  readonly avisos: Avisos;
  readonly saida: Peca[];
  readonly cortar: boolean;
  readonly cache: Map<Float64Array, Mascara | null>;
  readonly particulas: ParticleCache;
}

/** As máscaras de `recortes` prontas para cortar (as que se cruzam ficam de fora, com aviso). */
function mascarasDe(recortes: readonly RecorteDaPeca[], nome: string, ctx: Contexto): Mascara[] {
  const mascaras: Mascara[] = [];
  for (const r of recortes) {
    let m = ctx.cache.get(r.poligono);
    if (m === undefined) {
      const tri = triangularMascara(r.poligono);
      m = tri === null ? null : { triangulos: tri, inverter: r.inverter };
      ctx.cache.set(r.poligono, m);
    }
    if (m === null) {
      ctx.avisos.avisar(`mascara-cruza:${r.nome}`,
        `A máscara "${r.nome}" se cruza (7.7 não deixa): o leitor não sabe cortar por ela, e "${nome}" sai sem esse corte.`);
      continue;
    }
    mascaras.push(m);
  }
  return mascaras;
}

/**
 * Um esqueleto, pelos três grupos de 7.11. `corte` diz que metade dele sai,
 * quando ele é um filho desenhado EM VOLTA de quem o recebe (`around`); `null`
 * é ele inteiro. `prefixo` é o caminho de slots até aqui, para o `nome`.
 */
function juntarPecas(
  esqueleto: Skeleton, corte: DrawCut | null, prefixo: string, profundidade: number,
  doPai: readonly RecorteDaPeca[], ctx: Contexto,
): void {
  const { avisos, saida, cortar } = ctx;
  const cor = createFinalColor();
  for (const { slot, attachment, clip, part } of collectDrawGroups(esqueleto, corte)) {
    const nome = slot.data.name;
    // 7.7: a máscara do pai corta o aninhado inteiro, como um bloco; as do
    // filho cortam por dentro, por cima dessa. Um filho EM VOLTA (`part`) chega
    // com `clip` nulo: a máscara de quem o recebe não o corta (7.11, C-319);
    // as de quem recebe o pai em bloco (`doPai`) continuam cortando.
    const recortes = clip === null ? doPai
      : [...doPai, { nome: clip.attachment.name, poligono: clip.polygon, inverter: clip.invert }];
    if (attachment.type === 'skeleton') {
      const filho = slot.nested;
      if (filho === null) {
        avisos.avisar(`aninhado:${attachment.name}`,
          `O esqueleto aninhado "${attachment.name}" (slot "${nome}") não foi carregado: nada desenhado no lugar dele (7.11).`);
        continue;
      }
      if (profundidade + 1 > MAX_NESTED_DEPTH) continue;
      // Em volta: só a metade pedida do filho, cortada na marca dele.
      const marca = part === undefined ? null : aroundMarker(slot);
      juntarPecas(filho.skeleton, marca === null || part === undefined ? null : { marker: marca, part },
        `${prefixo}${nome}/`, profundidade + 1, recortes, ctx);
      continue;
    }
    if (attachment instanceof ParticleAttachment) {
      juntarParticulas(esqueleto, slot, attachment, recortes, prefixo, profundidade, ctx);
      continue;
    }
    const regiao = regiaoDe(slot, attachment);
    if (regiao === null) {
      avisos.avisar(`regiao:${attachment.name}`,
        `O anexo "${attachment.name}" (slot "${nome}") não tem região no atlas: não foi desenhado.`);
      continue;
    }
    computeFinalColor(slot, attachment, cor);
    if (cor.light[3] <= 0) continue;
    if (cor.tintBlack) {
      avisos.avisar(`escura:${nome}`,
        `O slot "${nome}" tem cor escura (tint black, 7.12): o Construct ainda desenha só a cor clara dele.`);
    }

    let mundo: Float64Array;
    let uvs: Float64Array;
    let triangulos: ArrayLike<number> & Iterable<number>;
    if (attachment instanceof RegionAttachment) {
      mundo = attachment.computeWorldVertices(slot, new Float64Array(8), 0, 2) as Float64Array;
      uvs = Float64Array.from(attachment.uvsFor(slot));
      triangulos = REGION_TRIANGLES;
    } else {
      const malha = attachment as MeshAttachment | LinkedMeshAttachment;
      mundo = malha.computeWorldVertices(slot, new Float64Array(malha.vertexCount * 2), 0, 2) as Float64Array;
      uvs = Float64Array.from(malha.regionUVsFor(slot));
      triangulos = malha.triangles;
    }
    if (cortar && recortes.length > 0) {
      const cortada = cortarPeca(mundo, uvs, triangulos, mascarasDe(recortes, nome, ctx));
      mundo = cortada.mundo;
      uvs = cortada.uvs;
      triangulos = cortada.triangulos;
      if (triangulos.length === 0) continue; // a máscara tirou tudo: nada a desenhar
    }
    saida.push({
      slot: nome,
      nome: `${prefixo}${nome}/${attachment.name}`,
      anexo: attachment.name,
      tipo: attachment.type,
      pagina: regiao.page,
      mistura: slot.blend,
      mundo,
      uvs,
      triangulos,
      cor: [cor.light[0], cor.light[1], cor.light[2], cor.light[3]],
      profundidade,
      recortes,
    });
  }
}

/** A imagem da partícula não tem deslocamento, giro nem escala própria (9.6 da extensão). */
const QUADRO_DA_PARTICULA = Object.freeze({ x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1, width: 0, height: 0 });

/**
 * Um emissor (extensão `BONE_particles`), no lugar do slot dele na ordem de
 * desenho, pela MESMA conta do editor (`particleFrame`): sem estado, função
 * do tempo. Cada partícula é um quadrado da imagem, centrado no pivô, girado
 * pelo ângulo dela e no tamanho dela. Todas as partículas seguidas da mesma
 * página viram UMA peça (um `drawMesh`), com a cor de cada uma nos vértices.
 * Com máscara, cada partícula é cortada sozinha.
 */
function juntarParticulas(
  esqueleto: Skeleton, slot: Slot, emissor: ParticleAttachment, recortes: readonly RecorteDaPeca[],
  prefixo: string, profundidade: number, ctx: Contexto,
): void {
  const { avisos, saida } = ctx;
  const nome = slot.data.name;
  const quadro = particleFrame(esqueleto, slot, emissor, ctx.particulas);
  if (quadro.silence !== null) {
    avisos.avisar(`particula:${emissor.name}`, quadro.silence.message);
    return;
  }
  if (quadro.births.cyclesDropped > 0) {
    avisos.avisar(`particula-ciclos:${emissor.name}`,
      `${quadro.births.cyclesDropped} ciclo(s) de rajada do emissor "${emissor.name}" ficaram fora da volta: o instante deles cai fora de [0, D) (extensão BONE_particles 6).`);
  }
  if (quadro.cut > 0) {
    avisos.avisar(`particula-corte:${emissor.name}`,
      `O emissor "${emissor.name}" teve ${quadro.cut} partícula(s) cortada(s) num quadro pelo maxParticles ${emissor.maxParticles} (extensão BONE_particles 7.1).`);
  }
  if (quadro.particles.length > TETO_DE_PARTICULAS) {
    avisos.avisar(`particula-peso:${emissor.name}`,
      `O emissor "${emissor.name}" (slot "${nome}") chegou a ${quadro.particles.length} partículas vivas num quadro. O manual do Construct diz que passar de algumas centenas pode derrubar o quadro; o leitor avisa acima de ${TETO_DE_PARTICULAS}. Todas foram desenhadas.`);
  }
  if (quadro.particles.length === 0) return;

  const cor = computeFinalColor(slot, emissor, createFinalColor());
  if (cor.tintBlack) {
    avisos.avisar(`escura:${nome}`,
      `O slot "${nome}" tem cor escura (tint black, 7.12): o Construct ainda desenha só a cor clara dele.`);
  }
  const mascaras = ctx.cortar && recortes.length > 0 ? mascarasDe(recortes, nome, ctx) : [];
  const q = new Float64Array(8);
  const quv = new Float64Array(8);

  // O grupo que está sendo juntado: uma página, várias partículas.
  let pagina: AtlasPageData | null = null;
  let mundo: number[] = [];
  let uvs: number[] = [];
  let cores: number[] = [];
  const fechar = (): void => {
    if (pagina === null || mundo.length === 0) return;
    const n = mundo.length / 2;
    const tri: number[] = [];
    for (let k = 0; k < n; k += 4) tri.push(k, k + 1, k + 2, k, k + 2, k + 3);
    saida.push({
      slot: nome, nome: `${prefixo}${nome}/${emissor.name}`, anexo: emissor.name, tipo: emissor.type, pagina, mistura: slot.blend,
      mundo: Float64Array.from(mundo), uvs: Float64Array.from(uvs), triangulos: tri,
      cor: [cor.light[0], cor.light[1], cor.light[2], cor.light[3]], profundidade, recortes,
      coresPorVertice: Float64Array.from(cores),
    });
    mundo = [];
    uvs = [];
    cores = [];
  };

  for (const p of quadro.particles) {
    const regiao = particleRegion(emissor, p, emissor.region);
    if (regiao === null) {
      avisos.avisar(`regiao:${emissor.name}`,
        `O emissor "${emissor.name}" (slot "${nome}") não tem região no atlas: não foi desenhado.`);
      fechar();
      return;
    }
    const alpha = cor.light[3] * p.color[3];
    if (alpha <= 0) continue;
    const r = cor.light[0] * p.color[0];
    const g = cor.light[1] * p.color[1];
    const b = cor.light[2] * p.color[2];
    computeRegionFrame(QUADRO_DA_PARTICULA, regiao, q, quv);
    const c = cosDeg(p.angle) * p.scale;
    const s = sinDeg(p.angle) * p.scale;
    const canto: number[] = [];
    for (let i = 0; i < 8; i += 2) canto.push(p.x + q[i] * c - q[i + 1] * s, p.y + q[i] * s + q[i + 1] * c);

    if (mascaras.length > 0) {
      // Com máscara: a partícula sozinha, cortada (o corte muda os vértices).
      fechar();
      const cortada = cortarPeca(canto, quv, [0, 1, 2, 0, 2, 3], mascaras);
      if (cortada.triangulos.length === 0) continue;
      const nv = cortada.mundo.length / 2;
      const cv = new Float64Array(nv * 4);
      for (let v = 0; v < nv; v++) {
        cv[v * 4] = r; cv[v * 4 + 1] = g; cv[v * 4 + 2] = b; cv[v * 4 + 3] = alpha;
      }
      saida.push({
        slot: nome, nome: `${prefixo}${nome}/${emissor.name}`, anexo: emissor.name, tipo: emissor.type, pagina: regiao.page, mistura: slot.blend,
        mundo: cortada.mundo, uvs: cortada.uvs, triangulos: cortada.triangulos,
        cor: [r, g, b, alpha], profundidade, recortes, coresPorVertice: cv,
      });
      continue;
    }
    if (pagina !== null && pagina.name !== regiao.page.name) fechar();
    pagina = regiao.page;
    mundo.push(...canto);
    for (let i = 0; i < 8; i++) uvs.push(quv[i]);
    for (let v = 0; v < 4; v++) cores.push(r, g, b, alpha);
  }
  fechar();
}

// ---------------------------------------------------------------------------
// Etapa 2: a virada para o Construct, e os lotes
// ---------------------------------------------------------------------------

/**
 * Onde a instância do Construct está, e como o boneco cabe nela.
 * Espaço do layout do Construct: X para a direita, **Y para baixo**.
 */
export interface Vista {
  /** Posição da instância no layout: é onde cai o (0, 0) do esqueleto. */
  readonly x: number;
  readonly y: number;
  /** Ângulo da instância, em RADIANOS, no sentido do Construct (horário na tela). */
  readonly angulo: number;
  /** Pixels do layout por pixel do esqueleto. Negativo espelha. */
  readonly escalaX: number;
  readonly escalaY: number;
  /** Altura z de cada vértice (o `drawMesh` pede x, y, z). Padrão 0. */
  readonly z?: number;
  /** Cor da instância (Aparência do Construct), multiplica tudo. Padrão branco opaco. */
  readonly cor?: readonly [number, number, number, number];
}

export const VISTA_PARADA: Vista = Object.freeze({ x: 0, y: 0, angulo: 0, escalaX: 1, escalaY: 1 });

/**
 * A VIRADA DO EIXO Y — o único lugar do leitor que sabe que o Construct tem Y
 * para baixo e o `.bone` tem Y para cima (spec 3.3: converte-se só a matriz
 * final). Leva o ponto `(ex, ey)` do esqueleto para o layout e grava `x, y, z`
 * em `saida[i..i+2]`.
 */
export function paraConstruct(vista: Vista, ex: number, ey: number, saida: Float32Array | Float64Array, i: number): void {
  const lx = ex * vista.escalaX;
  const ly = -ey * vista.escalaY; // aqui, e só aqui, o Y vira
  const c = Math.cos(vista.angulo);
  const s = Math.sin(vista.angulo);
  saida[i] = vista.x + lx * c - ly * s;
  saida[i + 1] = vista.y + lx * s + ly * c;
  saida[i + 2] = vista.z ?? 0;
}

/** Um ponto e uma direção no layout do Construct: para um objeto do jogo seguir um osso (K5). */
export interface NoLayout {
  readonly x: number;
  readonly y: number;
  /** Graus, de 0 a 360, no sentido do Construct (horário na tela, porque o Y desce). */
  readonly angulo: number;
}

/** A parte de uma matriz de mundo (2.3) que a conta usa: `x = a·lx + b·ly + worldX`. */
export interface MatrizDeMundo {
  readonly a: number;
  readonly b: number;
  readonly c: number;
  readonly d: number;
  readonly worldX: number;
  readonly worldY: number;
}

/**
 * Onde a origem de uma matriz de mundo do esqueleto cai no layout, e para onde
 * aponta o eixo X dela. Os dois pontos passam por `paraConstruct` — a virada do
 * Y continua num lugar só —, e o ângulo sai da diferença entre eles: assim o
 * espelho, o giro e a escala da instância entram sem conta à parte.
 */
export function noLayout(vista: Vista, m: MatrizDeMundo): NoLayout {
  const p = new Float64Array(6);
  paraConstruct(vista, m.worldX, m.worldY, p, 0);
  paraConstruct(vista, m.worldX + m.a, m.worldY + m.c, p, 3);
  const graus = (Math.atan2(p[4] - p[1], p[3] - p[0]) * 180) / Math.PI;
  return { x: p[0], y: p[1], angulo: graus < 0 ? graus + 360 : graus };
}

/** Um `drawMesh`: a mesma página e a mesma mistura, várias peças em sequência. */
export interface Lote {
  readonly pagina: AtlasPageData;
  readonly mistura: BlendMode;
  /** `x, y, z` por vértice, no layout do Construct. */
  readonly posicoes: Float32Array;
  /** `u, v` por vértice. */
  readonly uvs: Float32Array;
  readonly indices: Uint16Array;
  /** `r, g, b, a` por vértice, já MULTIPLICADO pelo alpha (o Construct trabalha assim). */
  readonly cores: Float32Array;
  /** As peças do lote, `slot/anexo`, na ordem. */
  readonly pecas: readonly string[];
}

/** O índice do `drawMesh` é `Uint16`: um lote não passa de 65.536 vértices. */
export const MAXIMO_DE_VERTICES = 65536;

/**
 * As peças viram lotes de `drawMesh`, na mesma ordem de desenho. Duas peças
 * seguidas com a mesma página e a mesma mistura vão no mesmo lote; a ordem
 * nunca muda, só se junta o que já estava junto.
 */
export function montarLotes(pecas: readonly Peca[], vista: Vista = VISTA_PARADA): Lote[] {
  const lotes: Lote[] = [];
  const corVista = vista.cor ?? [1, 1, 1, 1];
  let i = 0;
  while (i < pecas.length) {
    const primeira = pecas[i];
    let fim = i;
    let vertices = 0;
    let indices = 0;
    while (fim < pecas.length) {
      const p = pecas[fim];
      // Pelo NOME da página: um esqueleto aninhado carrega o mesmo atlas como outro
      // objeto, e a textura do addon é uma por nome.
      if (p.pagina.name !== primeira.pagina.name || p.mistura !== primeira.mistura) break;
      const n = p.mundo.length / 2;
      if (vertices + n > MAXIMO_DE_VERTICES && fim > i) break;
      vertices += n;
      indices += p.triangulos.length;
      fim++;
    }
    const posicoes = new Float32Array(vertices * 3);
    const uvs = new Float32Array(vertices * 2);
    const cores = new Float32Array(vertices * 4);
    const ind = new Uint16Array(indices);
    const nomes: string[] = [];
    let v = 0;
    let k = 0;
    for (let j = i; j < fim; j++) {
      const p = pecas[j];
      nomes.push(`${p.slot}/${p.anexo}`);
      const a = p.cor[3] * corVista[3];
      const r = p.cor[0] * corVista[0] * a;
      const g = p.cor[1] * corVista[1] * a;
      const b = p.cor[2] * corVista[2] * a;
      const cpv = p.coresPorVertice;
      const n = p.mundo.length / 2;
      for (const t of p.triangulos) ind[k++] = v + t;
      for (let q = 0; q < n; q++) {
        paraConstruct(vista, p.mundo[q * 2], p.mundo[q * 2 + 1], posicoes, (v + q) * 3);
        uvs[(v + q) * 2] = p.uvs[q * 2];
        uvs[(v + q) * 2 + 1] = p.uvs[q * 2 + 1];
        const c = (v + q) * 4;
        if (cpv === undefined) {
          cores[c] = r; cores[c + 1] = g; cores[c + 2] = b; cores[c + 3] = a;
        } else {
          const av = cpv[q * 4 + 3] * corVista[3];
          cores[c] = cpv[q * 4] * corVista[0] * av;
          cores[c + 1] = cpv[q * 4 + 1] * corVista[1] * av;
          cores[c + 2] = cpv[q * 4 + 2] * corVista[2] * av;
          cores[c + 3] = av;
        }
      }
      v += n;
    }
    lotes.push({ pagina: primeira.pagina, mistura: primeira.mistura, posicoes, uvs, indices: ind, cores, pecas: nomes });
    i = fim;
  }
  return lotes;
}

/**
 * O nome que o `setBlendMode` do Construct entende, para cada mistura do
 * formato (7.12). Os quatro existem com o mesmo nome no Construct.
 * SUPOSIÇÃO: lido na definição do r495 (o plugin do Spine usa os mesmos
 * quatro); a página do `IRenderer` do r449 não foi lida (verificação de robô):
 * https://www.construct.net/en/make-games/manuals/addon-sdk/reference/graphics-interfaces/irenderer
 */
export const MISTURA_DO_CONSTRUCT: Readonly<Record<BlendMode, string>> = Object.freeze({
  normal: 'normal',
  additive: 'additive',
  multiply: 'multiply',
  screen: 'screen',
});

/**
 * A caixa do boneco na pose de repouso, como a instância do Construct precisa:
 * largura e altura de uma caixa CENTRADA no (0, 0) do esqueleto que cobre o
 * retângulo `skeleton` do arquivo inteiro. Centrada porque a origem padrão de
 * um objeto do Construct é o meio; assim o boneco nunca sai da caixa (e o
 * Construct não deixa de chamar o desenho por achar que ele saiu da tela).
 */
export function caixaDaInstancia(
  r: { readonly x: number; readonly y: number; readonly width: number; readonly height: number },
  escala: number,
): { largura: number; altura: number } {
  const meiaL = Math.max(Math.abs(r.x), Math.abs(r.x + r.width));
  const meiaA = Math.max(Math.abs(r.y), Math.abs(r.y + r.height));
  return { largura: Math.max(1, 2 * meiaL * Math.abs(escala)), altura: Math.max(1, 2 * meiaA * Math.abs(escala)) };
}

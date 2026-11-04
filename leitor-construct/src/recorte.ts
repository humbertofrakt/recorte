// SPDX-License-Identifier: Apache-2.0
/**
 * O recorte por máscara (spec 7.7) feito NA CONTA (rodada K3, 05/10/2026).
 *
 * O `IRenderer` do Construct não tem máscara (nem stencil nem tesoura), então
 * a peça cortada vira OUTROS triângulos: só o pedaço que fica. É a referência
 * da própria spec: "decompor o polígono em partes convexas e recortar cada
 * triângulo desenhado contra cada parte (Sutherland–Hodgman)".
 *
 *   - a máscara (pode ser côncava) vira triângulos, por orelhas;
 *   - dentro: cada triângulo da peça é cortado contra cada triângulo da máscara;
 *   - `invert` (fica o que está FORA): a peça perde, um a um, os triângulos da
 *     máscara; cada perda se faz pelos lados do triângulo, em pedaços que não
 *     se sobrepõem (sobreposição desenharia duas vezes o que é transparente).
 *
 * O uv do vértice novo é a mistura linear do uv das pontas: dentro de um
 * triângulo o uv é afim, então isto é exato, não aproximação.
 *
 * Puro: números entram, números saem. Testado no Node contra o recorte do
 * editor (que corta pelo Canvas) por amostragem de pontos.
 */

/** Um vértice no corte: posição e uv. */
type V = readonly [number, number, number, number];

/** Uma máscara pronta para cortar. */
export interface Mascara {
  /** Os triângulos da máscara, 6 números cada, em sentido anti-horário. */
  readonly triangulos: readonly Float64Array[];
  /** `true` = fica o que está FORA (7.7: "recorta o que está dentro"). */
  readonly inverter: boolean;
}

/** Área com sinal (positiva = anti-horário, com Y para cima). */
export function areaComSinal(p: ArrayLike<number>): number {
  let a = 0;
  const n = p.length / 2;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    a += p[i * 2] * p[j * 2 + 1] - p[j * 2] * p[i * 2 + 1];
  }
  return a / 2;
}

function cruz(ax: number, ay: number, bx: number, by: number, cx: number, cy: number): number {
  return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
}

/**
 * O polígono em triângulos anti-horários, pelo corte de orelhas. Devolve
 * `null` quando não dá (o polígono se cruza): quem chama avisa (regra 21).
 */
export function triangularMascara(poligono: ArrayLike<number>): Float64Array[] | null {
  let idx: number[] = [];
  const n = Math.floor(poligono.length / 2);
  if (seCruza(poligono)) return null;
  for (let i = 0; i < n; i++) idx.push(i);
  if (n < 3) return [];
  if (areaComSinal(poligono) < 0) idx.reverse();
  const x = (i: number) => poligono[i * 2];
  const y = (i: number) => poligono[i * 2 + 1];
  const saida: Float64Array[] = [];
  let guarda = 0;
  while (idx.length > 3) {
    if (guarda++ > n * n + 10) return null;
    let achou = false;
    for (let k = 0; k < idx.length; k++) {
      const a = idx[(k + idx.length - 1) % idx.length];
      const b = idx[k];
      const c = idx[(k + 1) % idx.length];
      const giro = cruz(x(a), y(a), x(b), y(b), x(c), y(c));
      if (giro === 0) {
        // Três pontos em linha: o do meio não faz canto, sai sem triângulo.
        idx.splice(k, 1);
        achou = true;
        break;
      }
      if (giro < 0) continue; // canto côncavo: não é orelha
      let dentro = false;
      for (const p of idx) {
        if (p === a || p === b || p === c) continue;
        if (cruz(x(a), y(a), x(b), y(b), x(p), y(p)) >= 0
          && cruz(x(b), y(b), x(c), y(c), x(p), y(p)) >= 0
          && cruz(x(c), y(c), x(a), y(a), x(p), y(p)) >= 0) { dentro = true; break; }
      }
      if (dentro) continue;
      saida.push(Float64Array.of(x(a), y(a), x(b), y(b), x(c), y(c)));
      idx.splice(k, 1);
      achou = true;
      break;
    }
    if (!achou) return null;
  }
  const [a, b, c] = idx;
  if (cruz(x(a), y(a), x(b), y(b), x(c), y(c)) > 0) saida.push(Float64Array.of(x(a), y(a), x(b), y(b), x(c), y(c)));
  return saida;
}

/** Dois lados não vizinhos do polígono se tocam? (7.7: "não pode se cruzar"). */
export function seCruza(p: ArrayLike<number>): boolean {
  const n = Math.floor(p.length / 2);
  const lado = (ax: number, ay: number, bx: number, by: number, cx: number, cy: number) => Math.sign(cruz(ax, ay, bx, by, cx, cy));
  for (let i = 0; i < n; i++) {
    const i2 = (i + 1) % n;
    for (let j = i + 1; j < n; j++) {
      const j2 = (j + 1) % n;
      if (j === i2 || j2 === i) continue; // vizinhos dividem uma ponta
      const a = lado(p[i * 2], p[i * 2 + 1], p[i2 * 2], p[i2 * 2 + 1], p[j * 2], p[j * 2 + 1]);
      const b = lado(p[i * 2], p[i * 2 + 1], p[i2 * 2], p[i2 * 2 + 1], p[j2 * 2], p[j2 * 2 + 1]);
      const c = lado(p[j * 2], p[j * 2 + 1], p[j2 * 2], p[j2 * 2 + 1], p[i * 2], p[i * 2 + 1]);
      const d = lado(p[j * 2], p[j * 2 + 1], p[j2 * 2], p[j2 * 2 + 1], p[i2 * 2], p[i2 * 2 + 1]);
      if (a * b < 0 && c * d < 0) return true;
    }
  }
  return false;
}

/** Corta o polígono convexo `p` pelo lado `ab`: fica a esquerda (`esquerda`) ou a direita. */
function meioPlano(p: V[], ax: number, ay: number, bx: number, by: number, esquerda: boolean): V[] {
  const saida: V[] = [];
  const lado = (v: V) => { const c = cruz(ax, ay, bx, by, v[0], v[1]); return esquerda ? c : -c; };
  for (let i = 0; i < p.length; i++) {
    const cur = p[i];
    const prox = p[(i + 1) % p.length];
    const dc = lado(cur);
    const dp = lado(prox);
    if (dc >= 0) saida.push(cur);
    if ((dc >= 0) !== (dp >= 0)) {
      const t = dc / (dc - dp);
      saida.push([
        cur[0] + (prox[0] - cur[0]) * t, cur[1] + (prox[1] - cur[1]) * t,
        cur[2] + (prox[2] - cur[2]) * t, cur[3] + (prox[3] - cur[3]) * t,
      ]);
    }
  }
  return saida;
}

const AREA_MINIMA = 1e-9;

function areaV(p: V[]): number {
  let a = 0;
  for (let i = 0; i < p.length; i++) {
    const j = (i + 1) % p.length;
    a += p[i][0] * p[j][1] - p[j][0] * p[i][1];
  }
  return a / 2;
}

function lados(t: Float64Array): [number, number, number, number][] {
  return [[t[0], t[1], t[2], t[3]], [t[2], t[3], t[4], t[5]], [t[4], t[5], t[0], t[1]]];
}

/** Os pedaços de `p` (convexo) que ficam com a máscara `m`. */
function cortarPoligono(p: V[], m: Mascara): V[][] {
  if (!m.inverter) {
    const saida: V[][] = [];
    for (const t of m.triangulos) {
      let q = p;
      for (const [ax, ay, bx, by] of lados(t)) {
        q = meioPlano(q, ax, ay, bx, by, true);
        if (q.length < 3) break;
      }
      if (q.length >= 3 && Math.abs(areaV(q)) > AREA_MINIMA) saida.push(q);
    }
    return saida;
  }
  // Fora da máscara: tira-se um triângulo dela de cada vez.
  let pedacos: V[][] = [p];
  for (const t of m.triangulos) {
    const proximos: V[][] = [];
    for (const pedaco of pedacos) {
      let resto = pedaco;
      for (const [ax, ay, bx, by] of lados(t)) {
        const fora = meioPlano(resto, ax, ay, bx, by, false);
        if (fora.length >= 3 && Math.abs(areaV(fora)) > AREA_MINIMA) proximos.push(fora);
        resto = meioPlano(resto, ax, ay, bx, by, true);
        if (resto.length < 3) break;
      }
      // o que sobrou em `resto` está dentro do triângulo da máscara: some
    }
    pedacos = proximos;
  }
  return pedacos;
}

/** Uma peça depois do corte: vértices novos, uv novos, triângulos novos. */
export interface PecaCortada {
  readonly mundo: Float64Array;
  readonly uvs: Float64Array;
  readonly triangulos: Uint16Array | number[];
}

/**
 * Corta uma peça (os triângulos dela, com uv) por todas as máscaras, na ordem.
 * Sem máscara, devolve a peça como veio.
 */
export function cortarPeca(
  mundo: ArrayLike<number>, uvs: ArrayLike<number>, triangulos: ArrayLike<number>, mascaras: readonly Mascara[],
): PecaCortada {
  if (mascaras.length === 0) {
    return { mundo: Float64Array.from(mundo), uvs: Float64Array.from(uvs), triangulos: Array.from(triangulos) };
  }
  const vert = (i: number): V => [mundo[i * 2], mundo[i * 2 + 1], uvs[i * 2], uvs[i * 2 + 1]];
  let poligonos: V[][] = [];
  for (let k = 0; k + 2 < triangulos.length; k += 3) {
    let tri: V[] = [vert(triangulos[k]), vert(triangulos[k + 1]), vert(triangulos[k + 2])];
    const a = areaV(tri);
    if (Math.abs(a) <= AREA_MINIMA) continue;
    if (a < 0) tri = [tri[0], tri[2], tri[1]];
    poligonos.push(tri);
  }
  for (const m of mascaras) poligonos = poligonos.flatMap((p) => cortarPoligono(p, m));

  let n = 0;
  let t = 0;
  for (const p of poligonos) { n += p.length; t += (p.length - 2) * 3; }
  const m2 = new Float64Array(n * 2);
  const u2 = new Float64Array(n * 2);
  const t2: number[] = new Array(t);
  let v = 0;
  let k = 0;
  for (const p of poligonos) {
    for (let i = 0; i < p.length; i++) {
      m2[(v + i) * 2] = p[i][0]; m2[(v + i) * 2 + 1] = p[i][1];
      u2[(v + i) * 2] = p[i][2]; u2[(v + i) * 2 + 1] = p[i][3];
    }
    for (let i = 1; i + 1 < p.length; i++) { t2[k++] = v; t2[k++] = v + i; t2[k++] = v + i + 1; }
    v += p.length;
  }
  return { mundo: m2, uvs: u2, triangulos: t2 };
}

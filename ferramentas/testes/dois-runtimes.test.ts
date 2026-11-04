/**
 * O confronto entre os dois runtimes (`conformidade/dois-runtimes.md`).
 *
 * O que se prova aqui:
 *   1. Todo dump de slot traz os CINCO campos da 12.4, mesmo os vazios.
 *      Foi por causa de dois campos omitidos que os dois runtimes divergiram
 *      em 10 casos sem nenhum deles falhar — o harness só compara o que o
 *      esperado cita, então campo faltando nunca reprova.
 *   2. Uma `linkedmesh` aparece no canal `uvs`. Ela tem imagem própria; sem
 *      isso a suíte não enxerga erro de textura em malha ligada.
 *   3. A parada do solver de Bézier é medida em `s`, não em `x` (9.3). Com a
 *      parada antiga dois runtimes conformes divergiam 8,5e-5, contra uma
 *      tolerância de 1e-4.
 *   4. A ferramenta de confronto acusa divergência quando ela existe — não
 *      adianta ela dizer "iguais" para tudo.
 *
 * O runtime Python NÃO é chamado daqui: nem toda máquina tem Python, e um
 * teste que some sozinho não é teste. Quem confere os dois é
 * `node ferramentas/comparar-runtimes.mjs`, e o `dois-runtimes.md` traz o
 * resultado. Aqui ficam as regras que o confronto descobriu.
 */

import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { buildPoseDump, type Probe } from '../src/conformidade/pose-dump.js';
import { loadSkeletonFile } from '../../runtime/src/index.js';
import { solveBezierParameter } from '../../runtime/src/curve.js';

const RAIZ = resolve(__dirname, '..', '..');
const CASOS = join(RAIZ, 'conformidade', 'casos');

/** Abre um caso da suíte. Nenhum dos casos usados aqui carrega atlas. */
function abrirCaso(nome: string) {
  const bytes = readFileSync(join(CASOS, nome, 'entrada.bone'));
  return loadSkeletonFile(bytes).data;
}

/** Os cinco campos de `slots` da 12.4, na ordem da tabela. */
const CAMPOS_DE_SLOT = ['attachment', 'color', 'visible', 'darkColor', 'sequenceIndex'];

describe('12.4: presença de campo no dump é normativa', () => {
  const casos = ['A-024-troca-de-attachment', 'A-029-draworder-colisao', 'B-104-linkedmesh', 'X-302-tipo-desconhecido'];

  for (const nome of casos) {
    it(`${nome}: todo slot traz os cinco campos, mesmo os vazios`, () => {
      const data = abrirCaso(nome);
      const probe: Probe = { times: [0], measure: ['slots'] };
      const dump = buildPoseDump(data, probe);
      const slots = dump.samples[0]?.slots;
      expect(slots, 'o dump tem o canal slots').toBeDefined();
      const nomes = Object.keys(slots!);
      expect(nomes.length).toBeGreaterThan(0);
      for (const slot of nomes) {
        for (const campo of CAMPOS_DE_SLOT) {
          expect(
            Object.prototype.hasOwnProperty.call(slots![slot], campo),
            `o slot "${slot}" tem o campo "${campo}"`,
          ).toBe(true);
        }
      }
    });
  }

  it('sem dark color e sem sequência, os dois campos vêm com o valor vazio', () => {
    const data = abrirCaso('A-029-draworder-colisao');
    const dump = buildPoseDump(data, { times: [0], measure: ['slots'] });
    for (const slot of Object.values(dump.samples[0]!.slots!)) {
      expect(slot.darkColor).toBeNull();
      expect(slot.sequenceIndex).toBe(-1);
    }
  });
});

describe('7.5 e 12.4: a malha ligada tem UV própria', () => {
  it('B-104: as duas malhas ligadas aparecem no canal uvs', () => {
    const data = abrirCaso('B-104-linkedmesh');
    const dump = buildPoseDump(data, { animation: 'puxar', times: [0], measure: ['uvs'] });
    const uvs = dump.samples[0]?.uvs ?? {};
    expect(Object.keys(uvs).sort()).toEqual(['herda/copia_herda', 'propria/copia_propria']);
    // Sem atlas, os UV são os literais do arquivo (12.4).
    expect([...uvs['herda/copia_herda']!]).toEqual([0, 0, 1, 0, 0, 1]);
  });

  it('B-104: inheritDeform decide sozinho quem se mexe', () => {
    const data = abrirCaso('B-104-linkedmesh');
    const dump = buildPoseDump(data, { animation: 'puxar', times: [1], measure: ['vertices'] });
    const v = dump.samples[0]!.vertices!;
    // true (o padrão): o deform do parent vale.
    expect(v['herda/copia_herda']![0]).toBeCloseTo(20, 6);
    // false: a malha ligada ignora o deform do parent.
    expect(v['propria/copia_propria']![0]).toBeCloseTo(0, 6);
  });
});

describe('9.3: a parada do solver de Bézier é medida em s', () => {
  it('a raiz volta com erro menor que 1e-9, e não com erro de 1e-6 no tempo', () => {
    // A curva do A-020: alças de tempo em 1/3 e 2/3, então x(s) = 3s.
    const s = solveBezierParameter(0, 1, 2, 3, 2);
    expect(s).toBeCloseTo(2 / 3, 9);
  });

  it('numa curva de aceleração forte, o valor bate com a conta exata', () => {
    // v(s) = s³ × 100 (alças de valor em zero). Com a parada medida em x, os
    // dois runtimes do projeto divergiam 8,5e-5 aqui.
    for (const t of [0.3, 1.5, 2.1, 2.7, 2.95]) {
      const s = solveBezierParameter(0, 1, 2, 3, t);
      expect(s).toBeCloseTo(t / 3, 9);
      const valor = s * s * s * 100;
      expect(valor).toBeCloseTo((t / 3) ** 3 * 100, 6);
    }
  });

  it('o solver do editor dá o mesmo s que o do runtime', async () => {
    const { solveParameter } = await import('../../editor/src/anim/curves.js');
    for (const t of [0.05, 0.4, 1.1, 2.2, 2.99]) {
      expect(solveParameter(0, 1, 2, 3, t)).toBeCloseTo(solveBezierParameter(0, 1, 2, 3, t), 9);
    }
  });
});

describe('a ferramenta de confronto', () => {
  const FERRAMENTA = join(RAIZ, 'ferramentas', 'comparar-runtimes.mjs');

  it('acusa divergência quando um dos lados mente', () => {
    // Um "runtime" que devolve sempre o mesmo dump vazio: tem de ser pego.
    const mentiroso = 'node -e "process.stdin.resume();process.stdin.on(\'end\',()=>{});'
      + 'setTimeout(()=>{console.log(JSON.stringify({version:\'1.0\',samples:[]}));process.exit(0)},10)"';
    let saiu = 0;
    let texto = '';
    try {
      texto = execFileSync('node', [FERRAMENTA, '--b', mentiroso], {
        cwd: RAIZ, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
      });
    } catch (erro) {
      const e = erro as { status?: number; stdout?: string };
      saiu = e.status ?? 1;
      texto = e.stdout ?? '';
    }
    expect(saiu, 'sai com código diferente de zero').not.toBe(0);
    expect(texto).toContain('NÃO');
    expect(texto).toMatch(/Divergência em/);
  }, 120_000);
});

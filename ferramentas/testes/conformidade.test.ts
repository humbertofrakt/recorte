/**
 * A suíte de conformidade (spec 12.4) testada por dentro.
 *
 * O que se prova aqui:
 *   1. O runtime de referência passa em todos os casos.
 *   2. Um runtime propositalmente errado é REPROVADO, e pelo caso certo.
 *   3. O pose dump tem o formato exato da 12.4.
 *   4. `--gerar` e depois rodar dá tudo verde.
 *   5. O executor de linha de comando funciona: tabela, `--json`, `--nivel`,
 *      `--adaptador`, e código de saída diferente de zero quando falha.
 */

import { describe, expect, it, beforeAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { inflateRawSync } from 'node:zlib';
import { join, resolve } from 'node:path';

import {
  buildPoseDump, comparePoseDump, formatPoseDump,
  POSE_DUMP_VERSION, TOLERANCES, PHYSICS_TOLERANCES,
  type PoseDump, type Probe,
} from '../src/conformidade/pose-dump.js';
import { loadSkeletonFile, loadSkeletonData, loadAtlas, parseBoneText } from '../../runtime/src/index.js';
import type { SkeletonData } from '../../runtime/src/data.js';

const RAIZ = resolve(__dirname, '..', '..');
const CASOS = join(RAIZ, 'conformidade', 'casos');
const EXECUTOR = join(RAIZ, 'ferramentas', 'conformidade.mjs');
const DIST = join(RAIZ, 'ferramentas', 'dist', 'conformidade');

/**
 * Clock for the two tests that drive the suite through `--adaptador`.
 *
 * Each of them spawns the executor, which spawns ONE subprocess per case and
 * waits for it: 71 process starts, each importing the runtime. On an idle
 * machine that is about 33 seconds; with three chats working it went past the
 * old 180 s and the test went red in the whole suite while staying green on its
 * own.
 *
 * An intermittent red is worse than a broken one. Everybody learns to look at
 * the red and say "ah, that one", and that is exactly how a REAL red goes by
 * unnoticed — and the house rule that the count never falls is worth nothing if
 * the number swings with the machine's load.
 *
 * So the clock goes up and the scope does NOT: this test is what proves the
 * conformance executor can drive a runtime from OUTSIDE this repository, which
 * is the whole reason the suite is of any use to another implementation.
 * Skipping it, or trimming what it proves, would buy a green by giving up the
 * thing being proved.
 */
const ADAPTADOR_TIMEOUT = 600_000;

interface Caso {
  nome: string;
  dir: string;
  nivel: string;
  probe: Probe;
  esperado: PoseDump;
}

function listarCasos(): Caso[] {
  return readdirSync(CASOS, { withFileTypes: true })
    .filter((e) => e.isDirectory() && existsSync(join(CASOS, e.name, 'esperado.json')))
    .map((e) => {
      const dir = join(CASOS, e.name);
      const esperado = JSON.parse(readFileSync(join(dir, 'esperado.json'), 'utf8')) as PoseDump & { probe?: Probe };
      const probeProprio = join(dir, 'probe.json');
      const probe = existsSync(probeProprio)
        ? (JSON.parse(readFileSync(probeProprio, 'utf8')) as Probe)
        : (esperado.probe as Probe);
      return { nome: e.name, dir, nivel: /^([A-Z]+)-/.exec(e.name)![1], probe, esperado };
    })
    .sort((a, b) => (a.nome < b.nome ? -1 : 1));
}

/** As três embalagens da §2.9, na ordem em que o executor as procura. */
const ENTRADAS = ['entrada.bone', 'entrada.boneb', 'entrada.bonez'] as const;

/** O arquivo de entrada do caso, em qualquer uma das três embalagens. */
function entradaDe(dir: string): string | undefined {
  return ENTRADAS.map((n) => join(dir, n)).find((c) => existsSync(c));
}

function carregar(caso: Caso): SkeletonData {
  return carregarComCorpos(caso).data;
}

/**
 * O carregamento completo: o esqueleto e os corpos que as chaves `body`
 * citam (9.13). O `files` é o "resolver" da 2.8: um caso pode trazer ao lado
 * da entrada o filho aninhado (7.11), as animações e peles de fora (2.8) e os
 * corpos da virada — e eles só são lidos de dentro da pasta do caso, como faz
 * `ferramentas/conformidade.mjs`.
 */
function carregarComCorpos(caso: Caso): { data: SkeletonData; bodies: ReturnType<typeof loadSkeletonFile>['bodies'] } {
  const entrada = entradaDe(caso.dir)!;
  const bytes = readFileSync(entrada);
  const atlases: ReturnType<typeof loadAtlas>[] = [];
  // Atlas solto ao lado só existe no `.bone` de texto: o `.boneb` não é JSON e
  // o `.bonez` traz os atlas dentro do pacote.
  if (entrada.endsWith('.bone')) {
    const doc = JSON.parse(readFileSync(entrada, 'utf8')) as { assets?: { atlases?: string[] } };
    for (const uri of doc.assets?.atlases ?? []) {
      const p = join(caso.dir, uri);
      if (existsSync(p)) atlases.push(loadAtlas(parseBoneText(readFileSync(p, 'utf8'))));
    }
  }
  const arquivo = loadSkeletonFile(new Uint8Array(bytes), {
    atlases,
    codec: { inflateRaw: (d: Uint8Array) => inflateRawSync(d) },
    files: (caminho: string) => {
      const alvo = resolve(caso.dir, caminho);
      if (!alvo.startsWith(resolve(caso.dir))) return null;
      return existsSync(alvo) ? new Uint8Array(readFileSync(alvo)) : null;
    },
  });
  return { data: arquivo.data, bodies: arquivo.bodies };
}

function tolerancias(caso: Caso) {
  const base = (caso.probe.physicsDt ?? 0) > 0 ? PHYSICS_TOLERANCES : TOLERANCES;
  return caso.probe.tolerances ? { ...base, ...caso.probe.tolerances } : base;
}

const casos = listarCasos();

// ---------------------------------------------------------------------------
// 1. O runtime de referência passa em todos os casos
// ---------------------------------------------------------------------------

describe('a suíte contra o runtime de referência', () => {
  it('tem casos, e cobre os quatro prefixos da 12.4', () => {
    expect(casos.length).toBeGreaterThanOrEqual(20);
    const niveis = new Set(casos.map((c) => c.nivel));
    for (const n of ['A', 'B', 'C', 'X']) expect(niveis.has(n), `falta caso de nível ${n}`).toBe(true);
  });

  it('todo caso tem entrada, esperado.json, leiame.md e uma sonda', () => {
    for (const caso of casos) {
      expect(entradaDe(caso.dir), `${caso.nome}: falta entrada.bone/.boneb/.bonez`).toBeDefined();
      expect(existsSync(join(caso.dir, 'leiame.md')), `${caso.nome}: falta leiame.md`).toBe(true);
      expect(caso.probe, `${caso.nome}: falta a sonda`).toBeDefined();
      expect(Array.isArray(caso.probe.times), `${caso.nome}: sonda sem times`).toBe(true);
      expect(caso.probe.times.length, `${caso.nome}: sonda sem tempos`).toBeGreaterThan(0);
    }
  });

  it.each(casos.map((c) => [c.nome, c] as const))('%s passa', (_nome, caso) => {
    // Um caso pode exigir RECUSA em vez de pose (2.7, `extensionsRequired`).
    const recusa = (caso.esperado as { recusa?: { contem?: string } }).recusa;
    if (recusa !== undefined) {
      let erro: unknown = null;
      try {
        carregar(caso);
      } catch (e) {
        erro = e;
      }
      expect(erro, `${caso.nome}: o arquivo devia ter sido recusado, e carregou`).not.toBe(null);
      if (recusa.contem !== undefined) {
        expect(String((erro as Error).message)).toContain(recusa.contem);
      }
      return;
    }
    const { data, bodies } = carregarComCorpos(caso);
    const dump = buildPoseDump(data, caso.probe, bodies);
    const r = comparePoseDump(caso.esperado, dump, tolerancias(caso));
    const onde = r.differences.slice(0, 3).map((d) => `${d.pointer}: esperado ${JSON.stringify(d.expected)}, obtido ${JSON.stringify(d.actual)}`);
    expect(onde.join(' | ')).toBe('');
    expect(r.ok).toBe(true);
  });

  it('todo esperado.json com número gerado diz "gerado" no leiame', () => {
    // A regra da suíte: um esperado que saiu do próprio runtime tem que estar
    // marcado. Aqui só se confere que quem se declara gerado é minoria.
    const gerados = casos.filter((c) => /gerado/i.test(readFileSync(join(c.dir, 'leiame.md'), 'utf8').slice(0, 400)));
    expect(gerados.length).toBeLessThan(casos.length / 4);
  });
});

// ---------------------------------------------------------------------------
// 2. Um runtime errado é reprovado — e pelo caso certo
// ---------------------------------------------------------------------------

/** Copia o dump trocando o sinal de `ashearX` e `ashearY`: o erro injetado. */
function inverterShear(dump: PoseDump): PoseDump {
  const copia = JSON.parse(JSON.stringify(dump)) as PoseDump;
  for (const amostra of copia.samples) {
    for (const osso of Object.values(amostra.bones ?? {})) {
      osso.ashearX = -osso.ashearX;
      osso.ashearY = -osso.ashearY;
    }
  }
  return copia;
}

describe('runtime propositalmente errado', () => {
  it('trocar o sinal do shear reprova A-011-shear', () => {
    const caso = casos.find((c) => c.nome === 'A-011-shear');
    expect(caso, 'o caso A-011-shear sumiu da suíte').toBeDefined();
    const errado = inverterShear(buildPoseDump(carregar(caso!), caso!.probe));
    const r = comparePoseDump(caso!.esperado, errado, TOLERANCES);
    expect(r.ok).toBe(false);
    const alvos = r.differences.map((d) => d.pointer);
    expect(alvos).toContain('/samples/0/bones/osso/ashearX');
    expect(alvos).toContain('/samples/0/bones/osso/ashearY');
    // 45 -> -45 são 90 graus de distância circular.
    const dif = r.differences.find((d) => d.pointer.endsWith('ashearX'))!;
    expect(dif.delta).toBeCloseTo(90, 6);
  });

  it('o mesmo erro NÃO derruba um caso sem shear', () => {
    const caso = casos.find((c) => c.nome === 'A-010-heranca-cinco-modos')!;
    const errado = inverterShear(buildPoseDump(carregar(caso), caso.probe));
    expect(comparePoseDump(caso.esperado, errado, TOLERANCES).ok).toBe(true);
  });

  it('um erro de posição menor que a tolerância passa; maior, não', () => {
    const caso = casos.find((c) => c.nome === 'A-011-shear')!;
    const base = buildPoseDump(carregar(caso), caso.probe);

    const quaseCerto = JSON.parse(JSON.stringify(base)) as PoseDump;
    quaseCerto.samples[0].bones!.osso.worldX += 0.0005; // metade da tolerância
    expect(comparePoseDump(caso.esperado, quaseCerto, TOLERANCES).ok).toBe(true);

    const errado = JSON.parse(JSON.stringify(base)) as PoseDump;
    errado.samples[0].bones!.osso.worldX += 0.002; // o dobro da tolerância
    const r = comparePoseDump(caso.esperado, errado, TOLERANCES);
    expect(r.ok).toBe(false);
    expect(r.differences[0].pointer).toBe('/samples/0/bones/osso/worldX');
  });

  it('evento, ordem de desenho e nome são exatos, sem tolerância', () => {
    const caso = casos.find((c) => c.nome === 'A-023-draworder-offsets')!;
    const errado = buildPoseDump(carregar(caso), caso.probe);
    const ordem = errado.samples[0].drawOrder!;
    [ordem[0], ordem[1]] = [ordem[1], ordem[0]];
    expect(comparePoseDump(caso.esperado, errado, TOLERANCES).ok).toBe(false);
  });

  // Rodada 11, 05/10/2026: os 11 casos de `drawList` apareciam como "passou"
  // num runtime que não tinha o canal. O esperado citava um canal que o
  // executor não conhecia, e ele o pulava calado (regras 21 e 28).
  it('canal que o executor não conhece REPROVA, com o nome do canal', () => {
    const caso = casos.find((c) => c.nome === 'A-011-shear')!;
    const dump = buildPoseDump(carregar(caso), caso.probe);
    const esperado = JSON.parse(JSON.stringify(caso.esperado)) as PoseDump;
    (esperado.samples[0] as unknown as Record<string, unknown>).canalQueNinguemConhece = ['ERRADO/ERRADO'];
    const r = comparePoseDump(esperado, dump, TOLERANCES);
    expect(r.ok).toBe(false);
    expect(r.differences.map((d) => d.pointer)).toContain('/samples/0/canalQueNinguemConhece');
  });

  it('canal conhecido que o runtime NÃO devolve reprova, um por um', () => {
    const caso = casos.find((c) => c.nome === 'A-011-shear')!;
    const dump = buildPoseDump(carregar(caso), caso.probe);
    const vazios: Record<string, unknown> = {
      bones: { osso: { worldX: 0 } }, slots: { s: { attachment: null } }, drawOrder: ['s'],
      drawList: [{ piece: 's/s', clips: [] }], vertices: { 's/s': [0, 0] }, uvs: { 's/s': [0, 0] },
      boundingBoxes: { 's/s': [0, 0] }, points: { 's/s': { x: 0 } }, particles: { 's/s': [] },
      events: [{ event: 'e' }], tags: ['t'], variables: { v: 1 }, parameters: { p: 1 },
    };
    for (const [canal, valor] of Object.entries(vazios)) {
      const esperado = { version: '1.0', samples: [{ time: 0, [canal]: valor }] } as unknown as PoseDump;
      const obtido = { version: '1.0', samples: [{ time: dump.samples[0].time }] } as unknown as PoseDump;
      expect(comparePoseDump(esperado, obtido, TOLERANCES).ok, `canal ${canal} ausente do dump`).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// 3. Formato exato do pose dump (12.4)
// ---------------------------------------------------------------------------

describe('formato do pose dump', () => {
  const caso = casos.find((c) => c.nome === 'A-011-shear')!;

  it('a raiz é { version, samples } com a versão da 12.4', () => {
    const dump = buildPoseDump(carregar(caso), caso.probe);
    expect(Object.keys(dump).sort()).toEqual(['samples', 'version']);
    expect(dump.version).toBe(POSE_DUMP_VERSION);
    expect(dump.samples).toHaveLength(caso.probe.times.length);
  });

  it('cada osso traz a matriz de mundo e a pose aplicada, nesta ordem de campos', () => {
    const dump = buildPoseDump(carregar(caso), caso.probe);
    const osso = dump.samples[0].bones!.osso;
    expect(Object.keys(osso)).toEqual([
      'a', 'b', 'c', 'd', 'worldX', 'worldY',
      'ax', 'ay', 'arotation', 'ascaleX', 'ascaleY', 'ashearX', 'ashearY',
    ]);
    for (const v of Object.values(osso)) expect(Number.isFinite(v)).toBe(true);
  });

  it('os ângulos saem reduzidos a (-180, 180]', () => {
    const rot = casos.find((c) => c.nome === 'A-021-rotacao-sem-volta')!;
    const dump = buildPoseDump(carregar(rot), rot.probe);
    for (const amostra of dump.samples) {
      const a = amostra.bones!.giro.arotation;
      expect(a).toBeGreaterThan(-180);
      expect(a).toBeLessThanOrEqual(180);
    }
    // O valor cru em t = 0 é 350; reduzido, -10.
    expect(dump.samples[0].bones!.giro.arotation).toBeCloseTo(-10, 6);
  });

  it('todo número tem no máximo 6 casas decimais', () => {
    for (const c of casos) {
      if ((c.esperado as { recusa?: unknown }).recusa !== undefined) continue;
      const texto = JSON.stringify(buildPoseDump(carregar(c), c.probe));
      const longos = texto.match(/-?\d+\.\d{7,}/g);
      expect(longos, `${c.nome}: número com mais de 6 casas: ${longos?.[0]}`).toBeNull();
    }
  });

  it('os blocos escritos são exatamente os que a sonda pede, mais o body de toda amostra', () => {
    const data = carregar(caso);
    const so = buildPoseDump(data, { times: [0], measure: ['bones'] });
    // Spec 12.4 (rascunho 0.2): `body` vai em TODA amostra, pedida ou não;
    // `null` = o corpo do arquivo. O resto é só o que a sonda pede.
    expect(Object.keys(so.samples[0]).sort()).toEqual(['body', 'bones', 'time']);
    expect(so.samples[0].body).toBeNull();

    const tudo = buildPoseDump(data, {
      times: [0],
      measure: ['bones', 'slots', 'drawOrder', 'vertices', 'uvs', 'events', 'points', 'boundingBoxes', 'tags', 'variables', 'parameters'],
    });
    expect(Object.keys(tudo.samples[0]).sort()).toEqual([
      'body', 'boundingBoxes', 'bones', 'drawOrder', 'events', 'parameters', 'points', 'slots', 'tags', 'time', 'uvs', 'variables', 'vertices',
    ].sort());
  });

  it('o bloco de slot traz attachment, cor, cor escura, visível, frame e o osso aplicado', () => {
    const seq = casos.find((c) => c.nome === 'B-110-sequencia-sete-modos')!;
    const dump = buildPoseDump(carregar(seq), { ...seq.probe, measure: ['slots'] });
    const slot = dump.samples[0].slots!.loop;
    // Spec 12.4 (rascunho 0.2): `bone` é o osso APLICADO do slot (9.5).
    expect(Object.keys(slot).sort()).toEqual(['attachment', 'bone', 'color', 'darkColor', 'sequenceIndex', 'visible']);
    expect(slot.color).toHaveLength(4);
    const data = carregar(seq);
    expect(slot.bone).toBe(data.findSlot('loop')!.bone.name);
  });

  it('evento do filho: nome com o slot na frente e time no relógio do PAI (Apêndice C, regras 6 e 7)', () => {
    const h = { version: '1.0', minVersion: '1.0', generator: 'teste evento filho' };
    const filho = loadSkeletonData({
      bone: h, bones: [{ name: 'root' }], events: [{ name: 'tiro' }, { name: 'zumbido' }],
      animations: [
        { name: 'atirar', duration: 1, timelines: [{ type: 'event', keys: [{ time: 0.5, event: 'tiro' }] }] },
        { name: 'fundo', duration: 1, timelines: [{ type: 'event', keys: [{ time: 0.25, event: 'zumbido' }] }] },
      ],
    });
    const pai = loadSkeletonData({
      bone: h, bones: [{ name: 'root' }],
      slots: [{ name: 'arma', bone: 'root', attachment: 'a' }],
      skins: [{ name: 'default', attachments: { arma: { a: {
        type: 'skeleton', uri: 'arma.bone', animation: 'atirar', baseAnimation: 'fundo', timeScale: 2,
      } } } }],
      animations: [{ name: 'parado', duration: 1, timelines: [] }],
    }, { skeletons: new Map([['arma.bone', filho]]) });
    // Relógio do filho = 2 x pai. Em 0,3 do pai: filho em 0,6 -> tiro (0,5) e zumbido (0,25).
    // time no pai: 0,3 - (0,6 - 0,5)/2 = 0,25; 0,3 - (0,6 - 0,25)/2 = 0,125.
    const dump = buildPoseDump(pai, { animation: 'parado', times: [0.3], measure: ['events'] });
    const eventos = dump.samples[0].events!.map((e) => [e.event, e.time]).sort();
    expect(eventos).toEqual([['arma/tiro', 0.25], ['arma/zumbido', 0.125]]);
  });

  it('o evento traz os valores efetivos: chave por cima da definição', () => {
    const ev = casos.find((c) => c.nome === 'A-027-evento-em-laco')!;
    const dump = buildPoseDump(carregar(ev), ev.probe);
    const primeiro = dump.samples[0].events![0];
    expect(Object.keys(primeiro).sort()).toEqual(['balance', 'event', 'float', 'int', 'string', 'time', 'volume']);
    expect(primeiro.event).toBe('passo');
    expect(primeiro.int).toBe(2);          // da chave
    expect(primeiro.string).toBe('esquerdo'); // da definição
    expect(primeiro.volume).toBeCloseTo(0.8, 6);
  });

  it('o expected declara o que é comparado: campo ausente não é olhado', () => {
    const dump = buildPoseDump(carregar(caso), caso.probe);
    const soUmCampo: PoseDump = { version: '1.0', samples: [{ time: 0, bones: { osso: { worldX: 5 } as never } }] };
    expect(comparePoseDump(soUmCampo, dump, TOLERANCES).ok).toBe(true);
    const errado: PoseDump = { version: '1.0', samples: [{ time: 0, bones: { osso: { worldX: 999 } as never } }] };
    expect(comparePoseDump(errado, dump, TOLERANCES).ok).toBe(false);
  });

  it('formatPoseDump devolve JSON válido e reconstrói o mesmo dump', () => {
    const dump = buildPoseDump(carregar(caso), caso.probe);
    const texto = formatPoseDump(dump);
    expect(texto.endsWith('\n')).toBe(true);
    expect(JSON.parse(texto)).toEqual(dump);
  });

  it('com physicsDt, um tempo pedido fora do passo é recusado com mensagem clara', () => {
    const data = carregar(caso);
    expect(() => buildPoseDump(data, { times: [0, 0.015], physicsDt: 0.01 }))
      .toThrow(/múltiplo do passo/);
  });
});

// ---------------------------------------------------------------------------
// 4 e 5. O executor de linha de comando
// ---------------------------------------------------------------------------

function rodar(args: string[], cwd = RAIZ): { code: number; out: string; err: string } {
  try {
    const out = execFileSync(process.execPath, [EXECUTOR, ...args], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { code: 0, out, err: '' };
  } catch (erro) {
    const e = erro as { status?: number; stdout?: string; stderr?: string };
    return { code: e.status ?? 1, out: e.stdout ?? '', err: e.stderr ?? '' };
  }
}

describe('executor de linha de comando', () => {
  beforeAll(() => {
    // A primeira chamada compila runtime -> ferramentas/dist/conformidade.
    rodar(['--caso', 'A-011-shear']);
  }, 180_000);

  it('roda todos os casos e sai com código 0', () => {
    const r = rodar([]);
    expect(r.err).toBe('');
    expect(r.out).toContain('Caso');
    expect(r.out).toContain('Nível');
    expect(r.out).toContain('Maior diferença');
    expect(r.out).toMatch(/\n\d+ de \d+ passaram\./);
    expect(r.out).not.toContain('FALHOU');
    expect(r.code).toBe(0);
  }, 120_000);

  // F17: o §12.4 passo 3 pede "nível alcançado" no relatório, e ele faltava —
  // quem consumisse o JSON tinha que recalcular a regra 5 por fora.
  it('a regra 5 da 12.4 vira o campo "level" do relatório', async () => {
    const { nivelAlcancado } = await import(/* @vite-ignore */
      new URL('../conformidade.mjs', import.meta.url).href) as {
        nivelAlcancado: (p: Record<string, { total: number; passaram: number }>) =>
          { level: string | null; missingCategories: string[] };
      };
    const cheio = (t: number) => ({ total: t, passaram: t });
    const meio = (t: number) => ({ total: t, passaram: t - 1 });

    // Tudo em ordem: nível C.
    expect(nivelAlcancado({
      A: cheio(11), B: cheio(4), C: cheio(17), X: cheio(5), BIN: cheio(1), ZIP: cheio(1),
    })).toEqual({ level: 'C', missingCategories: [] });

    // Um caso C falhando derruba para B. "Um caso é um caso."
    expect(nivelAlcancado({
      A: cheio(11), B: cheio(4), C: meio(17), X: cheio(5), BIN: cheio(1), ZIP: cheio(1),
    }).level).toBe('B');

    // Sem os casos X não há nível nenhum: compatibilidade não é opcional.
    expect(nivelAlcancado({
      A: cheio(11), B: cheio(4), C: cheio(17), X: meio(5), BIN: cheio(1), ZIP: cheio(1),
    }).level).toBe(null);

    // O ponto de F17/F2: categoria VAZIA não conta como aprovada. Era isso que
    // deixava "todos os casos BIN e ZIP" ser um conjunto vazio que qualquer
    // runtime satisfazia.
    const semEmbalagem = nivelAlcancado({ A: cheio(11), B: cheio(4), C: cheio(17), X: cheio(5) });
    expect(semEmbalagem.level).toBe('B');
    expect(semEmbalagem.missingCategories).toEqual(['BIN', 'ZIP']);
  });

  it('--json devolve um relatório de máquina completo', () => {
    const r = rodar(['--json']);
    expect(r.code).toBe(0);
    const relatorio = JSON.parse(r.out) as {
      suite: string; formatVersion: string; total: number; passed: number; failed: number;
      byLevel: Record<string, { total: number; passaram: number }>;
      cases: { caso: string; nivel: string; passou: boolean }[];
    };
    expect(relatorio.suite).toBe('bone-conformance');
    expect(relatorio.formatVersion).toBe('1.0');
    expect(relatorio.failed).toBe(0);
    expect(relatorio.passed).toBe(relatorio.total);
    expect(relatorio.total).toBe(casos.length);
    expect(relatorio.cases.every((c) => c.passou)).toBe(true);
    for (const n of ['A', 'B', 'C', 'X']) expect(relatorio.byLevel[n].total).toBeGreaterThan(0);
  }, 120_000);

  it('--nivel filtra por nível', () => {
    const r = rodar(['--nivel', 'A', '--json']);
    expect(r.code).toBe(0);
    const relatorio = JSON.parse(r.out) as { cases: { nivel: string }[] };
    expect(relatorio.cases.every((c) => c.nivel === 'A')).toBe(true);
    expect(relatorio.cases.length).toBe(casos.filter((c) => c.nivel === 'A').length);
  }, 120_000);

  it('--caso desconhecido é erro claro, não silêncio', () => {
    const r = rodar(['--caso', 'nao-existe']);
    expect(r.code).toBe(2);
    expect(r.err).toContain('caso não encontrado');
  }, 120_000);

  it('--gerar regrava os esperado.json e depois tudo fica verde', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'conform-'));
    try {
      cpSync(CASOS, tmp, { recursive: true });
      // Estraga um esperado de propósito.
      const alvo = join(tmp, 'A-011-shear', 'esperado.json');
      const bom = JSON.parse(readFileSync(alvo, 'utf8')) as PoseDump;
      const ruim = JSON.parse(JSON.stringify(bom)) as PoseDump;
      ruim.samples[0].bones!.osso.ashearX = -45;
      writeFileSync(alvo, JSON.stringify(ruim, null, 2), 'utf8');

      const antes = rodar(['--casos', tmp]);
      expect(antes.code).toBe(1);
      expect(antes.out).toContain('FALHOU');

      const gerar = rodar(['--gerar', '--casos', tmp]);
      expect(gerar.code).toBe(0);

      const depois = rodar(['--casos', tmp]);
      expect(depois.code).toBe(0);
      expect(depois.out).not.toContain('FALHOU');

      // A sonda tem que sobreviver ao --gerar.
      const regravado = JSON.parse(readFileSync(alvo, 'utf8')) as PoseDump & { probe: Probe };
      expect(regravado.probe).toBeDefined();
      expect(regravado.probe.times).toEqual([0]);
      expect(regravado.samples[0].bones!.osso.ashearX).toBeCloseTo(45, 6);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  }, 180_000);

  // P9: o adaptador de referência é o arquivo que um implementador de fora lê
  // linha a linha quando o dele diverge. Se ele parar de passar, o guia passa
  // a mentir, e é o único exemplo executável que existe.
  it('o adaptador de referência passa nos casos, pelo caminho de fora', () => {
    const adaptador = join(RAIZ, 'conformidade', 'adaptador-referencia.mjs');
    expect(existsSync(adaptador), 'falta conformidade/adaptador-referencia.mjs').toBe(true);
    const r = rodar(['--adaptador', `"${process.execPath}" "${adaptador}"`, '--json']);
    const relatorio = JSON.parse(r.out) as {
      total: number; passed: number; cases: { caso: string; passou: boolean }[];
    };
    const reprovados = relatorio.cases.filter((c) => !c.passou).map((c) => c.caso);
    expect(reprovados).toEqual([]);
    expect(relatorio.passed).toBe(relatorio.total);
    expect(r.code).toBe(0);
  }, ADAPTADOR_TIMEOUT);

  it('--adaptador roda outro runtime, e um adaptador errado é reprovado', () => {
    expect(existsSync(join(DIST, 'ferramentas', 'src', 'conformidade', 'pose-dump.js')),
      'o dist do runtime de referência não foi compilado').toBe(true);
    const tmp = mkdtempSync(join(tmpdir(), 'adaptador-'));
    try {
      const adaptador = join(tmp, 'adaptador-errado.mjs');
      writeFileSync(adaptador, adaptadorErrado(), 'utf8');

      const r = rodar(['--adaptador', `"${process.execPath}" "${adaptador}"`, '--json']);
      expect(r.code).toBe(1);
      const relatorio = JSON.parse(r.out) as { cases: { caso: string; passou: boolean }[] };
      const reprovados = relatorio.cases.filter((c) => !c.passou).map((c) => c.caso);
      // Os dois casos com shear reprovam por causa do sinal trocado, e nada
      // mais. O X-305 passa de propósito: o adaptador estoura ao carregar um
      // arquivo que 2.7 manda recusar, e a mensagem do erro cita a extensão,
      // que é exatamente o que o caso pede.
      expect(reprovados).toEqual(['A-011-shear', 'C-230-transform-com-shear']);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  }, ADAPTADOR_TIMEOUT);
});

/**
 * Adaptador de terceiro, de propósito errado: usa o runtime de referência e
 * troca o sinal do shear na saída. É o formato exato que a 12.4 pede — pasta
 * do caso no argumento, sonda na entrada padrão, pose dump na saída padrão.
 */
function adaptadorErrado(): string {
  const dump = join(DIST, 'ferramentas', 'src', 'conformidade', 'pose-dump.js').replace(/\\/g, '/');
  const core = join(DIST, 'runtime', 'src', 'index.js').replace(/\\/g, '/');
  return `import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { inflateRawSync } from 'node:zlib';
const { buildPoseDump } = await import('file:///${dump}');
const { loadSkeletonFile, loadAtlas, parseBoneText } = await import('file:///${core}');

const pasta = process.argv[process.argv.length - 1];
let entrada = '';
for await (const pedaco of process.stdin) entrada += pedaco;
const sonda = JSON.parse(entrada);

const caminho = ['entrada.bone', 'entrada.boneb', 'entrada.bonez']
  .map((n) => join(pasta, n))
  .find((c) => existsSync(c));
const atlases = [];
if (caminho.endsWith('.bone')) {
  const doc = JSON.parse(readFileSync(caminho, 'utf8'));
  for (const uri of doc.assets?.atlases ?? []) {
    const p = join(pasta, uri);
    if (existsSync(p)) atlases.push(loadAtlas(parseBoneText(readFileSync(p, 'utf8'))));
  }
}
// O mesmo resolver do executor (2.8): os casos do 0.2 leem arquivo vizinho.
// O erro deste adaptador é só o sinal do shear, mais nada.
const { data, bodies } = loadSkeletonFile(new Uint8Array(readFileSync(caminho)), {
  atlases,
  codec: { inflateRaw: (d) => inflateRawSync(d) },
  files: (pedido) => {
    const alvo = join(pasta, pedido);
    return existsSync(alvo) ? new Uint8Array(readFileSync(alvo)) : null;
  },
});
const saida = buildPoseDump(data, sonda, bodies);

// O erro injetado: sinal do shear trocado.
for (const amostra of saida.samples) {
  for (const osso of Object.values(amostra.bones ?? {})) {
    osso.ashearX = -osso.ashearX;
    osso.ashearY = -osso.ashearY;
  }
}
process.stdout.write(JSON.stringify(saida));
`;
}

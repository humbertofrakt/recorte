/**
 * Acabamento e avisos — os testes por assunto (lote A3, v10.6).
 *
 * Um `describe` por arquivo antigo, com o nome e o cabeçalho dele, e os
 * mesmos testes dentro. O miolo vai sem recuo: um texto de várias linhas
 * não pode mudar.
 *
 * Juntou: `lote48-acabamento`, `lote49-avisos-com-nome`.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { describeManual } from './manual-pausado.js';
import { CanvasRenderer, Skeleton, loadAtlas, loadSkeletonData, smoothingFor } from '../../runtime/src/index.js';
import type { BoneFile } from '../../runtime/src/index.js';
import { arrowDirection, stepValue } from '../src/panels/properties-model.js';
import type { StepModifiers } from '../src/panels/properties-model.js';
import { allMenus, flatEntries } from '../src/ui/menus.js';
import type { MenuState } from '../src/ui/menus.js';
import { viewMenuState } from './ajuda-view.js';
import { describePointer, fixFor, panelFor, parseWarning, translateWarning, warningRow } from '../src/panels/warning-model.js';

// ---------------------------------------------------------------------------
// acabamento (lote 48) — era `lote48-acabamento.test.ts`
// ---------------------------------------------------------------------------

describe('acabamento (lote 48)', () => {
/**
 * Lote 48 — rodada 5, acabamento: quatro pequenos.
 *
 * a) **Arte em pixel desliga o filtro** (R9): `smoothingFor`, e o renderizador
 *    do runtime pondo `imageSmoothingEnabled` no contexto antes de desenhar as
 *    páginas do atlas — no contexto da cena e no rascunho da tinta.
 * b) **Setas nos campos de número**: `stepValue` e `arrowDirection`, puros.
 * c) **Nenhum cabeçalho fixo** nas colunas de painéis: a coluna não rola, e
 *    nenhuma folha dos painéis usa `position: sticky`.
 * d) **O cap. 1 em inglês com a tabela do menu Arquivo**, item por item.
 *
 * Sem DOM: o contexto 2D é um falso que guarda o estado como o de verdade
 * (`save` e `restore`) e anota, a cada `drawImage` da página, se o filtro
 * estava ligado.
 */
const RAIZ = resolve(__dirname, '..', '..');
const EXEMPLOS = resolve(RAIZ, 'formato', 'exemplos');
const MANUAL = resolve(RAIZ, 'documentos', 'manual');
const SRC = resolve(__dirname, '../src');

function heroi(): BoneFile {
  return JSON.parse(readFileSync(join(EXEMPLOS, 'heroi.bone'), 'utf8')) as BoneFile;
}

/** O herói posado, pronto para desenhar. `mexer` muda o arquivo antes de carregar. */
function heroiPosado(mexer: (file: BoneFile) => void = () => {}): Skeleton {
  const file = heroi();
  mexer(file);
  const atlas = loadAtlas(JSON.parse(readFileSync(join(EXEMPLOS, 'heroi.atlas.json'), 'utf8')));
  const skeleton = new Skeleton(loadSkeletonData(file, { atlases: [atlas] }));
  skeleton.setToSetupPose();
  skeleton.updateWorldTransform(0);
  return skeleton;
}

function comPixelArt(file: BoneFile): void {
  const f = file as { skeleton?: Record<string, unknown> };
  f.skeleton = { ...(f.skeleton ?? {}), pixelArt: true };
}

/** Uma cor em todo slot: todo desenho passa pelo rascunho da tinta (§7.12). */
function comTinta(file: BoneFile): void {
  for (const slot of (file as { slots?: Array<{ color?: number[] }> }).slots ?? []) {
    slot.color = [1, 0.5, 0.5, 1];
  }
}

// ---------------------------------------------------------------------------
// O contexto 2D de mentira
// ---------------------------------------------------------------------------

/** A imagem da página do atlas. Só a identidade importa: é por ela que se anota. */
const PAGINA = { pagina: 'heroi' } as unknown as CanvasImageSource;

/**
 * Um contexto que guarda o estado como o de verdade e anota, em `filtros`, o
 * `imageSmoothingEnabled` de cada `drawImage` DA PÁGINA. Os `drawImage` de um
 * rascunho no outro (máscara, termo escuro) são 1:1 e não entram na conta.
 */
function contextoFalso(filtros: boolean[]): CanvasRenderingContext2D {
  const estado: Record<string, unknown> = {
    imageSmoothingEnabled: true, globalAlpha: 1, globalCompositeOperation: 'source-over',
    fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, lineJoin: 'miter', lineCap: 'butt',
  };
  const pilha: Array<Record<string, unknown>> = [];
  const metodos: Record<string | symbol, unknown> = {
    canvas: { width: 64, height: 64 },
    save: () => { pilha.push({ ...estado }); },
    restore: () => {
      const antes = pilha.pop();
      if (antes !== undefined) Object.assign(estado, antes);
    },
    getTransform: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }),
    drawImage: (imagem: unknown) => {
      if (imagem === PAGINA) filtros.push(estado.imageSmoothingEnabled as boolean);
    },
  };
  return new Proxy(metodos, {
    get: (alvo, chave) => {
      if (typeof chave === 'string' && chave in estado) return estado[chave];
      if (chave in alvo) return alvo[chave];
      return () => {};
    },
    set: (alvo, chave, valor) => {
      if (typeof chave === 'string' && chave in estado) estado[chave] = valor;
      else alvo[chave] = valor;
      return true;
    },
  }) as unknown as CanvasRenderingContext2D;
}

/** Desenha um quadro e devolve o filtro de cada página, e o do contexto depois. */
function desenhar(skeleton: Skeleton): { filtros: boolean[]; depois: boolean } {
  const filtros: boolean[] = [];
  const ctx = contextoFalso(filtros);
  const renderer = new CanvasRenderer(ctx, {
    images: () => PAGINA,
    createScratch: () => contextoFalso(filtros),
  });
  renderer.draw(skeleton);
  return { filtros, depois: ctx.imageSmoothingEnabled };
}

// ---------------------------------------------------------------------------
// a) Arte em pixel
// ---------------------------------------------------------------------------

describe('smoothingFor — a marca "Arte em pixel" (§4.1)', () => {
  it('pixelArt: true → sem filtro', () => {
    expect(smoothingFor({ pixelArt: true })).toBe(false);
  });

  it('sem o campo, com false, ou sem nada → com filtro', () => {
    expect(smoothingFor({})).toBe(true);
    expect(smoothingFor({ pixelArt: false })).toBe(true);
    expect(smoothingFor(undefined)).toBe(true);
    expect(smoothingFor(null)).toBe(true);
  });

  it('lê o `skeleton` do arquivo e o `meta` do runtime do mesmo jeito', () => {
    const file = heroi();
    comPixelArt(file);
    expect(smoothingFor(file.skeleton)).toBe(false);
    expect(smoothingFor(loadSkeletonData(file).meta)).toBe(false);
    expect(smoothingFor(loadSkeletonData(heroi()).meta)).toBe(true);
  });
});

describe('o renderizador do runtime obedece a marca — cena, Prévia, miniatura e exportação', () => {
  it('sem a marca: toda página é desenhada com filtro', () => {
    const { filtros } = desenhar(heroiPosado());
    expect(filtros.length).toBeGreaterThan(10);
    expect(filtros.every((ligado) => ligado)).toBe(true);
  });

  it('com Arte em pixel: nenhuma página com filtro, e o contexto volta como estava', () => {
    const { filtros, depois } = desenhar(heroiPosado(comPixelArt));
    expect(filtros.length).toBeGreaterThan(10);
    expect(filtros.every((ligado) => !ligado)).toBe(true);
    // O `save`/`restore` do `draw` devolve o filtro: a régua e a imagem de
    // referência, desenhadas depois na mesma cena, não herdam a marca.
    expect(depois).toBe(true);
  });

  it('com Arte em pixel e cor no slot: o rascunho da tinta também sem filtro', () => {
    const { filtros } = desenhar(heroiPosado((file) => { comPixelArt(file); comTinta(file); }));
    expect(filtros.length).toBeGreaterThan(10);
    expect(filtros.every((ligado) => !ligado)).toBe(true);
  });

  it('a mesma cor, sem a marca: o rascunho desenha com filtro', () => {
    const { filtros } = desenhar(heroiPosado(comTinta));
    expect(filtros.every((ligado) => ligado)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// b) Setas nos campos de número
// ---------------------------------------------------------------------------

describe('stepValue — um toque de seta num campo de número', () => {
  const CASOS: ReadonlyArray<{ valor: number; direcao: number; passo: number; teclas: StepModifiers; esperado: number }> = [
    { valor: 10, direcao: 1, passo: 1, teclas: {}, esperado: 11 },
    { valor: 10, direcao: -1, passo: 1, teclas: { shift: true }, esperado: 0 },
    { valor: 1, direcao: 1, passo: 1, teclas: { alt: true }, esperado: 1.1 },
    { valor: 0.35, direcao: 1, passo: 0.1, teclas: {}, esperado: 0.45 },
  ];
  for (const caso of CASOS) {
    it(`(${caso.valor}, ${caso.direcao}, ${caso.passo}, ${JSON.stringify(caso.teclas)}) → ${caso.esperado}`, () => {
      expect(stepValue(caso.valor, caso.direcao, caso.passo, caso.teclas)).toBe(caso.esperado);
    });
  }

  it('0,35 + 0,1 é 0,45 exato, e não o 0,44999… do ponto flutuante', () => {
    expect(0.35 + 0.1).not.toBe(0.45);
    expect(stepValue(0.35, 1, 0.1)).toBe(0.45);
  });

  it('nunca devolve −0', () => {
    expect(Object.is(stepValue(1, -1, 1), 0)).toBe(true);
  });

  it('passo inválido vale 1; valor que não é número vale 0', () => {
    expect(stepValue(5, 1, 0)).toBe(6);
    expect(stepValue(Number.NaN, 1, 1)).toBe(1);
  });
});

describe('arrowDirection — só ↑ e ↓ são do campo', () => {
  it('↑ é +1, ↓ é −1, o resto é 0', () => {
    expect(arrowDirection('ArrowUp')).toBe(1);
    expect(arrowDirection('ArrowDown')).toBe(-1);
    expect(arrowDirection('ArrowLeft')).toBe(0);
    expect(arrowDirection('k')).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// c) Nenhum cabeçalho fixo nas colunas
// ---------------------------------------------------------------------------

function folhas(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...folhas(full));
    else if (full.endsWith('.css')) out.push(full);
  }
  return out;
}

describe('nenhum cabeçalho fixo tapa a primeira linha de um painel', () => {
  /*
   * O defeito do fim da fase 8 — o cabeçalho "Animações" cortando a linha
   * "Nova · Duplicar · Renomear" — era do layout de painéis empilhados, e sumiu
   * com as abas do item 19. Conferido no navegador em 1440×900: nenhum
   * elemento fixo na coluna da direita, e os cinco botões respondem ao clique
   * no topo e no fim do rolo. Estes dois testes prendem as duas razões.
   */
  it('só a linha do tempo e a janela de diálogo usam `position: sticky`', () => {
    const PERMITIDAS = new Set(['dialog.css', 'dopesheet.css']);
    const achadas = folhas(SRC)
      .filter((file) => !PERMITIDAS.has(basename(file)))
      .filter((file) => /position:\s*sticky/.test(readFileSync(file, 'utf8')))
      .map((file) => basename(file));
    expect(achadas).toEqual([]);
  });

  it('a coluna de painéis não rola: quem rola é o corpo de cada painel', () => {
    const css = readFileSync(join(SRC, 'ui', 'shell.css'), 'utf8');
    const bloco = /\.panel-column\s*\{[^}]*\}/.exec(css)?.[0] ?? '';
    expect(bloco).toMatch(/overflow:\s*hidden/);
  });
});

// ---------------------------------------------------------------------------
// d) O cap. 1 com a tabela do menu Arquivo, nas duas línguas
// ---------------------------------------------------------------------------

function estadoDoMenu(): MenuState {
  return {
    canRepack: true,
    canUndo: false,
    undoLabel: null,
    canRedo: false,
    redoLabel: null,
    view: viewMenuState(),
    lockBones: false,
    lockDrawings: false,
    space: 'local',
    compensation: { children: false, drawings: false, boxes: false },
    animating: true,
    loop: false,
    open: {},
  };
}

/** O trecho entre `inicio` e `fim`, com os espaços achatados. */
function trecho(texto: string, inicio: string, fim: string): string {
  const i = texto.indexOf(inicio);
  if (i < 0) return '';
  const j = texto.indexOf(fim, i + inicio.length);
  return texto.slice(i, j < 0 ? undefined : j).replace(/\s+/g, ' ');
}

describeManual('o menu Arquivo, item por item, nas duas línguas', () => {
  const arquivo = allMenus(estadoDoMenu()).find((grupo) => grupo.label === 'Arquivo');
  const rotulos = flatEntries(arquivo?.entries ?? []).map((e) => e.label).filter((l) => l.trim() !== '');

  it('o menu tem os itens de sempre', () => {
    expect(rotulos).toContain('Configurações do projeto…');
    expect(rotulos).toContain('PSD com ossos…');
  });

  it('o cap. 1 em inglês tem a tabela, com todo item e o rótulo português', () => {
    const en = readFileSync(join(MANUAL, 'en', '01-open-recorte.md'), 'utf8');
    const tabela = trecho(en, '## The File menu, item by item', '\n---');
    expect(tabela).not.toBe('');
    expect(rotulos.filter((rotulo) => !tabela.includes(rotulo))).toEqual([]);
  });

  it('em inglês, as Configurações dizem os dois campos do lote 46', () => {
    const en = readFileSync(join(MANUAL, 'en', '01-open-recorte.md'), 'utf8');
    const tabela = trecho(en, '## The File menu, item by item', '\n---');
    expect(tabela).toContain('animation switch');
    expect(tabela).toContain('mix time');
  });

  it('a tabela em português também tem todo item', () => {
    const pt = readFileSync(join(MANUAL, '01-abrir-o-recorte.md'), 'utf8');
    const tabela = trecho(pt, '### Arquivo', '### Editar');
    expect(tabela).not.toBe('');
    expect(rotulos.filter((rotulo) => !tabela.includes(rotulo))).toEqual([]);
  });
});
});

// ---------------------------------------------------------------------------
// avisos com nome (lote 49) — era `lote49-avisos-com-nome.test.ts`
// ---------------------------------------------------------------------------

describe('avisos com nome (lote 49)', () => {
/**
 * Lote 49 — avisos com nome de gente, e o botão Ir para (R11).
 * Plano: `documentos/planos/PLANO rodada 5 - acabamento 2026-09-10.md`.
 *
 * A lista na tela é DOM (regra 8); aqui fica a conta: o ponteiro com os
 * nomes, as frases do leitor em português, o conserto, e o aviso de verdade
 * que o leitor dá para uma imagem que falta.
 */
const EXEMPLOS = 'C:/Users/F-rak/Desktop/animador/formato/exemplos/';

function heroi(): BoneFile {
  return JSON.parse(readFileSync(`${EXEMPLOS}heroi.bone`, 'utf8')) as BoneFile;
}

describe('describePointer', () => {
  const file = heroi();

  it('desenho de uma pele', () => {
    expect(describePointer(file, '/skins/0/attachments/body')).toEqual({
      text: 'skin "default" › desenho "body"',
      target: { kind: 'attachment', skin: 'default', slot: 'body', name: 'body' },
    });
    expect(describePointer(file, '/skins/0/attachments/body/body/path').text)
      .toBe('skin "default" › desenho "body" › path');
  });

  it('osso, animação e cabeçalho', () => {
    const osso = describePointer(file, '/bones/3/rotation');
    expect(osso.text).toBe(`osso "${file.bones[3]!.name}" › rotation`);
    expect(osso.target?.kind).toBe('bone');
    expect(describePointer(file, '/animations/1/timelines/0')).toEqual({
      text: 'animação "walk" › linha 1', target: { kind: 'animation', name: 'walk' },
    });
    expect(describePointer(file, '/skeleton/version')).toEqual({
      text: 'cabeçalho › version', target: { kind: 'skeleton' },
    });
  });

  it('ponteiro que não existe no arquivo volta cru, sem alvo', () => {
    expect(describePointer(file, '/bones/99/x')).toEqual({ text: '/bones/99/x', target: null });
    expect(describePointer(file, '/nada/0')).toEqual({ text: '/nada/0', target: null });
  });
});

describe('translateWarning e fixFor', () => {
  it('as três frases de forma fixa', () => {
    expect(translateWarning('image "body" not found in any atlas')).toBe('imagem "body" não está em nenhum atlas');
    expect(translateWarning('image "body" not found in any atlas; attachment will be invisible'))
      .toBe('imagem "body" não está em nenhum atlas; o desenho fica invisível');
    expect(translateWarning('unknown value "xyz", using "normal"')).toBe('valor "xyz" desconhecido; usando "normal"');
    expect(translateWarning('file version 1.3 newer than reader 1.0: partial read'))
      .toBe('arquivo na versão 1.3, leitor na 1.0: leitura parcial');
    expect(translateWarning('outra coisa qualquer')).toBe('outra coisa qualquer');
  });

  it('o conserto de cada uma', () => {
    expect(fixFor('image "body" not found in any atlas')).toEqual({ label: 'Trocar imagem…', action: 'swap-image' });
    expect(fixFor('unknown value "xyz", using "normal"'))
      .toEqual({ label: 'Gravar o padrão', action: 'write-fallback', value: 'normal' });
    expect(fixFor('file version 1.3 newer than reader 1.0: partial read')).toBeNull();
  });

  it('o painel de cada alvo', () => {
    expect(panelFor({ kind: 'bone', name: 'x' })).toBe('arvore');
    expect(panelFor({ kind: 'attachment', name: 'x' })).toBe('imagens');
    expect(panelFor({ kind: 'animation', name: 'x' })).toBe('animacoes');
    expect(panelFor({ kind: 'skin', name: 'x' })).toBe('peles');
    expect(panelFor({ kind: 'constraint', name: 'x' })).toBe('regras');
    expect(panelFor({ kind: 'skeleton' })).toBe('propriedades');
  });
});

describe('o aviso de verdade, de ponta a ponta', () => {
  it('imagem que falta: português, com nome, Ir para e Trocar imagem…', () => {
    const file = heroi();
    const body = file.skins![0]!.attachments!['body']!['body'] as unknown as Record<string, unknown>;
    body['path'] = 'nao-existe';
    const atlas = loadAtlas(JSON.parse(readFileSync(`${EXEMPLOS}heroi.atlas.json`, 'utf8')));
    const data = loadSkeletonData(JSON.parse(JSON.stringify(file)), { atlases: [atlas] });
    // A linha exatamente como o documento a monta (`document.ts`, rebuildQuiet).
    const lines = data.warnings.map((w) => `${w.pointer}: ${w.message}`);
    const line = lines.find((l) => l.includes('nao-existe'))!;
    expect(line).toBeDefined();

    const row = warningRow(file, line);
    expect(row.text).toMatch(/^skin "default" › desenho "body".*: imagem "nao-existe" não está em nenhum atlas/);
    expect(row.target).toEqual({ kind: 'attachment', skin: 'default', slot: 'body', name: 'body' });
    expect(row.fix?.action).toBe('swap-image');
  });

  it('linha sem ponteiro fica como está, sem botão', () => {
    expect(parseWarning('imagem não encontrada: x')).toEqual({ pointer: null, message: 'imagem não encontrada: x' });
    expect(warningRow(heroi(), 'imagem não encontrada: x')).toEqual({
      text: 'imagem não encontrada: x', pointer: null, target: null, fix: null,
    });
  });
});
});

// ---------------------------------------------------------------------------
// Rodada 8a (04/10/2026): os avisos da troca por entidade, em português
// ---------------------------------------------------------------------------

import { translateWarning as traduz8a, warningRow as linha8a } from '../src/panels/warning-model.js';
import type { BoneFile as Arquivo8aAviso } from '../../runtime/src/index.js';

describe('rodada 8a — os três avisos da malha que virou entidade', () => {
  it('saem em português, e dizem o que ficou sem efeito', () => {
    expect(traduz8a('deform needs a vertex attachment; timeline ignored'))
      .toBe('chaves de deformação num desenho que não é malha: ficam sem efeito');
    expect(traduz8a('parent "face" is not a mesh in skin "default" of slot "head"; linked mesh ignored'))
      .toBe('a malha ligada copia "face" (skin "default", slot "head"), que não é malha: ela não aparece');
    expect(traduz8a('"face" is not a mesh in skin "default" of slot "head"; target ignored'))
      .toBe('o morph deforma "face" (skin "default", slot "head"), que não é malha: esse alvo fica sem efeito');
  });

  it('o aviso do morph diz o NOME do morph, e não o endereço de máquina', () => {
    const file = { morphs: [{ name: 'sorriso', targets: [{ slot: 'head', attachment: 'face' }] }] } as unknown as Arquivo8aAviso;
    const row = linha8a(file, '/morphs/0/targets/0/attachment: "face" is not a mesh in skin "default" of slot "head"; target ignored');
    expect(row.text.startsWith('morph "sorriso" › alvo 1 › attachment: o morph deforma')).toBe(true);
  });
});

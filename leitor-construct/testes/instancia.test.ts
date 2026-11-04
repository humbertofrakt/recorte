// SPDX-License-Identifier: Apache-2.0
/**
 * O objeto Recorte, os arquivos do addon como vão no .c3addon, rodando no Node
 * dentro de um Construct DE MENTIRA (rodada K2).
 *
 * O Construct de mentira tem só o que o `c3runtime/instance.js` usa: a classe
 * base, a pasta Files (lida de `formato/exemplos/`), o relógio e um renderer
 * que anota cada chamada. Isto NÃO prova que o Construct r449 tem essas
 * funções com esses nomes — isso só a mão do Humberto prova. Prova que, SE
 * tiver, o objeto carrega, toca, avisa e chama o `drawMesh` com as listas
 * certas, e que o pacote que vai no addon é o que roda aqui.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
// @ts-expect-error -- módulo .mjs sem tipos
import { ID_DO_ADDON } from '../id.mjs';

const LEITOR = join(dirname(fileURLToPath(import.meta.url)), '..');
const EXEMPLOS = join(LEITOR, '..', 'formato', 'exemplos');
const C3RUNTIME = join(LEITOR, 'addon', 'c3runtime');

const g = globalThis as any;
let propriedades: unknown[] = [];
let dt = 0;

class InstanciaDoMundo {
  x = 300; y = 400; angle = 0; opacity = 1; isVisible = true; totalZElevation = 0;
  largura = 0; altura = 0; ticando = false;
  redesenhos = 0;
  runtime = {
    get dt() { return dt; },
    sdk: { updateRender: () => { this.redesenhos++; } },
    assets: {
      getProjectFileUrl: async (c: string) => `files/${c}`,
      fetchArrayBuffer: async (url: string) => {
        const b = readFileSync(join(EXEMPLOS, url.replace(/^files\//, '')));
        return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
      },
      fetchBlob: async (url: string) => ({ url }),
    },
  };
  /** Os gatilhos disparados: o método da condição e o que ele estava olhando. */
  disparos: { metodo: unknown; ocorrencia: unknown }[] = [];
  _trigger(metodo: unknown) { this.disparos.push({ metodo, ocorrencia: (this as any)._ocorrencia }); }
  _getInitProperties() { return propriedades; }
  _setTicking(v: boolean) { this.ticando = v; }
  setSize(w: number, h: number) { this.largura = w; this.altura = h; }
  _release() {}
}

/** Um renderer que anota. */
function rendererQueAnota() {
  const chamadas: { nome: string; args: any[] }[] = [];
  const anotar = (nome: string) => (...args: any[]) => { chamadas.push({ nome, args }); return { textura: chamadas.length }; };
  const r: any = {};
  for (const n of ['setTextureFillMode', 'setBlendMode', 'setTexture', 'drawMesh', 'createDynamicTexture', 'updateTexture', 'deleteTexture']) r[n] = anotar(n);
  return { r, chamadas };
}

let Plugin: any;
let R: any;
let avisosDoConsole: string[] = [];

async function criar(props: unknown[]) {
  propriedades = props;
  const inst = new Plugin.Instance();
  for (let i = 0; i < 200 && inst._tocador === null && inst._erro === ''; i++) await new Promise((r) => setTimeout(r, 5));
  return inst;
}

beforeAll(async () => {
  g.C3 = { Plugins: {} };
  g.ISDKPluginBase = class {};
  g.ISDKObjectTypeBase = class {};
  g.ISDKWorldInstanceBase = InstanciaDoMundo;
  g.createImageBitmap = async () => ({ width: 256, height: 256, close() {} });
  vi.spyOn(console, 'warn').mockImplementation((t: string) => { avisosDoConsole.push(t); });
  vi.spyOn(console, 'error').mockImplementation((t: string) => { avisosDoConsole.push(t); });
  // Como o Construct faz: primeiro o script de fora, depois o módulo principal.
  await import(pathToFileURL(join(C3RUNTIME, 'recorte-runtime.js')).href);
  await import(pathToFileURL(join(C3RUNTIME, 'main.js')).href);
  Plugin = g.C3.Plugins[ID_DO_ADDON];
  R = g.RecorteRuntime;
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('o objeto Recorte num Construct de mentira', () => {
  it('carrega o herói da pasta Files, liga o relógio e toma o tamanho do boneco', async () => {
    const inst = await criar(['heroi.bone', '', true, 1]);
    expect(inst._erro).toBe('');
    expect(inst.ticando).toBe(true);
    expect([inst.largura, inst.altura]).toEqual([160, 464]);
    expect([...inst._imagens.keys()]).toEqual(['heroi']);
  });

  it('a animação inicial da propriedade toca sozinha, e a ação Tocar troca', async () => {
    const inst = await criar(['heroi.bone', 'walk', true, 1]);
    expect(Plugin.Exps.AnimacaoTocando.call(inst)).toBe('walk');
    Plugin.Acts.Tocar.call(inst, 'attack', 1);
    expect(Plugin.Exps.AnimacaoTocando.call(inst)).toBe('attack');
    expect(inst._tocador.emLacoTocando).toBe(false);
    Plugin.Acts.Tocar.call(inst, 'idle', 0);
    expect(inst._tocador.emLacoTocando).toBe(true);
  });

  it('"Tocar" pedido antes de o boneco carregar não se perde', async () => {
    propriedades = ['heroi.bone', '', true, 1];
    const inst = new Plugin.Instance();
    Plugin.Acts.Tocar.call(inst, 'walk', 0);
    expect(Plugin.Exps.AnimacaoTocando.call(inst)).toBe('walk');
    for (let i = 0; i < 200 && inst._tocador === null; i++) await new Promise((r) => setTimeout(r, 5));
    expect(inst._tocador.nomeTocando).toBe('walk');
  });

  it('desenha com drawMesh exatamente os lotes do desenhador, na posição da instância, com Y para baixo', async () => {
    const inst = await criar(['heroi.bone', 'walk', true, 1]);
    dt = 0.25;
    inst._tick();
    const { r, chamadas } = rendererQueAnota();
    inst._draw(r);
    const malhas = chamadas.filter((c) => c.nome === 'drawMesh');
    const esperado = R.montarLotes(R.pecasDoQuadro(inst._tocador.esqueleto), { x: 300, y: 400, angulo: 0, escalaX: 1, escalaY: 1, cor: [1, 1, 1, 1] });
    expect(esperado.length).toBeGreaterThan(0);
    expect(malhas).toHaveLength(esperado.length);
    for (let i = 0; i < esperado.length; i++) {
      expect(Array.from(malhas[i].args[0])).toEqual(Array.from(esperado[i].posicoes));
      expect(Array.from(malhas[i].args[1])).toEqual(Array.from(esperado[i].uvs));
      expect(Array.from(malhas[i].args[2])).toEqual(Array.from(esperado[i].indices));
      expect(Array.from(malhas[i].args[3])).toEqual(Array.from(esperado[i].cores));
    }
    // Uma textura por página, feita no primeiro desenho, e não de novo.
    expect(chamadas.filter((c) => c.nome === 'createDynamicTexture')).toHaveLength(1);
    expect(chamadas.find((c) => c.nome === 'updateTexture')!.args[2]).toEqual({ premultiplyAlpha: true });
    inst._draw(r);
    expect(chamadas.filter((c) => c.nome === 'createDynamicTexture')).toHaveLength(1);
    // A mistura volta ao normal no fim, para não sujar o próximo objeto.
    expect(chamadas.filter((c) => c.nome === 'setBlendMode').at(-1)!.args[0]).toBe('normal');
  });

  it('o relógio do Construct anda o boneco, e pede redesenho', async () => {
    const inst = await criar(['heroi.bone', 'walk', true, 1]);
    const antes = Array.from(R.pecasDoQuadro(inst._tocador.esqueleto)[0].mundo);
    const pedidos = inst.redesenhos;
    dt = 0.2;
    inst._tick();
    expect(Array.from(R.pecasDoQuadro(inst._tocador.esqueleto)[0].mundo)).not.toEqual(antes);
    expect(inst.redesenhos).toBeGreaterThan(pedidos);
  });

  it('invisível: não desenha', async () => {
    const inst = await criar(['heroi.bone', '', true, 1]);
    inst.isVisible = false;
    const { r, chamadas } = rendererQueAnota();
    inst._draw(r);
    expect(chamadas).toHaveLength(0);
  });

  it('a textura perdida com o contexto renasce no próximo desenho', async () => {
    const inst = await criar(['heroi.bone', '', true, 1]);
    const { r, chamadas } = rendererQueAnota();
    inst._draw(r);
    inst._onRendererContextLost();
    inst._draw(r);
    expect(chamadas.filter((c) => c.nome === 'createDynamicTexture')).toHaveLength(2);
  });
});

describe('o que ele não entende, ele diz (regra 21)', () => {
  it('nome de animação que não existe: não troca, aparece em Avisos e no console', async () => {
    avisosDoConsole = [];
    const inst = await criar(['heroi.bone', 'idle', true, 1]);
    Plugin.Acts.Tocar.call(inst, 'correr', 0);
    expect(Plugin.Exps.AnimacaoTocando.call(inst)).toBe('idle');
    expect(Plugin.Exps.Avisos.call(inst)).toContain('O boneco não tem a animação "correr"');
    expect(avisosDoConsole.some((a) => a.startsWith('[Recorte] O boneco não tem a animação "correr"'))).toBe(true);
  });

  it('o herói diz, logo ao carregar, o que o Construct ainda não desenha dele', async () => {
    avisosDoConsole = [];
    const inst = await criar(['heroi.bone', '', true, 1]);
    const { r } = rendererQueAnota();
    inst._draw(r);
    inst._tick();
    const avisos: string = Plugin.Exps.Avisos.call(inst);
    expect(avisos).toContain('cor escura');
    expect(avisos).not.toContain('recorte');
    expect(avisosDoConsole.filter((a) => a.includes('cor escura'))).toHaveLength(1);
  });

  it('arquivo que não está na pasta Files: erro claro, em Avisos e no console, e nada quebra', async () => {
    avisosDoConsole = [];
    const inst = await criar(['nao-existe.bone', '', true, 1]);
    expect(inst._erro).toContain('"nao-existe.bone" não está na pasta Files');
    expect(Plugin.Exps.Avisos.call(inst)).toContain('nao-existe.bone');
    expect(avisosDoConsole.some((a) => a.startsWith('[Recorte]') && a.includes('nao-existe.bone'))).toBe(true);
    const { r, chamadas } = rendererQueAnota();
    inst._draw(r);
    inst._tick();
    expect(chamadas).toHaveLength(0);
  });
});

describe('vestir e tirar skin, pelos eventos (rodada K4)', () => {
  it('Vestir e Tirar mudam a pilha, a expressão Skins diz a pilha, e o desenho segue', async () => {
    const inst = await criar(['heroi.bone', 'walk', true, 1]);
    expect(Plugin.Exps.Skins.call(inst)).toBe('default');
    Plugin.Acts.Vestir.call(inst, 'armadura');
    expect(Plugin.Exps.Skins.call(inst)).toBe('default,armadura');
    expect(R.pecasDoQuadro(inst._tocador.esqueleto).map((p: any) => p.slot)).not.toContain('hair');
    Plugin.Acts.Tirar.call(inst, 'armadura');
    expect(Plugin.Exps.Skins.call(inst)).toBe('default');
    expect(R.pecasDoQuadro(inst._tocador.esqueleto).map((p: any) => p.slot)).toContain('hair');
  });

  it('pedidos antes de o boneco carregar não se perdem, e saem na ordem', async () => {
    propriedades = ['heroi.bone', '', true, 1];
    const inst = new Plugin.Instance();
    Plugin.Acts.Vestir.call(inst, 'armadura');
    Plugin.Acts.Vestir.call(inst, 'armadura_capa');
    Plugin.Acts.Tirar.call(inst, 'armadura');
    expect(Plugin.Exps.Skins.call(inst)).toBe('default,armadura_capa');
    for (let i = 0; i < 200 && inst._tocador === null; i++) await new Promise((r) => setTimeout(r, 5));
    expect(inst._tocador.pilha).toEqual(['default', 'armadura_capa']);
  });

  it('o jogo salvo guarda a pilha e a devolve', async () => {
    const a = await criar(['heroi.bone', 'walk', true, 1]);
    Plugin.Acts.Vestir.call(a, 'armadura');
    const salvo = a._saveToJson();
    expect(salvo.skins).toEqual(['default', 'armadura']);
    const b = await criar(['heroi.bone', 'idle', true, 1]);
    b._loadFromJson(JSON.parse(JSON.stringify(salvo)));
    expect(b._tocador.pilha).toEqual(['default', 'armadura']);
    expect(Plugin.Exps.AnimacaoTocando.call(b)).toBe('walk');
  });

  it('skin que o boneco não tem: aparece em Avisos e no console, e nada muda', async () => {
    avisosDoConsole = [];
    const inst = await criar(['heroi.bone', '', true, 1]);
    Plugin.Acts.Vestir.call(inst, 'aguia');
    expect(Plugin.Exps.Skins.call(inst)).toBe('default');
    expect(Plugin.Exps.Avisos.call(inst)).toContain('O boneco não tem a skin "aguia"');
    expect(avisosDoConsole.some((a) => a.startsWith('[Recorte] O boneco não tem a skin "aguia"'))).toBe(true);
  });
});

describe('as partículas pela ponte (rodada K6)', () => {
  const FILES = join(LEITOR, 'exemplo', 'heroi-andando', 'files');

  async function comFogo() {
    const inst = await criar(['heroi.bone', 'walk', true, 1]);
    // O mesmo objeto, lendo da pasta Files do exemplo: o herói com a skin "fogo".
    inst.runtime.assets.fetchArrayBuffer = async (url: string) => {
      const b = readFileSync(join(FILES, url.replace(/^files\//, '')));
      return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
    };
    inst._arquivo = 'heroi-fogo.bone';
    inst._tocador = null;
    await inst._carregar();
    Plugin.Acts.Tocar.call(inst, 'walk', 0);
    return inst;
  }

  it('F liga o fogo: Está vestindo diz sim, e as faíscas saem num drawMesh aditivo', async () => {
    const inst = await comFogo();
    expect(Plugin.Cnds.Vestindo.call(inst, 'fogo')).toBe(false);
    Plugin.Acts.Vestir.call(inst, 'fogo');
    expect(Plugin.Cnds.Vestindo.call(inst, 'fogo')).toBe(true);
    dt = 0.3;
    inst._tick();
    const { r, chamadas } = rendererQueAnota();
    inst._draw(r);
    const misturas = chamadas.filter((c) => c.nome === 'setBlendMode').map((c) => c.args[0]);
    expect(misturas).toContain('additive');
    const iAditivo = chamadas.findIndex((c) => c.nome === 'setBlendMode' && c.args[0] === 'additive');
    expect(chamadas.slice(iAditivo).find((c) => c.nome === 'drawMesh')).toBeDefined();
  });

  it('se o Construct recusar o aditivo: o lote sai normal, e AVISA qual mistura faltou', async () => {
    avisosDoConsole = [];
    const inst = await comFogo();
    Plugin.Acts.Vestir.call(inst, 'fogo');
    dt = 0.3;
    inst._tick();
    const { r, chamadas } = rendererQueAnota();
    r.setBlendMode = (m: string) => { if (m === 'additive') throw new Error('modo desconhecido'); chamadas.push({ nome: 'setBlendMode', args: [m] }); };
    inst._draw(r);
    inst._tick();
    expect(Plugin.Exps.Avisos.call(inst)).toContain('O Construct recusou a mistura "additive"');
    expect(avisosDoConsole.some((a) => a.includes('recusou a mistura "additive"'))).toBe(true);
    expect(chamadas.filter((c) => c.nome === 'drawMesh').length).toBeGreaterThan(1);
  });
});

describe('o dia a dia pelos eventos (rodada K7)', () => {
  /** O gatilho aceita aquele nome? Pergunta à condição, olhando a ocorrência que disparou. */
  function aceita(inst: any, disparo: any, nome: string): boolean {
    const antes = inst._ocorrencia;
    inst._ocorrencia = disparo.ocorrencia;
    try { return disparo.metodo.call(inst, nome); } finally { inst._ocorrencia = antes; }
  }

  it('"Ao evento": o passo do walk dispara, com EventoNome e EventoInteiro; o filtro pelo nome funciona', async () => {
    const inst = await criar(['heroi.bone', 'walk', true, 1, '']);
    inst.disparos = [];
    dt = 0.3;
    inst._tick();
    const passos = inst.disparos.filter((d: any) => d.metodo === Plugin.Cnds.AoEvento);
    expect(passos).toHaveLength(1);
    expect(aceita(inst, passos[0], 'step')).toBe(true);
    expect(aceita(inst, passos[0], '')).toBe(true);
    expect(aceita(inst, passos[0], 'hit')).toBe(false);
    expect(Plugin.Exps.EventoNome.call(inst)).toBe('step');
    expect(Plugin.Exps.EventoInteiro.call(inst)).toBe(1);
  });

  it('"Ao terminar a animação": o attack uma vez termina e dispara; o filtro pelo nome funciona; "Está tocando" vira não', async () => {
    const inst = await criar(['heroi.bone', '', true, 1, '']);
    Plugin.Acts.Tocar.call(inst, 'attack', 1);
    expect(Plugin.Cnds.Tocando.call(inst, 'attack')).toBe(true);
    inst.disparos = [];
    dt = 0.7;
    inst._tick();
    const fins = inst.disparos.filter((d: any) => d.metodo === Plugin.Cnds.AoTerminar);
    expect(fins).toHaveLength(1);
    expect(aceita(inst, fins[0], 'attack')).toBe(true);
    expect(aceita(inst, fins[0], 'walk')).toBe(false);
    expect(Plugin.Exps.EventoTexto.call(inst)).toBe('sword');
    expect(Plugin.Exps.EventoNumero.call(inst)).toBe(1.5);
    expect(Plugin.Cnds.Tocando.call(inst, 'attack')).toBe(false);
  });

  it('Mudar a velocidade, Pausar e Continuar, também pedidos antes de carregar', async () => {
    propriedades = ['heroi.bone', 'walk', true, 1, ''];
    const inst = new Plugin.Instance();
    Plugin.Acts.MudarVelocidade.call(inst, 2);
    Plugin.Acts.Pausar.call(inst);
    expect(Plugin.Exps.Velocidade.call(inst)).toBe(2);
    for (let i = 0; i < 200 && inst._tocador === null; i++) await new Promise((r) => setTimeout(r, 5));
    expect(inst._tocador.velocidade).toBe(2);
    expect(inst._tocador.pausado).toBe(true);
    const parada = JSON.stringify(R.pecasDoQuadro(inst._tocador.esqueleto).map((p: any) => Array.from(p.mundo)));
    dt = 0.3;
    inst._tick();
    expect(JSON.stringify(R.pecasDoQuadro(inst._tocador.esqueleto).map((p: any) => Array.from(p.mundo)))).toBe(parada);
    Plugin.Acts.Continuar.call(inst);
    inst._tick();
    expect(JSON.stringify(R.pecasDoQuadro(inst._tocador.esqueleto).map((p: any) => Array.from(p.mundo)))).not.toBe(parada);
  });

  it('velocidade que não serve: avisa e fica a de antes', async () => {
    const inst = await criar(['heroi.bone', 'walk', true, 1, '']);
    Plugin.Acts.MudarVelocidade.call(inst, -2);
    expect(Plugin.Exps.Velocidade.call(inst)).toBe(1);
    expect(Plugin.Exps.Avisos.call(inst)).toContain('Velocidade -2 não serve');
  });

  it('Espelhar: o desenho vira no X em volta da instância; normal desvira', async () => {
    const inst = await criar(['heroi.bone', '', true, 1, '']);
    const desenhar = () => {
      const { r, chamadas } = rendererQueAnota();
      inst._draw(r);
      return Array.from(chamadas.find((c) => c.nome === 'drawMesh')!.args[0] as Float32Array);
    };
    const normal = desenhar();
    Plugin.Acts.Espelhar.call(inst, 0);
    expect(Plugin.Cnds.Espelhado.call(inst)).toBe(true);
    const espelhado = desenhar();
    for (let i = 0; i < normal.length; i += 3) {
      expect(espelhado[i]).toBeCloseTo(2 * 300 - normal[i], 3); // x vira em volta de x = 300
      expect(espelhado[i + 1]).toBeCloseTo(normal[i + 1], 4);
    }
    Plugin.Acts.Espelhar.call(inst, 1);
    expect(desenhar()).toEqual(normal);
  });

  it('"Skins iniciais" da propriedade: vestidas ao carregar, na ordem', async () => {
    const inst = await criar(['heroi.bone', '', true, 1, ' armadura , armadura_capa ']);
    expect(Plugin.Exps.Skins.call(inst)).toBe('default,armadura,armadura_capa');
  });

  it('o jogo salvo guarda velocidade, pausa e espelho', async () => {
    const a = await criar(['heroi.bone', 'walk', true, 1, '']);
    Plugin.Acts.MudarVelocidade.call(a, 0.5);
    Plugin.Acts.Pausar.call(a);
    Plugin.Acts.Espelhar.call(a, 0);
    const b = await criar(['heroi.bone', 'walk', true, 1, '']);
    b._loadFromJson(JSON.parse(JSON.stringify(a._saveToJson())));
    expect(b._tocador.velocidade).toBe(0.5);
    expect(b._tocador.pausado).toBe(true);
    expect(Plugin.Cnds.Espelhado.call(b)).toBe(true);
  });
});

/** Espera a fila da conexão esvaziar (a peça é lida da pasta Files, assíncrona). */
async function conexaoParada(inst: any) {
  for (let i = 0; i < 200 && (inst._filaConexao.length > 0 || inst._drenando); i++) await new Promise((r) => setTimeout(r, 5));
  expect(inst._filaConexao).toHaveLength(0);
}

describe('a conexão no objeto (rodada K5)', () => {
  it('Encaixar lê a peça da pasta Files; Animar a peça no mesmo evento espera por ela; Desencaixar volta a espada', async () => {
    const inst = await criar(['heroi.bone', 'walk', true, 1, '']);
    expect(Plugin.Exps.PecaDoSlot.call(inst, 'weapon')).toBe('espada.bone');
    // O mesmo evento: Encaixar e, logo depois, Animar a peça.
    Plugin.Acts.Encaixar.call(inst, 'capacete.bone', 'weapon', '');
    Plugin.Acts.AnimarPeca.call(inst, 'weapon', 'piscar', 0);
    await conexaoParada(inst);
    expect(Plugin.Exps.PecaDoSlot.call(inst, 'weapon')).toBe('capacete.bone');
    expect(inst._tocador.esqueleto.findSlot('weapon').nested.animation.name).toBe('piscar');
    expect(Plugin.Exps.Entidades.call(inst)).toBe('capacete.bone');
    expect(Plugin.Exps.Slots.call(inst).split(',')).toContain('weapon');
    // A peça usa o atlas do herói: nenhuma imagem a mais.
    expect([...inst._imagens.keys()]).toEqual(['heroi']);

    // O gatilho "Ao encaixar" dispara no passo seguinte, com o slot.
    inst.disparos = [];
    dt = 1 / 60;
    inst._tick();
    const ao = inst.disparos.filter((d: any) => d.metodo === Plugin.Cnds.AoEncaixar);
    expect(ao).toHaveLength(1);
    expect(Plugin.Cnds.AoEncaixar.call({ _ocorrencia: ao[0].ocorrencia }, 'weapon')).toBe(true);
    expect(Plugin.Cnds.AoEncaixar.call({ _ocorrencia: ao[0].ocorrencia }, 'hand')).toBe(false);
    expect(Plugin.Exps.SlotDoEncaixe.call(inst)).toBe('weapon');

    Plugin.Acts.Desencaixar.call(inst, 'weapon');
    await conexaoParada(inst);
    expect(Plugin.Exps.PecaDoSlot.call(inst, 'weapon')).toBe('espada.bone');
    expect(Plugin.Exps.Avisos.call(inst)).toBe('');
  });

  it('Encaixar antes de o boneco carregar não se perde', async () => {
    propriedades = ['heroi.bone', 'walk', true, 1, ''];
    const inst = new Plugin.Instance();
    Plugin.Acts.Encaixar.call(inst, 'capacete.bone', 'weapon', '');
    for (let i = 0; i < 200 && inst._tocador === null; i++) await new Promise((r) => setTimeout(r, 5));
    await conexaoParada(inst);
    expect(Plugin.Exps.PecaDoSlot.call(inst, 'weapon')).toBe('capacete.bone');
  });

  it('peça que não está na pasta Files: o slot fica como estava, e AVISA no texto e no console (regra 21)', async () => {
    const inst = await criar(['heroi.bone', 'walk', true, 1, '']);
    avisosDoConsole = [];
    Plugin.Acts.Encaixar.call(inst, 'motosserra.bone', 'weapon', '');
    await conexaoParada(inst);
    expect(Plugin.Exps.PecaDoSlot.call(inst, 'weapon')).toBe('espada.bone');
    expect(Plugin.Exps.Avisos.call(inst)).toContain('"motosserra.bone"');
    expect(avisosDoConsole.some((a) => a.startsWith('[Recorte]') && a.includes('motosserra.bone'))).toBe(true);
  });
});

describe('o jogo salvo guarda os encaixes (rodada K5, item 8)', () => {
  it('a peça, o slot, o "em volta", a animação dela e o relógio dela voltam', async () => {
    const a = await criar(['heroi.bone', 'walk', true, 1, '']);
    Plugin.Acts.Encaixar.call(a, 'capacete.bone', 'weapon', '');
    Plugin.Acts.AnimarPeca.call(a, 'weapon', 'piscar', 0);
    await conexaoParada(a);
    dt = 0.1;
    a._tick();
    a._tick();
    const salvo = JSON.parse(JSON.stringify(a._saveToJson()));
    expect(salvo.encaixes).toEqual([{ slot: 'weapon', caminho: 'capacete.bone', emVolta: '' }]);
    expect(salvo.pecas[0].relogio).toBeCloseTo(0.2, 12);

    const b = await criar(['heroi.bone', 'walk', true, 1, '']);
    b._loadFromJson(salvo);
    await conexaoParada(b);
    expect(Plugin.Exps.PecaDoSlot.call(b, 'weapon')).toBe('capacete.bone');
    const ordem = b._tocador.ordensDoJogo.get('weapon');
    expect(ordem.animacao).toBe('piscar');
    expect(ordem.relogio).toBeCloseTo(0.2, 12);

    // E carregar um salvo SEM encaixe tira o que estava encaixado.
    b._loadFromJson({ ...salvo, encaixes: [], pecas: [] });
    await conexaoParada(b);
    expect(Plugin.Exps.PecaDoSlot.call(b, 'weapon')).toBe('espada.bone');
  });
});

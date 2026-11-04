// SPDX-License-Identifier: Apache-2.0
/**
 * O objeto Recorte no EDITOR DE LAYOUT do Construct (rodada K7), rodando no
 * Node dentro de um editor DE MENTIRA: o `addon/instance.js` de verdade, com o
 * pacote de verdade. O editor de mentira tem só o que o arquivo usa (o
 * projeto com a pasta Files, a instância, um renderer que anota).
 *
 * Isto NÃO prova que o editor r449 tem essas funções com esses nomes (lidas
 * no r495): isso é a mão do Humberto. Prova que, se tiver, o boneco parado
 * aparece do tamanho certo, no lugar certo, com as skins iniciais.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

const LEITOR = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILES = join(LEITOR, 'exemplo', 'heroi-andando', 'files');
const g = globalThis as any;
let R: any;
let Classe: any;
let avisos: string[] = [];

function arquivo(nome: string) {
  try {
    const b = readFileSync(join(FILES, nome));
    return { GetBlob: () => new Blob([b]) };
  } catch {
    return null;
  }
}

function instancia(props: Record<string, unknown>, porNomeSo = true) {
  const tamanho: number[] = [];
  const refrescos = { n: 0 };
  const projeto: any = { GetProjectFileByName: (n: string) => arquivo(n) };
  if (!porNomeSo) projeto.GetProjectFileByExportPath = (c: string) => arquivo(c);
  const inst = {
    GetProject: () => projeto,
    GetPropertyValue: (id: string) => props[id],
    SetSize: (w: number, h: number) => { tamanho.splice(0, 2, w, h); },
    GetX: () => 200, GetY: () => 300, GetAngle: () => 0,
    GetQuad: () => ({}), GetOpacity: () => 1,
    GetColor: () => ({ getR: () => 1, getG: () => 1, getB: () => 1, getA: () => 1 }),
  };
  const sdkInst = new Classe({}, inst);
  const vista = { Refresh: () => { refrescos.n++; } };
  return { sdkInst, tamanho, refrescos, params: { GetLayoutView: () => vista } };
}

function renderer() {
  const chamadas: { nome: string; args: any[] }[] = [];
  const r: any = {};
  for (const n of ['SetAlphaBlend', 'SetColorFillMode', 'SetColorRgba', 'Quad', 'SetTextureFillMode', 'SetBlendMode', 'SetTexture', 'DrawMesh', 'CreateDynamicTexture', 'UpdateTexture', 'DeleteTexture']) {
    r[n] = (...args: any[]) => { chamadas.push({ nome: n, args }); return { textura: chamadas.length }; };
  }
  return { r, chamadas };
}

beforeAll(async () => {
  g.SDK = { Plugins: { Recorte_Leitor: {} }, IWorldInstanceBase: class { _sdkType: unknown; _inst: unknown; constructor(t: unknown, i: unknown) { this._sdkType = t; this._inst = i; } } };
  g.createImageBitmap = async () => ({ width: 256, height: 256, close() {} });
  vi.spyOn(console, 'warn').mockImplementation((t: string) => { avisos.push(t); });
  await import(pathToFileURL(join(LEITOR, 'addon', 'c3runtime', 'recorte-runtime.js')).href);
  await import(pathToFileURL(join(LEITOR, 'addon', 'instance.js')).href);
  R = g.RecorteRuntime;
  Classe = g.SDK.Plugins.Recorte_Leitor.Instance;
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('o boneco parado no editor de layout', () => {
  it('carrega da pasta Files do projeto, toma o tamanho do boneco, e pede para redesenhar a vista', async () => {
    const { sdkInst, tamanho, refrescos, params } = instancia({ arquivo: 'heroi.bone', escala: 1.5, skins: '' });
    const { r } = renderer();
    sdkInst.Draw(r, params); // primeiro desenho: ainda carregando, guarda a vista
    await sdkInst._carregar();
    expect(sdkInst._erro).toBe('');
    expect(tamanho).toEqual([240, 696]);
    expect(refrescos.n).toBeGreaterThan(0);
  });

  it('desenha com DrawMesh exatamente os lotes da pose de repouso, no lugar da instância', async () => {
    const { sdkInst, params } = instancia({ arquivo: 'heroi.bone', escala: 1, skins: '' });
    await sdkInst._carregar();
    const { r, chamadas } = renderer();
    sdkInst.Draw(r, params);
    const malhas = chamadas.filter((c) => c.nome === 'DrawMesh');
    const repouso = new R.Tocador(sdkInst._tocador.esqueleto.data);
    const esperado = R.montarLotes(R.pecasDoQuadro(repouso.esqueleto), { x: 200, y: 300, angulo: 0, escalaX: 1, escalaY: 1, cor: [1, 1, 1, 1] });
    expect(esperado.length).toBeGreaterThan(0);
    expect(malhas).toHaveLength(esperado.length);
    for (let i = 0; i < esperado.length; i++) {
      expect(Array.from(malhas[i].args[0])).toEqual(Array.from(esperado[i].posicoes));
      expect(Array.from(malhas[i].args[3])).toEqual(Array.from(esperado[i].cores));
    }
    expect(chamadas.filter((c) => c.nome === 'CreateDynamicTexture')).toHaveLength(1);
  });

  it('as "Skins iniciais" aparecem no layout (a armadura tira o cabelo), e o caminho novo do projeto também serve', async () => {
    const { sdkInst } = instancia({ arquivo: 'heroi.bone', escala: 1, skins: 'armadura' }, false);
    await sdkInst._carregar();
    expect(sdkInst._tocador.pilha).toEqual(['default', 'armadura']);
    expect(R.pecasDoQuadro(sdkInst._tocador.esqueleto).map((p: any) => p.slot)).not.toContain('hair');
  });

  it('mudar a propriedade recarrega; as texturas velhas são apagadas no desenho seguinte', async () => {
    const props: Record<string, unknown> = { arquivo: 'heroi.bone', escala: 1, skins: '' };
    const { sdkInst, params } = instancia(props);
    await sdkInst._carregar();
    const { r, chamadas } = renderer();
    sdkInst.Draw(r, params);
    props.skins = 'armadura';
    sdkInst.OnPropertyChanged('skins', 'armadura');
    await sdkInst._carregar();
    sdkInst.Draw(r, params);
    expect(chamadas.filter((c) => c.nome === 'DeleteTexture')).toHaveLength(1);
    expect(sdkInst._tocador.pilha).toEqual(['default', 'armadura']);
  });

  it('arquivo que não está na pasta Files: caixa vermelha no lugar, e o console diz qual (regra 21)', async () => {
    avisos = [];
    const { sdkInst, params } = instancia({ arquivo: 'sumiu.bone', escala: 1, skins: '' });
    await sdkInst._carregar();
    const { r, chamadas } = renderer();
    sdkInst.Draw(r, params);
    expect(chamadas.find((c) => c.nome === 'SetColorRgba')!.args).toEqual([0.4, 0, 0, 0.4]);
    expect(chamadas.some((c) => c.nome === 'DrawMesh')).toBe(false);
    expect(avisos.some((a) => a.startsWith('[Recorte]') && a.includes('sumiu.bone'))).toBe(true);
  });
});

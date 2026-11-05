/**
 * Todo item apagado diz POR QUÊ, e o que fazer — noite de 04/11/2026.
 *
 * Achado no percurso do manual, clicando: **Editar → Colar espelhado** ficava
 * cinza, e a dica dizia o que ele faz, não por que não fazia. A forma do
 * defeito: **o `enabled` foi escrito, o `why` não** — 81 ações eram assim.
 *
 * Sem DOM: o código-fonte é lido como texto, e o registro de ações é o de
 * verdade.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { PORQUE_APAGADO, porqueApagado } from '../src/ui/porque-apagado.js';
import { actionState, clearActions, registerAction } from '../src/ui/actions.js';
import { allMenus, flatEntries, NEUTRAL_MENU_STATE } from '../src/ui/menus.js';
import type { MenuState } from '../src/ui/menus.js';

const SRC = resolve(__dirname, '../src');

function arquivos(dir: string): string[] {
  return readdirSync(dir).flatMap((nome) => {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) return arquivos(caminho);
    return caminho.endsWith('.ts') ? [caminho] : [];
  });
}

/** O texto entre a `{` em `inicio` e a `}` que a fecha. */
function objeto(texto: string, inicio: number): string {
  let fundo = 0;
  for (let i = inicio; i < texto.length; i++) {
    if (texto[i] === '{') fundo++;
    else if (texto[i] === '}') {
      fundo--;
      if (fundo === 0) return texto.slice(inicio, i + 1);
    }
  }
  return '';
}

/**
 * As chaves de PRIMEIRO nível de um objeto literal. Só o primeiro nível: o
 * `run` da casca de cebola escreve `{ onion: { enabled: on } }` lá dentro, e
 * isso não é o `enabled` da ação.
 */
function chaves(texto: string): Set<string> {
  // Comentário fora: `// Rodada 6, régua 3: …` entre duas chaves tem vírgula.
  const obj = texto.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  const out = new Set<string>();
  let fundo = 0;
  let palavra = '';
  // Uma chave só começa logo depois de `{` ou de `,` — senão `x.enabled,` (o
  // fim de um `checked: () => a.onion.enabled,`) passaria por chave.
  let podeSerChave = false;
  for (let i = 0; i < obj.length; i++) {
    const c = obj[i]!;
    if ('{(['.includes(c)) { fundo++; palavra = ''; podeSerChave = fundo === 1; continue; }
    if ('})]'.includes(c)) {
      if (fundo === 1 && podeSerChave && palavra !== '') out.add(palavra);
      fundo--; palavra = ''; podeSerChave = false;
      continue;
    }
    if (fundo !== 1) continue;
    if (/[\w$]/.test(c)) { palavra += c; continue; }
    if (/\s/.test(c)) continue;
    if ((c === ':' || c === ',') && podeSerChave && palavra !== '') out.add(palavra);
    podeSerChave = c === ',';
    palavra = '';
  }
  return out;
}

interface Registro { id: string; arquivo: string; podeApagar: boolean; dizPorque: boolean }

/** Todo `registerAction('id', { … })` e todo `add('id', run, enabled)` da casca. */
function registros(fonte: string, arquivo: string): Registro[] {
  const out: Registro[] = [];
  for (const m of fonte.matchAll(/registerAction\(\s*'([^']+)'\s*,\s*/g)) {
    const inicio = m.index! + m[0].length;
    // Registro por variável (`porta(doc, id)`): o ajudante é quem diz. Os de
    // hoje — malha, regras, "No fim" — ou têm `why`, ou nunca apagam.
    if (fonte[inicio] !== '{') continue;
    const k = chaves(objeto(fonte, inicio));
    out.push({ id: m[1]!, arquivo, podeApagar: k.has('enabled'), dizPorque: k.has('why') });
  }
  for (const m of fonte.matchAll(/(?<![.\w])add\('([^']+)'\s*,/g)) {
    // O terceiro argumento do `add` da casca é o `enabled`.
    let fundo = 0;
    let argumentos = 1;
    for (let i = m.index! + 4; i < fonte.length; i++) {
      const c = fonte[i]!;
      if ('([{'.includes(c)) fundo++;
      else if (')]}'.includes(c)) { if (fundo === 0) break; fundo--; }
      else if (c === ',' && fundo === 0) argumentos++;
    }
    out.push({ id: m[1]!, arquivo, podeApagar: argumentos >= 3, dizPorque: false });
  }
  return out;
}

const TODOS = arquivos(SRC).flatMap((f) => registros(readFileSync(f, 'utf8'), f.slice(SRC.length + 1)));

afterEach(() => clearActions());

describe('todo item apagado diz por quê', () => {
  it('a régua pega a forma do defeito: `enabled` sem `why`', () => {
    const errado = "registerAction('x', { run: () => {}, enabled: () => false })";
    expect(registros(errado, 'f.ts')).toEqual([{ id: 'x', arquivo: 'f.ts', podeApagar: true, dizPorque: false }]);
    const certo = "registerAction('y', { run: () => {}, enabled: ok, why: () => 'porque' })";
    expect(registros(certo, 'f.ts')[0]!.dizPorque).toBe(true);
    // O `enabled` de dentro do `run` não conta (a casca de cebola).
    const dentro = "registerAction('z', { run: () => { mudar({ onion: { enabled: on } }); }, checked: () => true })";
    expect(registros(dentro, 'f.ts')[0]!.podeApagar).toBe(false);
    const lido = "registerAction('c', { run: () => {}, checked: () => ver().onion.enabled, })";
    expect(registros(lido, 'f.ts')[0]!.podeApagar).toBe(false);
    expect(registros("registerAction('d', { run, enabled })", 'f.ts')[0]!.podeApagar).toBe(true);
    const comentado = "registerAction('e', {\n run,\n enabled: () => ok(),\n // Rodada 6, régua 3: o cinza diz por quê\n why: () => 'x',\n })";
    expect(registros(comentado, 'f.ts')[0]!.dizPorque).toBe(true);
    // O `add` da casca: o terceiro argumento é o `enabled`.
    expect(registros("add('w', () => fazer(), () => pode())", 'f.ts')[0]!.podeApagar).toBe(true);
    expect(registros("add('v', () => fazer())", 'f.ts')[0]!.podeApagar).toBe(false);
  });

  it('a varredura acha as ações de verdade, e não uma lista vazia', () => {
    // Uma régua que não acha nada passa sempre (regra 21, a terceira cara).
    expect(TODOS.length).toBeGreaterThan(200);
    expect(TODOS.filter((r) => r.podeApagar).length).toBeGreaterThan(100);
    expect(TODOS.find((r) => r.id === 'colar-espelhado')?.podeApagar).toBe(true);
  });

  it('toda ação que pode apagar tem `why` no registro, ou linha na tabela', () => {
    const mudas = TODOS
      .filter((r) => r.podeApagar && !r.dizPorque && porqueApagado(r.id) === null)
      .map((r) => `${r.id} (${r.arquivo})`);
    expect(mudas).toEqual([]);
  });

  it('a tabela não guarda linha de ação que não existe', () => {
    const ids = new Set(TODOS.map((r) => r.id));
    expect(Object.keys(PORQUE_APAGADO).filter((id) => !ids.has(id))).toEqual([]);
  });

  it('todo motivo é uma frase que diz o que fazer, e não um nome', () => {
    for (const [id, texto] of Object.entries(PORQUE_APAGADO)) {
      expect(texto.length, id).toBeGreaterThan(15);
      expect(texto.endsWith('.'), `${id}: frase de rodapé não leva ponto`).toBe(false);
    }
  });

  it('o actionState devolve o motivo da tabela quando o registro não diz', () => {
    registerAction('colar-espelhado', { run: () => {}, enabled: () => false });
    expect(actionState('colar-espelhado').why).toBe(PORQUE_APAGADO['colar-espelhado']);
    expect(actionState('colar-espelhado').why).toContain('Editar → Copiar');
  });

  it('o motivo de AGORA, no registro, vence o da tabela', () => {
    registerAction('colar', { run: () => {}, enabled: () => false, why: () => 'motivo de agora' });
    expect(actionState('colar').why).toBe('motivo de agora');
  });

  it('ligada, não há motivo nenhum', () => {
    registerAction('colar', { run: () => {}, enabled: () => true });
    expect(actionState('colar').why).toBeUndefined();
  });

  it('item de menu apagado pelo próprio menu tem dica, ou linha na tabela', () => {
    // O estado mais "fechado": nada aberto, nada a desfazer, nada escolhido.
    const fechado: MenuState = {
      ...NEUTRAL_MENU_STATE,
      canUndo: false, canRedo: false, undoLabel: null, redoLabel: null, animating: false,
    } as MenuState;
    const mudos: string[] = [];
    for (const grupo of allMenus(fechado)) {
      for (const e of flatEntries(grupo.entries)) {
        if (e.enabled || (e.children?.length ?? 0) > 0) continue;
        if ((e.hint ?? '').trim() !== '' || porqueApagado(e.action) !== null) continue;
        mudos.push(`${grupo.label} → ${e.label}`);
      }
    }
    expect(mudos).toEqual([]);
  });
});

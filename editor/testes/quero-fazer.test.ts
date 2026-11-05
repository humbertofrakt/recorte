/**
 * Ajuda → Quero fazer… — as tarefas em palavras da pessoa (noite de 04/11/2026).
 *
 * O que se prova: toda tarefa aponta para ações que EXISTEM na tabela de ações
 * e têm PORTA no menu; o texto do passo mostra o caminho de hoje, montado dos
 * menus; a busca acha pela coisa ("arma"), sem acento.
 */

import { describe, expect, it } from 'vitest';
import { ACTION_TABLE } from '../src/ui/actions-table.js';
import { NEUTRAL_MENU_STATE, allMenus, flatEntries } from '../src/ui/menus.js';
import {
  TAREFAS, buscarTarefas, caminhoDe, caminhoEscrito, primeiroComando, textoDoPasso,
} from '../src/ui/quero-fazer-model.js';
import type { Tarefa } from '../src/ui/quero-fazer-model.js';

const IDS = new Set(ACTION_TABLE.map((linha) => linha.id));
const acoesDa = (t: Tarefa): string[] => t.passos.flatMap((p) => ('acao' in p ? [p.acao] : []));

describe('Quero fazer…: as tarefas', () => {
  it('são pelo menos quinze, e os ids não se repetem', () => {
    expect(TAREFAS.length).toBeGreaterThanOrEqual(15);
    expect(new Set(TAREFAS.map((t) => t.id)).size).toBe(TAREFAS.length);
  });

  it('cada tarefa tem de 3 a 6 passos, e pelo menos um é comando', () => {
    for (const t of TAREFAS) {
      expect(t.passos.length, t.id).toBeGreaterThanOrEqual(3);
      expect(t.passos.length, t.id).toBeLessThanOrEqual(6);
      expect(primeiroComando(t), t.id).not.toBeNull();
    }
  });

  it('toda ação citada existe na tabela de ações', () => {
    const fora = TAREFAS.flatMap((t) => acoesDa(t).filter((id) => !IDS.has(id)).map((id) => `${t.id}: ${id}`));
    expect(fora).toEqual([]);
  });

  it('toda ação citada tem porta no menu', () => {
    const semPorta = TAREFAS.flatMap((t) => acoesDa(t).filter((id) => caminhoDe(id) === null).map((id) => `${t.id}: ${id}`));
    expect(semPorta).toEqual([]);
  });

  it('todo passo com comando diz onde ele está: o {menu} vira o caminho', () => {
    for (const t of TAREFAS) {
      for (const p of t.passos) {
        if (!('acao' in p)) continue;
        expect(p.texto, `${t.id}: ${p.acao}`).toContain('{menu}');
        const escrito = textoDoPasso(p);
        expect(escrito).not.toContain('{menu}');
        expect(escrito).not.toContain('não está nos menus');
        expect(escrito, 'reticências seguidas de ponto').not.toContain('….');
      }
    }
  });

  it('as palavras pedidas pelo Diretor acham a tarefa certa', () => {
    const primeira = (texto: string): string | undefined => buscarTarefas(texto)[0]?.id;
    expect(primeira('arma')).toBe('arma');
    expect(primeira('veiculo')).toBe('veiculo');
    expect(primeira('roupa')).toBe('roupa');
    expect(primeira('animacao de outro')).toBe('animacao-de-outro');
    expect(primeira('gif')).toBe('gif');
    expect(primeira('psd')).toBe('importar-psd');
  });
});

describe('Quero fazer…: o caminho, montado dos menus', () => {
  it('o caminho sai do rótulo e da tecla que o menu tem hoje', () => {
    const c = caminhoDe('exportar-imagem');
    expect(c?.rotulos).toEqual(['Arquivo', 'Exportar', 'GIF, PNG, folha, vídeo…']);
    expect(caminhoEscrito(caminhoDe('chavear')!)).toBe('Animação → Chavear (K)');
  });

  it('um rótulo renomeado no menu muda o texto do passo sozinho', () => {
    // O menu de mentira: o mesmo id, com outro nome.
    const menus = allMenus(NEUTRAL_MENU_STATE).map((g) => g.label !== 'Base' ? g : {
      ...g,
      entries: g.entries.map((e) => ('action' in e && e.action === 'subir-ordem' ? { ...e, label: 'Um passo para a frente' } : e)),
    });
    const passo = TAREFAS.find((t) => t.id === 'frente')!.passos.find((p) => 'acao' in p)!;
    expect(textoDoPasso(passo, menus)).toContain('Base → Um passo para a frente');
  });

  it('uma ação que saiu do menu é DITA, e não inventada (regra 21)', () => {
    expect(textoDoPasso({ acao: 'nao-existe', texto: 'Escolha {menu}.' })).toContain('não está nos menus');
  });

  it('o próprio Quero fazer… está no menu Ajuda', () => {
    const ajuda = allMenus(NEUTRAL_MENU_STATE).find((g) => g.label === 'Ajuda')!;
    expect(flatEntries(ajuda.entries).map((e) => e.action)).toContain('quero-fazer');
    expect(IDS.has('quero-fazer')).toBe(true);
  });
});

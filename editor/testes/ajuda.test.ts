/**
 * Ajuda e manual — os testes por assunto (lote A3, v10.6).
 *
 * Um `describe` por arquivo antigo, com o nome e o cabeçalho dele, e os
 * mesmos testes dentro. O miolo vai sem recuo: um texto de várias linhas
 * não pode mudar.
 *
 * Juntou: `lote30-manual`, `lote30-manual-completo`.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { describeManual } from './manual-pausado.js';
import { allMenus, flatEntries, WINDOW_PANELS } from '../src/ui/menus.js';
import type { MenuGroupDef, MenuState } from '../src/ui/menus.js';
import { actionBarItems } from '../src/ui/action-bar-model.js';
import { toolbarItems } from '../src/ui/toolbar-model.js';
import * as toolbarModel from '../src/ui/toolbar-model.js';
import { getTools } from '../src/contract.js';
import { SHOW_ROWS, SCENE_ROWS } from '../src/panels/view-panel.js';
import { viewMenuState } from './ajuda-view.js';
import '../src/viewport/tools/select.js';
import '../src/viewport/tools/translate.js';
import '../src/viewport/tools/rotate.js';
import '../src/viewport/tools/scale.js';
import '../src/viewport/tools/shear.js';
import '../src/viewport/tools/pose-tool.js';
import '../src/viewport/tools/create-bone.js';
import '../src/viewport/tools/point-tool.js';
import '../src/viewport/tools/box-tool.js';
import '../src/viewport/tools/mesh-tool.js';
import '../src/viewport/tools/weights-tool.js';
import { CONTEXT_ACTIONS } from '../src/ui/action-audit.js';
import '../src/panels/index.js';

/** O que o rodapé escreve no lugar do interruptor: `ui/where-model.ts`. */
const ONDE_SE_ESTA = ['Base', 'Animação'] as const;

// ---------------------------------------------------------------------------
// manual (lote 30) — era `lote30-manual.test.ts`
// ---------------------------------------------------------------------------

describe('manual (lote 30)', () => {
/**
 * Lote 30 (v5.3): o manual reescrito, e o que impede ele de envelhecer calado.
 *
 * O manual de `documentos/manual/` foi remendado vinte e nove vezes antes
 * desta reescrita, e envelheceu de dois jeitos diferentes:
 *
 * 1. **Imagem que sumiu.** Um capítulo citava `imagens/painel-previa.png`, o
 *    arquivo foi renomeado num lote, e o manual passou a mostrar o texto
 *    alternativo em itálico — no navegador e na página de Ajuda → Manual. Nada
 *    reprovava.
 * 2. **Botão que mudou de nome.** O manual dizia "Editar → Copiar âncora do
 *    desenho"; o lote 29 renomeou a ação para "Copiar posição no osso". O
 *    manual continuou dizendo a frase antiga por um lote inteiro, e quem
 *    seguisse o passo procuraria um item que não existe.
 *
 * Os dois viram teste aqui. **Sem DOM**: são arquivos lidos do disco e listas
 * lidas dos próprios módulos do editor.
 *
 * A regra do segundo teste, escrita, porque ela é o que dá trabalho manter:
 * `ROTULOS` é a lista dos rótulos que o manual cita **como sendo o nome exato
 * de um botão ou de um item de menu**. Cada linha tem de estar nos dois lados
 * ao mesmo tempo — no editor e no manual. Renomear um botão sem reescrever a
 * frase reprova; tirar a frase do manual sem tirar a linha daqui também.
 */
// As ferramentas se registram ao serem importadas. Sem estas linhas,
// `getTools()` devolve lista vazia e metade dos testes passa por engano.

const MANUAL = resolve(__dirname, '../../documentos/manual');
const IMAGENS = resolve(MANUAL, 'imagens');

function state(patch: Partial<MenuState> = {}): MenuState {
  return {
    canRepack: false,
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
    ...patch,
  };
}

function menus(): MenuGroupDef[] {
  return allMenus(state());
}

/** Os arquivos do manual, nas duas línguas, com o caminho e o texto. */
function chapters(): Array<{ file: string; text: string }> {
  const out: Array<{ file: string; text: string }> = [];
  for (const dir of [MANUAL, resolve(MANUAL, 'en')]) {
    for (const name of readdirSync(dir)) {
      if (!name.endsWith('.md')) continue;
      out.push({ file: `${dir === MANUAL ? '' : 'en/'}${name}`, text: readFileSync(resolve(dir, name), 'utf8') });
    }
  }
  return out;
}

const CAPITULOS = chapters();

/*
 * O texto de todos os capítulos, com os espaços achatados.
 *
 * O manual é quebrado em 79 colunas, então uma frase citada pode nascer
 * partida em duas linhas — "Janela → Detalhes da / linha do tempo". No
 * Markdown uma quebra de linha É um espaço, e a busca por rótulo tem de
 * enxergar o mesmo que o leitor enxerga.
 */
const TEXTO_INTEIRO = CAPITULOS.map((c) => c.text).join('\n').replace(/\s+/g, ' ');

// ---------------------------------------------------------------------------
// A forma do manual
// ---------------------------------------------------------------------------

describeManual('o manual tem o fluxo mais oito capítulos, nas duas línguas', () => {
  it('são dez arquivos de cada lado: o índice, o fluxo e os oito', () => {
    const pt = CAPITULOS.filter((c) => !c.file.startsWith('en/'));
    const en = CAPITULOS.filter((c) => c.file.startsWith('en/'));
    expect(pt).toHaveLength(10);
    expect(en).toHaveLength(10);
  });

  it('cada capítulo abre dizendo o que o leitor vai conseguir fazer', () => {
    const marca = /## O que você vai conseguir fazer no fim|## What you will be able to do by the end/;
    for (const cap of CAPITULOS) {
      if (cap.file.endsWith('README.md')) continue;
      expect(marca.test(cap.text), `${cap.file} não abre com a promessa`).toBe(true);
    }
  });

  it('cada capítulo fecha com a lista honesta do que falta', () => {
    const marca = /## O que ainda não funciona|## What does not work yet/;
    for (const cap of CAPITULOS) {
      if (cap.file.endsWith('README.md')) continue;
      expect(marca.test(cap.text), `${cap.file} não tem "o que ainda não funciona"`).toBe(true);
    }
  });

  it('todo capítulo aponta para a outra língua', () => {
    for (const cap of CAPITULOS) {
      expect(/Também em inglês|Also in Portuguese/.test(cap.text), `${cap.file}`).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// 1. Imagem citada é imagem que existe
// ---------------------------------------------------------------------------

// 07/10/2026: despausado. Com o manual da v36.5, os três deste bloco ficaram
// verdes com a pausa desligada (rodados um a um, de fora, antes de tirar).
describe('as imagens do manual', () => {
  /** Toda imagem citada, em todos os capítulos, pelo nome do arquivo. */
  function citadas(): Set<string> {
    const nomes = new Set<string>();
    for (const cap of CAPITULOS) {
      for (const achado of cap.text.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
        nomes.add((achado[1].split('/').pop() ?? '').trim());
      }
    }
    return nomes;
  }

  const NO_DISCO = new Set(readdirSync(IMAGENS).filter((n) => n.endsWith('.png')));

  it('toda imagem citada existe no disco', () => {
    const faltando = [...citadas()].filter((nome) => !NO_DISCO.has(nome));
    expect(faltando).toEqual([]);
  });

  it('toda imagem no disco é citada por algum capítulo', () => {
    const usadas = citadas();
    const sobrando = [...NO_DISCO].filter((nome) => !usadas.has(nome));
    expect(sobrando).toEqual([]);
  });

  it('toda imagem leva uma legenda no texto alternativo, e não um nome de arquivo', () => {
    for (const cap of CAPITULOS) {
      for (const achado of cap.text.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)) {
        const alt = achado[1];
        expect(alt.length, `${cap.file}: ${achado[2]} sem legenda`).toBeGreaterThan(12);
        expect(alt.endsWith('.png'), `${cap.file}: a legenda é um nome de arquivo`).toBe(false);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// 2. Rótulo citado é rótulo que existe
// ---------------------------------------------------------------------------

/**
 * Todo nome que o editor mostra: item de menu, botão da barra, ferramenta,
 * painel e as duas metades do interruptor de modo.
 *
 * O "Desfazer …" do menu Editar vem com o nome do passo colado ("Desfazer
 * Mover osso"), então o conjunto guarda também a primeira palavra de cada
 * rótulo composto — senão "Desfazer" nunca seria achado.
 */
function rotulosDoEditor(): Set<string> {
  const nomes = new Set<string>();
  const por = (texto: string): void => {
    const limpo = texto.trim();
    if (limpo !== '') nomes.add(limpo);
  };
  for (const grupo of menus()) {
    por(grupo.label);
    for (const entrada of flatEntries(grupo.entries)) por(entrada.label);
  }
  for (const item of actionBarItems(getTools())) {
    por(item.label);
    por(item.hint);
  }
  for (const item of toolbarItems(getTools())) {
    por(item.label);
    por(item.hint);
  }
  for (const painel of WINDOW_PANELS) por(painel.label);
  for (const palavra of ONDE_SE_ESTA) por(palavra);
  for (const linha of [...SHOW_ROWS, ...SCENE_ROWS]) por(linha.label);
  return nomes;
}

/**
 * Os rótulos que o manual cita como o nome exato de um botão ou de um item.
 *
 * Não é a lista inteira do editor, e não deve ser: é a lista do que o manual
 * **promete**. Cada um é conferido dos dois lados.
 */
const ROTULOS: readonly string[] = Object.freeze([
  // Menus
  'Arquivo', 'Editar', 'Exibir', 'Esqueleto', 'Animação', 'Janela', 'Ajuda',
  // Arquivo
  'Novo', 'Abrir…', 'Salvar', 'Salvar como…', 'Salvar como binário…',
  'Salvar como pacote…', 'Importar', 'Exportar', 'Reabrir o fechado',
  'Repetir a última exportação', 'Configurações do projeto…',
  'De outro programa…', 'PSD…', 'Imagens…', 'glTF…', 'Imagem…', 'Por pele…',
  // Editar
  'Substituir nomes…', 'Inverter a seleção',
  'Copiar posição no osso', 'Colar posição no osso',
  // Exibir
  'Réguas', 'Tema', 'Casca de cebola', 'Imagem de referência…',
  'Mostrar nome das ferramentas', 'Nome ao passar o mouse',
  'Ver só o resultado', 'Enquadrar seleção', 'Ajustar à tela',
  'Tamanho real (100%)',
  // Esqueleto
  'Virar filho de…', 'Reempacotar atlas', 'Trazer para a frente',
  'Mandar para trás', 'Voltar à pose de repouso', 'Compensar',
  'Não mexer nos filhos', 'Não mexer nos desenhos', 'Não mexer nas caixas',
  'Travar o escolhido', 'Travar o resto', 'Destravar tudo',
  // Animação
  // 'Gravar sozinho' saiu no degrau 4a (M6, 17/09/2026): editar sempre grava.
  'Nova animação', 'Mudar duração…', 'Repetir', 'Chavear', 'Chavear tudo',
  'Curva da chave', 'Marcas', 'Trecho de laço',
  'Esticar seleção…', 'Espelhar no tempo', 'Fechar ciclo',
  'Espelhar esquerda e direita…', 'Limpar a animação inteira…',
  'Montagem ⇄ Animando',
  // Janela e Ajuda
  'Esconder painéis', 'Voltar ao padrão', 'Detalhes da linha do tempo',
  'Manual', 'Atalhos do teclado', 'Paleta de comandos',
  // Ferramentas
  'Selecionar', 'Mover', 'Girar', 'Escalar', 'Inclinar', 'Posar',
  'Criar osso', 'Ponto', 'Caixa', 'Malha', 'Pesos',
  // Barra de ações
  'Desfazer', 'Refazer', 'Copiar', 'Colar', 'Apagar', 'Recortar chaves',
  'Ver ossos', 'Travar ossos', 'Ver desenhos', 'Travar desenhos',
  // Painéis
  'Árvore', 'Ordem', 'Propriedades', 'Animações', 'Peles', 'Regras',
  'Histórico', 'Imagens', 'Exibição', 'Prévia', 'Malha e pesos',
  'Linha do tempo', 'Curvas',
  // As duas metades do interruptor
  'Montagem', 'Animando',
]);

describeManual('todo rótulo que o manual cita existe no editor', () => {
  const DO_EDITOR = rotulosDoEditor();

  it('cada um está entre os nomes que a tela mostra', () => {
    const orfaos = ROTULOS.filter((nome) => {
      if (DO_EDITOR.has(nome)) return true;
      // Um rótulo composto ("Desfazer Mover osso") começa pelo nome curto.
      for (const doEditor of DO_EDITOR) if (doEditor.startsWith(nome)) return true;
      return false;
    });
    expect(ROTULOS.filter((n) => !orfaos.includes(n))).toEqual([]);
  });

  it('cada um está escrito em algum capítulo, nas duas línguas juntas', () => {
    const ausentes = ROTULOS.filter((nome) => !TEXTO_INTEIRO.includes(nome));
    expect(ausentes).toEqual([]);
  });

  it('a lista não repete linha', () => {
    expect(new Set(ROTULOS).size).toBe(ROTULOS.length);
  });
});

// ---------------------------------------------------------------------------
// 3. Os dois defeitos que a reescrita achou
// ---------------------------------------------------------------------------

describe('as cinco ferramentas de estrutura não somem mais (degrau 4a)', () => {
  /*
   * O manual diz isso desde a fase 6, e desde o lote 17 era mentira: o
   * `syncToolModes` marca `hidden` nos cinco botões, mas
   * `.viewport-button { display: inline-flex }` é regra de autor e vence o
   * `[hidden] { display: none }` do navegador. Os cinco continuavam
   * desenhados e clicáveis com uma animação aberta.
   *
   * São dois testes porque são duas coisas: a LISTA (quais valem em cada
   * modo) e a REGRA DE CSS que faz o `hidden` valer. A lista já estava certa.
   */
  // Lote 57, plano pivô: Criar osso, Ponto e Caixa passaram a valer nos dois
  // modos. Somem em Animando só Malha e Pesos — e a regra de CSS abaixo
  // continua sendo o que faz os dois sumirem de verdade.
  // Lote A3: a conta era 11 e 9 com as ferramentas que ESTE arquivo registrava
  // sozinho; junto do outro arquivo do manual entra também o Transformar
  // (lote 47). O que se prova é o mesmo: em Animando somem só Malha e Pesos.
  it('nenhuma ferramenta some por modo: a lista é uma só, e `toolsForMode` saiu (M4)', () => {
    // Plano "fluxo criar e animar", lote 2, 14/09/2026: Malha e Pesos deixaram
    // de ser só de Montagem. Degrau 4a, 17/09/2026: o próprio filtro saiu. O
    // Humberto: *"tudo sempre disponível; nenhuma ferramenta some ao animar"*.
    const todas = getTools();
    expect('toolsForMode' in toolbarModel).toBe(false);
    const naBarra = toolbarItems(todas).map((t) => t.id);
    expect(naBarra).toHaveLength(todas.length);
    for (const id of [
      'select', 'translate', 'rotate', 'scale', 'shear', 'pose', 'create-bone', 'point', 'box', 'mesh', 'weights',
    ]) {
      expect(naBarra).toContain(id);
      expect('modes' in todas.find((t) => t.id === id)!, id).toBe(false);
    }
  });

  it('o CSS faz o `hidden` vencer o `display` do botão', () => {
    // O conserto era local, no `.viewport-button[hidden]`, e virou uma regra
    // só para o programa inteiro no lote 38 — depois de a mesma família de
    // defeito voltar cinco vezes. É essa regra que este teste pina agora.
    const css = readFileSync(resolve(__dirname, '../src/ui/shell.css'), 'utf8');
    expect(css).toMatch(/\[hidden\]\s*\{\s*display:\s*none\s*!important/);
  });
});

describe('"Exibir → Réguas" não está mais cinza', () => {
  /*
   * As réguas chegaram no lote 21 e o item do menu ficou cinza desde então:
   * `ver-reguas` nunca foi registrado, e não havia caixa nenhuma no painel
   * Exibição. Elas ficavam ligadas para sempre, sem jeito de desligar.
   *
   * Quem registra as ações é o `SHOW_ROWS`; quem desenha a caixa é o
   * `SCENE_ROWS`. `rulers` tem de estar nos dois.
   */
  it('`rulers` está na lista que registra as ações de exibir', () => {
    expect(SHOW_ROWS.map((r) => r.key)).toContain('rulers');
  });

  it('`rulers` está na lista que desenha as caixas do grupo "A cena"', () => {
    expect(SCENE_ROWS.map((r) => r.key)).toContain('rulers');
  });

  it('o item do menu Exibir aponta para a ação `ver-reguas`', () => {
    const exibir = menus().find((m) => m.label === 'Exibir');
    const item = flatEntries(exibir?.entries ?? []).find((e) => e.label === 'Réguas');
    expect(item?.action).toBe('ver-reguas');
  });
});
});

// ---------------------------------------------------------------------------
// manual completo (lote 30) — era `lote30-manual-completo.test.ts`
// ---------------------------------------------------------------------------

describe('manual completo (lote 30)', () => {
/**
 * Lote 30, parte 2: o manual cobre **tudo** o que o programa faz.
 *
 * O pedido do Humberto: *"faça um manual do programa com prints explicando
 * TUDO que o programa é capaz de fazer"*. "Tudo" não é uma palavra de efeito
 * aqui — é uma conta, e esta é a conta.
 *
 * O teste do `lote30-manual.test.ts` confere um sentido: **nome citado no
 * manual existe no programa**. Este confere o outro, que é o que dá o "tudo":
 * **função do programa está citada no manual**.
 *
 * São cinco universos, e cada um tem de estar inteiro dentro do texto:
 *
 * | Universo | De onde sai |
 * |:---|:---|
 * | toda entrada dos sete menus | `allMenus`, submenus incluídos |
 * | toda tecla escrita num menu | a mesma lista |
 * | toda ferramenta | `getTools()` |
 * | todo painel | `WINDOW_PANELS` |
 * | toda ação registrada | varrida do código-fonte, como no lote 29 |
 *
 * `EXEMPT_MANUAL` é a dívida, e **cada linha carrega o motivo**. Sem o motivo
 * escrito a lista cresce até a auditoria não provar mais nada — é a mesma
 * regra do `EXEMPT` do `action-audit.ts`.
 */
const SRC = resolve(__dirname, '../src');
const MANUAL = resolve(__dirname, '../../documentos/manual');

// ---------------------------------------------------------------------------
// O texto do manual, e o do editor
// ---------------------------------------------------------------------------

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (full.endsWith('.ts')) out.push(full);
  }
  return out;
}

/** Toda ação que o programa registra, lida do código-fonte — como no lote 29. */
function registeredActions(): string[] {
  const ids = new Set<string>();
  for (const file of walk(SRC)) {
    const text = readFileSync(file, 'utf8');
    for (const m of text.matchAll(/registerAction\('([^']+)'/g)) ids.add(m[1]!);
    for (const m of text.matchAll(/(?<![.\w])add\('([^']+)'\s*,\s*\(/g)) ids.add(m[1]!);
  }
  return [...ids];
}

/**
 * O manual inteiro, nas duas línguas, com os espaços achatados.
 *
 * As duas línguas juntas de propósito: o manual em inglês escreve o rótulo
 * português entre parênteses, e é lá que muitos nomes aparecem uma segunda
 * vez. O que importa é que a função esteja escrita em algum lugar do manual.
 */
function textoDoManual(): string {
  const partes: string[] = [];
  for (const dir of [MANUAL, resolve(MANUAL, 'en')]) {
    for (const name of readdirSync(dir)) {
      if (name.endsWith('.md')) partes.push(readFileSync(resolve(dir, name), 'utf8'));
    }
  }
  return partes.join('\n').replace(/\s+/g, ' ');
}

const TEXTO = textoDoManual();

function state(): MenuState {
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

function menus(): MenuGroupDef[] {
  return allMenus(state());
}

/**
 * Um nome está no manual?
 *
 * A comparação é frouxa de propósito em dois pontos, e só neles:
 *
 * - **reticências**: o manual escreve "Salvar como…" com o caractere `…`, e o
 *   menu também; mas uma frase corrida às vezes diz "Salvar como" sem elas.
 *   Um item que só difere pelas reticências é o mesmo item.
 * - **"Desfazer …"**: o rótulo do menu Editar vem com o nome do passo colado.
 *   Quando o rótulo tem espaço, a primeira palavra também vale.
 */
function estaNoManual(nome: string): boolean {
  const limpo = nome.trim();
  if (limpo === '') return true;
  if (TEXTO.includes(limpo)) return true;
  const semReticencias = limpo.replace(/…$/, '');
  return semReticencias !== limpo && TEXTO.includes(semReticencias);
}

// ---------------------------------------------------------------------------
// A dívida, com o motivo por linha
// ---------------------------------------------------------------------------

/**
 * O que o manual **não** precisa citar, e por quê.
 *
 * Nada aqui é "não deu tempo". Cada linha é uma coisa que não é função para
 * quem usa o programa: um sinônimo interno, uma ação que só o teste chama, ou
 * um item que o próprio menu marca como "vem no lote seguinte" — esse último
 * grupo está no manual como **pendência**, não como função, e é isso que a
 * seção "O que ainda não funciona" de cada capítulo faz.
 */
const EXEMPT_MANUAL: readonly { nome: string; why: string }[] = Object.freeze([
  // --- cinzas: existem no menu, mas ainda não fazem nada -------------------
  {
    nome: 'Abrir recente',
    why: 'cinza; a dica diz "vem no lote 4". Está no manual como pendência do capítulo 1, e não como função.',
  },
  {
    nome: 'Sair',
    why: 'cinza; a dica diz "vem no lote 4". Fechar a aba é o que fecha o programa, e isso o manual explica.',
  },
  {
    nome: 'Selecionar tudo',
    why: 'cinza no menu Editar até "Selecionar todas as chaves" existir; as duas dividem `Ctrl+A`.',
  },
  {
    nome: 'Selecionar todas as chaves',
    why: 'cinza; a dica diz "vem no lote 6".',
  },
  {
    nome: 'Buscar na Árvore…',
    why: 'cinza; está no capítulo 2 como botão cinza e como pendência, com o caminho de contorno.',
  },
  // --- sinônimos e ações que só o código chama -----------------------------
  {
    nome: 'nova-regra-ik',
    why: 'sinônimo interno: o menu chama a janela guiada desde o lote 29. Já está no EXEMPT do action-audit.',
  },
  {
    nome: 'nova-regra-transform',
    why: 'o mesmo que `nova-regra-ik`: a janela guiada cria a regra de transformação, e esta ação ficou para os testes e para a importação.',
  },
  {
    nome: 'nova-regra-path',
    why: 'o mesmo que `nova-regra-ik`: a janela guiada cria a regra de caminho, e esta ação ficou para os testes e para a importação.',
  },
  {
    nome: 'nova-regra-physics',
    why: 'o mesmo que `nova-regra-ik`: a janela guiada cria a regra de física, e esta ação ficou para os testes e para a importação.',
  },
  {
    nome: 'nova-regra-driver',
    why: 'o mesmo que `nova-regra-ik`: a janela guiada cria a regra de comando, e esta ação ficou para os testes e para a importação.',
  },
]);

const ISENTOS = new Set(EXEMPT_MANUAL.map((linha) => linha.nome));

// ---------------------------------------------------------------------------
// Os cinco universos
// ---------------------------------------------------------------------------

describeManual('o manual cita toda entrada dos sete menus', () => {
  it('nenhum item de menu ficou de fora', () => {
    const faltando: string[] = [];
    for (const grupo of menus()) {
      if (!estaNoManual(grupo.label)) faltando.push(`menu ${grupo.label}`);
      for (const entrada of flatEntries(grupo.entries)) {
        const rotulo = entrada.label;
        // "Desfazer" e "Refazer" chegam com o nome do passo colado quando há
        // pilha; sem pilha eles são a palavra sozinha, que é o que o manual diz.
        if (ISENTOS.has(rotulo)) continue;
        if (!estaNoManual(rotulo)) faltando.push(`${grupo.label} → ${rotulo}`);
      }
    }
    expect(faltando).toEqual([]);
  });

  it('nenhuma tecla escrita num menu ficou de fora', () => {
    const faltando: string[] = [];
    for (const grupo of menus()) {
      for (const entrada of flatEntries(grupo.entries)) {
        const tecla = entrada.shortcut;
        if (tecla === undefined) continue;
        if (ISENTOS.has(entrada.label)) continue;
        if (!TEXTO.includes(tecla)) faltando.push(`${tecla} (${grupo.label} → ${entrada.label})`);
      }
    }
    expect(faltando).toEqual([]);
  });
});

// 07/10/2026: despausado — os três deste bloco verdes com o manual da v36.5.
describe('o manual cita toda ferramenta e todo painel', () => {
  it('as onze ferramentas, com nome e tecla', () => {
    const faltando: string[] = [];
    for (const tool of getTools()) {
      if (!estaNoManual(tool.label)) faltando.push(`ferramenta ${tool.label}`);
      const tecla = tool.shortcut;
      if (tecla !== null && !TEXTO.includes(`\`${tecla.toUpperCase()}\``)) {
        faltando.push(`tecla ${tecla.toUpperCase()} de ${tool.label}`);
      }
    }
    expect(faltando).toEqual([]);
  });

  it('os treze painéis', () => {
    const faltando = WINDOW_PANELS
      .filter((painel) => !estaNoManual(painel.label))
      .map((painel) => `painel ${painel.label}`);
    expect(faltando).toEqual([]);
  });

  it('as duas palavras do rodapé, Base e Animação (o interruptor saiu no degrau 11)', () => {
    const faltando = ONDE_SE_ESTA.filter((palavra) => !estaNoManual(palavra));
    expect(faltando).toEqual([]);
  });
});

describeManual('o manual cita toda ação que o programa registra', () => {
  /**
   * Cada ação registrada tem de ter, no manual, **o nome pelo qual ela aparece
   * na tela** — o rótulo do menu, o do botão da barra, ou a linha do botão
   * direito. Uma ação sem nenhum desses é uma função sem porta, e disso trata
   * o `hiddenFunctions` do lote 29, não este teste.
   */
  it('toda ação alcançável pela tela tem o nome dela escrito no manual', () => {
    const rotuloDaAcao = new Map<string, string>();
    for (const grupo of menus()) {
      for (const entrada of flatEntries(grupo.entries)) {
        if (!rotuloDaAcao.has(entrada.action)) rotuloDaAcao.set(entrada.action, entrada.label);
      }
    }
    for (const item of actionBarItems(getTools())) {
      if (!rotuloDaAcao.has(item.actionId)) rotuloDaAcao.set(item.actionId, item.label);
    }
    for (const item of CONTEXT_ACTIONS) {
      if (!rotuloDaAcao.has(item.action)) rotuloDaAcao.set(item.action, item.where);
    }

    const faltando: string[] = [];
    for (const id of registeredActions()) {
      if (ISENTOS.has(id)) continue;
      const rotulo = rotuloDaAcao.get(id);
      // Sem rótulo, a ação não tem porta na tela: é assunto do lote 29.
      if (rotulo === undefined) continue;
      if (ISENTOS.has(rotulo)) continue;
      if (!estaNoManual(rotulo)) faltando.push(`${id} → "${rotulo}"`);
    }
    expect(faltando).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// A dívida não pode crescer calada
// ---------------------------------------------------------------------------

// 07/10/2026: despausado — os três deste bloco verdes com o manual da v36.5.
describe('a lista de isentos', () => {
  it('toda linha tem um motivo escrito, e não uma frase vazia', () => {
    for (const linha of EXEMPT_MANUAL) {
      expect(linha.why.length, `${linha.nome} sem motivo`).toBeGreaterThan(30);
      expect(linha.why.endsWith('.'), `${linha.nome}: o motivo não é uma frase`).toBe(true);
    }
  });

  it('não repete linha', () => {
    expect(new Set(EXEMPT_MANUAL.map((l) => l.nome)).size).toBe(EXEMPT_MANUAL.length);
  });

  it('é curta: dez linhas ou menos', () => {
    // Uma dívida que passa de dez linhas deixou de ser exceção e virou regra.
    expect(EXEMPT_MANUAL.length).toBeLessThanOrEqual(10);
  });
});
});

describe('rodada 23, defeito 13: o Sobre diz a versão guardada, e não 0.1.0', () => {
  it.skipIf(!existsSync(resolve(__dirname, '../../backup/versoes')))('o Vite escreve a última versão de backup/versoes; sem ela, cai no pacote', async () => {
    const { aboutVersion } = await import('../src/ui/shell-actions.js');
    // Pela config da raiz o Vite não define a constante e cai no pacote, sem
    // quebrar; pela do editor ela vale, e é a última versão guardada.
    const guardadas = readdirSync(resolve(__dirname, '../../backup/versoes'))
      .map((n) => /^recorte v(\d+)\.(\d+) /.exec(n)).filter((m): m is RegExpExecArray => m !== null)
      .map((m) => [Number(m[1]), Number(m[2])] as const).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const ultima = guardadas.at(-1)!;
    expect(['0.1.0', `v${ultima[0]}.${ultima[1]}`]).toContain(aboutVersion());
    const config = readFileSync(resolve(__dirname, '../vite.config.ts'), 'utf8');
    expect(config).toContain('define: { __RECORTE_VERSAO__: JSON.stringify(versaoGuardada()) }');
    expect(config).toContain("new URL('../backup/versoes', import.meta.url)");
  });
});

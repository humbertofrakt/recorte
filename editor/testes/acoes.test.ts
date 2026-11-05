/**
 * Lote A2 (v10.5) — toda ação com dono, `ui/actions-table.ts`.
 *
 * Sem DOM, e sem painel montado nenhum. O Humberto, 11/09/2026: *"organizar o
 * programa para só abrir a parte que vamos mexer"*. A tabela diz quem faz cada
 * item dos sete menus e quando ele existe; as ações de **arranque** existem
 * desde o `main.ts`, com qualquer aba fechada. É isso que se prova aqui: sem
 * Árvore, sem Ordem, sem Animações, sem Peles e sem linha do tempo, o menu
 * cria, apaga, duplica, muda a ordem, abre animação, cria pele e copia a pose.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

import { parseBoneText } from '../../runtime/src/index.js';
import type { BoneFile } from '../../runtime/src/index.js';
import { emptySelection } from '../src/contract.js';
import { Doc } from '../src/doc/document.js';
import { ACTION_TABLE, actionRow } from '../src/ui/actions-table.js';
import { actionState, clearActions, registeredActions, runAction } from '../src/ui/actions.js';
import { registerCoreActions } from '../src/ui/register-actions.js';
import { NEUTRAL_MENU_STATE, allMenus, flatEntries } from '../src/ui/menus.js';
import { auditMenus } from '../src/ui/menu-audit.js';
import { CONTEXT_ACTIONS } from '../src/ui/action-audit.js';
import { KEY_TABLE } from '../src/ui/keys.js';
import { keyClipboard, setKeyClipboard } from '../src/panels/dopesheet-actions.js';
import { openAnimation } from '../src/panels/animations-actions.js';
import { transport } from '../src/anim/transport.js';
import { fraseDoRodape, juntarFrases } from '../src/ui/shell-status.js';
import { NEXT_STEPS, nextStep, nextStepInputOf, nextStepLine, nextStepParts, nextStepVisible } from '../src/ui/next-step-model.js';
import type { NextStepInput } from '../src/ui/next-step-model.js';
import { DEFAULT_PREFS, parsePrefs } from '../src/ui/prefs.js';

const SRC = resolve(__dirname, '../src');
const HEROI = readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8');

/** O herói aberto, com o que o rodapé disse anotado. */
function heroi(): { doc: Doc; ditos: string[] } {
  const doc = new Doc(JSON.parse(HEROI) as BoneFile);
  const ditos: string[] = [];
  const dizer = doc.notice.bind(doc);
  doc.notice = (texto: string): void => { ditos.push(texto); dizer(texto); };
  return { doc, ditos };
}

/** Toda ação dos sete menus, em Animando e em Montagem. */
function idsDosMenus(): string[] {
  const ids = new Set<string>();
  for (const animating of [true, false]) {
    for (const group of allMenus({ ...NEUTRAL_MENU_STATE, animating })) {
      for (const entry of flatEntries(group.entries)) ids.add(entry.action);
    }
  }
  return [...ids].sort();
}

/** Todo `.ts` debaixo de uma pasta. */
function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (full.endsWith('.ts')) out.push(full);
  }
  return out;
}

const arranque = (): string[] => ACTION_TABLE.filter((row) => row.where === 'arranque').map((row) => row.id).sort();

beforeEach(() => clearActions());

describe('a tabela das ações', () => {
  it('toda ação dos doze menus está nela, e ela só tem ações de menu', () => {
    const tabela = ACTION_TABLE.map((row) => row.id).sort();
    expect(tabela).toEqual(idsDosMenus());
    // 177 desde 14/09/2026: entrou **Copiar a pose do escolhido** (item 9 da
    // linha do tempo, comando próprio, no menu Animação) — `copiar-pose`
    // (item 85) volta a ser sempre a pose inteira, sem depender da seleção.
    // 178 desde 14/09/2026: entrou **Empurrar as chaves…** (item 4), a porta
    // que faltava para a `rippleMove` que já existia sem gesto.
    // 179 desde 14/09/2026: entrou **Limpar chaves repetidas** (item 8).
    // 178 desde 17/09/2026: saiu **Gravar sozinho** (degrau 4a, M6 — editar
    // sempre grava), e com ele a tecla A.
    // 179 desde 17/09/2026, tarde: entrou **Colar corpo aqui** (degrau 4b, M10,
    // spec 9.13 — a virada de corpo), no menu Animação, da casca.
    // 181 desde 17/09/2026, noite: entraram **Ferramenta de antes** e
    // **Opções do desenho…** (degrau 7, tarefa 7.5, defeito A7) — as duas
    // portas do botão direito na cena, que só existiam como gesto.
        // 182 desde 17/09/2026, noite: entrou o painel **Entidades** (degrau 5,
    // tarefa 5.4, E15) — todo painel do menu Janela é uma ação da casca.
    // 186 desde 18/09/2026: o degrau 10 abriu quatro portas no menu Arquivo —
    // **Abrir outro corpo…** e **Abrir uma entidade…** (E17), **Entregar um
    // corpo…** (P2) e **Salvar a entidade editada…** (E4).
    // 187 desde 18/09/2026: entrou o painel **Pivôs** (degrau 8, tarefa 8.5,
    // C4) — todo painel do menu Janela é uma ação da casca.
    // 190 desde 18/09/2026: as três portas da pele (degrau 9, tarefas 9.7 e
    // 9.8) — **Exportar pele…** (`exportar-pele-arquivo`, que é o `.bone` só
    // de skins com `rig`, e NÃO o `exportar-pele` do fatiar), **Importar
    // pele…** e **Promover pele a base…**.
    // 195 desde 18/09/2026: o degrau 11 abriu cinco portas no menu Janela —
    // o submenu **Arranjos**, os dois de fábrica (**Pivô** e
    // **Visualização**), **Guardar este arranjo…** e **Apagar um arranjo…**
    // (lote 4, C6). O `alternar-modo` saiu no lote 1 e o `abrir-a-base` entrou
    // no lugar, então o interruptor não mexeu na conta.
    // 196 desde 18/09/2026: entrou **Problemas do arquivo…** (lote 6), a
    // Janela de Problemas — a regra 21 com tela.
    // 198 desde 18/09/2026: a biblioteca de animações (degrau 12, parte `B`)
    // abriu **Exportar animação…** e **Importar animação…** no menu Animação —
    // o par da pele em Esqueleto, a outra metade da §2.8.
    // 199 desde 18/09/2026: **Biblioteca de animações…** (degrau 12, parte
    // `B`, lote 2) — as quatro de fábrica, contra a convenção humanoide-v1.
    // 203 desde 18/09/2026: os quatro da física (degrau 12, parte `C`, lote
    // 3, porta D6) — `fisica-simular`, `fisica-reiniciar`,
    // `fisica-reiniciar-todas` e `fisica-assar`. A regra `physics` já era
    // completa em Propriedades e **simulava sempre**; os três gestos que a
    // §6.5 prevê não tinham porta nenhuma na tela.
    // 209 desde 18/09/2026: os cinco das variáveis e etiquetas (degrau 12,
    // parte `C`, lote 4, porta G9/P15) mais o pai do submenu da física. 🗣️
    // *"variáveis e tags pela tela, provavelmente — com um jeito de
    // desligar"* (RESPOSTAS Q23). A `anim/keying.ts` já sabia chavear as duas
    // e **nenhum comando criava** nenhuma delas.
    // **O lote da barra de espaço (22/09/2026) NÃO mexe neste número:**
    // `tocar` e `tocar-tras` só trocaram de linha dentro da tabela, de
    // `'painel'` para `'arranque'`; a lista de ids é a mesma. De 209 em
    // diante, quem subiu foram os outros lotes do dia — o emissor de
    // partículas e os efeitos —, e a conta é de quem os escreveu.
    // 218 desde 29/09/2026: os quatro pais de submenu da ordem dos menus
    // (P33, P41) — `trazer-para-projeto`, `animacoes`, `peles`, `travar`. Soma
    // da P42: 214 lido do disco na hora de gravar, mais 4.
    // 222 desde 29/09/2026: os quatro modelos prontos de partícula do chat B
    // (P5) — `particulas-fogo`, `-fumaca`, `-faisca`, `-poeira`, no menu
    // Animação → Efeitos de chave. Soma da P42: 218 lido do disco, mais 4.
    // +4 em 29/09/2026, chat H (P33, P42): definir-pivo, carimbar-pivos,
    // recarregar-pasta e trocar-pasta-origem.
    // 232 desde 29/09/2026 — o "No fim" (a4), em duas partes gravadas
    // juntas: +1 do pai do submenu, `no-fim` (chat A2, a casca), e +5 dos cinco
    // `fim-*` do tocador (chat D), que já estavam na tabela e só passaram a ter
    // item de menu agora. Soma da P42: 226 lido do disco na hora de gravar.
    // 233 desde 04/10/2026 (rodada 8a): `tirar-entidade` — a imagem de antes volta.
    // 235 desde 04/10/2026 (rodada 12): `esconder-na-pele` e `ignorar-na-pele`.
    // 236 desde 04/10/2026 (rodada 15): o painel `particulas` no menu Janela.
    // 241 desde 05/10/2026 (rodada 6, lote 1, os doze menus): +7 cabeças de
    // submenu novas — `pose`, `ir-para`, `troca-de-base`, `chaves`,
    // `ver-o-boneco`, `ver-a-cena`, `arrumar` — e −2 que saíram com o
    // menu de que eram parte: `trazer-para-projeto` (ficou vazio) e `peles`
    // (o submenu Peles ▸ do Esqueleto virou o menu Skins). Função nenhuma saiu.
    // 275 desde 05/10/2026 (rodada 6, lote 2, as portas): +32 ações que só
    // existiam em botão de aba ou em gesto, e +2 cabeças de submenu (`malha`,
    // `pesos`). A lista inteira, com o dono, está em `ui/actions-table.ts`.
    // 276 (rodada 8c, C15, 05/10/2026): +1, `entidade-em-laco` (Entidades → Em laço).
    // 277 (rodada 4, lote 1, 05/10/2026): +1, `soltar-painel` (Janela → Arrumar →
    // Soltar o painel da parede).
    // 279 (rodada 4, lote 2, 05/10/2026): +2, `recolher-em-icone` e
    // `expandir-paineis` (Janela → Arrumar).
    // 280 (rodada 4, lote 6, 05/10/2026): +1, `esconder-colunas` (Shift+Tab).
    // 283 (rodada 4, lote 8, 05/10/2026): +3, `contexto-montar`, `contexto-animar`,
    // `contexto-pesos` (Janela → Arranjos, e o botão do canto de cima).
    // 284 (rodada 13, 05/10/2026): +1, `chaves-guardadas` (Base → Chaves guardadas…).
    // 285 (rodada 13, caso b): +1, `voltar-pivo-osso` (Imagens → Voltar o pivô para o osso).
    // 287 (rodada 11, 05/10/2026): +2, `este-boneco` e `tirar-este-boneco` (Entidades).
    // 289 (rodada 9, 05/10/2026): +2, `marcar-como-slot` e `desmarcar-slot` (Entidades).
    // 290 (rodada 17, 05/10/2026): +1, `mostrar-painel-previa` (Animação → Abrir a Prévia, PL-31).
    // 293 (rodada 17): +3, o meio-termo em Editar → Pose (PL-25).
    // 295 (rodada 39, lote 2, 06/10/2026): +2, `por-em-teste` e `desligar-teste` (Entidades).
    // 297 (rodada 39, lote 4): +2, `por-dentro-de` e `tirar-de-volta` (Entidades).
    // 298 (rodada 39, lote 5): +1, `por-no-projeto` (Entidades).
    // 301 (rodada 39b, lote 6): +3, `anima-do-teste`, `skins-do-teste` e `teste-nas-iguais` (Entidades).
    // 303 (rodada 40, lote 1): +2, `interp-entrada-suave` e `interp-saida-suave` (o menu da chave).
    // 304 (rodada 40, lote 4): +1, `deslocar-em-laco` (Animação → Chaves).
    // 305 (rodada 41, lote 4): +1, `criar-aresta` (Malha e regras → Malha).
    // Rodada 44, lote 7: + 'caber-na-antiga'.
    // 308 (N-4b, 05/11/2026): +2, `recorte-na-cena` e `tirar-recorte` (Animação, da cena).
    expect(tabela.length).toBe(308);
    expect(tabela).not.toContain('trazer-para-projeto');
    expect(tabela).toContain('ferramenta-de-antes');
    expect(tabela).toContain('opcoes-do-desenho');
    expect(tabela).toContain('colar-corpo');
    expect(tabela).toContain('abrir-corpo');
    expect(tabela).toContain('entregar-corpo');
    expect(tabela).not.toContain('gravar-sozinho');
  });

  it('toda linha tem dono, nome e lugar; nenhuma repete; "precisa do painel" só nas de painel', () => {
    const vistas = new Set<string>();
    for (const row of ACTION_TABLE) {
      expect(row.owner, row.id).not.toBe('');
      expect(row.label.trim(), row.id).not.toBe('');
      expect(vistas.has(row.id), `${row.id} repetida`).toBe(false);
      vistas.add(row.id);
      expect(row.needsPanel, row.id).toBe(row.where === 'painel');
      if (row.where === 'arranque') expect(row.greyWhen === undefined || row.greyWhen !== '').toBe(true);
    }
    expect(actionRow('subir-ordem')).toMatchObject({ owner: 'ordem', where: 'arranque', label: 'Trazer para a frente' });
    expect(actionRow('nada-disso')).toBeNull();
  });

  it('as teclas do menu têm ação na tabela, e o botão direito é da casca', () => {
    const naTabela = new Set(ACTION_TABLE.map((row) => row.id));
    for (const row of KEY_TABLE.filter((r) => r.help?.menu !== undefined && !['Ferramentas', 'Cena'].includes(r.help.menu))) {
      expect(naTabela.has(row.action), row.action).toBe(true);
    }
    for (const item of CONTEXT_ACTIONS) expect(actionRow(item.action)?.owner, item.action).toBe('casca');
    // A auditoria do lote 19 continua sem nada a dizer.
    expect(auditMenus(allMenus(NEUTRAL_MENU_STATE))).toEqual([]);
  });
});

describe('as ações de arranque, sem painel montado', () => {
  it('registerCoreActions registra toda ação de arranque, e só elas', () => {
    const { doc } = heroi();
    registerCoreActions(doc);
    expect(registeredActions()).toEqual(arranque());
    // 23 desde 14/09/2026: entrou copiar-pose-escolhido (item 9).
    // 25 desde 18/09/2026: `exportar-pele-arquivo` e `promover-pele-base`
    // (degrau 9). As duas valem com a aba Peles fechada — a conta delas é do
    // documento, não do painel. `importar-pele` ficava no painel (até 29/09, I3), porque precisava
    // do seletor de arquivo dele.
    // 27 desde 18/09/2026: `exportar-animacao` e `importar-animacao` (degrau
    // 12, parte `B`). As duas valem com a aba Animações fechada: a conta é do
    // documento, e o seletor de arquivo de importar é o mesmo "Abrir outro
    // .bone" da casca, que não precisa de painel montado.
    // 28 desde 18/09/2026: `biblioteca-animacoes`. Como as outras duas da
    // parte `B`, vale com a aba Animações fechada.
    // 37 desde 22/09/2026: as NOVE da aba Regras (defeito 2). Eram de painel,
    // e com a aba fechada não existiam: o menu chamava, nada acontecia, e
    // nada avisava. `fisica` e `variaveis-e-etiquetas` não entram — são o
    // item que abre o submenu, e não ação que alguém registre.
    // 39 desde 22/09/2026: `tocar` e `tocar-tras`. Eram `where: 'painel'`, o
    // que **prometia que a barra de espaço pode sumir** com a linha do tempo.
    // Hoje ela não some, e é por acidente — a faixa de baixo nunca desmonta
    // (`ui/shell.ts:783`), por um motivo que nada tem a ver com a tecla.
    // 40 no mesmo dia: `novo-emissor`, do chat das partículas — não é meu, e
    // a linha dele fica com o dono escrito (regra 24).
    // 43 desde 22/09/2026: flash, pulso e tremor — `COMO SE FAZ EFEITO` §6.
    // Valem com qualquer aba fechada: a escolha vem de `doc.selection` e o
    // tempo de `doc.time`. `efeitos` nao entra — e o item que abre o submenu.
    // +4 em 29/09/2026, chat H (P33, P42): definir-pivo, carimbar-pivos,
    // recarregar-pasta e trocar-pasta-origem — o pivô com a aba Imagens fechada.
    // +27 (chat I, 29/09/2026, P23): as 26 da exibição e `importar-pele` foram
    // para o arranque — 47 no disco + 27 = 74.
    // +5 (chat D, 29/09/2026, a4): o "No fim" do tocador — fim-arquivo,
    // fim-parar, fim-repetir, fim-vai-e-volta, fim-voltar. 74 + 5 = 79.
    // +1 (rodada 8a, 04/10/2026): `tirar-entidade`, a imagem de antes volta. 80.
    // +2 (rodada 12, 04/10/2026): `esconder-na-pele` e `ignorar-na-pele`. 82.
    // +32 (rodada 6, lote 2, 05/10/2026): as portas dos menus novos — 3 de
    // Imagens, 12 de Malha e pesos, 6 de Regras e etiquetas, 3 da janela
    // Animação e da troca, 4 de Skins, 3 de Entidades e 1 de Partículas. 114.
    // +1 (rodada 8c, C15, 05/10/2026): `entidade-em-laco`. 115.
    // +1 (rodada 13, 05/10/2026): `chaves-guardadas`, a janela das chaves das
    // peças tiradas da base. 116.
    // +1 (rodada 13, caso b): `voltar-pivo-osso`. 117.
    // +2 (rodada 11): `este-boneco` e `tirar-este-boneco`. 119.
    // +2 (rodada 9): `marcar-como-slot` e `desmarcar-slot`. 121.
    // +2 (rodada 39, lote 2): `por-em-teste` e `desligar-teste`. 123.
    // +2 (rodada 39, lote 4): `por-dentro-de` e `tirar-de-volta`. 125.
    // +1 (rodada 39, lote 5): `por-no-projeto`. 126.
    // +3 (rodada 39b, lote 6): `anima-do-teste`, `skins-do-teste`, `teste-nas-iguais`. 129.
    // +1 (rodada 41, lote 4): `criar-aresta`. 130.
    // Rodada 44, lote 7: + 'caber-na-antiga'.
    expect(arranque().length).toBe(131);
  });

  it('a função que ela devolve tira todas', () => {
    const { doc } = heroi();
    const tirar = registerCoreActions(doc);
    tirar();
    expect(registeredActions()).toEqual([]);
  });

  it('nenhum painel registra uma ação de arranque ao montar; cada uma está escrita num *-actions.ts', () => {
    const arquivos = walk(SRC).map((file) => ({ file, text: readFileSync(file, 'utf8') }));
    const paineis = arquivos.filter((a) => a.text.includes('registerPanel('));
    expect(paineis.length).toBeGreaterThan(10);
    for (const id of arranque()) {
      for (const painel of paineis) {
        expect(painel.text.includes(`registerAction('${id}'`), `${id} em ${painel.file}`).toBe(false);
      }
      const onde = arquivos.filter((a) => a.text.includes(`registerAction('${id}'`)).map((a) => a.file);
      expect(onde.length, id).toBe(1);
      expect(onde[0]!.endsWith('-actions.ts'), `${id} em ${onde[0]}`).toBe(true);
    }
  });
});

describe('pelo menu, com as abas fechadas', () => {
  it('Trazer para a frente, com a aba Ordem fechada: roda, e a ordem muda', () => {
    const { doc } = heroi();
    registerCoreActions(doc);
    const antes = (doc.file.slots ?? []).map((slot) => slot.name);
    expect(runAction('subir-ordem')).toBe(false); // sem desenho escolhido: cinza
    doc.select({ ...emptySelection(), slots: ['arm_back'] });
    expect(runAction('subir-ordem')).toBe(true);
    const depois = (doc.file.slots ?? []).map((slot) => slot.name);
    expect(depois.indexOf('arm_back')).toBe(antes.indexOf('arm_back') + 1);
    // Peça de pasta leva a pasta inteira para o fundo (lote 35): o braço desce.
    expect(runAction('fundo-de-tudo')).toBe(true);
    const fundo = (doc.file.slots ?? []).map((slot) => slot.name);
    expect(fundo.indexOf('arm_back')).toBeLessThan(depois.indexOf('arm_back'));
  });

  it('novo osso, duplicar e apagar, com a Árvore fechada', () => {
    const { doc } = heroi();
    registerCoreActions(doc);
    const ossos = doc.file.bones.length;
    expect(runAction('novo-osso')).toBe(true);
    expect(doc.file.bones.length).toBe(ossos + 1);
    const novo = doc.file.bones[doc.file.bones.length - 1]!.name;
    doc.select({ ...emptySelection(), bones: [novo] });
    expect(runAction('duplicar')).toBe(true);
    expect(doc.file.bones.length).toBe(ossos + 2);
    doc.select({ ...emptySelection(), bones: [novo] });
    expect(runAction('apagar')).toBe(true);
    expect(doc.file.bones.some((bone) => bone.name === novo)).toBe(false);
  });

  it('nova animação e Abrir a base, com a aba Animações fechada (degrau 11: o interruptor saiu)', () => {
    const { doc } = heroi();
    registerCoreActions(doc);
    const quantas = doc.file.animations!.length;
    expect(runAction('nova-animacao')).toBe(true);
    expect(doc.file.animations!.length).toBe(quantas + 1);
    expect(doc.animation).toBe(doc.file.animations!.at(-1)!.name);
    expect(runAction('abrir-a-base')).toBe(true);
    expect(doc.animation).toBeNull();
    // Com a base já aberta o item fica cinza: não há ida-e-volta escondida.
    expect(runAction('abrir-a-base')).toBe(false);
    expect(doc.animation).toBeNull();
    // A ida é abrir a animação pelo nome, como o clique na janela Animação.
    openAnimation(doc, doc.file.animations![0]!.name);
    expect(doc.animation).toBe(doc.file.animations![0]!.name);
  });

  it('nova pele, com a aba Peles fechada: nasce, e é a que se edita', () => {
    const { doc, ditos } = heroi();
    registerCoreActions(doc);
    const peles = doc.file.skins!.length;
    expect(runAction('nova-pele')).toBe(true);
    expect(doc.file.skins!.length).toBe(peles + 1);
    const nova = doc.file.skins!.at(-1)!.name;
    expect(doc.visibleSkins[0]).toBe(nova);
    expect(ditos.at(-1)).toContain(`Skin "${nova}" criada`);
  });

  it('copiar a pose e colar em todas, sem a linha do tempo: a mesma área de transferência da folha', () => {
    const { doc } = heroi();
    registerCoreActions(doc);
    setKeyClipboard(null);
    expect(runAction('copiar-pose')).toBe(false); // em Montagem: cinza
    openAnimation(doc, doc.file.animations![0]!.name);
    expect(doc.animation).not.toBeNull();
    doc.time = 0.25;
    expect(runAction('colar-todas-chaves')).toBe(false); // nada copiado: cinza
    expect(runAction('copiar-pose')).toBe(true);
    expect(keyClipboard()!.items.length).toBeGreaterThan(0);
    const antes = JSON.stringify(doc.file.animations);
    expect(runAction('colar-todas-chaves')).toBe(true);
    expect(JSON.stringify(doc.file.animations)).not.toBe(antes);
  });
});

// --- o defeito 2: "Regra…" e "Pele" fechavam a aba ------------------------

/*
 * Achado ABRINDO O PROGRAMA em 19/09/2026, com 3.801 verdes na suíte. Três
 * estados, e o terceiro é o pior porque é **silêncio**:
 *
 * | A aba Regras | O que acontecia |
 * |:---|:---|
 * | à frente | `Novo → Regra…` **fechava a aba**, e a janela não abria |
 * | atrás de outra | funcionava |
 * | **fechada** | **nada acontecia, e nada avisava** |
 *
 * A raiz é uma só, e são duas coisas confundidas numa: `painel-*` virou
 * INTERRUPTOR em 13/09 (aberto e à frente = fecha), e quem o chamava queria
 * *"trazer à frente"*. Agora "trazer à frente" é `mostrar-painel-*`, que
 * nunca fecha.
 */
/**
 * Uma tela de mentira, para as ações que abrem janela (28/09/2026).
 *
 * Até aqui este arquivo PULAVA a conferência dessas ações e não pulava a
 * chamada: a ação rodava, pedia `document` num teste sem navegador, e o erro
 * estourava DEPOIS do teste, fora dele — quatro "Unhandled Rejection" numa
 * suíte que dizia 20 de 20. A forma: *pulei a conferência e não pulei a
 * chamada*.
 *
 * A tela de mentira aceita qualquer pedido e devolve a si mesma; a janela
 * nunca fecha, como uma janela que ninguém clicou. O que ela dá ao teste é
 * UM fato: **a ação pediu a tela**. É pouco — não diz que a janela é boa —,
 * e é mais que o silêncio de antes.
 */
function telaDeMentira(): { pedida: () => boolean; tirar: () => void } {
  let tocada = false;
  const alvo = function alvo(): void { /* só para o Proxy poder ser chamado */ };
  const buraco: unknown = new Proxy(alvo, {
    get(_alvo, nome) {
      if (nome === 'then') return undefined;            // não é promessa
      if (nome === Symbol.toPrimitive) return () => '';
      if (nome === Symbol.iterator) return function* vazio() { /* lista vazia */ };
      return buraco;
    },
    set: () => true,
    has: () => true,
    apply: () => buraco,
    construct: () => buraco as object,
  });
  const global = globalThis as Record<string, unknown>;
  const tinha = Object.prototype.hasOwnProperty.call(global, 'document');
  const antes = global['document'];
  Object.defineProperty(global, 'document', {
    configurable: true,
    get() { tocada = true; return buraco; },
  });
  return {
    pedida: () => tocada,
    tirar: () => {
      if (tinha) Object.defineProperty(global, 'document', { configurable: true, writable: true, value: antes });
      else delete global['document'];
    },
  };
}

/**
 * As que abrem uma JANELA e terminam nela: a resposta delas está na tela, e um
 * teste sem navegador não a vê. Ficam de fora da exigência de efeito — e ficam
 * **escritas**, para ninguém confundir "não dá para medir aqui" com "passou".
 */
const ESPERAM_JANELA: readonly string[] = [
  'nova-regra-guiada',      // a janela guiada da regra, em duas telas
  'biblioteca-animacoes',   // a janela da biblioteca (degrau 12, parte `B`)
  'exportar-animacao', 'importar-animacao',
  'exportar-pele-arquivo', 'promover-pele-base',
  // Os tres efeitos (22/09/2026): a janela pergunta os numeros e mostra a
  // previa. So chegam aqui com algo escolhido — sem escolha ficam CINZAS, e
  // o `runAction` devolve `false` antes desta linha. A prova de que existem
  // e funcionam sem painel nenhum esta em `efeitos.test.ts`, no arquivo da
  // parte, com a escolha montada a mao.
  'efeito-flash', 'efeito-pulso', 'efeito-tremor',
  // Rodada 6, lote 2 (05/10/2026): as portas que perguntam numa janela — o
  // nome da base nova, os ossos da regra, o valor do parâmetro, se apaga a
  // skin, qual animação da entidade, qual skin recebe o lápis; e as das
  // etiquetas, que perguntam o nome novo ou se apaga a que está em uso.
  'salvar-base-nova', 'trocar-ossos-regra', 'chave-parametro', 'apagar-pele',
  'escolher-animacao-entidade', 'editar-pele', 'renomear-etiqueta', 'apagar-etiqueta',
  // Rodada 13 (05/10/2026): a janela das chaves guardadas — a lista, e jogar
  // fora. Sem chave guardada fica CINZA dizendo por quê; o efeito (jogar fora,
  // e o Ctrl+Z devolvendo) está provado em `arvore.test.ts`.
  'chaves-guardadas',
];

/*
 * **Rodada 6, lote 2 (05/10/2026): as sete portas que este teste não sabe
 * deixar acesas.** Pedem imagem lida do disco (a sequência, o pivô colado,
 * gerar e traçar a malha pela silhueta) ou um projeto de várias bases (pôr,
 * promover e rebaixar entidade). O que se prova aqui é a metade que dá para
 * provar sem navegador: **sem o estado, ficam cinzas e dizem por quê** — a
 * régua 3 da ficha. O efeito delas é o do botão da aba, e a foto do lote é
 * a prova de que acendem.
 */
// Rodada 11 (05/10/2026): "Este boneco". As duas portas pedem uma entidade
// escolhida; a primeira ainda abre uma lista para escolher o meio. Sem
// navegador prova-se a metade de sempre: cinzas, e dizendo por quê. O efeito
// (o `around` no anexo, a ordem na cena, o desfazer) está em
// `pasta-do-projeto.test.ts`.
// Rodada 9 (05/10/2026): Marcar como slot pergunta o nome numa janela, e
// janela não se abre sem navegador. Aqui, a metade de sempre: cinzas, e
// DIZENDO por quê. O efeito (o desenho igual, o nome, o desfazer letra por
// letra) está em `grade-de-imagens.test.ts`.
describe('as duas portas do slot marcado', () => {
  it('sem imagem escolhida ficam cinzas e dizem por quê; na entidade, a de marcar diz que só imagem vira slot', () => {
    const { doc } = heroi();
    registerCoreActions(doc);
    expect(runAction('marcar-como-slot')).toBe(false);
    expect(runAction('desmarcar-slot')).toBe(false);
    expect(actionState('marcar-como-slot').why ?? '').toMatch(/projeto aberto|Escolha uma imagem/);
    expect(actionState('desmarcar-slot').why ?? '').toMatch(/Escolha o slot marcado/);
    doc.select({ ...emptySelection(), slots: ['weapon'] });
    expect(actionState('desmarcar-slot').why ?? '').toMatch(/não é um slot marcado/);
  });
});

// Rodada 39, lote 2 (06/10/2026): a montagem de teste pelo menu. Sem projeto e
// sem imagem escolhida, as duas ficam cinzas e DIZEM por quê. O efeito (a
// ligação no manifesto, o `.bone` igual letra por letra, o desfazer) está em
// `pasta-do-projeto.test.ts`.
describe('as duas portas da montagem de teste', () => {
  it('sem projeto e sem imagem escolhida ficam cinzas e dizem por quê', () => {
    const { doc } = heroi();
    registerCoreActions(doc);
    expect(runAction('por-em-teste')).toBe(false);
    expect(runAction('desligar-teste')).toBe(false);
    expect(actionState('por-em-teste').why ?? '').toMatch(/projeto aberto|Escolha uma imagem/);
    expect(actionState('desligar-teste').why ?? '').toMatch(/Escolha na cena/);
    doc.select({ ...emptySelection(), slots: ['weapon'] });
    expect(actionState('desligar-teste').why ?? '').toMatch(/não tem peça de teste/);
    // Lote 4: sem projeto e sem nada em volta, as de para cima ficam cinzas e dizem.
    expect(runAction('por-dentro-de')).toBe(false);
    expect(runAction('tirar-de-volta')).toBe(false);
    expect(actionState('por-dentro-de').why ?? '').toMatch(/projeto aberto|Nenhuma entidade/);
    expect(actionState('tirar-de-volta').why ?? '').toMatch(/Nada está em volta/);
    // Lote 5: sem ligação de teste, Pôr no projeto fica cinza e diz o que fazer.
    expect(runAction('por-no-projeto')).toBe(false);
    expect(actionState('por-no-projeto').why ?? '').toMatch(/Não há ligação de teste/);
    // Rodada 39b, lote 6: sem peça de teste, as três do cartão ficam cinzas e dizem.
    expect(runAction('anima-do-teste')).toBe(false);
    expect(runAction('skins-do-teste')).toBe(false);
    expect(runAction('teste-nas-iguais')).toBe(false);
    expect(actionState('anima-do-teste').why ?? '').toMatch(/Não há peça de teste/);
    expect(actionState('skins-do-teste').why ?? '').toMatch(/Não há peça de teste/);
    expect(actionState('teste-nas-iguais').why ?? '').toMatch(/Não há peça de teste/);
  });
});

describe('as duas portas do Este boneco', () => {
  it('sem entidade escolhida ficam cinzas e DIZEM por quê; com a espada escolhida, a de marcar acende', () => {
    const { doc } = heroi();
    registerCoreActions(doc);
    expect(runAction('este-boneco')).toBe(false);
    expect(runAction('tirar-este-boneco')).toBe(false);
    expect(actionState('este-boneco').why ?? '').toMatch(/Escolha a entidade/);
    expect(actionState('tirar-este-boneco').why ?? '').toMatch(/Escolha a entidade/);
    doc.select({ ...emptySelection(), slots: ['weapon'] });
    // A de tirar continua cinza, com OUTRA frase: a espada não tem a marca.
    expect(actionState('tirar-este-boneco').enabled).toBe(false);
    expect(actionState('tirar-este-boneco').why ?? '').toMatch(/não tem a marca Este boneco/);
    // A de marcar depende de o arquivo da entidade estar aberto: ou acende, ou diz que não está.
    const marcar = actionState('este-boneco');
    if (!marcar.enabled) expect(marcar.why ?? '').toMatch(/não está aberto/);
  });
});

describe('as portas da rodada 6 que pedem imagem ou projeto', () => {
  it('sem o estado, ficam cinzas e DIZEM por quê, cada uma com a sua frase', () => {
    const { doc } = heroi();
    registerCoreActions(doc);
    const casos: Array<[string, RegExp]> = [
      ['trazer-sequencia', /corrida numerada/],
      ['colar-pivo', /Copie o pivô/],
      ['caber-na-antiga', /Troque a imagem de um desenho primeiro/],
      ['malha-automatica', /Escolha uma malha/],
      ['tracar-contorno', /Escolha uma malha/],
      ['por-entidade', /Nenhuma entidade/],
      ['promover-entidade', /Nenhuma entidade/],
      ['rebaixar-entidade', /base em foco/],
    ];
    expect(runAction('trazer-sequencia')).toBe(false);
    expect(runAction('colar-pivo')).toBe(false);
    expect(runAction('caber-na-antiga')).toBe(false);
    expect(runAction('malha-automatica')).toBe(false);
    expect(runAction('tracar-contorno')).toBe(false);
    expect(runAction('por-entidade')).toBe(false);
    expect(runAction('promover-entidade')).toBe(false);
    expect(runAction('rebaixar-entidade')).toBe(false);
    for (const [id, frase] of casos) {
      expect(actionState(id).enabled, id).toBe(false);
      expect(actionState(id).why ?? '', id).toMatch(frase);
    }
    // Gerar e traçar acendem com a cabeça (malha) escolhida: o que falta a
    // este teste é só a imagem para ler a silhueta.
    doc.select({ ...emptySelection(), slots: ['head'], attachments: [{ slot: 'head', attachment: 'face' }] });
    expect(actionState('malha-automatica').enabled).toBe(true);
    expect(actionState('tracar-contorno').enabled).toBe(true);
  });
});

describe('o defeito 2: trazer à frente não é o mesmo que o interruptor', () => {
  it('com a aba Regras FECHADA, as nove ações existem e rodam (o terceiro estado)', () => {
    const { doc } = heroi();
    registerCoreActions(doc);
    // Nenhum painel foi montado: é exatamente a aba fechada.
    for (const id of [
      'nova-regra-guiada',
      'fisica-simular', 'fisica-reiniciar', 'fisica-reiniciar-todas', 'fisica-assar',
      'nova-variavel', 'apagar-variavel', 'nova-etiqueta', 'mostrar-variaveis',
    ]) {
      // Antes do conserto: a ação NÃO existia — ela nascia no `mount()` do
      // painel. O menu chamava, nada acontecia, e não havia o que avisar.
      expect(actionState(id).exists, id).toBe(true);
    }
  });

  it('a de criar variável, com a aba fechada, cria a variável — e não fica muda', () => {
    const { doc } = heroi();
    registerCoreActions(doc);
    const antes = (doc.file.variables ?? []).length;
    expect(runAction('nova-variavel')).toBe(true);
    expect((doc.file.variables ?? []).length).toBe(antes + 1);
  });

  /*
   * **Existir não é funcionar** — a forma que este lote achou depois do
   * conserto, e a razão de este teste não parar na pergunta de cima.
   *
   * Feita a ação existir, ela ainda voltava muda na PRIMEIRA linha: `const doc
   * = this.doc; if (doc === null) return;`, e sem painel montado não há
   * `this.doc`. A ação existia, rodava, devolvia `true` — e nada acontecia.
   *
   * Por isso aqui se exige **efeito**: ou o arquivo muda, ou o rodapé diz por
   * que não mudou. As duas são respostas; o silêncio não é (regra 21). E não
   * se julga o `return`, que um comando legítimo também usa: julga-se a
   * **promessa contra o fato** — a tabela diz `where: 'arranque'`, que
   * significa *"vale com qualquer aba fechada"*, e um corpo que só trabalha
   * com o painel na tela desmente o que a tabela afirma.
   */
  it('toda ação de arranque, sem painel nenhum, ou muda o arquivo ou DIZ por que não', () => {
    for (const id of arranque()) {
      const { doc, ditos } = heroi();
      registerCoreActions(doc);
      const antes = JSON.stringify(doc.file);
      // Janela de diálogo e seletor de arquivo não terminam aqui dentro: a
      // resposta delas é PEDIR A TELA, e isso a tela de mentira vê.
      if (ESPERAM_JANELA.includes(id)) {
        const tela = telaDeMentira();
        let rodou = false;
        try { rodou = runAction(id); } finally { tela.tirar(); }
        if (!rodou) continue; // cinza por falta de escolha: é resposta
        const mudou = JSON.stringify(doc.file) !== antes;
        expect(
          tela.pedida() || mudou || ditos.length > 0,
          `${id}: rodou, não pediu janela, não mudou nada e não disse nada`,
        ).toBe(true);
        continue;
      }
      if (!runAction(id)) continue; // cinza por falta de escolha: é resposta
      const mudou = JSON.stringify(doc.file) !== antes;
      expect(mudou || ditos.length > 0, `${id}: rodou, não mudou nada e não disse nada`)
        .toBe(true);
    }
  });

  it('nenhum painel chama `painel-*` para trazer à frente: aquilo é o interruptor', () => {
    const arquivos = walk(SRC).map((file) => ({ file, text: readFileSync(file, 'utf8') }));
    // A casca pode: é ela quem registra o interruptor e quem tem o item de
    // menu Janela. Quem não pode é o painel, que quer MOSTRAR e não alternar.
    const doPainel = arquivos.filter((a) => a.file.includes(`${'panels'}`) || a.file.includes('viewport'));
    for (const { file, text } of doPainel) {
      const chamadas = [...text.matchAll(/runAction\('painel-[a-z-]+'\)/g)].map((m) => m[0]);
      expect(chamadas, file).toEqual([]);
    }
  });

  it('`mostrar-painel-*` não entra na tabela: ela é só de ação com item de menu', () => {
    const daTabela = ACTION_TABLE.map((row) => row.id);
    expect(daTabela.some((id) => id.startsWith('painel-'))).toBe(true);
    // O interruptor está na tabela porque tem item no menu Janela; o "mostrar"
    // não tem item — quem o chama é um painel, antes do gesto. A exceção é a
    // Prévia (rodada 17, PL-31): Animação → Abrir a Prévia é a porta do ícone
    // da barra, que só abre.
    expect(daTabela.filter((id) => id.startsWith('mostrar-painel-'))).toEqual(['mostrar-painel-previa']);
  });
});

// --- a barra de espaço com a aba da linha do tempo fechada ----------------

/*
 * Achado em 22/09/2026 pelo chat `O vigia do comando sem porta`, rodando a
 * terceira régua — **quatro varreduras antes não o acharam**, e nem o desenho
 * da régua o esperava: ela procurava menu flutuante e botão de ícone, e o que
 * apareceu foi a **tecla**.
 *
 * `tocar` era `where: 'painel'`: nascia no `mount()` da linha do tempo. Com a
 * aba fechada o painel nunca monta, a ação não existe, e a **barra de espaço
 * não toca, não pausa e não diz nada**. É o mesmo do defeito 2 de 19/09, na
 * tecla mais usada do programa — e a barra de espaço não é um item de menu
 * escondido: é o primeiro gesto de quem quer ver a animação andar.
 */
describe('a barra de espaço, com a aba da linha do tempo fechada', () => {
  it('a ação `tocar` existe sem painel nenhum montado', () => {
    const { doc } = heroi();
    registerCoreActions(doc);
    expect(actionState('tocar').exists).toBe(true);
  });

  it('e TOCA de verdade: existir não é funcionar', () => {
    const { doc } = heroi();
    registerCoreActions(doc);
    openAnimation(doc, 'walk');
    expect(runAction('tocar')).toBe(true);
    expect(transport.isPlaying()).toBe(true);
    // A mesma tecla de novo pausa: é um interruptor, e os dois lados contam.
    expect(runAction('tocar')).toBe(true);
    expect(transport.isPlaying()).toBe(false);
  });

  /*
   * **O irmão dela, e o buraco que eu mesmo abri** — avisado pelo chat
   * `EXECUTANDO · o vigia do comando sem porta` em 22/09, 01h03.
   *
   * Movi `tocar` E `tocar-tras` para o arranque no mesmo conserto, e o guarda
   * de efeito exercitava só o `tocar`. `tocar-tras` ficava sendo uma ação que
   * **existe sempre e cujo corpo nunca rodou sem painel** — que é exatamente
   * o buraco onde o defeito da barra de espaço morava. Consertar um e deixar
   * o irmão é a régua nova, *existir não é funcionar*, aplicada pela metade.
   *
   * E o que se exige aqui não é "tocou": é **para que lado**. Um teste que só
   * olhasse `isPlaying()` daria verde se o `-1` sumisse do `play`, e o nome
   * "tocar para trás" passaria a mentir.
   */
  it('`tocar-tras` também vale com a aba fechada, e anda para TRÁS', () => {
    const { doc } = heroi();
    registerCoreActions(doc);
    openAnimation(doc, 'walk');
    doc.time = 0.5;

    expect(actionState('tocar-tras').exists).toBe(true);
    expect(runAction('tocar-tras')).toBe(true);
    expect(transport.isPlaying()).toBe(true);

    // A agulha tem de ANDAR PARA TRÁS: cem milésimos de relógio, e o tempo
    // cai. O relógio de teste é o `Date.now`, porque não há `requestAnimationFrame`.
    transport.tick(doc, Date.now() + 100);
    expect(doc.time).toBeLessThan(0.5);

    // A mesma ação de novo pausa: o interruptor tem dois lados, e os dois contam.
    expect(runAction('tocar-tras')).toBe(true);
    expect(transport.isPlaying()).toBe(false);
  });

  it('sem animação aberta ela fica CINZA, que é uma resposta — não silêncio', () => {
    const { doc } = heroi();
    registerCoreActions(doc);
    expect(actionState('tocar').exists).toBe(true);
    expect(actionState('tocar').enabled).toBe(false);
    expect(runAction('tocar')).toBe(false);
    transport.pause();
  });
});

// ---------------------------------------------------------------------------
// O rodapé fala por um lugar só — P44 e L13 (29/09/2026)
// ---------------------------------------------------------------------------

describe('o rodapé fala por um lugar só, com um ponto só (P44, L13)', () => {
  const frase = 'Ligou a ferramenta Malha (M), para mexer na cena.';

  it('a junta velha punha ponto em cima de ponto: é o defeito do L13', () => {
    // O molde que a casca usava até 29/09, escrito aqui como TEXTO (regra 29).
    expect(`${frase}. Arquivo não salvo.`).toContain('cena..');
  });

  it('juntarFrases põe o ponto só quando a primeira frase não fecha', () => {
    expect(juntarFrases(frase, 'Arquivo não salvo.')).toBe(`${frase} Arquivo não salvo.`);
    expect(juntarFrases('Mover osso', 'Arquivo não salvo.')).toBe('Mover osso. Arquivo não salvo.');
    expect(juntarFrases('Salvar agora?', 'Arquivo salvo.')).toBe('Salvar agora? Arquivo salvo.');
    expect(juntarFrases('', 'Arquivo salvo.')).toBe('Arquivo salvo.');
  });

  it('fraseDoRodape desfaz o ponto dobrado e deixa as reticências', () => {
    expect(fraseDoRodape('Modo de ligar ossos fechado..')).toBe('Modo de ligar ossos fechado.');
    expect(fraseDoRodape('Abrindo a pasta...')).toBe('Abrindo a pasta...');
    expect(fraseDoRodape('Repetindo a exportação…')).toBe('Repetindo a exportação…');
    expect(fraseDoRodape('  duas\n  linhas  ')).toBe('duas linhas');
  });

  it('a casca liga os dois elementos do rodapé ao setter, e o molde velho saiu', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/ui/shell.ts'), 'utf8');
    expect(fonte).toContain('falarPorUmLugar(this.statusState)');
    expect(fonte).toContain('falarPorUmLugar(this.statusTool)');
    expect(fonte).not.toContain('`${change.label}. Arquivo');
  });
});

// ---------------------------------------------------------------------------
// P19 — o passo seguinte no rodapé (29/09/2026)
// ---------------------------------------------------------------------------

describe('o passo seguinte: o rodapé diz o que vem depois (P19)', () => {
  /** O boneco pronto e animado: nenhum buraco na fila. */
  const pronto: NextStepInput = {
    images: 4, drawings: 4, bones: 3, drawingsOnRoot: 0, animations: 1,
    animation: 'andar', keyTimes: 3, loops: true, neverSaved: false,
  };

  it('a fila é a do Spriter: o PRIMEIRO buraco ganha', () => {
    const passo = (mudar: Partial<NextStepInput>): string | undefined => nextStep({ ...pronto, ...mudar })?.id;
    expect(passo({ images: 0, drawings: 0 })).toBe('pasta');
    expect(passo({ drawings: 0 })).toBe('na-cena');
    // Sem osso não adianta mandar animar, mesmo sem animação nenhuma.
    expect(passo({ bones: 0, animations: 0 })).toBe('ossos');
    expect(passo({ drawingsOnRoot: 4 })).toBe('ligar');
    expect(passo({ neverSaved: true })).toBe('salvar');
    expect(passo({ animations: 0, animation: null })).toBe('animacao');
    expect(passo({ animation: null })).toBe('abrir-animacao');
    expect(passo({ keyTimes: 0 })).toBe('posar');
    expect(passo({ keyTimes: 1 })).toBe('outro-tempo');
    expect(passo({ loops: false })).toBe('repetir');
    expect(passo({})).toBe('tocar');
  });

  it('uma imagem presa na raiz, com as outras ligadas, não é buraco (uma sombra, um fundo)', () => {
    expect(nextStep({ ...pronto, drawingsOnRoot: 1 })?.id).toBe('tocar');
  });

  it('K4: o herói aberto na base aponta o caminho para uma animação', () => {
    const heroi = parseBoneText(readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8')) as BoneFile;
    const entrada = nextStepInputOf(heroi, heroi, { animation: null, path: 'heroi.bone', images: 1 });
    expect(nextStep(entrada)?.id).toBe('abrir-animacao');
    expect(nextStep(entrada)?.how).toContain('aba Animações');
  });

  it('K6: uma animação nova, com duas chaves, avisa que não repete', () => {
    const file = {
      bone: { version: '1.0' },
      bones: [{ name: 'root' }, { name: 'perna', parent: 'root' }],
      slots: [{ name: 'pe', bone: 'perna' }],
      animations: [{
        name: 'andar',
        timelines: [{ type: 'rotate', target: 'perna', keys: [{ time: 0, value: 0 }, { time: 0.5, value: 30 }] }],
      }],
    } as unknown as BoneFile;
    const entrada = nextStepInputOf(file, file, { animation: 'andar', path: 'boneco.bone', images: 1 });
    expect(entrada.keyTimes).toBe(2);
    expect(entrada.loops).toBe(false);
    expect(nextStep(entrada)?.id).toBe('repetir');
  });

  it('chaves no mesmo instante contam como UM instante', () => {
    const file = {
      bone: { version: '1.0' },
      bones: [{ name: 'root' }, { name: 'a', parent: 'root' }],
      slots: [{ name: 's', bone: 'a' }],
      animations: [{ name: 'x', timelines: [
        { type: 'rotate', target: 'a', keys: [{ time: 0 }] },
        { type: 'translate', target: 'a', keys: [{}] },
      ] }],
    } as unknown as BoneFile;
    expect(nextStepInputOf(file, file, { animation: 'x', path: 'b.bone', images: 1 }).keyTimes).toBe(1);
  });

  it('a dica nunca cita porta que não existe: toda ação está na tabela', () => {
    for (const passo of Object.values(NEXT_STEPS)) {
      if (passo.action === null) continue;
      expect(actionRow(passo.action), `${passo.id} → ${passo.action}`).not.toBeNull();
    }
  });

  it('e todo caminho "Menu → Item" que ela escreve é o nome de verdade no menu', () => {
    const menus = allMenus({ ...NEUTRAL_MENU_STATE, animating: true });
    for (const passo of Object.values(NEXT_STEPS)) {
      // Rodada 6: os doze menus. "Esqueleto" saiu da lista: uma dica que ainda
      // o citasse não seria lida aqui, e passaria por verde sem ter sido olhada.
      expect(passo.how, passo.id).not.toMatch(/Esqueleto →/);
      const caminho = /(Arquivo|Editar|Imagens|Base|Malha e regras|Animação|Skins|Entidades|Partículas|Exibir|Janela|Ajuda) →([^()]+?)(?: \(|\)|$)/.exec(passo.how);
      if (caminho === null) continue;
      const menu = menus.find((m) => m.label === caminho[1]);
      const nomes = flatEntries(menu?.entries ?? []).map((e) => e.label);
      expect(nomes, `${passo.id}: ${caminho[1]} → ${caminho[2]}`).toContain(caminho[2].trim());
    }
  });

  it('a frase é curta: cabe no rodapé sem empurrar nada (J4)', () => {
    for (const passo of Object.values(NEXT_STEPS)) expect(passo.text.length).toBeLessThanOrEqual(40);
  });
});

describe('o passo seguinte: ligado por padrão, e a casca o põe no rodapé (P19)', () => {
  it('a preferência nasce ligada, e desligar vale', () => {
    expect(DEFAULT_PREFS.nextStep).toBe(true);
    expect(parsePrefs({ nextStep: false }).nextStep).toBe(false);
    expect(parsePrefs({ nextStep: 'não' }).nextStep).toBe(true);
  });

  it('a linha do rodapé leva a frase e o caminho de clique', () => {
    expect(nextStepLine(NEXT_STEPS['animacao'])).toBe('Próximo: crie uma animação — Animação → Nova animação');
  });

  it('a casca fala a dica pela linha da ferramenta, que passa pelo setter do rodapé', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/ui/shell.ts'), 'utf8');
    expect(fonte).toContain('const passo = this.nextStepNow();');
    expect(fonte).toContain('falarPorUmLugar(this.statusTool)');
    expect(fonte).toContain('if (!prefs().nextStep) return null;');
  });
});

describe('a dica do passo seguinte em destaque (o ajuste da cor, 29/09/2026)', () => {
  it('"Próximo:" sai sozinho, para ir em negrito e na cor de destaque', () => {
    expect(nextStepParts(NEXT_STEPS['animacao'])).toEqual({
      destaque: 'Próximo:', resto: 'crie uma animação — Animação → Nova animação',
    });
  });

  it('a frase que não começa com "Próximo:" vai inteira em destaque', () => {
    expect(nextStepParts(NEXT_STEPS['repetir']).destaque).toBe('Esta animação para no fim');
  });

  it('o CSS pinta o destaque com a cor da casa e o resto com a cor do texto', () => {
    const css = readFileSync(resolve(__dirname, '../src/ui/shell-status.css'), 'utf8');
    expect(css).toMatch(/\.status-proximo \{[^}]*font-weight: 700;[^}]*color: var\(--accent\);/);
    expect(css).toMatch(/\.status-tool\.is-proximo \{[^}]*color: var\(--ink\);/);
  });
});

describe('"De outro programa…" traz as imagens soltas, como o arrasto (E3b, 29/09/2026)', () => {
  const fonte = readFileSync(resolve(__dirname, '../src/ui/shell-file.ts'), 'utf8');
  const corpo = fonte.slice(fonte.indexOf('export async function importForeign('));
  const funcao = corpo.slice(0, corpo.search(/^\}$/m));

  it('o menu chama o passo 2, adoptForeignImages, DEPOIS do setFile', () => {
    // Antes de 29/09 o menu fazia só o passo 1: o boneco do Spriter abria sem
    // desenho, e só o arrasto mostrava as imagens.
    const abre = funcao.indexOf('shell.doc.setFile(imported.file');
    const liga = funcao.indexOf('adoptForeignImages(shell.doc, imported');
    expect(abre).toBeGreaterThan(-1);
    expect(liga).toBeGreaterThan(abre);
  });

  it('o rodapé diz o andamento e o resultado, e a aba Imagens abre quando há imagem', () => {
    expect(funcao).toContain('Lendo as imagens… ${feitas} de ${total}');
    expect(funcao).toContain("if (ligadas.notice !== null) shell.showPanel('imagens');");
  });
});

describe('a frase da dica cabe: até 80 letras, o gesto primeiro, um caminho só (P66)', () => {
  it('toda frase visível tem no máximo 80 letras, contando o "Próximo:"', () => {
    for (const passo of Object.values(NEXT_STEPS)) {
      expect(nextStepVisible(passo).length, nextStepVisible(passo)).toBeLessThanOrEqual(80);
    }
  });

  it('a de ligar as imagens diz o gesto, sem o menu; o menu fica na dica', () => {
    expect(nextStepVisible(NEXT_STEPS['ligar'])).toBe('Próximo: ligue as imagens aos ossos — segure P e clique na imagem');
    // Rodada 6: o menu Esqueleto passou a se chamar Base.
    expect(nextStepLine(NEXT_STEPS['ligar'])).toContain('Base → Virar filho de…');
  });

  it('a casca põe a frase inteira, com o caminho por extenso, na dica do rodapé', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/ui/shell.ts'), 'utf8');
    expect(fonte).toContain('this.statusTool.title = fraseDoRodape(nextStepLine(passo));');
  });
});


describe('rodada 23, defeito 5: Entidades → Pôr entidade na cena entra de pé, onde se vê', () => {
  const heroiD5 = (): Doc => new Doc(parseBoneText(readFileSync(resolve(import.meta.dirname, '../../formato/exemplos/heroi.bone'), 'utf8')) as BoneFile);

  it('com um osso escolhido: preso a ele, com o giro que desfaz o do osso (de pé no mundo)', async () => {
    const { entityMenuPlace } = await import('../src/panels/entities-actions.js');
    const doc = heroiD5();
    doc.select({ ...emptySelection(), bones: ['forearm'] });
    const giro = doc.skeleton!.findBone('forearm')!.worldRotationX;
    expect(giro).not.toBe(0);
    const lugar = entityMenuPlace(doc);
    expect(lugar.bone).toBe('forearm');
    // A forma do defeito: antes o giro era 0, e a espada entrava torta com o osso.
    expect(lugar.rotation).toBeCloseTo(-giro, 6);
  });

  it('sem osso: no meio do que a cena mostra, no osso mais perto, e não na raiz', async () => {
    const { entityMenuPlace } = await import('../src/panels/entities-actions.js');
    const { setViewCenterSource } = await import('../src/viewport/view-center.js');
    const doc = heroiD5();
    doc.select(emptySelection());
    setViewCenterSource(() => ({ x: 0, y: 100 }));
    try {
      const lugar = entityMenuPlace(doc);
      expect(lugar.bone).not.toBe(doc.file.bones![0]!.name);
      // A mesma conta do arrasto (rodada 8b, A2), no mesmo ponto.
      const { entityDropPlace } = await import('../src/doc/drop-entity.js');
      expect(lugar).toEqual(entityDropPlace(doc.skeleton, doc.file, 0, 100));
    } finally {
      setViewCenterSource(null);
    }
  });
});

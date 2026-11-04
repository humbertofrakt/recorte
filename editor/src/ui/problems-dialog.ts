/**
 * **A Janela de Problemas** — degrau 11, lote 6 (18/09/2026).
 *
 * É a regra 21 com tela: *"onde o programa não entende, ele avisa — não
 * improvisa"*. Os avisos já existiam, numa tira de 180 px no pé da janela,
 * com dois botões em ícone. Numa tira daquele tamanho, cinco avisos já pedem
 * rolagem, o nome do conserto só aparece na dica, e ler o que está errado é
 * mais difícil do que devia ser.
 *
 * Aqui eles ficam numa janela: uma linha por problema, **o que está errado**
 * escrito por extenso, **Ir para** com o nome do lugar, e o **conserto com o
 * nome escrito** onde há conserto (o Spine 4.3 chama isso de *Problems view*,
 * e é o que o `O QUE AINDA NAO TEMOS` A.2 pedia).
 *
 * A tira do rodapé continua: ela é o sinal de que há problema. O botão dela
 * passa a abrir esta janela.
 */

import './dialog.css';
import { el } from './dom.js';
import { abrirComParagrafo, avisosPeloPior, resumoDosAvisos, warningRow } from '../panels/warning-model.js';
import type { WarningFix, WarningRow } from '../panels/warning-model.js';
import type { BoneFile } from '../../../runtime/src/index.js';
import type { OpenDialog } from './dialog.js';

export interface ProblemsDialogOptions {
  /** O arquivo, para os avisos saírem com os nomes dele. */
  file: BoneFile;
  /** As linhas cruas do documento (`doc.warnings`). */
  warnings: readonly string[];
  /** **Ir para**: escolhe o elemento e abre o painel dono dele. */
  onGo(row: WarningRow): void;
  /** **Consertar**: só é chamado nas linhas que têm conserto. */
  onFix(row: WarningRow, fix: WarningFix): void;
  host?: HTMLElement;
}

/** A frase que explica o conserto, por extenso. */
export function fixHint(fix: WarningFix): string {
  return fix.action === 'swap-image'
    ? 'Escolhe no painel Imagens a imagem que entra no lugar da que falta'
    : `Escreve "${fix.value}" no arquivo, no lugar do valor que ninguém conhece`;
}

/**
 * A frase do pé da janela: quantos problemas, e quantos têm conserto.
 *
 * Dizer só "3 problemas" esconde a informação que decide o que fazer agora.
 */
export function problemsSummary(rows: readonly WarningRow[]): string {
  if (rows.length === 0) return 'Nenhum problema. O arquivo foi lido inteiro.';
  const consertaveis = rows.filter((row) => row.fix !== null).length;
  const quantos = `${rows.length} problema${rows.length === 1 ? '' : 's'}`;
  if (consertaveis === 0) return `${quantos}. Nenhum tem conserto automático: o conserto é na mão.`;
  return `${quantos}, ${consertaveis} com conserto aqui. O resto é na mão.`;
}

/**
 * **As imagens que faltam, numa linha só** — rodada 45, lote 4 (doc `64`, b).
 * O herói sem o atlas dava 42 linhas iguais a menos do nome. A janela abre com
 * esta linha, com a conta e os nomes; as linhas uma por uma ficam embaixo,
 * para o "Trocar imagem…" de cada desenho. `null` quando falta uma só, ou nenhuma.
 */
export function resumoDasImagens(rows: readonly WarningRow[]): string | null {
  const nomes: string[] = [];
  for (const row of rows) {
    // Doc 78, c: a linha longa do leitor e a curta do Salvar ("imagem não encontrada: X").
    const m = /imagem "(.+?)" não está em nenhum atlas/.exec(row.text) ?? /^imagem não encontrada: (.+)$/.exec(row.text);
    if (m !== null && !nomes.includes(m[1]!)) nomes.push(m[1]!);
  }
  if (nomes.length < 2) return null;
  const primeiros = nomes.slice(0, 8).join(', ');
  const mais = nomes.length > 8 ? ` e mais ${nomes.length - 8}` : '';
  return `${nomes.length} imagens não estão em atlas nenhum, e os desenhos delas ficam invisíveis: ${primeiros}${mais}. `
    + 'Quase sempre é o atlas que não veio junto: abra a pasta onde ele está, ou ponha o atlas e as imagens na pasta do projeto.';
}

export function showProblemsDialog(options: ProblemsDialogOptions): OpenDialog {
  const host = options.host ?? document.body;
  // Rodada 48: o pior primeiro, e os iguais juntos (176 avisos no projeto dele).
  const rows = avisosPeloPior(options.warnings).map((line) => warningRow(options.file, line));

  const lista = el('div', { class: 'dialog-problemas' });
  const tipos = resumoDosAvisos(options.warnings);
  // Rodada 45, lote 4: a conta das imagens que faltam vem primeiro, numa linha.
  const resumo = resumoDasImagens(rows);
  // Rodada 48, lote 3 (doc 95): um parágrafo só — o dos tipos, ou o das imagens.
  const paragrafo = abrirComParagrafo(tipos.grupos.length, resumo !== null);
  if (paragrafo !== null) {
    lista.append(el('p', { class: 'dialog-lead dialog-problemas-resumo', text: paragrafo === 'tipos' ? `${tipos.dica}.` : resumo! }));
  }
  // Doc 74, b: com o resumo, as linhas de cada imagem ficam recolhidas, para o
  // "Trocar imagem…" de cada uma — e não somadas por baixo.
  const recolhidas = resumo === null ? null : el('details', { class: 'dialog-problemas-uma-a-uma' });
  let quantasRecolhidas = 0;
  for (const row of rows) {
    const linha = el('div', { class: 'dialog-problema' });
    linha.append(el('p', { class: 'dialog-problema-texto', text: row.text }));
    const botoes = el('div', { class: 'dialog-problema-botoes' });
    if (row.target !== null) {
      const onde = row.text.split(': ')[0] ?? row.text;
      const ir = el('button', {
        class: 'dialog-close dialog-secundario', type: 'button', text: `Ir para ${onde}`,
      }) as HTMLButtonElement;
      ir.addEventListener('click', () => {
        options.onGo(row);
        close();
      });
      botoes.append(ir);
    }
    if (row.fix !== null) {
      const fix = row.fix;
      const botao = el('button', {
        class: 'dialog-close', type: 'button', text: fix.label, title: fixHint(fix),
      }) as HTMLButtonElement;
      botao.addEventListener('click', () => {
        options.onFix(row, fix);
        close();
      });
      botoes.append(botao);
      linha.append(el('p', { class: 'dialog-problema-conserto', text: fixHint(fix) }));
    }
    if (botoes.childElementCount > 0) linha.append(botoes);
    if (recolhidas !== null && (/não está em nenhum atlas/.test(row.text) || /^imagem não encontrada: /.test(row.text))) {
      recolhidas.append(linha);
      quantasRecolhidas++;
    } else {
      lista.append(linha);
    }
  }
  if (recolhidas !== null && quantasRecolhidas > 0) {
    recolhidas.prepend(el('summary', { text: `Ver as ${quantasRecolhidas} linhas, uma por imagem` }));
    lista.append(recolhidas);
  }
  if (rows.length === 0) {
    lista.append(el('p', { class: 'dialog-lead', text: 'Nada a mostrar: o arquivo foi lido inteiro, sem nenhum valor desconhecido.' }));
  }

  const fechar = el('button', { class: 'dialog-close', type: 'button', text: 'Fechar' }) as HTMLButtonElement;
  const box = el('div', {
    class: 'dialog-box dialog-box-larga', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Problemas do arquivo',
  }, [
    el('h2', { class: 'dialog-title', text: 'Problemas do arquivo' }),
    el('p', {
      class: 'dialog-lead',
      text: 'O que o programa não entendeu ao ler este arquivo. Nada disso foi adivinhado: '
        + 'o que não se entende vira aviso, nunca um palpite silencioso no desenho.',
    }),
    el('div', { class: 'dialog-table-box' }, [lista]),
    el('p', { class: 'dialog-problemas-conta', text: problemsSummary(rows) }),
    el('div', { class: 'dialog-buttons' }, [fechar]),
  ]);
  const root = el('div', { class: 'dialog-veil' }, [box]);

  let done = (): void => {};
  const closed = new Promise<void>((resolve) => { done = resolve; });
  let open = true;
  function close(): void {
    if (!open) return;
    open = false;
    document.removeEventListener('keydown', onKey, true);
    root.remove();
    done();
  }
  function onKey(event: KeyboardEvent): void {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    close();
  }
  fechar.addEventListener('click', close);
  root.addEventListener('pointerdown', (event) => { if (event.target === root) close(); });
  document.addEventListener('keydown', onKey, true);

  host.append(root);
  fechar.focus();
  return { root, close, closed };
}

/**
 * A janela **"Usar animações de outro boneco…"** — reaproveitar, 04/11/2026.
 *
 * Só desenha e devolve a escolha; a conta é do `reuse-model.ts` e do
 * `anim/bone-match.ts` (regra 8). Quatro blocos, de cima para baixo, na ordem
 * em que a pessoa pensa:
 *
 * 1. **De onde vêm** — o Esqueleto padrão, as outras bases do projeto, um arquivo;
 * 2. **Quais animações** — marcadas;
 * 3. **Combinar os ossos — combinam 14 de 17** — "de lá → daqui", com a lista
 *    dos ossos daqui em cada linha, e FALTA dito onde não achou;
 * 4. **Como entram** — Ligadas (mudam junto com o original) ou Cópia.
 *
 * Nada de "rig", "assets.animations" nem "k = 1,25" na tela: a palavra técnica
 * fica na dica, para quem quiser.
 */

import type { BoneFile } from '../../../runtime/src/index.js';
import { chooseBone, matchBones, matchTitle, renamesFor } from '../anim/bone-match.js';
import { readEditorState } from '../contract.js';
import type { BoneMatch } from '../anim/bone-match.js';
import { el } from '../ui/dom.js';
import { initialMatch, linkBreaks, PADRAO_LABEL } from './reuse-model.js';
import type { ReuseSource } from './reuse-model.js';

/** O que a janela devolve. */
export interface ReuseChoice {
  source: ReuseSource;
  names: string[];
  match: BoneMatch;
  mode: 'ligadas' | 'copia';
}

/** As opções da janela. */
export interface ReuseWindowOptions {
  host: BoneFile;
  /** O nome deste boneco, para as frases. */
  hostName: string;
  sources: ReuseSource[];
  /** Pede um arquivo `.bone` ao disco. `null` = a pessoa desistiu. */
  pickFile: () => Promise<ReuseSource | null>;
  /** A fonte marcada ao abrir (índice em `sources`). */
  initial?: number;
  /**
   * "Seguir o Esqueleto padrão…": só a tabela dos ossos, sem escolher
   * animação nem modo. O botão diz "Renomear os ossos".
   */
  onlyBones?: boolean;
  /** Com `onlyBones`: os ossos que a tabela pede (os do padrão inteiro). */
  bones?: string[];
}

const COMO: Record<string, string> = {
  'mesmo nome': 'mesmo nome',
  lembrado: 'lembrado da última vez',
  parecido: 'achado pelo nome parecido',
  escolhido: 'escolhido por você',
};

/** Abre a janela. Resolve com `null` quando fechada sem usar. */
export function reuseWindow(options: ReuseWindowOptions): Promise<ReuseChoice | null> {
  const { host } = options;
  const sources = [...options.sources];
  let atual = Math.min(Math.max(options.initial ?? 0, 0), Math.max(sources.length - 1, 0));
  let nomes: string[] = [];
  let match: BoneMatch | null = null;
  /**
   * O modo de começo, pela fonte. Um ARQUIVO solto (o herói, um boneco
   * inteiro) começa em Cópia: ligar a ele renomearia os ossos daqui e
   * traria as linhas dos desenhos de lá (a prova final, 05/11: 82 avisos).
   */
  const modoDe = (s: ReuseSource | undefined): 'ligadas' | 'copia' => (s?.kind === 'arquivo' ? 'copia' : 'ligadas');
  let modo: 'ligadas' | 'copia' = modoDe(sources[atual]);
  const daqui = (host.bones ?? []).map((b) => b.name);

  const box = el('div', 'dialog-box dialog-box-larga reaproveitar');
  for (const [name, value] of [
    ['--painel-rotulo', '70%'], ['--painel-linha', '#c3ccd8'], ['--painel-campo', '#f4f6f9'],
    ['--painel-texto', '#10151c'], ['--painel-texto-fraco', '#45505e'], ['--painel-realce', '#1a4fd8'],
  ]) box.style.setProperty(name, value);
  box.style.overflowY = 'auto';
  box.style.maxHeight = 'min(92vh, 860px)';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  const titulo = options.onlyBones ? `Seguir o ${PADRAO_LABEL}` : 'Usar animações de outro boneco';
  box.setAttribute('aria-label', titulo);
  const veil = el('div', 'dialog-veil');
  veil.append(box);

  box.append(el('h2', 'dialog-title', titulo));
  box.append(el('p', 'dialog-lead', options.onlyBones
    ? `Os ossos de ${options.hostName} ganham os nomes do ${PADRAO_LABEL}. Daí, as animações feitas `
      + 'para o padrão (as de fábrica, e as de qualquer boneco que o siga) tocam aqui sem combinar nada.'
    : `Muitos bonecos, as mesmas animações: o andar de um serve no outro. ${options.hostName} recebe `
      + 'as animações de outro boneco, e a tabela liga cada osso de lá a um osso daqui.'));

  const deOnde = el('div', 'reaproveitar-fontes');
  const quais = el('div', 'reaproveitar-quais');
  const tituloTabela = el('h3', 'reaproveitar-subtitulo');
  const tabela = el('div', 'dialog-table-box');
  // 05/11/2026 (medição das janelas): a TABELA é quem rola — uma linha por
  // osso, cresce com o boneco —, e a janela não. Ela cresce até 300 px e
  // encolhe até 120 (o cabeçalho e duas linhas); só abaixo disso a janela rola.
  tabela.style.flex = '1 1 auto';
  tabela.style.minHeight = '120px';
  tabela.style.maxHeight = '300px';
  tabela.dataset['rolagem'] = 'lista';
  const como = el('div', 'reaproveitar-como');
  const aviso = el('p', 'dialog-lead reaproveitar-aviso');

  if (!options.onlyBones) {
    box.append(el('h3', 'reaproveitar-subtitulo', 'De onde vêm'), deOnde);
    box.append(el('h3', 'reaproveitar-subtitulo', 'Quais animações'), quais);
  }
  box.append(tituloTabela, tabela);
  if (!options.onlyBones) box.append(el('h3', 'reaproveitar-subtitulo', 'Como entram'), como);
  box.append(aviso);

  const go = el('button', 'dialog-close', options.onlyBones ? 'Renomear os ossos' : 'Usar as animações') as HTMLButtonElement;
  go.type = 'button';
  const cancel = el('button', 'dialog-close', options.onlyBones ? 'Fechar sem renomear' : 'Fechar sem usar') as HTMLButtonElement;
  cancel.type = 'button';
  const buttons = el('div', 'dialog-buttons');
  buttons.append(go, cancel);
  box.append(buttons);

  const radio = (name: string, id: string, checked: boolean, texto: string, dica: string,
    onChange: () => void): HTMLElement => {
    const linha = el('label', 'reaproveitar-opcao');
    linha.style.display = 'flex';
    linha.style.gap = '8px';
    linha.style.alignItems = 'baseline';
    linha.title = dica;
    const input = el('input') as HTMLInputElement;
    input.type = 'radio';
    input.name = name;
    input.id = id;
    input.checked = checked;
    input.addEventListener('change', () => { if (input.checked) onChange(); });
    linha.append(input, el('span', undefined, texto));
    return linha;
  };

  const desenharFontes = (): void => {
    deOnde.replaceChildren();
    sources.forEach((s, i) => {
      deOnde.append(radio('reaproveitar-fonte', `reaproveitar-fonte-${i}`, i === atual,
        `${s.label}: ${s.animations.join(', ')}`,
        s.kind === 'padrao' ? 'As quatro que vêm com o programa, feitas para o Esqueleto padrão (humanoide-v1)'
          : s.kind === 'base' ? 'As animações de outra base deste projeto. Ligadas, a base de lá vira a dona: mudou lá, muda aqui'
            : `O arquivo ${s.uri}`,
        () => { atual = i; nomes = [...s.animations]; modo = modoDe(s); refazer(); }));
    });
    const arquivo = el('button', 'reaproveitar-arquivo', 'Um arquivo .bone…') as HTMLButtonElement;
    arquivo.type = 'button';
    arquivo.title = 'Escolher no disco um .bone com animações: o herói, ou um arquivo exportado';
    arquivo.addEventListener('click', () => {
      void options.pickFile().then((s) => {
        if (s === null) return;
        sources.push(s);
        atual = sources.length - 1;
        nomes = [...s.animations];
        modo = modoDe(s);
        desenharFontes();
        refazer();
      });
    });
    deOnde.append(arquivo);
  };

  const desenharQuais = (): void => {
    quais.replaceChildren();
    const s = sources[atual];
    if (s === undefined) return;
    for (const nome of s.animations) {
      const linha = el('label', 'reaproveitar-opcao');
      linha.style.display = 'inline-flex';
      linha.style.gap = '6px';
      linha.style.marginRight = '16px';
      const input = el('input') as HTMLInputElement;
      input.type = 'checkbox';
      input.checked = nomes.includes(nome);
      input.addEventListener('change', () => {
        nomes = input.checked ? [...nomes, nome] : nomes.filter((n) => n !== nome);
        nomes = s.animations.filter((n) => nomes.includes(n));
        refazer(false);
      });
      linha.append(input, el('span', undefined, nome));
      quais.append(linha);
    }
  };

  const desenharTabela = (): void => {
    tabela.replaceChildren();
    if (match === null) return;
    tituloTabela.textContent = matchTitle(match);
    const t = el('table', 'dialog-table');
    const cab = el('tr');
    cab.append(el('th', undefined, 'Osso de lá'), el('th', undefined, 'Osso daqui'), el('th', undefined, 'Como'));
    t.append(cab);
    for (const row of match.rows) {
      const tr = el('tr');
      const escolha = el('select', 'reaproveitar-osso') as HTMLSelectElement;
      escolha.setAttribute('aria-label', `Osso daqui para "${row.from}"`);
      escolha.title = `O osso de ${options.hostName} que faz o papel de "${row.from}"`;
      const nenhum = el('option', undefined, '— nenhum —') as HTMLOptionElement;
      nenhum.value = '';
      escolha.append(nenhum);
      for (const n of daqui) {
        const o = el('option', undefined, n) as HTMLOptionElement;
        o.value = n;
        escolha.append(o);
      }
      escolha.value = row.to ?? '';
      escolha.addEventListener('change', () => {
        match = chooseBone(match!, row.from, escolha.value === '' ? null : escolha.value);
        desenharTabela();
        desenharComo();
      });
      const estado = row.to === null ? 'FALTA: fica parado' : COMO[row.how ?? ''] ?? '';
      const td = el('td', undefined, estado);
      if (row.to === null) td.style.color = '#b42318';
      tr.append(el('td', undefined, row.from), el('td', undefined, [escolha]), td);
      t.append(tr);
    }
    tabela.append(t);
  };

  const desenharComo = (): void => {
    if (match === null) return;
    const { renames, conflicts } = renamesFor(match, daqui);
    const mudam = renames.length === 0 ? 'Nenhum osso daqui muda de nome.'
      : `Os ossos daqui ganham os nomes de lá: ${renames.slice(0, 6).map((r) => `${r.de} → ${r.para}`).join(', ')}`
        + `${renames.length > 6 ? ` e mais ${renames.length - 6}` : ''}.`;
    if (options.onlyBones) {
      aviso.textContent = conflicts.length > 0
        ? `Não dá para renomear: já há osso chamado ${conflicts.join(', ')} fora da tabela.`
        : mudam;
      go.disabled = conflicts.length > 0 || renames.length === 0;
      return;
    }
    como.replaceChildren(
      radio('reaproveitar-modo', 'reaproveitar-ligadas', modo === 'ligadas',
        'Ligadas — mudam junto com o original',
        'Este boneco cita o arquivo de lá (assets.animations). Mudou lá, muda aqui. '
          + 'Para o jogo ligar pelo nome, os ossos daqui ganham os nomes de lá',
        () => { modo = 'ligadas'; desenharComo(); }),
      radio('reaproveitar-modo', 'reaproveitar-copia', modo === 'copia',
        'Cópia — ficam só neste boneco',
        'As animações entram neste boneco, com os nomes daqui. Mexer nelas não muda o original',
        () => { modo = 'copia'; desenharComo(); }),
    );
    const quebra = modo === 'ligadas' ? linkBreaks(host, match) : [];
    if (quebra.length > 0) {
      aviso.textContent = `Ligadas não dá aqui: este boneco já toca ligado ${quebra.join(', ')}, e mudar os nomes `
        + 'dos ossos o pararia. Escolha Cópia.';
    } else if (modo === 'ligadas') {
      aviso.textContent = conflicts.length > 0
        ? `Ligadas não dá: já há osso chamado ${conflicts.join(', ')} fora da tabela. Combine esse osso, ou escolha Cópia.`
        : mudam;
    } else {
      aviso.textContent = `As animações entram em ${options.hostName} com os nomes daqui. `
        + (match.matched < match.total ? `${match.total - match.matched} osso(s) sem par ficam de fora.` : '');
    }
    go.disabled = nomes.length === 0 || match.matched === 0 || (modo === 'ligadas' && (conflicts.length > 0 || quebra.length > 0));
  };

  const refazer = (redesenharQuais = true): void => {
    const s = sources[atual];
    if (s === undefined) {
      match = null;
      tituloTabela.textContent = 'Escolha de onde vêm as animações';
      go.disabled = true;
      return;
    }
    if (redesenharQuais) desenharQuais();
    match = options.onlyBones
      ? matchBones(options.bones ?? [], daqui, readEditorState(host).mapaDeOssos?.[s.uri] ?? {})
      : initialMatch(host, s, nomes);
    // Fonte nova: se Ligadas pararia o que este boneco já toca, começa em Cópia.
    if (redesenharQuais && !options.onlyBones && modo === 'ligadas' && linkBreaks(host, match).length > 0) modo = 'copia';
    desenharTabela();
    desenharComo();
  };

  nomes = [...(sources[atual]?.animations ?? [])];
  desenharFontes();
  refazer();

  return new Promise<ReuseChoice | null>((resolve) => {
    let open = true;
    const finish = (value: ReuseChoice | null): void => {
      if (!open) return;
      open = false;
      document.removeEventListener('keydown', onKey, true);
      veil.remove();
      resolve(value);
    };
    function onKey(event: KeyboardEvent): void {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      finish(null);
    }
    cancel.addEventListener('click', () => finish(null));
    veil.addEventListener('pointerdown', (event) => { if (event.target === veil) finish(null); });
    document.addEventListener('keydown', onKey, true);
    go.addEventListener('click', () => {
      const s = sources[atual];
      if (s === undefined || match === null) return;
      finish({ source: s, names: [...nomes], match, mode: modo });
    });
    document.body.append(veil);
    go.focus();
  });
}

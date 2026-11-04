/**
 * **A biblioteca de animações** — degrau 12, parte `B`, lote 2 (18/09/2026).
 *
 * 🗣️ *"o que você acha do Mixamo?"* — e a resposta da pesquisa: *"o que o
 * Mixamo realmente vende não é a tecnologia, é a biblioteca"*. Sair com
 * **parado, andar, correr e pular** prontos, caindo em qualquer personagem que
 * siga a convenção de nomes, é o que faz um formato virar padrão.
 *
 * As quatro vêm no programa, em `formato/rigs/humanoide-v1-animacoes.bone`,
 * gravadas contra `formato/rigs/humanoide-v1.bone` — o corpo sem arte que é a
 * convenção de nomes do projeto (§4.8, §14.4).
 *
 * ONDE ELAS APARECEM, E POR QUÊ — os três programas, olhados no disco antes de
 * decidir (regra 9 da casa, `documentos/pesquisa/nova pesquisa/`):
 *
 * | Programa | O que ele faz |
 * |:---|:---|
 * | **Spine** | `File → Import → Project`, e o seletor oferece **Skeleton** ou **Animation**, com *"Import into an existing skeleton"*. Não há prateleira na tela: a animação importada entra na **lista normal de animações** e fica igual às outras |
 * | **Spriter** | **não tem biblioteca e não importa animação.** Tem a *Animation palette*, à direita, que lista as animações e as entidades do projeto. Reaproveitar é na mão: `Ctrl+C` e `Edit / Paste to all keys` |
 * | **DragonBones** | tem uma **biblioteca**, mas é a de **recursos** (imagens): uma pasta de verdade no disco, com *importar recurso · abrir a pasta da biblioteca · atualizar*. O painel Animações dele tem só *nova · clonar · renomear · apagar*. Os prontos que ele traz são **projetos de exemplo**, abertos por Abrir |
 *
 * **A decisão, e ela segue o Spine**, que é o único dos três que faz a coisa
 * que o Humberto pediu: a porta é **um botão na janela Animação**, e as
 * animações que chegam aparecem **na mesma lista**, numa seção **De fora**, com
 * o nome do arquivo de onde vieram. Não se inventou prateleira nova: o
 * DragonBones prova que uma biblioteca separada é um lugar de *recursos*, e o
 * Spriter prova que sem porta nenhuma a pessoa copia na mão.
 *
 * **O que é nosso, e não é de nenhum dos três:** a lista do que o corpo NÃO tem
 * aparece por extenso **antes** de trazer, e o fator de tamanho aparece como
 * número (`k = 2,000`), não como promessa. Nem o Spine nem o DragonBones dizem
 * isso na tela — o Spine deixa a timeline órfã cair calada.
 */

import type { BoneFile } from '../../../runtime/src/index.js';
import {
  BONE_EXTENSION, animationNames, referenceFactorFor, textBytes, unmetRig,
} from './export-animation.js';
import { putBoneFile } from './export-skin.js';
// O `el` é um só, em `ui/dom.ts`, desde o lote A4 — a exceção do `contract.ts`.
import { el } from '../ui/dom.js';

/**
 * Os arquivos de fábrica, como texto, pela pasta em que moram. O empacotador
 * troca a chamada por um objeto — é o mesmo jeito do `io/manual.ts`, que carrega
 * os capítulos para dentro da página.
 *
 * `humanoide-v1.bone` entra junto e **não é uma biblioteca**: é o corpo da
 * convenção, com `animations` vazio de propósito. Ele é filtrado abaixo, pela
 * regra que vale para qualquer arquivo — sem animação, não é biblioteca.
 */
const FACTORY_TEXT = import.meta.glob('../../../formato/rigs/*.bone', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>;

/** Onde os arquivos de fábrica moram, para a frase do rodapé da janela. */
export const LIBRARY_FOLDER = 'formato/rigs/';

/** Um arquivo da biblioteca, já lido. */
export interface LibraryFile {
  /** O nome do arquivo, que é o uri que vai para `assets.animations`. */
  uri: string;
  /** O `.bone` inteiro. */
  file: BoneFile;
  /** As animações que ele traz, na ordem do arquivo. */
  animations: string[];
  /** O texto exato do arquivo, para gravá-lo ao lado do projeto. */
  text: string;
}

/**
 * Os arquivos de fábrica que **têm animação**, em ordem de nome.
 *
 * Um `.bone` de `formato/rigs/` sem animação nenhuma não entra: é um corpo de
 * convenção (o `humanoide-v1.bone`) ou uma pele (o `lobisomem-rabo.bone`), e
 * oferecê-los aqui seria oferecer uma biblioteca vazia — o tipo de verde que a
 * regra 21 proíbe.
 */
export function factoryLibrary(): LibraryFile[] {
  const saida: LibraryFile[] = [];
  for (const [path, text] of Object.entries(FACTORY_TEXT)) {
    const uri = path.slice(path.lastIndexOf('/') + 1);
    let file: BoneFile;
    try { file = JSON.parse(text) as BoneFile; } catch { continue; }
    const animations = animationNames(file);
    if (animations.length === 0) continue;
    saida.push({ uri, file, animations, text });
  }
  return saida.sort((a, b) => a.uri.localeCompare(b.uri, 'pt-BR'));
}

/** O que a janela mostra de um arquivo, contra o corpo aberto. */
export interface LibraryRow {
  uri: string;
  /** Uma linha por animação: `parado — 2,00 s, repete`. */
  animations: string[];
  /** O que este corpo não tem, por extenso (`osso "coxa_e"`). */
  unmet: string[];
  /** O fator de tamanho que o runtime vai aplicar às translações. */
  factor: number;
  /** O nome do contrato que o arquivo declara, ou `null`. */
  rigName: string | null;
}

/** Um tempo do jeito que um leitor de português espera: `1,25 s`. */
function seconds(value: unknown): string {
  const safe = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  return `${safe.toFixed(2).replace('.', ',')} s`;
}

/** A linha de um arquivo da biblioteca, conferido contra o corpo aberto. */
export function libraryRow(host: BoneFile, entry: LibraryFile): LibraryRow {
  const rigName = (entry.file as unknown as { rig?: { name?: unknown } }).rig?.name;
  return {
    uri: entry.uri,
    animations: ((entry.file.animations ?? []) as unknown as Array<Record<string, unknown>>)
      .map((a) => {
        const repete = a['loop'] === true ? ', repete' : ', não repete';
        return `${String(a['name'])} — ${seconds(a['duration'])}${repete}`;
      }),
    unmet: unmetRig(host, entry.file),
    factor: referenceFactorFor(host, entry.file),
    rigName: typeof rigName === 'string' && rigName !== '' ? rigName : null,
  };
}

/** A frase do tamanho, como número e não como promessa. */
export function factorLine(factor: number): string {
  return factor === 1
    ? 'Tamanho: as animações entram como foram gravadas (k = 1)'
    : `Tamanho: as translações entram multiplicadas por ${factor.toFixed(3).replace('.', ',')} `
      + '(k = o comprimento do osso de referência aqui, dividido pelo de lá)';
}

/** O que a janela devolve: o arquivo escolhido e o nome com que foi gravado. */
export interface LibraryPick {
  entry: LibraryFile;
  /** O nome com que o arquivo foi gravado, e que vai para `assets.animations`. */
  savedAs: string;
}

/**
 * Abre **"Biblioteca de animações…"**. Resolve com `null` quando a janela foi
 * fechada sem trazer nada.
 *
 * **Por que ela grava o arquivo.** As quatro animações vêm dentro do programa,
 * e o `assets.animations` é um caminho relativo ao `.bone` do projeto (§2.8): um
 * uri que aponta para dentro do editor não existe na máquina de quem for rodar
 * o jogo. Então trazer é **gravar o arquivo ao lado do projeto e citar o nome
 * dele** — nesta ordem, e dizendo isso na tela. Quem fechar a janela de gravar
 * não traz nada, e o rodapé conta.
 *
 * `write` é quem grava — o painel passa o `putBoneFile`, e o teste passa um que
 * devolve um nome de mentira, sem DOM.
 */
export function animationLibraryWindow(
  host: BoneFile,
  entries: readonly LibraryFile[] = factoryLibrary(),
  write: (suggested: string, text: string) => Promise<string | null> = putBoneFile,
  parentHost?: HTMLElement,
): Promise<LibraryPick | null> {
  const parent = parentHost ?? document.body;

  const box = el('div', 'dialog-box');
  for (const [name, value] of [
    ['--painel-rotulo', '70%'],
    ['--painel-linha', '#c3ccd8'],
    ['--painel-campo', '#f4f6f9'],
    ['--painel-texto', '#10151c'],
    ['--painel-texto-fraco', '#45505e'],
    ['--painel-realce', '#1a4fd8'],
  ]) box.style.setProperty(name, value);
  box.style.overflowY = 'auto';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Biblioteca de animações');

  const veil = el('div', 'dialog-veil');
  veil.append(box);

  box.append(el('h2', 'dialog-title', 'Biblioteca de animações'));
  box.append(el('p', 'dialog-lead',
    'Animações prontas que vêm com o programa, gravadas contra a convenção de nomes '
    + 'humanoide-v1. Elas entram nesta base pelo nome do osso: onde o nome bate, a animação '
    + 'move o osso; onde não bate, aquela parte fica de fora, e a base continua abrindo.'));
  box.append(el('p', 'dialog-lead',
    `O arquivo vem de ${LIBRARY_FOLDER}, de dentro do programa. Para o jogo achá-lo, ele tem `
    + 'de ficar ao lado do seu .bone — então trazer é GRAVAR o arquivo (você escolhe onde) e '
    + 'pôr o nome dele em assets.animations. Fechar a janela de gravar não traz nada.'));

  const rows = entries.map((entry) => ({ entry, row: libraryRow(host, entry) }));
  const escolha = new Map<string, HTMLInputElement>();
  let primeiro: string | null = null;

  if (rows.length === 0) {
    box.append(el('p', 'dialog-lead', 'O programa não traz nenhum arquivo de animações.'));
  }

  for (const { row } of rows) {
    const bloco = el('div', 'prop-linha');
    const marca = el('input', 'prop-marca') as HTMLInputElement;
    marca.type = 'radio';
    marca.name = 'biblioteca-arquivo';
    marca.id = `biblioteca-${row.uri}`;
    if (primeiro === null) { marca.checked = true; primeiro = row.uri; }
    const rotulo = el('label', 'prop-rotulo',
      row.rigName === null ? row.uri : `${row.uri}  (contrato ${row.rigName})`);
    rotulo.htmlFor = marca.id;
    bloco.append(rotulo, marca);
    escolha.set(row.uri, marca);
    box.append(bloco);

    const lista = el('ul', 'dialog-list');
    for (const linha of row.animations) lista.append(el('li', undefined, linha));
    box.append(lista);

    // O que este corpo não tem, POR EXTENSO e antes de trazer. É a coisa que
    // nem o Spine nem o DragonBones dizem, e é a regra 21 da casa.
    if (row.unmet.length === 0) {
      box.append(el('p', 'dialog-lead',
        'Esta base tem todos os nomes que o arquivo pede: as animações entram inteiras.'));
    } else {
      const falta = el('ul', 'dialog-list');
      for (const nome of row.unmet) {
        falta.append(el('li', undefined,
          `Esta base NÃO tem o ${nome}: o que depender dele fica de fora`));
      }
      box.append(el('p', 'dialog-lead',
        `Esta base não tem ${row.unmet.length === 1 ? '1 nome' : `${row.unmet.length} nomes`} `
        + 'que o arquivo pede. Ele entra assim mesmo, e nada quebra:'));
      box.append(falta);
    }
    box.append(el('p', 'dialog-lead', factorLine(row.factor)));
  }

  const go = el('button', 'dialog-close', 'Gravar o arquivo e trazer') as HTMLButtonElement;
  go.type = 'button';
  go.disabled = rows.length === 0;
  const cancel = el('button', 'dialog-close', 'Fechar sem trazer') as HTMLButtonElement;
  cancel.type = 'button';
  const buttons = el('div', 'dialog-buttons');
  buttons.append(go, cancel);
  box.append(buttons);

  return new Promise<LibraryPick | null>((resolve) => {
    let open = true;
    const finish = (value: LibraryPick | null): void => {
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
    veil.addEventListener('pointerdown', (event) => {
      if (event.target === veil) finish(null);
    });
    document.addEventListener('keydown', onKey, true);

    go.addEventListener('click', () => {
      const marcado = [...escolha.entries()].find(([, node]) => node.checked)?.[0] ?? null;
      const entry = rows.find(({ row }) => row.uri === marcado)?.entry;
      if (entry === undefined) return;
      go.disabled = true;
      void write(entry.uri, entry.text).then((savedAs) => {
        go.disabled = false;
        if (savedAs === null) return; // A pessoa fechou a janela de gravar.
        finish({ entry, savedAs });
      });
    });

    parent.append(veil);
    go.focus();
  });
}

/** A frase do rodapé depois de trazer da biblioteca. */
export function libraryNotice(pick: LibraryPick, unmet: readonly string[]): string {
  const quantas = pick.entry.animations.length === 1
    ? `1 animação` : `${pick.entry.animations.length} animações`;
  const nomes = pick.entry.animations.join(', ');
  const base = `${pick.savedAs}: ${quantas} da biblioteca (${nomes})`;
  if (unmet.length === 0) return `${base}, agora na lista de Animações, em "De fora"`;
  return `${base}. Esta base não tem ${unmet.join(', ')} — elas entram assim mesmo, `
    + 'e o que depender desses nomes fica de fora';
}

export { BONE_EXTENSION, textBytes };

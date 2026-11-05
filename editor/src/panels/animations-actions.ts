/**
 * As ações das Animações que não precisam da aba — lote A2 (v10.5).
 *
 * Nova animação e Montagem ⇄ Animando: a conta é `AddAnimation` e
 * `switchAnimation`, e nada aqui lê o DOM da aba. Registradas uma vez, no
 * arranque; os botões da aba chamam as mesmas funções.
 */

import type { EditorDoc } from '../contract.js';
import { emptySelection } from '../contract.js';
import { switchAnimation, transport } from '../anim/transport.js';
import { registerAction } from '../ui/actions.js';
import { viewSettings } from '../viewport/onion.js';
import { AddAnimation, bakeBaseAt, bodyUriFor, createdNotice, newBaseNotice } from './animations-model.js';
// Degrau 5: os corpos do projeto e o `Doc` de um corpo novo (`doc/`, degrau 1).
import { Doc } from '../doc/document.js';
import { projetoDe } from '../doc/projeto.js';
import type { Projeto } from '../doc/projeto.js';
// Rodada 8b, C10: o arquivo da entidade, guardado ao abrir.
import { entityFileText } from '../doc/entity-files.js';
import { parseBoneText } from '../../../runtime/src/index.js';
import type { Matrix2x3 } from '../../../runtime/src/index.js';
// Degrau 12, parte `B` (18/09/2026): Exportar animação e Importar animação.
import {
  ImportAnimationCopy, ImportAnimationFile, animationFileNotice, exportAnimationWindow, importAnimationLines,
  importAnimationNotice, unmetRig,
} from '../io/export-animation.js';
import { rememberAnimationNames } from '../io/export-animation.js';
import { rememberSharedFile } from '../doc/shared-animations.js';
import { animationLibraryWindow, libraryNotice } from '../io/animation-library.js';
import type { LibraryPick } from '../io/animation-library.js';
import { putBoneFile } from '../io/export-skin.js';
import { openAnotherSkeleton } from '../io/open-save.js';
import { askForm, askPick, askUser } from '../ui/dialog.js';
import { listBodies, listEntityBases } from './animations-model.js';
import { bodyKeyRemovedNotice, bodyKeys, removeBodyKey } from '../anim/body.js';
import { EditKeys } from '../anim/pose-mode.js';
import { roundTime, sameTime } from '../anim/keying.js';
import type { BoneFile } from '../../../runtime/src/index.js';

/**
 * Abre uma animação. A agulha volta a zero, e o tocador **segue tocando** se já
 * estava tocando — anotação 6. Lote 46: tocando, o modo de Configurações decide
 * se entra na fila.
 */
export function openAnimation(doc: EditorDoc, name: string): void {
  switchAnimation(doc, name, transport, viewSettings().switchMode);
}

/** Animação nova, já aberta. */
/**
 * O nome que a **Nova animação** pediu, à espera de quem desenha a lista — Q1.
 *
 * Só este gesto pede: reabrir a pasta, desfazer um Apagar e importar também
 * fazem a lista crescer, e nenhum deles é criar (roteiro, passo 14).
 */
let nameRequest: string | null = null;

/** Devolve o pedido UMA vez, e o esquece. */
export function takeNameRequest(): string | null {
  const pedido = nameRequest;
  nameRequest = null;
  return pedido;
}

export function addAnimation(doc: EditorDoc): void {
  const command = new AddAnimation(doc.file);
  // Antes do `run`: o `run` já avisa a lista, e ela lê o pedido nesse aviso.
  nameRequest = command.name;
  doc.run(command);
  openAnimation(doc, command.name);
  // Depois de abrir: abrir escreve "Abriu a animação", e o que aconteceu foi
  // mais que isso — ela nasceu, em laço (P18, K6).
  doc.notice(createdNotice(command.name));
}

/**
 * **Animação → Abrir a base** — degrau 11, lote 1 (18/09/2026).
 *
 * O interruptor `Montagem | Animando` saiu da barra, e o `alternar-modo` saiu
 * com ele. A volta para a base tem duas portas: um clique no corpo, na janela
 * Animação (`openBody`), e este item de menu. A ida — abrir uma animação — é
 * um clique no nome dela, na mesma janela. Com a base já aberta, o item diz
 * isso em vez de não fazer nada calado.
 */
export function openBase(doc: EditorDoc): void {
  if (doc.animation === null) {
    doc.notice('A base já está aberta. Para abrir uma animação, clique no nome dela na janela Animação');
    return;
  }
  switchAnimation(doc, null);
}

/** Registra as ações. Devolve como tirá-las. */
export function registerAnimationActions(doc: EditorDoc): Array<() => void> {
  return [
    registerAction('abrir-a-base', { run: () => openBase(doc), enabled: () => doc.animation !== null }),
    registerAction('nova-animacao', { run: () => addAnimation(doc) }),
    // Degrau 12, parte `B`: a biblioteca. Dois ids, porque são dois gestos
    // (regra 17) — gravar as animações num `.bone` com `rig`, e trazer um.
    registerAction('exportar-animacao', {
      run: () => { void exportAnimation(doc); },
      enabled: () => (doc.file.animations ?? []).length > 0,
    }),
    registerAction('importar-animacao', { run: () => { void importAnimation(doc); } }),
    // Lote 2: as quatro de fábrica. É o mesmo gesto de importar, com o arquivo
    // já escolhido — por isso um id próprio, e não um terceiro caminho.
    registerAction('biblioteca-animacoes', { run: () => { void openAnimationLibrary(doc); } }),
    // Rodada 6 (05/10/2026): as portas da janela Animação no menu. A mesma
    // conta do botão; o menu pergunta o que o botão sabia pela lista.
    registerAction('salvar-base-nova', {
      run: () => { void askNewBase(doc); },
      enabled: () => whyNoNewBase(doc) === null,
      why: () => whyNoNewBase(doc),
    }),
    registerAction('rebaixar-entidade', {
      run: () => { void askDemoteBody(doc); },
      enabled: () => demotable(doc).length > 0,
      why: () => DEMOTE_WHY,
    }),
    registerAction('tirar-troca-base', {
      run: () => { takeOutBodySwap(doc); },
      enabled: () => whyNoBodySwap(doc) === null,
      why: () => whyNoBodySwap(doc),
    }),
  ];
}

// ---------------------------------------------------------------------------
// A biblioteca de animações — degrau 12, parte `B` (18/09/2026)
// ---------------------------------------------------------------------------

/*
 * 🗣️ *"o que você acha do Mixamo?"* — o Humberto. A conta inteira mora em
 * `io/export-animation.ts`; aqui estão as duas portas, e só elas, como o
 * `skins-actions.ts` faz com a pele.
 *
 * Por que a pergunta de importar mora AQUI e não no `io/`: `io/` é o degrau 2
 * e `ui/dialog.ts` é o degrau 3 (`contract.ts`, e o `fronteiras.test.ts` é o
 * árbitro). O `io/` desenha a janela de exportar com o `el` de `ui/dom.ts`, que
 * é a exceção escrita; a janela de perguntar é de um painel.
 */

/**
 * **Exportar animação…**: as animações marcadas num `.bone` com `rig`, para
 * entrarem noutro corpo por `assets.animations` (2.8).
 *
 * O corpo não vai junto, e é de propósito: a §2.8 ignora `bones`, `slots`,
 * `constraints` e `events` de um arquivo de animações. Quem recebe o arquivo é
 * que põe o corpo.
 */
export async function exportAnimation(doc: EditorDoc): Promise<string | null> {
  if ((doc.file.animations ?? []).length === 0) {
    doc.notice('Esta base não tem animação nenhuma para exportar');
    return null;
  }
  const saida = await exportAnimationWindow(doc.file, putBoneFile);
  if (saida === null) return null;
  doc.notice(animationFileNotice(saida.name, saida.report));
  return saida.name;
}

/**
 * **Importar animação…**: o uri do arquivo entra em `assets.animations`, e as
 * animações de fora aparecem na lista como as daqui.
 *
 * **A lista do que não bate aparece ANTES de aplicar**, por extenso, e a pessoa
 * decide: é aqui que ainda dá para escolher outro corpo ou outro arquivo. O
 * runtime avisaria `RIG_UNMET` depois, e o validador de linha de comando não
 * avisa nada — esta janela é, hoje, o único lugar onde alguém vê que um nome de
 * osso não bate (regra 21).
 *
 * `pick` é quem escolhe o arquivo; a casca passa o seletor de verdade, e o
 * teste passa um que devolve um arquivo de mentira, sem DOM. `confirm` é a
 * pergunta, pelo mesmo motivo.
 */
export async function importAnimation(
  doc: EditorDoc,
  pick: () => Promise<{ uri: string; file: BoneFile } | null> = defaultAnimationPick,
  confirm: (lines: string[], count: number) => Promise<boolean> = askAboutAnimation,
): Promise<string | null> {
  const escolhido = await pick();
  if (escolhido === null) return null;
  const nomes = (escolhido.file.animations ?? []).map((a) => a.name);
  if (nomes.length === 0) {
    // Regra 21: um `.bone` sem animação nenhuma não é um arquivo de animações.
    // Dizer isso é mais barato do que deixar a lista igual e a pessoa procurar
    // o erro. É a mesma linha do `importSkin`, e é de propósito.
    doc.notice(`${escolhido.uri} não tem animação nenhuma: não é um arquivo de animações`);
    return null;
  }
  // M17: todas já existem aqui? Não há o que entrar — e a cópia diria
  // "entrou" sem nada ter entrado.
  const daqui = new Set((doc.file.animations ?? []).map((a) => a.name));
  const repetidas = nomes.filter((nome) => daqui.has(nome));
  if (repetidas.length === nomes.length) {
    doc.notice(`${escolhido.uri}: ${repetidas.length === 1 ? `a animação "${repetidas[0]!}" já existe` : `as animações ${repetidas.join(', ')} já existem`} nesta base. `
      + 'Apague ou renomeie a daqui, e importe de novo. Nada mudou');
    return null;
  }
  const falta = unmetRig(doc.file, escolhido.file);
  const linhas = importAnimationLines(doc.file, escolhido.file, nomes);
  if (!await confirm(linhas, falta.length)) {
    doc.notice(`${escolhido.uri} não entrou: nada mudou nesta base`);
    return null;
  }
  // M17 (rodada 3): a animação ENTRA no corpo — o editor não lê arquivo de
  // fora, e só citar o uri a deixava em "De fora", sem tocar.
  const copia = new ImportAnimationCopy(escolhido.uri, escolhido.file);
  doc.run(copia);
  const outros = copia.warnings.filter((w) => !w.startsWith('RIG_UNMET'))
    .map((w) => w.replace(/^[A-Z_]+: /, '').replace(/ \(2\.8\)$/, ''));
  doc.notice([importAnimationNotice(escolhido.uri, copia.brought, falta), ...outros].join('. '));
  return escolhido.uri;
}

/** O seletor de verdade: um `.bone` de fora, lido sem tomar o lugar do aberto. */
async function defaultAnimationPick(): Promise<{ uri: string; file: BoneFile } | null> {
  const aberto = await openAnotherSkeleton();
  if (aberto === null) return null;
  return { uri: aberto.path, file: aberto.file };
}

/**
 * A pergunta, com a lista inteira na tela. O botão diz o que vai acontecer, e
 * quando há nome que não bate ele diz isso também — quem aperta "Trazer assim
 * mesmo" sabe o que está trazendo.
 */
async function askAboutAnimation(lines: string[], count: number): Promise<boolean> {
  return askUser({
    title: 'Importar animação',
    lead: count === 0
      ? 'Esta base tem todos os nomes que o arquivo pede. Confira o que entra:'
      : `Esta base NÃO tem ${count === 1 ? '1 nome' : `${count} nomes`} que o arquivo pede. `
        + 'O arquivo entra assim mesmo — o que depender desses nomes fica de fora, sem quebrar nada.',
    lines,
    yesLabel: count === 0 ? 'Trazer as animações' : 'Trazer assim mesmo',
    noLabel: 'Não trazer',
  });
}

// ---------------------------------------------------------------------------
// Os corpos da janela Animação — degrau 5 (17/09/2026)
// ---------------------------------------------------------------------------

/**
 * **Clicar num corpo abre a base dele** — 5.1, M1 e M8.
 *
 * Duas coisas num gesto: o corpo em foco troca (a cena, a Árvore, a Ordem e as
 * Propriedades passam a ser as dele) e a **base** abre — `doc.animation = null`,
 * que é o quadro 0 de §5.1, o único lugar onde não há animação por cima.
 *
 * Clicar no corpo que já está em foco não troca nada: só fecha a animação e
 * mostra a base, que é o que o clique promete.
 */
export function openBody(doc: EditorDoc, uri: string): boolean {
  const projeto = projetoDe(doc);
  // Rodada 8b, C10: sair da entidade aberta por dentro é voltar primeiro.
  const voltou = projeto?.cenaMontada != null && returnToHost(doc, null);
  const trocou = (projeto !== null && projeto.trocarFoco(uri)) || (voltou && projeto?.emFocoUri === uri);
  if (doc.animation !== null) switchAnimation(doc, null);
  const nome = projeto === null ? uri : projeto.nameOf(uri);
  doc.notice(trocou ? `Base de ${nome}` : `Base de ${nome} (já era a base em foco)`);
  return trocou;
}

/**
 * **O nome da entidade, na lista** — rodada 8b, C9. Escolhe na cena o slot (ou
 * os slots) em que ela está encaixada: é o caminho mais curto da lista até a
 * peça, e o rodapé diz onde ela está.
 */
export function pickEntitySlots(doc: EditorDoc, uri: string, slots: readonly string[]): void {
  doc.select({ ...emptySelection(), slots: [...slots] });
  const nome = uri.split(/[\\/]/).pop()?.replace(/\.(bone|boneb|bonez)$/i, '') ?? uri;
  doc.notice(slots.length === 1
    ? `Entidade ${nome}, encaixada no slot ${slots[0]}`
    : `Entidade ${nome}, encaixada nos slots ${slots.join(', ')}`);
}

/** O nome curto de um uri: `armas/espada.bone` vira `espada`. */
function shortName(uri: string): string {
  return uri.split(/[\\/]/).pop()?.replace(/\.(bone|boneb|bonez)$/i, '') ?? uri;
}

/**
 * A matriz em que a raiz da entidade se apoia dentro da base de onde ela saiu
 * — a mesma conta do runtime (spec 7.11): `M_slotBone × T R S` do anexo. Lida
 * a cada pose, do documento que segura a base AGORA (a troca de foco troca o
 * conteúdo dos objetos, não o uri). Sem o anexo à vista naquele instante, o
 * osso do slot.
 */
function anchorFor(projeto: Projeto, hostUri: string, slot: string): () => Matrix2x3 | null {
  return () => {
    const live = projeto.docOf(hostUri)?.skeleton?.findSlot(slot) ?? null;
    if (live === null) return null;
    const anexo = live.attachment as { type?: string; computeParentMatrix?: (m: Matrix2x3) => Matrix2x3 } | null;
    const osso = live.boneMatrix;
    if (anexo?.type === 'skeleton' && typeof anexo.computeParentMatrix === 'function') {
      return anexo.computeParentMatrix(osso);
    }
    return { a: osso.a, b: osso.b, c: osso.c, d: osso.d, worldX: osso.worldX, worldY: osso.worldY };
  };
}

/**
 * **Clicar numa animação da entidade** — rodada 8b, C10.
 *
 * O Humberto: *"base ou entidade depende de onde eu estou"*. Animando o herói,
 * a espada é entidade; clicando numa animação da espada, **a espada passa a
 * ser a base**, e o herói em volta é só o que se vê. Por dentro:
 *
 *   1. o `Doc` da espada nasce do texto guardado ao abrir (`entity-files`), ou
 *      é o que já estava em Bases ou guardado;
 *   2. ele é preso à mão do herói (`setAnchor`): a cena, o clique e o arrasto
 *      falam do mundo que se vê;
 *   3. ele entra em Bases (Promover), o foco troca (`trocarFoco`), a animação
 *      abre; o projeto anota a cena montada, e a cena desenha o herói parado
 *      em volta, sem o slot da espada.
 *
 * O que se mexe vai para o arquivo da espada. Voltar: clicar numa animação do
 * herói (`returnToHost`).
 */
export function openEntityAnimation(doc: EditorDoc, uri: string, animation: string | null): boolean {
  const projeto = projetoDe(doc);
  const nome = shortName(uri);
  if (projeto === null || !(doc instanceof Doc)) {
    doc.notice(`Animar ${nome} por dentro precisa de um projeto aberto`);
    return false;
  }
  const atual = projeto.cenaMontada;
  if (atual !== null && atual.entity === uri && projeto.emFocoUri === uri) {
    abrirAnimacaoOuBase(doc, animation);
    doc.notice(animation === null ? `A base de ${nome}, por dentro` : `Animando ${nome} por dentro: ${animation}`);
    return true;
  }
  if (atual !== null) returnToHost(doc, null);
  const hostUri = projeto.emFocoUri;
  const host = projeto.nameOf(hostUri);
  const slot = listEntityBases(doc).find((row) => row.uri === uri)?.slots[0];
  if (slot === undefined) {
    doc.notice(`${nome} não está encaixada em ${host}`);
    return false;
  }
  let entidade = projeto.docOf(uri) ?? projeto.guardados.get(uri) ?? null;
  if (entidade === null) {
    const texto = entityFileText(uri);
    if (texto === null) {
      doc.notice(`O editor não abriu o arquivo ${uri}: dá para escolher o que ${nome} toca `
        + '(botão direito na faixa), mas não para animá-la por dentro. Abra a pasta do projeto');
      return false;
    }
    entidade = new Doc(parseBoneText(texto) as BoneFile, {
      atlases: doc.atlases, images: doc.pageImages, skeletons: doc.skeletons, path: uri, undo: projeto.undo,
    });
  }
  if (animation !== null && entidade.file.animations?.some((a) => a.name === animation) !== true) {
    doc.notice(`${nome} não tem a animação ${animation}`);
    return false;
  }
  entidade.setAnchor(anchorFor(projeto, hostUri, slot));
  const promoted = !projeto.corpos.has(uri);
  if (promoted) projeto.promover(uri, entidade);
  projeto.cenaMontada = { host: hostUri, slot, entity: uri, promoted };
  projeto.trocarFoco(uri);
  abrirAnimacaoOuBase(doc, animation);
  doc.notice(`${animation === null ? `A base de ${nome}, por dentro` : `Animando ${nome} por dentro: ${animation}`}. `
    + `${host} fica à vista, parado. Para voltar: clique numa animação de ${host}`);
  return true;
}

/** Rodada 9: `null` abre a base (o slot marcado nasce sem animação). */
function abrirAnimacaoOuBase(doc: EditorDoc, animation: string | null): void {
  if (animation !== null) openAnimation(doc, animation);
  else if (doc.animation !== null) switchAnimation(doc, null);
}

/**
 * **Voltar à base de onde a entidade saiu** — rodada 8b, C10.
 *
 * A espada volta a ser entidade, dirigida pela faixa: o foco volta ao herói,
 * a âncora sai, o herói passa a desenhar a espada com o que se mexeu nela, e,
 * se foi a abertura que a pôs em Bases, ela volta para Entidades (Rebaixar).
 * `animation` abre essa animação do herói; `null` deixa a que estava.
 */
export function returnToHost(doc: EditorDoc, animation: string | null): boolean {
  const projeto = projetoDe(doc);
  const cena = projeto?.cenaMontada ?? null;
  if (projeto === null || cena === null || !(doc instanceof Doc)) return false;
  projeto.cenaMontada = null;
  if (projeto.emFocoUri !== cena.host) projeto.trocarFoco(cena.host);
  const entidade = projeto.docOf(cena.entity) ?? projeto.guardados.get(cena.entity) ?? null;
  entidade?.setAnchor(null);
  if (entidade !== null && entidade.data !== null) doc.replaceNested(cena.entity, entidade.data);
  // Mexida e não salva, ela FICA em Bases: é lá que o Salvar a enxerga e o
  // título diz que há trabalho a gravar. Devolvê-la a Entidades calada
  // deixaria o trabalho só na memória, com o título dizendo "salvo" (regra 21).
  const mexida = entidade?.dirtyOwn === true;
  if (cena.promoted && !mexida) projeto.rebaixar(cena.entity);
  if (animation !== null) openAnimation(doc, animation);
  const nome = shortName(cena.entity);
  doc.notice(mexida
    ? `${nome} voltou a ser entidade em ${projeto.nameOf(cena.host)}, dirigida pela faixa. `
      + `O que você mexeu nela ainda não foi salvo: ${nome} fica em Bases até o Salvar`
    : `${nome} voltou a ser entidade em ${projeto.nameOf(cena.host)}, dirigida pela faixa`);
  return true;
}

/** A dica do Salvar como base nova — M9, degrau 5. Mora aqui desde a rodada 6. */
export const BASE_NOVA_DICA = 'Salvar como base nova: cria uma base nova com a pose deste instante '
  + 'gravada como base. A animação de onde ele saiu não muda';

/** Por que não dá para salvar uma base nova agora, ou `null`. */
export function whyNoNewBase(doc: EditorDoc): string | null {
  return projetoDe(doc) === null || !(doc instanceof Doc)
    ? 'Salvar como base nova precisa de um projeto aberto (Arquivo → Abrir pasta do projeto…)'
    : null;
}

/**
 * **Salvar como base nova…**, com a pergunta do nome — o botão da janela
 * Animação e o menu Base (rodada 6). O nome de fábrica é o do corpo do
 * instante com o segundo no fim: *"o homem em 0,50 s"*.
 */
export async function askNewBase(doc: EditorDoc): Promise<string | null> {
  const atual = listBodies(doc).find((row) => row.focused)?.name ?? 'corpo';
  const sugerido = `${atual} ${doc.time.toFixed(2).replace('.', ',')}`;
  // A janela da casa, e não a do navegador — K14.
  const answer = await askForm({
    title: 'Salvar como base nova',
    lead: `${BASE_NOVA_DICA}.`,
    fields: [{ id: 'nome', label: 'Nome da base nova', value: sugerido }],
    yesLabel: 'Criar a base',
    noLabel: 'Desistir',
  });
  const wanted = answer?.['nome'] ?? '';
  if (answer === null || wanted.trim() === '') return null;
  return saveAsNewBase(doc, wanted);
}

/** Os corpos que se podem rebaixar: todos menos o que está em foco. */
function demotable(doc: EditorDoc): Array<{ uri: string; name: string }> {
  return listBodies(doc).filter((row) => !row.focused);
}

/** Por que o Rebaixar do menu está cinza. */
export const DEMOTE_WHY = 'Só há a base em foco: ela não se rebaixa. Outra base precisa estar na lista';

/** **Entidades → Rebaixar a entidade**: pergunta qual base, se houver mais de uma. */
export async function askDemoteBody(doc: EditorDoc): Promise<boolean> {
  const rows = demotable(doc);
  if (rows.length === 0) { doc.notice(DEMOTE_WHY); return false; }
  let uri = rows[0]!.uri;
  if (rows.length > 1) {
    const id = await askPick({
      title: 'Rebaixar a entidade',
      placeholder: 'Qual base vira entidade?',
      search: (text) => rows
        .filter((row) => row.name.toLowerCase().includes(String(text).trim().toLowerCase()))
        .map((row) => ({ id: row.uri, label: row.name, hint: row.uri })),
    });
    if (id === null) return false;
    uri = id;
  }
  return demoteBody(doc, uri);
}

/** Por que não há troca de base a tirar aqui, ou `null`. */
export function whyNoBodySwap(doc: EditorDoc): string | null {
  if (doc.animation === null) return 'Abra uma animação primeiro';
  const t = roundTime(doc.time);
  return bodyKeys(doc.file, doc.animation).some((key) => sameTime(key.time, t))
    ? null
    : 'Não há troca de base neste quadro: ponha a agulha na chave da troca (a linha "Base" da folha)';
}

/**
 * **Animação → Troca de base → Tirar a troca daqui** — rodada 6. O
 * `removeBodyKey` já saía pelo Delete e pelo duplo clique da folha; o menu
 * é a porta que se vê.
 */
export function takeOutBodySwap(doc: EditorDoc): boolean {
  const why = whyNoBodySwap(doc);
  if (why !== null || doc.animation === null) { doc.notice(why ?? ''); return false; }
  const time = doc.time;
  const t = roundTime(time);
  const key = bodyKeys(doc.file, doc.animation).find((k) => sameTime(k.time, t));
  doc.run(new EditKeys(doc.animation, 'Tirar a troca de base', (file, name) => {
    removeBodyKey(file, name, time);
  }));
  const projeto = projetoDe(doc);
  doc.notice(bodyKeyRemovedNotice(key?.value ?? null, t, (uri) => projeto?.nameOf(uri) ?? uri));
  return true;
}

/**
 * **Salvar como base nova** — 5.2, M9.
 *
 * O corpo novo é a cópia do corpo do instante com a pose de `doc.time` gravada
 * como base (`bakeBaseAt`). Ele entra em **Corpos** com o nome pedido, e a
 * animação de origem não muda uma vírgula.
 *
 * **Não é passo de desfazer**, e o rodapé não finge que é: um corpo novo não é
 * uma mexida num arquivo, é um arquivo a mais no projeto — como Abrir. Quem se
 * arrependeu o rebaixa a entidade, e o arquivo continua inteiro (regra 21: o
 * programa diz o que fez, e o que não fez).
 */
export function saveAsNewBase(doc: EditorDoc, nome: string): string | null {
  const projeto = projetoDe(doc);
  if (projeto === null || !(doc instanceof Doc)) {
    doc.notice('Salvar como base nova precisa de um projeto aberto (Arquivo → Abrir pasta do projeto…)');
    return null;
  }
  const limpo = nome.trim();
  if (limpo === '') return null;
  const uri = bodyUriFor(limpo, [...projeto.corpos.keys(), ...projeto.entidades]);
  const file = bakeBaseAt(doc, limpo);
  const novo = new Doc(file, {
    atlases: doc.atlases,
    images: doc.pageImages,
    skeletons: doc.skeletons,
    path: uri,
    undo: projeto.undo,
  });
  if (!projeto.adicionarCorpo(uri, novo)) {
    doc.notice(`Já existe uma base chamada ${uri}`);
    return null;
  }
  doc.notice(newBaseNotice(limpo, doc.time, (file.animations ?? []).length));
  return uri;
}

/** **Rebaixar** um corpo a entidade — 5.3, E2. O rodapé diz o que houve. */
export function demoteBody(doc: EditorDoc, uri: string): boolean {
  const projeto = projetoDe(doc);
  if (projeto === null) {
    doc.notice('Não há projeto: este arquivo é a única base');
    return false;
  }
  const nome = projeto.nameOf(uri);
  switch (projeto.rebaixar(uri)) {
    case 'feito':
      doc.notice(`${nome} virou entidade. Ela sai de Bases e entra no painel Entidades`);
      return true;
    case 'e-o-foco':
      doc.notice(`${nome} é a base em foco: abra outra base antes de rebaixar esta`);
      return false;
    case 'ultimo':
      doc.notice(`${nome} é a única base do projeto: um projeto sem base não abre`);
      return false;
    default:
      doc.notice(`${nome} não está na lista Bases`);
      return false;
  }
}

/**
 * **Promover** uma entidade a corpo — 5.3, E2 e E3. `lido` é o `.bone` que
 * quem chamou conseguiu ler da pasta; sem ele vale o que estiver guardado.
 *
 * Sem arquivo nenhum a promoção **não acontece**, e o rodapé diz por quê: uma
 * entidade que veio montada dentro de outro `.bone` é um esqueleto pronto, não
 * um arquivo que se possa abrir e editar (regra 21).
 */
export function promoteEntity(doc: EditorDoc, uri: string, lido?: Doc): boolean {
  const projeto = projetoDe(doc);
  if (projeto === null) {
    doc.notice('Não há projeto aberto para receber a base');
    return false;
  }
  switch (projeto.promover(uri, lido)) {
    case 'feito':
      doc.notice(`${projeto.nameOf(uri)} entrou em Bases. Clique nela na janela Animação para abri-la`);
      return true;
    case 'ja-e-corpo':
      doc.notice(`${projeto.nameOf(uri)} já está em Bases`);
      return false;
    default:
      doc.notice(`Não dá para promover ${uri}: o arquivo dele não está aberto. `
        + 'Arquivo → Abrir pasta do projeto… traz as bases da pasta do projeto');
      return false;
  }
}

/**
 * **Biblioteca de animações…** (lote 2): as quatro de fábrica — parado, andar,
 * correr e pular —, gravadas contra a convenção `humanoide-v1`.
 *
 * É a porta que o Spine tem (`File → Import → Project`, com *Animation*) e que
 * nem o Spriter nem o DragonBones têm. O que a janela mostra ANTES de trazer é
 * nosso, e é a regra 21: os nomes que este corpo não tem, por extenso, e o
 * fator de tamanho como número.
 *
 * Trazer é **gravar o arquivo ao lado do projeto e citar o nome dele**: o
 * `assets.animations` é relativo ao `.bone` (2.8), e um uri apontando para
 * dentro do editor não existe na máquina de quem for rodar o jogo.
 */
export async function openAnimationLibrary(
  doc: EditorDoc,
  ask: (host: BoneFile) => Promise<LibraryPick | null> = (host) => animationLibraryWindow(host),
): Promise<string | null> {
  const escolhido = await ask(doc.file);
  if (escolhido === null) {
    doc.notice('Nada veio da biblioteca: esta base não mudou');
    return null;
  }
  const falta = unmetRig(doc.file, escolhido.entry.file);
  doc.run(new ImportAnimationFile(escolhido.savedAs));
  rememberAnimationNames(escolhido.savedAs, escolhido.entry.animations);
  // Reaproveitar (04/11/2026): o editor guarda o arquivo gravado, e as quatro
  // TOCAM aqui (doc/shared-animations.ts). Antes só o nome entrava.
  rememberSharedFile(escolhido.savedAs, escolhido.entry.file);
  doc.rebuild();
  doc.notice(libraryNotice(escolhido, falta));
  return escolhido.savedAs;
}

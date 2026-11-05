/**
 * Nova pele, sem precisar da aba Peles montada — lote A2 (v10.5).
 *
 * A conta é `AddSkin` e a pele editável da cena; nada aqui lê o DOM da aba.
 * O item do menu traz a aba à frente antes de criar, como sempre.
 *
 * **Degrau 9** (18/09/2026): entraram as três portas que faltavam — Exportar
 * pele…, Importar pele… e Promover pele a base. As três são do painel Peles e
 * do menu Esqueleto, e as três chamam a MESMA função (regra 5 da casa).
 */

import type { ChangeKind, Command, EditorDoc } from '../contract.js';
import { corpoDe, uniqueName } from '../contract.js';
import { registerAction, runAction } from '../ui/actions.js';
import {
  editingSkinOf, setEditingSkin, setSkinStack, skinStackOf,
} from '../viewport/onion.js';
import { AddSkin } from './tree-model.js';
import {
  NO_SKIN_FOR_VERDICT, SetSkinVerdict, bakeSkinBase, pairsOfSelection, promoteSkinNotice, skinVerdict,
  stackRemove, verdictNotice, type SkinPair,
} from './skins-model.js';
import {
  ImportSkinCopy, buildSkinFile, importSkinCopyNotice, looseImagesIn, putBoneFile, skinFileNotice, unmetRig,
} from '../io/export-skin.js';
import { provisionalNames } from '../io/folder-atlas.js';
import { askForm, askPick } from '../ui/dialog.js';
import { skinsPanel } from './skins.js';
import { RestoreBoneInSkin } from './skins-delete.js';
import { Doc } from '../doc/document.js';
import { projetoDe } from '../doc/projeto.js';
import { openAnotherSkeleton } from '../io/open-save.js';
import { bodyUriFor } from './animations-model.js';
import type { BoneFile } from '../../../runtime/src/index.js';
import { takePickerProblem } from '../io/picker-problem.js';
// Noite de 04/11: a grade peça × skin.
import { openWardrobe } from './skins-wardrobe.js';

/** A pilha e o lápis de um instante: o que a aba Peles mostra. */
export interface SkinView {
  readonly pilha: readonly string[];
  readonly lapis: string | null;
}

function skinViewOf(doc: EditorDoc): SkinView {
  return { pilha: skinStackOf(doc), lapis: editingSkinOf(doc) };
}

/**
 * Grava a pilha e o lápis SEM repor o esqueleto. Dentro de um comando o
 * arquivo já mudou e o esqueleto ainda é o de antes: repor ali mandaria ao
 * runtime uma pele que ele não conhece (ou uma que ele ainda tem). O rebuild
 * que vem depois do comando aplica a pilha nova.
 */
function putSkinView(doc: EditorDoc, view: SkinView): void {
  const holder = doc as EditorDoc & { pilha?: string[]; emEdicao?: string | null };
  if (Array.isArray(holder.pilha)) {
    holder.pilha = [...view.pilha];
    holder.emEdicao = view.lapis;
    return;
  }
  // Um documento de teste com a vista velha: o caminho de sempre.
  setSkinStack(doc, view.pilha);
  setEditingSkin(doc, view.lapis);
}

/** Veste a pele e põe o lápis nela: no topo da pilha, se ainda não estava. */
/** A pele no topo da pilha, sem mexer no lápis — rodada 44, lote 6 (Importar). */
export function wearOnTop(name: string): (view: SkinView) => SkinView {
  return (view) => ({ pilha: [...view.pilha.filter((n) => n !== name), name], lapis: view.lapis });
}

export function wearSkin(name: string): (view: SkinView) => SkinView {
  return (view) => ({
    pilha: view.pilha.includes(name) ? [...view.pilha] : [...view.pilha, name],
    lapis: name,
  });
}

/** Tira a pele da pilha, e o lápis dela. */
export function dropSkin(name: string): (view: SkinView) => SkinView {
  return (view) => ({
    pilha: view.pilha.filter((n) => n !== name),
    lapis: view.lapis === name ? null : view.lapis,
  });
}

/** O nome novo no lugar do velho, na pilha e no lápis. */
export function renameInView(from: string, to: string): (view: SkinView) => SkinView {
  return (view) => ({
    pilha: view.pilha.map((n) => (n === from ? to : n)),
    lapis: view.lapis === from ? to : view.lapis,
  });
}

/**
 * **O desfazer leva a pilha junto** — I5 e M1, chat I, 29/09/2026.
 *
 * A pele mora no arquivo; a pilha e o lápis moram no documento. Criar,
 * duplicar, apagar e renomear mexiam nos dois, mas só o arquivo entrava no
 * passo de desfazer, e a pilha era arrumada DEPOIS do rebuild: `Ctrl+Z` numa
 * "Nova pele" tirava a pele e deixava o lápis e a pilha apontando para ela; e
 * renomear acendia *"a pele "pele" está ligada e este corpo não a tem"*, com o
 * nome velho, porque o rebuild via a pilha antes de ela ser arrumada. Os dois
 * avisos nasciam do próprio gesto. A forma é a do P11: *o desfazer devolve o
 * valor e não o lugar.*
 *
 * Este comando embrulha o de verdade. `then` é uma conta pura: a pilha e o
 * lápis de depois, a partir dos de antes. `apply` grava a de depois antes do
 * rebuild, `revert` grava a de antes — e o rebuild de cada um já nasce certo.
 */
export class KeepSkinStack implements Command {
  readonly label: string;
  readonly kind: ChangeKind;
  private before: SkinView | null = null;
  private after: SkinView | null = null;

  constructor(
    private readonly inner: Command,
    private readonly then: (view: SkinView) => SkinView,
  ) {
    this.label = inner.label;
    this.kind = inner.kind;
  }

  apply(doc: EditorDoc): void {
    const agora = skinViewOf(doc);
    if (this.before === null) this.before = agora;
    this.inner.apply(doc);
    if (this.after === null) this.after = this.then(agora);
    putSkinView(doc, this.after);
  }

  revert(doc: EditorDoc): void {
    this.inner.revert(doc);
    if (this.before !== null) putSkinView(doc, this.before);
  }
}

/**
 * **Ligar e desligar uma pele é um passo do Desfazer** — rodada 17, achado da
 * conferência da fila (05/10/2026).
 *
 * O × da pilha gravava a pilha nova direto, fora da pilha de desfazer: depois
 * de tirar a `default`, o `Ctrl+Z` desfazia o passo de ANTES (*"Desfeito:
 * Mudar Ângulo"*) e a pele continuava desligada. Quem desliga por engano 23
 * desenhos tem de poder voltar com a mesma tecla de sempre.
 *
 * O arquivo não muda: muda a pilha, que mora no documento. O passo é
 * `structure` porque o desenho muda (o rebuild aplica a pilha nova e tira da
 * seleção o osso que só existia na pele que saiu).
 */
export class ChangeSkinStack implements Command {
  readonly kind: ChangeKind = 'structure';
  private before: SkinView | null = null;
  private after: SkinView | null = null;

  constructor(
    readonly label: string,
    private readonly then: (view: SkinView) => SkinView,
  ) {}

  apply(doc: EditorDoc): void {
    const agora = skinViewOf(doc);
    if (this.before === null) this.before = agora;
    if (this.after === null) this.after = this.then(agora);
    putSkinView(doc, this.after);
  }

  revert(doc: EditorDoc): void {
    if (this.before !== null) putSkinView(doc, this.before);
  }
}

/** Tira a pele da pilha (o × da coluna Ativas), num passo do Desfazer. */
export function takeOffSkin(doc: EditorDoc, name: string): void {
  doc.run(new ChangeSkinStack(`Desligar a skin "${name}"`, dropSkin(name)));
}

/** Grava a pilha nova (soltar na coluna Ativas), num passo do Desfazer. O lápis fica. */
export function putSkinStack(doc: EditorDoc, stack: readonly string[], label: string): void {
  doc.run(new ChangeSkinStack(label, (view) => ({ pilha: [...stack], lapis: view.lapis })));
}

/**
 * Pele nova. Ela já nasce sendo a editável: quem acabou de criar uma roupa vai
 * pôr desenho nela, e não na de antes.
 *
 * O rodapé diz o passo seguinte (I7): o gesto que põe um desenho na pele do
 * lápis é arrastar uma imagem da aba Imagens para a cena (`skinForNew`, em
 * `palette-model.ts`). A troca de imagem de um desenho que já existe ainda
 * não vai para o lápis — é do chat H, decisão P27.
 */
export function addSkin(doc: EditorDoc): string {
  const command = new AddSkin(doc.file);
  doc.run(new KeepSkinStack(command, wearSkin(command.name)));
  doc.notice(newSkinNotice(command.name));
  // Rodada 44, lote 4: quem chamou pede o nome na hora.
  return command.name;
}

/**
 * **A skin nova com o nome escolhido** — rodada 44, doc 67. A skin nascia
 * "skin" e o nome vinha depois, numa janela que, fechada no Esc, deixava a
 * skin criada. Agora o nome vem ANTES: Esc não cria nada.
 */
export class AddNamedSkin implements Command {
  readonly label = 'Nova skin';
  readonly kind: ChangeKind = 'structure';
  readonly name: string;
  private created = false;

  constructor(file: BoneFile, wanted: string) {
    const limpo = wanted.trim();
    this.name = uniqueName(limpo === '' ? 'skin' : limpo, (file.skins ?? []).map((s) => s.name));
  }

  apply(doc: EditorDoc): void {
    this.created = doc.file.skins === undefined;
    const list = doc.file.skins ?? (doc.file.skins = []);
    list.push({ name: this.name, attachments: {} });
  }

  revert(doc: EditorDoc): void {
    const list = doc.file.skins ?? [];
    const at = list.findIndex((s) => s.name === this.name);
    if (at >= 0) list.splice(at, 1);
    if (this.created && list.length === 0) delete doc.file.skins;
  }
}

/** O nome proposto na janela da skin nova: `skin`, `skin2`… */
export function proposedSkinName(file: BoneFile): string {
  return uniqueName('skin', (file.skins ?? []).map((s) => s.name));
}

/** Cria a skin com o nome escolhido, com o lápis nela, e diz. */
export function addSkinNamed(doc: EditorDoc, wanted: string): string {
  const command = new AddNamedSkin(doc.file, wanted);
  doc.run(new KeepSkinStack(command, wearSkin(command.name)));
  doc.notice(newSkinNotice(command.name));
  return command.name;
}

/**
 * **O passo seguinte na aba Peles** — I7. A pele do lápis sem desenho nenhum
 * ganha uma frase com o gesto; com um desenho, ou com o lápis na `default`,
 * nada (`null`).
 */
export function emptySkinHint(
  rows: ReadonlyArray<{ readonly name: string; readonly editable: boolean; readonly slots: number }>,
): string | null {
  const lapis = rows.find((row) => row.editable);
  if (lapis === undefined || lapis.name === 'default' || lapis.slots > 0) return null;
  // Noite de 04/11 (diagnóstico T1): "arrastar para a cena" CRIA peça nova;
  // quem fez uma roupa quer TROCAR as que existem. A frase aponta a grade.
  return `A skin "${lapis.name}" está vazia. Abra o Guarda-roupa e clique numa peça na coluna dela para trocar a imagem`;
}

/** A frase de "Nova pele": o que aconteceu, e o passo seguinte. */
export function newSkinNotice(name: string): string {
  return `Skin "${name}" criada, com o lápis nela. Agora troque as peças: Skins → Guarda-roupa, clique na casa da peça`;
}

/** A pele em que as três ações agem: a do lápis, ou a de cima da pilha. */
export function currentSkin(doc: EditorDoc): string | null {
  const lapis = editingSkinOf(doc);
  if (lapis !== null) return lapis;
  const pilha = skinStackOf(doc).filter((name) => name !== 'default');
  return pilha[pilha.length - 1] ?? null;
}

/**
 * **Exportar pele…** (I12): a pele num `.bone` com `rig`, para entrar noutro
 * corpo por `assets.skins`.
 *
 * Não é o "Exportar por pele…", que fatia o corpo inteiro. Aqui sai só a
 * roupa, com os ossos e slots que ela traz — o rabo do lobisomem vai junto.
 */
export async function exportSkin(doc: EditorDoc): Promise<string | null> {
  const nome = currentSkin(doc);
  if (nome === null || nome === 'default') {
    doc.notice('Escolha a skin a exportar: acenda o lápis nela, na aba Skins');
    return null;
  }
  const saida = buildSkinFile(doc.file, nome);
  if (saida === null) {
    doc.notice(`A skin "${nome}" não existe nesta base`);
    return null;
  }
  const escrito = await putBoneFile(`${nome}.bone`, JSON.stringify(saida.file, null, 2));
  if (escrito === null) {
    // Rodada 23, defeito 8: fechado ou bloqueado, o rodapé diz.
    const problema = takePickerProblem();
    if (problema !== null) doc.notice(problema);
    return null;
  }
  // Rodada 44, lote 5: e quantas imagens soltas ficaram de fora.
  doc.notice(skinFileNotice(nome, saida.report, looseImagesIn(saida.file, provisionalNames(doc))));
  return escrito;
}

/**
 * **Importar pele…** (F23): o uri do arquivo entra em `assets.skins`, e a pele
 * de fora aparece na lista de Feitas como as outras — com os ossos que ela
 * traz, que é a resposta Q40 do Humberto.
 *
 * `pick` é quem escolhe o arquivo; o painel passa o seletor de verdade, e o
 * teste passa um que devolve um arquivo de mentira, sem DOM.
 */
export async function importSkin(
  doc: EditorDoc,
  pick: () => Promise<{ uri: string; file: BoneFile } | null>,
): Promise<string | null> {
  const escolhido = await pick();
  if (escolhido === null) return null;
  const nomes = (escolhido.file.skins ?? []).map((skin) => skin.name);
  if (nomes.length === 0) {
    // Regra 21: um `.bone` sem pele nenhuma não é uma pele. Dizer isso é mais
    // barato que deixar a lista de Feitas igual e a pessoa procurar o erro.
    doc.notice(`${escolhido.uri} não tem skin nenhuma: não é um arquivo de skin`);
    return null;
  }
  // M17: se todas as peles do arquivo já existem aqui, não há o que entrar —
  // e a cópia diria "entrou" sem nada ter entrado.
  const daqui = new Set((doc.file.skins ?? []).map((skin) => skin.name));
  const repetidas = nomes.filter((nome) => daqui.has(nome));
  if (repetidas.length === nomes.length) {
    doc.notice(`${escolhido.uri}: ${repetidas.length === 1 ? `a skin "${repetidas[0]!}" já existe` : `as skins ${repetidas.join(', ')} já existem`} nesta base. `
      + 'Apague ou renomeie a daqui, e importe de novo. Nada mudou');
    return null;
  }
  const falta = unmetRig(doc.file, escolhido.file);
  const copia = new ImportSkinCopy(escolhido.uri, escolhido.file);
  // Rodada 44, lote 6 (doc 71): importar VESTE — a skin entra no topo da
  // pilha, no mesmo passo de desfazer. Ela ia só para Feitas, e quem importou
  // não via nada mudar. O lápis fica onde estava.
  const nova = nomes.find((nome) => !daqui.has(nome));
  doc.run(nova === undefined ? copia : new KeepSkinStack(copia, wearOnTop(nova)));
  doc.notice(importSkinCopyNotice(escolhido.uri, copia, falta));
  return escolhido.uri;
}

/** O que o rodapé diz ANTES do seletor abrir — M11 (P-decisão do Planejador). */
export const IMPORT_SKIN_ASK = 'Escolha o arquivo da skin. Ela entra com os ossos dela';

/**
 * **Importar pele… pelo seletor de arquivo** — M11, chat I, 29/09/2026.
 *
 * O chat M achou: *"o seletor abre, e depois nada: a pele não volta e o rodapé
 * fica mudo"*. Um seletor que abre sem dizer para quê, e fecha sem dizer o que
 * houve, é "fez e não avisou". Agora o rodapé fala três vezes: antes de abrir
 * (o que escolher), depois (qual pele entrou, pela frase de `importSkin`), e
 * se ninguém escolheu nada ("Nada mudou") — ou se o seletor falhou, com o
 * motivo. O botão da aba e o item do menu chamam esta mesma função (regra 5).
 */
export async function importSkinFromDisk(
  doc: EditorDoc,
  open: typeof openAnotherSkeleton = openAnotherSkeleton,
): Promise<string | null> {
  doc.notice(IMPORT_SKIN_ASK);
  let escolheu = false;
  try {
    const uri = await importSkin(doc, async () => {
      const aberto = await open();
      if (aberto === null) return null;
      escolheu = true;
      return { uri: aberto.path, file: aberto.file };
    });
    if (!escolheu) doc.notice('Nenhum arquivo escolhido. Nada mudou');
    return uri;
  } catch (erro) {
    doc.notice(`Importar skin parou: ${erro instanceof Error ? erro.message : String(erro)}`);
    return null;
  }
}

/**
 * **Promover pele → base** (I13, F25): um corpo novo, com a pilha assada.
 *
 * 🗣️ *"Lobisomem: os dois."* — Q38. O corpo novo entra em **Corpos** e passa a
 * ter animações próprias; o corpo de origem não muda uma vírgula.
 *
 * **Não é passo de desfazer**, e o rodapé não finge que é: um corpo novo é um
 * arquivo a mais no projeto, como Abrir. Quem se arrependeu o rebaixa a
 * entidade — é a mesma regra do "Salvar como base nova" (degrau 5).
 */
export async function promoteSkinToBase(doc: EditorDoc): Promise<string | null> {
  const projeto = projetoDe(doc);
  if (projeto === null || !(doc instanceof Doc)) {
    doc.notice('Promover skin a base precisa de um projeto aberto (Arquivo → Abrir pasta do projeto…)');
    return null;
  }
  const pilha = skinStackOf(doc).filter((name) => name !== 'default');
  if (pilha.length === 0) {
    doc.notice('Ligue a skin que vai virar base: arraste-a para Ativas, na aba Skins');
    return null;
  }
  const sugerido = pilha[pilha.length - 1]!;
  const resposta = await askForm({
    title: 'Promover skin a base',
    lead: `A pilha de agora (${skinStackOf(doc).join(' + ')}) vira a base de uma base nova. `
      + 'Os ossos e as regras que só existiam com essas skins passam a ser da base. '
      + 'Esta base não muda.',
    fields: [{ id: 'nome', label: 'Nome da base', value: sugerido }],
    yesLabel: 'Criar a base',
  });
  const nome = resposta?.['nome']?.trim() ?? '';
  if (nome === '') return null;

  const uri = bodyUriFor(nome, [...projeto.corpos.keys(), ...projeto.entidades]);
  const file = bakeSkinBase(doc.file, skinStackOf(doc), nome);
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
  doc.notice(promoteSkinNotice(nome, pilha));
  return uri;
}

/** Desliga a pele e tira o lápis dela: o gesto que o `×` de Ativas faz. */
export function turnSkinOff(doc: EditorDoc, name: string): void {
  takeOffSkin(doc, name);
}

// ---------------------------------------------------------------------------
// Esconder e Ignorar nesta pele — rodada 12, S3 e S4
// ---------------------------------------------------------------------------

/**
 * A pele em que Esconder e Ignorar gravam: a do lápis, e nunca a `default` — a
 * `default` é a base, e esconder na base é apagar, que já tem a sua porta.
 * `null` quando não há uma assim.
 */
export function verdictSkin(doc: EditorDoc): string | null {
  const lapis = editingSkinOf(doc);
  if (lapis === null || lapis === 'default') return null;
  return (corpoDe(doc).file.skins ?? []).some((skin) => skin.name === lapis) ? lapis : null;
}

/** Se Esconder ou Ignorar têm o que fazer com a seleção de agora. */
export function canSetVerdict(doc: EditorDoc): boolean {
  return verdictSkin(doc) !== null && pairsOfSelection(corpoDe(doc).file, doc.selection).length > 0;
}

/**
 * **Esconder** ou **Ignorar** os desenhos `pairs` na pele `skin` — o botão da
 * linha da aba Peles, a grade do botão direito e o menu chamam esta (regra 5).
 * Nada a mudar não vira passo de desfazer: o rodapé diz que nada mudou.
 */
export function setVerdict(
  doc: EditorDoc, skin: string, pairs: readonly SkinPair[], to: 'esconde' | 'ignora',
): void {
  const corpo = corpoDe(doc);
  const mudam = pairs.filter((p) => skinVerdict(corpo.file, skin, p.slot, p.attachment) !== to).length;
  if (mudam > 0) corpo.run(new SetSkinVerdict(skin, pairs, to));
  doc.notice(verdictNotice(skin, pairs, to, mudam));
}

/** O mesmo, para o que está escolhido, na pele do lápis. */
export function setVerdictOnSelection(doc: EditorDoc, to: 'esconde' | 'ignora'): void {
  const skin = verdictSkin(doc);
  if (skin === null) {
    doc.notice(NO_SKIN_FOR_VERDICT);
    return;
  }
  const pairs = pairsOfSelection(corpoDe(doc).file, doc.selection);
  if (pairs.length === 0) {
    doc.notice('Escolha a imagem primeiro: clique nela na cena, ou na Árvore');
    return;
  }
  setVerdict(doc, skin, pairs, to);
}

/**
 * **Devolver o osso** que a skin apagou (S9) — a linha "osso apagado" da aba
 * Peles. O rodapé diz o que voltou.
 */
export function restoreBone(doc: EditorDoc, skin: string, bone: string): void {
  corpoDe(doc).run(new RestoreBoneInSkin(skin, bone));
  doc.notice(`O osso ${bone} voltou à skin "${skin}", com os desenhos dele`);
}

/** Por que "Apagar skin" não age agora, ou `null` — a pele do lápis é a que sai. */
export function whyCannotDeleteSkin(doc: EditorDoc): string | null {
  const lapis = editingSkinOf(doc);
  if (lapis === null) return 'Ponha o lápis na skin que vai sair primeiro (Skins → Editar esta skin…)';
  return lapis === 'default' ? 'A skin "default" não se apaga: ela é a base' : null;
}

/**
 * **Skins → Editar esta skin…** — o lápis da aba, pelo menu (rodada 6). O que
 * se cria daqui em diante é dela: imagens e ossos (decisões, 3.4). A pergunta
 * lista as skins; a primeira linha devolve o lápis à base.
 */
export async function pickEditingSkin(doc: EditorDoc): Promise<void> {
  const nomes = (doc.file.skins ?? []).map((skin) => skin.name).filter((nome) => nome !== 'default');
  if (nomes.length === 0) {
    doc.notice('Não há skin nenhuma além da base: Skins → Nova skin');
    return;
  }
  const agora = editingSkinOf(doc);
  const BASE = '\u0000base';
  const id = await askPick({
    title: 'Editar esta skin',
    placeholder: 'Em qual skin o que eu criar vai nascer?',
    search: (text) => [
      { id: BASE, label: 'A base (nenhuma skin)', hint: 'O lápis sai: o que se cria vai para a base', ...(agora === null ? { aside: 'agora' } : {}) },
      ...nomes.map((nome) => ({ id: nome, label: nome, ...(agora === nome ? { aside: 'agora' } : {}) })),
    ].filter((row) => row.label.toLowerCase().includes(String(text).trim().toLowerCase())),
  });
  if (id === null) return;
  const nome = id === BASE ? null : id;
  setEditingSkin(doc, nome);
  doc.notice(nome === null ? 'O lápis saiu: o que se cria vai para a base' : `O lápis está em "${nome}": o que se cria agora é dela`);
}

/** Registra as ações. Devolve como tirá-las. */
export function registerSkinActions(doc: EditorDoc): Array<() => void> {
  skinsPanel.setMenuDoc(doc);
  return [
    registerAction('nova-pele', {
      run: () => {
        runAction('mostrar-painel-peles');
        // Rodada 44 (doc 67): pelo menu também, o nome ANTES de nascer.
        void skinsPanel.newSkinAsking();
      },
    }),
    // I3 (P23, 29/09/2026): era do painel, e com a aba Peles fechada o item
    // do menu ficava sem ação. O seletor de arquivo não é da aba.
    registerAction('importar-pele', {
      run: () => {
        runAction('mostrar-painel-peles');
        void importSkinFromDisk(doc);
      },
    }),
    registerAction('exportar-pele-arquivo', { run: () => { void exportSkin(doc); } }),
    registerAction('promover-pele-base', { run: () => { void promoteSkinToBase(doc); } }),
    // Rodada 12: os botões Set Hidden e Set Ignored do Spriter.
    registerAction('esconder-na-pele', {
      run: () => setVerdictOnSelection(doc, 'esconde'),
      enabled: () => canSetVerdict(doc),
    }),
    registerAction('ignorar-na-pele', {
      run: () => setVerdictOnSelection(doc, 'ignora'),
      enabled: () => canSetVerdict(doc),
    }),
    // Rodada 6 (05/10/2026): as portas da aba no menu Skins. A mesma conta
    // dos botões; elas agem na skin do lápis, como na aba.
    registerAction('clonar-pele', {
      run: () => { runAction('mostrar-painel-peles'); skinsPanel.duplicateSkin(); },
    }),
    registerAction('pele-de-pasta', {
      run: () => { runAction('mostrar-painel-peles'); void skinsPanel.skinFromFolder(); },
    }),
    registerAction('apagar-pele', {
      run: () => { runAction('mostrar-painel-peles'); void skinsPanel.deleteSkin(); },
      enabled: () => whyCannotDeleteSkin(doc) === null,
      why: () => whyCannotDeleteSkin(doc),
    }),
    registerAction('editar-pele', {
      run: () => { void pickEditingSkin(doc); },
    }),
    // Noite de 04/11/2026: o Guarda-roupa, a grade peça × skin.
    registerAction('guarda-roupa', {
      run: () => { runAction('mostrar-painel-peles'); openWardrobe(doc); },
    }),
  ];
}

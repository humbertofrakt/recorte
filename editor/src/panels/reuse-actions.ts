/**
 * As portas de **reaproveitar animação** — noite de 04/11/2026.
 *
 * | Id | Onde | O que faz |
 * |:---|:---|:---|
 * | `usar-animacoes` | Animação → **Usar animações de outro boneco…**, e o ícone da aba Animações | a janela de `reuse-window.ts` |
 * | `seguir-esqueleto-padrao` | Base → **Seguir o Esqueleto padrão…** | a mesma janela, só com a tabela dos ossos |
 * | `abrir-original` | botão **Abrir o original** na seção Compartilhadas | vai para a base dona, com a animação aberta |
 *
 * E duas coisas que não têm botão porque não são gesto: quem responde, ao vivo,
 * o conteúdo do arquivo de uma base dona (`setSharedSupplier`), e a leitura,
 * da pasta do projeto, dos arquivos citados que o editor ainda não tem.
 */

import type { BoneFile } from '../../../runtime/src/index.js';
import type { EditorDoc } from '../contract.js';
import { registerAction } from '../ui/actions.js';
import { projetoDe } from '../doc/projeto.js';
import {
  composeShared, rememberSharedFile, setSharedSupplier, sharedFileOf, sharedUrisOf,
} from '../doc/shared-animations.js';
import { factoryLibrary } from '../io/animation-library.js';
import { openAnotherSkeleton } from '../io/open-save.js';
import {
  loadSharedFromFolder, ownerOfShared, ownerSharedFile, projectDocs, writeBeside,
} from '../io/shared-save.js';
import { matchBones, renamesFor } from '../anim/bone-match.js';
import {
  baseSource, copyCommand, FileSnapshotCommand, linkCommand, ownAnimationNames, PADRAO_LABEL, PADRAO_URI,
  renameBones, reuseNotice, shareCommand,
} from './reuse-model.js';
import type { ReuseSource } from './reuse-model.js';
import { reuseWindow } from './reuse-window.js';
import type { ReuseChoice } from './reuse-window.js';
import { openAnimation } from './animations-actions.js';

/** O nome deste boneco para as frases: o `skeleton.name`, ou o arquivo. */
function hostName(doc: EditorDoc): string {
  const n = doc.file.skeleton?.name;
  return typeof n === 'string' && n !== '' ? n : (doc.path ?? 'este boneco');
}

/** A fonte "Esqueleto padrão": as quatro de fábrica. */
export function factorySource(): ReuseSource | null {
  const entry = factoryLibrary().find((e) => e.uri === PADRAO_URI);
  if (entry === undefined) return null;
  return { kind: 'padrao', label: PADRAO_LABEL, uri: PADRAO_URI, file: entry.file, animations: entry.animations };
}

/** O texto do arquivo de fábrica, para gravá-lo ao lado do projeto. */
function factoryText(): string | null {
  return factoryLibrary().find((e) => e.uri === PADRAO_URI)?.text ?? null;
}

/** As fontes da janela, para este boneco: o padrão e as outras bases com animação. */
export function reuseSources(doc: EditorDoc): ReuseSource[] {
  const out: ReuseSource[] = [];
  const padrao = factorySource();
  if (padrao !== null) out.push(padrao);
  const projeto = projetoDe(doc);
  if (projeto !== null) {
    for (const [uri, d] of projeto.corpos) {
      if (d === doc || d.file === doc.file) continue;
      const s = baseSource(uri, projeto.nameOf(uri), d.file);
      if (s !== null) out.push(s);
    }
  }
  return out;
}

/** O seletor de arquivo de verdade: um `.bone` com animação. */
async function pickFileSource(doc: EditorDoc): Promise<ReuseSource | null> {
  const aberto = await openAnotherSkeleton();
  if (aberto === null) return null;
  const nomes = ownAnimationNames(aberto.file);
  if (nomes.length === 0) {
    doc.notice(`${aberto.path} não tem animação nenhuma: escolha outro arquivo`);
    return null;
  }
  rememberSharedFile(aberto.path, aberto.file);
  return { kind: 'arquivo', label: aberto.path, uri: aberto.path, file: aberto.file, animations: nomes };
}

/**
 * Aplica o que a janela devolveu. Separado da janela para o teste (regra 8):
 * `write` grava um arquivo ao lado do projeto.
 */
export async function applyReuse(
  doc: EditorDoc, choice: ReuseChoice,
  write: (name: string, text: string) => Promise<string | null> = (n, t) => writeBeside(doc, n, t),
): Promise<boolean> {
  const { names, match, mode } = choice;
  let source = choice.source;
  if (mode === 'copia') {
    const r = copyCommand(doc.file, source, names, match);
    doc.run(r.command);
    // (b) da prova final: a primeira que entrou fica aberta e escolhida na lista.
    if (r.copy.brought.length > 0) openAnimation(doc, r.copy.brought[0]!);
    doc.notice(reuseNotice(source, { ...r.report, brought: r.copy.brought }));
    return true;
  }
  // Ligadas: o arquivo tem de existir ao lado do projeto, com o nome que se cita.
  if (source.kind === 'padrao') {
    const texto = factoryText();
    if (texto === null) { doc.notice('O arquivo do Esqueleto padrão não veio com o programa'); return false; }
    const gravado = await write(PADRAO_URI, texto);
    if (gravado === null) { doc.notice('Nada mudou: o arquivo das animações não foi gravado'); return false; }
    rememberSharedFile(gravado, source.file);
    source = { ...source, uri: gravado };
  } else if (source.kind === 'base' && source.owner !== undefined) {
    const projeto = projetoDe(doc);
    const dona = projeto?.corpos.get(source.owner) ?? null;
    if (dona === null) { doc.notice('A base de lá não está mais no projeto'); return false; }
    // A dona compartilha TODAS as que se escolheu (e as que já compartilhava).
    dona.run(shareCommand(source.uri, names));
    const arquivo = ownerSharedFile(dona.file, source.uri);
    if (arquivo !== null) await write(source.uri, `${JSON.stringify(arquivo, null, 2)}\n`);
  }
  const ligar = { ...source, animations: source.animations.filter((n) => names.includes(n)) };
  const r = linkCommand(doc.file, ligar, match);
  if ('refused' in r) { doc.notice(r.refused); return false; }
  doc.run(r.command);
  // (b): a primeira ligada fica aberta e escolhida, em Compartilhadas.
  const primeira = r.report.brought[0];
  if (primeira !== undefined && doc.data?.findAnimation(primeira)) openAnimation(doc, primeira);
  doc.notice(reuseNotice(ligar, r.report));
  return true;
}

/** **Usar animações de outro boneco…** */
export async function useAnimations(doc: EditorDoc, initial = 0): Promise<boolean> {
  const sources = reuseSources(doc);
  const choice = await reuseWindow({
    host: doc.file, hostName: hostName(doc), sources, initial,
    pickFile: () => pickFileSource(doc),
  });
  if (choice === null) { doc.notice('Nada mudou: nenhuma animação foi usada'); return false; }
  return applyReuse(doc, choice);
}

/** Os ossos do Esqueleto padrão (o `humanoide-v1`), menos a raiz. */
export function standardBones(): string[] {
  return [...STANDARD_BONES];
}

/** A lista do `formato/rigs/humanoide-v1.bone`, `rig.bones` (§4.8, §14.4). */
const STANDARD_BONES = [
  'raiz', 'quadril', 'tronco', 'pescoco', 'cabeca', 'braco_e', 'antebraco_e', 'mao_e', 'braco_d',
  'antebraco_d', 'mao_d', 'coxa_e', 'canela_e', 'pe_e', 'coxa_d', 'canela_d', 'pe_d',
];

/**
 * **Seguir o Esqueleto padrão.** Renomeia os ossos combinados e grava
 * `rig: { name: "humanoide-v1" }` — o §4.8 diz que um `rig` num esqueleto
 * comum é "documentação e dica ao editor": é exatamente isto.
 */
export function followStandardCommand(host: BoneFile, match: ReturnType<typeof matchBones>):
  FileSnapshotCommand | { refused: string } {
  const { renames, conflicts } = renamesFor(match, (host.bones ?? []).map((b) => b.name));
  if (conflicts.length > 0) return { refused: `Já há osso chamado ${conflicts.join(', ')} fora da tabela` };
  return new FileSnapshotCommand(`Seguir o ${PADRAO_LABEL}`, (file) => {
    renameBones(file, renames);
    const nomes = new Set((file.bones ?? []).map((b) => b.name));
    (file as unknown as { rig?: unknown }).rig = {
      name: 'humanoide-v1', bones: STANDARD_BONES.filter((n) => nomes.has(n)),
    };
  });
}

/** Base → **Seguir o Esqueleto padrão…** */
export async function followStandard(doc: EditorDoc): Promise<boolean> {
  const padrao = factorySource();
  if (padrao === null) return false;
  const choice = await reuseWindow({
    host: doc.file, hostName: hostName(doc), sources: [padrao], onlyBones: true, bones: standardBones(),
    pickFile: async () => null,
  });
  if (choice === null) { doc.notice('Nada mudou: os ossos continuam com os nomes de antes'); return false; }
  const c = followStandardCommand(doc.file, choice.match);
  if ('refused' in c) { doc.notice(c.refused); return false; }
  const antes = renamesFor(choice.match, (doc.file.bones ?? []).map((b) => b.name)).renames.length;
  doc.run(c);
  doc.notice(`${hostName(doc)} segue o ${PADRAO_LABEL}: ${antes} ${antes === 1 ? 'osso mudou' : 'ossos mudaram'} de nome; `
    + 'as animações do padrão tocam aqui sem combinar nada');
  return true;
}

/**
 * **Abrir o original**: a base dona da animação vira o foco, com ela aberta.
 * Sem dona no projeto (o arquivo de fábrica, um arquivo solto), diz por quê.
 */
export function openOriginal(doc: EditorDoc, name: string, uri: string): boolean {
  const dona = ownerOfShared(doc, uri);
  const projeto = projetoDe(doc);
  if (dona === null || projeto === null) {
    doc.notice(uri === PADRAO_URI
      ? `"${name}" vem do ${PADRAO_LABEL}, que é do programa; para mudar só neste boneco, use Animações de outro boneco… → Cópia`
      : `"${name}" vem de ${uri}, que não é uma base deste projeto; abra esse arquivo para mudar o original`);
    return false;
  }
  if (projeto.emFocoUri !== dona) projeto.trocarFoco(dona);
  openAnimation(doc, name);
  doc.notice(`O original de "${name}" é a base ${projeto.nameOf(dona)}: mudou aqui, muda em todas as que a usam ligada`);
  return true;
}

/** O que a pessoa precisa para a seção Compartilhadas: quem é a dona de um uri. */
export function ownerOf(doc: EditorDoc): (uri: string) => string | null {
  return (uri) => ownerOfShared(doc, uri);
}

/** Registra as portas, e quem responde ao vivo pelos donos. */
export function registerReuseActions(doc: EditorDoc): Array<() => void> {
  setSharedSupplier((uri) => {
    for (const d of projectDocs(doc)) {
      const f = ownerSharedFile(d.file, uri);
      if (f !== null) return f;
    }
    return null;
  });
  // Abriu outra coisa: lê da pasta o que o arquivo cita e o editor não tem.
  const tentados = new Set<string>();
  // A última frase do rodapé. O `rebuild` abaixo é uma mudança sem nome, e
  // chegava DEPOIS do "Base de mecha" do clique em Bases: o rodapé ficava só
  // com "Sem mudanças por salvar" (prova de pessoa, 05/11/2026). Depois de
  // remontar, a frase é dita de novo.
  let ultimaFala: string | null = null;
  const lembra = doc.on((change) => { if (change.label !== undefined && change.label !== '') ultimaFala = change.label; });
  const stop = doc.on((change) => {
    if (change.kind !== 'file') return;
    // Trocou de base (ou abriu): a dona pode ter mudado o andar enquanto esta
    // base estava fora do foco. Remonta com o arquivo de agora — sem isto o
    // goblin mostrava o andar de antes até alguém mexer nele (a prova achou).
    if (sharedUrisOf(doc.file).length > 0) {
      queueMicrotask(() => {
        const fala = ultimaFala;
        doc.rebuild();
        if (fala !== null) doc.notice(fala);
      });
    }
    if (projetoDe(doc) === null || projectDocs(doc).length <= 1) forgetSharedFilesSoft(tentados);
    const faltam = new Set<string>();
    for (const d of projectDocs(doc)) {
      for (const uri of sharedUrisOf(d.file)) if (sharedFileOf(uri) === null && !tentados.has(uri)) faltam.add(uri);
    }
    if (faltam.size === 0) return;
    for (const u of faltam) tentados.add(u);
    void loadSharedFromFolder(doc, [...faltam]).then((lidos) => {
      if (lidos > 0) for (const d of projectDocs(doc)) if (composeShared(d.file).origins.size > 0) d.rebuild();
    });
  });
  return [
    registerAction('usar-animacoes', { run: () => { void useAnimations(doc); } }),
    registerAction('seguir-esqueleto-padrao', {
      run: () => { void followStandard(doc); },
      enabled: () => (doc.file.bones ?? []).length > 1,
      why: () => 'Este boneco não tem ossos para renomear',
    }),
    stop,
    lembra,
    () => setSharedSupplier(null),
  ];
}

/** Abriu outro arquivo: os tentados voltam a valer (pode ser outra pasta). */
function forgetSharedFilesSoft(tentados: Set<string>): void {
  tentados.clear();
}


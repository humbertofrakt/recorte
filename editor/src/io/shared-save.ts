/**
 * **O arquivo das animações compartilhadas vai para o disco** — reaproveitar,
 * noite de 04/11/2026.
 *
 * Uma base DONA (`compartilha` no estado do editor) toca as animações dela como
 * sempre; as outras bases citam `<dona>-animacoes.bone` em `assets.animations`
 * (§2.8). Esse arquivo é **gerado**: sai das animações da dona, com o `rig`
 * gerado do conteúdo (`buildAnimationFile`). Ele é gravado:
 *
 * - quando a pessoa liga as animações (o primeiro), e
 * - a cada **Salvar**, ao lado do `.bone` — senão o jogo leria o andar de ontem.
 *
 * Grava na pasta do projeto quando dá (como o Salvar faz com o atlas); sem
 * pasta, pela janela de salvar, ou baixa.
 */

import type { BoneFile } from '../../../runtime/src/index.js';
import type { EditorDoc } from '../contract.js';
import { readEditorState } from '../contract.js';
import { projetoDe } from '../doc/projeto.js';
import { rememberSharedFile } from '../doc/shared-animations.js';
import { buildAnimationFile } from './export-animation.js';
import { putBoneFile } from './export-skin.js';
import { projectFolder } from './project-folder.js';

/** As animações próprias da dona que ela compartilha, e que ainda existem. */
function sharedNames(owner: BoneFile): { arquivo: string; nomes: string[] } | null {
  const c = readEditorState(owner).compartilha;
  if (c === undefined || typeof c.arquivo !== 'string') return null;
  const proprias = new Set((owner.animations ?? []).map((a) => a.name));
  const nomes = (c.animacoes ?? []).filter((n) => proprias.has(n));
  return { arquivo: c.arquivo, nomes };
}

/** O arquivo que a base dona compartilha, montado AGORA. `null` = não compartilha este uri. */
export function ownerSharedFile(owner: BoneFile, uri: string): BoneFile | null {
  const s = sharedNames(owner);
  if (s === null || s.arquivo !== uri || s.nomes.length === 0) return null;
  return buildAnimationFile(owner, s.nomes)?.file ?? null;
}

/** Os documentos do projeto (as bases), ou só este. */
export function projectDocs(doc: EditorDoc): EditorDoc[] {
  const projeto = projetoDe(doc);
  if (projeto === null) return [doc];
  return [...projeto.corpos.values(), ...projeto.guardados.values()];
}

/** A base dona de um uri no projeto (o uri da base), ou `null`. */
export function ownerOfShared(doc: EditorDoc, uri: string): string | null {
  const projeto = projetoDe(doc);
  if (projeto === null) return sharedNames(doc.file)?.arquivo === uri ? (doc.path ?? null) : null;
  for (const [corpo, d] of projeto.corpos) if (sharedNames(d.file)?.arquivo === uri) return corpo;
  return null;
}

/** Os arquivos compartilhados que o projeto tem de gravar agora: nome e texto. */
export function sharedFilesToSave(doc: EditorDoc): Array<{ name: string; text: string }> {
  const out: Array<{ name: string; text: string }> = [];
  for (const d of projectDocs(doc)) {
    const s = sharedNames(d.file);
    if (s === null || s.nomes.length === 0) continue;
    if (out.some((o) => o.name === s.arquivo)) continue;
    const file = ownerSharedFile(d.file, s.arquivo);
    if (file === null) continue;
    out.push({ name: s.arquivo, text: `${JSON.stringify(file, null, 2)}\n` });
  }
  return out;
}

/**
 * Grava um arquivo ao lado do projeto: na pasta, sem perguntar, quando dá; senão
 * pela janela de salvar (ou baixa). Devolve o nome gravado, ou `null` quando a
 * pessoa desistiu. O conteúdo fica lembrado para o editor tocar na hora.
 */
export async function writeBeside(doc: EditorDoc, name: string, text: string): Promise<string | null> {
  const pasta = projectFolder(doc)?.handle ?? null;
  let gravado: string | null = null;
  if (pasta?.getFileHandle !== undefined) {
    try {
      const h = await pasta.getFileHandle(name, { create: true });
      const w = await h.createWritable();
      await w.write(new Blob([text], { type: 'application/json' }));
      await w.close();
      gravado = name;
    } catch {
      gravado = null;
    }
  }
  if (gravado === null) gravado = await putBoneFile(name, text);
  if (gravado !== null) {
    try { rememberSharedFile(gravado, JSON.parse(text) as BoneFile); } catch { /* texto nosso: não falha */ }
  }
  return gravado;
}

/**
 * O **Salvar** chama isto depois de gravar o `.bone`: regrava cada arquivo de
 * animações compartilhadas das bases donas. Devolve a frase do rodapé.
 */
export async function saveSharedBeside(doc: EditorDoc): Promise<string | null> {
  const arquivos = sharedFilesToSave(doc);
  if (arquivos.length === 0) return null;
  const gravados: string[] = [];
  for (const a of arquivos) {
    const nome = await writeBeside(doc, a.name, a.text);
    if (nome !== null) gravados.push(nome);
  }
  if (gravados.length === 0) return 'As animações compartilhadas NÃO foram gravadas';
  return `Animações compartilhadas gravadas em ${gravados.join(', ')}`;
}

/**
 * Lê da pasta do projeto os arquivos citados em `assets.animations` que o
 * editor ainda não tem. Devolve quantos leu (para quem chamou redesenhar).
 */
export async function loadSharedFromFolder(
  doc: EditorDoc, missing: readonly string[],
): Promise<number> {
  const pasta = projectFolder(doc)?.handle ?? null;
  if (pasta?.getFileHandle === undefined || missing.length === 0) return 0;
  let lidos = 0;
  for (const uri of missing) {
    try {
      const h = await pasta.getFileHandle(uri);
      const f = await (h as unknown as { getFile(): Promise<File> }).getFile();
      rememberSharedFile(uri, JSON.parse(await f.text()) as BoneFile);
      lidos++;
    } catch {
      // Não está na pasta: a lista diz "não achado" (regra 21).
    }
  }
  return lidos;
}

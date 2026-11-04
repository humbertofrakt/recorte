/**
 * **O Salvar diz a verdade** — rodada 45, lote 1 (06/10/2026), doc `57` §5.
 *
 * Duas frases que a casca mostra e que mentiam:
 *
 * 1. **Salvar com avisos.** O `saveDocument` pergunta *"salvar mesmo assim?"*
 *    pelo gancho `confirmProblems`; a casca nunca o passava, e caía no
 *    `confirm()` do navegador — em inglês, com o caminho interno do arquivo
 *    (`/skins/0/attachments/hair/hair/path: image "hair" not found…`), uma linha
 *    por imagem e depois as mesmas de novo em português (achado da rodada 39,
 *    conferido de novo no doc `57`, foto `34`). Aqui a pergunta vira a da casa:
 *    as imagens que faltam numa linha só, o resto pela mesma tradução da barra
 *    de avisos (`panels/warning-model.ts`).
 * 2. **"Arquivo salvo."** sem nada salvo: ao abrir o programa, debaixo da
 *    oferta do rascunho, depois do Novo projeto. O documento que nunca foi
 *    gravado nem aberto do disco não tem `path`, e então ele **ainda não** está
 *    salvo (regra 21: um verde que não existe).
 *
 * Módulo puro: nada de DOM. Quem mostra é `ui/shell-file.ts` (`askUser`) e
 * `ui/shell.ts` (o rodapé).
 */

import type { BoneFile } from '../../../runtime/src/index.js';
import { parseWarning, warningRow } from '../panels/warning-model.js';

/** A pergunta pronta para `askUser`. */
export interface PerguntaDoSalvar {
  title: string;
  lead: string;
  lines: string[];
  yesLabel: string;
  noLabel: string;
}

/** O leitor diz assim a imagem que não está em atlas nenhum. */
const IMAGEM_SEM_ATLAS = /^image "(.*)" not found in any atlas/;
/** E o `checkBeforeSaving` acrescenta a mesma imagem de novo, assim. */
const IMAGEM_NAO_ENCONTRADA = /^imagem não encontrada: (.*)$/;

/**
 * A pergunta do Salvar com avisos, em português. As imagens que faltam (que
 * vinham duas vezes cada, uma em inglês e outra em português) viram **uma
 * linha**; cada outro aviso, uma linha com o nome da peça no lugar do caminho.
 */
export function perguntaSalvarComAvisos(file: BoneFile, problems: readonly string[]): PerguntaDoSalvar {
  const faltam: string[] = [];
  const outros: string[] = [];
  for (const linha of problems) {
    const solta = IMAGEM_NAO_ENCONTRADA.exec(linha);
    const doLeitor = IMAGEM_SEM_ATLAS.exec(parseWarning(linha).message);
    const imagem = solta?.[1] ?? doLeitor?.[1];
    if (imagem !== undefined) {
      if (!faltam.includes(imagem)) faltam.push(imagem);
      continue;
    }
    const texto = warningRow(file, linha).text;
    if (!outros.includes(texto)) outros.push(texto);
  }

  const partes: string[] = [];
  if (faltam.length > 0) {
    partes.push(faltam.length === 1
      ? 'Falta 1 imagem: o desenho dela fica invisível'
      : `Faltam ${faltam.length} imagens: os desenhos delas ficam invisíveis`);
  }
  if (outros.length > 0) {
    const n = outros.length === 1 ? '1 aviso' : `${outros.length} avisos`;
    partes.push(faltam.length > 0 ? `e há mais ${n}` : `O arquivo tem ${n}`);
  }
  const lead = `${partes.join(', ')}. Ele abre do mesmo jeito, e os avisos voltam ao abrir.`;

  const lines: string[] = [];
  if (faltam.length > 0) {
    lines.push(`${faltam.length === 1 ? 'A imagem que falta' : 'As imagens que faltam'}: ${faltam.join(', ')}`);
  }
  lines.push(...outros);
  return { title: 'Salvar com avisos?', lead, lines, yesLabel: 'Salvar mesmo assim', noLabel: 'Voltar sem salvar' };
}

/**
 * A frase do estado do arquivo, no rodapé. Sem `path` o documento nunca foi
 * gravado nem aberto do disco: ele **ainda não** está salvo, mesmo sem mudança.
 */
export function estadoDoArquivo(dirty: boolean, path: string | null): string {
  if (dirty) return 'Arquivo não salvo.';
  // Rodada 50, lote 2 (doc 98): limpo com `path` dizia "Arquivo salvo." — e o
  // herói, aberto de dentro do programa, nunca foi salvo por ninguém. Quem
  // acabou de gravar já lê "Salvo em …" na frase do Salvar.
  return path === null ? 'Arquivo ainda não salvo.' : 'Sem mudanças por salvar.';
}

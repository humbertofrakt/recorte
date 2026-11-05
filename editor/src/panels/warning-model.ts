/**
 * Os avisos com nome de gente (dono C) — lote 49, rodada 5, requisito R11.
 *
 * O leitor avisa em endereço de máquina e em inglês:
 * `/skins/0/attachments/body: image "body" not found in any atlas`. O
 * Humberto lê **pele "default" › desenho "body": imagem "body" não está em
 * nenhum atlas**, e clica em **Ir para**, que escolhe o elemento e abre o
 * painel certo. Quando há conserto automático, um segundo botão faz.
 *
 * Puro: o arquivo e a linha do aviso entram, texto e alvo saem. A lista na
 * tela é do `ui/shell.ts`.
 */

import type { BoneFile } from '../../../runtime/src/index.js';
import { parsePointer } from '../doc/commands.js';

/** O que o Ir para escolhe. `skeleton` = nada escolhido, Propriedades do esqueleto. */
export interface WarningTarget {
  kind: 'bone' | 'slot' | 'attachment' | 'animation' | 'skin' | 'constraint' | 'skeleton';
  name?: string;
  skin?: string;
  slot?: string;
}

/** O conserto que um aviso oferece. */
export type WarningFix =
  | { label: 'Trocar imagem…'; action: 'swap-image' }
  | { label: 'Gravar o padrão'; action: 'write-fallback'; value: string };

/** Uma linha do aviso, como o documento a monta: `ponteiro: mensagem`, ou só a mensagem. */
export function parseWarning(line: string): { pointer: string | null; message: string } {
  const at = line.indexOf(': ');
  if (!line.startsWith('/') || at < 0) return { pointer: null, message: line };
  return { pointer: line.slice(0, at), message: line.slice(at + 2) };
}

const named = (value: unknown): string | null => {
  const name = (value as { name?: unknown } | null | undefined)?.name;
  return typeof name === 'string' ? name : null;
};

/**
 * O ponteiro JSON com os nomes do arquivo, e o que o Ir para escolhe.
 * Ponteiro que não aponta para nada conhecido volta cru, sem alvo.
 */
export function describePointer(
  file: BoneFile, pointer: string,
): { text: string; target: WarningTarget | null } {
  const raw = { text: pointer, target: null };
  // Rodada 42, lote 2 (doc 40, defeito 1): o leitor não sabe a pele, e põe
  // "..." no lugar dela: "/skins/.../sword/uri". Diz-se o desenho, sem o caminho.
  const semPele = /^\/skins\/\.\.\.\/([^/]+)\/uri$/.exec(pointer);
  if (semPele !== null) return { text: `desenho "${semPele[1]}"`, target: null };
  let parts: string[];
  try {
    parts = parsePointer(pointer);
  } catch {
    return raw;
  }
  const [root, index, ...rest] = parts;
  const tail = (from: readonly string[]): string => (from.length === 0 ? '' : ` › ${from.join(' › ')}`);
  const at = <T>(list: readonly T[] | undefined): T | undefined => (
    list === undefined || index === undefined || !/^\d+$/.test(index) ? undefined : list[Number(index)]
  );

  if (root === 'bone' || root === 'skeleton') {
    return { text: `cabeçalho${tail(parts.slice(1))}`, target: { kind: 'skeleton' } };
  }
  if (root === 'bones') {
    const name = named(at(file.bones));
    return name === null ? raw : { text: `osso "${name}"${tail(rest)}`, target: { kind: 'bone', name } };
  }
  if (root === 'slots') {
    const name = named(at(file.slots));
    return name === null ? raw : { text: `slot "${name}"${tail(rest)}`, target: { kind: 'slot', name } };
  }
  if (root === 'constraints') {
    const name = named(at(file.constraints));
    return name === null ? raw : { text: `regra "${name}"${tail(rest)}`, target: { kind: 'constraint', name } };
  }
  // Rodada 8a: o aviso do morph apontava para `/morphs/0/targets/0/…`, cru.
  if (root === 'morphs') {
    const name = named(at((file as { morphs?: readonly unknown[] }).morphs));
    if (name === null) return raw;
    const alvo = rest[0] === 'targets' && rest[1] !== undefined && /^\d+$/.test(rest[1])
      ? ` › alvo ${Number(rest[1]) + 1}${tail(rest.slice(2))}`
      : tail(rest);
    return { text: `morph "${name}"${alvo}`, target: null };
  }
  if (root === 'animations') {
    const name = named(at(file.animations));
    if (name === null) return raw;
    const target: WarningTarget = { kind: 'animation', name };
    if (rest[0] === 'timelines' && rest[1] !== undefined && /^\d+$/.test(rest[1])) {
      return { text: `animação "${name}" › linha ${Number(rest[1]) + 1}${tail(rest.slice(2))}`, target };
    }
    return { text: `animação "${name}"${tail(rest)}`, target };
  }
  if (root === 'skins') {
    const skin = at(file.skins);
    const name = named(skin);
    if (skin === undefined || name === null) return raw;
    if (rest[0] === 'attachments' && rest[1] !== undefined) {
      const slot = rest[1];
      const map = skin.attachments?.[slot];
      if (map === undefined) return raw;
      // Sem o nome do desenho no ponteiro, o do slot: é o que o leitor aponta
      // quando o problema é o slot inteiro daquela pele.
      const attachment = rest[2] ?? Object.keys(map)[0] ?? slot;
      return {
        text: `skin "${name}" › desenho "${attachment}"${tail(rest.slice(3))}`,
        target: { kind: 'attachment', skin: name, slot, name: attachment },
      };
    }
    return { text: `skin "${name}"${tail(rest)}`, target: { kind: 'skin', name } };
  }
  return raw;
}

/**
 * Uma linha de aviso como ela vai para o RODAPÉ: sem o ponteiro JSON, e em
 * português. Noite de 04/11/2026: quatro lugares (abrir pasta, abrir arquivo,
 * soltar na janela) punham `warnings[0]` cru no rodapé, e a frase do leitor
 * chegava em inglês ("deform needs a vertex attachment; timeline ignored").
 */
export function avisoNoRodape(line: string): string {
  return translateWarning(parseWarning(line).message);
}

/** As frases de forma fixa do leitor, em português. O que não bater fica como está. */
export function translateWarning(message: string): string {
  let m = /^image "(.*)" not found in any atlas(; attachment will be invisible)?$/.exec(message);
  if (m !== null) return `imagem "${m[1]}" não está em nenhum atlas${m[2] === undefined ? '' : '; o desenho fica invisível'}`;
  m = /^unknown value "(.*)", using "(.*)"$/.exec(message);
  if (m !== null) return `valor "${m[1]}" desconhecido; usando "${m[2]}"`;
  m = /^file version (\S+) newer than reader (\S+): partial read$/.exec(message);
  if (m !== null) return `arquivo na versão ${m[1]}, leitor na ${m[2]}: leitura parcial`;
  // Rodada 8a, achado 4: os três que a troca de uma malha por entidade
  // levanta. A frase diz o que ficou sem efeito, e por quê.
  if (message === 'deform needs a vertex attachment; timeline ignored') {
    return 'chaves de deformação num desenho que não é malha: ficam sem efeito';
  }
  m = /^parent "(.*)" is not a mesh in skin "(.*)" of slot "(.*)"; linked mesh ignored$/.exec(message);
  if (m !== null) {
    return `a malha ligada copia "${m[1]}" (skin "${m[2]}", slot "${m[3]}"), que não é malha: ela não aparece`;
  }
  // Rodada 42, lote 2 (doc 40, defeito 1): a entidade que não veio. O nome do
  // arquivo, sem a pasta de dentro, e o que acontece; sem "(spec 7.11)".
  m = /^nested skeleton "(.*)" was not provided; placeholder treated as empty \(spec 7\.11\)$/.exec(message);
  if (m !== null) {
    const arquivo = m[1]!.split('/').pop()!;
    return `falta o arquivo da entidade ${arquivo}: ela não foi aberta, e o lugar dela fica vazio. Traga ${arquivo} para a pasta do projeto`;
  }
  m = /^"(.*)" is not a mesh in skin "(.*)" of slot "(.*)"; target ignored$/.exec(message);
  if (m !== null) {
    return `o morph deforma "${m[1]}" (skin "${m[2]}", slot "${m[3]}"), que não é malha: esse alvo fica sem efeito`;
  }
  return message;
}

/** O conserto automático do aviso, quando existe. Lê a mensagem original, em inglês. */
export function fixFor(message: string): WarningFix | null {
  if (/^image ".*" not found in any atlas/.test(message)) return { label: 'Trocar imagem…', action: 'swap-image' };
  const m = /^unknown value ".*", using "(.*)"$/.exec(message);
  if (m !== null) return { label: 'Gravar o padrão', action: 'write-fallback', value: m[1]! };
  return null;
}

/** Tudo o que a linha da lista precisa, de uma vez. */
export interface WarningRow {
  /** O texto inteiro, para ler: `onde: o quê`. */
  text: string;
  pointer: string | null;
  target: WarningTarget | null;
  fix: WarningFix | null;
}

export function warningRow(file: BoneFile, line: string): WarningRow {
  const { pointer, message } = parseWarning(line);
  const said = translateWarning(message);
  if (pointer === null) return { text: said, pointer: null, target: null, fix: null };
  const where = describePointer(file, pointer);
  return { text: `${where.text}: ${said}`, pointer, target: where.target, fix: fixFor(message) };
}

/** O painel que o Ir para abre, pelo tipo do alvo. */
export function panelFor(target: WarningTarget): string {
  switch (target.kind) {
    case 'bone': case 'slot': return 'arvore';
    case 'attachment': return 'imagens';
    case 'animation': return 'animacoes';
    case 'skin': return 'peles';
    case 'constraint': return 'regras';
    case 'skeleton': return 'propriedades';
  }
}

// ---------------------------------------------------------------------------
// Rodada 48 (a mão do Humberto, 07/10/2026): 176 avisos no projeto dele, e a
// barra só contava. Os iguais a menos do nome entre aspas viram um tipo; o tipo
// pior vem primeiro, na barra, na dica e na janela.
// ---------------------------------------------------------------------------

/**
 * Quão ruim é o aviso, pela frase do leitor (em inglês): 3 o arquivo não foi
 * lido inteiro; 2 alguma coisa some (não desenha, fica sem efeito); 1 o leitor
 * pôs um padrão no lugar; 0 o resto.
 */
export function gravidadeDoAviso(line: string): number {
  const { message } = parseWarning(line);
  if (/partial read|best effort|degraded mode/.test(message)) return 3;
  if (/ignored|NOT drawn|invisible|not provided|treated as empty|not defined in any skin|does not exist/.test(message)) return 2;
  if (/using "|treated as|holds/.test(message)) return 1;
  return 0;
}

/**
 * O tipo do aviso: a frase em português, com o que vem entre aspas trocado por
 * "…", e o nome que saiu dali. Lote 3 (doc 95): a frase curta do Salvar,
 * "imagem não encontrada: NOME", leva o nome sem aspas — e virava um tipo por
 * imagem.
 */
function tipoDoAviso(line: string): { texto: string; nome: string | null } {
  const frase = translateWarning(parseWarning(line).message);
  const curta = /^(imagem não encontrada): (.+)$/.exec(frase);
  if (curta !== null) return { texto: `${curta[1]}: …`, nome: curta[2]! };
  return { texto: frase.replace(/"[^"]*"/g, '"…"'), nome: /"([^"]*)"/.exec(frase)?.[1] ?? null };
}

export interface GrupoDeAviso {
  texto: string;
  vezes: number;
  gravidade: number;
  /** Os nomes que o tipo esconde atrás do "…", sem repetir. */
  nomes: string[];
}

/** Os tipos, o pior primeiro; entre iguais em gravidade, o mais repetido. */
function gruposDosAvisos(lines: readonly string[]): GrupoDeAviso[] {
  const grupos = new Map<string, GrupoDeAviso>();
  for (const line of lines) {
    const { texto, nome } = tipoDoAviso(line);
    let grupo = grupos.get(texto);
    if (grupo === undefined) {
      grupo = { texto, vezes: 0, gravidade: gravidadeDoAviso(line), nomes: [] };
      grupos.set(texto, grupo);
    }
    grupo.vezes++;
    if (nome !== null && !grupo.nomes.includes(nome)) grupo.nomes.push(nome);
  }
  return [...grupos.values()].sort((a, b) => b.gravidade - a.gravidade || b.vezes - a.vezes);
}

/** "5 × imagem não encontrada: a, b, c, d, e e mais 16". */
function fraseDoGrupo(g: GrupoDeAviso): string {
  if (g.nomes.length === 0) return `${g.vezes} × ${g.texto}`;
  const nomes = g.nomes.slice(0, 5).join(', ') + (g.nomes.length > 5 ? ` e mais ${g.nomes.length - 5}` : '');
  // "imagem não encontrada: …" troca o "…" pelos nomes; as outras ganham ": nomes" no fim.
  return g.texto.endsWith(': …') ? `${g.vezes} × ${g.texto.slice(0, -1)}${nomes}` : `${g.vezes} × ${g.texto}: ${nomes}`;
}

/**
 * Com que parágrafo a janela de Problemas abre — lote 3 (doc 95): ela abria
 * com dois parágrafos que diziam o mesmo. Só imagens faltando: o das imagens
 * (que diz o que fazer); mais de um tipo: o dos tipos; um tipo só, sem
 * imagens: nenhum, a lista basta.
 */
export function abrirComParagrafo(tipos: number, temResumoDasImagens: boolean): 'imagens' | 'tipos' | null {
  if (tipos > 1) return 'tipos';
  return temResumoDasImagens ? 'imagens' : null;
}

/** As linhas na ordem dos tipos (o pior primeiro); dentro de um tipo, a ordem do arquivo. */
export function avisosPeloPior(lines: readonly string[]): string[] {
  const ordem = new Map(gruposDosAvisos(lines).map((g, i) => [g.texto, i]));
  return lines
    .map((line, i) => ({ line, i, g: ordem.get(tipoDoAviso(line).texto) ?? 0 }))
    .sort((a, b) => a.g - b.g || a.i - b.i)
    .map((x) => x.line);
}

/** O botão da barra, a dica dele e os tipos. */
export function resumoDosAvisos(lines: readonly string[]): { barra: string; dica: string; grupos: GrupoDeAviso[] } {
  const grupos = gruposDosAvisos(lines);
  if (lines.length === 0) return { barra: 'Nenhum aviso', dica: '', grupos };
  const n = `${lines.length} aviso${lines.length === 1 ? '' : 's'}`;
  const maior = Math.max(...grupos.map((g) => g.vezes));
  const barra = maior > 1 ? `${n} (${maior} iguais) — ver` : `${n} — ver`;
  const mostrados = grupos.slice(0, 6).map(fraseDoGrupo).join('; ');
  const resto = grupos.length > 6 ? `; e mais ${grupos.length - 6} tipos` : '';
  const tipos = grupos.length === 1 ? '1 tipo de aviso' : `${grupos.length} tipos de aviso, o pior primeiro`;
  return { barra, dica: `${tipos}: ${mostrados}${resto}`, grupos };
}

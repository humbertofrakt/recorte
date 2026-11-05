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
  const exata = traduzInteira(message);
  if (exata !== null) return exata;
  // Um código no começo (`TARGET_MISSING: …`, `RIG_UNMET: …`) vai para o fim,
  // entre parênteses: o leitor da tela lê a frase; quem procura, acha o código.
  const cod = /^([A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+): ([\s\S]*)$/.exec(message);
  if (cod !== null) {
    const dentro = translateWarning(cod[2]!);
    return dentro === cod[2] ? message : `${dentro} (${cod[1]})`;
  }
  // "causa; consequência": cada metade pela sua tabela.
  const corte = message.lastIndexOf('; ');
  if (corte > 0) {
    const causa = traduzCausa(message.slice(0, corte));
    const efeito = traduzConsequencia(message.slice(corte + 2));
    if (causa !== null && efeito !== null) return `${causa}: ${efeito}`;
  }
  return traduzCausa(message) ?? message;
}

/*
 * A tradução das frases do leitor (runtime/src/loader.ts e curve.ts), noite de
 * 05/11/2026. O teste `avisos-em-portugues.test.ts` tira as formas do código,
 * VIVAS, e confere que nenhuma volta em inglês nem com palavra de programador
 * fora de parênteses (`ui/jargao.ts`). Frase nova no leitor sem linha aqui:
 * o teste fica vermelho com a frase.
 *
 * A régua da frase: curta; diz O QUE ficou sem efeito e POR QUÊ.
 */

/** As oito que já existiam, letra por letra (testes de `acabamento` e `menus`), e as que não têm "; ". */
function traduzInteira(message: string): string | null {
  let m = /^image "(.*)" not found in any atlas(; attachment will be invisible)?$/.exec(message);
  if (m !== null) return `imagem "${m[1]}" não está em nenhuma folha de imagens (atlas)${m[2] === undefined ? '' : '; o desenho fica invisível'}`;
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
  for (const [re, diz] of INTEIRAS) {
    const r = re.exec(message);
    if (r !== null) return diz(r);
  }
  return null;
}

type Regra = readonly [RegExp, (m: RegExpExecArray) => string];

/** Frases que não se partem em causa e consequência. */
const INTEIRAS: readonly Regra[] = [
  [/^weights of vertex (.*) sum to (.*), expected 1 \(used as written\)$/, (m) => `os pesos do ponto ${m[1]} somam ${m[2]}, e não 1: ficam como estão`],
  [/^"path" is ignored on a "(.*)" attachment$/, (m) => `um desenho do tipo "${m[1]}" não usa nome de imagem (path): fica sem efeito`],
  [/^the clipping polygon crosses itself \(edges (.*) and (.*)\); the cut may not be what was drawn \(spec 7\.7\)$/,
    (m) => `o contorno da máscara se cruza (lados ${m[1]} e ${m[2]}): o corte pode não ser o que foi desenhado`],
  [/^unknown particle shape "(.*)"; emitter "(.*)" is NOT drawn \(extension BONE_particles 7\.4\)$/,
    (m) => `a forma de partícula "${m[1]}" é desconhecida: o emissor "${m[2]}" não é desenhado`],
  [/^this animation belongs to another body; keep it there \(spec 9\.13\)$/, () => 'esta animação é de outro corpo: ela deve ficar lá'],
  [/^parameter "(.*)" has a source and must not be keyed$/, (m) => `o parâmetro "${m[1]}" segue um osso e não pode ter chaves: as chaves ficam sem efeito`],
  [/^non-numeric value: curve treated as "stepped"$/, () => 'valor que não é número: a curva vira degrau'],
  [/^unknown curve "(.*)", using "linear"$/, (m) => `a curva "${m[1]}" é desconhecida: vale a reta (linear)`],
  [/^curve must be a string or an array, using "linear"$/, () => 'a curva não é um nome nem uma lista: vale a reta (linear)'],
  [/^curve has (.*) numbers, expected (.*), using "linear"$/, (m) => `a curva tem ${m[1]} números, e devia ter ${m[2]}: vale a reta (linear)`],
  [/^curve has a non-numeric entry at index (.*), using "linear"$/, (m) => `a curva tem uma posição que não é número (a ${m[1]}): vale a reta (linear)`],
  [/^curve (cx1|cx2) (.*) outside \[(.*), (.*)\], clamped$/, (m) => `a alça da curva (${m[1]}) em ${m[2]} sai de [${m[3]}, ${m[4]}]: ficou no limite`],
  [/^file requires (.*), reader is (.*): best effort$/, (m) => `o arquivo pede o leitor ${m[1]}, e este é o ${m[2]}: abre o que entende`],
  [/^duration (.*) is smaller than the last key time (.*)$/, (m) => `a duração ${m[1]} é menor que o tempo da última chave (${m[2]})`],
  [/^lengths has (.*) entries, expected (.*)$/, (m) => `a lista de comprimentos (lengths) tem ${m[1]} valores, e devia ter ${m[2]}`],
  [/^offsets has (.*) numbers, more than the deform layout \((.*)\); truncated$/,
    (m) => `o morph tem ${m[1]} números, mais do que a malha comporta (${m[2]}): o que sobra foi cortado`],
];

const NOME: Readonly<Record<string, string>> = {
  bone: 'osso', slot: 'desenho', event: 'evento', parameter: 'parâmetro', variable: 'variável', skin: 'pele',
  morph: 'forma', constraint: 'regra', animation: 'animação', page: 'página', region: 'imagem',
  nested: 'entidade',
};
const nome = (en: string): string => NOME[en] ?? en;

/** O que o leitor diz que esperava (`expected …`), em português. */
const ESPERADO: Readonly<Record<string, string>> = {
  'a boolean': 'sim ou não', 'a number': 'um número', 'an array of strings': 'uma lista de nomes',
  'an animation name or null': 'um nome de animação, ou nada',
};

/** Os problemas de endereço de arquivo (runtime/src/uri.ts). */
function problemaDeEndereco(p: string): string {
  const regras: readonly Regra[] = [
    [/^uri longer than (.*) code points/, (m) => `passa de ${m[1]} letras`],
    [/^uri contains the reserved encoded byte "(.*)"/, (m) => `tem o caractere proibido ${m[1]}`],
    [/^uri has an invalid percent-encoding/, () => 'tem um código com % que não vale'],
    [/^uri contains a backslash/, () => 'usa barra invertida; a barra é "/"'],
    [/^uri contains ":"/, () => 'tem ":" (é um caminho absoluto ou de rede)'],
    [/^uri is absolute/, () => 'é absoluto; tem de ser relativo à pasta'],
    [/^uri contains a control character/, () => 'tem um caractere invisível de controle'],
    [/^uri contains the segment "(.*)"/, (m) => `tem o trecho "${m[1]}", que sai da pasta`],
    [/^uri is empty/, () => 'está vazio'],
  ];
  for (const [re, diz] of regras) {
    const r = re.exec(p);
    if (r !== null) return diz(r);
  }
  return `(${p})`;
}

/** A primeira metade: o que está errado. */
const CAUSAS: readonly Regra[] = [
  [/^duplicate (bone|slot|event|parameter|variable|skin|morph|constraint|animation|page|region) name "(.*)"$/,
    (m) => `há dois com o nome "${m[2]}" (${nome(m[1]!)})`],
  [/^duplicate timeline (.*)$/, (m) => `há duas linhas iguais na animação ${m[1]}`],
  [/^the first bone is the root and must not have a parent$/, () => 'o primeiro osso é a raiz e não pode ter pai'],
  [/^bone "(.*)" has no parent but is not the first bone \(two roots\)$/, (m) => `o osso "${m[1]}" não tem pai e não é o primeiro (seriam duas raízes)`],
  [/^parent bone "(.*)" does not exist$/, (m) => `o osso pai "${m[1]}" não existe`],
  [/^parent cycle through bone "(.*)"$/, (m) => `os pais do osso "${m[1]}" dão uma volta e fecham um círculo`],
  [/^parent "(.*)" comes after bone "(.*)" \(parents must come first\)$/, (m) => `o pai "${m[1]}" vem depois do osso "${m[2]}" na lista (o pai tem de vir antes)`],
  [/^length must be >= 0$/, () => 'o comprimento não pode ser negativo'],
  [/^length must be > 0 \(got (.*)\)$/, (m) => `o comprimento de referência tem de ser maior que zero (é ${m[1]})`],
  [/^bone "(.*)" does not exist in this body$/, (m) => `o osso "${m[1]}" não existe neste corpo`],
  [/^(bone|slot|skin|constraint|parameter|animation|morph|event|variable) "(.*)" does not exist(?: \(or has an unknown type\))?$/,
    (m) => `não existe ${nome(m[1]!)} com o nome "${m[2]}"`],
  [/^(bone|constraint) "(.*)" is not skinRequired$/, (m) => `${m[1] === 'bone' ? 'o osso' : 'a regra'} "${m[2]}" não é só da pele (skinRequired)`],
  [/^max \((.*)\) must be greater than min \((.*)\)$/, (m) => `o máximo (${m[1]}) tem de ser maior que o mínimo (${m[2]})`],
  [/^default (.*) outside \[(.*), (.*)\]$/, (m) => `o valor inicial ${m[1]} está fora de [${m[2]}, ${m[3]}]`],
  [/^unknown property "(.*)"$/, (m) => `a medida "${m[1]}" do osso é desconhecida`],
  [/^to must differ from from$/, () => 'o começo e o fim da faixa são iguais'],
  [/^unknown variable type "(.*)"$/, (m) => `o tipo de variável "${m[1]}" é desconhecido`],
  [/^default does not match type "(.*)"$/, (m) => `o valor inicial não é do tipo "${m[1]}"`],
  [/^a skin cannot include itself$/, () => 'uma pele não pode incluir a si mesma'],
  [/^skin include cycle through "(.*)" via "(.*)"$/, (m) => `as peles "${m[1]}" e "${m[2]}" incluem uma à outra, em círculo`],
  [/^one of "vertices" or "binding" is required$/, () => 'a malha não tem pontos (vertices) nem pesos (binding)'],
  [/^only one of "vertices" or "binding" is allowed$/, () => 'a malha tem pontos (vertices) e pesos (binding) ao mesmo tempo'],
  [/^each vertex needs at least one influence$/, () => 'cada ponto da malha precisa de pelo menos um osso'],
  [/^binding sizes do not match counts \(sum (.*)\)$/, (m) => `os pesos (binding) não batem com a contagem (soma ${m[1]})`],
  [/^bone index (.*) out of range$/, (m) => `o osso de número ${m[1]} não existe`],
  [/^at least (.*) vertices are required$/, (m) => `são precisos pelo menos ${m[1]} pontos`],
  [/^vertices must hold x, y pairs$/, () => 'os pontos têm de vir em pares x, y'],
  [/^one of "count" \(>= 1\) or "frames" is required$/, () => 'a sequência de quadros não diz quantos quadros tem'],
  [/^sequence needs at least one frame$/, () => 'a sequência de quadros está vazia'],
  [/^setup (.*) outside 0\.\.(.*)$/, (m) => `o quadro inicial ${m[1]} está fora de 0..${m[2]}`],
  [/^uvs has (.*) numbers, expected (.*)$/, (m) => `as posições na imagem (uvs) têm ${m[1]} números, e deviam ter ${m[2]}`],
  [/^triangles must hold at least one triple of indices$/, () => 'a malha não tem nenhum triângulo'],
  [/^vertex index (.*) out of range$/, (m) => `o ponto de número ${m[1]} não existe`],
  [/^hull (.*) outside 1\.\.(.*)$/, (m) => `o contorno (hull) ${m[1]} está fora de 1..${m[2]}`],
  [/^unknown shape "(.*)"$/, (m) => `a forma "${m[1]}" é desconhecida`],
  [/^"(.*)" needs width and height$/, (m) => `a forma "${m[1]}" precisa de largura e altura`],
  [/^a path needs 3 points per anchor \(got (.*) points\)$/, (m) => `o caminho precisa de 3 pontos por âncora (tem ${m[1]})`],
  [/^invalid uri "(.*)": ([\s\S]*)$/, (m) => `o endereço de arquivo "${m[1]}" não vale: ${problemaDeEndereco(m[2]!)}`],
  [/^image name "(.*)" refused: ([\s\S]*)$/, (m) => `o nome de imagem "${m[1]}" foi recusado: ${problemaDeEndereco(m[2]!)}`],
  [/^unknown attachment type "(.*)"$/, (m) => `o tipo de desenho "${m[1]}" é desconhecido`],
  [/^rate (.*) is negative$/, (m) => `a taxa de partículas ${m[1]} é negativa`],
  [/^a Bézier on rate has no closed integral$/, () => 'curva Bézier na taxa de partículas não tem conta exata'],
  [/^prewarm only applies with looping: false$/, () => 'o pré-aquecimento (prewarm) só vale sem laço'],
  [/^over-lifetime value must be a number$/, () => 'o valor ao longo da vida tem de ser um número'],
  [/^over-lifetime color must be four numbers$/, () => 'a cor ao longo da vida tem de ter quatro números'],
  [/^a morph needs at least one target$/, () => 'a forma (morph) não tem nenhum alvo'],
  [/^bones is required$/, () => 'a regra não diz quais ossos move'],
  [/^expected (.*)\.\.(.*) bones, got (.*)$/, (m) => `a regra pede de ${m[1]} a ${m[2]} ossos, e tem ${m[3]}`],
  [/^unknown constraint type "(.*)"$/, (m) => `o tipo de regra "${m[1]}" é desconhecido`],
  [/^the root bone cannot be constrained by IK$/, () => 'a raiz não pode ser movida por cinemática inversa (IK)'],
  [/^"(.*)" must be a child of "(.*)"$/, (m) => `"${m[1]}" tem de ser filho de "${m[2]}"`],
  [/^target "(.*)" is one of the constrained bones or a descendant$/, (m) => `o alvo "${m[1]}" é um dos ossos da regra, ou filho de um deles`],
  [/^"(.*)" must use normal inheritance for 2-bone IK$/, (m) => `"${m[1]}" tem de herdar tudo do pai para a cinemática inversa de 2 ossos (IK)`],
  [/^mass must be > 0$/, () => 'a massa tem de ser maior que zero'],
  [/^fps must be > 0$/, () => 'os quadros por segundo têm de ser maiores que zero'],
  [/^exactly one of "targets" or "animation" is required$/, () => 'o comando precisa de alvos ou de uma animação, só um dos dois'],
  [/^a driver needs at least one target$/, () => 'o comando não tem nenhum alvo'],
  [/^"(.*)" is not allowed as a driver target$/, (m) => `"${m[1]}" não pode ser alvo de comando`],
  [/^"add" is not allowed for this target$/, () => 'somar (add) não vale para este alvo'],
  [/^a driver must not write its own parameter$/, () => 'o comando não pode escrever no próprio parâmetro'],
  [/^duration must be >= 0$/, () => 'a duração não pode ser negativa'],
  [/^time must be >= 0$/, () => 'o tempo de uma chave não pode ser negativo'],
  [/^at least one key is required$/, () => 'a linha não tem nenhuma chave'],
  [/^(\S+) must be (non-decreasing|strictly increasing)$/, () => 'as chaves estão fora de ordem'],
  [/^expected a number$/, () => 'a chave não traz um número'],
  [/^expected 3 numbers or null$/, () => 'a chave não traz 3 números'],
  [/^expected a bone name or null$/, () => 'a chave não traz um nome de osso'],
  [/^expected an array of \{slot, offset\}$/, () => 'a chave da ordem de desenho não traz a lista certa'],
  [/^expected an array of numbers$/, () => 'a chave não traz uma lista de números'],
  [/^expected an array of weights$/, () => 'a chave não traz uma lista de pesos'],
  [/^expected a body uri or null$/, () => 'a chave não traz o arquivo de um corpo'],
  [/^expected (.*) numbers$/, (m) => `a chave não traz ${m[1]} números`],
  [/^expected (.*)$/, (m) => `a chave não traz o que devia (${ESPERADO[m[1]!] ?? m[1]})`],
  [/^"(.*)" timeline needs a target$/, (m) => `a linha "${m[1]}" não diz em quem mexe`],
  [/^"(.*)" timeline needs a property$/, (m) => `a linha "${m[1]}" não diz o que muda`],
  [/^unknown (bone|slot|parameter|morph|variable|nested) property "(.*)"$/, (m) => `"${m[2]}" não é uma medida de ${nome(m[1]!)} que o leitor conheça`],
  [/^a slot\/bone key is stepped only$/, () => 'a troca de osso de um desenho só anda em degrau'],
  [/^a linked mesh with inheritDeform cannot have its own deform$/, () => 'uma malha ligada que herda a deformação não pode ter deformação própria'],
  [/^offset must be a non-negative integer$/, () => 'o deslocamento (offset) tem de ser inteiro e não negativo'],
  [/^deform of (.*) numbers at offset (.*) exceeds the layout \((.*)\)$/, (m) => `a deformação de ${m[1]} números a partir de ${m[2]} passa do tamanho da malha (${m[3]})`],
  [/^weights needs an attachment with a binding$/, () => 'as chaves de pesos precisam de uma malha com pesos'],
  [/^(.*) weights, the binding has (.*)$/, (m) => `a chave tem ${m[1]} pesos, e a malha tem ${m[2]}`],
  [/^(weights|event) timeline without valid keys$/, (m) => `nenhuma chave de ${m[1] === 'event' ? 'evento' : 'pesos'} é válida`],
  [/^a body key is stepped only$/, () => 'a troca de corpo só anda em degrau'],
  [/^sequence timeline needs an attachment with a sequence$/, () => 'as chaves de sequência precisam de um desenho com sequência de quadros'],
  [/^index (.*) outside 0\.\.(.*)$/, (m) => `a posição ${m[1]} está fora de 0..${m[2]}`],
  [/^delay (.*) must be >= 0$/, (m) => `a espera ${m[1]} não pode ser negativa`],
  [/^event key needs "event"$/, () => 'a chave de evento não diz qual evento'],
  [/^property "(.*)" does not belong to a "(.*)" constraint$/, (m) => `"${m[1]}" não é uma medida de uma regra de "${m[2]}"`],
  [/^attachment "(.*)" is not a (\S+)$/, (m) => `o desenho "${m[1]}" não é um emissor de partículas`],
  [/^"(.*)" is not animable in BONE_particles$/, (m) => `"${m[1]}" não pode ser animado no emissor de partículas`],
  [/^unknown timeline type "(.*)"$/, (m) => `o tipo de linha "${m[1]}" é desconhecido`],
  [/^attachment is required$/, () => 'a linha não diz qual desenho'],
  [/^attachment "(.*)" not found in skin "(.*)" of slot "(.*)"$/, (m) => `não há o desenho "${m[1]}" na pele "${m[2]}", em "${m[3]}"`],
  [/^slot "(.*)" collides with "(.*)" at index (.*)$/, (m) => `"${m[1]}" e "${m[2]}" caem na mesma posição (${m[3]}) da ordem de desenho`],
  [/^atlas version (.*) newer than reader$/, (m) => `a folha de imagens é da versão ${m[1]}, mais nova que o leitor`],
  [/^page index (.*) out of range$/, (m) => `a página ${m[1]} não existe`],
  [/^rotation must be 0 or 90 \(got (.*)\)$/, (m) => `o giro da imagem tem de ser 0 ou 90 (é ${m[1]})`],
  [/^region "(.*)" exceeds the page (width|height)$/, (m) => `a imagem "${m[1]}" passa da ${m[2] === 'width' ? 'largura' : 'altura'} da página`],
  [/^original(Width|Height) must be >= offset[XY] \+ (?:width|height) for "(.*)"$/,
    (m) => `o tamanho original de "${m[2]}" é menor que o recorte (original${m[1]})`],
  [/^alias "(.*)" collides with a region name$/, (m) => `o apelido "${m[1]}" é igual ao nome de uma imagem`],
  [/^width and height must be >= 0 \(got (.*) x (.*)\)$/, (m) => `largura e altura não podem ser negativas (é ${m[1]} x ${m[2]})`],
  [/^minVersion (.*) is greater than version (.*)$/, (m) => `a versão mínima ${m[1]} é maior que a versão do arquivo (${m[2]})`],
  [/^file version (.*) is newer than reader (.*)$/, (m) => `o arquivo é da versão ${m[1]}, mais nova que o leitor (${m[2]})`],
  [/^required extensions not supported: (.*)$/, (m) => `o arquivo exige extensões que o leitor não conhece: ${m[1]}`],
  [/^placeholder "(.*)" is not defined in any skin$/, (m) => `o desenho "${m[1]}" não está em nenhuma pele`],
  [/^unknown (\w+) "(.*)"$/, (m) => `o valor "${m[2]}" é desconhecido (${m[1]})`],
];

/** A segunda metade: o que acontece por causa disso. */
const CONSEQUENCIAS: readonly Regra[] = [
  [/^timeline ignored$/, () => 'essas chaves ficam sem efeito'],
  [/^attachment ignored$/, () => 'o desenho não aparece'],
  [/^attachment will be invisible$/, () => 'o desenho fica invisível'],
  [/^constraint ignored$/, () => 'a regra fica sem efeito'],
  [/^target ignored$/, () => 'esse alvo fica sem efeito'],
  [/^key ignored$/, () => 'essa chave fica sem efeito'],
  [/^entry ignored$/, () => 'essa linha fica sem efeito'],
  [/^attachments ignored$/, () => 'os desenhos dele ficam sem efeito'],
  [/^sequence ignored$/, () => 'a sequência de quadros fica sem efeito'],
  [/^source ignored$/, () => 'o parâmetro não segue o osso'],
  [/^reference ignored$/, () => 'a referência fica sem efeito'],
  [/^region ignored$/, () => 'a imagem fica de fora'],
  [/^linked mesh ignored$/, () => 'a malha ligada não aparece'],
  [/^variable ignored$/, () => 'a variável fica sem efeito'],
  [/^ignored$/, () => 'fica sem efeito'],
  [/^cut$/, () => 'o círculo foi cortado'],
  [/^placeholder treated as empty$/, () => 'o lugar fica vazio'],
  [/^clamped$/, () => 'ficou no limite'],
  [/^truncated$/, () => 'o que sobra foi cortado'],
  [/^keys reordered$/, () => 'as chaves foram postas em ordem'],
  [/^the last one is used$/, () => 'vale a última'],
  [/^the last entry wins$/, () => 'vale a última'],
  [/^parameter fixed at min$/, () => 'o parâmetro fica no mínimo'],
  [/^best effort$/, () => 'o leitor abre o que entende'],
  [/^curve treated as "stepped"$/, () => 'a curva vira degrau'],
  [/^using the type default$/, () => 'vale o valor padrão do tipo'],
  [/^using (\d+)$/, (m) => `vale ${m[1]}`],
  [/^using "(.*)"$/, (m) => `vale "${m[1]}"`],
  [/^slot attached to "(.*)"$/, (m) => `o desenho fica no osso "${m[1]}"`],
  [/^attached to "(.*)"$/, (m) => `o osso fica preso a "${m[1]}"`],
  [/^the bone before the key holds$/, () => 'vale o osso de antes da chave'],
  [/^loading in degraded mode as requested$/, () => 'abrindo assim mesmo, como foi pedido'],
];

function traduzCausa(texto: string): string | null {
  for (const [re, diz] of CAUSAS) {
    const r = re.exec(texto);
    if (r !== null) return diz(r);
  }
  return null;
}

function traduzConsequencia(texto: string): string | null {
  for (const [re, diz] of CONSEQUENCIAS) {
    const r = re.exec(texto);
    if (r !== null) return diz(r);
  }
  return null;
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
  /**
   * O nome da imagem que falta, quando é esse o aviso; `null` nos outros. É o
   * marcador ESTÁVEL que a janela de avisos usa para juntar as imagens numa
   * linha só — tirado da frase ORIGINAL do leitor, e não da tradução, para que
   * trocar uma palavra da tradução nunca quebre o botão (noite de 05/11/2026).
   */
  imagemQueFalta?: string | null;
}

/** O nome da imagem que falta, pela frase do leitor ou pela curta do Salvar. */
function imagemQueFaltaEm(message: string): string | null {
  return /^image "(.*)" not found in any atlas/.exec(message)?.[1]
    ?? /^imagem não encontrada: (.+)$/.exec(message)?.[1]
    ?? null;
}

export function warningRow(file: BoneFile, line: string): WarningRow {
  const { pointer, message } = parseWarning(line);
  const said = translateWarning(message);
  const imagemQueFalta = imagemQueFaltaEm(message);
  if (pointer === null) return { text: said, pointer: null, target: null, fix: null, imagemQueFalta };
  const where = describePointer(file, pointer);
  return { text: `${where.text}: ${said}`, pointer, target: where.target, fix: fixFor(message), imagemQueFalta };
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

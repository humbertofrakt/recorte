/**
 * O que fazer com os arquivos que alguém soltou na janela — anotação 23.
 *
 * Arrastar um arquivo da área de trabalho para dentro do programa **não fazia
 * nada**: a cena só aceitava o arrasto que vem do painel Imagens, e
 * `dataTransfer.files` não era lido em canto nenhum. É o primeiro gesto de
 * quem chega de qualquer programa de arte, e foi a linha 1 da lista "O básico
 * que falta".
 *
 * Este módulo é **puro**: entra uma lista de nomes, sai o que o programa deve
 * fazer. Nada de `File`, nada de DOM — o que se testa aqui é a decisão, que é
 * onde mora o erro (soltar dois esqueletos, soltar um `.txt`, soltar um
 * `.atlas.json` sozinho).
 */

/** As extensões que cada caminho conhece. Minúsculas, com o ponto. */
export const DROP_SKELETON = ['.bone', '.boneb', '.bonez'] as const;
export const DROP_PSD = ['.psd', '.psb'] as const;
export const DROP_IMAGE = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp'] as const;
/** Spine, DragonBones e Spriter: quem decide qual é o detector de conteúdo. */
export const DROP_FOREIGN = ['.scml', '.scon', '.json', '.skel', '.txt', '.atlas'] as const;
/** O atlas do próprio Recorte. Ele viaja com o esqueleto, e nunca sozinho. */
export const DROP_ATLAS = '.atlas.json';

/** O prefixo dos arrastos de DENTRO do programa: imagem, entidade, pele. */
export const INTERNAL_DRAG_PREFIX = 'text/x-recorte-';

/**
 * `true` quando o arrasto nasceu DENTRO do programa — rodada final, J5
 * (29/09/2026).
 *
 * A miniatura da aba Imagens é uma `<img>`, e o navegador põe `Files` no
 * arrasto de uma `<img>`: a cena criava o desenho, e a janela, que só olhava
 * `Files`, tentava abrir a mesma imagem como arquivo e escrevia *"Não sei o que
 * fazer com i2uK3w…"*. Duas mãos para um soltar (regra 12). Quem traz um tipo
 * `text/x-recorte-*` já tem dono — a cena, a Árvore, as Peles —, e a janela
 * deixa passar. Vale para os quatro tipos de hoje (`imagem`, `entidade`,
 * `pele`) e para o que nascer com o mesmo prefixo.
 */
export function isInternalDrag(types: Iterable<string>): boolean {
  for (const type of types) if (type.startsWith(INTERNAL_DRAG_PREFIX)) return true;
  return false;
}

/** O que fazer com o que caiu na janela. */
export type DropPlan =
  /** Abrir um esqueleto, com as imagens e o atlas que vieram junto. */
  | { kind: 'abrir'; skeleton: string; images: string[] }
  /**
   * Vieram vários esqueletos: **perguntar qual abrir**.
   *
   * O plano do lote dizia para recusar — "um esqueleto por vez" —, e recusar
   * seria errado: o próprio herói vem com a `espada.bone` do lado, que é um
   * esqueleto filho (§7.11) e é parte do mesmo projeto. Quem sabe qual é o
   * principal é a pessoa; os outros viajam junto e o leitor os resolve.
   */
  | { kind: 'escolher'; skeletons: string[]; images: string[] }
  /** Importar um PSD, uma camada por slot. */
  | { kind: 'psd'; file: string }
  /** Importar de outro programa; o detector de conteúdo diz de qual. */
  | { kind: 'outro'; files: string[] }
  /**
   * Só imagens: elas vão para a aba Imagens, e **não** para a cena — lote 59.
   * Entram no personagem quando alguém as arrasta, como as da pasta.
   */
  | { kind: 'imagens'; files: string[] }
  /** Nada a fazer, e a frase explica o porquê para quem soltou. */
  | { kind: 'nada'; why: string };

function lower(name: string): string {
  return name.toLowerCase();
}

function has(name: string, list: readonly string[]): boolean {
  return list.some((ext) => lower(name).endsWith(ext));
}

/** `true` para `.atlas.json`, que é atlas e não é arquivo de outro programa. */
export function isAtlasName(name: string): boolean {
  return lower(name).endsWith(DROP_ATLAS);
}

/**
 * O plano para estes nomes de arquivo.
 *
 * A ordem das perguntas é a ordem da intenção: um esqueleto mandando manda em
 * tudo (o resto veio junto com ele); depois o PSD, que é o caminho de trazer
 * arte com posição; depois outro programa; e por último imagens soltas.
 */
export function dropPlan(names: readonly string[]): DropPlan {
  const limpos = names.map((name) => name.trim()).filter((name) => name !== '');
  if (limpos.length === 0) return { kind: 'nada', why: 'Nenhum arquivo veio no arrasto' };

  const esqueletos = limpos.filter((name) => has(name, DROP_SKELETON));
  const psds = limpos.filter((name) => has(name, DROP_PSD));
  const atlas = limpos.filter(isAtlasName);
  const imagens = limpos.filter((name) => has(name, DROP_IMAGE));
  const outros = limpos.filter((name) => !isAtlasName(name) && has(name, DROP_FOREIGN));

  if (esqueletos.length > 1) {
    return { kind: 'escolher', skeletons: esqueletos, images: [...atlas, ...imagens] };
  }
  if (esqueletos.length === 1) {
    // O atlas e as imagens que vieram junto são parte do mesmo projeto: é o
    // mesmo pacote que o seletor de "Abrir" aceita.
    return { kind: 'abrir', skeleton: esqueletos[0]!, images: [...atlas, ...imagens] };
  }
  if (psds.length > 1) {
    return { kind: 'nada', why: `Um PSD por vez. Vieram ${psds.length}` };
  }
  if (psds.length === 1) return { kind: 'psd', file: psds[0]! };
  if (outros.length > 0) return { kind: 'outro', files: outros };
  if (imagens.length > 0) return { kind: 'imagens', files: imagens };
  if (atlas.length > 0) {
    return {
      kind: 'nada',
      why: 'Um atlas sozinho não abre nada. Solte o `.bone` junto com ele',
    };
  }
  return {
    kind: 'nada',
    why: `Não sei o que fazer com ${limpos.map((n) => n.split('.').pop()).join(', ')}. `
      + 'Solte um .bone, um .psd, imagens, ou um projeto de outro programa',
  };
}

/** A frase da faixa que aparece enquanto o arrasto está por cima da janela. */
export function dropHintFor(plan: DropPlan): string {
  switch (plan.kind) {
    case 'abrir': return `Solte para abrir ${plan.skeleton}`;
    case 'escolher':
      return `Solte para escolher qual abrir: ${plan.skeletons.join(', ')}`;
    case 'psd': return `Solte para importar ${plan.file}`;
    case 'outro': return 'Solte para importar de outro programa';
    case 'imagens':
      return plan.files.length === 1
        ? `Solte para pôr ${plan.files[0]} na aba Imagens`
        : `Solte para pôr ${plan.files.length} imagens na aba Imagens`;
    default: return plan.why;
  }
}

/** `true` quando o plano mexe no documento inteiro e pode descartar trabalho. */
export function replacesDocument(plan: DropPlan): boolean {
  return plan.kind === 'abrir' || plan.kind === 'outro' || plan.kind === 'escolher';
}

// ---------------------------------------------------------------------------
// Pasta numerada vira sequência — degrau 8, tarefa 8.6
// ---------------------------------------------------------------------------

/*
 * Palavra do Humberto: *"pasta numerada vira sequência"*. `olho_01…olho_08`
 * não são oito desenhos: são **um** desenho que pisca, e o formato já sabe
 * disso (§7.10, `sequence`).
 *
 * Os três programas, antes de desenhar (regra da casa):
 *
 * | Programa | Como a folha animada entra |
 * |:---|:---|
 * | Spine 4.2 | arrastar um **grupo numerado** de imagens cria UM attachment `Sequence`; o número no fim do nome é o quadro |
 * | Spriter | a pasta de imagens vira quadros do mesmo objeto, trocados por chave de imagem |
 * | DragonBones | *display list* do slot com vários quadros, trocados pela linha do tempo |
 *
 * O Spine é o mais perto do nosso formato, e é o modelo: **o número no fim do
 * nome manda**, e o que entra é um anexo só. O que decide é isto aqui, que é
 * função pura: entra uma lista de nomes, sai a sequência ou `null`.
 */

/** Uma corrida numerada de imagens: `olho_01…olho_08` (§7.10). */
export interface NumberedRun {
  /** O prefixo comum, que vira o `path` do anexo: `olho_`. */
  path: string;
  /** O número da primeira: `1`. */
  start: number;
  /** Zeros à esquerda: `2` para `01`; `0` para `1` (§7.10). */
  digits: number;
  /** Quantas imagens: `8`. */
  count: number;
  /** Os nomes, sem extensão, na ordem dos números. */
  frames: string[];
}

/** Tira a extensão de imagem do fim do nome, quando houver. */
function withoutExtension(name: string): string {
  const at = name.lastIndexOf('.');
  if (at <= 0) return name;
  return has(name, DROP_IMAGE) ? name.slice(0, at) : name;
}

/**
 * A sequência que estes nomes formam, ou `null`.
 *
 * Para valer como sequência, todos têm de: estar na mesma pasta, terminar em
 * número, ter o **mesmo prefixo**, a **mesma quantidade de algarismos**, e os
 * números têm de ser **seguidos, de um em um**. Duas imagens bastam.
 *
 * Tudo isso é apertado de propósito. `mao_aberta` e `mao_fechada` não são uma
 * sequência, e `fogo_01, fogo_02, fogo_09` também não: um buraco no meio é
 * quase sempre um arquivo que ficou para trás, e virar sequência ali esconderia
 * o erro em vez de mostrá-lo (regra 21).
 */
export function numberedSequence(names: readonly string[]): NumberedRun | null {
  const limpos = [...new Set(names.map((name) => withoutExtension(name.trim())))].filter((n) => n !== '');
  if (limpos.length < 2) return null;

  const partes: Array<{ name: string; path: string; digits: number; number: number }> = [];
  for (const name of limpos) {
    const match = /^(.*?)(\d+)$/.exec(name);
    if (match === null) return null;
    const [, path = '', numero = ''] = match;
    if (numero.length === 0) return null;
    partes.push({ name, path, digits: numero.length, number: Number(numero) });
  }

  const first = partes[0]!;
  if (partes.some((parte) => parte.path !== first.path || parte.digits !== first.digits)) return null;

  partes.sort((a, b) => a.number - b.number);
  for (let i = 1; i < partes.length; i++) {
    if (partes[i]!.number !== partes[i - 1]!.number + 1) return null;
  }

  return {
    path: first.path,
    start: partes[0]!.number,
    // `digits: 0` é "sem zero à esquerda" (§7.10): `olho_1` tem um algarismo
    // e nenhum zero. Só a partir de dois algarismos o campo diz alguma coisa.
    digits: first.digits > 1 ? first.digits : 0,
    count: partes.length,
    frames: partes.map((parte) => parte.name),
  };
}

/** A frase que descreve uma sequência achada, para a dica e o rodapé. */
export function sequenceNotice(run: NumberedRun): string {
  return `${run.count} imagens numeradas de "${run.path}": entram como UM desenho que pisca`;
}

// ---------------------------------------------------------------------------
// A folha animada do Aseprite — §6 item 1, a outra metade
// ---------------------------------------------------------------------------

/*
 * Uma folha do Aseprite chega em **dois arquivos**: o PNG com os quadros lado
 * a lado e um `.json` dizendo onde cada quadro está. Pelo nome, esse `.json` é
 * igual ao do Spine, ao do DragonBones e ao `.scon` do Spriter — então este
 * módulo, que só vê NOMES, não decide nada: ele aponta o par **candidato**, e
 * quem lê o conteúdo (`isAsepriteSheet`) é que decide.
 *
 * Separar assim não é preciosismo: reconhecer pela extensão roubaria o arquivo
 * dos outros três importadores, e o erro só apareceria com um projeto de Spine
 * na mão.
 */

/** O par (PNG, `.json`) que PODE ser uma folha do Aseprite. `null` quando não há. */
export function asepritePair(names: readonly string[]): { image: string; json: string } | null {
  const limpos = names.map((name) => name.trim()).filter((name) => name !== '');
  // Um esqueleto ou um PSD no arrasto manda em tudo: a folha não disputa com eles.
  if (limpos.some((name) => has(name, DROP_SKELETON) || has(name, DROP_PSD))) return null;
  const jsons = limpos.filter((name) => lower(name).endsWith('.json') && !isAtlasName(name));
  if (jsons.length !== 1) return null;
  const imagens = limpos.filter((name) => has(name, DROP_IMAGE));
  if (imagens.length === 0) return null;
  const json = jsons[0]!;
  const base = json.slice(0, -'.json'.length);
  // O PNG de mesmo nome manda; com um só, é ele mesmo. Com vários de nomes
  // diferentes, não dá para adivinhar qual é a folha — e adivinhar aqui seria
  // desenhar o palpite (regra 21).
  const igual = imagens.find((name) => withoutExtension(name) === withoutExtension(base));
  if (igual !== undefined) return { image: igual, json };
  return imagens.length === 1 ? { image: imagens[0]!, json } : null;
}

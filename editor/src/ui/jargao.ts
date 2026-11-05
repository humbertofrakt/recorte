/**
 * **O dicionário da tela** — noite de 05/11/2026.
 *
 * O Humberto: as funções existem, mas *"ou não aparecem, ou têm nome de
 * programador"*. Este módulo é a régua do segundo pedaço: a palavra que o
 * arquivo usa (`slot`, `atlas`, `rig`) e a palavra que a TELA usa.
 *
 * A regra, escrita:
 *
 * | Onde | O termo técnico pode aparecer? |
 * |:---|:---|
 * | **nome** de menu, aba, ferramenta, botão | **não**: só a palavra da pessoa |
 * | **dica** e **rodapé** | só **entre parênteses** ou entre crases, depois da palavra da pessoa: *"o desenho (slot)"* |
 *
 * Nome de arquivo não é jargão: `.bone`, `.boneb`, `.bonez` e `manifest.json`
 * são o que a pessoa vê na pasta, e a dica os cita como estão no disco.
 *
 * As palavras vêm do que a casa JÁ decidiu — o glossário da spec (§1.6, *"a
 * palavra do Humberto e o campo do arquivo"*) e a régua R13 do doc `68` (*"um
 * nome por coisa: desenho (não slot), skin"*). Nada foi inventado de novo.
 * Onde as duas discordam, a mais nova vale, e a linha diz.
 *
 * Módulo puro: texto entra, lista sai. O teste de `menus` passa por ele.
 */

/** Uma linha do dicionário. */
export interface Verbete {
  /** O termo técnico, como o arquivo ou o código o escreve. */
  termo: string;
  /** Como achar o termo num texto. Palavra inteira, sem caixa. */
  acha: RegExp;
  /** A palavra da pessoa, que vai no nome e na frase. */
  palavra: string;
  /** De onde vem a decisão. */
  fonte: string;
}

/*
 * `\b` não conhece acento, e por isso as bordas são escritas à mão: antes e
 * depois do termo, nada que seja letra (com acento) ou número.
 */
const L = '[\\p{L}\\p{N}_]';
const palavra = (corpo: string): RegExp => new RegExp(`(?<!${L}|\\.)(?:${corpo})(?!${L})`, 'iu');

/** O dicionário. A ordem é a da frequência na tela em 05/11/2026. */
export const DICIONARIO: readonly Verbete[] = Object.freeze([
  {
    termo: 'slot', acha: palavra('slots?'), palavra: 'desenho (o lugar da imagem no osso); com entidade dentro, tomada',
    fonte: 'R13 do doc 68 ("desenho, não slot"); spec §1.6 ("Tomada: um slot")',
  },
  { termo: 'atlas', acha: palavra('atlas'), palavra: 'folha de imagens', fonte: 'o que o atlas é: a folha onde as imagens são coladas (spec §10)' },
  { termo: 'attachment', acha: palavra('attachments?'), palavra: 'imagem, desenho', fonte: 'spec §1.6 ("Imagem, desenho: anexo region ou mesh")' },
  { termo: 'skeleton', acha: palavra('skeletons?'), palavra: 'base, boneco', fonte: 'spec §1.6 ("Corpo", "Base")' },
  { termo: 'constraint', acha: palavra('constraints?'), palavra: 'regra', fonte: 'spec §1.6 ("Regra: constraint")' },
  { termo: 'rig', acha: palavra('rig'), palavra: 'os ossos que ela espera', fonte: 'spec §2.8/§4.8 (o contrato da pele e da animação de fora)' },
  { termo: 'mesh', acha: palavra('mesh(?:es)?'), palavra: 'malha', fonte: 'spec §1.6 ("Malha: anexo mesh")' },
  { termo: 'region', acha: palavra('regions?'), palavra: 'imagem', fonte: 'spec §1.6 ("Imagem: anexo region")' },
  { termo: 'setup pose', acha: palavra('setup pose'), palavra: 'base, pose de repouso', fonte: 'spec §1.6 ("Base: a setup pose")' },
  { termo: 'timeline', acha: palavra('timelines?'), palavra: 'linha (da linha do tempo)', fonte: 'spec §1.6 ("Linha: Timeline")' },
  { termo: 'keyframe', acha: palavra('keyframes?|key frames?'), palavra: 'chave', fonte: 'spec §1.6 ("Chave: Key")' },
  { termo: 'socket', acha: palavra('sockets?'), palavra: 'encaixe', fonte: 'spec §7.11 (a entidade sem socket)' },
  { termo: 'bounding box', acha: palavra('bounding ?box(?:es)?|boundingbox'), palavra: 'caixa', fonte: 'a ferramenta Caixa (item 13)' },
  { termo: 'clipping', acha: palavra('clipping'), palavra: 'máscara', fonte: 'item 47 (Máscaras)' },
  { termo: 'manifest', acha: palavra('manifest(?!\\.json)'), palavra: 'a lista do projeto', fonte: 'spec §2.9 (manifest.json: o nome do arquivo fica)' },
]);

/** Tira o que está entre parênteses e entre crases: ali o termo técnico pode morar. */
export function semExplicacao(texto: string): string {
  let fora = texto.replace(/`[^`]*`/g, ' ');
  // Parênteses aninhados são raros; duas passadas bastam.
  for (let i = 0; i < 2; i++) fora = fora.replace(/\([^()]*\)/g, ' ');
  return fora;
}

/** Os termos técnicos que aparecem num NOME (de menu, aba, ferramenta). Nome não leva nenhum. */
export function jargaoNoNome(nome: string): string[] {
  return DICIONARIO.filter((v) => v.acha.test(nome)).map((v) => v.termo);
}

/** Os termos técnicos de uma DICA ou frase de rodapé que estão FORA de parênteses. */
export function jargaoNaFrase(frase: string): string[] {
  const fora = semExplicacao(frase);
  return DICIONARIO.filter((v) => v.acha.test(fora)).map((v) => v.termo);
}

/**
 * Os textos que AINDA levam o termo técnico, e esperam outro dono.
 *
 * Uma lista de exceções é uma dívida: cada linha diz quem paga e por quê. O
 * teste confere os dois lados — o que está fora desta lista não pode ter
 * jargão, e o que está nela **ainda tem** (consertou? tire a linha).
 */
export const ESPERANDO: ReadonlyArray<{ texto: string; dono: string; porque: string }> = Object.freeze([
  ...[
    'Marcar como slot…',
    'Desmarcar o slot',
    'Com o slot marcado escolhido: a imagem de antes volta, como era, e a base sai do projeto',
    'Pôr em teste neste slot…',
    'Desligar o teste deste slot',
    'Com a imagem ou a entidade escolhida na cena: a peça de teste sai do slot.',
    'Pergunta a entidade e o slot dela:',
    'no slot, como a grade;',
    'em todos os slots que mostram a mesma imagem',
    'A imagem de antes volta, como era, no slot',
  ].map((texto) => ({
    texto,
    dono: 'a sessão das tomadas (Entidades)',
    porque: 'o slot que recebe uma entidade é a TOMADA (spec §1.6), e a peça é a "peça encaixada": '
      + 'as palavras e os nomes desses itens vêm da obra das tomadas, nesta mesma noite',
  })),
  {
    texto: 'A malha volta a seguir só o osso do slot',
    dono: 'Malha e pivô (aba Malha e pesos)',
    porque: 'a dica do menu e a do botão da aba são a MESMA frase, letra por letra (malha.test.ts): '
      + 'troca nas duas de uma vez, por "o osso do desenho"',
  },
]);

/** `true` quando o texto é um dos que esperam outro dono. */
export function esperando(texto: string): boolean {
  return ESPERANDO.some((e) => texto.includes(e.texto));
}

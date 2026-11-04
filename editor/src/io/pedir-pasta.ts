/**
 * **Pedir a pasta ao começar o projeto** — rodada 7 (05/10/2026).
 *
 * A decisão do Humberto: *"o programa pede uma pasta ao começar o projeto, como
 * o Spriter"*. No manual do Spriter (`Starting a Project`): `File / New
 * Project`, escolher a pasta raiz; o `.scml` mora nela, e as imagens são
 * procuradas a partir dele.
 *
 * Aqui só a DECISÃO, pura e testada: quando pedir, o que oferecer, o que dizer
 * quando a pessoa cancela, com que nome o projeto nasce, e quando o Salvar grava
 * direto na pasta. O seletor de pasta do sistema não abre sem janela; quem o
 * chama é a casca (`ui/shell-file.ts`).
 */

import { uniqueName } from '../contract.js';

/** Os gestos que precisam de pasta, fora o Novo projeto (que sempre pede). */
export type GestoSemPasta = 'salvar' | 'soltar';

export interface EstadoDaPasta {
  /** O documento tem uma pasta COM NOME (a das imagens soltas não conta). */
  temPasta: boolean;
  /** Veio de "Abrir projeto…": o Salvar já sabe em que arquivo gravar. */
  temArquivoAberto: boolean;
  /** O navegador abre pasta com escrita (`showDirectoryPicker`). */
  seletorDePasta: boolean;
  /** Já disse "agora não" neste documento. */
  recusou: boolean;
}

/**
 * `true` quando o gesto deve primeiro pedir a pasta.
 *
 * Soltar imagem pergunta uma vez por documento: quem disse "agora não" quer
 * as imagens soltas, e perguntar a cada arrasto seria castigo. Salvar pergunta
 * sempre: é o gesto que decide onde o trabalho mora.
 */
export function pedirPastaAntes(gesto: GestoSemPasta, estado: EstadoDaPasta): boolean {
  if (!estado.seletorDePasta || estado.temPasta) return false;
  if (gesto === 'salvar') return !estado.temArquivoAberto;
  return !estado.recusou;
}

export interface EscolhaDoPedido {
  id: 'pasta' | 'sem';
  label: string;
  hint: string;
}

/** As duas escolhas da janela: a pasta primeiro; o caminho de antes, depois. */
export function escolhasDoPedido(gesto: GestoSemPasta): EscolhaDoPedido[] {
  const pasta: EscolhaDoPedido = {
    id: 'pasta',
    label: 'Escolher a pasta do projeto…',
    hint: gesto === 'salvar'
      ? 'Como no Spriter: o projeto mora na pasta das imagens, e o Salvar grava ali, sem perguntar de novo'
      : 'Como no Spriter: o projeto mora na pasta das imagens. As imagens soltas entram na aba Imagens junto',
  };
  const sem: EscolhaDoPedido = gesto === 'salvar'
    ? { id: 'sem', label: 'Salvar só o arquivo .bone…', hint: 'Escolhe onde gravar o arquivo, como antes. O projeto continua sem pasta' }
    : { id: 'sem', label: 'Agora não: as imagens ficam soltas', hint: 'Entram na aba Imagens, só na memória. O projeto continua sem pasta' };
  return [pasta, sem];
}

/** A frase do rodapé quando o pedido foi cancelado: o projeto ficou onde estava. */
export function avisoSemPasta(gesto: GestoSemPasta | 'novo', pastaAtual: string | null): string {
  const onde = pastaAtual === null || pastaAtual === ''
    ? 'o projeto continua sem pasta'
    : `o projeto continua na pasta ${pastaAtual}`;
  switch (gesto) {
    case 'novo': return `Novo projeto: nenhuma pasta escolhida. Nada mudou, e ${onde}`;
    case 'salvar': return `Nenhuma pasta escolhida: nada foi salvo, e ${onde}`;
    case 'soltar': return `Nenhuma pasta escolhida: as imagens não entraram, e ${onde}`;
  }
}

/** O que o Novo projeto faz na pasta escolhida. */
export type PlanoDoNovo =
  | { kind: 'vazio'; nome: string }
  | { kind: 'tem-projeto'; existente: string; nome: string };

const BONE = '.bone';

/**
 * A pasta escolhida já tem um projeto? `nomesNaRaiz` são os arquivos da raiz;
 * `lembrado` é o `.bone` que o Salvar gravou nela (`folderBone`).
 *
 * Com projeto, o novo **não pisa nele**: nasce com o primeiro nome livre ao
 * lado (`heroi2`), e a casca oferece abrir o que já está lá.
 */
export function novoNaPasta(pasta: string, nomesNaRaiz: readonly string[], lembrado: string | null): PlanoDoNovo {
  const bones = nomesNaRaiz.filter((nome) => nome.toLowerCase().endsWith(BONE));
  const base = pasta === '' ? 'sem nome' : pasta;
  const tomados = bones.map((nome) => nome.slice(0, -BONE.length));
  const nome = uniqueName(base, tomados);
  const existente = lembrado !== null && bones.includes(lembrado)
    ? lembrado
    : bones.includes(`${base}${BONE}`) ? `${base}${BONE}` : bones[0] ?? null;
  return existente === null ? { kind: 'vazio', nome } : { kind: 'tem-projeto', existente, nome };
}

export interface SalvarNaPasta {
  /** O Salvar já tem o arquivo em que grava (aberto, ou salvo antes). */
  temArquivoAberto: boolean;
  salvarComo: boolean;
  /** A pasta veio com escrita. */
  pastaGravavel: boolean;
  /** O nome que o arquivo vai ter: `heroi.bone`. */
  nome: string;
  nomesNaRaiz: readonly string[];
}

/**
 * `true` = gravar direto na raiz da pasta, sem a janela do Salvar. Só quando o
 * nome está livre: um `.bone` que ninguém abriu não é sobrescrito calado — aí a
 * janela abre, na pasta, e a pessoa escolhe.
 */
export function salvarDireto(s: SalvarNaPasta): boolean {
  if (s.temArquivoAberto || s.salvarComo || !s.pastaGravavel) return false;
  return !s.nomesNaRaiz.includes(s.nome);
}

/** O nome que o projeto nasce com, sem pasta: `createEmptyFile()`. */
const SEM_NOME = 'sem nome';

/**
 * O nome do `.bone` que o Salvar grava na pasta: o do arquivo, se já tem; o do
 * boneco, se ganhou um; e, para o projeto que nasceu sem nome, **o da pasta** —
 * no Spriter o projeto É a pasta.
 */
export function nomeParaSalvar(path: string | null, boneco: string | undefined, pasta: string): string {
  const limpo = (nome: string): string => nome.replace(/^.*[\/]/, '').replace(/\.bone$/i, '');
  if (path !== null && limpo(path) !== '') return `${limpo(path)}${BONE}`;
  if (boneco !== undefined && boneco.trim() !== '' && boneco !== SEM_NOME) return `${limpo(boneco)}${BONE}`;
  return `${pasta === '' ? 'sem-nome' : pasta}${BONE}`;
}

/**
 * **Salvar como… num lugar só** — rodada 45, lote 1 (doc `57`, foto `39`).
 *
 * Um projeto com mais de um arquivo (uma base com entidade, duas bases) sem
 * pasta: o Salvar como gravava o `.bone` onde a pessoa escolheu e **baixava o
 * manifesto à parte**, para os Downloads — dois destinos para um gesto. Como no
 * Spriter, o projeto é a pasta: antes de perguntar o nome, pede a pasta.
 */
export function pedirPastaNoSalvarComo(s: { temPasta: boolean; temVarios: boolean; seletorDePasta: boolean }): boolean {
  return s.seletorDePasta && !s.temPasta && s.temVarios;
}

/**
 * **A pasta vazia pergunta** — rodada 45, lote 4 (doc `64`, a). Abrir pasta
 * com um personagem aberto e uma pasta SEM imagem nem projeto trocava o
 * personagem por um vazio, calado. O botão da aba Imagens já perguntava.
 */
export function perguntarPastaVazia(s: { imagens: number; temProjeto: boolean; temPersonagem: boolean }): boolean {
  return s.temPersonagem && s.imagens === 0 && !s.temProjeto;
}

/** O `.bone` da raiz de uma pasta que o programa não lembra — rodada 45, lote 4 (4.11). */
export type BoneDaPasta = { kind: 'nenhum' } | { kind: 'um'; nome: string } | { kind: 'varios'; nomes: string[] };

export function boneDaPasta(nomesNaRaiz: readonly string[]): BoneDaPasta {
  const bones = nomesNaRaiz.filter((nome) => nome.toLowerCase().endsWith(BONE)).sort();
  if (bones.length === 0) return { kind: 'nenhum' };
  if (bones.length === 1) return { kind: 'um', nome: bones[0]! };
  return { kind: 'varios', nomes: bones };
}

/**
 * **Salvar como… com o projeto numa pasta** — rodada 45, lote 4 (doc `64`, d).
 * Ia direto ao seletor do `.bone`, e o atlas e a espada ficavam para trás.
 * Como o "Save as" do Spriter, que clona o projeto com as imagens (SR p.33):
 * uma pasta nova leva tudo; o `.bone` sozinho continua sendo uma escolha.
 */
export function salvarComoEscolhas(pasta: string): EscolhaDoPedido[] {
  return [
    {
      id: 'pasta', label: 'Numa pasta nova…',
      hint: 'Escolha a pasta: o .bone, o atlas, as imagens em uso e as entidades vão juntos, e o projeto passa a morar nela',
    },
    {
      id: 'sem', label: 'Só o arquivo .bone…',
      hint: `Escolhe onde gravar o .bone. O atlas e as entidades continuam na pasta ${pasta}`,
    },
  ];
}

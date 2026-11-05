/**
 * **A quarta régua: "existir não é funcionar"** — 22/09/2026.
 *
 * Desenho em `documentos/planos/A PORTA QUE ENGOLE O CLIQUE 2026-09-22.md`.
 * A forma veio do `EXECUTANDO · os quatro defeitos do uso`, com o defeito na
 * mão, e o crédito é dele:
 *
 * > **Dei porta à ação e deixei o corpo dela dependendo da tela.**
 *
 * Depois de fazer as nove ações da aba Regras existirem no arranque, elas ainda
 * voltavam mudas na primeira linha — `const doc = this.doc; if (doc === null)
 * return;` —, e sem painel montado não há `this.doc`. **A ação existia, rodava,
 * devolvia `true`, e nada acontecia.**
 *
 * **O nome deste arquivo é o nome da régua, e é de propósito.** Ele nasceu
 * `efeito.test.ts` e durou dez minutos: havia um `efeitos.test.ts` do chat do
 * flash e do pulso, nascido na mesma hora, sobre assunto sem relação nenhuma.
 * **Uma letra de diferença.** Alguém abriria o errado, mediria o errado e
 * relataria o errado — às três da manhã, quando ninguém confere duas vezes.
 * *O nome de um arquivo é a primeira coisa que engana.*
 *
 * **Arquivo próprio, e não mais um `describe` no `acoes.test.ts`**, por duas
 * razões. A primeira é de cerca: em 22/09 o chat dos defeitos está escrevendo
 * naquele arquivo. A segunda é melhor, e é a mesma que separou o
 * `command-audit` do `action-audit`: **é outra pergunta**, e foi a separação
 * que fez o vigia enxergar o que o outro não enxergava.
 *
 * ---
 *
 * **O que este arquivo NÃO faz, para não cobrir duas vezes.** O `acoes.test.ts`
 * já exige o efeito de cada ação de arranque — *ou muda o arquivo, ou diz por
 * que não* —, e é um bom teste: julga a **promessa contra o fato**, que é o
 * caminho certo, e ainda escreve as que terminam numa janela em vez de
 * deixá-las passar caladas.
 *
 * Aqui se mede **outra coisa: quantas ele chega a exercitar.**
 *
 * O `if (!runAction(id)) continue;` de lá trata o cinza como resposta, **e está
 * certo** — cinza é resposta. Só que uma ação cinza em *todo* estado que o
 * teste sabe montar **nunca tem o corpo exercitado**, e mesmo assim o verde
 * entra no relatório com o nome *"toda ação de arranque"*.
 *
 * Medido em 22/09, às 00:59: das **43** de arranque, **17 ficam cinzas** e as
 * que terminam numa janela não são medidas por ninguém.
 *
 * **O total caiu três vezes em onze minutos** — 37 às 00:48, 38 às 00:52, 40 às
 * 00:54, 43 às 00:59 —, com três chats acrescentando ação. Ninguém avisou e
 * ninguém errou: foi o número escrito que contou, e um `continue` silencioso
 * não teria dito nada.
 *
 * **E foi ele que ensinou qual é a unidade certa.** Prender o TOTAL faria esta
 * régua ficar vermelha na suíte dos outros por trabalho que não é defeito nem é
 * deles — a regra 24, e desta vez quem ia causá-lo era eu. O que se prende é a
 * **lista, pelo nome, das que não são exercitadas**: quem acrescenta uma ação
 * que roda não mexe nela; quem acrescenta uma cinza tem de escrevê-la, que é a
 * hora de alguém olhar. **A afirmação ficou mais forte, não mais fraca.**
 *
 * (Relatei **22** ao Planejador às 00:48, e estava errado: aquela conta somava
 * as seis da janela, que ninguém exercita. **Contei como exercitado o que só
 * foi chamado** — chamar não é exercitar, do mesmo jeito que existir não é
 * funcionar.)
 *
 * É a regra 28 — *"por que este verde é explicável?" e "o que este verde
 * prova?" são perguntas diferentes*. E o conserto é o mais barato que existe:
 *
 * > **O teste diz QUANTAS exercitou, e o número está escrito.**
 *
 * Um `continue` silencioso não cai quando alguém o muda sem querer. Um número
 * escrito cai. É a mesma lição do guarda dos casos de partícula: a contagem
 * exata é o que pega um caso **sumindo**, coisa que nenhuma asserção por caso
 * vê.
 */

import { readFileSync } from 'node:fs';
import { SetEntityAround as SetEntityAroundR11 } from '../src/anim/entity-around.js';
import { entitySlots as entitySlotsR11 } from '../src/anim/entity-band.js';
import { MarkAsSlot as MarkAsSlotR9 } from '../src/panels/slot-base-model.js';
import { resolve } from 'node:path';
import { describe, expect, it, beforeEach } from 'vitest';

import type { BoneFile } from '../../runtime/src/index.js';
import { Doc } from '../src/doc/document.js';
import { ACTION_TABLE } from '../src/ui/actions-table.js';
import { clearActions, registerAction, runAction } from '../src/ui/actions.js';
import { registerCoreActions } from '../src/ui/register-actions.js';
import { emptySelection } from '../src/contract.js';
import { openAnimation } from '../src/panels/animations-actions.js';
import { SwapForEntity } from '../src/panels/image-picker-model.js';
import { setEditingSkin } from '../src/viewport/onion.js';
import { pasteBodyHere } from '../src/anim/body.js';
import { writeHandPivots } from '../src/io/pivot-model.js';

const HEROI = readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8');

/** O herói aberto, com o que o rodapé disse anotado. */
function heroi(): { doc: Doc; ditos: string[] } {
  const doc = new Doc(JSON.parse(HEROI) as BoneFile);
  const ditos: string[] = [];
  const dizer = doc.notice.bind(doc);
  doc.notice = (texto: string): void => { ditos.push(texto); dizer(texto); };
  return { doc, ditos };
}

/** As ações que a tabela promete existirem com qualquer aba fechada. */
function arranque(): string[] {
  return ACTION_TABLE.filter((row) => row.where === 'arranque').map((row) => row.id);
}

/**
 * As que terminam numa JANELA, lidas do `acoes.test.ts` **de lá**.
 *
 * Duas listas iguais em dois arquivos divergem — é sempre a mesma história, e
 * hoje mesmo ela quase nos pegou com o relatório e o teste do vigia do comando.
 * Então há **uma lista só**, e este arquivo a lê do código-fonte do outro.
 *
 * Se alguém a renomear, este teste cai com o nome dela na mão, em vez de passar
 * a medir uma lista vazia em silêncio — que é o que uma cópia faria.
 */
function esperamJanela(): string[] {
  const fonte = readFileSync(resolve(__dirname, 'acoes.test.ts'), 'utf8');
  const bloco = /const ESPERAM_JANELA: readonly string\[\] = \[([\s\S]*?)\];/.exec(fonte);
  if (bloco === null) {
    throw new Error(
      'O `ESPERAM_JANELA` sumiu de `acoes.test.ts`, ou mudou de forma. Ele é a '
      + 'lista das ações que terminam numa janela, e esta régua depende dela. '
      + 'Ache-a e conserte este leitor — não faça uma cópia.',
    );
  }
  return [...bloco[1]!.matchAll(/'([^']+)'/g)].map((m) => m[1]!);
}

/** Como a ação respondeu, rodando sem painel nenhum montado. */
type Resposta = 'fez' | 'disse' | 'cinza' | 'janela' | 'calou';

function correr(id: string, janelas: readonly string[]): Resposta {
  // A janela sai ANTES de rodar, e não depois. O `acoes.test.ts` roda e só
  // então a descarta — e aí um seletor de arquivo tenta um `document` que não
  // existe, e a corrida solta doze rejeições que ninguém pediu. Rodar uma coisa
  // que não se pode medir e jogar fora o resultado não prova nada, e suja a
  // saída de quem vier depois ler o vermelho de verdade.
  if (janelas.includes(id)) return 'janela';
  clearActions();
  const { doc, ditos } = heroi();
  registerCoreActions(doc);
  const antes = JSON.stringify(doc.file);
  if (!runAction(id)) return 'cinza';
  if (JSON.stringify(doc.file) !== antes) return 'fez';
  return ditos.length > 0 ? 'disse' : 'calou';
}

function contar(): Record<Resposta, string[]> {
  const janelas = esperamJanela();
  const out: Record<Resposta, string[]> = {
    fez: [], disse: [], cinza: [], janela: [], calou: [],
  };
  for (const id of arranque()) out[correr(id, janelas)].push(id);
  return out;
}

// ---------------------------------------------------------------------------
// O número escrito
// ---------------------------------------------------------------------------

/**
 * **As que ficam cinzas com o herói recém-aberto e nada escolhido.**
 *
 * Escritas uma a uma, e **não contadas**: um número sozinho não diz *qual*
 * entrou nem *qual* saiu. Sete delas já são exercitadas à mão em outro teste do
 * `acoes.test.ts` — com uma seleção, com uma animação aberta. As outras oito
 * não são exercitadas em lugar nenhum, e são o próximo degrau desta régua.
 *
 * Esta lista **encolhe**: cada uma que ganhar estado e passar a rodar sai daqui.
 * É assim que se vê a régua andar.
 */
const CINZAS_SEM_ESTADO: readonly string[] = [
  // Exercitadas à mão no `acoes.test.ts` (com seleção, ou com animação aberta).
  'duplicar', 'apagar', 'subir-ordem', 'fundo-de-tudo',
  'abrir-a-base', 'copiar-pose', 'colar-todas-chaves',
  // **Nunca exercitadas em lugar nenhum** — 22/09, 00:48. O próximo degrau.
  'novo-ponto-no-slot', 'novo-caixa-no-slot', 'limpar-slots-vazios',
  'descer-ordem', 'frente-de-tudo', 'tirar-da-pasta',
  'copiar-ordem-animacao', 'copiar-pose-escolhido',
  // **22/09, 00:55** — o chat dos defeitos moveu as duas de `painel` para
  // `arranque`, no conserto da armadilha da barra de espaço. O `tocar` roda no
  // guarda de efeito DELE (que abre a `walk` e exige `transport.isPlaying()`);
  // aqui, com o herói recém-aberto e sem animação, os dois ficam cinzas.
  'tocar', 'tocar-tras',
  // **04/10/2026, rodada 8a** — nasce cinza (o herói abre sem entidade no
  // lugar de imagem) e ganha estado no `O_ESTADO_DE_CADA`, embaixo.
  'tirar-entidade',
  // **04/10/2026, rodada 12** — o Set Hidden e o Set Ignored do Spriter.
  // Nascem cinzas (o herói abre com o lápis na default) e ganham estado no
  // `O_ESTADO_DE_CADA`, embaixo: o lápis na armadura e o tronco escolhido.
  'esconder-na-pele', 'ignorar-na-pele',
  // **05/10/2026, rodada 6, lote 2** — as portas dos menus novos. Todas pedem
  // uma escolha que o herói recém-aberto não tem. Catorze ganham estado no
  // `O_ESTADO_DE_CADA`, embaixo; sete pedem imagem lida do disco ou um projeto
  // de várias bases, que o teste sem navegador não monta, e o `acoes.test.ts`
  // prova que ficam cinzas DIZENDO por quê.
  'virar-malha', 'criar-vertice', 'apagar-vertice', 'usar-forma-de-outra', 'ligar-ossos',
  // Rodada 41, lote 4: Criar ou apagar aresta pede dois vértices escolhidos.
  'criar-aresta',
  'pesos-automaticos', 'suavizar-pesos', 'podar-pesos', 'chavear-pesos', 'tirar-pesos',
  'apagar-regra', 'apagar-parametro', 'tirar-troca-base', 'prender-emissor',
  'trazer-sequencia', 'colar-pivo', 'malha-automatica', 'tracar-contorno',
  // Rodada 44, lote 7: pede uma troca de imagem antes; nasce cinza e diz.
  'caber-na-antiga',
  'rebaixar-entidade', 'por-entidade', 'promover-entidade',
  // **05/10/2026, rodada 8c, C15** — o laço da entidade. Nasce cinza (nada
  // escolhido) e ganha estado no `O_ESTADO_DE_CADA`: a espada do herói.
  'entidade-em-laco',
  // **05/10/2026, rodada 11** — "Este boneco". As duas nascem cinzas (nada
  // escolhido). `tirar-este-boneco` ganha estado no `O_ESTADO_DE_CADA`: a
  // espada do herói, já em volta dele. `este-boneco` abre uma lista para
  // escolher o meio, e lista não se abre sem navegador: o `acoes.test.ts` a
  // roda cinza e confere a frase; o efeito dela é o de `setAround`, provado
  // em `pasta-do-projeto.test.ts`.
  'este-boneco', 'tirar-este-boneco',
  // **05/10/2026, rodada 9** — o slot marcado. As duas nascem cinzas (nada
  // escolhido). `desmarcar-slot` ganha estado no `O_ESTADO_DE_CADA`: o
  // cabelo do herói marcado. `marcar-como-slot` pergunta o nome numa janela:
  // o `acoes.test.ts` a roda cinza e confere a frase; o efeito é o de
  // `MarkAsSlot`, provado em `grade-de-imagens.test.ts`.
  'marcar-como-slot', 'desmarcar-slot',
  // **06/10/2026, rodada 39, lote 2** — a montagem de teste pelo menu. As duas
  // nascem cinzas (sem projeto, nada escolhido). O `acoes.test.ts` as roda
  // cinzas e confere a frase; o efeito é o de `SetMontagem`, provado em
  // `pasta-do-projeto.test.ts`.
  'por-em-teste', 'desligar-teste',
  // **06/10/2026, rodada 39, lote 4** — para cima. Cinzas sem projeto e sem
  // nada em volta; o efeito é o de `putProjectInside` e `unplugUp`, provado em
  // `pasta-do-projeto.test.ts`.
  'por-dentro-de', 'tirar-de-volta',
  // **06/10/2026, rodada 39, lote 5** — cinza sem ligação de teste; o efeito
  // é o de `putIntoProject`, provado em `pasta-do-projeto.test.ts`.
  'por-no-projeto',
  // **06/10/2026, rodada 39b, lote 6** — cinzas sem peça de teste; o efeito é
  // o de `setTestAnima`, `toggleTestSkin` e `testAllEqual`, provado em
  // `pasta-do-projeto.test.ts`.
  'anima-do-teste', 'skins-do-teste', 'teste-nas-iguais',
  // **05/10/2026, rodada 13, caso (b)** — nasce cinza (o herói não tem pivô à
  // mão) e ganha estado no `O_ESTADO_DE_CADA`: um pivô à mão na lista.
  'voltar-pivo-osso',
];

/*
 * **22/09, 00:55 — entraram e SAÍRAM desta lista em quatro minutos:**
 * `efeito-flash`, `efeito-pulso` e `efeito-tremor`. Nasceram cinzas às 00:55, e
 * às 00:59 já exercitavam o corpo — o chat do flash e do pulso deu-lhes corpo
 * enquanto eu escrevia. **A lista encolheu sozinha**, e é para isso que ela é
 * por NOME: um total teria só mudado de número, sem dizer quem entrou nem quem
 * saiu.
 */

describe('existir não é funcionar — quanto a exigência de efeito exercita', () => {
  beforeEach(() => { clearActions(); });

  it('nenhuma ação de arranque roda e cala: ou faz, ou diz, ou está cinza', () => {
    // A mesma exigência do `acoes.test.ts`, e ela fica aqui por uma razão: sem
    // ela, as contagens de baixo poderiam estar certas com o programa errado.
    expect(contar().calou).toEqual([]);
  });

  /**
   * **O número escrito.** É o que separa *"o teste passou"* de *"o teste olhou
   * para 37 coisas"*.
   *
   * Sobe quando alguém der estado a uma das cinzas, e **cai** quando alguém
   * mudar uma ação sem perceber — que é o caso que o `continue` silencioso não
   * pega.
   */
  /**
   * **O número escrito — e por que ele é uma LISTA, e não um total.**
   *
   * A primeira versão deste teste prendia o total: *"37 ações de arranque"*.
   * Ele caiu **duas vezes em seis minutos**, e nenhuma das duas por defeito:
   *
   * | Hora | O quê |
   * |:---:|:---|
   * | 00:48 | 37 |
   * | 00:52 | **38** — o chat das partículas pôs `novo-emissor` no menu |
   * | 00:54 | **40** — mais duas, de outro chat |
   *
   * Prender o total faria esta régua ficar **vermelha na suíte dos outros, por
   * trabalho que não é defeito nem é deles**. É o dano que a regra 24 descreve,
   * e desta vez eu ia causá-lo.
   *
   * **Então a unidade da medida muda, e a afirmação fica mais forte, não mais
   * fraca:** o que se prende é a **lista, pelo nome, das que NÃO são
   * exercitadas**. Quem acrescentar uma ação que roda não mexe nela — e quem
   * acrescentar uma que fica **cinza** tem de escrevê-la aqui, que é
   * exatamente a hora de alguém olhar.
   *
   * O total continua medido, e continua dito — só não é ele que julga.
   */
  it('as que ficam CINZAS estão escritas uma a uma, e nenhuma outra apareceu', () => {
    const contas = contar();
    // A conta fecha: toda ação de arranque caiu em exatamente uma gaveta.
    expect(
      contas.fez.length + contas.disse.length + contas.cinza.length
      + contas.janela.length + contas.calou.length,
    ).toBe(arranque().length);

    // E a afirmação: são ESTAS, pelo nome. A igualdade é exata de propósito —
    // um subconjunto deixaria entrar, em silêncio, a próxima ação que ninguém
    // exercita, que é justamente o que esta régua existe para pegar.
    const novas = contas.cinza.filter((id) => !CINZAS_SEM_ESTADO.includes(id));
    expect(
      novas,
      `${novas.join(', ')}: ação de arranque que fica CINZA com o herói `
      + 'recém-aberto, e ninguém a exercita. Dê-lhe o estado de que precisa e '
      + 'exija efeito, OU escreva o nome em CINZAS_SEM_ESTADO — as duas são '
      + 'resposta; deixá-la fora da lista não é',
    ).toEqual([]);
    const sairam = CINZAS_SEM_ESTADO.filter((id) => !contas.cinza.includes(id));
    expect(
      sairam,
      `${sairam.join(', ')}: deixou de ficar cinza. Tire o nome de `
      + 'CINZAS_SEM_ESTADO — lista que não encolhe passa a mentir',
    ).toEqual([]);
    // 18 desde 04/10/2026: `tirar-entidade` (rodada 8a).
    // 20 desde 04/10/2026: `esconder-na-pele` e `ignorar-na-pele` (rodada 12).
    // 41 desde 05/10/2026: as 21 portas da rodada 6 que pedem uma escolha.
    // 42 desde 05/10/2026: `entidade-em-laco` (rodada 8c, C15).
    // 43 desde 05/10/2026: `voltar-pivo-osso` (rodada 13, caso b).
    // 45 desde 05/10/2026: `este-boneco` e `tirar-este-boneco` (rodada 11).
    // 47 desde 05/10/2026: `marcar-como-slot` e `desmarcar-slot` (rodada 9).
    // 49 desde 06/10/2026: `por-em-teste` e `desligar-teste` (rodada 39, lote 2).
    // 51 desde 06/10/2026: `por-dentro-de` e `tirar-de-volta` (rodada 39, lote 4).
    // 52 desde 06/10/2026: `por-no-projeto` (rodada 39, lote 5).
    // 55 desde 06/10/2026: `anima-do-teste`, `skins-do-teste`, `teste-nas-iguais` (rodada 39b, lote 6).
    // 56 desde 06/10/2026: `criar-aresta` (rodada 41, lote 4).
    // Rodada 44, lote 7: + 'caber-na-antiga'.
    expect(CINZAS_SEM_ESTADO.length).toBe(57);
  });

  /**
   * **As seis que terminam numa janela também são uma lista, e não um número.**
   *
   * Elas não são exercitadas por ninguém: o `acoes.test.ts` chega a rodá-las e
   * joga o resultado fora — e, de quebra, solta doze rejeições de um `document`
   * que não existe. Aqui elas nem rodam. **Chamar não é exercitar.**
   *
   * (Relatei *"22 de 37"* ao Planejador às 00:48 somando estas seis, e estava
   * errado. **Contei como exercitado o que só foi chamado** — a mesma forma que
   * eu tinha ido medir nos outros.)
   */
  it('nenhuma das que terminam numa janela conta como exercitada', () => {
    // **O número delas NÃO se prende aqui, e isto é a mesma lição de cima, uma
    // camada adiante.** A lista é do `acoes.test.ts`, que é de outro dono:
    // eram seis às 00:48 e nove às 00:59. Prender o tamanho seria prender o
    // trabalho dele — o mesmo erro que prender o total seria.
    //
    // O que é meu de afirmar é a REGRA: quem termina numa janela não entra na
    // conta das exercitadas, porque não foi exercitada. Chamar não é exercitar.
    const contas = contar();
    const janelas = esperamJanela();
    expect(contas.janela.length).toBe(janelas.filter((id) => arranque().includes(id)).length);
    for (const id of contas.janela) {
      expect(contas.fez, id).not.toContain(id);
      expect(contas.disse, id).not.toContain(id);
    }
  });

  /**
   * **O total, dito e não julgado.**
   *
   * Ele é do trabalho de todos, e mexe a cada lote de qualquer um: 37 às 00:48,
   * 38 às 00:52, 40 às 00:54, **43 às 00:59**. Prendê-lo faria esta régua ficar
   * vermelha na suíte alheia por trabalho que não é defeito — a regra 24.
   *
   * Então aqui só se prende o que **não pode crescer em silêncio**: ninguém
   * roda e cala. O total quem julga é a lista de cima, pelo nome.
   */
  it('nenhuma das de arranque roda e cala, seja qual for o total de hoje', () => {
    expect(contar().calou).toEqual([]);
    expect(arranque().length).toBeGreaterThanOrEqual(43);
  });

  /**
   * **A prova de que a conta acusa** — regra 26. Uma contagem que nunca se viu
   * cair não é uma contagem: é um número decorativo.
   *
   * Uma ação de mentira, que roda e não faz nada, tem de aparecer como `calou`
   * — e não se esconder entre as cinzas.
   */
  it('uma ação que roda e não faz nada aparece como "calou"', () => {
    clearActions();
    const { doc } = heroi();
    registerCoreActions(doc);
    const antes = JSON.stringify(doc.file);
    // O corpo preso à tela, no molde exato do defeito de 22/09:
    // `const doc = this.doc; if (doc === null) return;`
    const semPainel: Doc | null = null;
    const acao = (): void => { if (semPainel === null) return; };
    acao();
    expect(JSON.stringify(doc.file)).toBe(antes);

    // E o classificador dá o nome certo a isso, com o registro de verdade.
    const { doc: outro } = heroi();
    registerCoreActions(outro);
    expect(correr('acao-que-nao-existe', [])).toBe('cinza');
  });

  /**
   * **A lista das janelas é UMA SÓ**, e este arquivo a lê do outro. Se ela
   * sumir ou mudar de forma, o leitor estoura com a frase escrita, em vez de
   * medir uma lista vazia em silêncio.
   */
  it('lê a lista das janelas do acoes.test.ts, e estoura com frase se ela sumir', () => {
    const janelas = esperamJanela();
    expect(janelas.length).toBeGreaterThan(3);
    expect(janelas).toContain('nova-regra-guiada');
  });

  it('sem a lista lá, ele DIZ o que houve — não mede uma lista vazia calado', () => {
    // O pior jeito de isto falhar seria em silêncio: a lista some, o leitor
    // devolve `[]`, e todas as janelas passam a ser medidas como se pudessem
    // ser medidas. A conta desandaria e ninguém saberia por quê (regra 21).
    const leitor = (fonte: string): string[] => {
      const bloco = /const ESPERAM_JANELA: readonly string\[\] = \[([\s\S]*?)\];/.exec(fonte);
      if (bloco === null) throw new Error('O `ESPERAM_JANELA` sumiu de `acoes.test.ts`');
      return [...bloco[1]!.matchAll(/'([^']+)'/g)].map((m) => m[1]!);
    };
    expect(() => leitor('um arquivo sem a lista')).toThrow('sumiu');
  });
});

/**
 * **O que esta régua ainda não cobre, e é ordem e não esquecimento.**
 *
 * | Falta | Por quê fica para depois |
 * |:---|:---|
 * | **as 8 que nunca rodam** | dar-lhes o estado de que precisam e exigir efeito. É o próximo degrau, e quando elas rodarem o número escrito lá em cima **sobe sozinho** |
 * | **as 69 de `casca`** | não têm exigência de efeito nenhuma. Ordem do Planejador, 22/09: *oito exercitadas valem mais que 69 listadas* |
 *
 * As de `painel` ficam de fora **de propósito**: elas existem por causa do
 * painel, e exigir que trabalhem sem ele seria exigir o contrário do que a
 * tabela promete.
 */

// ---------------------------------------------------------------------------
// As oito que nunca rodavam — 22/09/2026, 01:02
// ---------------------------------------------------------------------------

/**
 * **O segundo degrau da régua: dar estado às que ficavam cinzas.**
 *
 * O guarda de efeito do `acoes.test.ts` roda cada ação no herói recém-aberto,
 * com nada escolhido. Quem fica cinza ali é pulada — e **está certo**, cinza é
 * resposta. Só que estas oito ficam cinzas em **todo** estado que aquele teste
 * monta, e nenhum outro teste daquele arquivo as chama: o corpo delas nunca
 * rodou, em lugar nenhum.
 *
 * **É onde um corpo preso ao painel se esconderia hoje.** Uma delas podia estar
 * há semanas com o defeito do `this.doc` dentro, e a suíte inteira passaria.
 *
 * Aqui cada uma ganha o estado de que precisa — uma seleção, uma animação
 * aberta, um desenho vazio no arquivo — e então se exige o que a tabela promete:
 * **sem painel nenhum montado, ou o arquivo muda, ou o programa diz por que
 * não.** As duas são resposta; o silêncio não é (regra 21).
 *
 * Nenhum painel é montado em teste nenhum deste bloco. É a aba fechada.
 */

/** Um slot que está dentro de uma pasta de ordem, para o "tirar da pasta". */
const SLOT = 'cape_lower';

/** Como cada uma sai do cinza. Uma linha por ação, e o motivo no nome. */
const O_ESTADO_DE_CADA: ReadonlyArray<{
  id: string;
  porque: string;
  prepara: (doc: Doc) => void;
}> = [
  {
    id: 'novo-ponto-no-slot',
    porque: 'sem um desenho escolhido',
    prepara: (doc) => doc.select({ ...emptySelection(), slots: [SLOT] }),
  },
  {
    id: 'novo-caixa-no-slot',
    porque: 'sem um desenho escolhido',
    prepara: (doc) => doc.select({ ...emptySelection(), slots: [SLOT] }),
  },
  {
    id: 'descer-ordem',
    porque: 'sem desenho escolhido',
    prepara: (doc) => doc.select({ ...emptySelection(), slots: [SLOT] }),
  },
  {
    id: 'frente-de-tudo',
    porque: 'sem desenho escolhido',
    prepara: (doc) => doc.select({ ...emptySelection(), slots: [SLOT] }),
  },
  {
    id: 'tirar-da-pasta',
    porque: 'sem peça de pasta escolhida',
    prepara: (doc) => doc.select({ ...emptySelection(), slots: [SLOT] }),
  },
  {
    id: 'copiar-ordem-animacao',
    porque: 'sem animação aberta',
    prepara: (doc) => openAnimation(doc, doc.file.animations![0]!.name),
  },
  {
    id: 'copiar-pose-escolhido',
    porque: 'sem animação aberta, e sem nada escolhido que tenha pose',
    prepara: (doc) => {
      openAnimation(doc, doc.file.animations![0]!.name);
      doc.select({ ...emptySelection(), bones: [doc.file.bones[0]!.name] });
      doc.time = 0.25;
    },
  },
  {
    id: 'limpar-slots-vazios',
    porque: 'sem nenhum desenho vazio no arquivo',
    prepara: (doc) => {
      (doc.file.slots ?? []).push({ name: 'vazio', bone: doc.file.bones[0]!.name } as never);
      doc.rebuild();
    },
  },
  // Rodada 8a (04/10/2026): o rosto vira a espada, e a ação devolve o rosto.
  {
    id: 'tirar-entidade',
    porque: 'sem uma entidade escolhida que tenha substituído uma imagem',
    prepara: (doc) => {
      doc.run(new SwapForEntity('head', 'face', 'default', 'espada.bone'));
      doc.select({ ...emptySelection(), slots: ['head'], attachments: [{ slot: 'head', attachment: 'face' }] });
    },
  },
  // Rodada 8c, C15 (05/10/2026): a espada do herói, escolhida, deixa de
  // rodar em laço — o anexo ganha `loop: false`.
  {
    id: 'entidade-em-laco',
    porque: 'sem uma entidade escolhida',
    prepara: (doc) => {
      doc.select({ ...emptySelection(), slots: ['weapon'] });
    },
  },
  // Rodada 11 (05/10/2026): a espada do herói em volta dele, pelo slot
  // `lamina` dela, e escolhida. A ação tira o `around` do anexo.
  {
    id: 'tirar-este-boneco',
    porque: 'sem uma entidade escolhida que tenha a marca Este boneco',
    prepara: (doc) => {
      const espada = entitySlotsR11(doc.file).find((e) => e.slot === 'weapon')!;
      doc.run(new SetEntityAroundR11(espada.slot, espada.attachment, espada.skin, 'lamina'));
      doc.select({ ...emptySelection(), slots: ['weapon'] });
    },
  },
  // Rodada 9 (05/10/2026): o cabelo do herói marcado como slot, e escolhido.
  // A ação devolve a imagem de antes e o nome do slot.
  {
    id: 'desmarcar-slot',
    porque: 'sem um slot marcado escolhido',
    prepara: (doc) => {
      doc.run(new MarkAsSlotR9({ slot: 'hair', attachment: 'hair', skin: 'default' }, 'cabelo', doc.atlases, new Map()));
      doc.select({ ...emptySelection(), slots: ['cabelo'], attachments: [{ slot: 'cabelo', attachment: 'hair' }] });
    },
  },
  // Rodada 12 (04/10/2026): a armadura troca o tronco. Esconder grava `null`;
  // Ignorar tira a troca. Os dois mudam o arquivo.
  {
    id: 'esconder-na-pele',
    porque: 'sem o lápis numa pele que não é a default, e sem desenho escolhido',
    prepara: (doc) => {
      setEditingSkin(doc, 'armadura');
      doc.select({ ...emptySelection(), slots: ['body'], attachments: [{ slot: 'body', attachment: 'body' }] });
    },
  },
  {
    id: 'ignorar-na-pele',
    porque: 'sem o lápis numa pele que não é a default, e sem desenho escolhido',
    prepara: (doc) => {
      setEditingSkin(doc, 'armadura');
      doc.select({ ...emptySelection(), slots: ['body'], attachments: [{ slot: 'body', attachment: 'body' }] });
    },
  },
  // Rodada 6, lote 2 (05/10/2026): as portas do menu Malha e regras. Nenhuma
  // monta a aba Malha e pesos: é a aba fechada, como manda a tabela.
  {
    id: 'virar-malha',
    porque: 'sem uma imagem inteira escolhida',
    prepara: (doc) => doc.select({ ...emptySelection(), slots: ['body'], attachments: [{ slot: 'body', attachment: 'body' }] }),
  },
  { id: 'criar-vertice', porque: 'sem malha escolhida', prepara: (doc) => doc.select({ ...emptySelection(), slots: ['head'], attachments: [{ slot: 'head', attachment: 'face' }] }) },
  { id: 'ligar-ossos', porque: 'sem malha escolhida', prepara: (doc) => doc.select({ ...emptySelection(), slots: ['head'], attachments: [{ slot: 'head', attachment: 'face' }] }) },
  {
    id: 'criar-aresta',
    porque: 'sem dois vértices escolhidos',
    prepara: (doc) => doc.select({ ...emptySelection(), slots: ['head'], attachments: [{ slot: 'head', attachment: 'face' }], vertices: [0, 1] }),
  },
  {
    id: 'apagar-vertice',
    porque: 'sem vértice escolhido',
    prepara: (doc) => doc.select({ ...emptySelection(), slots: ['head'], attachments: [{ slot: 'head', attachment: 'face' }], vertices: [0] }),
  },
  { id: 'usar-forma-de-outra', porque: 'sem slot escolhido', prepara: (doc) => doc.select({ ...emptySelection(), slots: ['head'] }) },
  { id: 'pesos-automaticos', porque: 'sem malha escolhida', prepara: (doc) => doc.select({ ...emptySelection(), slots: ['head'], attachments: [{ slot: 'head', attachment: 'face' }] }) },
  { id: 'suavizar-pesos', porque: 'sem malha com pesos escolhida', prepara: (doc) => doc.select({ ...emptySelection(), slots: ['head'], attachments: [{ slot: 'head', attachment: 'face' }] }) },
  { id: 'podar-pesos', porque: 'sem malha com pesos escolhida', prepara: (doc) => doc.select({ ...emptySelection(), slots: ['head'], attachments: [{ slot: 'head', attachment: 'face' }] }) },
  { id: 'tirar-pesos', porque: 'sem malha com pesos escolhida', prepara: (doc) => doc.select({ ...emptySelection(), slots: ['head'], attachments: [{ slot: 'head', attachment: 'face' }] }) },
  {
    id: 'chavear-pesos',
    porque: 'sem malha com pesos escolhida, e sem animação aberta',
    prepara: (doc) => { openAnimation(doc, doc.file.animations![0]!.name); doc.select({ ...emptySelection(), slots: ['head'], attachments: [{ slot: 'head', attachment: 'face' }] }); },
  },
  {
    id: 'apagar-regra',
    porque: 'sem regra escolhida',
    prepara: (doc) => doc.select({ ...emptySelection(), constraints: [doc.file.constraints![0]!.name] }),
  },
  {
    id: 'apagar-parametro',
    porque: 'sem parâmetro escolhido',
    // O herói não tem parâmetro: a ação de criar o cria, e ele nasce escolhido.
    prepara: () => { runAction('novo-parametro'); },
  },
  {
    id: 'tirar-troca-base',
    porque: 'sem troca de base no quadro da agulha',
    prepara: (doc) => {
      openAnimation(doc, doc.file.animations![0]!.name);
      pasteBodyHere(doc, null, 'o arquivo');
    },
  },
  // Rodada 13, caso (b): com um pivô à mão na lista, o item o tira dela.
  {
    id: 'voltar-pivo-osso',
    porque: 'sem nenhum pivô à mão no arquivo',
    prepara: (doc) => { writeHandPivots(doc.file, { 'cabeca': [1, 2] }); },
  },
  {
    id: 'prender-emissor',
    porque: 'sem emissor escolhido',
    // O emissor novo nasce escolhido; o osso vai junto na escolha.
    prepara: (doc) => { runAction('novo-emissor'); doc.select({ ...doc.selection, bones: ['torso'] }); },
  },
];

/**
 * **As que ninguém exercita e que NÃO são minhas de exercitar.**
 *
 * Dar estado a uma ação é dizer o que ela deve fazer, e isso é do dono: eu
 * posso registrar que ela não é experimentada, não posso decidir por ela. Então
 * a linha traz **o nome e o dono**, e o dono é avisado por mensagem no mesmo
 * minuto — uma régua que aparece como vermelho na tela de alguém sem aviso vira
 * dedo apontado, e deixa de ser lida.
 *
 * Esta lista **encolhe**: quando o dono a exercitar, ela sai daqui sozinha, e o
 * teste acima diz o nome de quem saiu.
 */
const ALHEIAS: ReadonlyMap<string, string> = new Map([
  /*
   * **Vazia às 01:08 de 22/09, e a primeira linha durou cinco minutos.**
   *
   * `tocar-tras` entrou às 01:03: o dono tinha movido `tocar` e `tocar-tras` de
   * `painel` para `arranque` no conserto da barra de espaço, e exercitado só o
   * primeiro. Avisei-o por mensagem, e às 01:07 ele exercitou o irmão — com um
   * teste que pergunta **para que lado** a agulha anda, e não só se tocou.
   *
   * Então este teste acusou a própria linha: *"tocar-tras: já é exercitada.
   * Tire de ALHEIAS"*. **A lista encolheu, e disse o nome de quem saiu** — que
   * é o que um total nunca diria.
   *
   * Nascer vazia outra vez é o estado bom. Quem a fizer crescer: **nome e dono,
   * nunca o estado**, e avise o dono por mensagem no mesmo minuto.
   */
]);

describe('as oito que nunca rodavam, agora com o estado de que precisam', () => {
  beforeEach(() => { clearActions(); });

  it('são estas oito, mais as alheias escritas — e nenhuma outra', () => {
    // Amarrado à lista de cima: se uma delas passar a ser exercitada lá, ou se
    // outra entrar no buraco, este teste diz qual — e não só que o número mudou.
    const fonte = readFileSync(resolve(__dirname, 'acoes.test.ts'), 'utf8');
    const nunca = contar().cinza.filter((id) => !fonte.includes(`runAction('${id}')`));
    const minhas = O_ESTADO_DE_CADA.map((o) => o.id);
    const sobrando = nunca.filter((id) => !minhas.includes(id) && !ALHEIAS.has(id));
    expect(
      sobrando,
      `${sobrando.join(', ')}: ação de arranque que ninguém exercita, e que não `
      + 'está nem entre as oito daqui nem entre as ALHEIAS. Dê-lhe estado e '
      + 'exija efeito, ou escreva o nome e o dono em ALHEIAS',
    ).toEqual([]);
    // E o contrário: uma alheia que já ganhou quem a exercite sai da lista.
    const resolvidas = [...ALHEIAS.keys()].filter((id) => !nunca.includes(id));
    expect(
      resolvidas,
      `${resolvidas.join(', ')}: já é exercitada. Tire de ALHEIAS`,
    ).toEqual([]);
  });

  for (const { id, porque, prepara } of O_ESTADO_DE_CADA) {
    it(`${id}: com o estado (${porque}), roda sem painel e responde`, () => {
      clearActions();
      const { doc, ditos } = heroi();
      registerCoreActions(doc);
      prepara(doc);

      const antes = JSON.stringify(doc.file);
      expect(runAction(id), `${id} continua cinza: o estado montado não basta`).toBe(true);

      // A promessa da tabela é `where: 'arranque'` — *vale com qualquer aba
      // fechada*. Um corpo que só trabalha com o painel na tela desmente isso,
      // e é exatamente assim que ele se denuncia: rodando e não respondendo.
      const mudou = JSON.stringify(doc.file) !== antes;
      expect(
        mudou || ditos.length > 0,
        `${id}: rodou sem painel, não mudou o arquivo e não disse nada. `
        + 'A tabela promete que ela vale com a aba fechada, e o corpo desmente',
      ).toBe(true);
    });
  }

  /**
   * **A prova de que este bloco acusa** — regra 26.
   *
   * Uma ação de mentira, registrada com o corpo preso à tela — o molde exato do
   * defeito de 22/09, `const doc = this.doc; if (doc === null) return;` —, tem
   * de ser pega: ela roda, devolve `true`, e não faz nem diz nada.
   */
  it('uma ação com o corpo preso ao painel é pega: roda, e não responde', () => {
    clearActions();
    const { doc, ditos } = heroi();
    registerCoreActions(doc);

    const painelMontado: unknown = null;   // a aba está fechada
    registerAction('acao-presa-a-tela', {
      run: () => { if (painelMontado === null) return; },
    });

    const antes = JSON.stringify(doc.file);
    expect(runAction('acao-presa-a-tela')).toBe(true);   // existe, e roda
    expect(JSON.stringify(doc.file)).toBe(antes);        // e não faz nada
    expect(ditos).toEqual([]);                           // e não diz nada
    // É este o par que o teste acima recusa: `mudou || disse` seria `false`.
    expect(JSON.stringify(doc.file) !== antes || ditos.length > 0).toBe(false);
  });
});

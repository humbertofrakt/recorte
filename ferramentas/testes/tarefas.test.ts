/**
 * O teste da folha **por tarefa** — parte 2 do plano
 * `documentos/planos/COMO SABER O QUE O PROGRAMA TEM 2026-09-18.md`.
 *
 * **A mesma régua do relatório**: este arquivo e o `npm run tarefas` chamam as
 * funções de `ferramentas/provas/tarefas.ts`. Duas contas divergem numa semana,
 * e a folha passa a mentir com cara de gerada.
 *
 * ## O que este teste existe para impedir
 *
 * | O perigo | A pergunta |
 * |:---|:---|
 * | a folha **se medir a si mesma** | o que o medidor lê inclui o que o medidor escreve? |
 * | a coluna 1 **envelhecer** | há tarefa nomeada apontando para ação que não existe mais? |
 * | uma ação nova **entrar sem nome** | toda ação tem nome de tarefa, ou motivo escrito? |
 * | a coluna Provado **dar verde falso** | o que cada verde prova, e não só se ele é explicável? |
 *
 * A última linha é a regra 28, e é a que já pegou algo: a primeira versão desta
 * régua contava a **tecla apertada** como prova e deu três verdes falsos de dez.
 * Os testes de `semComentarios` e de `acoesProvadas` aqui embaixo são os dois
 * que impedem aquilo de voltar — e **cada um deles já falhou de verdade**, com
 * o código de antes do conserto (regra 26).
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AS_PROVAS, GRUPOS, O_QUE_O_MEDIDOR_ESCREVE, TAREFAS,
  acoesComTeclaApertada, acoesProvadas, folhaDeTarefas, gruposDesconhecidos,
  semComentarios, semNomeDeTarefa, tarefasOrfas,
} from '../provas/tarefas.js';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

/** O texto de cada prova, pelo NOME. Igual ao do relatório, de propósito. */
function provas(): Map<string, string> {
  const out = new Map<string, string>();
  for (const caminho of AS_PROVAS) {
    out.set(caminho, readFileSync(resolve(RAIZ, caminho), 'utf8'));
  }
  return out;
}

describe('a folha não se mede a si mesma', () => {
  /*
   * A armadilha da parte 1, com a porta fechada: o vigia nasceu verde porque a
   * lista de exceções dele citava os nomes que ele julgava, e o arquivo dela
   * morava dentro da varredura.
   */
  it('nenhum arquivo do medidor está na lista das provas', () => {
    const dentro = O_QUE_O_MEDIDOR_ESCREVE.filter((f) => AS_PROVAS.includes(f));
    expect(dentro).toEqual([]);
  });

  it('nenhuma prova mora onde a folha é escrita', () => {
    const emDocumentos = AS_PROVAS.filter((f) => f.startsWith('documentos/'));
    expect(emDocumentos).toEqual([]);
  });

  it('a lista das provas tem nome de arquivo, e não de pasta', () => {
    for (const caminho of AS_PROVAS) {
      expect(caminho, `${caminho} não tem extensão: é pasta?`).toMatch(/\.(mjs|ts|js)$/);
    }
  });
});

describe('a coluna 1 não envelhece', () => {
  it('toda ação tem nome de tarefa, ou motivo escrito', () => {
    const faltam = semNomeDeTarefa(folhaDeTarefas(provas()));
    expect(
      faltam.map((l) => `${l.action} (${l.label || 'sem nome de menu'})`),
      'ação nova sem nome de tarefa: ponha uma linha em TAREFAS, ou o motivo em NAO_E_TAREFA',
    ).toEqual([]);
  });

  it('nenhuma tarefa nomeada aponta para ação que não existe', () => {
    expect(
      tarefasOrfas(folhaDeTarefas(provas())),
      'a ação saiu do programa e o nome dela ficou na folha: tire a linha',
    ).toEqual([]);
  });

  it('todo grupo usado está na lista de grupos', () => {
    expect(gruposDesconhecidos()).toEqual([]);
  });

  it('nenhuma tarefa está escrita duas vezes', () => {
    const vistos = new Set<string>();
    const repetidos: string[] = [];
    for (const t of TAREFAS) {
      if (vistos.has(t.action)) repetidos.push(t.action);
      vistos.add(t.action);
    }
    expect(repetidos).toEqual([]);
  });

  it('a folha tem nome para a grande maioria das ações', () => {
    // Uma folha com dez linhas passaria em todos os testes acima. Este diz que
    // ela é uma FOLHA, e não um começo de folha.
    const linhas = folhaDeTarefas(provas());
    const comNome = linhas.filter((l) => l.tarefa !== null);
    expect(comNome.length / linhas.length).toBeGreaterThan(0.9);
  });
});

describe('a coluna Provado não dá verde falso', () => {
  /*
   * Regra 26: este caso falhou de verdade. Antes do conserto, o
   * `runAction('novo')` escrito num comentário do `roteiro-30.mjs` fazia
   * `novo` aparecer como PROVADO, e o roteiro nunca chama a ação `novo`.
   */
  it('o que está num comentário não conta como prova', () => {
    const texto = [
      "// o antigo runAction('novo') não fazia isto",
      '/* runAction("x"); e runAction(\'salvar-pacote\') aqui dentro */',
      "runAction('salvar')",
    ].join('\n');
    const achadas = acoesProvadas(new Map([['prova-de-mentira.mjs', texto]]));
    expect([...achadas]).toEqual(['salvar']);
  });

  it('a tecla apertada não conta como prova', () => {
    // `Esc` é comido pela ferramenta na mão; `P` segurado é o gesto
    // `pegar-filhos`, e não a ação do menu que declara a mesma tecla.
    const texto = "await tecla('Escape');\nawait tecla('p', 'desce');\n";
    const provadas = acoesProvadas(new Map([['prova-de-mentira.mjs', texto]]));
    expect([...provadas]).toEqual([]);
  });

  it('a tecla apertada continua MEDIDA, com o nome dela', () => {
    // Não conta como prova, e não é jogada fora: sai na folha como `~`.
    const texto = "await tecla('Escape');\n";
    expect([...acoesComTeclaApertada(new Map([['p.mjs', texto]]))]).toContain('desmarcar');
  });

  it('semComentarios tira a linha de comentário e o bloco, e nada mais', () => {
    expect(semComentarios("a\n  // b\n/* c */d\ne // f\n")).toBe('a\nd\ne // f\n');
  });
});

describe('o que a coluna Provado prova de verdade', () => {
  /*
   * "Por que este verde é explicável?" e "o que este verde prova?" são
   * perguntas diferentes. Um medidor que devolvesse conjunto vazio passaria em
   * todos os testes de cima. Estes dois dizem que ele MEDE.
   */
  const provadas = acoesProvadas(provas());

  it('o roteiro prova as ações que ele chama pelo id', () => {
    for (const action of ['descer-ordem', 'copiar-pose', 'colar', 'salvar']) {
      expect(provadas, `o roteiro chama runAction('${action}')`).toContain(action);
    }
  });

  it('o roteiro prova o que ele clica pelo nome', () => {
    // `Arquivo → Abrir pasta do projeto…`, pelo item de menu, e o botão
    // `Nova animação`, pelo nome de leitor de tela.
    expect(provadas).toContain('abrir-pasta');
    expect(provadas).toContain('nova-animacao');
  });

  it('o roteiro NÃO prova o que ele não toca', () => {
    // Se isto virar verde, ou o roteiro cresceu, ou o medidor está achando
    // prova onde não há. As duas coisas se querem sabidas.
    for (const action of ['exportar-gltf', 'promover-pele-base', 'fisica-assar']) {
      expect(provadas).not.toContain(action);
    }
  });
});

describe('a folha dá para ler', () => {
  it('nenhuma tarefa é escrita em linguagem de programador', () => {
    // A coluna 1 é a única escrita à mão, e é a que o Humberto lê. Um id, uma
    // palavra em inglês ou um nome de arquivo ali é a folha voltando a falar a
    // língua de quem a escreveu.
    const suspeitas = TAREFAS.filter((t) => /[a-z]+\.(ts|js|mjs)|[a-z]+-[a-z]+-[a-z]+|\bslot\b/.test(t.tarefa));
    expect(suspeitas.map((t) => t.action)).toEqual([]);
  });

  it('toda tarefa começa por verbo, e não pelo nome do menu', () => {
    // "Salvar o trabalho", e não "Salvar". A frase tem de dizer o que a pessoa
    // QUER; um rótulo de menu de uma palavra não diz.
    const curtas = TAREFAS.filter((t) => t.tarefa.split(' ').length < 3);
    expect(curtas.map((t) => `${t.action}: ${t.tarefa}`)).toEqual([]);
  });

  it('a lista de grupos não tem grupo vazio de propósito', () => {
    // Um grupo em GRUPOS sem nenhuma linha não sai na folha, e a ausência dele
    // é informação: quer dizer que nada daquele assunto tem porta em tabela.
    // O teste não a proíbe — ele exige que ela seja SABIDA.
    const linhas = folhaDeTarefas(provas());
    const usados = new Set(linhas.map((l) => l.grupo));
    const vazios = GRUPOS.filter((g) => !usados.has(g));
    expect(vazios, 'grupos sem uma linha na folha — a folha os anuncia, e isto é o registro').toEqual([
      // Tudo de malha e de pesos é botão dentro do painel: não há item de menu,
      // nem tecla em tabela, e por isso não há linha. É o buraco da folha, e
      // está escrito nela.
      'Malha e pesos',
    ]);
  });
});

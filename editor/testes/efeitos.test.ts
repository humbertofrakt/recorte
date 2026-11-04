/**
 * Flash, pulso e tremor — os três efeitos que só gravam chaves.
 *
 * A pesquisa de 16/09 (`COMO SE FAZ EFEITO`, §6) chamou os três de **"só
 * porta"**: o programa já sabe fazer, e não oferece. Nenhum precisa de campo
 * novo no formato, nenhum precisa de runtime novo.
 *
 * **A regra de ouro está provada aqui, e é o último `describe` do arquivo:**
 * depois de aplicado, o que fica no arquivo são chaves iguais às que a pessoa
 * faria à mão. Nenhum campo novo, nenhuma extensão, nenhum estado escondido —
 * ela pode mexer, apagar, copiar, e o `Ctrl+Z` desfaz num passo só.
 *
 * Sem DOM: isto é `anim/`, e a conta toda vive num módulo puro.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import type { BoneFile } from '../../runtime/src/index.js';
import { boneTarget, findTimeline, slotTarget, valueAt } from '../src/anim/keying.js';
import type { PlanoDeEfeito } from '../src/anim/efeitos.js';
import {
  acaso, aplicarPlano, pcg, planoDoFlash, planoDoPulso, planoDoTremor,
} from '../src/anim/efeitos.js';
import { EditKeys } from '../src/anim/pose-mode.js';
import { Doc } from '../src/doc/document.js';
import { actionState, clearActions } from '../src/ui/actions.js';
import { registerCoreActions } from '../src/ui/register-actions.js';

// ---------------------------------------------------------------------------
// Fixture
// ---------------------------------------------------------------------------

/** Um corpo mínimo com uma animação vazia: o que uma chave escreve fica à vista. */
function sampleFile(): BoneFile {
  return {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    skeleton: { name: 'teste', fps: 30 },
    bones: [
      { name: 'root' },
      { name: 'corpo', parent: 'root', scaleX: 2, scaleY: 2, x: 10, y: -5 },
    ],
    slots: [{ name: 'cabeca', bone: 'corpo', attachment: 'rosto' }],
    animations: [{ name: 'andar', duration: 1 }],
  } as unknown as BoneFile;
}

const timelineDe = (file: BoneFile, alvo: ReturnType<typeof boneTarget>): unknown =>
  findTimeline(file, 'andar', alvo);

const chavesDe = (file: BoneFile, alvo: ReturnType<typeof boneTarget>): Array<Record<string, unknown>> =>
  ((timelineDe(file, alvo) as { keys?: Array<Record<string, unknown>> } | null)?.keys ?? []);

// ---------------------------------------------------------------------------
// O acaso: a MESMA conta da extensão, não uma segunda
// ---------------------------------------------------------------------------

describe('o acaso do tremor é o `pcg` da §3.2, bit a bit', () => {
  /*
   * A spec da `BONE_particles` diz, com estas palavras: *"um runtime que não
   * reproduza estes cinco números não implementa P. É a primeira coisa a
   * conferir, antes de qualquer caso."* Duas contas de acaso na mesma casa
   * divergem, e ninguém sabe qual está certa — então o tremor usa ESTA, e este
   * teste é a prova de que usa.
   */
  it('reproduz os cinco valores de referência da §3.2', () => {
    expect(pcg(0)).toBe(129708002);
    expect(pcg(42)).toBe(1223963391);
    expect(pcg(0xFFFFFFFF)).toBe(3861530882);
    expect(acaso(42, 0, 7, 0)).toBe(0.4190843105316162);
    expect(acaso(42, 0, -3, 0)).toBe(0.5181800723075867);
  });

  it('devolve sempre `u` em [0, 1)', () => {
    for (let i = 0; i < 400; i++) {
      const u = acaso(7, 0, i, i % 3);
      expect(u).toBeGreaterThanOrEqual(0);
      expect(u).toBeLessThan(1);
    }
  });
});

// ---------------------------------------------------------------------------
// Flash
// ---------------------------------------------------------------------------

describe('flash: um pico de luz no slot, e volta', () => {
  it('grava três chaves de `darkColor`: apagado, aceso, apagado', () => {
    const file = sampleFile();
    const plano = planoDoFlash(file, 'andar', ['cabeca'], { tempo: 0.2, subida: 0.05, descida: 0.15 });
    expect(plano.aviso).toBeNull();
    expect(aplicarPlano(file, 'andar', plano)).toBe(3);

    const chaves = chavesDe(file, slotTarget('cabeca', 'darkColor'));
    expect(chaves.map((k) => k['time'])).toEqual([0.2, 0.25, 0.4]);
    expect(chaves.map((k) => k['value'])).toEqual([[0, 0, 0], [1, 1, 1], [0, 0, 0]]);
  });

  /*
   * **Por que `darkColor`, e não `color`.** A fórmula da 7.12 é
   * `out.rgb = tex.rgb × light.rgb + (1 − tex.rgb) × dark.rgb`. Com
   * `dark = (1,1,1)` o pixel vai a BRANCO puro seja qual for a textura — é o
   * "piscar branco" de quem levou dano, exato. Um flash escrito em `color`
   * multiplicaria: branco × branco não muda nada, e a foto sairia igual à de
   * antes. **Era o jeito de o efeito existir e não funcionar.**
   */
  it('o branco puro sai da fórmula da 7.12, e por isso é `darkColor`', () => {
    const file = sampleFile();
    aplicarPlano(file, 'andar', planoDoFlash(file, 'andar', ['cabeca'], { tempo: 0, subida: 0.05, descida: 0.1 }));
    expect(valueAt(file, 'andar', 0.05, slotTarget('cabeca', 'darkColor'))).toEqual([1, 1, 1]);
    expect(findTimeline(file, 'andar', slotTarget('cabeca', 'color'))).toBeNull();
  });

  it('a cor do flash é escolha de quem usa; o vermelho é um vermelho', () => {
    const file = sampleFile();
    const plano = planoDoFlash(file, 'andar', ['cabeca'], {
      tempo: 0, subida: 0.05, descida: 0.1, cor: [1, 0, 0], forca: 0.5,
    });
    aplicarPlano(file, 'andar', plano);
    expect(chavesDe(file, slotTarget('cabeca', 'darkColor'))[1]['value']).toEqual([0.5, 0, 0]);
  });

  it('volta ao valor que ESTAVA ali, e não a zero no escuro', () => {
    const file = sampleFile();
    // Um `darkColor` já escrito na montagem: o flash tem de voltar para ele.
    (file.slots as unknown as Array<Record<string, unknown>>)[0]['darkColor'] = [0.2, 0, 0.4];
    const plano = planoDoFlash(file, 'andar', ['cabeca'], { tempo: 0.2, subida: 0.05, descida: 0.15 });
    aplicarPlano(file, 'andar', plano);
    const chaves = chavesDe(file, slotTarget('cabeca', 'darkColor'));
    expect(chaves[0]['value']).toEqual([0.2, 0, 0.4]);
    expect(chaves[2]['value']).toEqual([0.2, 0, 0.4]);
  });

  it('sem slot escolhido, DIZ por que não fez — nunca um verde calado', () => {
    const file = sampleFile();
    const plano = planoDoFlash(file, 'andar', [], { tempo: 0, subida: 0.05, descida: 0.1 });
    expect(plano.chaves).toEqual([]);
    expect(plano.aviso).toBe('Escolha um desenho (um slot) na Árvore antes.');
  });

  it('subida ou descida em zero cairia duas chaves no mesmo tempo: recusa e diz', () => {
    const file = sampleFile();
    const plano = planoDoFlash(file, 'andar', ['cabeca'], { tempo: 0, subida: 0, descida: 0.1 });
    expect(plano.chaves).toEqual([]);
    expect(plano.aviso).toContain('maior que zero');
  });
});

// ---------------------------------------------------------------------------
// Pulso
// ---------------------------------------------------------------------------

describe('pulso: a escala cresce e volta', () => {
  it('grava três chaves em `scaleX` e três em `scaleY`, a partir da escala de agora', () => {
    const file = sampleFile();
    const plano = planoDoPulso(file, 'andar', ['corpo'], { tempo: 0.1, subida: 0.1, descida: 0.2, fator: 1.5 });
    expect(aplicarPlano(file, 'andar', plano)).toBe(6);

    // O osso `corpo` tem escala 2 na montagem: o pico é 2 × 1,5 = 3.
    for (const eixo of ['scaleX', 'scaleY']) {
      const chaves = chavesDe(file, boneTarget('corpo', eixo));
      expect(chaves.map((k) => k['time'])).toEqual([0.1, 0.2, 0.4]);
      expect(chaves.map((k) => k['value'])).toEqual([2, 3, 2]);
    }
  });

  it('as duas primeiras chaves saem SUAVES: um pulso linear anda em bico', () => {
    const file = sampleFile();
    aplicarPlano(file, 'andar', planoDoPulso(file, 'andar', ['corpo'], {
      tempo: 0, subida: 0.1, descida: 0.2, fator: 1.5,
    }));
    const chaves = chavesDe(file, boneTarget('corpo', 'scaleX'));
    // Bézier absoluta da 9.3: alças a um terço no tempo, na altura das pontas.
    expect(chaves[0]['curve']).toEqual([0.0333333, 2, 0.0666667, 3]);
    expect(chaves[1]['curve']).toEqual([0.1666667, 3, 0.2333333, 2]);
    // A última não tem para onde curvar (9.2): escrever nela seria campo morto.
    expect(chaves[2]['curve']).toBeUndefined();
  });

  it('só um eixo, quando se pede só um', () => {
    const file = sampleFile();
    const plano = planoDoPulso(file, 'andar', ['corpo'], {
      tempo: 0, subida: 0.1, descida: 0.1, fator: 2, eixos: 'x',
    });
    expect(aplicarPlano(file, 'andar', plano)).toBe(3);
    expect(findTimeline(file, 'andar', boneTarget('corpo', 'scaleY'))).toBeNull();
  });

  it('sem osso escolhido, DIZ por que não fez', () => {
    const file = sampleFile();
    expect(planoDoPulso(file, 'andar', [], { tempo: 0, subida: 0.1, descida: 0.1, fator: 1.2 }).aviso)
      .toBe('Escolha um osso na Árvore ou na cena antes.');
  });
});

// ---------------------------------------------------------------------------
// Tremor
// ---------------------------------------------------------------------------

describe('tremor: chaves sorteadas por uma semente fixa', () => {
  const base = { tempo: 0, duracao: 0.3, chaves: 6, amplitude: 8, semente: 42 };

  it('a mesma semente dá sempre o mesmo tremor', () => {
    const a = sampleFile();
    const b = sampleFile();
    aplicarPlano(a, 'andar', planoDoTremor(a, 'andar', ['corpo'], base));
    aplicarPlano(b, 'andar', planoDoTremor(b, 'andar', ['corpo'], base));
    expect(a.animations).toEqual(b.animations);
  });

  it('semente diferente dá tremor diferente', () => {
    const a = sampleFile();
    const b = sampleFile();
    aplicarPlano(a, 'andar', planoDoTremor(a, 'andar', ['corpo'], base));
    aplicarPlano(b, 'andar', planoDoTremor(b, 'andar', ['corpo'], { ...base, semente: 43 }));
    expect(a.animations).not.toEqual(b.animations);
  });

  /*
   * **O defeito do Unity que não vamos repetir** (`OS ERROS`, §9): lá, duplicar
   * embaralha a semente e a animação sai outra. Aqui não há semente guardada
   * para embaralhar — o tremor grava chaves e some. Duplicar a animação copia
   * os números, e eles são os mesmos para sempre.
   */
  it('depois de aplicado não sobra semente nenhuma no arquivo', () => {
    const file = sampleFile();
    aplicarPlano(file, 'andar', planoDoTremor(file, 'andar', ['corpo'], base));
    expect(JSON.stringify(file)).not.toContain('seed');
    expect(JSON.stringify(file)).not.toContain('semente');
  });

  it('o osso SEMPRE volta para casa: a última chave é o valor de montagem', () => {
    const file = sampleFile();
    aplicarPlano(file, 'andar', planoDoTremor(file, 'andar', ['corpo'], base));
    for (const [eixo, montagem] of [['x', 10], ['y', -5]] as const) {
      const chaves = chavesDe(file, boneTarget('corpo', eixo));
      expect(chaves).toHaveLength(7); // `chaves: 6` = seis passos, sete chaves
      expect(chaves[chaves.length - 1]['value']).toBe(montagem);
      expect(chaves[chaves.length - 1]['time']).toBe(0.3);
    }
  });

  it('o balanço morre: cada passo desloca menos que o anterior, em média', () => {
    const file = sampleFile();
    aplicarPlano(file, 'andar', planoDoTremor(file, 'andar', ['corpo'], { ...base, chaves: 12 }));
    const desvios = chavesDe(file, boneTarget('corpo', 'x'))
      .map((k) => Math.abs(Number(k['value']) - 10));
    const primeiraMetade = desvios.slice(0, 6).reduce((s, d) => s + d, 0);
    const segundaMetade = desvios.slice(6).reduce((s, d) => s + d, 0);
    expect(segundaMetade).toBeLessThan(primeiraMetade);
  });

  it('nenhum deslocamento passa da amplitude pedida', () => {
    const file = sampleFile();
    aplicarPlano(file, 'andar', planoDoTremor(file, 'andar', ['corpo'], { ...base, chaves: 20 }));
    for (const eixo of ['x', 'y'] as const) {
      const montagem = eixo === 'x' ? 10 : -5;
      for (const chave of chavesDe(file, boneTarget('corpo', eixo))) {
        expect(Math.abs(Number(chave['value']) - montagem)).toBeLessThanOrEqual(8);
      }
    }
  });

  it('sem osso escolhido, ou com duração zero, DIZ por que não fez', () => {
    const file = sampleFile();
    expect(planoDoTremor(file, 'andar', [], base).aviso)
      .toBe('Escolha um osso na Árvore ou na cena antes.');
    expect(planoDoTremor(file, 'andar', ['corpo'], { ...base, duracao: 0 }).aviso)
      .toContain('maior que zero');
  });
});

// ---------------------------------------------------------------------------
// A regra de ouro dos três
// ---------------------------------------------------------------------------

describe('a regra de ouro: eles gravam chaves e somem', () => {
  /**
   * O que muda no arquivo, de fora: os nomes de campo de primeiro nível, e as
   * chaves das extensões. Se um efeito inventasse um campo, ele apareceria
   * aqui — e campo novo no núcleo do formato é decisão do Humberto (regra 7).
   */
  const forma = (file: BoneFile): string[] => [
    ...Object.keys(file).sort(),
    ...Object.keys((file as { extensions?: object }).extensions ?? {}).map((k) => `ext:${k}`),
  ];

  it('nenhum dos três acrescenta campo ao arquivo, só linhas e chaves', () => {
    const file = sampleFile();
    const antes = forma(file);
    aplicarPlano(file, 'andar', planoDoFlash(file, 'andar', ['cabeca'], { tempo: 0, subida: 0.05, descida: 0.1 }));
    aplicarPlano(file, 'andar', planoDoPulso(file, 'andar', ['corpo'], { tempo: 0.5, subida: 0.1, descida: 0.1, fator: 1.2 }));
    aplicarPlano(file, 'andar', planoDoTremor(file, 'andar', ['corpo'], {
      tempo: 1, duracao: 0.3, chaves: 6, amplitude: 8, semente: 42,
    }));
    expect(forma(file)).toEqual(antes);
  });

  it('nenhum dos três toca a montagem: a pose de repouso fica onde estava', () => {
    const file = sampleFile();
    const montagem = JSON.stringify({ bones: file.bones, slots: file.slots });
    aplicarPlano(file, 'andar', planoDoFlash(file, 'andar', ['cabeca'], { tempo: 0, subida: 0.05, descida: 0.1 }));
    aplicarPlano(file, 'andar', planoDoPulso(file, 'andar', ['corpo'], { tempo: 0.5, subida: 0.1, descida: 0.1, fator: 1.2 }));
    aplicarPlano(file, 'andar', planoDoTremor(file, 'andar', ['corpo'], {
      tempo: 1, duracao: 0.3, chaves: 6, amplitude: 8, semente: 42,
    }));
    expect(JSON.stringify({ bones: file.bones, slots: file.slots })).toBe(montagem);
  });

  it('as chaves são comuns: nada além de `time`, `value` e `curve`', () => {
    const file = sampleFile();
    aplicarPlano(file, 'andar', planoDoFlash(file, 'andar', ['cabeca'], { tempo: 0, subida: 0.05, descida: 0.1 }));
    aplicarPlano(file, 'andar', planoDoPulso(file, 'andar', ['corpo'], { tempo: 0.5, subida: 0.1, descida: 0.1, fator: 1.2 }));
    aplicarPlano(file, 'andar', planoDoTremor(file, 'andar', ['corpo'], {
      tempo: 1, duracao: 0.3, chaves: 6, amplitude: 8, semente: 42,
    }));
    const campos = new Set<string>();
    for (const timeline of (file.animations ?? [])[0].timelines ?? []) {
      for (const chave of (timeline as { keys?: Array<object> }).keys ?? []) {
        for (const campo of Object.keys(chave)) campos.add(campo);
      }
    }
    expect([...campos].sort()).toEqual(['curve', 'time', 'value']);
  });

  it('a duração da animação cresce para caber o efeito (9.11)', () => {
    const file = sampleFile();
    aplicarPlano(file, 'andar', planoDoTremor(file, 'andar', ['corpo'], {
      tempo: 2, duracao: 0.5, chaves: 4, amplitude: 4, semente: 1,
    }));
    expect((file.animations ?? [])[0].duration).toBe(2.5);
  });

  it('o resumo diz o que vai acontecer ANTES de acontecer', () => {
    const file = sampleFile();
    const plano = planoDoFlash(file, 'andar', ['cabeca'], { tempo: 0.2, subida: 0.05, descida: 0.15 });
    expect(plano.resumo).toBe('3 chaves de Cor escura em 1 desenho, de 0,20 s a 0,40 s.');
    const antes = JSON.stringify(file);
    // Pedir o plano não escreve nada: a prévia da janela o chama a cada tecla.
    planoDoFlash(file, 'andar', ['cabeca'], { tempo: 0.2, subida: 0.05, descida: 0.15 });
    expect(JSON.stringify(file)).toBe(antes);
  });
});

// ---------------------------------------------------------------------------
// As portas: existir não é funcionar
// ---------------------------------------------------------------------------

/*
 * **A régua que custou caro esta semana.** As três são `where: 'arranque'` na
 * `ui/actions-table.ts`, e isso é uma PROMESSA: *"vale com qualquer aba
 * fechada"*. O defeito 2 de 19/09 mostrou como se quebra essa promessa sem que
 * nenhum teste caia — a ação existe, roda, devolve `true`, e nada acontece,
 * porque o corpo dela lê um painel que não está na tela.
 *
 * Aqui, então, **nenhum painel é montado**. O documento é o herói do
 * `formato/exemplos`, a escolha é posta à mão, e o que se exige é efeito: ou o
 * arquivo muda, ou o rodapé diz por quê.
 */
describe('as três portas, sem painel nenhum montado', () => {
  const HEROI = readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8');

  function heroi(): { doc: Doc; ditos: string[] } {
    clearActions();
    const doc = new Doc(JSON.parse(HEROI) as BoneFile);
    const ditos: string[] = [];
    const dizer = doc.notice.bind(doc);
    doc.notice = (texto: string): void => { ditos.push(texto); dizer(texto); };
    registerCoreActions(doc);
    return { doc, ditos };
  }

  const IDS = ['efeito-flash', 'efeito-pulso', 'efeito-tremor'] as const;

  it('as três existem com o documento, antes de qualquer painel', () => {
    heroi();
    for (const id of IDS) expect(actionState(id).exists, id).toBe(true);
  });

  it('com a base aberta ficam CINZAS: um efeito é chave, e chave mora numa animação', () => {
    const { doc } = heroi();
    doc.select({ ...doc.selection, bones: ['torso'], slots: ['body'] });
    expect(doc.animation).toBeNull();
    for (const id of IDS) expect(actionState(id).enabled, id).toBe(false);
  });

  it('com a animação aberta e nada escolhido, também cinzas — e isso é resposta', () => {
    const { doc } = heroi();
    doc.animation = 'walk';
    for (const id of IDS) expect(actionState(id).enabled, id).toBe(false);
  });

  it('com osso escolhido, as três ACENDEM — o flash cai nos desenhos daquele osso', () => {
    const { doc } = heroi();
    doc.animation = 'walk';
    doc.select({ ...doc.selection, bones: ['torso'] });
    for (const id of IDS) expect(actionState(id).enabled, id).toBe(true);
  });

  /**
   * O corpo do gesto, sem a janela: é `EditKeys` + `aplicarPlano`, e é o que a
   * ação chama depois do `Gravar`. A janela só reúne os números.
   */
  function gravar(doc: Doc, plano: PlanoDeEfeito): void {
    doc.run(new EditKeys(doc.animation as string, plano.label, (file, name) => {
      aplicarPlano(file, name, plano);
    }));
  }

  it('o gesto inteiro escreve no herói de verdade, e o Ctrl+Z desfaz num passo só', () => {
    const { doc } = heroi();
    doc.animation = 'walk';
    const antes = JSON.stringify(doc.file);

    gravar(doc, planoDoFlash(doc.file, 'walk', ['body'], { tempo: 0.2, subida: 0.05, descida: 0.15 }));
    gravar(doc, planoDoPulso(doc.file, 'walk', ['torso'], { tempo: 0.2, subida: 0.1, descida: 0.2, fator: 1.3 }));
    gravar(doc, planoDoTremor(doc.file, 'walk', ['torso'], {
      tempo: 0.2, duracao: 0.3, chaves: 8, amplitude: 6, semente: 0,
    }));
    expect(JSON.stringify(doc.file)).not.toBe(antes);

    doc.undo();
    doc.undo();
    doc.undo();
    // Três gestos, três passos de desfazer, e o arquivo volta IGUAL ao que era.
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('o arquivo continua válido para o runtime depois dos três', () => {
    const { doc } = heroi();
    doc.animation = 'walk';
    // Sem atlas no disco, o herói já abre com avisos de imagem. O que se exige
    // é que os três não acrescentem NENHUM — comparar com `[]` seria medir o
    // que não é nosso, e um verde desses não provaria o que o nome diz.
    const antes = [...doc.warnings];
    gravar(doc, planoDoFlash(doc.file, 'walk', ['body'], { tempo: 0.2, subida: 0.05, descida: 0.15 }));
    gravar(doc, planoDoPulso(doc.file, 'walk', ['torso'], { tempo: 0.2, subida: 0.1, descida: 0.2, fator: 1.3 }));
    gravar(doc, planoDoTremor(doc.file, 'walk', ['torso'], {
      tempo: 0.2, duracao: 0.3, chaves: 8, amplitude: 6, semente: 0,
    }));
    doc.rebuild();
    // O documento É o arquivo: se o que gravamos não fosse um `.bone` legítimo,
    // a remontagem cairia aqui, e não no dia em que alguém salvasse.
    expect(doc.data).not.toBeNull();
    expect(doc.warnings).toEqual(antes);
  });
});

// ---------------------------------------------------------------------------
// K15, a mesma forma — o tremor começa parado (chat D, lote 2a, 29/09/2026)
// ---------------------------------------------------------------------------

describe('o tremor no meio da animação não mexe no osso antes dele (K15)', () => {
  /*
   * Antes da primeira chave vale a primeira chave (9.10). A primeira chave do
   * tremor era SORTEADA: numa linha nova, o osso ficava fora do lugar desde 0,
   * muito antes do tremor começar. Achado procurando "onde mais" do K15.
   */
  const meio = { tempo: 0.5, duracao: 0.3, chaves: 6, amplitude: 8, semente: 42 };

  it('em 0,00 s e em 0,25 s o osso está onde a montagem o pôs', () => {
    const file = sampleFile();
    aplicarPlano(file, 'andar', planoDoTremor(file, 'andar', ['corpo'], meio));
    for (const [eixo, montagem] of [['x', 10], ['y', -5]] as const) {
      expect(valueAt(file, 'andar', 0, boneTarget('corpo', eixo))).toBe(montagem);
      expect(valueAt(file, 'andar', 0.25, boneTarget('corpo', eixo))).toBe(montagem);
    }
  });

  it('a primeira chave do tremor é o valor de agora; as do meio continuam sorteadas', () => {
    const file = sampleFile();
    aplicarPlano(file, 'andar', planoDoTremor(file, 'andar', ['corpo'], meio));
    const chaves = chavesDe(file, boneTarget('corpo', 'x'));
    expect([chaves[0]!['time'], chaves[0]!['value']]).toEqual([0.5, 10]);
    expect(chaves.slice(1, -1).some((chave) => chave['value'] !== 10)).toBe(true);
  });
});

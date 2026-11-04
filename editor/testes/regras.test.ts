/**
 * Regras — os testes por assunto (lote A3, v10.6).
 *
 * Um `describe` por arquivo antigo, com o nome e o cabeçalho dele, e os
 * mesmos testes dentro. O miolo vai sem recuo: um texto de várias linhas
 * não pode mudar.
 *
 * Juntou: `lote28-regras`.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { RULES_DELETE_NOTHING, RULES_NEW_ITEMS, rulesDeleteTarget } from '../src/panels/rules-model.js';
import type { BoneFile } from '../../runtime/src/index.js';
import { Doc } from '../src/doc/document.js';
import { AddGuidedRule, RULE_INFO, RULE_TYPES, SetRuleChain, SetRuleMix, ToggleRule, bonesWithRules, buildFromPlan, chainOf, forgetRuleMix, mixOf, ruleRows, targetOf, validateNewRule } from '../src/panels/rules-model.js';
import type { NewRulePlan } from '../src/panels/rules-model.js';
import { hierarchyRows } from '../src/panels/tree-model.js';
import { constraintFields, skeletonFields } from '../src/panels/properties-model.js';
// Degrau 9: os defeitos A4, A5 e A6.
import { driverProblems, newRuleNotice } from '../src/panels/rules-model.js';
// Degrau 12, porta D3: os sliders (§8.1 e §8.2).
import {
  KeyDriverTarget, RemoveDriverTarget, driverTargets,
  parameterRange, parameterRow, parameterRows,
} from '../src/panels/rules-model.js';
import { AddParameter, DeleteParameter } from '../src/panels/tree-model.js';
// Degrau 12, porta D6: a física (§6.5, §9.8).
import { PhysicsConstraint } from '../../runtime/src/index.js';
import {
  BakePhysics, bakeNotice, planPhysicsBake, resetAllPhysics, resetOnePhysics, setPhysicsOn,
  type BakePlan,
} from '../src/panels/rules-physics.js';
// Degrau 12, porta G9/P15: variáveis e etiquetas (§8.4, §8.5, §9.9).
import {
  AddVariable, DeleteTag, DeleteVariable, RenameTag, RenameVariable, SetVariableType,
  ToggleAnimationTag, activeTagKeyValue, activeTagsAt, setVarsOn, tagRows, variableRow,
  variableRows, varsOffNotice, varsOn,
} from '../src/panels/rules-vars.js';
// Rodada final, lote 3: gravar a chave do alvo no valor de agora.
import { driverKeyPlans } from '../src/panels/rules-model.js';
// Rodada final, lote 2: trocar os ossos de uma regra já feita.
import { chainChange, chainChangeNotice } from '../src/panels/rules-model.js';
// Rodada final, lote 1 (28/09/2026): as portas do apagar e do renomear etiqueta.
import { keyTagHere, renameTagProblem, tagUsers, varsShape } from '../src/panels/rules-vars.js';
// P12: a chave recém-gravada se mostra na linha do tempo.
import { onRevealKey } from '../src/anim/keying.js';
import { variableFields } from '../src/panels/properties-model.js';
import { setPropertyOrKey } from '../src/anim/pose-mode.js';
import { tagTarget } from '../src/anim/keying.js';
import {
  parameterFields, parameterValueField, writeFieldValue,
} from '../src/panels/properties-model.js';
import { POSE_FOOTER, toolFooter } from '../src/ui/toolbar-model.js';
import { hasIcon } from '../src/ui/icons.js';
import { RIGHT_GROUPS, defaultLayout, sideOf } from '../src/ui/layout-model.js';
import { WINDOW_GROUPS, WINDOW_PANELS } from '../src/ui/menus.js';

// ---------------------------------------------------------------------------
// regras (lote 28) — era `lote28-regras.test.ts`
// ---------------------------------------------------------------------------

describe('regras (lote 28)', () => {
/**
 * Lote 28 (v5.1): a anotação 13 do Humberto — a aba **Regras**.
 *
 * *"Entendi as 5 regras. Mas não sei como usar, e está escondido."*
 *
 * Estava escondido, e era pior: pela tela **não dava** para montar uma IK de
 * dois ossos, que é a do próprio manual.
 *
 * | O que havia | O problema |
 * |:---|:---|
 * | criar gravava `bones: [primeiro osso]` | cadeia de um osso, mesmo com dois escolhidos |
 * | o alvo era escolhido sozinho | ninguém perguntou |
 * | Propriedades não tinha o campo da cadeia | não dava para consertar depois |
 * | alvo dentro da cadeia | nada impedia |
 *
 * Sem DOM.
 */
const EXAMPLE = resolve(__dirname, '../../formato/exemplos/heroi.bone');
const RAW = readFileSync(EXAMPLE, 'utf8');

function heroi(): Doc {
  return new Doc(JSON.parse(RAW) as BoneFile, { path: EXAMPLE });
}

function texto(doc: Doc): string {
  return JSON.stringify(doc.file, null, 2);
}

const IK: NewRulePlan = {
  type: 'ik', chain: ['leg', 'shin'], target: 'foot', bendPositive: true,
};

// ---------------------------------------------------------------------------
// O que estava quebrado: a cadeia de dois ossos
// ---------------------------------------------------------------------------

describe('anotação 13 — dá para montar uma IK de dois ossos', () => {
  it('a regra nasce com os DOIS ossos, na ordem', () => {
    const doc = heroi();
    const antes = texto(doc);
    const command = new AddGuidedRule(doc.file, IK);
    doc.run(command);

    const nova = (doc.file.constraints ?? []).find((c) => c.name === command.name);
    expect(nova).toBeDefined();
    expect(chainOf(nova!)).toEqual(['leg', 'shin']);
    expect(targetOf(nova!)).toBe('foot');

    doc.undo();
    expect(texto(doc)).toBe(antes);
  });

  it('a ordem da cadeia é a que foi pedida, e vai inteira para o arquivo', () => {
    const def = buildFromPlan('ik1', { ...IK, chain: ['leg', 'shin'] });
    expect(chainOf(def)).toEqual(['leg', 'shin']);
    const outra = buildFromPlan('ik2', { ...IK, chain: ['shin', 'leg'] });
    expect(chainOf(outra)).toEqual(['shin', 'leg']);
  });

  it('a cadeia se troca DEPOIS, sem apagar a regra', () => {
    const doc = heroi();
    const antes = texto(doc);
    expect(chainOf((doc.file.constraints ?? [])[0]!)).toEqual(['arm', 'forearm']);

    doc.run(new SetRuleChain('ik_arm', ['arm']));
    expect(chainOf((doc.file.constraints ?? [])[0]!)).toEqual(['arm']);
    expect(doc.undoLabel).toBe('Ossos da cadeia');

    doc.undo();
    expect(texto(doc)).toBe(antes);
  });

  it('o campo "Ossos da cadeia" existe nos três tipos que têm cadeia', () => {
    const file = heroi().file;
    for (const nome of ['ik_arm', 'head_lean', 'cape_follow']) {
      const campos = constraintFields(file, nome).flatMap((g) => g.fields);
      const cadeia = campos.find((f) => f.key === 'bones');
      expect(cadeia, `${nome} sem o campo da cadeia`).toBeDefined();
      expect(cadeia?.label).toBe('Ossos da cadeia');
      expect(cadeia?.kind).toBe('checklist');
    }
  });
});

// ---------------------------------------------------------------------------
// A janela não fecha errada
// ---------------------------------------------------------------------------

describe('anotação 13 — a janela guiada valida antes de fechar', () => {
  it('o alvo não pode ser um dos ossos que dobram', () => {
    const file = heroi().file;
    const erro = validateNewRule(file, { ...IK, target: 'shin' });
    expect(erro).toBe('O alvo não pode ser um dos ossos que dobram.');
  });

  it('um plano bom não tem erro nenhum', () => {
    expect(validateNewRule(heroi().file, IK)).toBeNull();
  });

  it('sem osso, sem alvo, com nome que não existe: cada um diz o quê', () => {
    const file = heroi().file;
    expect(validateNewRule(file, { ...IK, chain: [] })).toContain('ao menos um osso');
    expect(validateNewRule(file, { ...IK, target: '' })).toContain('perseguem');
    expect(validateNewRule(file, { ...IK, chain: ['perna_torta'] }))
      .toBe('O osso "perna_torta" não existe.');
  });

  it('uma IK dobra no máximo dois ossos', () => {
    const erro = validateNewRule(heroi().file, { ...IK, chain: ['leg', 'shin', 'foot'] });
    expect(erro).toContain('até dois');
  });

  it('o mesmo osso duas vezes na cadeia é recusado', () => {
    const erro = validateNewRule(heroi().file, { ...IK, chain: ['leg', 'leg'] });
    expect(erro).toContain('duas vezes');
  });

  it('a regra de caminho pede um SLOT, e não um osso', () => {
    const file = heroi().file;
    const plano: NewRulePlan = { type: 'path', chain: ['cape1'], target: 'leg' };
    expect(validateNewRule(file, plano)).toBe('O slot "leg" não existe.');
    expect(validateNewRule(file, { ...plano, target: 'cape_path' })).toBeNull();
  });

  it('a regra de comando pede um parâmetro', () => {
    const plano: NewRulePlan = { type: 'driver', chain: [], target: '', parameter: '' };
    expect(validateNewRule(heroi().file, plano)).toContain('parâmetro');
  });
});

// ---------------------------------------------------------------------------
// A lista
// ---------------------------------------------------------------------------

describe('anotação 13 — a lista da aba Regras', () => {
  it('uma linha por regra, com o tipo em português', () => {
    const rows = ruleRows(heroi().file);
    expect(rows.map((r) => r.name))
      .toEqual(['ik_arm', 'head_lean', 'cape_follow', 'hair_physics', 'look_driver']);
    expect(rows[0]!.typeLabel).toBe('cinemática inversa');
    expect(rows[0]!.chain).toEqual(['arm', 'forearm']);
    expect(rows[0]!.target).toBe('hand_target');
  });

  it('no arquivo do exemplo nenhuma regra está torta', () => {
    for (const row of ruleRows(heroi().file)) {
      expect(row.problems, `${row.name}: ${row.problems.join('; ')}`).toEqual([]);
    }
  });

  it('nome de osso que não existe vira problema escrito, e a regra fica na lista', () => {
    const doc = heroi();
    (doc.file.constraints ?? [])[0]!.name = 'ik_arm';
    (doc.file.constraints as unknown as Array<{ target: string }>)[0]!.target = 'nao_existe';
    const row = ruleRows(doc.file)[0]!;
    expect(row.problems).toContain('o osso "nao_existe" não existe');
    // Ela NÃO some: some sem aviso era o defeito.
    expect(ruleRows(doc.file).map((r) => r.name)).toContain('ik_arm');
  });

  it('cadeia vazia também é um problema escrito', () => {
    const doc = heroi();
    doc.run(new SetRuleChain('ik_arm', []));
    const row = ruleRows(doc.file).find((r) => r.name === 'ik_arm');
    expect(row?.problems).toContain('esta regra não tem osso nenhum');
  });

  it('cada tipo tem o seu ícone, e todos existem', () => {
    for (const type of RULE_TYPES) {
      expect(hasIcon(RULE_INFO[type].icon), `${type} sem ícone`).toBe(true);
    }
    const icones = new Set(RULE_TYPES.map((t) => RULE_INFO[t].icon));
    expect(icones.size).toBe(RULE_TYPES.length);
  });

  it('cada tipo tem uma frase do que faz e um exemplo do herói', () => {
    for (const type of RULE_TYPES) {
      expect(RULE_INFO[type].what.length).toBeGreaterThan(20);
      expect(RULE_INFO[type].example).toContain('herói');
    }
  });
});

// ---------------------------------------------------------------------------
// O olho e a força
// ---------------------------------------------------------------------------

describe('anotação 13 — ligar, desligar e a força', () => {
  it('o olho desliga com força zero e devolve o valor que estava lá', () => {
    forgetRuleMix();
    const doc = heroi();
    doc.run(new SetRuleMix('ik_arm', 0.4));
    expect(mixOf((doc.file.constraints ?? [])[0]!)).toBeCloseTo(0.4, 6);

    doc.run(new ToggleRule('ik_arm'));
    expect(mixOf((doc.file.constraints ?? [])[0]!)).toBe(0);
    expect(ruleRows(doc.file)[0]!.off).toBe(true);

    // Ligar de volta devolve 0,4 — e não 1, que é o padrão do formato.
    doc.run(new ToggleRule('ik_arm'));
    expect(mixOf((doc.file.constraints ?? [])[0]!)).toBeCloseTo(0.4, 6);
  });

  it('desfazer o olho devolve o arquivo letra por letra', () => {
    forgetRuleMix();
    const doc = heroi();
    const antes = texto(doc);
    doc.run(new ToggleRule('hair_physics'));
    expect(texto(doc)).not.toBe(antes);
    doc.undo();
    expect(texto(doc)).toBe(antes);
  });

  it('a força fica entre 0 e 1, mesmo pedindo fora', () => {
    const doc = heroi();
    doc.run(new SetRuleMix('ik_arm', 5));
    expect(mixOf((doc.file.constraints ?? [])[0]!)).toBe(1);
    doc.run(new SetRuleMix('ik_arm', -2));
    expect(mixOf((doc.file.constraints ?? [])[0]!)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Um lugar só, e o que a Árvore ficou dizendo
// ---------------------------------------------------------------------------

describe('anotação 13 — a regra mora num lugar só', () => {
  it('a Árvore não tem mais a seção Regras', () => {
    // Lote 64: a Árvore é uma árvore só; nenhuma linha de regra.
    const rows = hierarchyRows(heroi().file);
    expect(rows.map((r) => r.kind)).not.toContain('constraint');
    expect(rows.map((r) => r.name)).not.toContain('ik_arm');
  });

  it('a Árvore sabe quais ossos têm regra, para marcá-los', () => {
    const marcados = bonesWithRules(heroi().file);
    expect(marcados.has('arm')).toBe(true);
    expect(marcados.has('forearm')).toBe(true);
    expect(marcados.has('hair')).toBe(true);
    // O alvo NÃO é marcado: ele não se mexe sozinho, ele é perseguido.
    expect(marcados.has('hand_target')).toBe(false);
  });

  it('a aba está no menu Janela e nasce na coluna da direita', () => {
    expect(WINDOW_PANELS.map((p) => p.id)).toContain('regras');
    expect(WINDOW_GROUPS.flat()).toContain('regras');
    const known = [
      'arvore', 'ordem', 'propriedades', 'animacoes', 'exibicao', 'malha',
      'historico', 'imagens', 'previa', 'peles', 'regras',
    ];
    expect(sideOf(defaultLayout(known), 'regras')).toBe('right');
    expect(RIGHT_GROUPS.flat()).toContain('regras');
  });

  it('o menu Janela ficou em três blocos, e nenhum passa de seis', () => {
    expect(WINDOW_GROUPS.length).toBe(3);
    for (const bloco of WINDOW_GROUPS) expect(bloco.length).toBeLessThanOrEqual(6);
    // E nenhum painel se perdeu no recorte.
    expect([...WINDOW_GROUPS.flat()].sort())
      .toEqual(WINDOW_PANELS.map((p) => p.id).sort());
  });
});

// ---------------------------------------------------------------------------
// Posar não cria regra
// ---------------------------------------------------------------------------

describe('anotação 13 — Posar diz que não cria regra', () => {
  it('o rodapé aparece com a ferramenta na mão', () => {
    expect(toolFooter('pose', true)).toBe(POSE_FOOTER);
    expect(toolFooter('pose', false)).toBe(POSE_FOOTER);
  });

  it('a frase diz as duas coisas: o que ela faz e o que ela não faz', () => {
    expect(POSE_FOOTER).toContain('sem criar regra');
    expect(POSE_FOOTER).toContain('crie uma regra de IK');
  });
});
});

// ---------------------------------------------------------------------------
// Degrau 9 (18/09/2026) — os defeitos A4, A5 e A6
// ---------------------------------------------------------------------------

describe('degrau 9 — a regra Comando vazia avisa (A4), e dois padrões errados', () => {
/**
 * Três defeitos de uma triagem só (`ARQUITETO 2`, linhas A4 a A6). Os três são
 * a mesma coisa vista de três ângulos: **a tela dizia uma coisa e o formato
 * dizia outra**, e ninguém avisava.
 *
 * | # | O quê | O que custava |
 * |:---:|:---|:---|
 * | A4 | a regra **Comando** nascia com `targets: []` e não fazia nada | a pessoa mexia nos valores esperando ver o boneco andar |
 * | A5 | **Inércia** mostrava `1`; a spec (§6.5) diz `0,5` | o dobro da inércia que o runtime usava |
 * | A6 | **Escala de referência** mostrava `1`; a spec (§3.5) diz `100` | cem vezes errado, e só a física sentia |
 *
 * Regra 21 da casa: onde o programa não entende, ele avisa — não improvisa.
 */

const RULE_EXEMPLO = resolve(__dirname, '../../formato/exemplos/heroi.bone');

function corpo(): Doc {
  return new Doc(JSON.parse(readFileSync(RULE_EXEMPLO, 'utf8')) as BoneFile, { path: RULE_EXEMPLO });
}

describe('A4 — a regra Comando sem alvo', () => {
  /*
   * Estes dois provavam o jeito ANTIGO — a regra nascia com `targets: []` e a
   * lista avisava. O degrau 12 (porta D3) tirou o defeito de nascença: a regra
   * passou a nascer mandando. O aviso continua valendo, e continua provado,
   * mas agora para o caso certo: a regra que alguém **esvaziou**.
   * Ver `D3 — o Comando nasce mandando`, no fim deste arquivo.
   */
  it('a regra que a janela monta já nasce com um alvo, e não com `targets` vazio', () => {
    const def = buildFromPlan('comando', {
      type: 'driver', chain: [], target: '', parameter: 'lookX',
      driverBone: 'head', driverProperty: 'rotation',
    });
    expect((def as { targets?: unknown[] }).targets).toHaveLength(1);
  });

  it('e a lista diz que não manda em nada quando ela FICA sem alvo', () => {
    const doc = corpo();
    doc.file.constraints!.push(
      { type: 'driver', name: 'comando', parameter: 'lookX', targets: [], mix: 1 } as never,
    );
    const row = ruleRows(doc.file).find((r) => r.name === 'comando')!;
    expect(row.problems).toEqual([
      'esta regra Comando não manda em nada: escolha os alvos, ou a animação, em Propriedades',
    ]);
  });

  it('sem parâmetro também é dito, e são dois problemas, não um', () => {
    const doc = corpo();
    doc.file.constraints!.push({ type: 'driver', name: 'vazia', targets: [], mix: 1 } as never);
    const row = ruleRows(doc.file).find((r) => r.name === 'vazia')!;
    expect(row.problems).toHaveLength(2);
    expect(row.problems[0]).toContain('não lê parâmetro nenhum');
  });

  it('os dois modos da §8.2 são exclusivos: alvos E animação é erro escrito', () => {
    const def = {
      type: 'driver', name: 'dois', parameter: 'lookX', animation: 'andar',
      targets: [{ type: 'bone', target: 'head', property: 'rotation', keys: [] }], mix: 1,
    };
    expect(driverProblems(def as never)).toEqual([
      'esta regra Comando tem alvos E animação: a spec pede um dos dois',
    ]);
  });

  it('no modo contínuo, com animação e sem alvos, nada falta', () => {
    const def = { type: 'driver', name: 'ok', parameter: 'lookX', animation: 'andar', mix: 1 };
    expect(driverProblems(def as never)).toEqual([]);
  });

  it('o rodapé da criação fala do Comando, e só dele', () => {
    // Antes ele dizia o que faltava; desde o degrau 12 diz o que a regra já
    // faz. A prova de que a frase é a certa está em `D3 — o Comando nasce
    // mandando`; aqui fica a de que ela só existe no Comando.
    expect(newRuleNotice({
      type: 'driver', chain: [], target: '', parameter: 'lookX',
      driverBone: 'head', driverProperty: 'rotation',
    })).not.toBe(null);
    expect(newRuleNotice({ type: 'ik', chain: ['arm'], target: 'hand_target' })).toBe(null);
  });
});

describe('A5 e A6 — o padrão da ficha é o padrão do formato', () => {
  it('Inércia mostra 0,5 quando o valor não está escrito (§6.5)', () => {
    const doc = corpo();
    const fisica = doc.file.constraints!.find((c) => c.type === 'physics')!;
    const campos = constraintFields(doc.file, fisica.name).flatMap((g) => g.fields);
    const inercia = campos.find((f) => f.key === 'inertia')!;
    expect(inercia.fallback).toBe(0.5);
  });

  it('Escala de referência mostra 100 (§3.5), e não 1', () => {
    const campos = skeletonFields(corpo().file).flatMap((g) => g.fields);
    const escala = campos.find((f) => f.key === 'referenceScale')!;
    expect(escala.fallback).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// D3 — os sliders: o parâmetro na tela, os alvos do Comando, e a barra
// (degrau 12, 18/09/2026)
// ---------------------------------------------------------------------------

/**
 * A porta D3. O formato tinha `Parameter` (§8.1) e `driver` (§8.2) desde
 * sempre, e os dois runtimes já os liam. A tela não tinha por onde:
 *
 * | O que havia | O que faltava |
 * |:---|:---|
 * | o parâmetro **nascia** (menu Novo ▾) | e sumia: nenhuma lista, nenhuma ficha |
 * | a regra Comando nascia com um campo de TEXTO para o parâmetro | e com `targets: []`, que o runtime **ignora** |
 * | — | a barra de arrastar o valor |
 *
 * O `targets: []` é o defeito que dá nome à seção: a regra aparecia na lista,
 * parecia criada, e não fazia nada. A regra 21 da casa em pessoa.
 */
/** O ângulo de mundo de um osso, em graus, com o esqueleto posado de agora. */
function anguloDe(doc: Doc, bone: string): number {
  doc.repose();
  const b = doc.skeleton!.findBone(bone)!;
  return (Math.atan2(b.c, b.a) * 180) / Math.PI;
}

describe('D3 — o Comando nasce mandando (o verde silencioso de nascença)', () => {
  const PLANO: NewRulePlan = {
    type: 'driver', chain: [], target: '', parameter: 'lookX',
    driverBone: 'head', driverProperty: 'rotation',
  };

  it('a regra criada pela janela nasce COM alvo, e não com `targets: []`', () => {
    const def = buildFromPlan('comando', PLANO, { min: -1, max: 1 });
    const alvos = (def as { targets?: unknown[] }).targets!;
    expect(alvos).toHaveLength(1);
    expect(alvos[0]).toMatchObject({ type: 'bone', target: 'head', property: 'rotation' });
  });

  it('as chaves ficam nas pontas da faixa DAQUELE parâmetro, lidas do arquivo', () => {
    const doc = corpo();
    doc.file.parameters!.push({ name: 'abre', min: 0, max: 100, default: 0 } as never);
    const range = parameterRange(doc.file, 'abre');
    expect(range).toEqual({ min: 0, max: 100 });
    const def = buildFromPlan('c2', { ...PLANO, parameter: 'abre' }, range);
    const keys = (def as { targets: Array<{ keys: Array<{ input: number }> }> }).targets[0]!.keys;
    expect(keys.map((k) => k.input)).toEqual([0, 100]);
  });

  /**
   * **O teste que prova que está consertado de verdade.**
   *
   * Não basta o JSON ter um alvo: o runtime tem de mexer o osso. Aqui a regra
   * é criada pelo comando do editor, o valor do parâmetro vai para a ponta da
   * faixa, e o ângulo do osso **muda**. Era exatamente isto que não acontecia:
   * o `DriverConstraint` desliga sozinho (`active = false`) quando
   * `targets.length === 0`, e ninguém via nada.
   */
  it('e ela MEXE o osso: o editor cria, o runtime roda', () => {
    const doc = corpo();
    doc.run(new AddGuidedRule(doc.file, PLANO));
    const antes = anguloDe(doc, 'head');
    // A barra do parâmetro escreve o `default`, que é o que a setup pose usa.
    const campo = parameterValueField(doc.file, 'lookX')!;
    writeFieldValue(doc, campo, 1);
    const depois = anguloDe(doc, 'head');
    expect(Math.abs(depois - antes)).toBeGreaterThan(1);
  });

  /**
   * **O outro lado, e são dois testes e não um.**
   *
   * O degrau 9 fechou *"regra Comando vazia avisa"*, e esse aviso continua
   * certo — para quem esvaziou a regra à mão. O que ele não podia era servir
   * de conserto para uma regra que nascia vazia sozinha: aí ele escondia o
   * defeito de nascença atrás de uma frase que parecia esperada.
   */
  it('quem esvazia o alvo à mão CONTINUA vendo o aviso do degrau 9', () => {
    const doc = corpo();
    doc.run(new AddGuidedRule(doc.file, PLANO));
    const nome = ruleRows(doc.file).at(-1)!.name;
    // Esvaziar à mão é o comando de tirar o alvo, que é o que a tela oferece.
    doc.run(new RemoveDriverTarget(nome, 0));
    const row = ruleRows(doc.file).find((r) => r.name === nome)!;
    expect(row.problems).toContain(
      'esta regra Comando não manda em nada: escolha os alvos, ou a animação, em Propriedades',
    );
  });

  it('e o desfazer devolve o alvo inteiro, na mesma posição', () => {
    const doc = corpo();
    doc.run(new AddGuidedRule(doc.file, PLANO));
    const nome = ruleRows(doc.file).at(-1)!.name;
    const antes = JSON.stringify(driverTargets(doc.file, nome));
    doc.run(new RemoveDriverTarget(nome, 0));
    doc.undo();
    expect(JSON.stringify(driverTargets(doc.file, nome))).toBe(antes);
  });

  it('a janela não fecha sem o osso: perguntar agora é mais barato', () => {
    const doc = corpo();
    expect(validateNewRule(doc.file, { ...PLANO, driverBone: '' }))
      .toBe('Escolha o osso em que o comando manda.');
    expect(validateNewRule(doc.file, { ...PLANO, driverProperty: '' }))
      .toBe('Escolha a propriedade que o comando mexe.');
    expect(validateNewRule(doc.file, PLANO)).toBe(null);
  });

  it('o rodapé da criação diz o que a regra JÁ faz, e não o que falta', () => {
    const frase = newRuleNotice(PLANO)!;
    expect(frase).toContain('rotação');
    expect(frase).toContain('head');
    expect(frase).not.toContain('não manda em nada');
    expect(newRuleNotice({ type: 'ik', chain: ['arm'], target: 'hand_target' })).toBe(null);
  });
});

describe('D3 — o parâmetro deixou de nascer e sumir', () => {
  it('a lista da aba Regras mostra faixa, valor e quem o lê', () => {
    const rows = parameterRows(corpo().file);
    const look = rows.find((p) => p.name === 'lookX')!;
    expect(look.label).toBe('Olhar X');
    expect([look.min, look.max, look.value]).toEqual([-1, 1, 0]);
    expect(look.usedBy).toEqual(['look_driver']);
    expect(look.problems).toEqual([]);
  });

  it('um parâmetro que ninguém lê é dito, e não fica quieto (regra 21)', () => {
    const doc = corpo();
    doc.run(new AddParameter(doc.file));
    const novo = parameterRows(doc.file).at(-1)!;
    expect(novo.problems).toContain(
      'nenhuma regra Comando lê este parâmetro: ele ainda não mexe em nada',
    );
  });

  it('faixa impossível e padrão fora dela são ditos (§8.1, L1)', () => {
    const doc = corpo();
    doc.file.parameters!.push({ name: 'ruim', min: 1, max: 0, default: 5 } as never);
    doc.file.parameters!.push({ name: 'fora', min: 0, max: 1, default: 9 } as never);
    const ruim = parameterRow(doc.file, 'ruim')!;
    const fora = parameterRow(doc.file, 'fora')!;
    expect(ruim.problems[0]).toBe('o máximo tem de ser maior que o mínimo');
    expect(fora.problems[0]).toBe('o padrão 9 está fora da faixa de 0 a 1');
  });

  it('a ficha traz faixa, valor, repetição e a origem — os campos da §8.1', () => {
    const chaves = parameterFields(corpo().file, 'lookX').flatMap((g) => g.fields).map((f) => f.key);
    expect(chaves).toEqual(expect.arrayContaining([
      'name', 'displayName', 'group', 'min', 'max', 'default', 'repeat',
    ]));
  });

  it('a origem (`source`) entra e sai por um botão, e não à mão no JSON', () => {
    const doc = corpo();
    const grupo = parameterFields(doc.file, 'lookX').find((g) => g.title === 'Vem de um osso')!;
    expect(grupo.fields).toEqual([]);
    doc.run(grupo.actions![0]!.command(doc)!);
    const p = doc.file.parameters!.find((x) => x.name === 'lookX') as { source?: unknown };
    expect(p.source).toMatchObject({ property: 'rotation', from: 0, to: 1 });
    // Com origem, a barra da lista trava: o valor é conta do osso.
    expect(parameterRow(doc.file, 'lookX')!.driven).toBe(true);
    const agora = parameterFields(doc.file, 'lookX').find((g) => g.title === 'Vem de um osso')!;
    expect(agora.fields.map((f) => f.key))
      .toEqual(['source-bone', 'source-property', 'source-from', 'source-to']);
  });

  it('renomear o parâmetro arrasta a regra que o lê junto', () => {
    const doc = corpo();
    const campo = parameterFields(doc.file, 'lookX')[0]!.fields.find((f) => f.key === 'name')!;
    writeFieldValue(doc, campo, 'olharX');
    const driver = doc.file.constraints!.find((c) => c.name === 'look_driver')!;
    expect((driver as { parameter: string }).parameter).toBe('olharX');
    expect(ruleRows(doc.file).find((r) => r.name === 'look_driver')!.problems).toEqual([]);
    doc.undo();
    expect((doc.file.constraints!.find((c) => c.name === 'look_driver') as { parameter: string })
      .parameter).toBe('lookX');
  });

  it('apagar o parâmetro deixa a regra em vermelho, com o nome que sumiu', () => {
    const doc = corpo();
    doc.run(new DeleteParameter('lookX'));
    expect(ruleRows(doc.file).find((r) => r.name === 'look_driver')!.problems)
      .toContain('o parâmetro "lookX" não existe');
    doc.undo();
    expect(parameterRow(doc.file, 'lookX')).not.toBe(null);
  });
});

describe('D3 — os alvos do Comando em Propriedades', () => {
  it('cada alvo vira um grupo, com uma linha por chave e o valor do parâmetro no rótulo', () => {
    const grupos = constraintFields(corpo().file, 'look_driver');
    const alvo = grupos.find((g) => g.title.startsWith('Alvo 1'))!;
    const rotulos = alvo.fields.map((f) => f.label);
    // Rodada 47, lote 3 (reescrito de propósito, nota b do doc 84): o rótulo
    // "Com o parâmetro em −1" quebrava em três linhas; agora "Em −1", e a
    // frase inteira vai para a dica, com a unidade da propriedade.
    expect(rotulos).toContain('Em -1');
    expect(rotulos).toContain('Em 0');
    expect(rotulos).toContain('Em 1');
    const chave = alvo.fields.find((f) => f.label === 'Em -1')!;
    expect(chave.hint).toMatch(/^Com o parâmetro em -1, em /);
    expect(chave.unit).toBeDefined();
  });

  it('o parâmetro deixou de ser campo de texto: é a lista do que existe', () => {
    const cabeça = constraintFields(corpo().file, 'look_driver')
      .find((g) => g.title === 'Comando por parâmetro')!;
    const campo = cabeça.fields.find((f) => f.key === 'parameter')!;
    expect(campo.kind).toBe('select');
    expect(campo.options).toEqual([{ value: 'lookX', label: 'lookX' }]);
  });

  it('o botão de mais um alvo acrescenta, e o desfazer tira', () => {
    const doc = corpo();
    const grupo = constraintFields(doc.file, 'look_driver')
      .find((g) => (g.actions ?? []).some((a) => a.key === 'driver-novo-alvo'))!;
    const antes = driverTargets(doc.file, 'look_driver').length;
    doc.run(grupo.actions!.find((a) => a.key === 'driver-novo-alvo')!.command(doc)!);
    expect(driverTargets(doc.file, 'look_driver')).toHaveLength(antes + 1);
    doc.undo();
    expect(driverTargets(doc.file, 'look_driver')).toHaveLength(antes);
  });

  it('gravar a chave no valor de agora substitui, e não duplica (§8.2, L1)', () => {
    const doc = corpo();
    doc.run(new KeyDriverTarget('look_driver', 0, 0, 7));
    const keys = driverTargets(doc.file, 'look_driver')[0]!.keys;
    expect(keys.filter((k) => k.input === 0)).toHaveLength(1);
    expect(keys.find((k) => k.input === 0)!.value).toBe(7);
    expect(keys.map((k) => k.input)).toEqual([-1, 0, 1]);
  });

  it('no modo contínuo os cinco números aparecem, e no modo alvos não', () => {
    const doc = corpo();
    const alvos = constraintFields(doc.file, 'look_driver').map((g) => g.title);
    expect(alvos).not.toContain('Modo contínuo');
    const driver = doc.file.constraints!.find((c) => c.name === 'look_driver')!;
    delete (driver as { targets?: unknown }).targets;
    (driver as { animation?: string }).animation = 'walk';
    expect(constraintFields(doc.file, 'look_driver').map((g) => g.title))
      .toContain('Modo contínuo');
  });
});


// ---------------------------------------------------------------------------
// D6 — a física: Simular, Reiniciar, Assar em chaves (degrau 12, 18/09/2026)
// ---------------------------------------------------------------------------

/**
 * A regra `physics` já estava completa: cria, catorze campos, alças na cena. E
 * **simulava sempre**. Faltavam os três gestos que o formato prevê:
 *
 * | Gesto | Onde está no formato |
 * |:---|:---|
 * | Simular | é da tela; nenhum campo novo |
 * | Reiniciar | §6.5 `physicsReset`, §9.8 a chave `reset` |
 * | Assar em chaves | §6.5: *"Pode ser convertida em chaves pelo editor (bake)"* |
 */
describe('D6 — Simular: o interruptor que não vai para o arquivo', () => {
  it('desligar põe `active = false` nas físicas vivas, e não `mix: 0` no arquivo', () => {
    const doc = corpo();
    const antes = JSON.stringify(doc.file.constraints);
    setPhysicsOn(doc, false);
    const vivas = (doc.skeleton?.constraints ?? []).filter((c) => c instanceof PhysicsConstraint);
    expect(vivas.length).toBeGreaterThan(0);
    expect(vivas.every((c) => c.active)).toBe(false);
    // O arquivo não mudou uma letra: é preferência de quem usa.
    expect(JSON.stringify(doc.file.constraints)).toBe(antes);
    expect(doc.dirty).toBe(false);
    setPhysicsOn(doc, true);
    expect(vivas.every((c) => c.active)).toBe(true);
  });

  it('o interruptor sobrevive a uma mudança estrutural', () => {
    const doc = corpo();
    setPhysicsOn(doc, false);
    // Um `rebuild` monta constraints NOVAS, e elas nascem `active = true`.
    // Sem o vigia do documento, acrescentar um osso religaria a física em
    // silêncio — e nada na tela diria.
    doc.run(new AddParameter(doc.file));
    const vivas = (doc.skeleton?.constraints ?? []).filter((c) => c instanceof PhysicsConstraint);
    expect(vivas.every((c) => c.active)).toBe(false);
    setPhysicsOn(doc, true);
  });
});

describe('D6 — Reiniciar (§6.5 `physicsReset`)', () => {
  it('zera o estado acumulado de uma regra, e diz quando o nome não é de física', () => {
    const doc = corpo();
    expect(resetOnePhysics(doc, 'hair_physics')).toBe(true);
    expect(resetOnePhysics(doc, 'ik_arm')).toBe(false);
  });

  it('e todas de uma vez, devolvendo quantas', () => {
    const doc = corpo();
    expect(resetAllPhysics(doc)).toBe(
      (doc.file.constraints ?? []).filter((c) => c.type === 'physics').length,
    );
  });
});

describe('D6 — Assar em chaves: o assado toca para trás igual', () => {
  /** Abre a primeira animação do arquivo, que é onde o assado grava. */
  function comAnimacao(): Doc {
    const doc = corpo();
    doc.animation = (doc.file.animations ?? [])[0]!.name;
    return doc;
  }

  it('recusa com a base aberta, e diz por quê', () => {
    expect(planPhysicsBake(corpo(), 'hair_physics'))
      .toBe('Abra a animação que você quer assar: o assado é dela, e não da base.');
  });

  it('recusa um nome que não é de física', () => {
    expect(planPhysicsBake(comAnimacao(), 'ik_arm')).toBe('"ik_arm" não é uma regra de física.');
  });

  it('mede quadro a quadro, do zero para a frente, nas propriedades que a regra escreve', () => {
    const doc = comAnimacao();
    const plan = planPhysicsBake(doc, 'hair_physics');
    expect(typeof plan).not.toBe('string');
    const p = plan as BakePlan;
    // O herói tem `rotation: 1` e o resto em zero: só a rotação é assada.
    expect(p.tracks.map((t) => t.property)).toEqual(['rotation']);
    expect(p.frames).toBeGreaterThan(1);
    expect(p.tracks[0]!.keys).toHaveLength(p.frames);
    // Os tempos sobem, do zero à duração.
    const tempos = p.tracks[0]!.keys.map((k) => k.time);
    expect(tempos[0]).toBe(0);
    expect(tempos).toEqual([...tempos].sort((a, b) => a - b));
  });

  it('medir duas vezes dá o MESMO assado: o estado é zerado antes de cada medição', () => {
    const doc = comAnimacao();
    const um = planPhysicsBake(doc, 'hair_physics') as BakePlan;
    const dois = planPhysicsBake(doc, 'hair_physics') as BakePlan;
    expect(JSON.stringify(dois.tracks)).toBe(JSON.stringify(um.tracks));
  });

  it('gravar troca a simulação por timelines `bone` comuns, e desliga a regra', () => {
    const doc = comAnimacao();
    const plan = planPhysicsBake(doc, 'hair_physics') as BakePlan;
    doc.run(new BakePhysics(plan));
    const body = doc.file.animations!.find((a) => a.name === plan.animation)!;
    const assada = (body.timelines ?? []).filter((tl) => {
      const t = tl as { type?: string; target?: string; property?: string };
      return t.type === 'bone' && t.target === plan.bone && t.property === 'rotation';
    });
    // Uma só: duas timelines do mesmo alvo é L1 (§9.1).
    expect(assada).toHaveLength(1);
    // A regra fica DESLIGADA, e não apagada: os catorze campos dela são
    // trabalho de quem ajustou o balanço, e reassar depois precisa deles.
    const regra = doc.file.constraints!.find((c) => c.name === 'hair_physics')!;
    expect((regra as { mix?: number }).mix).toBe(0);
    expect(doc.file.constraints!.some((c) => c.name === 'hair_physics')).toBe(true);
  });

  /**
   * **O teste que o assado existe para passar.**
   *
   * A §6.5: *"Arrastar a linha do tempo para trás não devolve o mesmo cabelo."*
   * Depois de assado tem de devolver — chave não tem estado. Mede-se em
   * `0,9`, depois em `0,3`, depois em `0,9` de novo, e os dois `0,9` têm de
   * ser o MESMO número. É a forma do caso P-008 das partículas.
   */
  it('e depois de assado a animação toca para trás IGUAL, bit a bit', () => {
    const doc = comAnimacao();
    const plan = planPhysicsBake(doc, 'hair_physics') as BakePlan;
    doc.run(new BakePhysics(plan));

    const em = (t: number): string => {
      doc.time = t;
      doc.repose();
      const b = doc.skeleton!.findBone(plan.bone)!;
      return `${b.a},${b.b},${b.c},${b.d},${b.worldX},${b.worldY}`;
    };
    const frente = em(0.9);
    em(0.3);
    const voltando = em(0.9);
    expect(voltando).toBe(frente);
  });

  it('antes de assar, a MESMA medida muda quando se anda para trás — é o defeito que o assado conserta', () => {
    const doc = comAnimacao();
    setPhysicsOn(doc, true);
    resetAllPhysics(doc, false);
    const em = (t: number): string => {
      doc.time = t;
      doc.repose();
      const b = doc.skeleton!.findBone('hair')!;
      return `${b.a},${b.b},${b.c},${b.d}`;
    };
    // Andando do zero até 0,9 de quadro em quadro, e depois voltando a 0,3 e
    // indo de novo a 0,9: a física acumula, e o segundo 0,9 não bate.
    for (let i = 0; i <= 27; i++) em(i / 30);
    const frente = em(0.9);
    em(0.3);
    const voltando = em(0.9);
    expect(voltando).not.toBe(frente);
  });

  it('o desfazer devolve a animação inteira, letra por letra', () => {
    const doc = comAnimacao();
    const plan = planPhysicsBake(doc, 'hair_physics') as BakePlan;
    const antes = JSON.stringify(doc.file.animations!.find((a) => a.name === plan.animation));
    const mixAntes = (doc.file.constraints!.find((c) => c.name === 'hair_physics') as
      { mix?: number }).mix;
    doc.run(new BakePhysics(plan));
    doc.undo();
    expect(JSON.stringify(doc.file.animations!.find((a) => a.name === plan.animation))).toBe(antes);
    expect((doc.file.constraints!.find((c) => c.name === 'hair_physics') as { mix?: number }).mix)
      .toBe(mixAntes);
  });

  it('o rodapé diz o que foi assado, em uma frase', () => {
    const doc = comAnimacao();
    const plan = planPhysicsBake(doc, 'hair_physics') as BakePlan;
    const frase = bakeNotice(plan);
    expect(frase).toContain('hair_physics');
    expect(frase).toContain('hair');
    expect(frase).toContain('toca para trás igual');
  });
});


// ---------------------------------------------------------------------------
// G9/P15 — variáveis e etiquetas, com o jeito de desligar (degrau 12, 18/09)
// ---------------------------------------------------------------------------

/**
 * 🗣️ *"Variáveis e tags pela tela, provavelmente — **com um jeito de
 * desligar**"* — o Humberto, RESPOSTAS Q23, 17/09/2026.
 *
 * O formato tinha as duas (§8.4, §8.5, §9.9), o runtime lia e expunha, e a
 * `anim/keying.ts` **já sabia** os dois alvos. **Nenhum comando criava** uma
 * variável ou uma etiqueta, e não havia painel.
 */
describe('G9 — as variáveis (§8.4)', () => {
  it('a lista traz tipo, valor e quem as chaveia', () => {
    const rows = variableRows(corpo().file);
    const speed = rows.find((v) => v.name === 'speed')!;
    expect(speed.type).toBe('float');
    expect(speed.typeLabel).toBe('Número com vírgula');
    expect(speed.value).toBe(0);
    expect(speed.problems).toEqual([]);
    expect(rows.find((v) => v.name === 'grounded')!.value).toBe(true);
  });

  it('padrão que não bate com o tipo é dito (§8.4, L1)', () => {
    const doc = corpo();
    doc.file.variables!.push({ name: 'ruim', type: 'bool', default: 0 } as never);
    doc.file.variables!.push({ name: 'estranha', type: 'cor', default: 0 } as never);
    expect(variableRow(doc.file, 'ruim')!.problems[0])
      .toBe('o padrão não é do tipo "Sim ou não" (§8.4, L1)');
    // Regra 21: um tipo que não é um dos quatro não vira palpite silencioso.
    expect(variableRow(doc.file, 'estranha')!.problems[0])
      .toBe('o tipo "cor" não é um dos quatro do formato (§8.4)');
  });

  it('criar dá uma variável de verdade, com o padrão do tipo', () => {
    const doc = corpo();
    doc.run(new AddVariable(doc.file));
    const nova = variableRows(doc.file).at(-1)!;
    expect([nova.type, nova.value]).toEqual(['float', 0]);
    doc.undo();
    expect(variableRows(doc.file).some((v) => v.name === nova.name)).toBe(false);
  });

  it('trocar o TIPO leva o padrão junto — senão o arquivo sai inválido', () => {
    const doc = corpo();
    doc.run(new SetVariableType('speed', 'bool'));
    const v = doc.file.variables!.find((x) => x.name === 'speed') as { default?: unknown };
    // Um `default: 0` dentro de uma variável "Sim ou não" é L1 (§8.4): seria
    // o nosso próprio editor escrevendo um arquivo que o runtime recusa.
    expect(v.default).toBe(false);
    expect(variableRow(doc.file, 'speed')!.problems).toEqual([]);
    doc.undo();
    expect((doc.file.variables!.find((x) => x.name === 'speed') as { default?: unknown }).default)
      .toBe(0);
  });

  it('e não mexe no padrão quando ele já batia', () => {
    const doc = corpo();
    doc.file.variables!.push({ name: 'n', type: 'int', default: 7 } as never);
    doc.run(new SetVariableType('n', 'float'));
    expect((doc.file.variables!.find((x) => x.name === 'n') as { default?: unknown }).default)
      .toBe(7);
  });

  it('a ficha mostra o campo do padrão na forma do tipo', () => {
    const doc = corpo();
    const forma = (nome: string): string | undefined => variableFields(doc.file, nome)
      .flatMap((g) => g.fields).find((f) => f.key === 'default')?.kind;
    expect(forma('speed')).toBe('number');
    expect(forma('grounded')).toBe('checkbox');
    doc.file.variables!.push({ name: 'nome', type: 'string', default: '' } as never);
    expect(forma('nome')).toBe('text');
  });

  it('renomear arrasta as chaves, e apagar leva as chaves junto', () => {
    const doc = corpo();
    doc.animation = doc.file.animations![0]!.name;
    // Uma chave de variável, pelo caminho de sempre: o campo do padrão.
    const campo = variableFields(doc.file, 'speed').flatMap((g) => g.fields)
      .find((f) => f.key === 'default')!;
    writeFieldValue(doc, campo, 3);
    const temTimeline = (nome: string): boolean => (doc.file.animations![0]! as
      { timelines?: Array<{ type?: string; target?: string }> }).timelines!
      .some((tl) => tl.type === 'variable' && tl.target === nome);
    expect(temTimeline('speed')).toBe(true);

    doc.run(new RenameVariable('speed', 'velocidade'));
    expect(temTimeline('velocidade')).toBe(true);
    expect(temTimeline('speed')).toBe(false);

    doc.run(new DeleteVariable('velocidade'));
    expect(temTimeline('velocidade')).toBe(false);
    doc.undo();
    expect(temTimeline('velocidade')).toBe(true);
  });
});

describe('G9 — as etiquetas (§8.5), nas duas metades', () => {
  function comAnimacao(): Doc {
    const doc = corpo();
    doc.animation = doc.file.animations![0]!.name;
    return doc;
  }

  it('a lista traz as declaradas na raiz, e quem as usa', () => {
    const doc = comAnimacao();
    const rows = tagRows(doc.file, doc.animation, 0);
    expect(rows.map((t) => t.name)).toEqual(['vulnerable', 'attacking', 'idle']);
    expect(rows.find((t) => t.name === 'idle')!.usedIn.length).toBeGreaterThan(0);
  });

  it('a metade estática: ligar a etiqueta na animação inteira, e desfazer', () => {
    const doc = comAnimacao();
    const aberta = doc.animation!;
    const vale = (): boolean => tagRows(doc.file, aberta, 0)
      .find((t) => t.name === 'attacking')!.wholeAnimation;
    const antes = vale();
    doc.run(new ToggleAnimationTag(aberta, 'attacking'));
    expect(vale()).toBe(!antes);
    doc.undo();
    expect(vale()).toBe(antes);
  });

  it('a metade da chave: o valor é a LISTA daquele instante, e não só a clicada', () => {
    const doc = comAnimacao();
    // O herói já traz uma timeline `tag` nessa animação; o caso quer medir a
    // regra do "antes da primeira chave", e para isso a linha começa limpa.
    const body = doc.file.animations![0]! as { timelines?: Array<{ type?: string }> };
    body.timelines = (body.timelines ?? []).filter((tl) => tl.type !== 'tag');
    // §8.5: cada chave traz "as tags ativas daquele instante até a próxima".
    // Uma chave com uma etiqueta só apagaria as outras sem ninguém pedir.
    doc.time = 0.5;
    setPropertyOrKey(doc, tagTarget(), ['vulnerable', 'idle'] as never, { kind: 'structure' });
    expect(activeTagKeyValue(doc.file, doc.animation, 0.5)).toEqual(['vulnerable', 'idle']);
    // Antes da primeira chave, nada (§8.5).
    expect(activeTagKeyValue(doc.file, doc.animation, 0.1)).toEqual([]);
    // Depois dela, ela continua valendo: a timeline é stepped.
    expect(activeTagKeyValue(doc.file, doc.animation, 0.9)).toEqual(['vulnerable', 'idle']);
  });

  it('o que o jogo lê é a UNIÃO das duas metades — `activeTags` da §8.5', () => {
    const doc = comAnimacao();
    const aberta = doc.animation!;
    doc.run(new ToggleAnimationTag(aberta, 'attacking'));
    const inteira = new Set((doc.file.animations![0]! as { tags?: string[] }).tags ?? []);
    doc.time = 0.5;
    setPropertyOrKey(doc, tagTarget(), ['vulnerable'] as never, { kind: 'structure' });
    const lidas = activeTagsAt(doc.file, aberta, 0.5);
    expect(lidas).toContain('vulnerable');
    for (const t of inteira) expect(lidas).toContain(t);
  });

  it('apagar a etiqueta tira o nome de toda animação e de toda chave', () => {
    const doc = comAnimacao();
    doc.time = 0.5;
    setPropertyOrKey(doc, tagTarget(), ['vulnerable', 'idle'] as never, { kind: 'structure' });
    doc.run(new DeleteTag('idle'));
    // §8.5: "Tag usada e não declarada: L2". Apagar só a declaração deixaria o
    // arquivo acusando um aviso que a nossa própria tela teria criado.
    expect(doc.file.tags).not.toContain('idle');
    expect(activeTagKeyValue(doc.file, doc.animation, 0.5)).toEqual(['vulnerable']);
    for (const a of doc.file.animations ?? []) {
      expect((a as { tags?: string[] }).tags ?? []).not.toContain('idle');
    }
    doc.undo();
    expect(doc.file.tags).toContain('idle');
    expect(activeTagKeyValue(doc.file, doc.animation, 0.5)).toEqual(['vulnerable', 'idle']);
  });

  it('renomear troca em todo lugar que cita', () => {
    const doc = comAnimacao();
    doc.run(new RenameTag('idle', 'parado'));
    expect(doc.file.tags).toContain('parado');
    for (const a of doc.file.animations ?? []) {
      expect((a as { tags?: string[] }).tags ?? []).not.toContain('idle');
    }
    doc.undo();
    expect(doc.file.tags).toContain('idle');
  });

  it('com a base aberta não há o que chavear, e o caminho RECUSA em vez de fingir', () => {
    const doc = corpo();
    expect(setPropertyOrKey(doc, tagTarget(), ['idle'] as never, { kind: 'structure' }))
      .toBe('recusado');
  });
});

describe('rodada final, lote 1 — apagar e renomear etiqueta ganham porta', () => {
  function comAnimacao(): Doc {
    const doc = corpo();
    doc.animation = doc.file.animations![0]!.name;
    return doc;
  }

  it('a porta existe: o painel constrói DeleteTag e RenameTag', () => {
    // O vigia do comando sem porta só olha `editor/src`: é o painel que tem
    // de construir os dois, e não só o teste.
    const painel = readFileSync(resolve(__dirname, '../src/panels/rules.ts'), 'utf8');
    expect(painel).toMatch(/new DeleteTag\(/);
    expect(painel).toMatch(/new RenameTag\(/);
    // Botão em ícone, com o nome na dica (régua 4 da rodada).
    expect(painel).toContain("rowButton('rename', `Renomear a etiqueta");
    expect(painel).toContain("rowButton('trash', `Apagar a etiqueta");
    expect(hasIcon('rename')).toBe(true);
    expect(hasIcon('trash')).toBe(true);
  });

  it('renomear: a janela recusa nome vazio e nome repetido, ANTES do comando', () => {
    const doc = corpo();
    expect(renameTagProblem(doc.file, 'idle', '')).toBe('Escreva um nome.');
    expect(renameTagProblem(doc.file, 'idle', '   ')).toBe('Escreva um nome.');
    expect(renameTagProblem(doc.file, 'idle', 'attacking'))
      .toBe('Já existe uma etiqueta chamada "attacking".');
    // O mesmo nome não é problema: não muda nada.
    expect(renameTagProblem(doc.file, 'idle', 'idle')).toBeNull();
    expect(renameTagProblem(doc.file, 'idle', ' parado ')).toBeNull();
  });

  it('apagar: a janela lista as animações que a etiqueta vai deixar', () => {
    const doc = corpo();
    const usam = tagUsers(doc.file, 'vulnerable');
    expect(usam.length).toBeGreaterThan(0);
    expect(usam).toEqual(tagRows(doc.file, null, 0).find((t) => t.name === 'vulnerable')!.usedIn);
    doc.file.tags = [...(doc.file.tags ?? []), 'solta'];
    expect(tagUsers(doc.file, 'solta')).toEqual([]);
  });

  /**
   * **O defeito que a foto de "antes" pegou** — regra 26: prove que existia.
   *
   * A assinatura da lista só tinha parâmetros e regras. Abrir uma animação não
   * mexe em nenhum dos dois, então a parte VELHA da assinatura fica igual — e
   * a linha da etiqueta ficava dizendo "abra uma animação" com uma aberta.
   */
  it('abrir uma animação muda a assinatura — a parte velha, sozinha, não mudava', () => {
    const doc = corpo();
    const velha = (): string => JSON.stringify([
      parameterRows(doc.file).map((p) => [p.name, p.value]),
      ruleRows(doc.file).map((r) => [r.name, r.mix]),
    ]);
    const antesVelha = velha();
    const antes = JSON.stringify(varsShape(doc.file, null, 0));
    doc.animation = doc.file.animations![0]!.name;
    expect(velha()).toBe(antesVelha);
    expect(JSON.stringify(varsShape(doc.file, doc.animation, 0))).not.toBe(antes);
  });

  it('renomear e apagar mudam a assinatura, e o desfazer a devolve', () => {
    const doc = comAnimacao();
    const agora = (): string => JSON.stringify(varsShape(doc.file, doc.animation, doc.time));
    const antes = agora();
    doc.run(new RenameTag('idle', 'parado'));
    expect(agora()).not.toBe(antes);
    doc.undo();
    expect(agora()).toBe(antes);
    doc.run(new DeleteTag('idle'));
    expect(agora()).not.toBe(antes);
    doc.undo();
    expect(agora()).toBe(antes);
  });

  it('o cursor só entra na assinatura quando a seção o mostra', () => {
    const doc = corpo();
    // Base aberta: a seção não mostra instante, e andar o cursor não refaz.
    expect(JSON.stringify(varsShape(doc.file, null, 0)))
      .toBe(JSON.stringify(varsShape(doc.file, null, 0.7)));
    // Animação aberta com etiqueta: "Em 0,70 s o jogo lê…" muda com o cursor.
    const aberta = doc.file.animations![0]!.name;
    expect(JSON.stringify(varsShape(doc.file, aberta, 0)))
      .not.toBe(JSON.stringify(varsShape(doc.file, aberta, 0.7)));
  });

  it('desligada, a assinatura acompanha a CONTA que a frase mostra', () => {
    const doc = corpo();
    setVarsOn(false);
    try {
      const antes = JSON.stringify(varsShape(doc.file, null, 0));
      doc.run(new DeleteTag('idle'));
      expect(JSON.stringify(varsShape(doc.file, null, 0))).not.toBe(antes);
    } finally {
      setVarsOn(true);
    }
  });
});

describe('P12 — a chave de etiqueta recém-gravada se MOSTRA', () => {
  it('chavear a etiqueta pede à linha do tempo que mostre a chave, no instante gravado', () => {
    const doc = corpo();
    doc.animation = doc.file.animations![0]!.name;
    doc.time = 0.3333333333;
    const vistas: Array<{ type: string; time: number }> = [];
    const parar = onRevealKey((ref) => { vistas.push({ type: ref.target.type, time: ref.time }); });
    try {
      // `onRevealKey` entrega na hora uma chave que ficou esperando de outro
      // teste: o que este caso mede é só o que vem DEPOIS de escutar.
      vistas.length = 0;
      const feito = keyTagHere(doc, 'attacking');
      expect(feito).not.toBeNull();
      expect(vistas).toEqual([{ type: 'tag', time: 0.333333 }]);
      expect(activeTagKeyValue(doc.file, doc.animation, 0.34)).toEqual(feito!.ordem);
    } finally {
      parar();
    }
  });

  it('com a base aberta recusa, e não pede para mostrar chave nenhuma', () => {
    const doc = corpo();
    const vistas: unknown[] = [];
    const parar = onRevealKey((ref) => { vistas.push(ref); });
    try {
      vistas.length = 0;
      expect(keyTagHere(doc, 'idle')).toBeNull();
      expect(vistas).toEqual([]);
    } finally {
      parar();
    }
  });
});

describe('rodada final, lote 3 — gravar a chave do alvo no valor de agora', () => {
  it('a porta existe: o painel constrói KeyDriverTarget, com a chave na linha do parâmetro', () => {
    const painel = readFileSync(resolve(__dirname, '../src/panels/rules.ts'), 'utf8');
    expect(painel).toMatch(/new KeyDriverTarget\(/);
    expect(painel).toContain("rowButton('key', `Gravar a chave aqui");
    expect(hasIcon('key')).toBe(true);
  });

  it('cada alvo que lê o parâmetro vira uma linha, com o valor de agora', () => {
    const doc = corpo();
    const planos = driverKeyPlans(doc, 'lookX');
    expect(Array.isArray(planos)).toBe(true);
    const lista = planos as Exclude<typeof planos, string>;
    expect(lista.map((p) => p.label)).toEqual(['look_driver → head, Rotação', 'look_driver → smile, weight']);
    expect(lista.every((p) => p.input === 0)).toBe(true);
    // Em 0 a cabeça está NA chave (0), e o sorriso no meio da reta de 0 a 1.
    expect(lista[0]!.now).toBe(0);
    expect(lista[1]!.now).toBe(0.5);
  });

  /**
   * **O valor de agora sai da conta do JOGO, com a curva** — regra 28.
   * Entre 0 e 1 a cabeça tem curva `[0.3, 0, 0.7, 12]`, que começa devagar: em
   * 0,25 a reta daria 3, e a curva dá menos. Um teste que só olhasse a chave
   * exata (0 em 0) passaria com uma conta linear errada.
   */
  it('entre duas chaves o valor segue a curva, e não a reta', () => {
    const doc = corpo();
    doc.file.parameters![0]!.default = 0.25;
    const lista = driverKeyPlans(doc, 'lookX') as Exclude<ReturnType<typeof driverKeyPlans>, string>;
    expect(lista[0]!.input).toBe(0.25);
    expect(lista[0]!.now!).toBeGreaterThan(0);
    expect(lista[0]!.now!).toBeLessThan(3);
    expect(lista[1]!.now).toBe(0.625);
  });

  it('gravar põe a chave no valor de agora, e o desfazer tira', () => {
    const doc = corpo();
    doc.file.parameters![0]!.default = 0.25;
    const plano = (driverKeyPlans(doc, 'lookX') as Exclude<ReturnType<typeof driverKeyPlans>, string>)[0]!;
    doc.run(new KeyDriverTarget(plano.rule, plano.at, plano.input, 7));
    expect(driverTargets(doc.file, 'look_driver')[0]!.keys.map((k) => k.input)).toEqual([-1, 0, 0.25, 1]);
    expect(driverTargets(doc.file, 'look_driver')[0]!.keys.find((k) => k.input === 0.25)!.value).toBe(7);
    doc.undo();
    expect(driverTargets(doc.file, 'look_driver')[0]!.keys.map((k) => k.input)).toEqual([-1, 0, 1]);
  });

  it('sem o que gravar, diz por quê — nunca uma lista vazia calada (regra 21)', () => {
    const doc = corpo();
    expect(driverKeyPlans(doc, 'nao_existe')).toBe('O parâmetro "nao_existe" não existe.');
    const novo = new AddParameter(doc.file);
    doc.run(novo);
    expect(driverKeyPlans(doc, novo.name)).toMatch(/Nenhuma regra Comando lê/);
    const driver = doc.file.constraints!.find((c) => c.name === 'look_driver') as { targets?: unknown[] };
    driver.targets = [];
    expect(driverKeyPlans(doc, 'lookX')).toMatch(/ainda não manda em nada/);
  });
});

describe('rodada final, lote 2 — trocar os ossos de uma regra já feita', () => {
  it('a porta existe: o painel constrói SetRuleChain, com o lápis na linha', () => {
    const painel = readFileSync(resolve(__dirname, '../src/panels/rules.ts'), 'utf8');
    expect(painel).toMatch(/new SetRuleChain\(/);
    expect(painel).toContain("rowButton('rename', `Trocar os ossos da regra");
  });

  it('a cadeia nova sai na ordem do arquivo, pai → filho, marcada em qualquer ordem', () => {
    const doc = corpo();
    const ik = (doc.file.constraints ?? []).find((c) => c.type === 'ik')!;
    const antes = chainOf(ik);
    expect(antes.length).toBe(2);
    expect(chainChange(doc.file, ik.name, [...antes].reverse())).toEqual(antes);
  });

  it('a régua é a da criação: IK de três ossos e alvo na cadeia são recusados', () => {
    const doc = corpo();
    const ik = (doc.file.constraints ?? []).find((c) => c.type === 'ik')!;
    const ossos = (doc.file.bones ?? []).map((b) => b.name);
    const tres = ossos.filter((n) => n !== targetOf(ik)).slice(0, 3);
    expect(chainChange(doc.file, ik.name, tres))
      .toBe('Uma regra de IK dobra um ou dois ossos. Escolha até dois.');
    expect(chainChange(doc.file, ik.name, [targetOf(ik)!]))
      .toBe('O alvo não pode ser um dos ossos que dobram.');
    expect(chainChange(doc.file, ik.name, [])).toBe('Escolha ao menos um osso.');
  });

  it('Comando, física com dois ossos e regra que sumiu: recusa com a frase', () => {
    const doc = corpo();
    const regras = doc.file.constraints ?? [];
    const driver = regras.find((c) => c.type === 'driver')!;
    expect(chainChange(doc.file, driver.name, ['root'])).toMatch(/Comando não tem ossos/);
    const fisica = regras.find((c) => c.type === 'physics')!;
    const dois = (doc.file.bones ?? []).slice(0, 2).map((b) => b.name);
    expect(chainChange(doc.file, fisica.name, dois)).toBe('A física balança um osso só. Escolha um.');
    expect(chainChange(doc.file, 'nao_existe', ['root'])).toBe('A regra "nao_existe" não existe.');
  });

  it('trocar e desfazer: IK de dois ossos vira de um, e volta', () => {
    const doc = corpo();
    const ik = (doc.file.constraints ?? []).find((c) => c.type === 'ik')!;
    const antes = chainOf(ik);
    const plano = chainChange(doc.file, ik.name, [antes[1]!]);
    expect(plano).toEqual([antes[1]]);
    doc.run(new SetRuleChain(ik.name, plano as string[]));
    expect(chainOf((doc.file.constraints ?? []).find((c) => c.name === ik.name)!)).toEqual([antes[1]]);
    expect(ruleRows(doc.file).find((r) => r.name === ik.name)!.problems).toEqual([]);
    doc.undo();
    expect(chainOf((doc.file.constraints ?? []).find((c) => c.name === ik.name)!)).toEqual(antes);
  });

  it('o rodapé diz de onde para onde, e diz quando nada mudou', () => {
    expect(chainChangeNotice('ik_arm', ['arm', 'forearm'], ['forearm']))
      .toBe('Regra "ik_arm": arm → forearm agora é forearm');
    expect(chainChangeNotice('ik_arm', ['arm'], ['arm'])).toBe('Os ossos de "ik_arm" ficaram como estavam');
  });
});

describe('G9 — o jeito de desligar (Q23): desligado continua dizendo', () => {
  it('com o arquivo limpo, a frase diz que está desligado', () => {
    const vazio = { bone: { version: '1.0' }, skeleton: { name: 'x' }, bones: [{ name: 'root' }] };
    expect(varsOffNotice(vazio as never))
      .toBe('Variáveis e etiquetas: desligadas. Este arquivo não tem nenhuma.');
  });

  /**
   * **O defeito que este teste existe para impedir.**
   *
   * Um interruptor que faz a coisa sumir sem dizer que ela existe é o mesmo
   * defeito que a Janela de Problemas consertou no degrau 11 — e aqui seria
   * pior, porque o jogo continuaria lendo a variável que a tela escondeu.
   */
  it('com variáveis e etiquetas escritas, a frase diz QUANTAS estão escondidas', () => {
    const frase = varsOffNotice(corpo().file);
    expect(frase).toContain('2 variáveis');
    expect(frase).toContain('3 etiquetas');
    expect(frase).toContain('escondidas');
  });

  it('a singular é singular: "1 variável", "1 etiqueta"', () => {
    const doc = corpo();
    doc.file.variables = [{ name: 'a', type: 'float', default: 0 } as never];
    doc.file.tags = ['b'];
    const frase = varsOffNotice(doc.file);
    expect(frase).toContain('1 variável e 1 etiqueta');
  });

  it('o interruptor é preferência, e não vai para o arquivo', () => {
    const doc = corpo();
    const antes = JSON.stringify(doc.file);
    setVarsOn(false);
    expect(varsOn()).toBe(false);
    setVarsOn(true);
    expect(varsOn()).toBe(true);
    expect(JSON.stringify(doc.file)).toBe(antes);
  });
});

});

// ---------------------------------------------------------------------------
// Rodada 17, PL-10: a barra da aba Regras — um Novo ▾ e um Apagar
// ---------------------------------------------------------------------------

describe('rodada 17, PL-10: a barra da aba Regras', () => {
  it('o Apagar apaga o escolhido na lista: a regra, o parâmetro ou a variável; nada escolhido, diz o quê', () => {
    expect(rulesDeleteTarget({ constraints: ['ik_arm'], parameters: ['lookX'] })).toBe('regra');
    expect(rulesDeleteTarget({ constraints: [], parameters: ['lookX'] })).toBe('parametro');
    expect(rulesDeleteTarget({ constraints: [], parameters: [], variables: ['vida'] })).toBe('variavel');
    expect(rulesDeleteTarget({ constraints: [] })).toBeNull();
    expect(RULES_DELETE_NOTHING).toContain('Escolha na lista');
  });

  it('o Novo ▾ cria os quatro, e a barra não tem mais as três lixeiras nem os quatro "Novo" soltos', () => {
    expect([...RULES_NEW_ITEMS]).toEqual(['Regra…', 'Parâmetro', 'Variável', 'Etiqueta']);
    const aba = readFileSync(resolve(__dirname, '../src/panels/rules.ts'), 'utf8');
    for (const velho of ["'Nova regra', () =>", "'Apagar regra', () =>", "'Novo parâmetro', () =>", "'Apagar parâmetro', () =>",
      "'Nova variável', () =>", "'Apagar variável', () =>", "'Nova etiqueta', () =>"]) {
      expect(aba).not.toContain(velho);
    }
    expect(aba).toContain('this.newMenuButton(),');
    expect(aba).toContain('() => this.deleteChosen()');
  });
});

describe('rodada 17, PL-10: a lista do Novo ▾ (Árvore e Regras) abre larga', () => {
  it('a regra forte vence a do lote 65 (`.panel-body *` com min-width 0), e o nome não quebra', () => {
    const css = readFileSync(resolve(__dirname, '../src/panels/panels.css'), 'utf8');
    const forte = css.indexOf('.panel-column .panel-body .arvore-novo-lista {');
    expect(forte).toBeGreaterThan(css.indexOf('.panel-column .panel-body * {'));
    expect(css.slice(forte, forte + 80)).toContain('min-width: 180px;');
    expect(css).toContain('.panel-column .panel-body .arvore-novo-lista .menu-item {');
  });
});

// ---------------------------------------------------------------------------
// Rodada 47, lote 4 (doc 68): a barrinha, a dica e a linha de ajuda
// ---------------------------------------------------------------------------
const fonteR47L4 = (arquivo: string): string => readFileSync(resolve(__dirname, '../src', arquivo), 'utf8');

describe('rodada 47, lote 4: o nome da regra inteiro', () => {
  it('a barra da força cede largura ao nome: 44 px, e não 64', () => {
    const css = readFileSync(resolve(__dirname, '../src/panels/rules.css'), 'utf8');
    const regra = css.slice(css.indexOf('.regras-forca {'), css.indexOf('}', css.indexOf('.regras-forca {')));
    expect(regra).toContain('width: 44px;');
  });
});

// Rodada 47, lote 6 (a prova final)
describe('rodada 47, lote 6: a dica da barrinha da Força no molde da casa', () => {
  it('diz a unidade e a faixa', () => {
    const regras = readFileSync(resolve(__dirname, '../src/panels/rules.ts'), 'utf8');
    expect(regras).toContain('`Força da regra "${row.name}", em %, de 0 a 100: ${Math.round(row.mix * 100)} %.');
  });
});

// Rodada 47, lote 6d (doc 90, nota 5; o detalhe do conferente): a aba Regras
// tinha 721 px de conteúdo em 472 e rolava como um corpo só, sem dobrar nada.
describe('rodada 47, lote 6d: as seções da aba Regras dobram no título', () => {
  it('abre Regras sempre; a vazia (diz o que é), a com escolha e a com problema; o resto dobra', async () => {
    const { sectionsOpen } = await import('../src/panels/rules-model.js');
    const s = (title: string, count: number, chosen = false, problem = false) => ({ title, count, chosen, problem });
    expect(sectionsOpen([s('Parâmetros', 3), s('Regras', 5), s('Variáveis', 2), s('Etiquetas', 0)]))
      .toEqual([false, true, false, true]);
    expect(sectionsOpen([s('Parâmetros', 3, true), s('Regras', 5), s('Variáveis', 2, false, true), s('Etiquetas', 4)]))
      .toEqual([true, true, true, false]);
  });

  it('o que a mão abriu ou fechou fica, por título', async () => {
    const { sectionsOpen } = await import('../src/panels/rules-model.js');
    const mao = new Map([['Regras', false], ['Etiquetas', true]]);
    expect(sectionsOpen([{ title: 'Regras', count: 5, chosen: false, problem: false }, { title: 'Etiquetas', count: 4, chosen: false, problem: false }], mao))
      .toEqual([false, true]);
  });

  it('o título dobrado diz quantos tem dentro', async () => {
    const { sectionTitle } = await import('../src/panels/rules-model.js');
    expect(sectionTitle('Variáveis', 3)).toBe('Variáveis · 3');
    expect(sectionTitle('Etiquetas', 0)).toBe('Etiquetas');
  });

  it('a aba usa a decisão e o título vira botão', () => {
    const regras = readFileSync(resolve(__dirname, '../src/panels/rules.ts'), 'utf8');
    expect(regras).toContain('sectionsOpen(');
    expect(regras).toContain("'regras-secao-dobra'");
    const css = readFileSync(resolve(__dirname, '../src/panels/rules.css'), 'utf8');
    expect(css).toContain('.regras-dobrada');
  });
});

/**
 * Painel **Regras** (dono C) — lote 28, anotação 13.
 *
 * *"Entendi as 5 regras. Mas não sei como usar, e está escondido."* — Humberto,
 * 09/09/2026.
 *
 * Estava escondido: as regras eram uma seção no fim da Árvore, abaixo de
 * dezoito ossos e vinte e três slots. E era pior do que escondido — pela tela
 * **não dava** para montar uma IK de dois ossos, que é a do próprio manual: o
 * criar gravava um osso só, o alvo era escolhido sozinho, e Propriedades não
 * tinha o campo da cadeia para consertar depois.
 *
 * **Prints usados:**
 *
 * | Print | O que veio dele |
 * |:---|:---|
 * | `spine/prints/constraints_tree.png` | a lista com um **ícone por tipo** — é o que faz cinco linhas se lerem de relance |
 * | `spine/prints/ik_properties1.png` | a janela: rótulo à esquerda, valor à direita, uma linha por pergunta, a força numa barra |
 * | `spine/prints/transform_properties.png` e `path-constraint_properties.png` | as outras duas janelas com cadeia |
 * | `spriter/prints/00-tela-do-humberto.png` | os ícones numa linha no alto do painel |
 *
 * Uma linha por regra: ícone do tipo, nome, alvo, a força numa barra, e um olho
 * que liga e desliga **sem apagar** o valor da força.
 */

import { lembrarFoco } from './dom.js';
import type { DocChange, EditorDoc, Panel } from '../contract.js';
import { emptySelection, registerPanel } from '../contract.js';
import { clear, el, iconButton } from './dom.js';
import { paintIcon } from '../ui/icons.js';
import { askForm, askGuided, askUser } from '../ui/dialog.js';
import type { GuidedField, GuidedOption } from '../ui/dialog.js';
import { DeleteItems } from './tree-model.js';
import {
  AddGuidedRule, DRIVER_PROPERTIES, RULE_INFO, RULE_TYPES, SetRuleMix, ToggleRule, newRuleNotice,
  parameterRow, parameterRows, ruleRows, validateNewRule,
} from './rules-model.js';
import type { NewRulePlan, ParameterRow, RuleRow, RuleType } from './rules-model.js';
// Porta D3: a barra do parâmetro passa pelo mesmo caminho de qualquer campo.
import { REFUSED_MESSAGE, parameterValueField, writeFieldValue } from './properties-model.js';
import { AddParameter, DeleteParameter } from './tree-model.js';
// Degrau 9 (I5): a regra nova nasce na pele do lápis.
import { bornInSkinNotice, runBornInSkin } from './skins-model.js';
import { editingSkinOf } from '../viewport/onion.js';
import { redrawPlan, signature } from './list-redraw.js';
import type { ListShape } from './list-redraw.js';
// Porta D6 (degrau 12): Simular, Reiniciar e Assar em chaves.
import {
  BakePhysics, bakeNotice, physicsOn, planPhysicsBake, resetAllPhysics, resetOnePhysics,
  setPhysicsOn, watchPhysics,
} from './rules-physics.js';
// Porta G9/P15 (degrau 12): variáveis e marcas, com o jeito de desligar (Q23).
import {
  AddTag, AddVariable, DeleteVariable, ToggleAnimationTag, activeTagsAt,
  setVarsOn, tagRows, variableRow, variableRows, varsOffNotice, varsOn,
} from './rules-vars.js';
// Rodada final, lote 2: trocar os ossos de uma regra já feita (`SetRuleChain`).
import { SetRuleChain, chainChange, chainChangeNotice, chainOf } from './rules-model.js';
import { RULES_DELETE_NOTHING, RULES_NEW_ITEMS, rulesDeleteTarget } from './rules-model.js';
// Rodada final, lote 3: gravar a chave do alvo no valor de agora (`KeyDriverTarget`).
import { KeyDriverTarget, driverKeyPlans } from './rules-model.js';
import { sectionTitle, sectionsOpen } from './rules-model.js';
// Rodada final, lote 1 (28/09/2026): apagar e renomear etiqueta ganham porta.
import { DeleteTag, RenameTag, keyTagHere, renameTagProblem, tagUsers, varsShape } from './rules-vars.js';
import type { TagRow, VariableRow } from './rules-vars.js';

/**
 * O documento com que as ações da aba Regras agem **sem o painel montado** —
 * defeito 2 (19/09/2026).
 *
 * Com a aba fechada não há painel, e sem painel não havia `this.doc`: mesmo
 * depois de a ação passar a existir, ela voltaria em silêncio na primeira
 * linha. Quem o guarda é o arranque (`rules-actions.ts`), que já recebe o
 * documento — é o mesmo caminho do `skins-actions.ts`, que nunca precisou do
 * painel para nada.
 */
let docDeArranque: EditorDoc | null = null;

/** Chamado uma vez, no arranque. Ver `rules-actions.ts`. */
export function setRulesDoc(doc: EditorDoc): void {
  docDeArranque = doc;
}

class RulesPanel implements Panel {
  readonly id = 'regras';
  readonly title = 'Regras';
  // `time` entrou com as marcas (§8.5): "que marcas valem daqui em diante" é
  // resposta do INSTANTE, e uma lista que não acompanha o cursor mostraria o
  // estado de um tempo que já passou.
  readonly listensTo = ['file', 'structure', 'selection', 'time'] as const;

  private doc: EditorDoc | null = null;
  private list: HTMLElement | null = null;
  /** O botão do interruptor, para o nome dele acompanhar o estado. */
  private simular: HTMLButtonElement | null = null;
  private drawn: ListShape = { rows: '', picked: null };
  private forget: Array<() => void> = [];

  mount(doc: EditorDoc, host: HTMLElement): void {
    this.doc = doc;
    clear(host);
    host.classList.add('painel', 'regras');

    const barra = el('div', 'painel-barra');
    // Rodada 17, PL-10 (o plano D9): os quatro "criar" viram UM **Novo ▾**,
    // como na Árvore, e as três lixeiras iguais viram UM **Apagar**, que
    // apaga o que está escolhido na lista. Eram doze ícones soltos.
    barra.append(
      this.newMenuButton(),
      iconButton('trash', 'Apagar o escolhido na lista: a regra, o parâmetro ou a variável', () => this.deleteChosen()),
    );
    // Porta D6: os três gestos da física, na mesma barra, em ícone com o nome
    // na dica. O interruptor diz no próprio nome em que estado está — um botão
    // que só muda de cor não conta o que faz.
    this.simular = iconButton('rule-physics', 'Simular a física', () => this.toggleSimulate());
    barra.append(
      this.simular,
      iconButton('reload', 'Reiniciar esta física', () => this.resetOne()),
      iconButton('back-to-setup', 'Reiniciar todas as físicas', () => this.resetAll()),
      iconButton('key', 'Assar a física em chaves', () => this.bake()),
    );
    // Porta G9/P15: criar e apagar variável, criar marca, e o interruptor da
    // seção inteira — o "jeito de desligar" que ele pediu (Q23).
    barra.append(
      iconButton('eye', 'Mostrar ou esconder variáveis e etiquetas', () => this.toggleVars()),
    );

    const corpo = el('div', 'painel-corpo');
    // A lista cresce com o arquivo, e por isso pode rolar: a prova
    // `medir-paineis.mjs` lê esta marca e deixa esta caixa em paz.
    corpo.dataset.rolagem = 'lista';
    this.list = el('ul', 'regras-lista');
    corpo.append(this.list);
    host.append(barra, corpo);

    // Porta D6: o interruptor vale mesmo com esta aba escondida, então o vigia
    // mora no DOCUMENTO e não neste painel (ver `rules-physics.ts`).
    watchPhysics(doc);

    /*
     * As nove ações desta aba NÃO nascem aqui — defeito 2 (19/09/2026).
     *
     * Nasciam, e com a aba Regras fechada o painel nunca monta: a ação **não
     * existia**, o `runAction` devolvia `false`, e o menu chamava sem que nada
     * acontecesse **e sem avisar**. Não era descuido de quem escreveu o aviso:
     * é que não havia ninguém para avisar, porque a coisa que avisaria também
     * não tinha sido montada.
     *
     * Agora são de ARRANQUE, em `rules-actions.ts`, como as da pele desde o
     * lote A2 — e o guarda de `acoes.test.ts` já exigia isso por escrito.
     */
    this.render();
  }

  /**
   * O documento para agir: o do painel montado, ou o do arranque.
   *
   * As nove ações desta aba valem com a aba FECHADA (defeito 2), e aí não há
   * painel montado. Desenhar continua guardado pelo `render`, que não faz
   * nada sem a lista na tela.
   */
  private docAgora(): EditorDoc | null {
    return this.doc ?? docDeArranque;
  }

  refresh(change: DocChange): void {
    const doc = this.doc;
    if (doc === null) return;
    const agora = this.shapeNow(doc);
    switch (redrawPlan(change.kind, this.drawn, agora)) {
      case 'nada':
        return;
      case 'so-escolha':
        this.drawn = agora;
        this.render();
        return;
      default:
        this.render();
    }
  }

  unmount(): void {
    for (const parar of this.forget) parar();
    this.forget = [];
    this.doc = null;
    this.list = null;
  }

  // -------------------------------------------------------------------------
  // Criar e apagar
  // -------------------------------------------------------------------------

  /**
   * A janela guiada — uma por tipo, em palavras.
   *
   * Primeiro **qual regra**, com a frase do que cada uma faz e o exemplo do
   * herói; depois as perguntas daquela regra. Duas janelas curtas, e não uma
   * comprida com campos que não valem para o tipo escolhido.
   */
  async newRule(): Promise<void> {
    const doc = this.docAgora();
    if (doc === null) return;

    const tipo = await this.askType();
    if (tipo === null) return;
    const info = RULE_INFO[tipo];

    const bones: GuidedOption[] = (doc.file.bones ?? [])
      .map((bone) => ({ value: bone.name, label: bone.name }));
    const slots: GuidedOption[] = (doc.file.slots ?? [])
      .map((slot) => ({ value: slot.name, label: slot.name }));
    const parametros: GuidedOption[] = (doc.file.parameters ?? [])
      .map((p) => ({ value: p.name, label: p.name }));

    // Os ossos escolhidos na cena já entram marcados: quem escolheu a perna e
    // pediu uma IK não quer marcar a perna de novo.
    const escolhidos = doc.selection.bones.filter(
      (name) => bones.some((b) => b.value === name),
    );

    const fields: GuidedField[] = [];
    if (tipo === 'physics') {
      fields.push({
        id: 'chain', label: 'Que osso balança?', kind: 'varios',
        options: bones, value: escolhidos.slice(0, 1),
      });
    } else if (tipo === 'driver') {
      fields.push({
        id: 'parameter', label: 'Que parâmetro manda?', kind: 'escolha',
        options: parametros,
        hint: parametros.length === 0
          ? 'Este arquivo ainda não tem parâmetro. Crie um no botão Novo parâmetro, aqui na barra.'
          : undefined,
      });
      // Porta D3: sem estas duas perguntas a regra nascia com `targets: []` —
      // existia na lista, e o runtime a ignorava sem uma palavra.
      fields.push({
        id: 'driverBone', label: 'Em que osso ele manda?', kind: 'escolha',
        options: bones,
        value: doc.selection.bones[0],
      });
      fields.push({
        id: 'driverProperty', label: 'O que ele mexe nesse osso?', kind: 'escolha',
        options: DRIVER_PROPERTIES.map((o) => ({ value: o.value, label: o.label })),
        value: 'rotation',
        hint: 'A regra nasce mexendo de verdade; os números exatos ficam em Propriedades.',
      });
    } else {
      fields.push({
        id: 'chain',
        label: tipo === 'ik' ? 'Que ossos dobram?'
          : tipo === 'path' ? 'Que ossos deslizam?' : 'Quem copia?',
        kind: 'varios',
        options: bones,
        value: escolhidos,
        hint: tipo === 'ik'
          ? 'Um ou dois. A ordem pai → filho é posta sozinha, pela ordem do esqueleto.'
          : 'A ordem é posta sozinha, pela ordem do esqueleto.',
      });
      fields.push({
        id: 'target',
        label: tipo === 'path' ? 'Por qual caminho?'
          : tipo === 'ik' ? 'Que osso eles perseguem?' : 'Copia de quem?',
        kind: 'escolha',
        options: tipo === 'path' ? slots : bones,
      });
    }
    if (tipo === 'ik') {
      fields.push({
        id: 'bend', label: 'Dobra para a frente?', kind: 'liga', value: true,
        hint: 'Desligado, o joelho dobra para o outro lado.',
      });
    }

    const resposta = await askGuided({
      title: `Nova regra de ${info.label}`,
      lead: info.what,
      note: info.example,
      fields,
      yesLabel: 'Criar a regra',
      validate: (values) => validateNewRule(doc.file, planFrom(tipo, values)),
    });
    if (resposta === null) return;

    // A cadeia vai para o arquivo na **ordem do arquivo**, e não na ordem em
    // que as caixas foram marcadas: no formato o pai vem sempre antes do filho
    // (§4.1), então a ordem do arquivo já É pai → filho, que é o que a IK
    // precisa. Marcar de trás para frente deixa de quebrar a regra em silêncio.
    const ordem = (doc.file.bones ?? []).map((b) => b.name);
    const bruto = planFrom(tipo, resposta);
    const plan: NewRulePlan = {
      ...bruto,
      chain: ordem.filter((name) => bruto.chain.includes(name)),
    };
    const command = new AddGuidedRule(doc.file, plan);
    // Degrau 9 (I5): com o lápis aceso numa pele, a regra nasce DENTRO dela —
    // `skinRequired` e listada nela, num passo de desfazer só. É o outro meio
    // do teste ao vivo de 16/09: o lápis valia para o desenho e não para a
    // regra nem para o osso.
    const skin = runBornInSkin(doc, command, 'constraints', command.name, editingSkinOf(doc));
    doc.select({ ...emptySelection(), constraints: [command.name] });
    if (skin !== null) {
      doc.notice(bornInSkinNotice(`A regra "${command.name}"`, skin));
      return;
    }
    // Defeito A4 (degrau 9): a regra Comando nasce sem alvo — ela existe e não
    // faz nada até alguém escolher em quem ela manda. O rodapé diz isso na
    // hora, em vez de deixar a pessoa procurar o efeito que nunca vem.
    const falta = newRuleNotice(plan);
    doc.notice(falta === null
      ? `Regra "${command.name}" criada`
      : `Regra "${command.name}" criada — ${falta}`);
  }

  /** A primeira janela: qual das cinco, com o que cada uma faz escrito. */
  private async askType(): Promise<RuleType | null> {
    const resposta = await askGuided({
      title: 'Nova regra',
      lead: 'Uma regra faz o boneco se mexer sozinho, dentro do jogo.',
      fields: [{
        id: 'tipo',
        label: 'Que tipo de regra?',
        kind: 'escolha',
        options: RULE_TYPES.map((type) => ({
          value: type,
          label: `${RULE_INFO[type].label} — ${RULE_INFO[type].what}`,
        })),
      }],
      yesLabel: 'Continuar',
      validate: (values) => (
        (values['tipo']?.[0] ?? '') === '' ? 'Escolha um tipo de regra.' : null
      ),
    });
    const tipo = resposta?.['tipo']?.[0];
    return tipo === undefined ? null : (tipo as RuleType);
  }

  /** Apaga a regra escolhida. Público desde a rodada 6: o menu chama o mesmo. */
  /** O **Novo ▾** da aba Regras — rodada 17, PL-10. O mesmo desenho do da Árvore. */
  private newMenuButton(): HTMLElement {
    const holder = el('span', 'arvore-novo regras-novo');
    const botao = el('button', 'painel-botao painel-botao-icone arvore-novo-botao') as HTMLButtonElement;
    botao.type = 'button';
    const mais = el('span', 'painel-botao-icone');
    if (!paintIcon(mais, 'plus', 18)) mais.textContent = '+';
    const seta = el('span', 'painel-botao-seta');
    if (!paintIcon(seta, 'chevron-down', 14)) seta.textContent = '▾';
    botao.append(mais, el('span', 'painel-botao-nome', 'Novo'), seta);
    botao.title = 'Novo: regra, parâmetro, variável ou etiqueta';
    botao.setAttribute('aria-label', botao.title);
    botao.setAttribute('aria-expanded', 'false');
    botao.setAttribute('aria-haspopup', 'menu');
    const lista = el('ul', 'menu-list arvore-novo-lista');
    lista.setAttribute('role', 'menu');
    lista.hidden = true;
    const fechar = (): void => {
      lista.hidden = true;
      botao.setAttribute('aria-expanded', 'false');
    };
    const rodar: Record<typeof RULES_NEW_ITEMS[number], () => void> = {
      'Regra…': () => { void this.newRule(); },
      'Parâmetro': () => this.newParameter(),
      'Variável': () => this.newVariable(),
      'Etiqueta': () => this.newTag(),
    };
    for (const nome of RULES_NEW_ITEMS) {
      const item = el('li', 'menu-row');
      const linha = el('button', 'menu-item', nome) as HTMLButtonElement;
      linha.type = 'button';
      linha.setAttribute('role', 'menuitem');
      linha.addEventListener('click', () => {
        fechar();
        rodar[nome]();
      });
      item.append(linha);
      lista.append(item);
    }
    botao.addEventListener('click', () => {
      const abrir = lista.hidden;
      lista.hidden = !abrir;
      botao.setAttribute('aria-expanded', String(abrir));
    });
    const fora = (event: PointerEvent): void => {
      if (!lista.hidden && !holder.contains(event.target as Node)) fechar();
    };
    document.addEventListener('pointerdown', fora);
    this.forget.push(() => document.removeEventListener('pointerdown', fora));
    holder.append(botao, lista);
    return holder;
  }

  /** O **Apagar** da barra: o que está escolhido na lista — rodada 17, PL-10. */
  deleteChosen(): void {
    const doc = this.docAgora();
    if (doc === null) return;
    const alvo = rulesDeleteTarget(doc.selection);
    if (alvo === 'regra') this.deleteRule();
    else if (alvo === 'parametro') this.deleteParameter();
    else if (alvo === 'variavel') this.deleteVariable();
    else doc.notice(RULES_DELETE_NOTHING);
  }

  deleteRule(): void {
    const doc = this.docAgora();
    if (doc === null) return;
    const nome = doc.selection.constraints[0];
    if (nome === undefined) {
      doc.notice('Escolha uma regra na lista primeiro');
      return;
    }
    doc.run(new DeleteItems({ ...emptySelection(), constraints: [nome] }));
    doc.notice(`Regra "${nome}" apagada`);
  }

  // -------------------------------------------------------------------------
  // Desenhar
  // -------------------------------------------------------------------------

  private shapeNow(doc: EditorDoc): ListShape {
    return {
      rows: signature([
        ...parameterRows(doc.file)
          .map((p) => ['p', p.name, p.label, p.min, p.max, p.value, p.driven,
            p.usedBy.join(','), p.problems.join(';')]),
        ...ruleRows(doc.file)
          .map((r) => [r.name, r.type, r.target, r.mix, r.chain.join(','), r.problems.join(';')]),
        // Rodada final, lote 1: as variáveis e as etiquetas estavam FORA da
        // assinatura, e a lista não se refazia ao abrir uma animação nem ao
        // renomear uma etiqueta. Ver `varsShape`.
        ...varsShape(doc.file, doc.animation, doc.time),
      ]),
      picked: doc.selection.constraints[0]
        ?? (doc.selection.parameters ?? [])[0]
        ?? (doc.selection.variables ?? [])[0]
        ?? null,
    };
  }

  private render(): void {
    const doc = this.doc;
    const list = this.list;
    if (doc === null || list === null) return;
    this.paintSimulate();
    // Rodada 47, lote 4: a barrinha mexida pelo teclado continua com o foco.
    const voltarFoco = lembrarFoco(list);
    queueMicrotask(() => voltarFoco());
    clear(list);
    this.drawn = this.shapeNow(doc);

    // Os parâmetros vêm PRIMEIRO: é deles que a regra Comando lê, e a ordem de
    // fazer é essa — parâmetro, depois a regra que o usa.
    this.renderParameters(doc, list);

    list.append(el('li', 'regras-secao', 'Regras'));
    const rows = ruleRows(doc.file);
    if (rows.length === 0) {
      list.append(el('li', 'painel-aviso',
        'Nenhuma regra ainda. Uma regra faz o boneco se mexer sozinho no jogo — '
        + 'use Nova regra.'));
    }
    for (const row of rows) list.append(this.buildRow(doc, row));

    // Porta G9/P15: as variáveis e as etiquetas vêm por último. Não são regras
    // — não mexem no desenho —, e por isso ficam no pé e podem ser desligadas.
    // **Sem `return` acima**: num arquivo sem regra nenhuma a seção tem de
    // aparecer do mesmo jeito. Quem criasse uma variável num arquivo novo a
    // veria sumir — que é o defeito que este lote existe para consertar.
    this.renderVars(doc, list);
    this.dobrarSecoes(list);
  }

  /**
   * As seções dobram no título — Rodada 47, lote 6d (doc 90; o detalhe do conferente). Quem decide é
   * `sectionsOpen`; aqui só se conta o que já foi desenhado e se esconde.
   */
  private dobrarSecoes(list: HTMLElement): void {
    const grupos: Array<{ head: HTMLElement; itens: HTMLElement[] }> = [];
    for (const filho of [...list.children] as HTMLElement[]) {
      if (filho.classList.contains('regras-secao')) grupos.push({ head: filho, itens: [] });
      else grupos[grupos.length - 1]?.itens.push(filho);
    }
    const secoes = grupos.map((g) => {
      const linhas = g.itens.filter((i) => i.classList.contains('regras-linha'));
      return {
        title: g.head.textContent ?? '',
        count: linhas.length,
        chosen: linhas.some((i) => i.classList.contains('regras-linha-escolhida')),
        problem: linhas.some((i) => i.classList.contains('regras-linha-erro')),
      };
    });
    const abertas = sectionsOpen(secoes, secoesDaMao);
    grupos.forEach((g, i) => {
      const s = secoes[i]!;
      const aberta = abertas[i] ?? true;
      g.head.classList.add('regras-secao-dobra');
      g.head.textContent = aberta ? s.title : sectionTitle(s.title, s.count);
      g.head.setAttribute('role', 'button');
      g.head.setAttribute('aria-expanded', String(aberta));
      g.head.tabIndex = 0;
      g.head.title = `${aberta ? 'Dobrar' : 'Abrir'}: ${s.title}`;
      for (const item of g.itens) item.classList.toggle('regras-dobrada', !aberta);
      const virar = (): void => {
        secoesDaMao.set(s.title, !aberta);
        this.render();
      };
      g.head.addEventListener('click', virar);
      g.head.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        event.stopPropagation();
        virar();
      });
    });
  }

  // -------------------------------------------------------------------------
  // G9/P15 — variáveis e marcas, com o jeito de desligar (Q23)
  // -------------------------------------------------------------------------

  /**
   * **As variáveis e as marcas** — porta G9/P15.
   *
   * Desligada, a seção **continua dizendo que está desligada**, e quantas o
   * arquivo tem escondidas ali. Um interruptor que faz a coisa sumir sem dizer
   * que ela existe é o defeito que a Janela de Problemas consertou no degrau
   * 11 — e aqui seria pior, porque um jogo que lê a variável continuaria lendo.
   */
  private renderVars(doc: EditorDoc, host: HTMLElement): void {
    if (!varsOn()) {
      const linha = el('li', 'painel-aviso regras-desligado', varsOffNotice(doc.file));
      linha.append(iconButton('eye', 'Ligar variáveis e etiquetas', () => this.toggleVars()));
      host.append(linha);
      return;
    }

    host.append(el('li', 'regras-secao', 'Variáveis'));
    const vars = variableRows(doc.file);
    if (vars.length === 0) {
      host.append(el('li', 'painel-aviso',
        'Nenhuma variável. Uma variável é um valor com nome que a animação muda e o jogo lê.'));
    }
    for (const row of vars) host.append(this.buildVariableRow(doc, row));

    host.append(el('li', 'regras-secao', 'Etiquetas'));
    const tags = tagRows(doc.file, doc.animation, doc.time);
    if (tags.length === 0) {
      host.append(el('li', 'painel-aviso',
        'Nenhuma etiqueta. Uma etiqueta liga um trecho da animação a uma palavra: '
        + '"janela de ataque", "invulnerável", "pé no chão".'));
      return;
    }
    for (const row of tags) host.append(this.buildTagRow(doc, row));
    // §8.5: o que o jogo lê AGORA é a união das duas metades. Nem a lista da
    // animação nem a chave, sozinhas, respondem isso — e é isso que se quer
    // saber ao parar o cursor num instante.
    if (doc.animation !== null) {
      const ativas = activeTagsAt(doc.file, doc.animation, doc.time);
      host.append(el('li', 'painel-aviso', ativas.length === 0
        ? `Em ${segundos(doc.time)} o jogo não lê etiqueta nenhuma.`
        : `Em ${segundos(doc.time)} o jogo lê: ${ativas.join(', ')}.`));
    }
  }

  /** Liga e desliga a seção inteira (Q23), e diz em que estado ficou. */
  toggleVars(): void {
    const doc = this.docAgora();
    if (doc === null) return;
    const agora = !varsOn();
    setVarsOn(agora);
    this.render();
    doc.notice(agora
      ? 'Variáveis e etiquetas ligadas'
      : varsOffNotice(doc.file));
  }

  private buildVariableRow(doc: EditorDoc, row: VariableRow): HTMLElement {
    const escolhida = (doc.selection.variables ?? []).includes(row.name);
    const classes = ['regras-linha', 'regras-linha-variavel'];
    if (escolhida) classes.push('regras-linha-escolhida');
    if (row.problems.length > 0) classes.push('regras-linha-erro');
    const item = el('li', classes.join(' '));

    const marca = el('span', 'regras-tipo');
    if (!paintIcon(marca, 'marker', 18)) marca.textContent = 'V';
    marca.title = 'Variável';
    marca.setAttribute('aria-label', 'Variável');

    const nomes = el('div', 'regras-nomes');
    nomes.append(el('span', 'regras-nome', row.name));
    const abaixo = row.problems.length > 0
      ? row.problems[0]!
      : row.keyedIn.length === 0
        ? `${row.typeLabel} · ${leValor(row.value)} · nenhuma animação a chaveia`
        : `${row.typeLabel} · ${leValor(row.value)} · ${row.keyedIn.join(', ')}`;
    nomes.append(el('span', 'regras-detalhe', abaixo));

    const dica = `${row.name}: ${row.typeLabel}, agora ${leValor(row.value)}`;
    item.title = row.problems.length > 0
      ? `${row.name}: ${row.problems.join('; ')}` : dica;
    item.addEventListener('click', () => {
      doc.select({ ...emptySelection(), variables: [row.name] });
    });
    item.append(marca, nomes);
    return item;
  }

  /**
   * Uma marca, com as **duas** metades da §8.5 separadas.
   *
   * A primeira vale a animação inteira (`animation.tags`, estática). A segunda
   * vale daquele instante em diante (a chave da timeline `tag`). São caminhos
   * diferentes, e juntá-los num interruptor só faria a tela mentir sobre qual
   * das duas foi escrita.
   */
  private buildTagRow(doc: EditorDoc, row: TagRow): HTMLElement {
    const item = el('li', 'regras-linha regras-linha-marca');

    const marca = el('span', 'regras-tipo');
    if (!paintIcon(marca, 'bracket-open', 18)) marca.textContent = '#';
    marca.title = 'Etiqueta';
    marca.setAttribute('aria-label', 'Etiqueta');

    const nomes = el('div', 'regras-nomes');
    const nome = el('span', 'regras-nome', row.name);
    // Rodada final, lote 1 — o gesto do Spine: duplo clique no nome renomeia.
    nome.title = `${row.name} — duplo clique renomeia`;
    nome.addEventListener('dblclick', (event) => {
      event.preventDefault();
      void this.renameTag(row.name);
    });
    nomes.append(nome);
    nomes.append(el('span', 'regras-detalhe', row.usedIn.length === 0
      ? 'nenhuma animação usa esta etiqueta'
      : row.usedIn.join(', ')));

    const acoes = el('div', 'regras-marca-acoes');
    const aberta = doc.animation;
    if (aberta === null) {
      acoes.append(el('span', 'regras-detalhe', 'abra uma animação'));
    } else {
      acoes.append(
        this.tagToggle(
          `A etiqueta "${row.name}" vale na animação "${aberta}" inteira`,
          row.wholeAnimation,
          () => { doc.run(new ToggleAnimationTag(aberta, row.name)); this.render(); },
          'inteira',
        ),
        this.tagToggle(
          `A etiqueta "${row.name}" vale a partir de ${segundos(doc.time)}`,
          row.activeNow,
          () => this.keyTagNow(doc, row),
          'daqui',
        ),
      );
    }

    // Rodada final, lote 1: o lápis e a lixeira, na própria linha. A etiqueta
    // não tem ficha e não entra em `Selection`: um botão na barra pediria
    // "escolha uma etiqueta primeiro", e não há como escolher.
    const editar = el('div', 'regras-marca-editar');
    editar.append(
      rowButton('rename', `Renomear a etiqueta "${row.name}"`, () => { void this.renameTag(row.name); }),
      rowButton('trash', `Apagar a etiqueta "${row.name}"`, () => { void this.deleteTag(row.name); }),
    );

    item.title = `${row.name}: ${row.usedIn.length === 0 ? 'não usada' : row.usedIn.join(', ')}`;
    item.append(marca, nomes, acoes, editar);
    return item;
  }

  /**
   * **Renomear a etiqueta** — `RenameTag`, que não tinha porta até a rodada
   * final. O nome novo entra em toda animação e em toda chave que cita o
   * velho. Nome repetido é recusado **na janela**, antes do comando: assim a
   * pilha de desfazer não ganha um passo que não fez nada.
   */
  async renameTag(nome: string): Promise<void> {
    const doc = this.docAgora();
    if (doc === null) return;
    const resposta = await askForm({
      title: 'Renomear a etiqueta',
      lead: 'O nome novo entra também em toda animação e em toda chave que cita esta etiqueta.',
      fields: [{ id: 'nome', label: 'Nome', value: nome }],
      yesLabel: 'Renomear',
      preview: (values) => renameTagProblem(doc.file, nome, values['nome'] ?? '') ?? '',
    });
    if (resposta === null) return;
    const novo = (resposta['nome'] ?? '').trim();
    const problema = renameTagProblem(doc.file, nome, novo);
    if (problema !== null) {
      doc.notice(`A etiqueta "${nome}" ficou como estava: ${problema}`);
      return;
    }
    if (novo === nome) return;
    doc.run(new RenameTag(nome, novo));
    this.render();
    doc.notice(`Etiqueta "${nome}" agora é "${novo}"`);
  }

  /**
   * **Apagar a etiqueta** — `DeleteTag`, sem porta até a rodada final.
   *
   * Apagar tira o nome de toda animação e de toda chave (§8.5). Etiqueta que
   * nenhuma animação usa sai direto — desfazer a traz de volta. Etiqueta
   * usada pergunta antes, com a lista das animações: é a régua 21, nada some
   * calado.
   */
  async deleteTag(nome: string): Promise<void> {
    const doc = this.docAgora();
    if (doc === null) return;
    const usam = tagUsers(doc.file, nome);
    if (usam.length > 0) {
      const sim = await askUser({
        title: `Apagar a etiqueta "${nome}"?`,
        lead: usam.length === 1
          ? 'Ela sai também desta animação, da lista e das chaves:'
          : `Ela sai também destas ${usam.length} animações, da lista e das chaves:`,
        lines: usam,
        yesLabel: 'Apagar a etiqueta',
        noLabel: 'Deixar como está',
      });
      if (!sim) return;
    }
    doc.run(new DeleteTag(nome));
    this.render();
    doc.notice(usam.length === 0
      ? `Etiqueta "${nome}" apagada`
      : `Etiqueta "${nome}" apagada, e tirada de ${usam.join(', ')}`);
  }

  /** Um interruptor pequeno, com o nome na dica e a palavra visível. */
  private tagToggle(
    nome: string, ligado: boolean, onClick: () => void, palavra: string,
  ): HTMLButtonElement {
    const botao = el('button', 'regras-acao regras-marca-acao') as HTMLButtonElement;
    botao.type = 'button';
    botao.textContent = palavra;
    botao.title = nome;
    botao.setAttribute('aria-label', nome);
    botao.setAttribute('aria-pressed', String(ligado));
    botao.classList.toggle('regras-acao-ligada', ligado);
    botao.addEventListener('click', (event) => {
      event.stopPropagation();
      onClick();
    });
    return botao;
  }

  /**
   * Chaveia a marca no instante do cursor: uma chave `tag` com a lista inteira
   * daquele momento (§8.5 — *"tags ativas daquele instante até a próxima
   * chave"*), e não só a marca clicada.
   */
  private keyTagNow(doc: EditorDoc, row: TagRow): void {
    // P12: a conta e o "mostrar a chave" moram em `keyTagHere`.
    const feito = keyTagHere(doc, row.name);
    if (feito === null) {
      doc.notice('Abra uma animação para chavear as etiquetas: a etiqueta vale num trecho dela.');
      return;
    }
    const { ordem } = feito;
    this.render();
    doc.notice(ordem.length === 0
      ? `Em ${segundos(doc.time)} nenhuma etiqueta vale daqui em diante`
      : `Em ${segundos(doc.time)} valem daqui em diante: ${ordem.join(', ')}`);
  }

  /** Uma variável nova, já escolhida, com a ficha aberta em Propriedades. */
  newVariable(): void {
    const doc = this.docAgora();
    if (doc === null) return;
    if (!varsOn()) setVarsOn(true);
    const command = new AddVariable(doc.file);
    doc.run(command);
    doc.select({ ...emptySelection(), variables: [command.name] });
    doc.notice(`Variável "${command.name}" criada — número com vírgula, valendo 0`);
  }

  /** Uma marca nova. */
  newTag(): void {
    const doc = this.docAgora();
    if (doc === null) return;
    if (!varsOn()) setVarsOn(true);
    const command = new AddTag(doc.file);
    doc.run(command);
    this.render();
    doc.notice(`Etiqueta "${command.name}" criada — ligue-a numa animação aqui na lista`);
  }

  /** Apaga a variável escolhida, ou diz que não há uma. */
  deleteVariable(): void {
    const doc = this.docAgora();
    if (doc === null) return;
    const nome = (doc.selection.variables ?? [])[0];
    if (nome === undefined) {
      doc.notice('Escolha uma variável na lista primeiro');
      return;
    }
    const chaveada = variableRow(doc.file, nome)?.keyedIn ?? [];
    doc.run(new DeleteVariable(nome));
    doc.select(emptySelection());
    doc.notice(chaveada.length === 0
      ? `Variável "${nome}" apagada`
      : `Variável "${nome}" apagada, com as chaves dela em ${chaveada.join(', ')}`);
  }


  /**
   * **A lista de parâmetros** — degrau 12, porta D3.
   *
   * O parâmetro já se criava (menu Novo ▾ → Parâmetro) e **não aparecia em
   * lugar nenhum**: nem na Árvore, nem em Propriedades. Nascia e sumia.
   *
   * Uma linha por parâmetro: o nome, a barra do valor, e o clique que abre a
   * ficha em Propriedades. É o Slider do Spine — o único dos três programas
   * que tem a coisa (Spriter e DragonBones não têm parâmetro nenhum).
   *
   * A barra escreve o `default` (§8.1), que é o que a setup pose usa: o
   * `setToSetupPose` do runtime copia `default` para `Skeleton.parameters`,
   * então arrastar move o boneco na hora, pela regra Comando que o lê. Com uma
   * animação aberta a mesma escrita vira **chave** na timeline `parameter`,
   * pela regra dos dois modos — sem nenhum caminho novo.
   */
  private renderParameters(doc: EditorDoc, host: HTMLElement): void {
    const rows = parameterRows(doc.file);
    host.append(el('li', 'regras-secao', 'Parâmetros'));
    if (rows.length === 0) {
      host.append(el('li', 'painel-aviso',
        'Nenhum parâmetro. Um parâmetro é um número com nome que a regra Comando lê — '
        + 'use Novo parâmetro.'));
      return;
    }
    for (const row of rows) host.append(this.buildParameterRow(doc, row));
  }

  private buildParameterRow(doc: EditorDoc, row: ParameterRow): HTMLElement {
    const escolhido = (doc.selection.parameters ?? []).includes(row.name);
    const classes = ['regras-linha', 'regras-linha-parametro'];
    if (escolhido) classes.push('regras-linha-escolhida');
    if (row.problems.length > 0) classes.push('regras-linha-erro');
    const item = el('li', classes.join(' '));

    const marca = el('span', 'regras-tipo');
    if (!paintIcon(marca, 'rule-driver', 18)) marca.textContent = 'P';
    marca.title = 'Parâmetro';
    marca.setAttribute('aria-label', 'Parâmetro');

    const nomes = el('div', 'regras-nomes');
    nomes.append(el('span', 'regras-nome', row.label));
    const abaixo = row.problems.length > 0
      ? row.problems[0]!
      : `de ${fmt(row.min)} a ${fmt(row.max)} · ${row.usedBy.join(', ')}`;
    nomes.append(el('span', 'regras-detalhe', abaixo));

    const barra = el('input', 'regras-forca') as HTMLInputElement;
    barra.type = 'range';
    barra.dataset.foco = `parametro-${row.name}`;
    // Cem passos na faixa do parâmetro, seja ela qual for: é a mesma barra da
    // força, e ela se arrasta de olho. O número exato está em Propriedades.
    barra.min = '0';
    barra.max = '100';
    barra.step = '1';
    const span = row.max - row.min;
    const emCem = span > 0 ? Math.round(((row.value - row.min) / span) * 100) : 0;
    barra.value = String(Math.min(100, Math.max(0, emCem)));
    // §8.1: com `source`, o valor é conta do osso e o runtime o recalcula todo
    // quadro. Uma barra que escrevesse aqui seria uma barra que não guarda o
    // que se escreve — pior que não ter barra.
    barra.disabled = row.driven || span <= 0;
    const dica = row.driven
      ? `"${row.label}" vem do osso: o valor é conta da origem, e não se arrasta`
      : `Valor de "${row.label}": ${fmt(row.value)} (de ${fmt(row.min)} a ${fmt(row.max)})`;
    barra.title = dica;
    barra.setAttribute('aria-label', dica);
    barra.addEventListener('input', () => {
      const valor = row.min + (Number(barra.value) / 100) * span;
      const campo = parameterValueField(doc.file, row.name);
      if (campo === null) return;
      if (writeFieldValue(doc, campo, Math.round(valor * 1000) / 1000) === 'recusado') {
        doc.notice(REFUSED_MESSAGE);
      }
    });
    barra.addEventListener('pointerdown', (event) => event.stopPropagation());

    item.title = row.problems.length > 0
      ? `${row.label}: ${row.problems.join('; ')}`
      : dica;
    item.addEventListener('click', () => {
      doc.select({ ...emptySelection(), parameters: [row.name] });
    });

    // Rodada final, lote 3 — o [+] do Live2D: grava uma chave em cada alvo que
    // lê este parâmetro, no valor em que a barra está agora.
    const chave = rowButton('key', `Gravar a chave aqui: "${row.label}" em ${fmt(row.value)}`,
      () => { void this.keyHere(row.name); });
    item.append(marca, nomes, barra, chave);
    return item;
  }

  /**
   * **Gravar a chave aqui** — `KeyDriverTarget`, sem porta até a rodada final.
   *
   * O `input` é o valor de agora do parâmetro. A janela mostra, para cada alvo
   * que o lê, o que ele vale agora (a conta do runtime, com as curvas), e quem
   * grava muda o número. Uma chave no mesmo `input` é substituída (§8.2, L1).
   */
  async keyHere(parameter: string): Promise<void> {
    const doc = this.docAgora();
    if (doc === null) return;
    const planos = driverKeyPlans(doc, parameter);
    if (typeof planos === 'string') {
      doc.notice(planos);
      return;
    }
    const nome = parameterRow(doc.file, parameter)?.label ?? parameter;
    const input = planos[0]!.input;
    const resposta = await askForm({
      title: `Gravar a chave de "${nome}" em ${fmt(input)}`,
      lead: `Com "${nome}" em ${fmt(input)}, quanto vale cada alvo? O número de agora já está escrito: mude e grave.`,
      fields: planos.map((p, i) => ({
        id: String(i), label: p.label, value: p.now === null ? '' : fmt(p.now),
        hint: p.now === null ? 'Este alvo não é número: escreva o valor.' : undefined,
      })),
      yesLabel: 'Gravar a chave',
      preview: (values) => {
        const ruins = planos.filter((_, i) => !Number.isFinite(lerNumero(values[String(i)] ?? '')));
        return ruins.length === 0 ? '' : `Falta um número em: ${ruins.map((p) => p.label).join('; ')}`;
      },
    });
    if (resposta === null) return;
    const gravadas: string[] = [];
    for (let i = 0; i < planos.length; i++) {
      const p = planos[i]!;
      const valor = lerNumero(resposta[String(i)] ?? '');
      if (!Number.isFinite(valor)) continue;
      doc.run(new KeyDriverTarget(p.rule, p.at, p.input, valor));
      gravadas.push(`${p.label} = ${fmt(valor)}`);
    }
    doc.notice(gravadas.length === 0
      ? `Nenhuma chave gravada: faltou o número`
      : `Chave em "${nome}" = ${fmt(input)}: ${gravadas.join('; ')}`);
  }

  // -------------------------------------------------------------------------
  // D6 — a física: Simular, Reiniciar, Assar
  // -------------------------------------------------------------------------

  /** Liga e desliga a simulação, e diz em que estado ficou. */
  toggleSimulate(): void {
    const doc = this.docAgora();
    if (doc === null) return;
    const agora = !physicsOn();
    setPhysicsOn(doc, agora);
    this.paintSimulate();
    doc.notice(agora
      ? 'Física ligada: os ossos com regra de física voltam a balançar'
      : 'Física desligada e zerada — é preferência sua, e não vai para o arquivo');
  }

  /** O nome do botão conta o que ele faz AGORA, e não o estado de antes. */
  private paintSimulate(): void {
    const botao = this.simular;
    if (botao === null) return;
    const ligada = physicsOn();
    const nome = ligada ? 'Parar de simular a física' : 'Voltar a simular a física';
    botao.title = nome;
    botao.setAttribute('aria-label', nome);
    botao.setAttribute('aria-pressed', String(ligada));
    botao.classList.toggle('regras-acao-ligada', ligada);
    const palavra = botao.querySelector('.painel-botao-nome');
    if (palavra !== null) palavra.textContent = nome;
  }

  /** §6.5 `physicsReset`, na regra escolhida. */
  resetOne(): void {
    const doc = this.docAgora();
    if (doc === null) return;
    const nome = doc.selection.constraints[0];
    if (nome === undefined) {
      doc.notice('Escolha uma regra de física na lista primeiro');
      return;
    }
    doc.notice(resetOnePhysics(doc, nome)
      ? `Física "${nome}" reiniciada: o balanço acumulado zerou`
      : `"${nome}" não é uma regra de física`);
  }

  /** §6.5 `physicsReset`, em todas. */
  resetAll(): void {
    const doc = this.docAgora();
    if (doc === null) return;
    const n = resetAllPhysics(doc);
    doc.notice(n === 0
      ? 'Este arquivo não tem regra de física nenhuma'
      : n === 1 ? '1 física reiniciada' : `${n} físicas reiniciadas`);
  }

  /**
   * Assar em chaves (§6.5, decisão A7): a simulação vira timelines `bone`.
   *
   * Depois do assado a animação **toca para trás igual** — chave não tem
   * estado. É o que o assado compra, e é o que a §6.5 diz que o editor oferece.
   */
  bake(): void {
    const doc = this.docAgora();
    if (doc === null) return;
    const nome = doc.selection.constraints[0];
    if (nome === undefined) {
      doc.notice('Escolha a regra de física que você quer assar');
      return;
    }
    const plan = planPhysicsBake(doc, nome);
    if (typeof plan === 'string') {
      doc.notice(plan);
      return;
    }
    doc.run(new BakePhysics(plan));
    doc.notice(bakeNotice(plan));
  }

  /** Um parâmetro novo, já escolhido, com a ficha aberta em Propriedades. */
  private newParameter(): void {
    const doc = this.doc;
    if (doc === null) return;
    const command = new AddParameter(doc.file);
    doc.run(command);
    doc.select({ ...emptySelection(), parameters: [command.name] });
    doc.notice(`Parâmetro "${command.name}" criado — de −1 a 1. `
      + 'Faça uma regra Comando para ele mexer em alguma coisa');
  }

  /** Apaga o parâmetro escolhido, ou diz que não há um escolhido. */
  deleteParameter(): void {
    const doc = this.docAgora();
    if (doc === null) return;
    const nome = (doc.selection.parameters ?? [])[0];
    if (nome === undefined) {
      doc.notice('Escolha um parâmetro na lista primeiro');
      return;
    }
    const lendo = parameterRow(doc.file, nome)?.usedBy ?? [];
    doc.run(new DeleteParameter(nome));
    doc.select(emptySelection());
    doc.notice(lendo.length === 0
      ? `Parâmetro "${nome}" apagado`
      : `Parâmetro "${nome}" apagado — ${lendo.join(', ')} ficou sem parâmetro e o jogo o ignora`);
  }


  private buildRow(doc: EditorDoc, row: RuleRow): HTMLElement {
    const escolhida = doc.selection.constraints.includes(row.name);
    const classes = ['regras-linha'];
    if (escolhida) classes.push('regras-linha-escolhida');
    if (row.off) classes.push('regras-linha-desligada');
    if (row.type === 'physics' && !physicsOn()) classes.push('regras-linha-parada');
    if (row.problems.length > 0) classes.push('regras-linha-erro');
    const item = el('li', classes.join(' '));

    // O olho: liga e desliga. Desligar é força zero, e o valor de antes volta
    // exatamente como estava — e não `1`, que quase nunca é o que se ajustou.
    const olho = el('button', 'regras-acao') as HTMLButtonElement;
    olho.type = 'button';
    if (!paintIcon(olho, 'eye', 18)) olho.textContent = row.off ? '○' : '◉';
    olho.setAttribute('aria-pressed', String(!row.off));
    olho.classList.toggle('regras-acao-ligada', !row.off);
    const dicaOlho = row.off
      ? `Ligar a regra "${row.name}" de volta, com a força que ela tinha`
      : `Desligar a regra "${row.name}". A força fica guardada`;
    olho.title = dicaOlho;
    olho.setAttribute('aria-label', dicaOlho);
    olho.addEventListener('click', (event) => {
      event.stopPropagation();
      doc.run(new ToggleRule(row.name));
    });

    const marca = el('span', 'regras-tipo');
    if (!paintIcon(marca, row.icon, 18)) marca.textContent = row.typeLabel.slice(0, 1);
    marca.title = row.typeLabel;
    marca.setAttribute('aria-label', row.typeLabel);
    marca.classList.add(`regras-tipo-${row.type}`);

    const nomes = el('div', 'regras-nomes');
    nomes.append(el('span', 'regras-nome', row.name));
    const abaixo = row.problems.length > 0
      ? row.problems[0]!
      : (row.target === null
        ? row.chain.join(' → ')
        : `${row.chain.join(' → ')} → ${row.target}`);
    // Porta D6, regra 21: com o interruptor desligado a regra existe, está
    // ligada no arquivo e **não faz nada na tela**. Sem esta linha, quem
    // desligou e voltou meia hora depois procuraria o defeito no lugar errado.
    const parada = row.type === 'physics' && !physicsOn() && !row.off;
    nomes.append(el('span', 'regras-detalhe',
      parada ? `${abaixo} · simulação desligada na tela` : abaixo));

    // A força numa barra, como no Spine: um número de 0 a 1 num campo de texto
    // não se ajusta de olho, e ajustar de olho é o que se faz com uma força.
    const barra = el('input', 'regras-forca') as HTMLInputElement;
    barra.type = 'range';
    barra.dataset.foco = `forca-${row.name}`;
    barra.min = '0';
    barra.max = '100';
    barra.step = '1';
    barra.value = String(Math.round(row.mix * 100));
    // Rodada 47, lote 6 (a prova final): a dica no molde da casa, com a unidade e a faixa.
    const dicaForca = `Força da regra "${row.name}", em %, de 0 a 100: ${Math.round(row.mix * 100)} %. 0 desliga, 100 é a regra inteira`;
    barra.title = dicaForca;
    barra.setAttribute('aria-label', dicaForca);
    barra.addEventListener('input', () => {
      doc.run(new SetRuleMix(row.name, Number(barra.value) / 100));
    });
    barra.addEventListener('pointerdown', (event) => event.stopPropagation());

    const dica = row.problems.length > 0
      ? `${row.name} (${row.typeLabel}): ${row.problems.join('; ')}`
      : `${row.name}: ${row.typeLabel}. ${abaixo}`;
    item.title = dica;
    item.addEventListener('click', () => {
      doc.select({ ...emptySelection(), constraints: [row.name] });
    });

    // Rodada final, lote 2 — o lápis do Spine: trocar os ossos sem apagar a
    // regra. Só nos tipos que têm osso; o Comando manda pelo parâmetro.
    const temOssos = RULE_INFO[row.type as RuleType]?.hasChain === true || row.type === 'physics';
    if (temOssos) {
      item.append(olho, marca, nomes,
        rowButton('rename', `Trocar os ossos da regra "${row.name}"`, () => { void this.changeChain(row.name); }),
        barra);
    } else {
      item.append(olho, marca, nomes, barra);
    }
    return item;
  }

  /**
   * **Trocar os ossos** de uma regra já feita — `SetRuleChain`, sem porta até
   * a rodada final. Hoje a única saída era apagar a regra e fazer outra.
   *
   * Abre a mesma janela da criação, com os ossos de agora já marcados, e diz
   * o alvo que fica: a pergunta é uma só, e o resto da regra não muda.
   */
  async changeChain(nome: string): Promise<void> {
    const doc = this.docAgora();
    if (doc === null) return;
    const def = (doc.file.constraints ?? []).find((c) => c.name === nome);
    if (def === undefined) {
      doc.notice(`A regra "${nome}" não existe mais`);
      return;
    }
    const tipo = def.type as RuleType;
    const info = RULE_INFO[tipo];
    if (info === undefined || tipo === 'driver') {
      doc.notice(`"${nome}" não tem ossos de cadeia para trocar`);
      return;
    }
    const antes = chainOf(def);
    const alvo = (def as { target?: unknown }).target;
    const bones: GuidedOption[] = (doc.file.bones ?? [])
      .map((bone) => ({ value: bone.name, label: bone.name }));
    const umSo = tipo === 'physics';
    const pergunta = tipo === 'ik' ? 'Que ossos dobram?'
      : tipo === 'path' ? 'Que ossos deslizam?'
        : tipo === 'physics' ? 'Que osso balança?' : 'Quem copia?';
    const dica = [
      tipo === 'ik' ? 'Um ou dois. A ordem pai → filho é posta sozinha.' : 'A ordem é posta sozinha, pela ordem do esqueleto.',
      typeof alvo === 'string' && alvo !== '' ? `O alvo continua "${alvo}".` : '',
    ].filter((t) => t !== '').join(' ');
    const campo: GuidedField = umSo
      ? { id: 'chain', label: pergunta, kind: 'escolha', options: bones, value: antes[0], hint: dica }
      : { id: 'chain', label: pergunta, kind: 'varios', options: bones, value: antes, hint: dica };
    const resposta = await askGuided({
      title: `Trocar os ossos de "${nome}"`,
      lead: info.what,
      fields: [campo],
      yesLabel: 'Trocar os ossos',
      validate: (values) => {
        const plano = chainChange(doc.file, nome, values['chain'] ?? []);
        return typeof plano === 'string' ? plano : null;
      },
    });
    if (resposta === null) return;
    const plano = chainChange(doc.file, nome, resposta['chain'] ?? []);
    if (typeof plano === 'string') {
      doc.notice(`Os ossos de "${nome}" ficaram como estavam: ${plano}`);
      return;
    }
    if (plano.join('\u0000') !== antes.join('\u0000')) {
      doc.run(new SetRuleChain(nome, plano));
      doc.select({ ...emptySelection(), constraints: [nome] });
    }
    doc.notice(chainChangeNotice(nome, antes, plano));
  }
}

export const rulesPanel = new RulesPanel();
registerPanel(rulesPanel);

/** O plano da janela, a partir do que ela devolveu. Puro, para o teste ler. */
export function planFrom(type: RuleType, values: Record<string, string[]>): NewRulePlan {
  return {
    type,
    chain: values['chain'] ?? [],
    target: values['target']?.[0] ?? '',
    bendPositive: (values['bend']?.length ?? 0) > 0,
    parameter: values['parameter']?.[0] ?? '',
    driverBone: values['driverBone']?.[0] ?? '',
    driverProperty: values['driverProperty']?.[0] ?? '',
  };
}

/**
 * Um botão pequeno de linha, em ícone, com o nome na dica — o mesmo feitio do
 * olho da regra (`regras-acao`). Não deixa o clique subir para a linha.
 */
function rowButton(icon: string, nome: string, onClick: () => void): HTMLButtonElement {
  const botao = el('button', 'regras-acao') as HTMLButtonElement;
  botao.type = 'button';
  if (!paintIcon(botao, icon, 16)) botao.textContent = nome.slice(0, 1);
  botao.title = nome;
  botao.setAttribute('aria-label', nome);
  botao.addEventListener('click', (event) => {
    event.stopPropagation();
    onClick();
  });
  return botao;
}

/** Lê "0,35" ou "0.35"; texto vazio ou torto dá `NaN`. */
function lerNumero(texto: string): number {
  const t = texto.trim().replace(',', '.');
  return t === '' ? Number.NaN : Number(t);
}

/** Um número do jeito que ele se lê em português. */
function fmt(value: number): string {
  return String(Math.round(value * 1000) / 1000).replace('.', ',');
}

/** "0,50 s" — a mesma forma do resto do editor. */
function segundos(time: number): string {
  return `${time.toFixed(2).replace('.', ',')} s`;
}

/** O valor de uma variável como ele se lê: sim/não em palavra, texto entre aspas. */
function leValor(value: number | string | boolean): string {
  if (typeof value === 'boolean') return value ? 'sim' : 'não';
  if (typeof value === 'string') return value === '' ? '(vazio)' : `"${value}"`;
  return fmt(value);
}

/** O que a mão abriu ou fechou na aba Regras, por título de seção — Rodada 47, lote 6d (doc 90; o detalhe do conferente). */
const secoesDaMao = new Map<string, boolean>();

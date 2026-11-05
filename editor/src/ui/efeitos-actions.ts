/**
 * As três portas dos efeitos que só gravam chaves — flash, pulso e tremor.
 *
 * A conta inteira mora em `anim/efeitos.ts`, que é módulo puro e não conhece
 * tela nenhuma. Aqui só está o que precisa de tela: perguntar os números,
 * mostrar a prévia enquanto a pessoa digita, e embrulhar o resultado num
 * comando de desfazer.
 *
 * **Por que este arquivo mora em `ui/` e não ao lado da conta.** `anim/` é o
 * degrau 1 e o registro de ações é o degrau 3 (`contract.ts`, cabeçalho):
 * `anim/` não pode importar `ui/actions.ts`, e o `fronteiras.test.ts` é quem
 * cobra. Então a conta fica embaixo e a porta fica aqui — o mesmo molde do
 * `panels/rules-actions.ts`, que nasceu em 22/09 pela mesma razão.
 *
 * **As três são de ARRANQUE**: existem com qualquer aba fechada, porque não
 * leem o DOM de painel nenhum — a escolha vem de `doc.selection` e o tempo vem
 * de `doc.time`. Ação que só funciona com o painel na tela desmente o que a
 * tabela de `ui/actions-table.ts` afirma, e isso tem nome nesta casa:
 * **existir não é funcionar**.
 */

import type { EditorDoc } from '../contract.js';
import type { PlanoDeEfeito } from '../anim/efeitos.js';
import { aplicarPlano, planoDoFlash, planoDoPulso, planoDoTremor } from '../anim/efeitos.js';
import { EditKeys } from '../anim/pose-mode.js';
import { registerAction } from './actions.js';
import { askForm } from './dialog.js';

// ---------------------------------------------------------------------------
// Os números da última vez
// ---------------------------------------------------------------------------

/*
 * Quem põe um flash põe cinco: a janela abre com os números da vez anterior,
 * para o segundo gesto ser só `Enter`. Isto é estado PASSAGEIRO do editor —
 * morre ao fechar o programa e não entra em arquivo nenhum, nem no
 * `RECORTE_editor_state`. A regra de ouro dos três vale também para o que eles
 * lembram: eles gravam chaves e somem.
 */
const lembrado = {
  flash: { subida: '0,05', descida: '0,15', cor: 'branco', forca: '1' },
  pulso: { subida: '0,10', descida: '0,20', fator: '1,2', eixos: 'ambos' },
  tremor: { duracao: '0,30', passos: '8', amplitude: '6', semente: '0' },
};

/** `"0,05"` e `"0.05"` são o mesmo número: ele escreve com vírgula. */
function numero(texto: string | undefined, padrao: number): number {
  const n = Number(String(texto ?? '').trim().replace(',', '.'));
  return Number.isFinite(n) ? n : padrao;
}

const CORES: ReadonlyArray<{ value: string; label: string; rgb: [number, number, number] }> = [
  { value: 'branco', label: 'Branco — o piscar de quem levou dano', rgb: [1, 1, 1] },
  { value: 'vermelho', label: 'Vermelho', rgb: [1, 0.15, 0.15] },
  { value: 'amarelo', label: 'Amarelo', rgb: [1, 0.9, 0.3] },
  { value: 'azul', label: 'Azul', rgb: [0.4, 0.7, 1] },
  { value: 'verde', label: 'Verde', rgb: [0.4, 1, 0.5] },
];

const corDe = (value: string): [number, number, number] =>
  (CORES.find((c) => c.value === value) ?? CORES[0]).rgb;

// ---------------------------------------------------------------------------
// O que está escolhido
// ---------------------------------------------------------------------------

/**
 * Os slots em que o flash cai: os escolhidos, ou os desenhos dos ossos
 * escolhidos.
 *
 * A segunda metade não é conveniência: quem anima passa o dia com um OSSO
 * escolhido, e um "Flash…" cinza com o braço selecionado seria um botão que
 * não diz o que falta. Com o osso na mão, o flash cai nos desenhos daquele
 * osso, que é o que a pessoa está olhando.
 */
function slotsDoFlash(doc: EditorDoc): string[] {
  const escolhidos = doc.selection.slots;
  if (escolhidos.length > 0) return [...escolhidos];
  const ossos = new Set(doc.selection.bones);
  return (doc.file.slots ?? [])
    .filter((slot) => ossos.has(slot.bone))
    .map((slot) => slot.name);
}

/** `true` quando há animação aberta — sem ela não há chave a gravar. */
const animando = (doc: EditorDoc): boolean => doc.animation !== null;

// ---------------------------------------------------------------------------
// Gravar
// ---------------------------------------------------------------------------

/**
 * Grava o plano num passo de desfazer, e diz no rodapé o que fez.
 *
 * Quando o plano vem sem chaves, o rodapé leva o motivo ESCRITO: um gesto que
 * não faz nada e não avisa é o que a regra 21 proíbe.
 */
function gravar(doc: EditorDoc, plano: PlanoDeEfeito): void {
  if (plano.chaves.length === 0) {
    doc.notice(plano.aviso ?? `${plano.label} sem nada para gravar`);
    return;
  }
  const animation = doc.animation;
  if (animation === null) {
    // O essencial antes dos dois-pontos: o rodapé apertado mostra só essa parte (prova de pessoa, 05/11/2026).
    doc.notice(`${plano.label} pede uma animação aberta: um efeito é chave, e chave mora numa animação`);
    return;
  }
  doc.run(new EditKeys(animation, plano.label, (file, name) => {
    aplicarPlano(file, name, plano);
  }));
  doc.notice(`${plano.label} gravado: ${plano.resumo}`);
}

// ---------------------------------------------------------------------------
// As três janelas
// ---------------------------------------------------------------------------

async function abrirFlash(doc: EditorDoc): Promise<void> {
  const slots = slotsDoFlash(doc);
  const tempo = doc.time;
  const plano = (v: Record<string, string>): PlanoDeEfeito => planoDoFlash(doc.file, doc.animation ?? '', slots, {
    tempo,
    subida: numero(v['subida'], 0.05),
    descida: numero(v['descida'], 0.15),
    cor: corDe(v['cor'] ?? 'branco'),
    forca: numero(v['forca'], 1),
  });
  const resposta = await askForm({
    title: 'Flash',
    lead: 'Um pico de luz no desenho, e volta. Grava chaves de Cor escura — depois elas são suas: '
      + 'dá para mexer, apagar e copiar como qualquer outra.',
    fields: [
      { id: 'subida', label: 'Acende em (s)', value: lembrado.flash.subida, hint: 'Curto: o flash é um susto' },
      { id: 'descida', label: 'Apaga em (s)', value: lembrado.flash.descida },
      { id: 'cor', label: 'Cor do pico', value: lembrado.flash.cor, choices: CORES.map(({ value, label }) => ({ value, label })) },
      { id: 'forca', label: 'Força (0 a 1)', value: lembrado.flash.forca },
    ],
    yesLabel: 'Gravar o flash',
    preview: (v) => plano(v).resumo,
  });
  if (resposta === null) return;
  lembrado.flash = {
    subida: resposta['subida'], descida: resposta['descida'],
    cor: resposta['cor'], forca: resposta['forca'],
  };
  gravar(doc, plano(resposta));
}

async function abrirPulso(doc: EditorDoc): Promise<void> {
  const bones = [...doc.selection.bones];
  const tempo = doc.time;
  const plano = (v: Record<string, string>): PlanoDeEfeito => planoDoPulso(doc.file, doc.animation ?? '', bones, {
    tempo,
    subida: numero(v['subida'], 0.1),
    descida: numero(v['descida'], 0.2),
    fator: numero(v['fator'], 1.2),
    eixos: (v['eixos'] === 'x' || v['eixos'] === 'y') ? v['eixos'] : 'ambos',
  });
  const resposta = await askForm({
    title: 'Pulso',
    lead: 'A escala cresce e volta. O pico multiplica a escala que o osso já tem — '
      + 'um osso no dobro do tamanho continua no dobro, com o pulso por cima.',
    fields: [
      { id: 'subida', label: 'Cresce em (s)', value: lembrado.pulso.subida },
      { id: 'descida', label: 'Volta em (s)', value: lembrado.pulso.descida, hint: 'Voltar mais devagar do que cresce é o que dá peso' },
      { id: 'fator', label: 'Quanto cresce', value: lembrado.pulso.fator, hint: '1,2 = vinte por cento maior' },
      {
        id: 'eixos',
        label: 'Em que eixos',
        value: lembrado.pulso.eixos,
        choices: [
          { value: 'ambos', label: 'Os dois — incha por igual' },
          { value: 'x', label: 'Só na largura' },
          { value: 'y', label: 'Só na altura' },
        ],
      },
    ],
    yesLabel: 'Gravar o pulso',
    preview: (v) => plano(v).resumo,
  });
  if (resposta === null) return;
  lembrado.pulso = {
    subida: resposta['subida'], descida: resposta['descida'],
    fator: resposta['fator'], eixos: resposta['eixos'],
  };
  gravar(doc, plano(resposta));
}

async function abrirTremor(doc: EditorDoc): Promise<void> {
  const bones = [...doc.selection.bones];
  const tempo = doc.time;
  const plano = (v: Record<string, string>): PlanoDeEfeito => planoDoTremor(doc.file, doc.animation ?? '', bones, {
    tempo,
    duracao: numero(v['duracao'], 0.3),
    chaves: Math.round(numero(v['passos'], 8)),
    amplitude: numero(v['amplitude'], 6),
    semente: Math.round(numero(v['semente'], 0)),
  });
  const resposta = await askForm({
    title: 'Tremor',
    lead: 'Uma sequência de empurrões sorteados. A MESMA semente dá sempre o mesmo tremor, '
      + 'e o osso sempre volta para onde estava.',
    fields: [
      { id: 'duracao', label: 'Dura (s)', value: lembrado.tremor.duracao },
      { id: 'passos', label: 'Quantos empurrões', value: lembrado.tremor.passos, hint: 'Mais empurrões no mesmo tempo = tremor mais rápido' },
      { id: 'amplitude', label: 'Quanto sai do lugar (px)', value: lembrado.tremor.amplitude },
      { id: 'semente', label: 'Semente', value: lembrado.tremor.semente, hint: 'Troque o número para sortear outro tremor. O mesmo número traz o mesmo de volta' },
    ],
    yesLabel: 'Gravar o tremor',
    preview: (v) => plano(v).resumo,
  });
  if (resposta === null) return;
  lembrado.tremor = {
    duracao: resposta['duracao'], passos: resposta['passos'],
    amplitude: resposta['amplitude'], semente: resposta['semente'],
  };
  gravar(doc, plano(resposta));
}

// ---------------------------------------------------------------------------
// O registro
// ---------------------------------------------------------------------------

/** Registra as três. Devolve como tirá-las. */
export function registerEffectActions(doc: EditorDoc): Array<() => void> {
  const comOsso = (): boolean => animando(doc) && doc.selection.bones.length > 0;
  return [
    registerAction('efeito-flash', {
      run: () => { void abrirFlash(doc); },
      enabled: () => animando(doc) && slotsDoFlash(doc).length > 0,
    }),
    registerAction('efeito-pulso', { run: () => { void abrirPulso(doc); }, enabled: comOsso }),
    registerAction('efeito-tremor', { run: () => { void abrirTremor(doc); }, enabled: comOsso }),
  ];
}

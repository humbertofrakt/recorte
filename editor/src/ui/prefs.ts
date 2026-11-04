/**
 * As preferências do editor (dono A).
 *
 * São escolhas de quem usa, não do arquivo: elas valem para TODO arquivo que
 * esta pessoa abrir, e por isso moram no navegador e nunca no `.bone`. Um
 * `.bone` que carregasse "mostrar o nome das ferramentas" mandaria essa escolha
 * junto com o personagem para quem o recebesse, o que é o contrário do que
 * preferência quer dizer.
 *
 * Tudo aqui aguenta não haver `localStorage`: aba anônima, navegador com o
 * armazenamento bloqueado, e o teste, que não tem navegador nenhum. Sem ele o
 * editor abre no padrão e funciona igual — só não lembra.
 */

import { isThemeName } from './theme.js';
import type { ThemeName } from './theme.js';

/** A chave única onde tudo isto mora. */
export const PREFS_KEY = 'RECORTE_prefs';

/** O que se pode escolher. Um campo por preferência, com o padrão junto. */
export interface Prefs {
  /**
   * Claro ou escuro. Padrão **escuro** — lote 18, rodada 3.
   *
   * É preferência de quem usa, e não do arquivo: ela vale para todo `.bone`
   * que esta pessoa abrir, e por isso mora no navegador. Um `.bone` que
   * carregasse o tema mandaria essa escolha junto com o personagem para quem o
   * recebesse.
   */
  theme: ThemeName;
  /**
   * Mostrar o nome ao lado do ícone, na barra da cena.
   *
   * Padrão **desligado**, que é o que faz a barra caber numa linha e a cena
   * crescer — que é o ponto do lote 4. Quem prefere a palavra liga em
   * Editar → Preferências, e a dica com o nome continua lá dos dois jeitos.
   */
  toolNames: boolean;
  /**
   * **Simular a física** — degrau 12, porta D6 (18/09/2026).
   *
   * Padrão **ligado**, que é o que o formato faz: a §6.5 simula sempre. O
   * interruptor existe para parar a simulação enquanto se posa o boneco — um
   * cabelo que balança sozinho atrapalha quem está tentando pôr a mão no
   * lugar certo.
   *
   * É preferência de quem usa, e não do arquivo: desligar não escreve `mix: 0`
   * no `.bone`. Um `.bone` que carregasse isto mandaria a escolha de quem
   * editou junto com o personagem.
   */
  physicsSim: boolean;
  /**
   * **Mostrar as variáveis e as marcas** — degrau 12, porta G9/P15.
   *
   * 🗣️ *"Variáveis e tags pela tela, provavelmente — com um jeito de
   * desligar"* — o Humberto, RESPOSTAS Q23, 17/09/2026. Padrão **ligado**:
   * ele pediu a coisa, e o desligar é para quem não a usa.
   *
   * Desligado, a lista **continua dizendo que está desligada** e quantas
   * variáveis e marcas o arquivo tem escondidas ali. Um interruptor que faz a
   * coisa sumir sem dizer que ela existe é o defeito que a Janela de
   * Problemas consertou no degrau 11.
   */
  showVars: boolean;
  /**
   * **Mostrar o passo seguinte** — rodada final, P19 (29/09/2026).
   *
   * 🗣️ *"Não tem uma sequência de como executar aquela tarefa"* — o Humberto,
   * 28/09. Padrão **ligado**: é o pedido dele. Quem já sabe o caminho desliga
   * aqui, e a linha do rodapé volta a falar só da ferramenta.
   */
  nextStep: boolean;
}

export const DEFAULT_PREFS: Readonly<Prefs> = Object.freeze({
  theme: 'escuro',
  toolNames: false,
  physicsSim: true,
  showVars: true,
  nextStep: true,
});

/**
 * Lê o que estava gravado e completa o que faltar com o padrão.
 *
 * Um campo estranho, um valor de outro tipo, um JSON quebrado: tudo vira o
 * padrão daquele campo, e nada estoura. Preferência corrompida não pode
 * impedir o editor de abrir.
 */
export function parsePrefs(saved: unknown): Prefs {
  const out: Prefs = { ...DEFAULT_PREFS };
  if (saved === null || typeof saved !== 'object') return out;
  const raw = saved as Record<string, unknown>;
  if (typeof raw['toolNames'] === 'boolean') out.toolNames = raw['toolNames'];
  if (typeof raw['physicsSim'] === 'boolean') out.physicsSim = raw['physicsSim'];
  if (typeof raw['showVars'] === 'boolean') out.showVars = raw['showVars'];
  if (typeof raw['nextStep'] === 'boolean') out.nextStep = raw['nextStep'];
  // Só os dois nomes que existem. "roxo", ou o tema de uma versão futura,
  // volta ao padrão em vez de deixar o editor sem cor nenhuma.
  if (isThemeName(raw['theme'])) out.theme = raw['theme'];
  return out;
}

let current: Prefs = { ...DEFAULT_PREFS };
let loaded = false;
const listeners = new Set<(prefs: Prefs) => void>();

/** O armazenamento do navegador, ou `null` quando não há um. */
function storage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/** As preferências em uso. Nunca mude o objeto: chame `setPrefs`. */
export function prefs(): Readonly<Prefs> {
  if (!loaded) {
    loaded = true;
    const store = storage();
    if (store !== null) {
      try {
        const text = store.getItem(PREFS_KEY);
        if (text !== null) current = parsePrefs(JSON.parse(text));
      } catch {
        current = { ...DEFAULT_PREFS };
      }
    }
  }
  return current;
}

/** Muda uma preferência ou outra, grava, e avisa quem desenha. */
export function setPrefs(patch: Partial<Prefs>): void {
  current = { ...prefs(), ...patch };
  const store = storage();
  if (store !== null) {
    try {
      store.setItem(PREFS_KEY, JSON.stringify(current));
    } catch {
      // Cota cheia ou armazenamento negado: a escolha vale nesta sessão.
    }
  }
  for (const listener of [...listeners]) listener(current);
}

/** Avisado quando qualquer preferência muda. Devolve como parar de ouvir. */
export function onPrefsChange(listener: (prefs: Prefs) => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

/** Volta tudo ao padrão. Para teste, e para o dia em que houver um botão. */
export function resetPrefs(): void {
  loaded = true;
  setPrefs({ ...DEFAULT_PREFS });
}

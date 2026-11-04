/**
 * **A frase do rodapé** — rodada final, P44 e L13 (29/09/2026).
 *
 * Tudo o que o rodapé diz passa por UM lugar: `falarPorUmLugar` põe um setter
 * no próprio elemento, e as setenta e tantas escritas de `textContent` que já
 * existiam, em cinco arquivos, passam por ele sem mudar uma linha. O setter
 * grava a frase e o `title` — o chat P deixou o rodapé com uma linha só, e a
 * frase longa é cortada com "…": o `title` é por onde ela se lê inteira.
 *
 * **O ponto duplo (L13, K11, e o do chat F).** O rodapé terminava com dois
 * pontos: *"Ligou a ferramenta Malha (M), para mexer na cena.."*. A forma: *a
 * casca punha o ponto sem olhar se a frase já tinha* — `${label}. Arquivo…`.
 * Um lugar só, `juntarFrases`, e o ponto entra só se faltar.
 *
 * A conta da frase é pura (regra 8); o DOM fica na casca.
 */

/** Pontuação que já fecha uma frase: depois dela não entra outro ponto. */
const FECHA = /[.!?…:]$/;

/**
 * A frase como o rodapé a mostra: espaços em fila viram um, e o ponto dobrado
 * vira um. As reticências de três pontos ficam: "…" é outra coisa.
 */
export function fraseDoRodape(texto: string): string {
  return texto.replace(/\s+/g, ' ').trim().replace(/(?<!\.)\.\.(?!\.)/g, '.');
}

/**
 * Duas frases em seguida, com UM ponto entre elas — só se a primeira ainda
 * não fecha. Primeira vazia: fica só a segunda.
 */
export function juntarFrases(primeira: string, segunda: string): string {
  const a = fraseDoRodape(primeira);
  if (a === '') return fraseDoRodape(segunda);
  return fraseDoRodape(`${FECHA.test(a) ? a : `${a}.`} ${segunda}`);
}

/**
 * Faz o elemento falar por um lugar só: toda escrita em `textContent` passa
 * pela `fraseDoRodape` e vira também o `title`. Chamado uma vez, na montagem.
 */
export function falarPorUmLugar(elemento: HTMLElement): void {
  const base = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent');
  if (base?.get === undefined || base.set === undefined) return;
  const ler = base.get;
  const gravar = base.set;
  Object.defineProperty(elemento, 'textContent', {
    configurable: true,
    get(): string | null {
      return ler.call(elemento) as string | null;
    },
    set(texto: string | null): void {
      const frase = fraseDoRodape(texto ?? '');
      gravar.call(elemento, frase);
      elemento.title = frase;
      caberNoLugar(elemento, frase, (v) => gravar.call(elemento, v));
    },
  });
  // Rodada 47, lote 1: a janela mudou de largura, a frase é escolhida de novo.
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(() => caberNoLugar(elemento, elemento.title, (v) => gravar.call(elemento, v)))
      .observe(elemento);
  }
}

/**
 * Põe à vista a versão da frase que cabe na largura do elemento — rodada 47,
 * lote 1. A dica (`title`) fica com a inteira. Sem largura medida (elemento
 * escondido, ou fora da tela), fica a inteira.
 */
function caberNoLugar(elemento: HTMLElement, frase: string, gravar: (texto: string) => void): void {
  if (elemento.clientWidth <= 0 || frase === '') return;
  const cabe = (v: string): boolean => {
    gravar(v);
    return elemento.scrollWidth <= elemento.clientWidth + 1;
  };
  gravar(escolherQueCabe(versoesDaFrase(frase), cabe));
}

/**
 * **As versões curtas de uma frase do rodapé** — rodada 47, lote 1.
 *
 * Em 1280×720 as três partes do rodapé saíam cortadas com "…": *"Arquivo
 * s…"*, *"Mexer grava…"*, *"…Alt no quadradi…"* (doc `68`, §3, C4). A régua
 * R9: nunca "…". A frase inteira continua na dica; à vista vai a mais longa
 * que CABE: a inteira, a primeira frase, ou o nome antes dos dois-pontos.
 */
export function versoesDaFrase(texto: string): string[] {
  const inteira = fraseDoRodape(texto);
  const out = [inteira];
  const ponto = inteira.search(/[.!?](\s|$)/);
  if (ponto !== -1 && ponto + 1 < inteira.length) out.push(inteira.slice(0, ponto + 1));
  const dois = inteira.indexOf(':');
  if (dois > 0) out.push(inteira.slice(0, dois));
  return out.filter((v, i) => v !== '' && out.indexOf(v) === i);
}

/** A primeira versão que cabe; se nenhuma cabe, a última (a menor). */
export function escolherQueCabe(versoes: readonly string[], cabe: (texto: string) => boolean): string {
  for (const v of versoes) if (cabe(v)) return v;
  return versoes[versoes.length - 1] ?? '';
}

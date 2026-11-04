/**
 * **O tamanho das imagens do painel Pivôs, pedido uma vez só** — rodada 44,
 * lote 0 (06/10/2026).
 *
 * O defeito: `sizeOf` pedia os pixels de toda imagem ainda não lida a CADA
 * redesenho, sem anotar o que já estava a caminho, e cada resposta redesenhava
 * o painel — que pedia tudo de novo. Com uma pasta de 14 imagens de 392×390, o
 * Novo projeto travava a página por minutos (achado da rodada 45; a rodada 44
 * viu a página parar 3 vezes em 3 ao abrir pasta num projeto vazio, doc 55).
 *
 * Aqui só a conta, sem DOM: o que já se sabe fica guardado; o que está a
 * caminho não é pedido de novo; o que falhou não é pedido de novo; e as
 * respostas que chegam juntas pedem **um** redesenho só.
 */

export interface KnownSize {
  name: string;
  width: number;
  height: number;
}

export class PivotSizes {
  private readonly known = new Map<string, KnownSize>();
  /** Os pedidos a caminho: nunca se pede duas vezes a mesma imagem. */
  private readonly asked = new Set<string>();
  /** As que não abriram: não se pede de novo a cada redesenho. */
  private readonly failed = new Set<string>();
  private redrawQueued = false;

  /** Quantas leituras de disco foram pedidas até agora (para o teste). */
  requests = 0;

  /**
   * @param redraw quem redesenha o painel quando um tamanho chega.
   * @param later como adiar o redesenho para juntar as respostas de uma leva.
   */
  constructor(
    private readonly redraw: () => void,
    private readonly later: (run: () => void) => void = (run) => { queueMicrotask(run); },
  ) {}

  /** O tamanho já sabido, ou `undefined`. */
  get(name: string): KnownSize | undefined {
    return this.known.get(name);
  }

  /** Guarda um tamanho sabido por outro caminho (atlas, arquivo já lido). */
  set(size: KnownSize): KnownSize {
    this.known.set(size.name, size);
    return size;
  }

  /**
   * Pede a leitura, **se ainda não foi pedida**. Devolve `null`: o tamanho
   * chega depois, e o painel redesenha uma vez por leva.
   */
  request(name: string, load: () => Promise<{ width: number; height: number } | null>): null {
    if (this.known.has(name) || this.asked.has(name) || this.failed.has(name)) return null;
    this.asked.add(name);
    this.requests += 1;
    void load().then((bitmap) => {
      this.asked.delete(name);
      if (bitmap === null) {
        this.failed.add(name);
        return;
      }
      this.known.set(name, { name, width: bitmap.width, height: bitmap.height });
      this.queueRedraw();
    }, () => {
      this.asked.delete(name);
      this.failed.add(name);
    });
    return null;
  }

  /** Esquece tudo: a pasta mudou. */
  clear(): void {
    this.known.clear();
    this.asked.clear();
    this.failed.clear();
  }

  private queueRedraw(): void {
    if (this.redrawQueued) return;
    this.redrawQueued = true;
    this.later(() => {
      this.redrawQueued = false;
      this.redraw();
    });
  }
}

/**
 * **Quanto um projeto de fora pesa ABERTO** — E6, rodada 3 (05/10/2026).
 *
 * O Humberto: *"soltei um projeto grande do Spriter e o programa travou."* O
 * projeto de verdade (`exemplo/game`) tem 128 imagens e **9 MB no disco**; cada
 * imagem do jogo tem 1664×1157, e aberta na memória ocupa largura × altura × 4
 * bytes: **801 MB**, todas. O programa lia todas sem dizer nada, e numa máquina
 * com 7,7 GB e o navegador aberto isso é a trava.
 *
 * A forma: *"o peso só aparecia depois de pago"*. O tamanho no disco não diz
 * nada (um PNG quase vazio é pequeno no disco e enorme aberto); o que diz é o
 * cabeçalho do PNG, os primeiros 24 bytes, que se leem sem abrir a imagem.
 *
 * Aqui mora só a conta e as frases. Quem pergunta é a casca.
 */

/** Largura e altura de um PNG, pelo cabeçalho `IHDR`; `null` quando não é PNG. */
export function pngSize(head: Uint8Array): { width: number; height: number } | null {
  if (head.length < 24) return null;
  const assinatura = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (assinatura.some((byte, i) => head[i] !== byte)) return null;
  // Bytes 12..15: o nome do primeiro bloco, que é sempre "IHDR".
  if (String.fromCharCode(head[12]!, head[13]!, head[14]!, head[15]!) !== 'IHDR') return null;
  const view = new DataView(head.buffer, head.byteOffset, head.byteLength);
  const width = view.getUint32(16);
  const height = view.getUint32(20);
  return width > 0 && height > 0 ? { width, height } : null;
}

/** O peso das imagens de um projeto. */
export interface ImageWeight {
  /** Quantas imagens vieram. */
  images: number;
  /** Bytes no disco, de todas. */
  diskBytes: number;
  /** Bytes que elas ocupam ABERTAS (largura × altura × 4), das que se mediram. */
  openBytes: number;
  /** A maior, em pixels; `null` sem nenhuma medida. */
  biggest: { width: number; height: number } | null;
  /** As que não se deixaram medir (não são PNG): ficam fora da conta, e a frase diz quantas. */
  unmeasured: string[];
}

/** Uma imagem, para a conta: o nome, o tamanho no disco, e os primeiros bytes. */
export interface WeighedImage {
  name: string;
  size: number;
  head: Uint8Array;
}

/** A conta, pura. */
export function weighImages(images: readonly WeighedImage[]): ImageWeight {
  let openBytes = 0;
  let diskBytes = 0;
  let biggest: { width: number; height: number } | null = null;
  const unmeasured: string[] = [];
  for (const image of images) {
    diskBytes += image.size;
    const size = pngSize(image.head);
    if (size === null) {
      unmeasured.push(image.name);
      continue;
    }
    openBytes += size.width * size.height * 4;
    if (biggest === null || size.width * size.height > biggest.width * biggest.height) biggest = size;
  }
  return { images: images.length, diskBytes, openBytes, biggest, unmeasured };
}

/** Lê os 24 bytes de cada imagem e faz a conta. Não abre imagem nenhuma. */
export async function weighImageFiles(files: readonly File[]): Promise<ImageWeight> {
  const lidas: WeighedImage[] = [];
  for (const file of files) {
    const head = new Uint8Array(await file.slice(0, 24).arrayBuffer());
    lidas.push({ name: file.name, size: file.size, head });
  }
  return weighImages(lidas);
}

/**
 * A partir de quanto se pergunta: **100 MB abertos** (MB de 1024 × 1024, a
 * mesma conta da frase).
 *
 * Medido em 28/09 (ficha E, E6), no Chrome sem placa de vídeo: 10 imagens do
 * jogo (73 MB abertas) entraram em ~10 s; com 20 (147 MB) a página parou de
 * responder por mais de 2 minutos. A linha fica entre as duas. Uma pergunta a
 * mais custa um clique; uma trava custa a sessão.
 */
export const HEAVY_OPEN_BYTES = 100 * 1024 * 1024;

export function isHeavy(weight: ImageWeight): boolean {
  return weight.openBytes >= HEAVY_OPEN_BYTES;
}

/** Bytes em MB, sem casa decimal, como a pessoa lê: "801 MB". */
export function megabytes(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return mb < 1 ? 'menos de 1 MB' : `${Math.round(mb).toLocaleString('pt-BR')} MB`;
}

/**
 * A frase da janela. Diz o NÚMERO, e não "pode demorar" (régua 6 da ficha).
 *
 * `deviceGB` é o `navigator.deviceMemory` do navegador — a memória da máquina,
 * arredondada, e não a livre: **o navegador não diz quanto está livre**, e a
 * frase diz isso em vez de inventar um número (regra 21).
 */
export function weightLead(program: string | null, weight: ImageWeight, deviceGB: number | null): string {
  const maior = weight.biggest === null ? '' : ` A maior tem ${weight.biggest.width}×${weight.biggest.height}.`;
  const semMedida = weight.unmeasured.length === 0 ? ''
    : ` ${weight.unmeasured.length === 1 ? '1 imagem não é PNG e ficou' : `${weight.unmeasured.length} imagens não são PNG e ficaram`} fora da conta.`;
  const maquina = deviceGB === null
    ? 'O navegador não diz quanta memória a sua máquina tem, nem quanto dela está livre.'
    : `A sua máquina tem perto de ${String(deviceGB).replace('.', ',')} GB de memória; o navegador não diz quanto dela está livre.`;
  const projeto = program === null ? 'Este projeto' : `Este projeto do ${program}`;
  return `${projeto} tem ${weight.images} imagens: ${megabytes(weight.diskBytes)} no disco, `
    + `e perto de ${megabytes(weight.openBytes)} abertas na memória.${maior}${semMedida} ${maquina} `
    + `Acima de ${megabytes(HEAVY_OPEN_BYTES)} o programa pode parar de responder enquanto lê.`;
}

/** Os três caminhos da janela, cada um com o que faz. */
export function weightOptions(weight: ImageWeight): Array<{ id: 'abrir' | 'sem' | 'cancelar'; label: string; hint: string }> {
  return [
    {
      id: 'abrir', label: 'Abrir com as imagens',
      hint: `Lê as ${weight.images} imagens (${megabytes(weight.openBytes)}). Salve antes o que estiver aberto.`,
    },
    {
      id: 'sem', label: 'Abrir sem as imagens',
      hint: 'Entram os ossos e as animações. As imagens ficam de fora: a barra de avisos diz quais.',
    },
    { id: 'cancelar', label: 'Não abrir', hint: 'Nada muda.' },
  ];
}

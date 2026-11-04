// SPDX-License-Identifier: Apache-2.0
// Testes do leitor de PSD e PSB (requisito R3 / I1).
//
// Nada é baixado. Os arquivos PSD são escritos aqui mesmo, byte a byte, pela
// função `montarPsd`: é a única forma de ter um caso confiável, porque assim o
// teste sabe exatamente que pixel foi gravado e pode cobrar o mesmo de volta.
//
// O que cada caso prova está no nome, em português.

import { describe, expect, it } from 'vitest'
import { mkdtempSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import zlib from 'node:zlib'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

import {
  isPsd, psdOrigin, psdOriginOutside, psdOriginWarning, psdPlacement, psdToBoneFile, readPsd,
  readPsdAsync, unpackBits,
} from '../src/importar/psd.ts'
import type { PsdDocument, PsdZlib } from '../src/importar/psd.ts'
import type { BoneFile } from '../src/importar/comum.ts'
import { hasSkeleton, writePsdIntoFile } from '../../editor/src/io/import-psd.ts'
import { fileMenu, flatEntries } from '../../editor/src/ui/menus.ts'

const aqui = dirname(fileURLToPath(import.meta.url))
const raiz = resolve(aqui, '..', '..')

const ZLIB: PsdZlib & { deflate(d: Uint8Array): Uint8Array } = {
  inflate: (dados) => new Uint8Array(zlib.inflateSync(Buffer.from(dados))),
  deflate: (dados) => new Uint8Array(zlib.deflateSync(Buffer.from(dados))),
}

// ---------------------------------------------------------------------------
// Esquema, para provar que o .bone gerado é válido
// ---------------------------------------------------------------------------

const schema = JSON.parse(
  readFileSync(join(raiz, 'formato', 'bone.schema.json'), 'utf8'),
) as Record<string, unknown>

const ajv = new Ajv({ allErrors: true, strict: false, allowUnionTypes: true })
addFormats(ajv)
const validarBone = ajv.compile(schema)

function esperarBoneValido(file: BoneFile): void {
  const ok = validarBone(file)
  const erros = (validarBone.errors ?? []).map((e) => JSON.stringify(e)).join('\n')
  expect(erros).toBe(ok ? '' : erros)
  expect(ok).toBe(true)
}

// ---------------------------------------------------------------------------
// Um escritor de bytes, para montar o PSD
// ---------------------------------------------------------------------------

class Escritor {
  readonly bytes: number[] = []

  u8(v: number): void {
    this.bytes.push(v & 255)
  }

  u16(v: number): void {
    this.bytes.push((v >>> 8) & 255, v & 255)
  }

  u32(v: number): void {
    this.bytes.push((v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255)
  }

  /** Um comprimento de 64 bits, como o PSB escreve. */
  u64(v: number): void {
    this.u32(Math.floor(v / 0x100000000))
    this.u32(v >>> 0)
  }

  ascii(texto: string): void {
    for (let i = 0; i < texto.length; i++) this.bytes.push(texto.charCodeAt(i) & 255)
  }

  utf16be(texto: string): void {
    for (let i = 0; i < texto.length; i++) this.u16(texto.charCodeAt(i))
  }

  crus(dados: readonly number[] | Uint8Array): void {
    for (const b of dados) this.bytes.push(b & 255)
  }

  /** Pascal string com enchimento até um múltiplo de `pad`. */
  pascal(texto: string, pad: number): void {
    const cru: number[] = []
    for (let i = 0; i < texto.length && cru.length < 255; i++) cru.push(texto.charCodeAt(i) & 255)
    this.u8(cru.length)
    this.crus(cru)
    const total = 1 + cru.length
    const sobra = (pad - (total % pad)) % pad
    for (let i = 0; i < sobra; i++) this.u8(0)
  }
}

// ---------------------------------------------------------------------------
// PackBits, o RLE do PSD, no sentido de escrever
// ---------------------------------------------------------------------------

/** Comprime uma linha em PackBits: repetições viram contagem, o resto é literal. */
function empacotarLinha(linha: readonly number[]): number[] {
  const saida: number[] = []
  let i = 0
  while (i < linha.length) {
    let repete = 1
    while (i + repete < linha.length && linha[i + repete] === linha[i] && repete < 128) repete++
    if (repete >= 3) {
      saida.push((257 - repete) & 255, linha[i])
      i += repete
      continue
    }
    const literal: number[] = []
    while (i < linha.length && literal.length < 128) {
      if (i + 2 < linha.length && linha[i] === linha[i + 1] && linha[i] === linha[i + 2]) break
      literal.push(linha[i])
      i++
    }
    saida.push(literal.length - 1, ...literal)
  }
  return saida
}

// ---------------------------------------------------------------------------
// Montar um PSD
// ---------------------------------------------------------------------------

type Compressao = 0 | 1 | 2 | 3

interface CamadaFonte {
  nome: string
  /** Nome Unicode do bloco `luni`. Quando falta, só o nome Pascal é gravado. */
  unicode?: string
  x: number
  y: number
  largura: number
  altura: number
  /** RGBA, `largura * altura * 4` números de 0 a 255. */
  pixels: number[]
  /** 0 a 255. Padrão 255. */
  opacidade?: number
  /** Padrão `true`. */
  visivel?: boolean
  /** Chave de mistura de quatro letras. Padrão `norm`. */
  mistura?: string
  /** `lsct`: 1 abre um grupo, 3 fecha o de baixo. Padrão 0 (camada normal). */
  secao?: number
}

interface OpcoesPsd {
  largura: number
  altura: number
  /** `true` grava um PSB (versão 2). */
  psb?: boolean
  compressao?: Compressao
  /** Camadas de baixo para cima, que é a ordem do arquivo. */
  camadas: CamadaFonte[]
  /**
   * As guias do documento, em px da tela — degrau 8, tarefa 8.4. `vertical`
   * são as de pé (dão um x, da esquerda); `horizontal` as deitadas (dão um y,
   * de cima). Ausente: o arquivo sai sem bloco de guias, como antes.
   */
  guias?: { vertical?: number[]; horizontal?: number[] }
}

/**
 * O bloco de recursos de imagem com as guias (recurso 1032), como o Photoshop
 * o grava: assinatura, id, nome Pascal vazio, tamanho, e então versão, passo
 * da grade, quantas guias, e por guia a posição em **trinta e dois avos de
 * pixel** e a direção num byte (0 de pé, 1 deitada).
 */
function recursoDasGuias(guias: { vertical?: number[]; horizontal?: number[] }): number[] {
  const lista = [
    ...(guias.vertical ?? []).map((at) => ({ at, direcao: 0 })),
    ...(guias.horizontal ?? []).map((at) => ({ at, direcao: 1 })),
  ]
  const dados = new Escritor()
  dados.u32(1) // versão
  dados.u32(576) // passo da grade em x
  dados.u32(576) // passo da grade em y
  dados.u32(lista.length)
  for (const guia of lista) {
    dados.u32(Math.round(guia.at * 32))
    dados.u8(guia.direcao)
  }
  const bloco = new Escritor()
  bloco.ascii('8BIM')
  bloco.u16(1032)
  bloco.u16(0) // nome Pascal vazio, já com o enchimento
  bloco.u32(dados.bytes.length)
  bloco.crus(dados.bytes)
  if (dados.bytes.length % 2 === 1) bloco.u8(0)
  return bloco.bytes
}

/** Os quatro canais de uma camada, na ordem que o Photoshop grava: A, R, G, B. */
function canaisDe(camada: CamadaFonte): Array<{ id: number; amostras: number[] }> {
  const total = camada.largura * camada.altura
  const alfa: number[] = []
  const r: number[] = []
  const g: number[] = []
  const b: number[] = []
  for (let i = 0; i < total; i++) {
    r.push(camada.pixels[i * 4] ?? 0)
    g.push(camada.pixels[i * 4 + 1] ?? 0)
    b.push(camada.pixels[i * 4 + 2] ?? 0)
    alfa.push(camada.pixels[i * 4 + 3] ?? 255)
  }
  return [{ id: -1, amostras: alfa }, { id: 0, amostras: r }, { id: 1, amostras: g }, { id: 2, amostras: b }]
}

/** Um canal já comprimido: os dois bytes da compressão e o corpo. */
function corpoDoCanal(
  amostras: number[], largura: number, altura: number, compressao: Compressao, psb: boolean,
): number[] {
  const e = new Escritor()
  e.u16(compressao)
  if (compressao === 0) {
    e.crus(amostras)
    return e.bytes
  }
  if (compressao === 1) {
    const linhas: number[][] = []
    for (let y = 0; y < altura; y++) {
      linhas.push(empacotarLinha(amostras.slice(y * largura, (y + 1) * largura)))
    }
    for (const linha of linhas) {
      if (psb) e.u32(linha.length)
      else e.u16(linha.length)
    }
    for (const linha of linhas) e.crus(linha)
    return e.bytes
  }
  // 2 e 3: ZIP. O 3 guarda a diferença entre um pixel e o anterior da linha.
  const cru = new Uint8Array(amostras)
  if (compressao === 3) {
    for (let y = altura - 1; y >= 0; y--) {
      for (let x = largura - 1; x >= 1; x--) {
        const aqui = y * largura + x
        cru[aqui] = (amostras[aqui] - amostras[aqui - 1]) & 255
      }
    }
  }
  e.crus(ZLIB.deflate(cru))
  return e.bytes
}

/** O registro de uma camada, sem os pixels. */
function registroDaCamada(
  camada: CamadaFonte, tamanhos: number[], psb: boolean,
): number[] {
  const e = new Escritor()
  e.u32(camada.y)
  e.u32(camada.x)
  e.u32(camada.y + camada.altura)
  e.u32(camada.x + camada.largura)
  const canais = camada.secao !== undefined && camada.secao !== 0 ? [-1] : [-1, 0, 1, 2]
  e.u16(canais.length)
  for (let i = 0; i < canais.length; i++) {
    e.u16(canais[i] & 0xffff)
    if (psb) e.u64(tamanhos[i])
    else e.u32(tamanhos[i])
  }
  e.ascii('8BIM')
  e.ascii((camada.mistura ?? 'norm').padEnd(4, ' ').slice(0, 4))
  e.u8(camada.opacidade ?? 255)
  e.u8(0) // clipping
  e.u8(camada.visivel === false ? 2 : 0) // o bit 1 significa ESCONDIDA
  e.u8(0) // filler

  const extra = new Escritor()
  extra.u32(0) // sem máscara
  extra.u32(0) // sem faixas de mistura
  extra.pascal(camada.nome, 4)
  if (camada.unicode !== undefined) {
    extra.ascii('8BIM')
    extra.ascii('luni')
    extra.u32(4 + camada.unicode.length * 2)
    extra.u32(camada.unicode.length)
    extra.utf16be(camada.unicode)
  }
  if (camada.secao !== undefined && camada.secao !== 0) {
    extra.ascii('8BIM')
    extra.ascii('lsct')
    extra.u32(4)
    extra.u32(camada.secao)
  }
  e.u32(extra.bytes.length)
  e.crus(extra.bytes)
  return e.bytes
}

/** Monta um PSD (ou PSB) inteiro e devolve os bytes. */
function montarPsd(opcoes: OpcoesPsd): Uint8Array {
  const psb = opcoes.psb === true
  const compressao = opcoes.compressao ?? 0

  // Os pixels de cada camada, já comprimidos.
  const corpos: number[][][] = []
  for (const camada of opcoes.camadas) {
    if (camada.secao !== undefined && camada.secao !== 0) {
      // Uma linha de grupo não tem desenho: um canal vazio já basta.
      corpos.push([[0, 0]])
      continue
    }
    corpos.push(canaisDe(camada).map(
      (c) => corpoDoCanal(c.amostras, camada.largura, camada.altura, compressao, psb),
    ))
  }

  const info = new Escritor()
  info.u16(opcoes.camadas.length)
  for (let i = 0; i < opcoes.camadas.length; i++) {
    info.crus(registroDaCamada(opcoes.camadas[i], corpos[i].map((c) => c.length), psb))
  }
  for (const camada of corpos) for (const canal of camada) info.crus(canal)
  if (info.bytes.length % 2 === 1) info.u8(0)

  const camadasEMascara = new Escritor()
  if (psb) camadasEMascara.u64(info.bytes.length)
  else camadasEMascara.u32(info.bytes.length)
  camadasEMascara.crus(info.bytes)
  camadasEMascara.u32(0) // máscara global

  const e = new Escritor()
  e.ascii('8BPS')
  e.u16(psb ? 2 : 1)
  for (let i = 0; i < 6; i++) e.u8(0)
  e.u16(4) // canais da imagem achatada
  e.u32(opcoes.altura)
  e.u32(opcoes.largura)
  e.u16(8) // bits por canal
  e.u16(3) // modo de cor RGB
  e.u32(0) // dados do modo de cor
  const recursos = opcoes.guias === undefined ? [] : recursoDasGuias(opcoes.guias)
  e.u32(recursos.length) // recursos de imagem
  e.crus(recursos)
  if (psb) e.u64(camadasEMascara.bytes.length)
  else e.u32(camadasEMascara.bytes.length)
  e.crus(camadasEMascara.bytes)
  // Imagem achatada, crua, que este leitor não usa mas o arquivo precisa ter.
  e.u16(0)
  for (let i = 0; i < opcoes.largura * opcoes.altura * 4; i++) e.u8(0)

  return new Uint8Array(e.bytes)
}

// ---------------------------------------------------------------------------
// Camadas de exemplo
// ---------------------------------------------------------------------------

/** Um retângulo cheio de uma cor só, com um pixel diferente no canto. */
function retangulo(largura: number, altura: number, cor: [number, number, number, number]): number[] {
  const pixels: number[] = []
  for (let i = 0; i < largura * altura; i++) pixels.push(...cor)
  // Um canto diferente prova que a ordem das linhas não se inverteu.
  pixels[0] = 1
  pixels[1] = 2
  pixels[2] = 3
  return pixels
}

/** Os pixels lidos de uma camada, como uma lista simples, para comparar. */
function pixelsDe(doc: PsdDocument, nome: string): number[] {
  const camada = doc.layers.find((c) => c.name === nome)
  expect(camada, `não achei a camada "${nome}" em [${doc.layers.map((c) => c.name).join(', ')}]`)
    .toBeDefined()
  return Array.from((camada as { pixels: Uint8Array }).pixels)
}

const CABECA = retangulo(4, 3, [200, 100, 50, 255])
const CORPO = retangulo(5, 2, [10, 220, 30, 255])

// ---------------------------------------------------------------------------
// Os casos
// ---------------------------------------------------------------------------

describe('leitor de PSD', () => {
  it('reconhece a assinatura 8BPS e recusa outra coisa', () => {
    const bytes = montarPsd({ largura: 20, altura: 20, camadas: [] })
    expect(isPsd(bytes)).toBe(true)
    expect(isPsd(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]))).toBe(false)
    expect(() => readPsd(new Uint8Array([1, 2, 3, 4, 5, 6]))).toThrow(/não é um PSD/)
  })

  it('lê duas camadas RGB com compressão crua, com os pixels e as posições certas', () => {
    const bytes = montarPsd({
      largura: 32,
      altura: 24,
      compressao: 0,
      camadas: [
        { nome: 'corpo', x: 3, y: 9, largura: 5, altura: 2, pixels: CORPO },
        { nome: 'cabeca', x: 10, y: 4, largura: 4, altura: 3, pixels: CABECA },
      ],
    })
    const doc = readPsd(bytes)

    expect(doc.width).toBe(32)
    expect(doc.height).toBe(24)
    expect(doc.psb).toBe(false)
    expect(doc.depth).toBe(8)
    // A ordem de desenho é a ordem do arquivo: de baixo para cima.
    expect(doc.layers.map((c) => c.name)).toEqual(['corpo', 'cabeca'])

    const corpo = doc.layers[0]
    expect([corpo.x, corpo.y, corpo.width, corpo.height]).toEqual([3, 9, 5, 2])
    expect(corpo.visible).toBe(true)
    expect(corpo.opacity).toBe(1)
    expect(pixelsDe(doc, 'corpo')).toEqual(CORPO)

    const cabeca = doc.layers[1]
    expect([cabeca.x, cabeca.y, cabeca.width, cabeca.height]).toEqual([10, 4, 4, 3])
    expect(pixelsDe(doc, 'cabeca')).toEqual(CABECA)

    expect(doc.warnings).toEqual([])
  })

  it('lê duas camadas com RLE (PackBits) e devolve os mesmos pixels', () => {
    const camadas: CamadaFonte[] = [
      { nome: 'corpo', x: 3, y: 9, largura: 5, altura: 2, pixels: CORPO },
      { nome: 'cabeca', x: 10, y: 4, largura: 4, altura: 3, pixels: CABECA },
    ]
    const cru = readPsd(montarPsd({ largura: 32, altura: 24, compressao: 0, camadas }))
    const rle = readPsd(montarPsd({ largura: 32, altura: 24, compressao: 1, camadas }))

    expect(rle.layers.map((c) => c.name)).toEqual(['corpo', 'cabeca'])
    expect(pixelsDe(rle, 'corpo')).toEqual(CORPO)
    expect(pixelsDe(rle, 'cabeca')).toEqual(CABECA)
    // Byte a byte igual ao caso cru: a compressão não pode mudar nada.
    for (let i = 0; i < cru.layers.length; i++) {
      expect(Array.from(rle.layers[i].pixels)).toEqual(Array.from(cru.layers[i].pixels))
    }
  })

  it('desempacota o PackBits com repetições, literais e o byte de pular', () => {
    // 5 iguais, 3 literais, o byte -128 (que não faz nada), mais 2 iguais.
    const corpo = new Uint8Array([
      0, 12, // uma linha de 12 bytes de dados
      252, 7, // -4 -> repete 7 cinco vezes
      2, 1, 2, 3, // três literais
      128, // -128: ignorado
      255, 9, // -1 -> repete 9 duas vezes
    ])
    const linha = unpackBits(corpo, 1, 10, false)
    expect(Array.from(linha)).toEqual([7, 7, 7, 7, 7, 1, 2, 3, 9, 9])
  })

  it('lê o nome Unicode do bloco luni, com acento', () => {
    const bytes = montarPsd({
      largura: 20,
      altura: 20,
      camadas: [
        { nome: 'cabeca', unicode: 'cabeça', x: 1, y: 1, largura: 2, altura: 2, pixels: retangulo(2, 2, [9, 9, 9, 255]) },
        { nome: 'mao dir', unicode: 'mão direita', x: 5, y: 5, largura: 2, altura: 2, pixels: retangulo(2, 2, [8, 8, 8, 255]) },
      ],
    })
    const doc = readPsd(bytes)
    expect(doc.layers.map((c) => c.name)).toEqual(['cabeça', 'mão direita'])
    expect(doc.layers[1].leaf).toBe('mão direita')
  })

  it('transforma um grupo de camadas em pasta no nome', () => {
    // No arquivo, de baixo para cima: marca de fim do grupo, filhos, abertura.
    const bytes = montarPsd({
      largura: 40,
      altura: 40,
      camadas: [
        { nome: 'chao', x: 0, y: 30, largura: 4, altura: 2, pixels: retangulo(4, 2, [1, 1, 1, 255]) },
        { nome: '</Layer group>', x: 0, y: 0, largura: 0, altura: 0, pixels: [], secao: 3 },
        { nome: 'braco', x: 6, y: 6, largura: 3, altura: 3, pixels: retangulo(3, 3, [2, 2, 2, 255]) },
        { nome: 'mao', x: 9, y: 9, largura: 2, altura: 2, pixels: retangulo(2, 2, [3, 3, 3, 255]) },
        { nome: 'corpo', x: 0, y: 0, largura: 0, altura: 0, pixels: [], secao: 1 },
      ],
    })
    const doc = readPsd(bytes)
    expect(doc.layers.map((c) => c.name)).toEqual(['chao', 'corpo/braco', 'corpo/mao'])
    expect(doc.layers[1].folder).toBe('corpo')
    expect(doc.layers[1].leaf).toBe('braco')
    expect(doc.layers[0].folder).toBe('')
    // A linha do grupo não vira camada, e as marcas também não.
    expect(doc.layers).toHaveLength(3)
  })

  it('traz a camada invisível, com aviso, e o slot desligado', () => {
    const bytes = montarPsd({
      largura: 20,
      altura: 20,
      camadas: [
        { nome: 'visivel', x: 0, y: 0, largura: 2, altura: 2, pixels: retangulo(2, 2, [5, 5, 5, 255]) },
        { nome: 'rascunho', visivel: false, x: 4, y: 4, largura: 2, altura: 2, pixels: retangulo(2, 2, [6, 6, 6, 255]) },
      ],
    })
    const doc = readPsd(bytes)
    expect(doc.layers.map((c) => c.name)).toEqual(['visivel', 'rascunho'])
    expect(doc.layers[0].visible).toBe(true)
    expect(doc.layers[1].visible).toBe(false)
    expect(doc.warnings.join(' ')).toContain('rascunho')
    expect(doc.warnings.join(' ')).toContain('desligada')

    const { file } = psdToBoneFile(doc)
    const slots = file.slots ?? []
    expect(slots[0].visible).toBeUndefined()
    expect(slots[1].visible).toBe(false)
  })

  it('dobra a opacidade parcial da camada dentro do alfa', () => {
    const bytes = montarPsd({
      largura: 20,
      altura: 20,
      camadas: [
        { nome: 'meia', opacidade: 128, x: 0, y: 0, largura: 2, altura: 1, pixels: [10, 20, 30, 255, 40, 50, 60, 200] },
      ],
    })
    const doc = readPsd(bytes)
    expect(doc.layers[0].opacity).toBeCloseTo(128 / 255, 5)
    expect(Array.from(doc.layers[0].pixels)).toEqual([
      10, 20, 30, Math.round(255 * (128 / 255)),
      40, 50, 60, Math.round(200 * (128 / 255)),
    ])
  })

  it('lê um PSB (versão 2), com os comprimentos de 64 bits', () => {
    const camadas: CamadaFonte[] = [
      { nome: 'corpo', x: 3, y: 9, largura: 5, altura: 2, pixels: CORPO },
      { nome: 'cabeca', x: 10, y: 4, largura: 4, altura: 3, pixels: CABECA },
    ]
    for (const compressao of [0, 1] as Compressao[]) {
      const doc = readPsd(montarPsd({ largura: 32, altura: 24, psb: true, compressao, camadas }))
      expect(doc.psb).toBe(true)
      expect(doc.layers.map((c) => c.name)).toEqual(['corpo', 'cabeca'])
      expect(pixelsDe(doc, 'cabeca')).toEqual(CABECA)
    }
  })

  it('abre a compressão ZIP com o zlib injetado, e avisa quando não tem zlib', () => {
    const bytes = montarPsd({
      largura: 32,
      altura: 24,
      compressao: 2,
      camadas: [{ nome: 'cabeca', x: 10, y: 4, largura: 4, altura: 3, pixels: CABECA }],
    })
    const com = readPsd(bytes, ZLIB)
    expect(pixelsDe(com, 'cabeca')).toEqual(CABECA)

    const sem = readPsd(bytes)
    expect(sem.layers).toHaveLength(0)
    expect(sem.warnings.join(' ')).toContain('ZIP')
  })

  it('abre a compressão ZIP com previsão de linha (compressão 3)', () => {
    const bytes = montarPsd({
      largura: 32,
      altura: 24,
      compressao: 3,
      camadas: [{ nome: 'cabeca', x: 10, y: 4, largura: 4, altura: 3, pixels: CABECA }],
    })
    expect(pixelsDe(readPsd(bytes, ZLIB), 'cabeca')).toEqual(CABECA)
  })

  it('readPsdAsync lê o mesmo, com um descompactador que devolve promessa', async () => {
    const camadas: CamadaFonte[] = [
      { nome: 'corpo', x: 3, y: 9, largura: 5, altura: 2, pixels: CORPO },
      { nome: 'cabeca', x: 10, y: 4, largura: 4, altura: 3, pixels: CABECA },
    ]
    const lento = { inflate: async (d: Uint8Array) => ZLIB.inflate(d) }

    // Sem nenhum bloco ZIP: uma passada só, e o resultado é o mesmo.
    const semZip = await readPsdAsync(montarPsd({ largura: 32, altura: 24, compressao: 1, camadas }), lento)
    expect(pixelsDe(semZip, 'cabeca')).toEqual(CABECA)
    expect(semZip.warnings).toEqual([])

    // Com blocos ZIP: duas passadas, e nada de aviso sobrando da primeira.
    const comZip = await readPsdAsync(montarPsd({ largura: 32, altura: 24, compressao: 2, camadas }), lento)
    expect(comZip.layers.map((c) => c.name)).toEqual(['corpo', 'cabeca'])
    expect(pixelsDe(comZip, 'corpo')).toEqual(CORPO)
    expect(pixelsDe(comZip, 'cabeca')).toEqual(CABECA)
    expect(comZip.warnings).toEqual([])
  })

  it('numera a segunda camada de nome repetido, e avisa', () => {
    const bytes = montarPsd({
      largura: 20,
      altura: 20,
      camadas: [
        { nome: 'mao', x: 0, y: 0, largura: 2, altura: 2, pixels: retangulo(2, 2, [1, 1, 1, 255]) },
        { nome: 'mao', x: 5, y: 5, largura: 2, altura: 2, pixels: retangulo(2, 2, [2, 2, 2, 255]) },
      ],
    })
    const doc = readPsd(bytes)
    expect(doc.layers.map((c) => c.name)).toEqual(['mao', 'mao2'])
    expect(doc.warnings.join(' ')).toContain('mais de uma camada')
  })
})

describe('do PSD para o .bone', () => {
  const bytes = montarPsd({
    largura: 100,
    altura: 80,
    compressao: 1,
    camadas: [
      { nome: 'chao', x: 0, y: 70, largura: 10, altura: 4, pixels: retangulo(10, 4, [1, 1, 1, 255]) },
      { nome: '</Layer group>', x: 0, y: 0, largura: 0, altura: 0, pixels: [], secao: 3 },
      { nome: 'braco', unicode: 'braço', x: 40, y: 20, largura: 6, altura: 8, pixels: retangulo(6, 8, [2, 2, 2, 255]) },
      { nome: 'corpo', x: 0, y: 0, largura: 0, altura: 0, pixels: [], secao: 1 },
      { nome: 'brilho', mistura: 'scrn', x: 10, y: 10, largura: 4, altura: 4, pixels: retangulo(4, 4, [3, 3, 3, 255]) },
    ],
  })

  it('põe a camada onde ela estava no PSD, medindo do centro da tela', () => {
    const doc = readPsd(bytes)
    // Uma camada de 6 x 8 no ponto (40, 20) de uma tela de 100 x 80:
    // centro em x = 40 + 3 - 50 = -7; em y = 40 - (20 + 4) = 16.
    const lugar = psdPlacement(doc, doc.layers[1])
    expect(lugar).toEqual({ x: -7, y: 16, width: 6, height: 8 })
  })

  it('monta um .bone válido pelo esquema, com um slot por camada', () => {
    const doc = readPsd(bytes)
    const { file, slotNames, warnings } = psdToBoneFile(doc, { atlasName: 'heroi.atlas.json', name: 'heroi' })

    esperarBoneValido(file)
    expect(warnings).toEqual([])
    expect(file.bones).toEqual([{ name: 'root' }])
    expect(file.assets?.atlases).toEqual(['heroi.atlas.json'])
    expect(file.skeleton).toMatchObject({ name: 'heroi', x: -50, y: -40, width: 100, height: 80 })

    // Um slot por camada, na ordem de desenho do PSD, preso ao osso raiz.
    expect(slotNames).toEqual(['chao', 'braço', 'brilho'])
    const slots = file.slots ?? []
    expect(slots.map((s) => s.name)).toEqual(['chao', 'braço', 'brilho'])
    expect(slots.every((s) => s.bone === 'root')).toBe(true)
    expect(slots[1].folder).toBe('corpo')
    expect(slots[2].blend).toBe('screen')

    // O anexo aponta para a região com o nome inteiro da camada, com pasta.
    const anexos = (file.skins ?? [])[0].attachments ?? {}
    expect(anexos['braço']['braço']).toEqual({
      type: 'region', path: 'corpo/braço', x: -7, y: 16, width: 6, height: 8,
    })
    expect(anexos.chao.chao).toMatchObject({ type: 'region', path: 'chao', width: 10, height: 4 })
  })

  it('avisa quando a mistura da camada não existe no formato', () => {
    const comOverlay = montarPsd({
      largura: 20,
      altura: 20,
      camadas: [{ nome: 'luz', mistura: 'over', x: 0, y: 0, largura: 2, altura: 2, pixels: retangulo(2, 2, [1, 1, 1, 255]) }],
    })
    const { file, warnings } = psdToBoneFile(readPsd(comOverlay))
    expect(warnings.join(' ')).toContain('Sobrepor')
    expect((file.slots ?? [])[0].blend).toBeUndefined()
    esperarBoneValido(file)
  })
})

// ---------------------------------------------------------------------------
// A linha de comando, de ponta a ponta
// ---------------------------------------------------------------------------

describe('ferramentas/importar-psd.mjs', () => {
  it('grava .bone, .atlas.json e .png, e o .bone passa no validador', () => {
    const pasta = mkdtempSync(join(tmpdir(), 'recorte-psd-'))
    const entrada = join(pasta, 'personagem.psd')
    writeFileSync(entrada, montarPsd({
      largura: 64,
      altura: 64,
      compressao: 1,
      camadas: [
        { nome: 'corpo', x: 10, y: 20, largura: 8, altura: 6, pixels: retangulo(8, 6, [200, 30, 30, 255]) },
        { nome: '</Layer group>', x: 0, y: 0, largura: 0, altura: 0, pixels: [], secao: 3 },
        { nome: 'cabeca', unicode: 'cabeça', x: 24, y: 4, largura: 5, altura: 5, pixels: retangulo(5, 5, [30, 200, 30, 255]) },
        { nome: 'alto', x: 0, y: 0, largura: 0, altura: 0, pixels: [], secao: 1 },
        { nome: 'sombra', opacidade: 100, visivel: false, x: 2, y: 40, largura: 6, altura: 3, pixels: retangulo(6, 3, [0, 0, 0, 255]) },
      ],
    }))

    const saida = join(pasta, 'heroi')
    const r = spawnSync(
      process.execPath,
      [join(raiz, 'ferramentas', 'importar-psd.mjs'), entrada, saida],
      { encoding: 'utf8' },
    )
    const texto = `${r.stdout ?? ''}${r.stderr ?? ''}`
    expect(texto).toContain('Camadas importadas:')
    expect(r.status, texto).toBe(0)

    expect(existsSync(`${saida}.bone`)).toBe(true)
    expect(existsSync(join(pasta, 'heroi.atlas.json'))).toBe(true)
    expect(existsSync(join(pasta, 'heroi.png'))).toBe(true)

    // O resumo sai em português, com as três contas pedidas.
    expect(texto).toMatch(/3 camadas lidas, 3 slots criados, \d+ avisos?\./)

    const file = JSON.parse(readFileSync(`${saida}.bone`, 'utf8')) as BoneFile
    esperarBoneValido(file)
    expect((file.slots ?? []).map((s) => s.name)).toEqual(['corpo', 'cabeça', 'sombra'])
    expect(file.assets?.atlases).toEqual(['heroi.atlas.json'])

    const atlas = JSON.parse(readFileSync(join(pasta, 'heroi.atlas.json'), 'utf8')) as {
      regions: Array<{ name: string }>
    }
    expect(atlas.regions.map((reg) => reg.name).sort()).toEqual(['alto/cabeça', 'corpo', 'sombra'])
  })
})

// ---------------------------------------------------------------------------
// O que o editor grava no documento aberto
// ---------------------------------------------------------------------------

describe('editor: Importar PSD', () => {
  const psd = readPsd(montarPsd({
    largura: 100,
    altura: 80,
    compressao: 1,
    camadas: [
      { nome: 'chao', x: 0, y: 70, largura: 10, altura: 4, pixels: retangulo(10, 4, [1, 1, 1, 255]) },
      { nome: 'braco', unicode: 'braço', x: 40, y: 20, largura: 6, altura: 8, pixels: retangulo(6, 8, [2, 2, 2, 255]) },
    ],
  }))

  /** Um documento pronto, com um esqueleto já dentro. */
  function documentoComEsqueleto(): BoneFile {
    return {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      skeleton: { name: 'antigo' },
      bones: [{ name: 'root' }, { name: 'quadril', parent: 'root' }],
      slots: [{ name: 'chao', bone: 'quadril', attachment: 'chao' }],
      skins: [{ name: 'default', attachments: { chao: { chao: { type: 'region' } } } }],
      animations: [{ name: 'andar', timelines: [] }],
    }
  }

  it('o menu Arquivo oferece "PSD…" junto dos outros importadores', () => {
    // Desde o lote menus os tres importadores moram dentro de "Importar".
    const importar = flatEntries(fileMenu()).find((e) => e.action === 'importar')
    const rotulos = flatEntries(importar?.children ?? []).map((e) => e.label)
    expect(rotulos).toContain('PSD…')
    expect(rotulos.indexOf('PSD…')).toBe(rotulos.indexOf('De outro programa…') + 1)
  })

  it('sabe dizer se o arquivo já tem um esqueleto', () => {
    const vazio: BoneFile = {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }],
    }
    expect(hasSkeleton(vazio as never)).toBe(false)
    expect(hasSkeleton(documentoComEsqueleto() as never)).toBe(true)
  })

  it('substituir: monta o esqueleto de novo pelo PSD e avisa das animações perdidas', () => {
    const file = documentoComEsqueleto()
    const r = writePsdIntoFile(file as never, psd, {
      mode: 'substituir', atlasName: 'heroi.atlas.json', name: 'heroi',
    })

    expect(file.bones).toEqual([{ name: 'root' }])
    expect((file.slots ?? []).map((s) => s.name)).toEqual(['chao', 'braço'])
    expect(file.animations).toBeUndefined()
    expect(r.warnings.join(' ')).toContain('animações')
    expect(file.skeleton).toMatchObject({ name: 'heroi', x: -50, y: -40, width: 100, height: 80 })
    expect(file.assets?.atlases).toEqual(['heroi.atlas.json'])
    esperarBoneValido(file)
  })

  it('acrescentar: guarda o que existe e põe as camadas por cima, sem repetir nome', () => {
    const file = documentoComEsqueleto()
    const r = writePsdIntoFile(file as never, psd, {
      mode: 'acrescentar', atlasName: 'heroi.atlas.json',
    })

    // Os ossos e a animação continuam onde estavam.
    expect(file.bones.map((b) => b.name)).toEqual(['root', 'quadril'])
    expect((file.animations ?? []).map((a) => a.name)).toEqual(['andar'])
    // O slot antigo fica; o novo, de mesmo nome, entra numerado.
    expect((file.slots ?? []).map((s) => s.name)).toEqual(['chao', 'chao2', 'braço'])
    expect(r.slotNames).toEqual(['chao2', 'braço'])
    // O anexo numerado ainda aponta para a região com o nome da camada.
    const anexos = (file.skins ?? [])[0].attachments ?? {}
    expect(anexos.chao2.chao2).toMatchObject({ type: 'region', path: 'chao', width: 10, height: 4 })
    expect(anexos['braço']['braço']).toEqual({ type: 'region', x: -7, y: 16, width: 6, height: 8 })
    esperarBoneValido(file)
  })

  it('acrescentar duas vezes não repete o atlas em assets', () => {
    const file = documentoComEsqueleto()
    writePsdIntoFile(file as never, psd, { mode: 'acrescentar', atlasName: 'heroi.atlas.json' })
    writePsdIntoFile(file as never, psd, { mode: 'acrescentar', atlasName: 'heroi.atlas.json' })
    expect(file.assets?.atlases).toEqual(['heroi.atlas.json'])
    expect((file.slots ?? []).map((s) => s.name))
      .toEqual(['chao', 'chao2', 'braço', 'chao3', 'braço2'])
  })
})

// ---------------------------------------------------------------------------
// A guia do PSD manda na origem — degrau 8, tarefa 8.4 (I8)
// ---------------------------------------------------------------------------

describe('o PSD alinha pela guia', () => {
  /*
   * Proposta do Diretor, aceita pelo Humberto (RESPOSTAS Q29): *"PSD pela
   * guia; sem guia, pela tela; tamanho diferente avisa"*. Sobre o plugin do
   * Spine ele disse: *"pivô automático com o PSD, isso é OURO"*. O nosso lia
   * o meio da tela e pulava o bloco de recursos inteiro.
   *
   * A tela é 100 x 80. A guia de pé em 30, a deitada em 60: a origem cai aos
   * pés do personagem, encostada à esquerda, que é onde um artista a põe.
   */
  const camadas = [
    { nome: 'chao', x: 0, y: 70, largura: 10, altura: 4, pixels: retangulo(10, 4, [1, 1, 1, 255]) },
    { nome: 'braco', x: 40, y: 20, largura: 6, altura: 8, pixels: retangulo(6, 8, [2, 2, 2, 255]) },
  ]

  it('lê as guias do bloco de recursos, em px, em ordem', () => {
    const doc = readPsd(montarPsd({
      largura: 100, altura: 80, camadas,
      guias: { vertical: [70, 30], horizontal: [60] },
    }))
    expect(doc.guides).toEqual({ vertical: [30, 70], horizontal: [60] })
  })

  it('a origem é o cruzamento da primeira de pé com a primeira deitada', () => {
    const doc = readPsd(montarPsd({
      largura: 100, altura: 80, camadas, guias: { vertical: [30], horizontal: [60] },
    }))
    expect(psdOrigin(doc)).toEqual({ x: 30, y: 60, source: 'guia' })
    // A mesma camada de antes, agora medida da guia: x = 40 + 3 - 30 = 13;
    // y = 60 - (20 + 4) = 36.
    expect(psdPlacement(doc, doc.layers[1], psdOrigin(doc)))
      .toEqual({ x: 13, y: 36, width: 6, height: 8 })
  })

  it('sem guia nenhuma, tudo fica como sempre foi — byte a byte', () => {
    const semGuia = readPsd(montarPsd({ largura: 100, altura: 80, camadas }))
    expect(semGuia.guides).toEqual({ vertical: [], horizontal: [] })
    expect(psdOrigin(semGuia)).toEqual({ x: 50, y: 40, source: 'tela' })
    // A conta antiga (sem origem) e a nova dão o mesmo número.
    expect(psdPlacement(semGuia, semGuia.layers[1], psdOrigin(semGuia)))
      .toEqual(psdPlacement(semGuia, semGuia.layers[1]))
    expect(psdOriginWarning(semGuia, psdOrigin(semGuia))).toBe(null)
  })

  it('meia guia alinha meio, e DIZ qual metade — nunca em silêncio', () => {
    const soDePe = readPsd(montarPsd({ largura: 100, altura: 80, camadas, guias: { vertical: [30] } }))
    const origem = psdOrigin(soDePe)
    expect(origem).toEqual({ x: 30, y: 40, source: 'guia-x' })
    const aviso = psdOriginWarning(soDePe, origem)!
    expect(aviso).toContain('só tem guia DE PÉ')
    expect(aviso).toContain('guia deitada')

    const soDeitada = readPsd(montarPsd({ largura: 100, altura: 80, camadas, guias: { horizontal: [60] } }))
    const outra = psdOrigin(soDeitada)
    expect(outra).toEqual({ x: 50, y: 60, source: 'guia-y' })
    expect(psdOriginWarning(soDeitada, outra)!).toContain('só tem guia DEITADA')
  })

  it('mais de uma guia por eixo: vale a primeira, e o aviso conta isso', () => {
    const doc = readPsd(montarPsd({
      largura: 100, altura: 80, camadas, guias: { vertical: [30, 80], horizontal: [10, 60] },
    }))
    const origem = psdOrigin(doc)
    expect(origem).toEqual({ x: 30, y: 10, source: 'guia' })
    expect(psdOriginWarning(doc, origem)!).toContain('mais de uma guia')
  })

  it('a guia fora da tela avisa: o personagem nasceria longe da origem', () => {
    const doc = readPsd(montarPsd({
      largura: 100, altura: 80, camadas, guias: { vertical: [300], horizontal: [60] },
    }))
    const origem = psdOrigin(doc)
    expect(psdOriginOutside(doc, origem)!).toContain('FORA da tela')
    expect(psdOriginOutside(doc, { x: 30, y: 60, source: 'guia' })).toBe(null)
  })

  it('o .bone sai alinhado pela guia: a tela medida dela, e o aviso junto', () => {
    const doc = readPsd(montarPsd({
      largura: 100, altura: 80, camadas, guias: { vertical: [30], horizontal: [60] },
    }))
    const { file, warnings } = psdToBoneFile(doc, { name: 'heroi' })
    esperarBoneValido(file)
    // O retângulo da tela, medido da origem: a esquerda em -30, a base em
    // 60 - 80 = -20.
    expect(file.skeleton).toMatchObject({ x: -30, y: -20, width: 100, height: 80 })
    const anexos = (file.skins?.[0].attachments ?? {}) as Record<string, Record<string, { x: number; y: number }>>
    expect(anexos['braco']['braco']).toMatchObject({ x: 13, y: 36 })
    expect(warnings.some((linha) => linha.includes('guias do PSD'))).toBe(true)
  })

  it('sem guia, o .bone continua saindo com a tela no meio', () => {
    const doc = readPsd(montarPsd({ largura: 100, altura: 80, camadas }))
    const { file, warnings } = psdToBoneFile(doc, { name: 'heroi' })
    expect(file.skeleton).toMatchObject({ x: -50, y: -40, width: 100, height: 80 })
    expect(warnings).toEqual([])
  })
})

// SPDX-License-Identifier: Apache-2.0
/**
 * Types for `nucleo.js`, the core of the web validator.
 *
 * The module itself is plain JavaScript on purpose: the page is static, with
 * no build step, so what the browser loads is the file that was written. This
 * declaration is what lets `ferramentas/testes/site.test.ts` type-check it.
 */

/** One of the three encodings of the format (spec 1.2). */
export type Embalagem = 'bone' | 'boneb' | 'bonez'

/** One of the three documents the validator knows (spec 2.2, 2.9, 10.1). */
export type TipoDeDocumento = 'esqueleto' | 'atlas' | 'manifesto'

/** How bad a problem is. Only `"erro"` makes a file invalid. */
export type Gravidade = 'erro' | 'aviso'

export interface Problema {
  gravidade: Gravidade
  /** Plain Portuguese, one sentence. */
  texto: string
  /** JSON Pointer of the trouble, `""` for the whole file. */
  ponteiro: string
  /** Section of the specification that says so, e.g. `"4.2"`. */
  regra: string
  /** Where it came from: the schema or a rule the schema cannot express. */
  origem?: 'esquema' | 'regra'
  /** Ajv keyword, or `"semantica"`. */
  chave?: string
  /** Code of the rule (spec 12.3), e.g. `"REF_BONE_MISSING"`, when a rule gave one. */
  codigo?: string
  /** Line of the text file, filled in by the page. */
  linha?: number | null
  /** Entry name, for a problem inside a `.bonez`. */
  arquivo?: string | null
}

export interface Resultado {
  valido: boolean
  tipo: TipoDeDocumento
  problemas: Problema[]
}

export interface Resumo {
  tipo: TipoDeDocumento
  nome: string
  /** `[rótulo, quantidade]`, in the order the page shows them. */
  contas: Array<[string, number]>
  /** Keys of `NOME_DO_RECURSO`. */
  recursos: string[]
  versao?: string
  versaoMinima?: string
  programa?: string
  duracao?: number
  animacoes?: Array<{ nome: string; duracao: number; laco: boolean }>
  atlases?: string[]
  /** `assets.animations` (2.8): os arquivos de onde vêm as animações de fora. */
  animacoesDeFora?: string[]
  extensoes?: string[]
  imagens?: string[]
}

/** One compiled Ajv validator, as `esquema-compilado.js` exports them. */
export interface ValidadorCompilado {
  (doc: unknown): boolean
  errors?: AjvErro[] | null
}

export interface AjvErro {
  instancePath: string
  schemaPath: string
  keyword: string
  message?: string
  params?: Record<string, unknown>
}

export interface Validadores {
  esqueleto: ValidadorCompilado
  atlas: ValidadorCompilado
  manifesto: ValidadorCompilado
}

export declare const NOME_DA_EMBALAGEM: Record<Embalagem, string>
export declare const NOME_DO_TIPO: Record<TipoDeDocumento, string>
export declare const NOME_DO_RECURSO: Record<string, string>

export declare function detectarEmbalagem(bytes: Uint8Array): Embalagem
export declare function tipoPeloNome(nome: string): TipoDeDocumento
export declare function tipoPeloConteudo(doc: unknown): TipoDeDocumento
export declare function detectarTipo(
  nome: string,
  bytes?: Uint8Array,
  doc?: unknown,
): { embalagem: Embalagem; tipo: TipoDeDocumento }
export declare function ehImagem(nome: string, bytes?: Uint8Array): boolean

export declare function mapaDeLinhas(texto: string): Map<string, number>
export declare function escaparPonteiro(segmento: string): string
export declare function desescaparPonteiro(segmento: string): string

/** One extension of the registry of spec 12.7: the schema it publishes, and what that schema describes. */
export interface EntradaDeExtensao {
  /** Ajv-compiled schema of the extension's attachment (`x-attachment-types`). */
  validar?: ValidadorCompilado
  /** Ajv-compiled schema of the `extensions.<nome>` object, when the extension has one. */
  validarObjeto?: ValidadorCompilado
  tiposDeAnexo?: string[]
  tiposDeTimeline?: string[]
}

/** Name of the extension -> its schema. Built from `formato/extensions/*.schema.json`. */
export type RegistroDeExtensoes = Record<string, EntradaDeExtensao>

/** The bodies the `body` keys cite (spec 9.13): `uri -> parsed doc`, or `null` when it could not be read. */
export interface Contexto {
  corpos?: Map<string, any>
  /** The registry of spec 12.7. Without it, extension objects go unchecked (2.5: not knowing is not an error). */
  extensoes?: RegistroDeExtensoes
  /** The names `formato/extensions/REGISTRY.md` registers. Without it, no `EXT_UNREGISTERED` is raised. */
  extensoesRegistradas?: Set<string>
}

/** Every `uri` the `body` keys of a skeleton cite, raw (relative to `assets.skeletonsBase`). */
export declare function corposCitados(doc: any): string[]
export declare function checarSemantica(doc: any, contexto?: Contexto): Array<Pick<Problema, 'ponteiro' | 'regra' | 'texto' | 'gravidade' | 'codigo'>>
export declare function checarAtlas(doc: any): Array<Pick<Problema, 'ponteiro' | 'regra' | 'texto'>>
export declare function checarManifesto(doc: any): Array<Pick<Problema, 'ponteiro' | 'regra' | 'texto'>>

export declare function regraDoPonteiro(ponteiro: string, tipo: TipoDeDocumento): string
export declare function classificarProblema(erro: AjvErro, tipo: TipoDeDocumento): Problema
export declare function enxugarErros(erros: AjvErro[] | null | undefined): AjvErro[]
export declare function checarExtensoes(doc: any, registro?: RegistroDeExtensoes): Array<Pick<Problema, 'ponteiro' | 'regra' | 'texto' | 'gravidade' | 'codigo'>>
export declare function checarUsoDeExtensoes(doc: any, registro?: RegistroDeExtensoes, registrados?: Set<string>): Array<Pick<Problema, 'ponteiro' | 'regra' | 'texto' | 'gravidade' | 'codigo'>>
export declare function checarParticulas(doc: any): Array<Pick<Problema, 'ponteiro' | 'regra' | 'texto' | 'gravidade' | 'codigo'>>

export declare function validarDocumento(
  doc: any,
  tipo: TipoDeDocumento,
  validadores: Partial<Record<TipoDeDocumento, ValidadorCompilado>>,
  contexto?: Contexto,
): Resultado
export declare function avisos(doc: any, tipo: TipoDeDocumento): Problema[]

export declare function resumirEsqueleto(doc: any): Resumo
export declare function resumirAtlas(doc: any): Resumo
export declare function resumirManifesto(doc: any): Resumo
export declare function resumirConteudo(doc: any, tipo: TipoDeDocumento): Resumo
export declare function frasePlacar(resultado: Resultado): string

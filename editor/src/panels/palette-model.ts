/**
 * O painel **Imagens**, como conta (dono C) — lote 20, rodada 3.
 *
 * É a `Palette` do Spriter: todas as imagens do projeto, com miniatura, e
 * **arrastar uma delas para a cena cria o desenho ali**. No Recorte não havia
 * nada disso. Para pôr uma imagem no personagem era preciso criar um slot pela
 * Árvore, depois criar um anexo, depois escolher a região na lista — três
 * passos, e nenhum deles mostra a imagem antes de escolher.
 *
 * Este arquivo é a conta: quais imagens existem, quantos slots usam cada uma, e
 * o comando que nasce quando uma é solta na cena. Ele não desenha nada.
 */

import type {
  AtlasData, AttachmentDef, BoneFile, Skeleton, SkinDef, SlotDef,
} from '../../../runtime/src/index.js';
import { findAtlasRegion } from '../../../runtime/src/index.js';
import type { ChangeKind, Command, EditorDoc } from '../contract.js';
import { uniqueName } from '../contract.js';
import { setKey } from '../anim/keying.js';
import {
  hasPivot, placeByPivot, restoreDef, roundPivot, snapshotDef, swapImage, type DefSnapshot,
} from '../io/pivot-model.js';
import { folderTree } from '../io/project-folder.js';
import type { NumberedRun } from '../io/drop-plan.js';

/** Uma imagem do atlas, na lista do painel. */
export interface PaletteEntry {
  /** O nome da região no atlas — é o mesmo nome que um anexo usa. */
  name: string;
  /** Quantos slots do arquivo mostram esta imagem. `0` é uma imagem sem uso. */
  usedBy: number;
}

/** Tira acento e caixa, para a busca achar "mao" digitando "MÃO". */
export function fold(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/**
 * Quantos slots mostram cada imagem, por nome.
 *
 * Conta o anexo de repouso do slot **e** todo anexo de toda pele: uma imagem
 * que só a pele de inverno usa é uma imagem usada, e marcá-la como sem uso
 * levaria alguém a apagá-la do atlas.
 */
function usageOf(file: BoneFile): Map<string, number> {
  const conta = new Map<string, number>();
  const somar = (nome: string | undefined): void => {
    if (nome === undefined || nome === '') return;
    conta.set(nome, (conta.get(nome) ?? 0) + 1);
  };
  for (const slot of (file.slots ?? []) as SlotDef[]) somar(slot.attachment);
  for (const skin of (file.skins ?? []) as SkinDef[]) {
    for (const porSlot of Object.values(skin.attachments ?? {})) {
      for (const [nome, anexo] of Object.entries(porSlot ?? {})) {
        // Um anexo pode ser **null**: é assim que o formato diz "esta pele
        // esconde este slot" (§7.1). Ler `path` de null derruba o painel — e
        // derrubou, na primeira montagem do lote 20.
        if (anexo === null || typeof anexo !== 'object') {
          somar(nome);
          continue;
        }
        // O `path` manda quando existe: dois anexos de nomes diferentes podem
        // apontar para a MESMA imagem do atlas, e é a imagem que se conta.
        const path = (anexo as { path?: string }).path;
        somar(path !== undefined && path !== '' ? path : nome);
      }
    }
  }
  return conta;
}

/**
 * As imagens do projeto, na ordem do atlas, filtradas pela busca.
 *
 * A ordem é a do atlas, e não alfabética: o atlas é empacotado por tamanho e
 * por pasta, e peças de um mesmo braço acabam vizinhas. Ordenar por nome
 * separaria `mao_aberta` de `mao_fechada` por causa das letras do meio.
 */
export function paletteEntries(
  atlasNames: readonly string[], file: BoneFile, filtro = '',
): PaletteEntry[] {
  const conta = usageOf(file);
  const alvo = fold(filtro.trim());
  const vistos = new Set<string>();
  const out: PaletteEntry[] = [];
  for (const name of atlasNames) {
    if (vistos.has(name)) continue;
    vistos.add(name);
    if (alvo !== '' && !fold(name).includes(alvo)) continue;
    out.push({ name, usedBy: conta.get(name) ?? 0 });
  }
  return out;
}

/** Os nomes que algum desenho do arquivo mostra — para o Recarregar não tirar da aba. */
export function usedImages(file: BoneFile): Set<string> {
  return new Set(usageOf(file).keys());
}

/**
 * Os nomes da aba — lote 59: os do atlas e os da pasta do projeto, sem repetir.
 * Os do atlas vêm primeiro, na ordem dele; os que só estão na pasta, depois.
 */
export function paletteNames(atlasNames: readonly string[], folderNames: readonly string[]): string[] {
  return [...new Set([...atlasNames, ...folderNames])];
}

/** Uma subpasta da aba, com as linhas dela. `folder` vazio é a raiz. */
export interface PaletteSection {
  folder: string;
  entries: PaletteEntry[];
}

/**
 * As linhas agrupadas por subpasta — lote 59. A regra é a da pasta
 * (`folderTree`): subpastas em ordem natural, a raiz por último, e dentro de
 * cada uma `01 (2)` antes de `01 (10)`.
 */
export function paletteSections(entries: readonly PaletteEntry[]): PaletteSection[] {
  const byName = new Map(entries.map((entry) => [entry.name, entry]));
  return folderTree(entries.map((entry) => entry.name)).map((section) => ({
    folder: section.folder,
    entries: section.images.map((name) => byName.get(name)!),
  }));
}

/** O nome que a seção da raiz mostra. */
export const ROOT_SECTION = 'Sem subpasta';

/** Onde as subpastas dobradas ficam guardadas, no navegador. */
export const FOLDED_KEY = 'RECORTE_imagens_dobradas';

/** Lê a lista das dobradas. Texto estragado devolve lista vazia. */
export function parseFolded(raw: string | null): string[] {
  if (raw === null) return [];
  try {
    const list = JSON.parse(raw) as unknown;
    return Array.isArray(list) ? list.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

/** Dobra a subpasta que está aberta, e abre a que está dobrada. */
export function toggleFolded(list: readonly string[], folder: string): string[] {
  return list.includes(folder) ? list.filter((item) => item !== folder) : [...list, folder];
}

/** A frase de quando não há imagem nenhuma: nem atlas, nem pasta. */
export const NO_ATLAS =
  'Nenhuma imagem. Arquivo → Abrir pasta do projeto…, ou solte PNGs na janela. Também: Arquivo → Importar → PSD…';

/**
 * A pele onde um anexo novo nasce: a primeira das visíveis, ou `default`.
 *
 * É a mesma regra do `tree-model.ts`. Escrita de novo aqui, e não importada,
 * porque `tree-model.ts` a mantém privada de propósito — e uma cópia de quatro
 * linhas custa menos que abrir a porta para o resto daquele arquivo.
 */
export function skinForNew(file: BoneFile, visibleSkins: readonly string[]): string {
  const first = visibleSkins[0];
  if (first !== undefined && (file.skins ?? []).some((skin) => skin.name === first)) {
    return first;
  }
  return 'default';
}

/**
 * **A região da imagem que SAI** de um desenho, e a escala do atlas dela —
 * H1, decisão P15(a) (fecho 3, 29/09/2026). Lida ANTES da troca, pelo `path`
 * do desenho (ou pelo nome, quando ele não tem). `null` quando a imagem velha
 * não está em atlas nenhum: o `swapImage` usa o centro dela.
 *
 * Com ela, a imagem nova entra com o pivô ONDE ESTAVA o da velha, como o
 * Spriter manda. Sem ela, o pivô ia para a origem do osso, e o desenho solto
 * pulava — a mão em (150, 100) ia parar em (0, −12).
 */
export function outgoingRegion(
  atlases: readonly AtlasData[], def: Record<string, unknown>, name: string,
): { region: ReturnType<typeof findAtlasRegion>; scale: number } {
  const path = typeof def['path'] === 'string' ? def['path'] as string : name;
  const region = findAtlasRegion(atlases, path);
  return { region, scale: region?.scale ?? 1 };
}

/** Arredonda como o resto do editor, para o arquivo não encher de casas. */
function round(value: number): number {
  return Math.round(value * 1e4) / 1e4;
}

/**
 * As chaves de um desenho que **aparece** no meio da animação — lote 57.
 *
 * Em `t = 0`, uma chave só, com o nome. Depois de 0, o slot começa vazio
 * (`null` em 0) e o desenho entra em `t`: é o objeto que surge no meio da
 * animação, como no Spriter.
 */
export function appearKeys(t: number, name: string): Array<{ time: number; value: string | null }> {
  return t <= 0 ? [{ time: 0, value: name }] : [{ time: 0, value: null }, { time: t, value: name }];
}

/** O rodapé depois de soltar uma imagem que aparece nesta animação. */
export function appearNotice(name: string, t: number): string {
  const quando = `${Math.max(0, t).toFixed(2).replace('.', ',')} s`;
  return `"${name}" entra nesta animação a partir de ${quando}. `
    + 'A base e as outras animações ficam sem ela';
}

/** Onde e quando a imagem solta em Animando aparece. */
export interface AppearAt {
  readonly animation: string;
  readonly time: number;
}

/**
 * Onde a imagem solta na cena nasce — acréscimo ao lote 60.
 *
 * O Humberto: *"quando arrasto a imagem para a tela, ela fica presa a um osso
 * inicial. Não quero isso."* Então: **sempre na raiz**, nunca no osso
 * escolhido. A raiz fica na origem, sem giro: o desenho é livre, como o sprite
 * sem pai do Spriter. O osso vem depois e pega os desenhos (Criar osso).
 * `x, y` saem no espaço da raiz, que é o ponto do mundo onde a imagem caiu.
 */
export function dropPlace(
  skeleton: Skeleton | null, file: BoneFile, worldX: number, worldY: number,
): { bone: string; x: number; y: number } {
  const root = file.bones?.[0]?.name ?? 'root';
  const bone = skeleton?.findBone(root) ?? null;
  const local = bone === null ? { x: worldX, y: worldY } : bone.worldToLocal(worldX, worldY);
  return { bone: root, x: local.x, y: local.y };
}

/**
 * **Arrastar uma imagem para a cena** — o comando.
 *
 * Nasce um slot com aquele desenho, no osso escolhido (ou `root`), na posição
 * em que a imagem foi solta. Um passo de desfazer, e ele desfaz tudo: o slot,
 * o anexo, e a pele, se ela não existia.
 *
 * `x` e `y` chegam no **espaço do osso**: quem arrasta converte o ponto do
 * mundo antes de chamar, porque só a cena sabe a matriz do osso. É o mesmo
 * caminho que o Ponto e a Caixa já usavam.
 *
 * Com `appear` (lote 57: animação aberta) o slot nasce **vazio**
 * na base, a pele ganha o desenho, e só a animação aberta ganha as chaves
 * de `appearKeys`. O desfazer devolve a animação como estava.
 */
export class DropImageAsSlot implements Command {
  readonly label: string;
  readonly kind: ChangeKind = 'structure';
  /** O nome do slot criado, para quem chamou escolher o que acabou de nascer. */
  readonly name: string;
  readonly skin: string;

  private addedSlot: SlotDef | null = null;
  private madeSkin = false;
  private madeSlotMap = false;
  private savedAnimation: { index: number; json: string } | null = null;

  constructor(
    file: BoneFile,
    private readonly image: string,
    private readonly bone: string,
    visibleSkins: readonly string[],
    private readonly x: number,
    private readonly y: number,
    private readonly appear: AppearAt | null = null,
    /**
     * Degrau 8, tarefa 8.6: a pasta numerada. Com ela, o anexo nasce com
     * `sequence` (§7.10) e `path` é o **prefixo** (`olho_`), não um nome de
     * imagem — é o mesmo comando porque é o mesmo gesto, e dois caminhos para
     * a mesma coisa seria um deles envelhecer sozinho.
     */
    private readonly sequence: NumberedRun | null = null,
  ) {
    // O slot leva o nome da imagem: `sword`, e depois `sword_2`. Quem olha a
    // Árvore reconhece a peça sem abrir o painel de propriedades. Lote 60: sem
    // a subpasta — `maos/mao_1` dá o slot `mao_1`; o `path` guarda o caminho.
    this.name = uniqueName(
      sequence === null ? attachmentNameFor(image) : sequenceSlotName(sequence),
      (file.slots ?? []).map((s) => s.name),
    );
    this.skin = skinForNew(file, visibleSkins);
    this.label = sequence !== null
      ? 'Trazer a sequência para a cena'
      : appear === null ? 'Trazer imagem para a cena' : 'Trazer imagem para esta animação';
  }

  apply(doc: EditorDoc): void {
    const file = doc.file;
    const skins = file.skins ?? (file.skins = []);
    this.madeSkin = !skins.some((skin) => skin.name === this.skin);
    let skin = skins.find((s) => s.name === this.skin);
    if (skin === undefined) {
      skin = { name: this.skin, attachments: {} } as SkinDef;
      skins.push(skin);
    }
    const attachments = skin.attachments ?? (skin.attachments = {});
    this.madeSlotMap = attachments[this.name] === undefined;
    // `path` aponta para a região do atlas. Sem ele, um slot chamado `sword_2`
    // procuraria uma imagem `sword_2` que não existe.
    const run = this.sequence;
    attachments[this.name] = {
      [this.name]: run === null
        ? {
          type: 'region',
          path: this.image,
          x: round(this.x),
          y: round(this.y),
        }
        : {
          type: 'region',
          // §7.10: o nome do quadro `i` é `path + formatar(start + i, digits)`.
          path: run.path,
          x: round(this.x),
          y: round(this.y),
          sequence: {
            count: run.count,
            start: run.start,
            ...(run.digits > 0 ? { digits: run.digits } : {}),
          },
        },
    } as never;

    const slots = file.slots ?? (file.slots = []);
    const slot: SlotDef = this.appear === null
      ? { name: this.name, bone: this.bone, attachment: this.name }
      : { name: this.name, bone: this.bone };
    this.addedSlot = slot;
    // No FIM da ordem de desenho: quem traz uma imagem nova quer vê-la, e no
    // começo ela nasceria atrás do personagem inteiro.
    slots.push(slot);

    const appear = this.appear;
    const index = appear === null ? -1
      : (file.animations ?? []).findIndex((a) => a.name === appear.animation);
    if (appear !== null && index >= 0) {
      this.savedAnimation = { index, json: JSON.stringify(file.animations![index]) };
      const target = { type: 'slot', target: this.name, property: 'attachment' };
      for (const key of appearKeys(appear.time, this.name)) {
        setKey(file, appear.animation, key.time, target, key.value as never);
      }
    }
  }

  revert(doc: EditorDoc): void {
    const file = doc.file;
    if (this.savedAnimation !== null && file.animations !== undefined) {
      file.animations[this.savedAnimation.index] = JSON.parse(this.savedAnimation.json);
      this.savedAnimation = null;
    }
    const slots = file.slots ?? [];
    // Pelo NOME guardado no construtor — defeito 1 (19/09/2026), como acima.
    const at = slots.findIndex((slot) => slot.name === this.name);
    if (at >= 0) slots.splice(at, 1);

    const skins = file.skins ?? [];
    const skinAt = skins.findIndex((skin) => skin.name === this.skin);
    const skin = skins[skinAt];
    if (skin === undefined) return;
    if (this.madeSlotMap) delete skin.attachments?.[this.name];
    if (this.madeSkin) skins.splice(skinAt, 1);
    if (skins.length === 0) delete (file as { skins?: unknown }).skins;
  }
}

/**
 * **Soltar uma imagem em cima de um desenho** — troca a imagem dele.
 *
 * É o outro gesto do painel, e ele não cria nada: o slot continua o mesmo, no
 * mesmo osso, na mesma ordem de desenho. Muda a imagem e — lote 56, plano
 * pivô — ela cai no lugar pelo pivô da região nova: `x/y` por `placeByPivot`,
 * e `width/height` saem, para a nova não sair esticada no tamanho da velha.
 * Sem pivô, `x/y` ficam. O `revert` devolve o anexo por texto.
 *
 * **A pele do lápis** — P27 (rodada final, 29/09/2026, defeitos M2 e I-O2).
 * Com `into`, a troca grava NAQUELA pele, e não na de onde o desenho vem:
 * quem fez uma pele para trocar a roupa troca a roupa da pele, e a `default`
 * fica intacta — é o *Character Map* do Spriter, que veste e despe. Quando a
 * pele do lápis ainda não tem o desenho, ele é copiado da pele de origem e
 * trocado lá, **no mesmo passo**; o desfazer devolve o mapa do slot daquela
 * pele por texto, no mesmo lugar, ou o tira, se ele não existia.
 */
/**
 * `true` quando o anexo é uma **entidade** (`type: 'skeleton'`, spec 7.11) —
 * rodada 44, lote 1. Ela não tem imagem: trocar a imagem dela é trocá-la por
 * uma imagem (`SwapForImage`), nunca escrever `path` nela.
 */
export function isEntityDef(def: Record<string, unknown>): boolean {
  return def['type'] === 'skeleton';
}

/**
 * **O Abrir pasta da aba pergunta** — rodada 44, lote 1. Abrir pasta começa um
 * projeto novo (o Spriter: a pasta É o projeto), e o personagem aberto sumia
 * sem pergunta. Estas são as escolhas, cada uma com o que acontece.
 */
export const OPEN_FOLDER_CHOICES = [
  {
    id: 'origem', label: 'Usar como pasta deste personagem…',
    hint: 'O personagem fica aberto. As imagens da pasta entram na aba Imagens, e as de mesmo nome trocam (Imagens → Trocar pasta de origem…)',
  },
  {
    id: 'novo', label: 'Abrir como projeto novo…',
    hint: 'O personagem de agora fecha, e a pasta começa um projeto vazio. Se houver mudança sem salvar, o programa pergunta antes',
  },
  { id: 'nada', label: 'Deixar como está', hint: 'Nada muda' },
] as const;

/** `true` quando a base já tem personagem: algum slot. */
export function hasCharacter(file: { slots?: readonly unknown[] }): boolean {
  return (file.slots ?? []).length > 0;
}

/** A frase de cima da janela: quem está aberto. */
export function openFolderLead(file: { skeleton?: { name?: string }; slots?: readonly unknown[] }): string {
  const nome = file.skeleton?.name;
  const quem = typeof nome === 'string' && nome.length > 0 ? `"${nome}"` : 'Este personagem';
  const n = (file.slots ?? []).length;
  return `${quem} está aberto, com ${n === 1 ? '1 slot' : `${n} slots`}. O que a pasta nova faz com ele?`;
}

export class SwapSlotImage implements Command {
  readonly label = 'Trocar o desenho do slot';
  readonly kind: ChangeKind = 'structure';
  private before: DefSnapshot | null = null;
  /** O mapa do slot na pele do lápis antes da troca, por texto; `null` = não havia. */
  private intoBefore: { slotMap: string | null; hadAttachments: boolean } | null = null;

  constructor(
    private readonly slot: string,
    private readonly image: string,
    private readonly skinName: string,
    /** O desenho a trocar. Ausente = o primeiro do slot naquela pele. */
    private readonly attachment?: string,
    /** A pele do lápis, onde a troca grava. Ausente, ou igual a `skinName` = a de origem. */
    private readonly into?: string,
  ) {}

  /** A pele onde a troca de fato grava. */
  get skin(): string {
    return this.into ?? this.skinName;
  }

  private target(doc: EditorDoc, skinName = this.skinName): Record<string, unknown> | null {
    const skin = (doc.file.skins ?? []).find((s) => s.name === skinName);
    const porSlot = skin?.attachments?.[this.slot];
    if (porSlot === undefined) return null;
    const nome = this.attachment ?? Object.keys(porSlot)[0];
    const anexo = nome === undefined ? undefined : porSlot[nome];
    return anexo === undefined || anexo === null || typeof anexo !== 'object'
      ? null
      : anexo as unknown as Record<string, unknown>;
  }

  apply(doc: EditorDoc): void {
    const region = findAtlasRegion(doc.atlases ?? [], this.image);
    const into = this.into === undefined || this.into === this.skinName
      ? undefined
      : (doc.file.skins ?? []).find((s) => s.name === this.into);
    if (into === undefined) {
      const anexo = this.target(doc);
      // Rodada 44, lote 1: anexo de ENTIDADE não tem imagem. Gravar `path`
      // nele não muda a cena (o leitor ignora) e o rodapé mentia. Quem quer
      // a entidade virando imagem usa `swapCommandFor` (image-picker-model).
      if (anexo === null || isEntityDef(anexo)) return;
      this.before = snapshotDef(anexo);
      const velha = outgoingRegion(doc.atlases ?? [], anexo, this.attachment ?? this.slot);
      swapImage(anexo, this.image, region, region?.scale ?? 1, velha.region, velha.scale);
      return;
    }
    // Na pele do lápis: o desenho de lá, ou uma cópia do de origem.
    const origem = this.target(doc);
    const mapaDeOrigem = (doc.file.skins ?? []).find((s) => s.name === this.skinName)?.attachments?.[this.slot];
    const nome = this.attachment ?? (mapaDeOrigem === undefined ? undefined : Object.keys(mapaDeOrigem)[0]);
    if (nome === undefined) return;
    const existing = into.attachments?.[this.slot]?.[nome];
    if (existing === undefined && origem === null) return;
    // Rodada 44, lote 1: a entidade não ganha `path` nem na pele do lápis.
    const fonte = existing ?? origem;
    if (fonte !== null && typeof fonte === 'object' && isEntityDef(fonte as Record<string, unknown>)) return;
    this.intoBefore = {
      slotMap: into.attachments?.[this.slot] === undefined ? null : JSON.stringify(into.attachments[this.slot]),
      hadAttachments: into.attachments !== undefined,
    };
    const attachments = into.attachments ?? (into.attachments = {});
    const porSlot = (attachments[this.slot] ?? (attachments[this.slot] = {})) as Record<string, unknown>;
    const def = (existing !== undefined && existing !== null && typeof existing === 'object'
      ? existing
      : JSON.parse(JSON.stringify(origem))) as Record<string, unknown>;
    porSlot[nome] = def;
    const velha = outgoingRegion(doc.atlases ?? [], def, nome);
    swapImage(def, this.image, region, region?.scale ?? 1, velha.region, velha.scale);
  }

  revert(doc: EditorDoc): void {
    const saved = this.intoBefore;
    if (saved !== null) {
      const into = (doc.file.skins ?? []).find((s) => s.name === this.into);
      if (into !== undefined) {
        if (saved.slotMap === null) {
          delete into.attachments?.[this.slot];
          if (!saved.hadAttachments) delete (into as { attachments?: unknown }).attachments;
        } else if (into.attachments !== undefined) {
          into.attachments[this.slot] = JSON.parse(saved.slotMap);
        }
      }
      this.intoBefore = null;
      return;
    }
    const anexo = this.target(doc);
    if (anexo === null || this.before === null) return;
    restoreDef(anexo, this.before);
  }
}

/**
 * **Trocar a pasta de origem** — degrau 8, tarefa 8.3 (I4). Um passo de
 * desfazer para o acervo inteiro.
 *
 * Cada desenho que mostra uma imagem da lista passa a mostrar a nova, posta
 * **pelo pivô** dela, como qualquer troca de imagem (lote 56). Sequência fica
 * de fora: o `path` dela é um prefixo, não um nome de imagem, e trocá-la por
 * nome de arquivo estragaria os quadros.
 *
 * O `revert` devolve cada anexo **por texto**, na ordem das chaves: nada é
 * reconstruído de memória na volta.
 */
export class SwapFolderImages implements Command {
  readonly label = 'Trocar a pasta de origem';
  readonly kind: ChangeKind = 'structure';
  /** Quantos desenhos mudaram. Vale depois do `apply`. */
  changed = 0;
  private before: Array<{ def: Record<string, unknown>; snapshot: DefSnapshot }> = [];

  constructor(private readonly swaps: ReadonlyArray<{ from: string; to: string }>) {}

  apply(doc: EditorDoc): void {
    const para = new Map(this.swaps.map((swap) => [swap.from, swap.to]));
    this.before = [];
    this.changed = 0;
    for (const skin of doc.file.skins ?? []) {
      for (const porSlot of Object.values(skin.attachments ?? {})) {
        for (const [nome, raw] of Object.entries(porSlot ?? {})) {
          if (raw === null || typeof raw !== 'object') continue;
          const def = raw as unknown as Record<string, unknown>;
          if (def['sequence'] !== undefined) continue;
          const atual = (def['path'] as string | undefined) ?? nome;
          const nova = para.get(atual);
          if (nova === undefined) continue;
          this.before.push({ def, snapshot: snapshotDef(def) });
          const region = findAtlasRegion(doc.atlases ?? [], nova);
          const velha = outgoingRegion(doc.atlases ?? [], def, nome);
          swapImage(def, nova, region, region?.scale ?? 1, velha.region, velha.scale);
          this.changed++;
        }
      }
    }
  }

  revert(_doc: EditorDoc): void {
    for (const item of this.before) restoreDef(item.def, item.snapshot);
    this.before = [];
  }
}

/**
 * O desenho que nasce quando uma imagem é solta num **slot** da Árvore — lote
 * 56. Com pivô na região, ele já nasce no lugar (`placeByPivot`); sem pivô, no
 * centro do osso.
 */
export function imageOnSlotDef(atlases: readonly AtlasData[], image: string): AttachmentDef {
  const def: Record<string, unknown> = { type: 'region', path: image };
  const region = findAtlasRegion(atlases, image);
  if (region !== null && hasPivot(region)) {
    const at = placeByPivot(region, {}, region.scale);
    def['x'] = roundPivot(at.x);
    def['y'] = roundPivot(at.y);
  }
  return def as unknown as AttachmentDef;
}

/** O nome que o desenho novo pede: o último pedaço do nome da imagem. */
export function attachmentNameFor(image: string): string {
  const parts = image.split('/');
  return parts[parts.length - 1] || image;
}

/**
 * O nome do slot de uma sequência: o prefixo sem a subpasta e sem o separador
 * do fim. `efeitos/olho_` vira `olho`, e não `olho_`, que em toda lista ficaria
 * parecendo um nome cortado pela metade.
 */
export function sequenceSlotName(run: NumberedRun): string {
  const curto = attachmentNameFor(run.path).replace(/[\s_-]+$/, '');
  return curto === '' ? 'sequencia' : curto;
}

/** O rodapé depois de trazer uma sequência para a cena. */
export function sequenceDropNotice(name: string, run: NumberedRun): string {
  return `"${name}" entrou como UM desenho de ${run.count} quadros (${run.frames[0]} … `
    + `${run.frames[run.frames.length - 1]}). A linha do tempo troca o quadro; `
    + 'sem chave, ele mostra o primeiro';
}

/** O tipo que o arrasto carrega. Só a cena e a Árvore respondem a ele. */
export const DRAG_TYPE = 'text/x-recorte-imagem';

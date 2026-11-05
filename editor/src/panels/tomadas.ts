/**
 * **As tomadas na tela** — 05/11/2026. A conta está em `tomadas-model.ts`; o
 * desenho, em `documentos/projeto do programa/noite/tomadas-o-desenho.md`.
 *
 * Um gesto só, por três portas: o ícone da tomada na cena (e o botão direito
 * no osso), o botão direito na Árvore, e o menu **Tomadas**. Encaixar num osso
 * sem tomada cria a tomada e encaixa, num passo de desfazer.
 */

import type { EditorDoc } from '../contract.js';
import { corpoDe } from '../contract.js';
import { askChoice, askForm } from '../ui/dialog.js';
import { openFloatingMenu } from '../ui/floating-menu.js';
import type { FloatingItem } from '../ui/floating-menu.js';
import { Doc } from '../doc/document.js';
import { garantirAninhado, projetoDe } from '../doc/projeto.js';
import { firstAnimationOf } from '../doc/drop-entity.js';
import { openEntityFromOutside, rememberOutside } from '../io/open-save.js';
import type { FolderDirectoryHandle } from '../io/project-folder.js';
import {
  PALAVRAS, Passos, PlugIntoSocket, PutSocket, UnplugSocket, dicaDaTomada, encaixouDiz, nomeDaPeca, nomeDeTomada,
  tomadasDe, tomadasDoOsso,
} from './tomadas-model.js';
import type { Tomada } from './tomadas-model.js';

/** Onde encaixar: uma tomada que já existe, ou um osso (a tomada nasce). */
export type Alvo = { slot: string } | { bone: string };

/** O osso da escolha de agora: o osso escolhido, ou o osso do slot escolhido. */
export function ossoEscolhido(doc: EditorDoc): string | null {
  const file = corpoDe(doc).file;
  const osso = doc.selection.bones[0];
  if (osso !== undefined) return osso;
  const slot = doc.selection.slots[0] ?? doc.selection.attachments[0]?.slot;
  return slot === undefined ? null : (file.slots ?? []).find((s) => s.name === slot)?.bone ?? null;
}

/** A tomada da escolha de agora, quando o escolhido É uma tomada. */
export function tomadaEscolhida(doc: EditorDoc): Tomada | null {
  const file = corpoDe(doc).file;
  const slot = doc.selection.slots[0] ?? doc.selection.attachments[0]?.slot;
  if (slot !== undefined) return tomadasDe(file).find((t) => t.slot === slot) ?? null;
  const osso = doc.selection.bones[0];
  return osso === undefined ? null : tomadasDoOsso(file, osso)[0] ?? null;
}

/** A pergunta de quem escolheu só o `.bone` e o atlas ficou de fora. */
async function pedirPastaDaPeca(bone: string, missing: readonly string[]): Promise<FolderDirectoryHandle | null> {
  const w = globalThis as unknown as { showDirectoryPicker?(o?: unknown): Promise<FolderDirectoryHandle> };
  if (typeof w.showDirectoryPicker !== 'function') return null;
  const escolha = await askChoice({
    title: `${bone}: falta ${missing.join(', ')}`,
    lead: `As imagens de ${bone} moram em ${missing.join(', ')}, ao lado dele. Escolha a pasta onde ${bone} está, `
      + 'e o atlas e as imagens vêm juntos.',
    options: [
      { id: 'pasta', label: `Escolher a pasta de ${bone}…`, hint: 'O .bone, o atlas e as imagens entram juntos' },
      { id: 'sem', label: 'Encaixar sem as imagens', hint: 'A peça entra sem desenho, e o rodapé avisa' },
    ],
    cancelId: 'sem',
  });
  if (escolha !== 'pasta') return null;
  try {
    return await w.showDirectoryPicker({ id: 'recorte-entidade', mode: 'read' });
  } catch {
    return null;
  }
}

/**
 * **Encaixar um projeto…** — escolhe o `.bone`, e a peça entra na tomada.
 *
 * O arquivo entra no projeto como peça (a lista Entidades de antes); se um de
 * mesmo nome já estava, é ele que entra, e não uma cópia. Num osso sem tomada,
 * a tomada nasce junto, no mesmo passo de desfazer.
 */
export async function encaixarProjeto(doc: EditorDoc, alvo: Alvo): Promise<boolean> {
  const projeto = projetoDe(doc);
  if (projeto === null) {
    doc.notice('Abra ou comece um projeto antes de encaixar: Arquivo → Novo projeto…');
    return false;
  }
  const corpo = corpoDe(doc);
  let aberto;
  try {
    aberto = await openEntityFromOutside({ atlases: doc.atlases, images: corpo instanceof Doc ? corpo.pageImages : new Map() }, pedirPastaDaPeca);
  } catch (erro) {
    doc.notice(`O projeto não abriu: ${erro instanceof Error ? erro.message : String(erro)}`);
    return false;
  }
  if (aberto === null) return false;
  const uri = (aberto.path.split(/[\\/]/).pop() ?? aberto.path);
  if (projeto.lists.corpos.includes(uri) && uri === projeto.emFocoUri) {
    doc.notice(`${nomeDaPeca(uri)} é o projeto aberto: ele não cabe dentro dele mesmo`);
    return false;
  }
  if (!projeto.entidades.has(uri) && !projeto.lists.corpos.includes(uri)) {
    const peca = new Doc(aberto.file, {
      path: uri, undo: projeto.undo, atlases: aberto.atlases, images: aberto.images, skeletons: aberto.skeletons,
    });
    rememberOutside(uri, aberto.path);
    projeto.adicionarEntidade(uri, peca);
  }
  garantirAninhado(doc, uri);
  const dadosDaPeca = projeto.guardados.get(uri)?.data ?? projeto.docOf(uri)?.data ?? null;
  const toca = dadosDaPeca === null ? null : firstAnimationOf(new Map([[uri, dadosDaPeca]]), uri);
  const file = corpo.file;
  let slot: string;
  let nova = false;
  const passos = [];
  if ('slot' in alvo) {
    slot = alvo.slot;
  } else {
    slot = nomeDeTomada(file, alvo.bone);
    nova = true;
    passos.push(new PutSocket(alvo.bone, slot));
  }
  // A peça nasce em pé no mundo: o anexo desfaz o giro do osso, como no arrasto.
  const ossoDaTomada = 'slot' in alvo ? (file.slots ?? []).find((s) => s.name === alvo.slot)?.bone ?? null : alvo.bone;
  const giro = ossoDaTomada === null ? 0 : -(doc.skeleton?.findBone(ossoDaTomada)?.worldRotationX ?? 0);
  passos.push(new PlugIntoSocket(slot, uri, toca, giro));
  corpo.run(new Passos(`Encaixar ${nomeDaPeca(uri)}`, passos));
  doc.select({ ...doc.selection, bones: [], slots: [slot], attachments: [] });
  doc.notice(encaixouDiz(uri, slot, nova));
  if (aberto.warnings.length > 0) doc.notice(`${encaixouDiz(uri, slot, nova)} Aviso: ${aberto.warnings[0]}`);
  return true;
}

/** **Pôr uma tomada aqui…** — pergunta o nome (mão_d, costas, cabine) e põe. */
export async function porTomada(doc: EditorDoc, bone: string): Promise<boolean> {
  const file = corpoDe(doc).file;
  const valores = await askForm({
    title: `Pôr uma tomada no osso ${bone}`,
    lead: 'Uma tomada é o lugar onde uma peça entra: a espada na mão, o piloto na cabine.',
    fields: [{ id: 'nome', label: 'Nome da tomada', hint: 'mão_d, costas, cabeça, cabine…', value: nomeDeTomada(file, bone) }],
    yesLabel: 'Pôr a tomada',
    validate: (v) => ((v['nome'] ?? '').trim() === '' ? 'Dê um nome à tomada' : null),
  });
  if (valores === null) return false;
  const nome = nomeDeTomada(file, bone, valores['nome'] ?? '');
  corpoDe(doc).run(new PutSocket(bone, nome));
  doc.select({ ...doc.selection, bones: [], slots: [nome], attachments: [] });
  doc.notice(`Tomada ${nome} no osso ${bone}, vazia. Clique no ícone dela, na cena: ${PALAVRAS.encaixar}`);
  return true;
}

/** **Tirar a peça** da tomada: ela fica vazia. */
export function tirarPeca(doc: EditorDoc, slot: string): boolean {
  const t = tomadasDe(corpoDe(doc).file).find((x) => x.slot === slot);
  if (t === undefined || t.peca === null) {
    doc.notice(`A tomada ${slot} já está vazia`);
    return false;
  }
  corpoDe(doc).run(new UnplugSocket(slot));
  doc.notice(`${nomeDaPeca(t.peca)} saiu da tomada ${slot}. A tomada continua, vazia`);
  return true;
}

/** Os itens do menu de uma tomada, ou de um osso. Os mesmos nas três portas. */
export function itensDaTomada(doc: EditorDoc, onde: { bone: string; slot?: string }): FloatingItem[] {
  const file = corpoDe(doc).file;
  const daqui = onde.slot !== undefined
    ? tomadasDe(file).filter((t) => t.slot === onde.slot)
    : tomadasDoOsso(file, onde.bone);
  const itens: FloatingItem[] = [];
  for (const t of daqui) {
    itens.push({
      label: t.peca === null ? `${PALAVRAS.encaixar} (tomada ${t.slot})` : `Trocar a peça de ${t.slot}…`,
      hint: dicaDaTomada(t),
      run: () => { void encaixarProjeto(doc, { slot: t.slot }); },
    });
    if (t.peca !== null) {
      itens.push({ label: `${PALAVRAS.tirar} (${nomeDaPeca(t.peca)})`, hint: `A tomada ${t.slot} fica vazia`, run: () => { tirarPeca(doc, t.slot); } });
    }
  }
  if (onde.slot === undefined) {
    if (daqui.length === 0) {
      itens.push({
        label: PALAVRAS.encaixar,
        hint: `Escolhe um .bone e o encaixa no osso ${onde.bone}; a tomada nasce junto`,
        run: () => { void encaixarProjeto(doc, { bone: onde.bone }); },
      });
    }
    itens.push({
      label: PALAVRAS.porTomada,
      hint: `Um lugar vazio no osso ${onde.bone}, para encaixar uma peça depois (um slot sem imagem)`,
      run: () => { void porTomada(doc, onde.bone); },
    });
  }
  return itens;
}

/** Abre o menu da tomada (ou do osso) no ponto da tela. */
export function abrirMenuDaTomada(doc: EditorDoc, x: number, y: number, onde: { bone: string; slot?: string }): void {
  openFloatingMenu(x, y, itensDaTomada(doc, onde), 'imagens-menu tomadas-menu');
}

// ---------------------------------------------------------------------------
// Os ícones na cena
// ---------------------------------------------------------------------------

/**
 * **A camada das tomadas** — um botão por tomada, por cima da cena, no lugar
 * da peça. É botão de verdade: tem nome na dica, e o clique abre o menu da
 * tomada. Reposta a cada quadro desenhado, como a grade de imagens.
 */
export class TomadasLayer {
  private no: HTMLElement | null = null;
  private readonly botoes = new Map<string, HTMLButtonElement>();

  /** O elemento da camada. Nasce no primeiro pedido: sem DOM, nada nasce. */
  get node(): HTMLElement {
    if (this.no === null) {
      this.no = document.createElement('div');
      this.no.className = 'tomadas-camada';
    }
    return this.no;
  }

  /** `paraTela`: do mundo para a tela, em pixels do palco. */
  sync(doc: EditorDoc | null, paraTela: (x: number, y: number) => { x: number; y: number }): void {
    if (this.no === null) return;
    const vistos = new Set<string>();
    const skeleton = doc?.skeleton ?? null;
    if (doc !== null && skeleton !== null) {
      for (const t of tomadasDe(corpoDe(doc).file)) {
        const bone = skeleton.findBone(t.bone);
        if (bone === null) continue;
        const def = t.anexo === null ? null
          : ((corpoDe(doc).file.skins ?? []).find((s) => s.name === 'default')?.attachments?.[t.slot]?.[t.anexo] as { x?: number; y?: number } | undefined) ?? null;
        const lx = def?.x ?? 0;
        const ly = def?.y ?? 0;
        const mundo = { x: bone.a * lx + bone.b * ly + bone.worldX, y: bone.c * lx + bone.d * ly + bone.worldY };
        const p = paraTela(mundo.x, mundo.y);
        vistos.add(t.slot);
        let b = this.botoes.get(t.slot);
        if (b === undefined) {
          b = document.createElement('button');
          b.type = 'button';
          b.className = 'tomada-icone';
          const alvo = t.slot;
          b.addEventListener('pointerdown', (e) => e.stopPropagation());
          b.addEventListener('click', (e) => {
            e.stopPropagation();
            const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const agora = tomadasDe(corpoDe(doc).file).find((x) => x.slot === alvo);
            if (agora !== undefined) abrirMenuDaTomada(doc, r.right, r.bottom, { bone: agora.bone, slot: agora.slot });
          });
          this.botoes.set(t.slot, b);
          this.node.append(b);
        }
        b.classList.toggle('tomada-cheia', t.peca !== null);
        b.textContent = t.peca === null ? '⊡' : '⊞';
        const dica = dicaDaTomada(t);
        b.title = dica;
        b.setAttribute('aria-label', dica);
        b.style.left = `${Math.round(p.x)}px`;
        b.style.top = `${Math.round(p.y)}px`;
      }
    }
    for (const [slot, b] of this.botoes) {
      if (vistos.has(slot)) continue;
      b.remove();
      this.botoes.delete(slot);
    }
  }
}

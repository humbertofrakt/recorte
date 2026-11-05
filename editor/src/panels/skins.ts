/**
 * Painel **Peles** (dono C) — lote 27, anotação 12; duas colunas no degrau 9.
 *
 * *"Não sei onde estão as skins e como faço para usar. Skin é importante, não
 * deixa escondido."* — Humberto, 09/09/2026.
 *
 * A pele morava em três lugares: a seção Peles da Árvore mostrava os nomes, o
 * painel Exibição tinha o "Mostrar" e o "Editar aqui", e o Novo ▾ da Árvore
 * criava. Nenhum deles era **o lugar da pele**, e o do meio era o pior: quem
 * procura "onde ligo a armadura" não procura no painel da grade e dos eixos.
 *
 * **O degrau 9 (18/09/2026) tirou o olho.** Nas palavras dele, 17/09: *"no
 * lugar do olho, eu queria poder clicar na skin e arrastar"* — o Character Map
 * do Spriter, que tem duas colunas e nenhuma caixinha:
 *
 * | Coluna | O que é |
 * |:---|:---|
 * | **Feitas** | todas as peles do arquivo, na ordem do arquivo. Arrastar de lá para cá LIGA |
 * | **Ativas** | a pilha. **A de cima vence** onde duas vestem o mesmo lugar (§4.4). Arrastar dentro reordena; arrastar para fora desliga |
 *
 * O **lápis** continua, e é a única coisa que sobrou da linha antiga: ele diz
 * onde nasce o que se cria — desenho, **osso e regra** (I5). Acender o lápis
 * **liga a pele** (I6): editar uma pele desligada seria pintar no escuro.
 *
 * **Prints usados:** `spriter/prints/22-empilhar-character-maps_244.jpg` — a
 * janela Character Maps, com a frase de ajuda no topo antes da lista; e
 * `spriter/prints/00-tela-do-humberto.png` — o botão **Char Maps** à vista no
 * alto do painel de animações, e a linha escolhida em laranja. De
 * `spine/prints/skins_properties.png` veio a ideia de o botão de criar ficar
 * junto da lista, e não num menu.
 *
 * Regra 5 da casa: menu e botão chamam a MESMA função.
 */

import type { DocChange, EditorDoc, Panel } from '../contract.js';
import { registerPanel } from '../contract.js';
import { clear, el, iconButton } from './dom.js';
import { paintIcon } from '../ui/icons.js';
import { askForm } from '../ui/dialog.js';
import { folderImageNames } from '../io/project-folder.js';
import { ensureProvisionalMany } from '../io/folder-atlas.js';
import {
  KeepSkinStack, addSkinNamed, dropSkin, proposedSkinName, emptySkinHint, exportSkin, importSkinFromDisk,
  promoteSkinToBase, putSkinStack, renameInView, restoreBone, setVerdict, takeOffSkin, verdictSkin, wearSkin,
} from './skins-actions.js';
import { corpoDe, emptySelection } from '../contract.js';
import { skinEffects } from './skins-model.js';
import type { SkinEffect } from './skins-model.js';
import { removedBonesOf } from '../doc/skin-bones.js';
import {
  DeleteSkin, DuplicateSkin, RenameSkin, SKIN_HELP, activeStackRows, canDeleteSkin,
  deleteSkinLead, lostSkins, skinDependents, skinOff, skinTabRows,
} from './skins-model.js';
import type { SkinRow } from './skins-model.js';
import {
  editingSkinOf, setEditingSkin, setSkinStack, skinStackOf,
} from '../viewport/onion.js';
import { dropAt, dropOnColumn } from './skins-model.js';
import type { SkinDrop } from './skins-model.js';
// Degrau 9 (I9): fazer a pele de uma pasta inteira, como o Spriter.
import {
  folderSkinNotice, folderSkinPlan, imageFolders, MakeSkinFromFolder,
} from './skins-model.js';
import { redrawPlan, signature } from './list-redraw.js';
import { openWardrobe } from './skins-wardrobe.js';
import { previewStack, skinStateLine } from './skins-wardrobe-model.js';
import type { ListShape } from './list-redraw.js';

/** O tipo do arrasto: só o painel Peles o entende, e por isso nada mais o pega. */
export const SKIN_DRAG_TYPE = 'text/x-recorte-pele';

class SkinsPanel implements Panel {
  readonly id = 'peles';
  readonly title = 'Skins';
  readonly listensTo = ['file', 'structure', 'assets'] as const;

  private doc: EditorDoc | null = null;
  private feitas: HTMLElement | null = null;
  private ativas: HTMLElement | null = null;
  /** Rodada 12: o que a pele do lápis faz, desenho por desenho (S3, S4, S9). */
  private efeitos: HTMLElement | null = null;
  private efeitosTitulo: HTMLElement | null = null;
  private efeitosCaixa: HTMLElement | null = null;
  private help: HTMLElement | null = null;
  private aviso: HTMLElement | null = null;
  /** O passo seguinte, enquanto a pele do lápis está vazia — I7. */
  private proximo: HTMLElement | null = null;
  /** Noite de 04/11: a linha que diz o que está vestido e onde está o lápis. */
  private estado: HTMLElement | null = null;
  private drawn: ListShape = { rows: '', picked: null };
  /** A pele na mão, enquanto o arrasto dura. */
  private dragged: string | null = null;
  /** A pilha de antes da prova do mouse; `null` sem prova na cena. */
  private provando: string[] | null = null;

  private startPreview(doc: EditorDoc, name: string): void {
    if (this.provando === null) this.provando = skinStackOf(doc);
    setSkinStack(doc, previewStack(name));
  }

  private stopPreview(doc: EditorDoc): void {
    if (this.provando === null) return;
    const antes = this.provando;
    this.provando = null;
    setSkinStack(doc, antes);
  }

  mount(doc: EditorDoc, host: HTMLElement): void {
    this.doc = doc;
    clear(host);
    host.classList.add('painel', 'peles');

    // Três ícones numa linha, como no painel Animações — a palavra fica no
    // `title` e no `aria-label`, e volta ao lado do ícone com
    // Editar → Preferências → Mostrar nome das ferramentas.
    const barra = el('div', 'painel-barra');
    // Rodada 44, lote 4: a dica de cada ícone é a frase do menu (regra 12), e
    // "Duplicar" passou a "Clonar", o nome do menu: uma coisa, um nome.
    const dica = (nome: string, frase: string): HTMLButtonElement => {
      const botao = iconButton(SKIN_BAR_ICONS[nome]!, nome, SKIN_BAR_ACTIONS[nome]!);
      botao.title = `${nome}: ${frase}`;
      botao.setAttribute('aria-label', botao.title);
      return botao;
    };
    const SKIN_BAR_ICONS: Record<string, string> = {
      'Nova skin': 'plus', 'Clonar skin': 'duplicate', 'Fazer a skin de uma pasta…': 'pasta',
      'Importar skin…': 'open', 'Exportar skin…': 'save', 'Promover skin a base…': 'stamp', 'Apagar skin': 'trash',
    };
    const SKIN_BAR_ACTIONS: Record<string, () => void> = {
      'Nova skin': () => this.addSkin(),
      'Clonar skin': () => this.duplicateSkin(),
      'Fazer a skin de uma pasta…': () => { void this.skinFromFolder(); },
      'Importar skin…': () => { void this.importSkin(); },
      'Exportar skin…': () => { void exportSkin(doc); },
      'Promover skin a base…': () => { void promoteSkinToBase(doc); },
      'Apagar skin': () => { void this.deleteSkin(); },
    };
    barra.append(...SKIN_BAR_HINTS.map(([nome, frase]) => dica(nome, frase)));

    // Rodada 44 (doc 67): a linha curta cabe inteira; a frase toda na dica.
    this.help = el('p', 'peles-ajuda', SKIN_HELP_SHORT);
    this.help.title = SKIN_HELP;
    this.aviso = el('p', 'peles-perdidas');
    this.aviso.hidden = true;
    this.proximo = el('p', 'peles-ajuda peles-proximo');
    this.proximo.hidden = true;

    // Noite de 04/11/2026: a porta do Guarda-roupa, com texto — um ícone a
    // mais na barra não seria achado (diagnóstico T2).
    const guarda = el('button', 'peles-guarda-roupa', 'Guarda-roupa: desenho × skin…') as HTMLButtonElement;
    guarda.type = 'button';
    guarda.title = 'Abre a grade: cada coluna é uma skin, cada linha um desenho. Clique numa casa para trocar a imagem';
    guarda.addEventListener('click', () => openWardrobe(doc));
    this.estado = el('p', 'peles-estado');

    const corpo = el('div', 'painel-corpo peles-corpo');
    // As duas listas crescem com o arquivo, e por isso podem rolar: a prova
    // `medir-paineis.mjs` lê esta marca e deixa esta caixa em paz.
    corpo.dataset.rolagem = 'lista';
    const colunas = el('div', 'peles-colunas');

    this.feitas = el('ul', 'peles-lista');
    this.ativas = el('ul', 'peles-lista peles-pilha');
    colunas.append(
      // Noite de 04/11: "Feitas" e "Ativas" viraram "Todas" e "Vestidas" —
      // palavras de quem veste boneco (diagnóstico T7).
      this.coluna('Todas', 'Todas as skins desta base. Arraste para Vestidas para vestir', this.feitas),
      this.coluna('Vestidas', 'A pilha, de cima para baixo. A de cima vence onde duas vestem o mesmo lugar', this.ativas),
    );

    // Rodada 12: a coluna da esquerda do "Edit Character Map" do Spriter — o
    // que a pele do lápis troca, esconde e apaga, com Set Hidden e Set Ignored
    // na linha. Só aparece com o lápis numa pele que não é a default.
    this.efeitosCaixa = el('section', 'peles-efeitos');
    this.efeitosTitulo = el('h3', 'peles-coluna-titulo');
    this.efeitos = el('ul', 'peles-lista');
    this.efeitosCaixa.append(this.efeitosTitulo, this.efeitos);
    this.efeitosCaixa.hidden = true;
    corpo.append(colunas, this.efeitosCaixa);

    host.append(barra, guarda, this.estado, this.help, this.proximo, this.aviso, corpo);
    // As duas listas vivem enquanto o painel viver, e por isso os ouvintes de
    // arrasto são postos UMA vez. Pô-los a cada redesenho empilharia um
    // ouvinte por redesenho — o mesmo `drop` correndo dez vezes seguidas.
    this.wireOut(doc, this.feitas, this.ativas);

    // 'nova-pele' é DESTE painel desde o lote 27. O item "Novo ▾ → Pele" da
    // Árvore chama esta mesma ação, e ela traz a aba à frente antes de criar:
    // criar uma pele e não ver onde ela foi parar é o que ele reclamou.
    // Lote A2: 'nova-pele' mora em `skins-actions.ts`, registrada no arranque.
    // I3 (29/09/2026): 'importar-pele' também — morava aqui, e com a aba
    // fechada o item do menu ficava sem ação.
    this.render();
  }

  refresh(change: DocChange): void {
    const doc = this.doc;
    if (doc === null) return;
    const agora = this.shapeNow(doc);
    if (redrawPlan(change.kind, this.drawn, agora) === 'nada') return;
    this.render();
  }

  unmount(): void {
    if (this.doc !== null) this.stopPreview(this.doc);
    this.doc = null;
    this.feitas = null;
    this.ativas = null;
    this.efeitos = null;
    this.efeitosTitulo = null;
    this.efeitosCaixa = null;
    this.help = null;
    this.aviso = null;
    this.proximo = null;
    this.estado = null;
  }

  // -------------------------------------------------------------------------
  // Botões
  // -------------------------------------------------------------------------

  /** A mesma pele nova do menu (`skins-actions.ts`), e a lista redesenhada. */
  private addSkin(): void {
    void this.newSkinAsking();
  }

  /**
   * **Nova skin: o nome primeiro** — rodada 44, lote 4 e doc 67. Como o New…
   * Skin do Spine: a janela pede o nome, com o proposto já selecionado (quem
   * digita troca, e não emenda "skin2inverno"); Esc ou "Deixar como está" não
   * criam nada.
   */
  async newSkinAsking(): Promise<void> {
    const doc = this.docAgora();
    if (doc === null) return;
    const proposta = proposedSkinName(doc.file);
    // Sem janela (a ação rodando sem navegador, como no teste das ações) não
    // há a quem perguntar: nasce com o nome proposto, e o rodapé diz qual.
    if (typeof document === 'undefined') {
      addSkinNamed(doc, proposta);
      this.render();
      return;
    }
    const pedido = askForm({
      title: 'O nome da skin nova',
      lead: 'Um nome que diga a roupa: inverno, armadura, ferido.',
      fields: [{ id: 'nome', label: 'Nome', value: proposta }],
      yesLabel: 'Criar a skin',
    });
    // A janela já está na tela: o nome proposto vem selecionado.
    (document.querySelector('.dialog-box .dialog-form-campo') as HTMLInputElement | null)?.select();
    const resposta = await pedido;
    if (resposta === null || resposta === undefined) {
      doc.notice('Nova skin: nada foi criado');
      return;
    }
    addSkinNamed(doc, resposta['nome'] ?? proposta);
    this.render();
  }

  /**
   * O documento de quem chamou pelo MENU — rodada 6. O menu traz a aba à
   * frente antes (`mostrar-painel-peles`); se ela ainda assim não montou, a
   * conta vale com o documento do arranque, e o rodapé diz o que houve.
   */
  private fallback: EditorDoc | null = null;
  setMenuDoc(doc: EditorDoc): void { this.fallback = doc; }
  private docAgora(): EditorDoc | null { return this.doc ?? this.fallback; }

  /** **Clonar skin** (S10, decisão 3.6): o clone usa os mesmos ossos. Público desde a rodada 6. */
  duplicateSkin(): void {
    const doc = this.docAgora();
    if (doc === null) return;
    const de = this.pickedSkin();
    const command = new DuplicateSkin(doc.file, de);
    // I5: o desfazer leva a pilha e o lápis junto (`KeepSkinStack`).
    doc.run(new KeepSkinStack(command, wearSkin(command.name)));
    doc.notice(`Skin "${de}" copiada em "${command.name}"`);
    this.render();
  }

  async deleteSkin(): Promise<void> {
    const doc = this.docAgora();
    if (doc === null) return;
    const nome = this.pickedSkin();
    if (this.externals(doc).includes(nome)) {
      doc.notice(`A skin "${nome}" vem de outro arquivo: apague-a lá, ou tire o arquivo de assets.skins`);
      return;
    }
    if (!canDeleteSkin(nome)) {
      doc.notice('A skin "default" não se apaga: ela é a base. Para escondê-la, tire-a de Ativas');
      return;
    }
    const linha = skinTabRows(doc.file, skinStackOf(doc)).find((r) => r.name === nome);
    const resposta = await askForm({
      title: `Apagar a skin "${nome}"?`,
      // Rodada 17, M12a: a pergunta cita quem depende desta skin.
      lead: deleteSkinLead(linha?.slots ?? 0, skinDependents(doc.file, nome)),
      fields: [],
      yesLabel: 'Apagar a skin',
    });
    if (resposta === null) return;
    doc.run(new KeepSkinStack(new DeleteSkin(nome), dropSkin(nome)));
    doc.notice(`Skin "${nome}" apagada`);
    this.render();
  }

  async renameSkin(nome: string, nova = false): Promise<void> {
    const doc = this.doc ?? this.fallback;
    if (doc === null) return;
    const resposta = await askForm({
      title: nova ? 'O nome da skin nova' : 'Renomear a skin',
      lead: nova
        ? 'Um nome que diga a roupa: inverno, armadura, ferido. Deixar como está fica "' + nome + '".'
        : 'O nome novo entra também nas linhas de tempo que citam esta skin.',
      fields: [{ id: 'nome', label: 'Nome', value: nome }],
      yesLabel: nova ? 'Dar o nome' : 'Renomear',
    });
    const novo = resposta?.['nome']?.trim() ?? '';
    if (novo === '' || novo === nome) return;
    const command = new RenameSkin(doc.file, nome, novo);
    doc.run(new KeepSkinStack(command, renameInView(nome, command.to)));
    doc.notice(`Skin "${nome}" agora é "${command.to}"`);
    this.render();
  }

  /**
   * **Fazer a pele de uma pasta** (I9) — o jeito do Spriter, por nome.
   *
   * A pergunta é uma só: que pasta. O que a pasta cobre e o que ela NÃO cobre
   * sai no rodapé antes de fechar — uma pele que troca quinze dos vinte
   * desenhos e cala sobre os cinco é a regra 21 quebrada.
   */
  async skinFromFolder(): Promise<void> {
    const doc = this.docAgora();
    if (doc === null) return;
    // Rodada 44, lote 5: e as imagens da PASTA do projeto, que ainda não
    // entraram em atlas nenhum. A subpasta `inverno/` estava na aba Imagens e
    // não aparecia aqui: só valia a pasta de uma imagem já usada na cena.
    const imagens = [...new Set([
      ...doc.atlases.flatMap((atlas) => atlas.regions.map((region) => region.name)),
      ...folderImageNames(doc),
    ])];
    const pastas = imageFolders(imagens);
    if (pastas.length === 0) {
      doc.notice('Nenhuma pasta nas imagens carregadas. Uma pasta (ou um grupo do PSD) vira uma skin');
      return;
    }
    const de = this.pickedSkin();
    const resposta = await askForm({
      title: 'Fazer a skin de uma pasta',
      lead: `Cada desenho de "${de}" procura, na pasta, uma imagem com o mesmo nome de `
        + `arquivo. Pastas com imagem aqui: ${pastas.join(', ')}.`,
      // Rodada 44, lote 6 (doc 71): uma LISTA das pastas. O campo de texto
      // vinha com "armadura" escrito e sem seleção; digitar dava
      // "armadurainverno", e a janela fechava com erro. A escolhida de
      // partida é a primeira pasta que ainda não é uma skin.
      fields: [{
        id: 'pasta', label: 'Pasta', value: firstFreeFolder(pastas, (doc.file.skins ?? []).map((s) => s.name)),
        choices: pastas.map((p) => ({ value: p, label: p })),
      }],
      yesLabel: 'Fazer a skin',
    });
    const pasta = resposta?.['pasta']?.trim() ?? '';
    if (pasta === '') return;
    const plano = folderSkinPlan(doc.file, de, pasta, imagens);
    if (plano.matched.length === 0) {
      doc.notice(folderSkinNotice(pasta, plano));
      return;
    }
    // Rodada 44, lote 5: as imagens da pasta entram na cena ANTES, para a
    // skin nova apontar para regiões que existem (o desenho cai pelo pivô).
    const faltam = await ensureProvisionalMany(doc, plano.matched.map((m) => m.to));
    if (faltam.missing.length > 0) {
      doc.notice(`A pasta "${pasta}": ${faltam.missing.length === 1 ? 'uma imagem não abriu' : `${faltam.missing.length} imagens não abriram`} `
        + `(${faltam.missing.slice(0, 3).join(', ')}). Nada mudou`);
      return;
    }
    const command = new MakeSkinFromFolder(doc.file, de, plano, pasta);
    doc.run(new KeepSkinStack(command, wearSkin(command.name)));
    doc.notice(`Skin "${command.name}": ${folderSkinNotice(pasta, plano)}`);
    this.render();
  }

  /** **Importar pele…** (F23): o seletor de arquivo, e o resto é da ação. */
  private async importSkin(): Promise<void> {
    const doc = this.doc;
    if (doc === null) return;
    // M11: a mesma função do menu, que fala antes e depois do seletor.
    await importSkinFromDisk(doc);
    this.render();
  }

  /**
   * As peles que o runtime montou e o arquivo não tem: as **de fora** (F23).
   *
   * Elas moram noutro arquivo, citado em `assets.skins` (2.8), e entram neste
   * corpo com os ossos que trazem. Sem esta lista elas ficariam invisíveis na
   * aba — importadas, desenháveis, e ausentes do único lugar onde se liga uma
   * pele (regra 21).
   */
  private externals(doc: EditorDoc): string[] {
    const daqui = new Set((doc.file.skins ?? []).map((skin) => skin.name));
    return (doc.data?.skins ?? [])
      .map((skin) => skin.name)
      .filter((name) => !daqui.has(name));
  }

  /** A pele do lápis: é nela que Duplicar e Apagar agem. */
  private pickedSkin(): string {
    const doc = this.docAgora();
    if (doc === null) return 'default';
    const lapis = editingSkinOf(doc);
    if (lapis !== null) return lapis;
    return skinTabRows(doc.file, skinStackOf(doc))[0]?.name ?? 'default';
  }

  // -------------------------------------------------------------------------
  // A pilha
  // -------------------------------------------------------------------------

  /** Soltar numa posição ESCOLHIDA da pilha: a posição `at` é a da TELA. */
  private dropOnStack(doc: EditorDoc, name: string, at: number): void {
    this.applyDrop(doc, dropAt(doc.file, skinStackOf(doc), name, at));
  }

  /**
   * **Soltar na COLUNA, e não numa linha: liga NO TOPO** — defeito 4, 21/09.
   *
   * A decisão é do `skins-model.ts`; aqui só se grava e se desenha (regra 8).
   */
  private dropOnTop(doc: EditorDoc, name: string): void {
    this.applyDrop(doc, dropOnColumn(doc.file, skinStackOf(doc), name));
  }

  /** Grava a pilha nova e diz **o que aconteceu de verdade** (regra 21). */
  private applyDrop(doc: EditorDoc, drop: SkinDrop): void {
    // Rodada 17: ligar e reordenar a pilha também é um passo do Desfazer.
    const antes = skinStackOf(doc);
    const mudou = antes.length !== drop.stack.length || antes.some((n, i) => n !== drop.stack[i]);
    if (mudou) putSkinStack(doc, drop.stack, 'Mudar a pilha de skins');
    doc.notice(drop.notice);
    this.render();
  }

  /** Desliga a pele, dizendo o que sumiu junto com ela (I6, regra 21). */
  private removeFromStack(doc: EditorDoc, name: string): void {
    const antes = skinStackOf(doc);
    if (!antes.includes(name)) return;
    // A frase se conta com a pilha de ANTES, e se diz DEPOIS: dita antes, a
    // repose de tirar a pele a cobria com "Arquivo não salvo" (rodada 12, S8).
    const frase = skinOff(doc.file, name, antes);
    // Rodada 17: um passo do Desfazer (o `Ctrl+Z` devolve a pele). O lápis
    // segue a pele no mesmo passo: editar uma pele que saiu da pilha é pintar
    // no escuro, e foi isso que o degrau 9 veio consertar.
    takeOffSkin(doc, name);
    doc.notice(frase);
    this.render();
  }

  // -------------------------------------------------------------------------
  // Desenhar
  // -------------------------------------------------------------------------

  private shapeNow(doc: EditorDoc): ListShape {
    const rows = skinTabRows(doc.file, skinStackOf(doc), editingSkinOf(doc), this.externals(doc));
    return {
      rows: signature([
        ...rows.map((r) => [r.name, r.slots, r.visible, r.isDefault]),
        skinStackOf(doc),
        // Rodada 12: esconder e ignorar mudam a lista "Nesta pele".
        this.effectsOf(doc).map((e) => `${e.kind} ${e.slot} ${e.attachment} ${e.text}`),
      ]),
      picked: editingSkinOf(doc),
    };
  }

  private coluna(titulo: string, dica: string, lista: HTMLElement): HTMLElement {
    const box = el('section', 'peles-coluna');
    const cabeca = el('h3', 'peles-coluna-titulo', titulo);
    cabeca.title = dica;
    box.append(cabeca, lista);
    return box;
  }

  private render(): void {
    const doc = this.doc;
    const feitas = this.feitas;
    const ativas = this.ativas;
    if (doc === null || feitas === null || ativas === null) return;
    clear(feitas);
    clear(ativas);
    this.drawn = this.shapeNow(doc);

    const stack = skinStackOf(doc);
    const lapis = editingSkinOf(doc);
    const deFora = this.externals(doc);
    const todas = skinTabRows(doc.file, stack, lapis, deFora);

    // A frase fica enquanto há **uma** pele, e sai na segunda. Quem já tem duas
    // roupas no personagem já sabe o que uma pele é, e três linhas de
    // explicação numa coluna de 260px são três linhas tiradas da lista — a
    // regra de espaço do Humberto, 09/09/2026.
    if (this.help !== null) this.help.hidden = todas.length !== 1;

    // I7: a pele do lápis está vazia — a panela está na mão e não há arroz.
    // A frase diz o gesto que põe o primeiro desenho nela, e some quando ele
    // chega.
    if (this.estado !== null) this.estado.textContent = skinStateLine(stack, lapis);

    const dica = emptySkinHint(todas);
    if (this.proximo !== null) {
      this.proximo.hidden = dica === null;
      this.proximo.textContent = dica ?? '';
    }

    // Nome na pilha que o arquivo não tem mais: dito, e não escondido (regra 21).
    const perdidas = lostSkins(doc.file, stack, deFora);
    if (this.aviso !== null) {
      this.aviso.hidden = perdidas.length === 0;
      this.aviso.textContent = perdidas.length === 0 ? ''
        : `Fora da lista: ${perdidas.join(', ')} — a pilha cita ${perdidas.length === 1 ? 'uma skin que' : 'skins que'} esta base não tem`;
    }

    if (todas.length === 0) {
      feitas.append(el('li', 'painel-aviso',
        'Este esqueleto ainda não tem skin. Use Nova skin.'));
      return;
    }
    for (const row of todas) feitas.append(this.buildRow(doc, row, 'feitas'));

    const pilha = activeStackRows(doc.file, stack, lapis, deFora);
    if (pilha.length === 0) {
      ativas.append(el('li', 'painel-aviso',
        'Nenhuma skin ligada: a base está sem arte. Arraste uma skin para cá.'));
    }
    for (const [i, row] of pilha.entries()) ativas.append(this.buildRow(doc, row, 'ativas', i));
    // A zona de baixo da pilha: soltar aqui põe a pele **embaixo de todas**.
    ativas.append(this.buildFundo(doc, pilha.length));
    this.renderEffects(doc);
  }

  // -------------------------------------------------------------------------
  // Nesta pele — rodada 12 (S3, S4, S9)
  // -------------------------------------------------------------------------

  /** O que a pele do lápis faz; vazio sem lápis numa pele que não é a default. */
  private effectsOf(doc: EditorDoc): SkinEffect[] {
    const pele = verdictSkin(doc);
    if (pele === null) return [];
    const file = corpoDe(doc).file;
    return skinEffects(file, pele, removedBonesOf(file, pele));
  }

  private renderEffects(doc: EditorDoc): void {
    const caixa = this.efeitosCaixa;
    const lista = this.efeitos;
    const titulo = this.efeitosTitulo;
    if (caixa === null || lista === null || titulo === null) return;
    clear(lista);
    const pele = verdictSkin(doc);
    caixa.hidden = pele === null;
    if (pele === null) return;
    titulo.textContent = `Nesta skin: ${pele}`;
    titulo.title = 'O que a skin do lápis troca, esconde e apaga. A base não muda';
    const efeitos = this.effectsOf(doc);
    if (efeitos.length === 0) {
      lista.append(el('li', 'painel-aviso',
        'Ela ainda não mexe em nada. Botão direito numa imagem: trocar, ou Esconder nesta skin.'));
      return;
    }
    for (const efeito of efeitos) lista.append(this.buildEffect(doc, pele, efeito));
  }

  /** Uma linha de "Nesta pele": o nome, e os botões Esconder e Ignorar. */
  private buildEffect(doc: EditorDoc, pele: string, efeito: SkinEffect): HTMLElement {
    const item = el('li', 'peles-linha peles-efeito');
    item.dataset.efeito = efeito.kind;
    const nome = el('span', 'peles-nome', efeito.text);
    nome.title = efeito.kind === 'osso'
      ? `${efeito.slot}: apagado só nesta skin. Na base e nas outras skins continua`
      : `${efeito.slot}/${efeito.attachment} — clique para escolher`;
    if (efeito.kind !== 'osso') {
      nome.addEventListener('click', () => {
        doc.select({
          ...emptySelection(), slots: [efeito.slot],
          attachments: [{ slot: efeito.slot, attachment: efeito.attachment }],
        });
      });
    }
    item.append(nome);
    const par = [{ slot: efeito.slot, attachment: efeito.attachment }];
    const botao = (icone: string, dica: string, acao: () => void): void => {
      const node = el('button', 'peles-acao') as HTMLButtonElement;
      node.type = 'button';
      if (!paintIcon(node, icone, 16)) node.textContent = dica.slice(0, 1);
      node.title = dica;
      node.setAttribute('aria-label', dica);
      node.addEventListener('click', () => {
        acao();
        this.render();
      });
      item.append(node);
    };
    if (efeito.kind === 'troca') {
      botao('eye', `Esconder ${efeito.attachment} nesta skin: com ela vestida, não é desenhada`,
        () => setVerdict(doc, pele, par, 'esconde'));
    }
    if (efeito.kind === 'osso') {
      // O Diretor, 04/10: "um botão, um sentido" — Ignorar é só de imagem.
      botao('back-to-setup', `Devolver o osso ${efeito.slot}: volta a aparecer nesta skin, com os filhos e os desenhos dele`,
        () => restoreBone(doc, pele, efeito.slot));
    } else {
      botao('back-to-setup', `Ignorar ${efeito.attachment} nesta skin: volta o desenho de baixo, o da base`,
        () => setVerdict(doc, pele, par, 'ignora'));
    }
    return item;
  }

  /**
   * Solta fora de Ativas = desliga. A coluna Feitas é a lixeira da pilha.
   *
   * Chamada **uma vez**, no `mount`: as duas listas são as mesmas do começo ao
   * fim, e um `addEventListener` por redesenho faria o `drop` correr uma vez
   * por redesenho que já aconteceu.
   */
  private wireOut(doc: EditorDoc, feitas: HTMLElement, ativas: HTMLElement): void {
    feitas.addEventListener('dragover', (event) => {
      if (this.dragged === null || !skinStackOf(doc).includes(this.dragged)) return;
      event.preventDefault();
      if (event.dataTransfer !== null) event.dataTransfer.dropEffect = 'move';
      feitas.classList.add('peles-alvo');
    });
    feitas.addEventListener('dragleave', () => feitas.classList.remove('peles-alvo'));
    feitas.addEventListener('drop', (event) => {
      event.preventDefault();
      feitas.classList.remove('peles-alvo');
      const nome = this.dragged;
      this.dragged = null;
      if (nome === null) return;
      this.removeFromStack(doc, nome);
    });
    ativas.addEventListener('dragover', (event) => {
      if (this.dragged === null) return;
      event.preventDefault();
      if (event.dataTransfer !== null) event.dataTransfer.dropEffect = 'move';
    });
    // Soltar no vazio da coluna — abaixo da última linha, ou na frase de
    // "nenhuma pele ligada" — também liga: a mão mira a COLUNA, e não a linha.
    // Sem isto, metade dos arrastos não fazia nada e parecia defeito do mouse.
    ativas.addEventListener('drop', (event) => {
      event.preventDefault();
      const nome = this.dragged;
      this.dragged = null;
      if (nome === null) return;
      this.dropOnTop(doc, nome);
    });
  }

  /** O fundo da pilha: uma faixa que aceita o que vier, e põe embaixo de tudo. */
  private buildFundo(doc: EditorDoc, at: number): HTMLElement {
    const fundo = el('li', 'peles-fundo', 'embaixo de todas');
    fundo.title = 'Soltar aqui põe a skin no fundo da pilha: ela perde para todas as outras';
    fundo.addEventListener('dragover', (event) => {
      if (this.dragged === null) return;
      event.preventDefault();
      fundo.classList.add('peles-alvo');
    });
    fundo.addEventListener('dragleave', () => fundo.classList.remove('peles-alvo'));
    fundo.addEventListener('drop', (event) => {
      event.preventDefault();
      event.stopPropagation();
      fundo.classList.remove('peles-alvo');
      const nome = this.dragged;
      this.dragged = null;
      if (nome === null) return;
      this.dropOnStack(doc, nome, at);
    });
    return fundo;
  }

  private buildRow(
    doc: EditorDoc, row: SkinRow, coluna: 'feitas' | 'ativas', at = 0,
  ): HTMLElement {
    const item = el('li', row.editable ? 'peles-linha peles-linha-editavel' : 'peles-linha');
    item.draggable = true;
    item.dataset.pele = row.name;
    if (coluna === 'feitas' && row.visible) item.classList.add('peles-linha-ligada');

    item.addEventListener('dragstart', (event) => {
      this.dragged = row.name;
      event.dataTransfer?.setData(SKIN_DRAG_TYPE, row.name);
      event.dataTransfer?.setData('text/plain', row.name);
      if (event.dataTransfer !== null) event.dataTransfer.effectAllowed = 'move';
    });
    item.addEventListener('dragend', () => { this.dragged = null; });

    // Noite de 04/11: passar o mouse numa skin de Todas PROVA na cena — ela
    // sozinha, por cima da base — e tirar o mouse volta o que estava vestido.
    // Não é passo de desfazer e não suja o arquivo: é só olhar.
    if (coluna === 'feitas') {
      item.addEventListener('mouseenter', () => {
        if (this.dragged !== null) return;
        this.startPreview(doc, row.name);
      });
      item.addEventListener('mouseleave', () => this.stopPreview(doc));
      item.addEventListener('mousedown', () => this.stopPreview(doc), true);
    }

    if (coluna === 'ativas') {
      item.addEventListener('dragover', (event) => {
        if (this.dragged === null) return;
        event.preventDefault();
        item.classList.add('peles-alvo');
      });
      item.addEventListener('dragleave', () => item.classList.remove('peles-alvo'));
      item.addEventListener('drop', (event) => {
        event.preventDefault();
        event.stopPropagation();
        item.classList.remove('peles-alvo');
        const nome = this.dragged;
        this.dragged = null;
        if (nome === null || nome === row.name) return;
        this.dropOnStack(doc, nome, at);
      });
    }

    // O lápis: onde nasce o que se cria — desenho, osso e regra (I5). Ele é o
    // único botão da linha desde que o olho saiu: ligar é arrastar.
    const lapis = el('button', 'peles-acao') as HTMLButtonElement;
    lapis.type = 'button';
    if (!paintIcon(lapis, 'rename', 18)) lapis.textContent = '✎';
    lapis.setAttribute('aria-pressed', String(row.editable));
    lapis.classList.toggle('peles-acao-editando', row.editable);
    const dicaLapis = row.editable
      ? `O desenho, o osso e a regra novos já nascem na skin "${row.name}"`
      : `Editar aqui: o desenho, o osso e a regra novos passam a nascer na skin "${row.name}"`;
    lapis.title = dicaLapis;
    lapis.setAttribute('aria-label', dicaLapis);
    lapis.addEventListener('click', () => {
      const antes = skinStackOf(doc);
      setEditingSkin(doc, row.editable ? null : row.name);
      // Rodada 44, lote 4: o lápis fala sempre, e não só quando liga (regra 21).
      doc.notice(pencilNotice(row.name, row.editable, antes.includes(row.name)));
      this.render();
    });

    const nome = el('span', 'peles-nome', row.name);
    // O nome inteiro no `title` mesmo quando cabe: é o que se lê para saber o
    // que está sendo ligado, e não pode depender da largura da coluna.
    if (row.external === true) {
      // Pele de fora (F23): quem manda nela é o arquivo dela. Renomear aqui
      // mudaria o nome só na tela, e no dia seguinte a pilha citaria um nome
      // que o arquivo não tem.
      item.classList.add('peles-linha-de-fora');
      nome.title = `${row.name} — vem de outro arquivo (Importar skin). Renomear e apagar são de lá`;
    } else {
      nome.title = `${row.name} — duplo clique renomeia`;
      nome.addEventListener('dblclick', (event) => {
        event.preventDefault();
        void this.renameSkin(row.name);
      });
    }

    const conta = el('span', 'peles-conta', `${row.slots}`);
    conta.title = row.slots === 1 ? '1 slot vestido por esta skin'
      : `${row.slots} slots vestidos por esta skin`;

    item.append(lapis, nome, conta);

    // Rodada 44, lote 4: ligar sem arrastar. Em Feitas, a skin desligada tem
    // um olho que a põe no topo da pilha — o Spine liga com um clique; o
    // arrasto do Spriter continua valendo. Feitas e Ativas não cabiam juntas
    // na aba (doc 55, foto 32), e o arrasto era a única porta.
    if (coluna === 'feitas' && !row.visible) {
      const ligar = el('button', 'peles-acao peles-ligar') as HTMLButtonElement;
      ligar.type = 'button';
      if (!paintIcon(ligar, 'eye', 16)) ligar.textContent = '+';
      const dicaLigar = `Ligar a skin "${row.name}": ela entra no topo da pilha e vence as outras`;
      ligar.title = dicaLigar;
      ligar.setAttribute('aria-label', dicaLigar);
      ligar.addEventListener('click', () => this.dropOnTop(doc, row.name));
      item.append(ligar);
    }

    if (coluna === 'ativas') {
      const fora = el('button', 'peles-acao') as HTMLButtonElement;
      fora.type = 'button';
      if (!paintIcon(fora, 'close', 16)) fora.textContent = '×';
      const dica = `Desligar a skin "${row.name}": ela sai da pilha e a arte dela some`;
      fora.title = dica;
      fora.setAttribute('aria-label', dica);
      fora.addEventListener('click', () => this.removeFromStack(doc, row.name));
      item.append(fora);
    }
    return item;
  }
}

/**
 * Os sete ícones da barra, com a frase do menu Skins na dica — rodada 44,
 * lote 4. A aba dizia só o nome ("Nova skin"); o menu dizia o que acontece.
 */
/** A ajuda da aba numa linha que cabe — rodada 44, doc 67. A inteira é `SKIN_HELP`, na dica. */
export const SKIN_HELP_SHORT = 'Skin é uma roupa: o desenho troca';

/** A pasta de partida da janela "Fazer a skin de uma pasta": a primeira que não é skin — lote 6. */
export function firstFreeFolder(folders: readonly string[], skins: readonly string[]): string {
  const ja = new Set(skins);
  return folders.find((f) => !ja.has(f)) ?? folders[0] ?? '';
}

export const SKIN_BAR_HINTS: ReadonlyArray<readonly [string, string]> = [
  ['Nova skin', 'uma skin nova, vazia, que passa a ser a do lápis. Pede o nome na hora'],
  ['Clonar skin', 'uma cópia da skin do lápis, com os mesmos ossos'],
  ['Fazer a skin de uma pasta…', 'cada desenho procura, na subpasta escolhida, uma imagem com o mesmo nome de arquivo'],
  ['Importar skin…', 'traz uma skin de um arquivo .bone para esta base. Também em Arquivo'],
  ['Exportar skin…', 'grava a skin do lápis num arquivo .bone só dela. Também em Arquivo'],
  ['Promover skin a base…', 'a pilha ligada vira a base de uma base nova, com animações próprias'],
  ['Apagar skin', 'apaga a skin do lápis, depois de perguntar. Ctrl+Z devolve'],
];

/** O que o lápis diz no rodapé — rodada 44, lote 4. */
export function pencilNotice(name: string, wasEditing: boolean, wasOn: boolean): string {
  if (wasEditing) return 'Lápis de volta na default: o que se cria nasce na base de todas';
  return wasOn
    ? `Lápis na skin "${name}": o que se cria daqui em diante nasce nela`
    : `Skin "${name}" ligada, com o lápis nela: o que se cria daqui em diante nasce nela`;
}

export const skinsPanel = new SkinsPanel();
registerPanel(skinsPanel);

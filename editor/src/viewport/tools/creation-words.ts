/**
 * As frases de quem nasce na cena e de quem é escolhido — rodada 46, lote 4
 * (doc `66`, §2.4 e §2.5). Módulo puro, sem import.
 *
 * A regra de onde nasce NÃO muda aqui: é a do Humberto, de 13/09/2026 —
 * *"não quero parentesco sem eu ter selecionado antes"* (`newBoneParent`,
 * `shapeTarget`). O osso, o ponto e a caixa nascem no osso escolhido com a
 * mão, ou soltos, na raiz. O que muda é que a tela **diz** onde nasceram, e
 * como pôr num osso da próxima vez.
 */

/** Onde o osso novo nasceu: *"solto, na raiz"* ou *"filho de torso"*. */
export function newBoneWhere(parent: string | undefined, root: string | null): string {
  if (parent === undefined || parent === root) return 'solto, na raiz';
  return `filho de ${parent}`;
}

/** A frase completa do osso novo, para depois do recado de pegar desenhos. */
export function newBoneNotice(name: string, parent: string | undefined, root: string | null): string {
  return `O osso "${name}" nasceu ${newBoneWhere(parent, root)}`;
}

/**
 * O que o rodapé acrescenta quando o ponto ou a caixa caiu na raiz com um
 * desenho escolhido: a pessoa achava que ia para o osso do desenho (doc `66`,
 * T9). `''` quando foi para um osso escolhido, ou quando nada estava escolhido.
 */
export function looseShapeHint(
  selection: { slots: readonly string[]; attachments: readonly unknown[] },
  bone: string, root: string | null, feminino: boolean,
): string {
  if (bone !== root) return '';
  if (selection.attachments.length === 0 && selection.slots.length === 0) return '';
  const solto = feminino ? 'solta' : 'solto';
  return `. Ficou ${solto}, na raiz: para pôr num osso, escolha o osso antes (na Árvore, ou Alt+clique na cena)`;
}

/**
 * Os ossos escolhidos COM A MÃO — rodada 46, lote 5 (nota (a) do doc `80`).
 * Desde a rodada 8d, clicar num desenho só traz o osso dele quando o osso tem
 * o mesmo nome (`clickKeepsBone`): esse veio de carona e não conta. Todo outro
 * osso da escolha foi escolhido de propósito, e é o pai do que nasce.
 */
export function handPickedBones(
  selection: { bones: readonly string[]; slots?: readonly string[]; attachments?: ReadonlyArray<{ slot: string }> },
  boneOfSlot: (slot: string) => string | null,
): string[] {
  const carona = new Set<string>();
  for (const slot of [...(selection.slots ?? []), ...(selection.attachments ?? []).map((a) => a.slot)]) {
    const osso = boneOfSlot(slot);
    if (osso !== null) carona.add(osso);
  }
  return selection.bones.filter((b) => !carona.has(b));
}

/** O nome que o osso novo herda: o do PRIMEIRO desenho escolhido (nota (b) do doc `80`). */
export function firstChosenSlot(
  selection: { slots?: readonly string[]; attachments?: ReadonlyArray<{ slot: string }> },
): string | null {
  return selection.attachments?.[0]?.slot ?? selection.slots?.[0] ?? null;
}

/** *"2 escolhidos: cape_upper, cape_lower"*. `null` com menos de dois. */
export function chosenNotice(names: readonly string[]): string | null {
  const unicos = [...new Set(names)];
  if (unicos.length < 2) return null;
  const mostra = unicos.slice(0, 4).join(', ');
  const resto = unicos.length > 4 ? ` e mais ${unicos.length - 4}` : '';
  return `${unicos.length} escolhidos: ${mostra}${resto}`;
}

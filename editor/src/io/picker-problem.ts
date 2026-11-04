/**
 * **O seletor de arquivo que não abriu, ou foi fechado** — rodada 23, defeito 8.
 *
 * A forma: *"o cancelar e o 'navegador não deixou' viravam o mesmo null
 * calado"*. Salvar, Salvar como e Exportar skin engoliam qualquer erro do
 * `showSaveFilePicker` e voltavam `null`, e quem chamou não dizia nada: o
 * rodapé ficava igual, e não havia como saber se o arquivo tinha sido gravado.
 * A regra 21 pede que o programa diga. Quem pega o erro anota aqui; quem
 * recebe o `null` pega a frase e põe no rodapé.
 */

let pending: string | null = null;

/** A frase do rodapé para o erro do seletor. `what` é o gesto: "Salvar", "Exportar a skin". */
export function pickerProblemText(error: unknown, what: string): string {
  const name = typeof error === 'object' && error !== null ? (error as { name?: unknown }).name : undefined;
  if (name === 'AbortError') return `${what}: a janela foi fechada sem escolher onde. Nada foi gravado`;
  // A frase do navegador vem em inglês: diz-se o motivo em português, pelo nome.
  const motivo = name === 'SecurityError' || name === 'NotAllowedError'
    ? ': ele só a abre logo depois de um clique ou de uma tecla. Tente pelo menu de novo'
    : '';
  return `${what}: o navegador não deixou abrir a janela de escolher onde gravar${motivo}. Nada foi gravado`;
}

/** Anota o erro do seletor, para quem recebe o `null` dizer. */
export function notePickerProblem(error: unknown, what: string): void {
  pending = pickerProblemText(error, what);
}

/** A frase anotada, uma vez só; `null` quando não houve erro de seletor. */
export function takePickerProblem(): string | null {
  const out = pending;
  pending = null;
  return out;
}

/**
 * **O Salvar que parou antes de gravar** — rodada 39 (nota da conferência da
 * v30.1). O arquivo tinha problemas, e a pergunta "salvar mesmo assim?" voltou
 * "não" — às vezes sem ninguém ter visto a pergunta: um navegador sem janela de
 * diálogo responde "não" sozinho. O rodapé dizia nada, e o Salvar parecia não
 * existir. Agora quem recebe o `null` tem a frase.
 */
export function noteSaveRefused(problems: readonly string[], arquivo: string): void {
  // Nota a do doc 34: a frase do leitor vem em inglês e cita um caminho interno
  // ("/skins/…/sword/uri: nested skeleton…"). Ela continua na janela de
  // pergunta e na barra de avisos; o rodapé diz o que o Humberto lê.
  const quantos = problems.length === 1 ? '1 problema' : `${problems.length} problemas`;
  pending = `Salvar: parou antes de gravar, porque ${arquivo} tem ${quantos}. Nada foi gravado`;
}

/**
 * As ações do menu **Tomadas** — 05/11/2026. Os gestos moram em `tomadas.ts`;
 * aqui só o registro, como a casa pede (toda ação de arranque num `*-actions.ts`).
 */

import type { EditorDoc } from '../contract.js';
import { registerAction } from '../ui/actions.js';
import { encaixarProjeto, ossoEscolhido, porTomada, tirarPeca, tomadaEscolhida } from './tomadas.js';

/** Registra as do menu Tomadas. Devolve como tirá-las. */
export function registerTomadasActions(doc: EditorDoc): Array<() => void> {
  const semOsso = 'Escolha um osso (na cena ou na Árvore) para encaixar ali';
  return [
    registerAction('encaixar-projeto', {
      run: () => {
        const t = tomadaEscolhida(doc);
        const osso = ossoEscolhido(doc);
        if (t !== null) void encaixarProjeto(doc, { slot: t.slot });
        else if (osso !== null) void encaixarProjeto(doc, { bone: osso });
        else doc.notice(semOsso);
      },
      enabled: () => ossoEscolhido(doc) !== null,
      why: () => semOsso,
    }),
    registerAction('por-tomada', {
      run: () => { const osso = ossoEscolhido(doc); if (osso !== null) void porTomada(doc, osso); },
      enabled: () => ossoEscolhido(doc) !== null,
      why: () => 'Escolha um osso (na cena ou na Árvore) para pôr a tomada nele',
    }),
    registerAction('tirar-peca', {
      run: () => { const t = tomadaEscolhida(doc); if (t !== null) tirarPeca(doc, t.slot); },
      enabled: () => tomadaEscolhida(doc)?.peca != null,
      why: () => 'Escolha uma tomada com peça: o ícone dela na cena, ou o slot na Árvore',
    }),
  ];
}


/**
 * As ações que existem desde o arranque — lote A2, plano arrumação (v10.5).
 *
 * O `main.ts` chama `registerCoreActions(doc)` logo depois do documento
 * existir, antes de qualquer painel montar. Daí em diante estas ações valem
 * pelo menu e pela tecla com qualquer aba fechada — e valem num teste sem
 * navegador, sem painel nenhum.
 *
 * Cada parte do programa guarda as suas num arquivo `*-actions.ts` ao lado do
 * painel; aqui só se chama cada uma. Quem é de arranque, de painel ou da casca
 * está escrito em `ui/actions-table.ts`.
 */

import type { EditorDoc } from '../contract.js';
import { registerAnimationActions } from '../panels/animations-actions.js';
import { registerTimelineActions } from '../panels/dopesheet-actions.js';
import { registerOrderActions } from '../panels/draw-order-actions.js';
import { registerRuleActions } from '../panels/rules-actions.js';
import { registerSkinActions } from '../panels/skins-actions.js';
import { registerTreeActions } from '../panels/tree-actions.js';
import { registerViewActions } from '../panels/view-panel-actions.js';
import { registerEffectActions } from './efeitos-actions.js';
// P33 (rodada final, chat H): o pivô e a pasta com a aba Imagens fechada.
import { registerImageActions } from '../panels/palette-actions.js';
// Rodada 6 (05/10/2026): as portas dos menus Malha e regras, Entidades e
// Partículas, que só existiam em botão de aba ou em gesto.
import { registerMeshActions } from '../panels/mesh-actions.js';
import { registerEntityActions } from '../panels/entities-actions.js';
import { registerParticleActions } from '../panels/particles-actions.js';

/** Registra todas as ações de arranque. Devolve a função que tira todas. */
export function registerCoreActions(doc: EditorDoc): () => void {
  const forget = [
    ...registerTreeActions(doc),
    ...registerOrderActions(doc),
    ...registerAnimationActions(doc),
    ...registerSkinActions(doc),
    // Defeito 2 (19/09/2026): com a aba Regras fechada, o painel nunca montava
    // e estas acoes nao existiam — o gesto ficava mudo.
    ...registerRuleActions(doc),
    ...registerTimelineActions(doc),
    // Flash, pulso e tremor (22/09/2026): a conta mora em `anim/efeitos.ts`,
    // que e degrau 1 e nao pode importar o registro de acoes. A porta fica
    // em `ui/`, e as tres valem com qualquer aba fechada.
    ...registerEffectActions(doc),
    // P33 (29/09/2026, chat H): Definir pivô, Carimbar, Recarregar e Trocar
    // origem valem com a aba Imagens fechada.
    ...registerImageActions(doc),
    // I3, chat I (29/09/2026, P23): ver, travar e a cebola. Com a aba
    // Exibição fechada, o botão "Ver ossos" do alto e o menu Exibir ficavam
    // sem ação, calados.
    ...registerViewActions(doc),
    // Rodada 6: com a aba fechada, o menu traz a aba à frente e age.
    ...registerMeshActions(doc),
    ...registerEntityActions(doc),
    ...registerParticleActions(doc),
  ];
  return () => {
    for (const stop of forget) stop();
  };
}

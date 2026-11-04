// SPDX-License-Identifier: Apache-2.0
// O id do objeto dentro do Construct. É o ÚNICO lugar onde ele se escreve.
//
// Depois de publicado, NUNCA muda: mudar faz o Construct achar que é outro
// objeto e quebra todo projeto que já o usa (o nome que aparece pode mudar à
// vontade: é o "name" do lang/en-US.json).
//
// Para trocar ANTES de publicar: mude a linha abaixo e rode
// `npm run leitor:construct`. O montar.mjs leva o id novo a todo arquivo do
// addon e do exemplo que cita o velho (plugin.js, type.js, instance.js, os do
// c3runtime, addon.json, a chave do lang, o objeto e o addon do .c3p).
// 05/10/2026: em discussão com o Humberto (sugestão do Diretor: Bone_Leitor).
// Não troque sem a palavra dele.
export const ID_DO_ADDON = 'Recorte_Leitor';

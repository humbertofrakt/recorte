#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Faz o `aura.bone` do exemplo do Construct (rodada K5, 05/10/2026).
//
//   node leitor-construct/exemplo/fazer-aura.mjs
//
// Uma entidade feita para ser encaixada EM VOLTA do herói (o "Este boneco",
// spec 7.11 `around`): duas bolas rosa girando. A ordem dela é
//   bola_tras · meio · bola_frente
// e o slot "meio" (vazio) marca o meio: encaixada em volta de "meio", a
// bola_tras fica atrás do herói inteiro e a bola_frente na frente dele.
// A animação "girar" roda as duas em volta do centro, em 2 s.
//
// As bolas usam a imagem "hand_01" do atlas do herói, pintada de rosa (o atlas
// não tem imagem de bola, e o exemplo não mexe nele).

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const DESTINO = join(AQUI, 'heroi-andando', 'files', 'aura.bone');

const ROSA = [1, 0.45, 0.9, 0.9];

export function aura() {
  const bola = { type: 'region', path: 'hand_01', width: 24, height: 24, scaleX: 2.5, scaleY: 2.5, color: ROSA };
  return {
    bone: { version: '1.1', minVersion: '1.0', generator: 'leitor-construct/exemplo/fazer-aura.mjs' },
    skeleton: { name: 'aura' },
    assets: { atlases: ['heroi.atlas.json'], imagesBase: 'images/', audioBase: '', skeletonsBase: '' },
    bones: [
      { name: 'root' },
      { name: 'giro', parent: 'root' },
      { name: 'tras', parent: 'giro', x: 0, y: 70 },
      { name: 'frente', parent: 'giro', x: 0, y: -70 },
    ],
    slots: [
      { name: 'bola_tras', bone: 'tras', attachment: 'bola_tras' },
      { name: 'meio', bone: 'root' },
      { name: 'bola_frente', bone: 'frente', attachment: 'bola_frente' },
    ],
    skins: [{ name: 'default', attachments: { bola_tras: { bola_tras: bola }, bola_frente: { bola_frente: bola } } }],
    animations: [{
      name: 'girar',
      duration: 2,
      loop: true,
      timelines: [{
        type: 'bone', target: 'giro', property: 'rotation',
        keys: [{ time: 0, value: 0 }, { time: 1, value: 180 }, { time: 2, value: 360 }],
      }],
    }],
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  writeFileSync(DESTINO, JSON.stringify(aura(), null, 2) + '\n');
  process.stdout.write(`gravado ${DESTINO}\n`);
}

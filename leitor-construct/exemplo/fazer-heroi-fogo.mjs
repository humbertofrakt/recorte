#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Faz o `heroi-fogo.bone` do exemplo do Construct (rodada K6, 05/10/2026).
//
//   node leitor-construct/exemplo/fazer-heroi-fogo.mjs
//
// É o `formato/exemplos/heroi.bone` com UMA coisa a mais: a skin "fogo", que
// põe um emissor de faíscas na mão (slot novo "fogo", no osso do antebraço,
// mistura aditiva = brilho). Sem a skin, o slot fica vazio: o herói é o mesmo.
// No exemplo, a tecla F veste e tira essa skin — liga e desliga o fogo.
//
// Desde a K5, mais uma: o slot "aura", no tronco, com um PONTO (que não se
// desenha): é a tomada onde a tecla Q encaixa o `aura.bone` em volta do herói.
// Um slot que nunca mostra nada não recebe peça (o leitor avisa); o ponto dá
// a ele um placeholder, e o pino dele é a origem do osso.
//
// As faíscas usam a imagem "hand_01" do atlas do herói, pequena e pintada de
// laranja: o atlas não tem imagem de faísca, e o exemplo não mexe nele.
//
// O original em `formato/exemplos/` não é tocado.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const ORIGEM = join(AQUI, '..', '..', 'formato', 'exemplos', 'heroi.bone');
const DESTINO = join(AQUI, 'heroi-andando', 'files', 'heroi-fogo.bone');

export function heroiComFogo(heroi) {
  const doc = structuredClone(heroi);
  doc.extensionsUsed = [...new Set([...(doc.extensionsUsed ?? []), 'BONE_particles'])];
  doc.slots.push({ name: 'fogo', bone: 'forearm', attachment: 'faisca', blend: 'additive' });
  doc.slots.push({ name: 'aura', bone: 'torso', attachment: 'aura' });
  doc.skins.find((k) => k.name === 'default').attachments.aura = { aura: { type: 'point' } };
  doc.skins.push({
    name: 'fogo',
    attachments: {
      fogo: {
        faisca: {
          type: 'BONE_particle',
          path: 'hand_01',
          x: 40,
          seed: 7,
          rate: 45,
          lifetime: [0.4, 0.8],
          maxParticles: 80,
          looping: true,
          shape: 'circle',
          radius: 6,
          speed: [40, 90],
          direction: 90,
          spread: 25,
          gravity: [0, 120],
          drag: 1,
          angle: [0, 360],
          angularVelocity: [-180, 180],
          scale: [0.25, 0.45],
          scaleOverLifetime: [{ time: 0, value: 1 }, { time: 1, value: 0.2 }],
          startColor: [[1, 0.85, 0.3, 1], [1, 0.55, 0.1, 1]],
          colorOverLifetime: [{ time: 0, value: [1, 1, 1, 1] }, { time: 1, value: [1, 0.3, 0.1, 1] }],
          alphaOverLifetime: [{ time: 0, value: 1 }, { time: 1, value: 0 }],
          space: 'world',
        },
      },
    },
  });
  return doc;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const doc = heroiComFogo(JSON.parse(readFileSync(ORIGEM, 'utf8')));
  writeFileSync(DESTINO, JSON.stringify(doc, null, 2) + '\n');
  process.stdout.write(`gravado ${DESTINO}\n`);
}

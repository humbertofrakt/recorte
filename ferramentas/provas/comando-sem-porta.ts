/**
 * A lista que o Humberto lê: **o que o programa sabe fazer e não tem botão.**
 *
 * É a entrega visível do lote 1 do plano
 * `documentos/planos/COMO SABER O QUE O PROGRAMA TEM 2026-09-18.md`. Um vigia
 * não tem tela; o que ele tem para mostrar é a lista, e a lista tem de dar para
 * ler sem abrir código.
 *
 * ```
 * npm run portas                 escreve no ecrã
 * npm run portas -- --gravar     escreve também o documento em documentos/
 * ```
 *
 * **Uma régua só.** Este programa e o teste `menus.test.ts` chamam o MESMO
 * `commandsWithoutDoor` de `editor/src/ui/command-audit.ts`. Duas réguas — uma
 * para o teste e outra para o relatório — é o jeito de um dizer verde e o outro
 * dizer vermelho na mesma semana, e ninguém saber qual acreditar.
 *
 * Roda por `vite-node`, porque a régua é TypeScript e não há uma segunda cópia
 * dela em `.mjs`.
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { resolve, join, relative, sep, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  EXEMPT_COMMANDS, commandDefs, commandsWithoutDoor,
} from '../../editor/src/ui/command-audit.js';
import type { CommandDef } from '../../editor/src/ui/command-audit.js';

const AQUI = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(AQUI, '../../editor/src');

/** O texto de cada `.ts` de `editor/src`, pela chave relativa com `/`. */
function sources(): Map<string, string> {
  const out = new Map<string, string>();
  const pilha = [SRC];
  while (pilha.length > 0) {
    const dir = pilha.pop()!;
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) pilha.push(full);
      else if (full.endsWith('.ts') && !full.endsWith('.d.ts')) {
        out.set(relative(SRC, full).split(sep).join('/'), readFileSync(full, 'utf8'));
      }
    }
  }
  return out;
}

/** A data da máquina, `2026-09-22` — regra 20: nunca o cabeçalho de outro. */
function hoje(): string {
  const d = new Date();
  const p = (n: number): string => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function agora(): string {
  const d = new Date();
  const p = (n: number): string => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
}

const FEITIO: Record<CommandDef['kind'], string> = {
  classe: 'comando',
  fabrica: 'fábrica de comando',
  mutador: 'mexida no arquivo',
};

function relatorio(): string {
  const fontes = sources();
  const defs = commandDefs(fontes);
  const semLista = commandsWithoutDoor(fontes, defs, []);
  const sobraram = commandsWithoutDoor(fontes, defs);
  const porNome = new Map(semLista.map((c) => [c.command, c]));

  const linhas: string[] = [];
  linhas.push(`# O que o programa sabe fazer e não tem botão — ${hoje()}`);
  linhas.push('');
  linhas.push(`Gerado por \`npm run portas\`, às ${agora()}. **Não escrever à mão:** o`);
  linhas.push('arquivo é lido do código a cada vez, e o que se escrever aqui se perde na');
  linhas.push('próxima medição. A régua é `editor/src/ui/command-audit.ts`, a mesma do teste.');
  linhas.push('');
  linhas.push('## Em números');
  linhas.push('');
  linhas.push('| Medida | Número |');
  linhas.push('|:---|---:|');
  linhas.push(`| Arquivos de \`editor/src\` lidos | ${fontes.size} |`);
  linhas.push(`| Coisas que editam o documento | ${defs.length} |`);
  linhas.push(`| Delas, **sem porta** | ${semLista.length} |`);
  linhas.push(`| Com motivo escrito | ${semLista.length - sobraram.length} |`);
  linhas.push(`| **Sem motivo escrito** (o teste fica vermelho) | ${sobraram.length} |`);
  linhas.push('');

  if (sobraram.length > 0) {
    linhas.push('## Estas não têm porta NEM motivo — é o que o teste acusa');
    linhas.push('');
    linhas.push('| O quê | Feitio | Onde está |');
    linhas.push('|:---|:---|:---|');
    for (const c of sobraram) {
      linhas.push(`| \`${c.command}\` | ${FEITIO[c.kind]} | \`${c.where}\` |`);
    }
    linhas.push('');
  }

  linhas.push('## As que faltam de verdade — falta decidir onde entram');
  linhas.push('');
  linhas.push('Estas o programa sabe fazer, e **não há botão nenhum** que as chame. O motivo');
  linhas.push('diz que a porta ainda não foi decidida: quem decide é o Humberto.');
  linhas.push('');
  linhas.push('| O quê | Onde está | O que faria |');
  linhas.push('|:---|:---|:---|');
  for (const item of EXEMPT_COMMANDS) {
    if (!item.why.startsWith('FUNÇÃO SEM PORTA')) continue;
    const onde = porNome.get(item.command)?.where ?? '—';
    const texto = item.why.replace('FUNÇÃO SEM PORTA: ', '');
    linhas.push(`| \`${item.command}\` | \`${onde}\` | ${texto} |`);
  }
  linhas.push('');

  linhas.push('## As que NÃO precisam de porta, e por quê');
  linhas.push('');
  linhas.push('| O quê | Onde está | Por que não precisa |');
  linhas.push('|:---|:---|:---|');
  for (const item of EXEMPT_COMMANDS) {
    if (item.why.startsWith('FUNÇÃO SEM PORTA')) continue;
    const onde = porNome.get(item.command)?.where ?? '—';
    linhas.push(`| \`${item.command}\` | \`${onde}\` | ${item.why} |`);
  }
  linhas.push('');

  linhas.push('## O que esta lista NÃO diz');
  linhas.push('');
  linhas.push('| Não diz | Por quê |');
  linhas.push('|:---|:---|');
  linhas.push('| que um MENU chama o comando | ela prova que algum arquivo do programa o constrói, e nada além. Quem prova o menu é o `hiddenFunctions` ao lado |');
  linhas.push('| que alguém ACHA a porta | porta que ninguém encontra é porta que não conta, e isso só a mão do Humberto mede |');
  linhas.push('| que o botão faz o que o nome dele diz | nenhum inventário pega isso. Só alguém usando |');
  linhas.push('');
  return linhas.join('\n');
}

const texto = relatorio();
process.stdout.write(`${texto}\n`);

if (process.argv.includes('--gravar')) {
  const caminho = resolve(AQUI, '../..', 'documentos', `O QUE NAO TEM PORTA ${hoje()}.md`);
  writeFileSync(caminho, `${texto}\n`, 'utf8');
  process.stdout.write(`\n[gravado] ${caminho}\n`);
}

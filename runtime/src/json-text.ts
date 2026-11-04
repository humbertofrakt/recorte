// SPDX-License-Identifier: Apache-2.0
/**
 * Text-level checks of spec 2.1 that `JSON.parse` cannot do: a leading BOM
 * is accepted (and removed), and a duplicate key inside one object is found
 * and reported with its JSON Pointer (L0). The scanner only tracks structure;
 * `JSON.parse` still validates the syntax afterwards.
 */

/** Removes a leading UTF-8 BOM (U+FEFF). */
export function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

export interface DuplicateKey {
  /** JSON Pointer of the duplicated member (the second occurrence). */
  pointer: string;
  key: string;
}

interface Frame {
  kind: 'object' | 'array';
  pointer: string;
  keys: Set<string> | null;
  /** Object: name of the member whose value comes next. Array: index of the next element. */
  currentKey: string;
  index: number;
  expectKey: boolean;
}

function escapeSegment(segment: string): string {
  return segment.replace(/~/g, '~0').replace(/\//g, '~1');
}

/**
 * Finds the first duplicated key of any object in `text`, or `null`.
 * Malformed text never throws here: the scanner gives up (returns `null`)
 * and leaves the syntax error to `JSON.parse`.
 */
export function findDuplicateKey(text: string): DuplicateKey | null {
  const stack: Frame[] = [];
  const n = text.length;
  let i = 0;
  const top = (): Frame | undefined => stack[stack.length - 1];
  const childPointer = (): string => {
    const f = top();
    if (f === undefined) return '';
    return f.kind === 'object' ? f.pointer + '/' + escapeSegment(f.currentKey) : f.pointer + '/' + f.index;
  };

  while (i < n) {
    const ch = text[i];
    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') { i++; continue; }
    if (ch === '{' || ch === '[') {
      const pointer = childPointer();
      stack.push({ kind: ch === '{' ? 'object' : 'array', pointer, keys: ch === '{' ? new Set() : null, currentKey: '', index: 0, expectKey: ch === '{' });
      i++;
      continue;
    }
    if (ch === '}' || ch === ']') {
      if (stack.length === 0) return null;
      stack.pop();
      i++;
      continue;
    }
    if (ch === '"') {
      const end = scanString(text, i);
      if (end < 0) return null;
      const f = top();
      if (f !== undefined && f.kind === 'object' && f.expectKey) {
        let key: string;
        try {
          key = JSON.parse(text.slice(i, end)) as string;
        } catch {
          return null;
        }
        if (f.keys!.has(key)) return { pointer: f.pointer + '/' + escapeSegment(key), key };
        f.keys!.add(key);
        f.currentKey = key;
        f.expectKey = false;
      }
      i = end;
      continue;
    }
    if (ch === ',') {
      const f = top();
      if (f !== undefined) {
        if (f.kind === 'object') f.expectKey = true;
        else f.index++;
      }
      i++;
      continue;
    }
    if (ch === ':') { i++; continue; }
    // number, true, false, null: skip to the next delimiter
    while (i < n) {
      const c = text[i];
      if (c === ',' || c === '}' || c === ']' || c === ' ' || c === '\t' || c === '\n' || c === '\r') break;
      i++;
    }
  }
  return null;
}

/** Index just past the closing quote of the string starting at `start`, or `-1`. */
function scanString(text: string, start: number): number {
  let i = start + 1;
  const n = text.length;
  while (i < n) {
    const c = text[i];
    if (c === '\\') { i += 2; continue; }
    if (c === '"') return i + 1;
    i++;
  }
  return -1;
}

/**
 * JSON Pointer (RFC 6901) helpers for the right-hand panels.
 *
 * Every panel field edits the `.bone` JSON through a pointer, so the panel code
 * never needs to know the shape of the document: it reads a pointer and writes
 * a pointer. That keeps the "the document IS the file" principle of the
 * contract literal — there is no intermediate model to keep in sync.
 */

/** Escapes one pointer token: `~` becomes `~0` and `/` becomes `~1`. */
export function escapeToken(token: string): string {
  return token.replace(/~/g, '~0').replace(/\//g, '~1');
}

/** Reverses `escapeToken`. `~1` first, so `~01` decodes to `~1`. */
export function unescapeToken(token: string): string {
  return token.replace(/~1/g, '/').replace(/~0/g, '~');
}

/** Builds a pointer from tokens: `pointerOf('bones', 2, 'x')` -> `/bones/2/x`. */
export function pointerOf(...tokens: Array<string | number>): string {
  return tokens.map((token) => `/${escapeToken(String(token))}`).join('');
}

/** Splits a pointer into decoded tokens. The empty pointer is the root. */
export function parsePointer(pointer: string): string[] {
  if (pointer === '') return [];
  if (!pointer.startsWith('/')) {
    throw new Error(`JSON Pointer inválido: ${pointer}`);
  }
  return pointer.slice(1).split('/').map(unescapeToken);
}

type Bag = Record<string, unknown>;

function isContainer(value: unknown): value is Bag {
  return value !== null && typeof value === 'object';
}

/** Reads a pointer. Returns `undefined` when any step is missing. */
export function getAtPointer(root: unknown, pointer: string): unknown {
  let node: unknown = root;
  for (const token of parsePointer(pointer)) {
    if (!isContainer(node)) return undefined;
    node = node[token];
  }
  return node;
}

/** `true` when the pointer resolves to a property that actually exists. */
export function hasAtPointer(root: unknown, pointer: string): boolean {
  const tokens = parsePointer(pointer);
  if (tokens.length === 0) return root !== undefined;
  let node: unknown = root;
  for (let i = 0; i < tokens.length - 1; i++) {
    if (!isContainer(node)) return false;
    node = node[tokens[i]!];
  }
  return isContainer(node) && Object.prototype.hasOwnProperty.call(node, tokens[tokens.length - 1]!);
}

/**
 * Writes a pointer, creating missing containers on the way.
 *
 * Writing `undefined` deletes the property, which is how a field goes back to
 * "absent, use the format default". Returns the pointers of the containers it
 * had to create, so an undo can remove them again.
 */
export function setAtPointer(root: unknown, pointer: string, value: unknown): string[] {
  const tokens = parsePointer(pointer);
  if (tokens.length === 0) throw new Error('Não dá para escrever na raiz do documento.');
  if (!isContainer(root)) throw new Error('Documento inválido.');

  const created: string[] = [];
  let node: Bag = root;
  for (let i = 0; i < tokens.length - 1; i++) {
    const token = tokens[i]!;
    let next = node[token];
    if (!isContainer(next)) {
      next = /^\d+$/.test(tokens[i + 1]!) ? [] : {};
      node[token] = next;
      created.push(pointerOf(...tokens.slice(0, i + 1)));
    }
    node = next as Bag;
  }

  const last = tokens[tokens.length - 1]!;
  if (value === undefined) delete node[last];
  else node[last] = value;
  return created;
}

/** Removes the property a pointer names. Missing properties are ignored. */
export function deleteAtPointer(root: unknown, pointer: string): void {
  const tokens = parsePointer(pointer);
  if (tokens.length === 0) return;
  let node: unknown = root;
  for (let i = 0; i < tokens.length - 1; i++) {
    if (!isContainer(node)) return;
    node = node[tokens[i]!];
  }
  if (isContainer(node)) delete node[tokens[tokens.length - 1]!];
}

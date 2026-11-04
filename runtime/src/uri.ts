// SPDX-License-Identifier: Apache-2.0
/**
 * `uri` rules of spec 2.8 (also applied to attachment `path` and sequence
 * frame names by spec 7.2). Everything is checked AFTER percent-decoding
 * (rule 8), except the reserved encoded bytes that are invalid even encoded.
 *
 * Rules:
 * 1. relative only: no leading `/`, no scheme (`C:/`, `file:`, `http:`);
 * 2. separator is `/`; backslash is invalid;
 * 3. no `.` or `..` segments;
 * 4. percent-encoding must decode;
 * 6. `data:` only where the caller allows it (`page.image`);
 * 7. at most 1024 code points;
 * 8. `%2F`, `%5C`, `%00`, `%3A` and encoded control bytes are invalid;
 *    `:` is invalid in any position (which also covers rule 1 schemes).
 */

export const URI_MAX_LENGTH = 1024;

export interface UriOptions {
  /** Accept `data:` URIs (spec 2.8 rule 6: only `page.image`). Default `false`. */
  allowData?: boolean;
  /** Accept the empty string (the default of `assets.*Base`). Default `false`. */
  allowEmpty?: boolean;
}

const RESERVED_ENCODED = /%(2f|5c|00|3a|0[0-9a-f]|1[0-9a-f]|7f)/i;

/**
 * Checks `value` against the rules above. Returns `null` when valid, or a
 * short English reason when not.
 */
export function validateUri(value: string, options: UriOptions = {}): string | null {
  if (value.length === 0) return options.allowEmpty === true ? null : 'uri is empty';
  if (/^data:/i.test(value)) return options.allowData === true ? null : '"data:" uri is not allowed here (spec 2.8 rule 6)';
  if (codePointLength(value) > URI_MAX_LENGTH) return `uri longer than ${URI_MAX_LENGTH} code points (spec 2.8 rule 7)`;

  const reserved = RESERVED_ENCODED.exec(value);
  if (reserved !== null) return `uri contains the reserved encoded byte "${reserved[0]}" (spec 2.8 rule 8)`;

  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return 'uri has an invalid percent-encoding (spec 2.8 rule 4)';
  }

  if (decoded.includes('\\')) return 'uri contains a backslash; the separator is "/" (spec 2.8 rule 2)';
  if (decoded.includes(':')) return 'uri contains ":" (absolute path or scheme, spec 2.8 rules 1 and 8)';
  if (decoded.startsWith('/')) return 'uri is absolute; it must be relative (spec 2.8 rule 1)';
  for (let i = 0; i < decoded.length; i++) {
    const c = decoded.charCodeAt(i);
    if (c < 0x20 || c === 0x7f) return 'uri contains a control character (spec 2.8 rule 8)';
  }
  const segments = decoded.split('/');
  for (const s of segments) {
    if (s === '.' || s === '..') return `uri contains the segment "${s}" (spec 2.8 rule 3)`;
  }
  return null;
}

/** `true` when `validateUri` finds no problem. */
export function isValidUri(value: string, options: UriOptions = {}): boolean {
  return validateUri(value, options) === null;
}

/**
 * `base + name` join of spec 2.8: inserts `/` when `base` is not empty and
 * does not end with one. Both parts are used as written (no decoding).
 */
export function joinUri(base: string, name: string): string {
  if (base.length === 0) return name;
  return base.endsWith('/') ? base + name : base + '/' + name;
}

function codePointLength(s: string): number {
  let n = 0;
  for (const _ of s) n++;
  return n;
}

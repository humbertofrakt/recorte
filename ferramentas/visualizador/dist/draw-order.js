// SPDX-License-Identifier: Apache-2.0
/**
 * The draw-order offset algorithm of spec 9.5, over an arbitrary base order.
 *
 * `base` is the slot indices in the order the offsets are measured from: the
 * `slots` array order for a loader check, or the skeleton's base order (spec
 * 4.4: array order plus the `drawOrder` of the active skins) at runtime. Each
 * entry moves `slot` from its position in `base` by `offset`; the holes are
 * filled, in base order, with the slots nobody cited. Out-of-range targets
 * are clamped and a later entry wins a collision, as the loader warns.
 */
export function orderFromOffsets(base, entries) {
    const n = base.length;
    const out = new Array(n).fill(-1);
    const position = new Int32Array(n);
    for (let i = 0; i < n; i++)
        position[base[i]] = i;
    const cited = new Uint8Array(n);
    for (let i = 0; i < entries.length; i++) {
        const e = entries[i];
        if (e.slot < 0 || e.slot >= n)
            continue;
        let target = position[e.slot] + Math.trunc(e.offset);
        if (target < 0)
            target = 0;
        else if (target >= n)
            target = n - 1;
        const previous = out[target];
        if (previous !== -1)
            cited[previous] = 0;
        out[target] = e.slot;
        cited[e.slot] = 1;
    }
    let j = 0;
    for (let i = 0; i < n; i++) {
        if (out[i] !== -1)
            continue;
        while (j < n && cited[base[j]] === 1)
            j++;
        out[i] = base[j];
        j++;
    }
    return out;
}

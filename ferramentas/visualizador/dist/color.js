// SPDX-License-Identifier: Apache-2.0
/**
 * Final color of a drawn attachment (spec 7.12): `light = slot.color x
 * attachment.color` (components clamped to `[0, 1]` first), `dark =
 * slot.darkColor` or black. Blend factors per mode are listed for renderers.
 */
export function createFinalColor() {
    return { light: new Float64Array(4), dark: new Float64Array(3), tintBlack: false };
}
function unit(v) {
    return v < 0 ? 0 : v > 1 ? 1 : v;
}
/** Computes the `light` / `dark` of spec 7.12 for `slot` showing `attachment`. */
export function computeFinalColor(slot, attachment, out = createFinalColor()) {
    const sc = slot.color;
    const ac = attachment.color;
    for (let i = 0; i < 4; i++)
        out.light[i] = unit(sc[i]) * unit(ac[i]);
    const dark = slot.darkColor;
    out.tintBlack = dark !== null;
    for (let i = 0; i < 3; i++)
        out.dark[i] = dark === null ? 0 : unit(dark[i]);
    return out;
}
/**
 * Applies spec 7.12 to one texel (straight alpha `tex`, or premultiplied when
 * `premultiplied`). Writes `[r, g, b, a]` into `out`.
 */
export function shadeTexel(tex, color, premultiplied, out = new Float64Array(4)) {
    const l = color.light;
    const d = color.dark;
    const a = tex[3];
    if (!premultiplied) {
        for (let i = 0; i < 3; i++)
            out[i] = tex[i] * l[i] + (1 - tex[i]) * d[i];
    }
    else {
        for (let i = 0; i < 3; i++)
            out[i] = tex[i] * l[i] * l[3] + (a - tex[i]) * d[i] * l[3];
    }
    out[3] = a * l[3];
    return out;
}
const STRAIGHT = {
    normal: { src: 'SRC_ALPHA', dst: 'ONE_MINUS_SRC_ALPHA' },
    additive: { src: 'SRC_ALPHA', dst: 'ONE' },
    multiply: { src: 'DST_COLOR', dst: 'ONE_MINUS_SRC_ALPHA' },
    screen: { src: 'ONE', dst: 'ONE_MINUS_SRC_COLOR' },
};
const PREMULTIPLIED = {
    normal: { src: 'ONE', dst: 'ONE_MINUS_SRC_ALPHA' },
    additive: { src: 'ONE', dst: 'ONE' },
    multiply: { src: 'DST_COLOR', dst: 'ONE_MINUS_SRC_ALPHA' },
    screen: { src: 'ONE', dst: 'ONE_MINUS_SRC_COLOR' },
};
export function blendFactors(mode, premultiplied) {
    return (premultiplied ? PREMULTIPLIED : STRAIGHT)[mode] ?? STRAIGHT.normal;
}

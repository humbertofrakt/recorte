// SPDX-License-Identifier: Apache-2.0
/**
 * Animations and skins that come from other files (spec 2.8), folded into the
 * host BEFORE it is loaded.
 *
 * The host is built once, with everything inside (spec 2.8: "o corpo é
 * montado uma vez"). So the composition happens on the JSON tree, not on the
 * loaded classes: the loader then sees one ordinary file, and every rule it
 * already follows — parents before children, names resolved once, skins
 * resolved by name — holds for what came from outside as well.
 *
 * From a file in `assets.skins` (F23):
 *   - `skins[]` by name; a local name wins (L2 `EXTERNAL_DUPLICATE`), and
 *     between two external files the first one wins;
 *   - `bones[]` with `skinRequired: true`, at the END of `bones`, in file
 *     order, whose `parent` must be a `rig.bones` name or another bone the same
 *     file brings; a bone without `skinRequired` is ignored with L2
 *     `EXTERNAL_BONE_NOT_SKIN` (the mandatory root bone of the file, silently);
 *   - `slots[]` at the end of `slots`;
 *   - `constraints[]` with `skinRequired: true` at the end of `constraints`.
 *
 * From a file in `assets.animations`:
 *   - `animations[]` by name, local wins; everything else is ignored;
 *   - `rig.reference` (F24): `k = host.bones[bone].length / reference.length`
 *     multiplies every `value` and every Bezier `cy` of the `bone` timelines
 *     with property `x` or `y`. No reference, `k = 1`.
 *
 * Both kinds: the `rig` of the external file is checked against the host, one
 * L2 `RIG_UNMET` per name the host lacks; a file that has its own
 * `assets.animations` or `assets.skins` is L1 `EXTERNAL_CHAIN` and its lists
 * are ignored (depth is always 1). A missing file is never fatal.
 *
 * Pure: no I/O. The caller hands a reader that turns an entry name into a
 * decoded tree (or `null` when the file is not there).
 */
import { joinUri } from './uri.js';
function isObj(v) {
    return typeof v === 'object' && v !== null && !Array.isArray(v);
}
function strings(v) {
    return Array.isArray(v) ? v.filter((s) => typeof s === 'string') : [];
}
function objects(v) {
    return Array.isArray(v) ? v.filter(isObj) : [];
}
function nameOf(o) {
    return typeof o['name'] === 'string' ? o['name'] : null;
}
/** Folder part of an entry name, `""` at the root (spec 2.8). */
export function folderOfEntry(name) {
    const cut = name.lastIndexOf('/');
    return cut < 0 ? '' : name.slice(0, cut);
}
/**
 * Folds `assets.skins` and `assets.animations` of `tree` into it (spec 2.8).
 * `base` is the folder the host file sits in; every `uri` is resolved as
 * `base + skeletonsBase + uri`.
 */
export function composeExternals(tree, base, read) {
    const warnings = [];
    const missing = [];
    const externalAnimations = new Set();
    const skinOrigins = new Map();
    const nothing = { tree, externalAnimations, skinOrigins, warnings, missing };
    if (!isObj(tree))
        return nothing;
    const assets = isObj(tree['assets']) ? tree['assets'] : {};
    const skinUris = strings(assets['skins']);
    const animationUris = strings(assets['animations']);
    if (skinUris.length === 0 && animationUris.length === 0)
        return nothing;
    const root = { ...tree };
    const bones = objects(tree['bones']).slice();
    const slots = objects(tree['slots']).slice();
    const constraints = objects(tree['constraints']).slice();
    const skins = objects(tree['skins']).slice();
    const animations = objects(tree['animations']).slice();
    const skeletonsBase = typeof assets['skeletonsBase'] === 'string' ? assets['skeletonsBase'] : '';
    const names = (list) => new Set(list.map(nameOf).filter((n) => n !== null));
    const boneNames = names(bones);
    const slotNames = names(slots);
    const constraintNames = names(constraints);
    const localSkins = names(skins);
    const localAnimations = names(animations);
    const externalSkins = new Set();
    const externalAnimationNames = new Set();
    const open = (uri, list) => {
        const entry = joinUri(base, joinUri(skeletonsBase, uri));
        let file;
        try {
            file = read(entry);
        }
        catch (error) {
            warnings.push(`EXTERNAL_UNREADABLE: não deu para ler "${entry}" (assets.${list}): ${error instanceof Error ? error.message : String(error)}`);
            return null;
        }
        if (file === null || file === undefined) {
            missing.push(entry);
            warnings.push(`EXTERNAL_MISSING: o arquivo "${entry}" de assets.${list} não foi achado; o que ele traria fica de fora (2.8)`);
            return null;
        }
        if (!isObj(file)) {
            warnings.push(`EXTERNAL_UNREADABLE: "${entry}" (assets.${list}) não é um arquivo .bone`);
            return null;
        }
        const ext = isObj(file['assets']) ? file['assets'] : {};
        if (strings(ext['animations']).length > 0 || strings(ext['skins']).length > 0) {
            warnings.push(`EXTERNAL_CHAIN: "${entry}" tem assets.animations ou assets.skins próprios; as listas dele são ignoradas (2.8, profundidade 1)`);
        }
        return { entry, file };
    };
    const checkRig = (entry, rig) => {
        for (const bone of strings(rig['bones'])) {
            if (!boneNames.has(bone))
                warnings.push(`RIG_UNMET: "${entry}" exige o osso "${bone}", que este corpo não tem (4.8)`);
        }
        for (const slot of strings(rig['slots'])) {
            if (!slotNames.has(slot))
                warnings.push(`RIG_UNMET: "${entry}" exige o slot "${slot}", que este corpo não tem (4.8)`);
        }
    };
    // Skins first: a bone a skin brings is a bone of the host from then on, and
    // the `rig.reference` of an animations file may name it.
    for (const uri of skinUris) {
        const opened = open(uri, 'skins');
        if (opened === null)
            continue;
        const { entry, file } = opened;
        const rig = isObj(file['rig']) ? file['rig'] : {};
        checkRig(entry, rig);
        if (isObj(rig['reference']))
            warnings.push(`RIG_REFERENCE_IGNORED: "${entry}" é uma pele; rig.reference só vale num arquivo de animações (4.8)`);
        const rigBones = new Set(strings(rig['bones']));
        const brought = new Set();
        objects(file['bones']).forEach((bone, index) => {
            const name = nameOf(bone);
            if (name === null)
                return;
            if (bone['skinRequired'] !== true) {
                if (index !== 0)
                    warnings.push(`EXTERNAL_BONE_NOT_SKIN: o osso "${name}" de "${entry}" não é skinRequired; ignorado (2.8)`);
                return;
            }
            if (boneNames.has(name)) {
                warnings.push(`EXTERNAL_DUPLICATE: o osso "${name}" de "${entry}" já existe aqui; vale o daqui (2.8)`);
                return;
            }
            const parent = typeof bone['parent'] === 'string' ? bone['parent'] : null;
            if (parent === null || !(rigBones.has(parent) || brought.has(parent))) {
                warnings.push(`REF_BONE_MISSING: o pai "${parent ?? ''}" do osso "${name}" de "${entry}" não está no rig nem é trazido pela pele (2.8)`);
            }
            bones.push({ ...bone });
            boneNames.add(name);
            brought.add(name);
        });
        for (const slot of objects(file['slots'])) {
            const name = nameOf(slot);
            if (name === null)
                continue;
            if (slotNames.has(name)) {
                warnings.push(`EXTERNAL_DUPLICATE: o slot "${name}" de "${entry}" já existe aqui; vale o daqui (2.8)`);
                continue;
            }
            slots.push({ ...slot });
            slotNames.add(name);
        }
        for (const constraint of objects(file['constraints'])) {
            const name = nameOf(constraint);
            if (name === null)
                continue;
            if (constraint['skinRequired'] !== true) {
                warnings.push(`EXTERNAL_BONE_NOT_SKIN: a regra "${name}" de "${entry}" não é skinRequired; ignorada (2.8)`);
                continue;
            }
            if (constraintNames.has(name)) {
                warnings.push(`EXTERNAL_DUPLICATE: a regra "${name}" de "${entry}" já existe aqui; vale a daqui (2.8)`);
                continue;
            }
            constraints.push({ ...constraint });
            constraintNames.add(name);
        }
        const fileAssets = isObj(file['assets']) ? file['assets'] : {};
        const origin = {
            entry,
            folder: folderOfEntry(entry),
            skeletonsBase: typeof fileAssets['skeletonsBase'] === 'string' ? fileAssets['skeletonsBase'] : '',
            atlases: strings(fileAssets['atlases']),
        };
        // Appendix C rule 8: `binding.bones` of a weighted attachment are indices
        // into the SKIN file's bones. In the body the indices are others, so each
        // one is translated by the bone's NAME; a name the body lacks goes to
        // index 0 with `RIG_UNMET`.
        const fileBones = objects(file['bones']).map(nameOf);
        const translate = (skin) => translateBindings(skin, fileBones, bones.map(nameOf), entry, warnings);
        for (const rawSkin of objects(file['skins'])) {
            const skin = translate(rawSkin);
            const name = nameOf(skin);
            if (name === null)
                continue;
            if (localSkins.has(name)) {
                warnings.push(`EXTERNAL_DUPLICATE: a skin "${name}" de "${entry}" já existe aqui; vale a daqui (2.8)`);
                continue;
            }
            if (externalSkins.has(name)) {
                warnings.push(`EXTERNAL_DUPLICATE: a pele "${name}" de "${entry}" já veio de outro arquivo; vale a primeira (2.8)`);
                continue;
            }
            skins.push(skin);
            externalSkins.add(name);
            skinOrigins.set(name, origin);
        }
    }
    for (const uri of animationUris) {
        const opened = open(uri, 'animations');
        if (opened === null)
            continue;
        const { entry, file } = opened;
        const rig = isObj(file['rig']) ? file['rig'] : {};
        checkRig(entry, rig);
        const k = referenceFactor(entry, rig, bones, warnings);
        for (const animation of objects(file['animations'])) {
            const name = nameOf(animation);
            if (name === null)
                continue;
            if (localAnimations.has(name)) {
                warnings.push(`EXTERNAL_DUPLICATE: a animação "${name}" de "${entry}" já existe aqui; vale a daqui (2.8)`);
                continue;
            }
            if (externalAnimationNames.has(name)) {
                warnings.push(`EXTERNAL_DUPLICATE: a animação "${name}" de "${entry}" já veio de outro arquivo; vale a primeira (2.8)`);
                continue;
            }
            const copy = k === 1 ? animation : scaleTranslations(animation, k);
            animations.push(copy);
            externalAnimations.add(copy);
            externalAnimationNames.add(name);
        }
    }
    root['bones'] = bones;
    if (slots.length > 0 || tree['slots'] !== undefined)
        root['slots'] = slots;
    if (constraints.length > 0 || tree['constraints'] !== undefined)
        root['constraints'] = constraints;
    if (skins.length > 0 || tree['skins'] !== undefined)
        root['skins'] = skins;
    if (animations.length > 0 || tree['animations'] !== undefined)
        root['animations'] = animations;
    return { tree: root, externalAnimations, skinOrigins, warnings, missing };
}
/**
 * Copy of a skin whose weighted attachments have `binding.bones` translated
 * from the indices of the file the skin came from to the indices of the body,
 * by bone name (Appendix C rule 8). The original object is never mutated; a
 * skin with no weighted attachment is returned as is.
 */
export function translateBindings(skin, fileBones, hostBones, entry, warnings = []) {
    const attachments = skin['attachments'];
    if (!isObj(attachments))
        return skin;
    let changed = false;
    const outSlots = {};
    for (const [slot, placeholders] of Object.entries(attachments)) {
        if (!isObj(placeholders)) {
            outSlots[slot] = placeholders;
            continue;
        }
        const outPlaceholders = {};
        for (const [placeholder, att] of Object.entries(placeholders)) {
            const binding = isObj(att) ? att['binding'] : undefined;
            if (!isObj(att) || !isObj(binding) || !Array.isArray(binding['bones'])) {
                outPlaceholders[placeholder] = att;
                continue;
            }
            const translated = binding['bones'].map((index) => {
                if (typeof index !== 'number')
                    return index;
                const boneName = fileBones[index] ?? null;
                const hostIndex = boneName === null ? -1 : hostBones.indexOf(boneName);
                if (hostIndex < 0) {
                    const message = `RIG_UNMET: o osso ${boneName === null ? `de índice ${index}` : `"${boneName}"`} do binding de "${placeholder}" (${entry}) não existe neste corpo; vai para o índice 0 (2.8)`;
                    if (!warnings.includes(message))
                        warnings.push(message);
                    return 0;
                }
                return hostIndex;
            });
            outPlaceholders[placeholder] = { ...att, binding: { ...binding, bones: translated } };
            changed = true;
        }
        outSlots[slot] = outPlaceholders;
    }
    return changed ? { ...skin, attachments: outSlots } : skin;
}
/**
 * `k` of `rig.reference` (spec 2.8, F24): `host.bones[bone].length /
 * reference.length`. `1` without a reference, when the host lacks the bone or
 * its length is zero (L2 `RIG_UNMET`), or when `reference.length <= 0`
 * (L1 `RIG_REFERENCE`).
 */
export function referenceFactor(entry, rig, hostBones, warnings = []) {
    const ref = rig['reference'];
    if (!isObj(ref))
        return 1;
    const boneName = typeof ref['bone'] === 'string' ? ref['bone'] : '';
    const length = typeof ref['length'] === 'number' ? ref['length'] : 0;
    if (!(length > 0)) {
        warnings.push(`RIG_REFERENCE: rig.reference.length de "${entry}" tem de ser > 0; k = 1 (4.8)`);
        return 1;
    }
    const host = hostBones.find((b) => nameOf(b) === boneName);
    const hostLength = host !== undefined && typeof host['length'] === 'number' ? host['length'] : 0;
    if (host === undefined || hostLength === 0) {
        warnings.push(`RIG_UNMET: o osso "${boneName}" de rig.reference de "${entry}" não existe aqui ou tem length 0; k = 1 (2.8)`);
        return 1;
    }
    return hostLength / length;
}
/**
 * Copy of an animation with every `value` and every Bezier `cy` of the `bone`
 * timelines `x` and `y` multiplied by `k` (spec 2.8). Rotation, scale and
 * shear are untouched; the original object is never mutated.
 */
export function scaleTranslations(animation, k) {
    const timelines = Array.isArray(animation['timelines']) ? animation['timelines'] : [];
    return {
        ...animation,
        timelines: timelines.map((tl) => {
            if (!isObj(tl) || tl['type'] !== 'bone' || (tl['property'] !== 'x' && tl['property'] !== 'y'))
                return tl;
            const keys = Array.isArray(tl['keys']) ? tl['keys'] : [];
            return {
                ...tl,
                keys: keys.map((key) => {
                    if (!isObj(key))
                        return key;
                    const out = { ...key };
                    if (typeof key['value'] === 'number')
                        out['value'] = key['value'] * k;
                    const curve = key['curve'];
                    if (Array.isArray(curve)) {
                        // `[cx1, cy1, cx2, cy2]` per component (spec 9.3): the `cy` are values.
                        out['curve'] = curve.map((c, i) => (typeof c === 'number' && i % 2 === 1 ? c * k : c));
                    }
                    return out;
                }),
            };
        }),
    };
}

// SPDX-License-Identifier: Apache-2.0
/**
 * One door in for the three encodings of the format (spec 1.2).
 *
 * A game does not want to know whether the artist shipped `.bone`, `.boneb` or
 * `.bonez`: it wants a `SkeletonData`. `loadSkeletonFile` takes the raw bytes,
 * looks at the first few of them, and does the right thing.
 *
 *   `PK\x03\x04`  -> `.bonez`, a ZIP package (spec 2.9)
 *   `\x89BONE`    -> `.boneb`, the binary layout (spec 11)
 *   anything else -> `.bone`, UTF-8 JSON text (spec 2.1)
 *
 * For a package, the atlases named in the manifest are read out of the ZIP and
 * loaded too, with `uri` resolved by the rule of spec 2.8: relative to the
 * folder of the main skeleton inside the package. So a package opens with its
 * regions already resolved, without the caller touching a single entry.
 *
 * The binary reader and the ZIP reader live in `runtime/src/binario/`.
 * They are plain TypeScript with no Node and no DOM in them, so the same code
 * serves the runtime, the editor and the command line.
 */
import { loadAtlas, loadSkeletonData, parseBoneText, LoadError } from './loader.js';
import { SkeletonAttachment } from './attachments/skeleton-attachment.js';
import { MAX_NESTED_DEPTH } from './nested.js';
import { joinUri } from './uri.js';
import { composeExternals, folderOfEntry } from './externos.js';
import { readBoneb } from './binario/ler.js';
import { readBonez, readBonezAsync } from './binario/bonez.js';
/** First bytes of a `.boneb` file (spec 11.2). */
const BONEB_SIGNATURE = [0x89, 0x42, 0x4f, 0x4e, 0x45, 0x0d, 0x0a, 0x1a];
/** First bytes of any ZIP local header, so of any `.bonez` (spec 2.9). */
const ZIP_SIGNATURE = [0x50, 0x4b, 0x03, 0x04];
function startsWith(bytes, signature) {
    if (bytes.length < signature.length)
        return false;
    for (let i = 0; i < signature.length; i++) {
        if (bytes[i] !== signature[i])
            return false;
    }
    return true;
}
/**
 * Says which encoding these bytes are, by their first bytes alone — never by
 * the file name, which a download or an upload is free to change.
 */
export function detectEncoding(bytes) {
    if (startsWith(bytes, ZIP_SIGNATURE))
        return 'bonez';
    if (startsWith(bytes, BONEB_SIGNATURE))
        return 'boneb';
    return 'bone';
}
const decoder = new TextDecoder('utf-8');
/**
 * Reads a skeleton from bytes of any of the three encodings.
 *
 * Everything the loader would say about the file — unknown constraint types,
 * missing images, an atlas that does not have a region — comes back in
 * `data.warnings` and `data.missingImages`, exactly as with `loadSkeletonData`.
 */
export function loadSkeletonFile(bytes, options = {}) {
    const encoding = detectEncoding(bytes);
    const archive = encoding === 'bonez' ? readBonez(bytes, options.codec ?? {}) : null;
    return finishLoad(bytes, encoding, archive, options);
}
/**
 * Same as {@link loadSkeletonFile}, for a host whose inflate is asynchronous —
 * the browser, which only has `DecompressionStream` (spec 2.9).
 *
 * A `.bone` and a `.boneb` never need it; they go through the same code as the
 * synchronous call. A `.bonez` is opened with `readBonezAsync`.
 */
export async function loadSkeletonFileAsync(bytes, options = {}) {
    const encoding = detectEncoding(bytes);
    const archive = encoding === 'bonez' ? await readBonezAsync(bytes, options.codec ?? {}) : null;
    return finishLoad(bytes, encoding, archive, options);
}
function finishLoad(bytes, encoding, archive, options) {
    const warnings = [];
    const atlases = [...(options.atlases ?? [])];
    let file;
    const files = options.files;
    const read = archive !== null
        ? (name) => archive.read(name)
        : files !== undefined ? (name) => files(name) ?? undefined : null;
    const load = { read, options, warnings, missing: [], cache: new Map() };
    const mainName = archive !== null ? archive.mainName : '';
    const base = folderOf(mainName);
    if (archive !== null) {
        warnings.push(...archive.warnings);
        file = readEntryAsTree(archive.readMain());
        // Spec 2.8: a `uri` inside the package is resolved against the folder the
        // main skeleton sits in, not against the root of the ZIP.
        // There is NO fallback to the root of the ZIP: a runtime that falls back
        // accepts packages another runtime rejects, which is worse than failing.
        // The Python runtime does not fall back, and the two disagreed here.
        const base = folderOf(archive.mainName);
        for (const name of atlasNamesOf(archive, file)) {
            const entry = archive.read(joinUri(base, name));
            if (entry === undefined) {
                warnings.push(`O pacote não traz o atlas "${name}".`);
                continue;
            }
            try {
                atlases.push(loadAtlas(parseBoneText(decoder.decode(entry))));
            }
            catch (error) {
                warnings.push(`Não deu para ler o atlas "${name}": ${messageOf(error)}`);
            }
        }
    }
    else if (encoding === 'boneb') {
        file = readBoneb(bytes);
    }
    else {
        file = parseBoneText(decoder.decode(bytes));
    }
    const data = loadTree(load, file, base, atlases, [mainName], 0);
    const bodies = read === null ? new Map() : loadBodies(load, data, base);
    return { data, encoding, file, atlases, archive, bodies, missingFiles: load.missing, warnings };
}
/**
 * Loads one skeleton tree: folds its external animations and skins in (spec
 * 2.8), loads it, then loads its nested children (7.11). `base` is the folder
 * of the entry; `chain` the entries that led here (cycle detection).
 */
function loadTree(load, tree, base, atlases, chain, depth) {
    const read = load.read;
    let composedTree = tree;
    let externalAnimations;
    const origins = new Map();
    const extraWarnings = [];
    if (read !== null) {
        const composed = composeExternals(tree, base, (name) => {
            const bytes = read(name);
            return bytes === undefined ? null : readEntryAsTree(bytes);
        });
        composedTree = composed.tree;
        externalAnimations = composed.externalAnimations;
        extraWarnings.push(...composed.warnings);
        load.missing.push(...composed.missing);
        // Spec 2.8: the assets of an external skin resolve against ITS file.
        for (const [skin, origin] of composed.skinOrigins) {
            origins.set(skin, origin);
            for (const name of origin.atlases) {
                const bytes = read(joinUri(origin.folder, name));
                if (bytes === undefined) {
                    extraWarnings.push(`EXTERNAL_MISSING: o atlas "${name}" da pele "${skin}" (${origin.entry}) não foi achado`);
                    continue;
                }
                try {
                    atlases.push(loadAtlas(parseBoneText(decoder.decode(bytes))));
                }
                catch (error) {
                    extraWarnings.push(`Não deu para ler o atlas "${name}" da pele "${skin}": ${messageOf(error)}`);
                }
            }
        }
    }
    const data = loadSkeletonData(composedTree, { ...load.options, atlases, externalAnimations });
    if (extraWarnings.length > 0) {
        data.warnings.push(...extraWarnings.map((message) => ({ pointer: '/assets', message })));
        for (const w of extraWarnings)
            if (!load.warnings.includes(w))
                load.warnings.push(w);
    }
    if (read !== null)
        loadNested(load, data, base, origins, chain, depth);
    return data;
}
/**
 * Loads the `skeleton` attachments of `data` through the reader, recursively
 * (spec 7.11). `base` is the folder the current skeleton entry sits in; an
 * attachment of a skin that came from another file resolves against THAT
 * file (spec 2.8). `chain` is the list of entries that led here, which is what
 * detects a cycle.
 *
 * A child that is missing, that loops or that goes past depth 8 is L1 with the
 * fallback of spec 2.8: a warning, and the placeholder draws nothing. In
 * `strict` mode it throws instead.
 */
function loadNested(load, data, base, origins, chain, depth) {
    if (load.read === null)
        return;
    const seen = new Set();
    for (const skin of data.skins) {
        const origin = origins.get(skin.name);
        for (const bySlot of skin.attachments.values()) {
            for (const att of bySlot.values()) {
                if (!(att instanceof SkeletonAttachment) || seen.has(att))
                    continue;
                seen.add(att);
                const entryName = origin === undefined
                    ? joinUri(base, att.resolvedUri)
                    : joinUri(origin.folder, joinUri(origin.skeletonsBase, att.uri));
                loadOneNested(load, att, entryName, chain, depth);
            }
        }
    }
}
function loadOneNested(load, att, entryName, chain, depth) {
    const read = load.read;
    const { options, cache, warnings } = load;
    const refuse = (message) => {
        if (options.strict === true)
            throw new LoadError('/skins', message);
        if (!warnings.includes(message))
            warnings.push(message);
    };
    if (chain.includes(entryName)) {
        refuse(`Ciclo de entidade: "${entryName}" já está na cadeia ${chain.join(' -> ')} (7.11).`);
        return;
    }
    if (depth + 1 > MAX_NESTED_DEPTH) {
        refuse(`Entidade passou da profundidade máxima de ${MAX_NESTED_DEPTH} (12.6) em "${entryName}".`);
        return;
    }
    const cached = cache.get(entryName);
    if (cached !== undefined) {
        att.child = cached;
        return;
    }
    const entry = read(entryName);
    if (entry === undefined) {
        load.missing.push(entryName);
        refuse(`O pacote não traz a entidade "${entryName}" (7.11).`);
        return;
    }
    let child;
    try {
        child = loadEntry(load, entryName, entry, [...chain, entryName], depth + 1);
    }
    catch (error) {
        refuse(`Não deu para ler a entidade "${entryName}": ${messageOf(error)}`);
        return;
    }
    for (const w of child.warnings)
        warnings.push(`${entryName}: ${w.pointer} ${w.message}`);
    att.child = child;
}
/**
 * Loads a skeleton entry (a child or a body) with its own atlases and its own
 * folder as the base (spec 2.8), and caches it by entry name.
 */
function loadEntry(load, entryName, entry, chain, depth) {
    const read = load.read;
    const childBase = folderOf(entryName);
    const tree = readEntryAsTree(entry);
    const childAtlases = [];
    for (const name of atlasNamesOfTree(tree)) {
        const bytes = read(joinUri(childBase, name)) ?? read(name);
        if (bytes === undefined) {
            load.warnings.push(`O pacote não traz o atlas "${name}" do esqueleto "${entryName}".`);
            continue;
        }
        childAtlases.push(loadAtlas(parseBoneText(decoder.decode(bytes))));
    }
    // A cycle never reaches here twice: the chain check in `loadOneNested` stops it.
    const child = loadTree(load, tree, childBase, childAtlases, chain, depth);
    load.cache.set(entryName, child);
    return child;
}
/**
 * Every body named by a `body` key of an animation of `data` (spec 9.13),
 * loaded once, keyed by the key `value`. A body that is not found keeps the
 * body before it, with a warning (spec 9.13); the `Actor` says so again when
 * the animation reaches the key.
 */
function loadBodies(load, data, base) {
    const bodies = new Map();
    const read = load.read;
    for (const animation of data.animations) {
        const tl = animation.body;
        if (tl === null)
            continue;
        for (const key of tl.keys.values) {
            if (key.value === null || key.uri === null || bodies.has(key.value))
                continue;
            const entryName = joinUri(base, key.uri);
            const cached = load.cache.get(entryName);
            if (cached !== undefined) {
                bodies.set(key.value, cached);
                continue;
            }
            const entry = read(entryName);
            if (entry === undefined) {
                load.missing.push(entryName);
                const message = `BODY_MISSING: o corpo "${key.value}" da animação "${animation.name}" não foi achado; fica o corpo de antes (9.13)`;
                if (!load.warnings.includes(message))
                    load.warnings.push(message);
                continue;
            }
            try {
                bodies.set(key.value, loadEntry(load, entryName, entry, [entryName], 0));
            }
            catch (error) {
                load.warnings.push(`Não deu para ler a base "${key.value}": ${messageOf(error)}`);
            }
        }
    }
    return bodies;
}
/** The `assets.atlases` list of a decoded skeleton tree. */
function atlasNamesOfTree(file) {
    const names = [];
    const assets = file?.assets;
    for (const name of Array.isArray(assets?.atlases) ? assets.atlases : []) {
        if (typeof name === 'string' && !names.includes(name))
            names.push(name);
    }
    return names;
}
/** The `assets.atlases` list of a decoded skeleton, plus the manifest's. */
function atlasNamesOf(archive, file) {
    const names = atlasNamesOfTree(file);
    // The manifest may list atlases the skeleton does not name (a shared atlas,
    // spec 10.1). Loading them costs little and makes a region resolvable.
    for (const name of archive.manifest.atlases ?? []) {
        if (typeof name === 'string' && !names.includes(name))
            names.push(name);
    }
    return names;
}
/** A `.bone` or a `.boneb` entry, whichever the package holds. */
function readEntryAsTree(entry) {
    if (startsWith(entry, BONEB_SIGNATURE))
        return readBoneb(entry);
    return parseBoneText(decoder.decode(entry));
}
/** Folder part of an entry name, `""` when it sits at the root (spec 2.8). */
function folderOf(name) {
    return folderOfEntry(name);
}
function messageOf(error) {
    return error instanceof Error ? error.message : String(error);
}

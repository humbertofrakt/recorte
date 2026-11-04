/**
 * Ambient types for things the bundler handles, not TypeScript (owner A).
 *
 * One file for the whole editor: declaring `*.css` twice is an error, so no
 * other module may repeat these.
 */

/** `import './shell.css'` — the bundler inlines it, there is no value to use. */
declare module '*.css';
declare module '*.png';
declare module '*.svg';

/**
 * `import url from './x.bone?url'` — the address of the file, not its contents.
 * A `.json` imported without `?url` becomes a module, and then `fetch` gets
 * JavaScript back instead of the file.
 */
declare module '*?url' {
  const url: string;
  export default url;
}

/**
 * `import.meta.glob('./x/*.md', { query: '?raw', import: 'default', eager: true })`
 * — the bundler replaces the call with a plain object, one entry per file that
 * matched. Used by `io/manual.ts` to carry the manual into the page.
 */
interface ImportMeta {
  glob(
    pattern: string,
    options: { query: string; import: string; eager: true },
  ): Record<string, string>;
}

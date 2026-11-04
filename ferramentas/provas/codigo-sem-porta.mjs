import fs from 'fs'; import path from 'path';
const root=process.cwd().replace(/\\/g, '/') + '/editor/src';
const files=[];(function w(d){for(const f of fs.readdirSync(d)){const p=d+'/'+f;if(fs.statSync(p).isDirectory())w(p);else if(p.endsWith('.ts')&&!p.endsWith('.d.ts'))files.push(p);}})(root);
const src=Object.fromEntries(files.map(f=>[f,fs.readFileSync(f,'utf8')]));
const imp={};
for(const f of files){imp[f]=[];for(const m of src[f].matchAll(/(?:from|import)\s*\(?\s*['"](\.[^'"]+)['"]/g)){let t=path.posix.normalize(path.posix.dirname(f)+'/'+m[1]).replace(/\.js$/,'.ts');if(!t.endsWith('.ts'))t+='.ts';if(src[t]!==undefined)imp[f].push(t);}}
const seen=new Set();(function go(f){if(seen.has(f))return;seen.add(f);imp[f].forEach(go);})(root+'/main.ts');
console.log('ARQUIVOS:',files.length,'ALCANCADOS pelo main.ts:',seen.size);
console.log('--- ORFAOS (nenhum caminho a partir do main.ts) ---');
for(const f of files)if(!seen.has(f))console.log(f.slice(root.length+1), src[f].split('\n').length+' linhas');
console.log('--- EXPORTS nunca usados fora do proprio arquivo (so funcoes/const) ---');
const all=files.filter(f=>seen.has(f));
for(const f of all){const out=[];for(const m of src[f].matchAll(/^export\s+(?:async\s+)?(?:function|const|class)\s+([A-Za-z0-9_]+)/gm)){const n=m[1];const re=new RegExp('(?<![A-Za-z0-9_])'+n+'(?![A-Za-z0-9_])');let used=false;for(const g of all){if(g===f)continue;if(re.test(src[g])){used=true;break;}}if(!used){const inside=(src[f].match(new RegExp('(?<![A-Za-z0-9_])'+n+'(?![A-Za-z0-9_])','g'))||[]).length;if(inside<=1)out.push(n);}}
if(out.length)console.log(f.slice(root.length+1)+': '+out.join(', '));}

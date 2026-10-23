import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';

// Usage: node scripts/build-sd2-preview.mjs /path/to/isolated/integrated-preview/index.html
// Does not fetch or modify production. Uses the locally supplied integrated preview.
const source=process.argv[2];
if(!source)throw new Error('Provide the local isolated integrated-preview index.html');
const html=readFileSync(source,'utf8');
if(!html.includes('SD2.bind({')||!html.includes('sd2.js'))throw new Error('Source is not the integrated SD2 preview');
mkdirSync('dist',{recursive:true});
const dest=resolve('dist/index.html');
writeFileSync(dest,html.replace('<script src="sd2.js"></script>','<script src="sd2.js"></script>'));
copyFileSync(resolve('experimental/sd2.js'),resolve('dist/sd2.js'));
execFileSync(process.execPath,[resolve('scripts/patch-guardian-breach.mjs'),dest],{stdio:'inherit'});
const output=readFileSync(dest,'utf8');
for(const required of ['guardianBreached','const isFinal=cleared>=goal;','SD2.bind({']){
 if(!output.includes(required))throw new Error('Missing patched runtime marker: '+required);
}
console.log('Built isolated SD2 Preview into dist/. Deploy dist/ to a separate preview project only.');

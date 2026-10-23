import {readFileSync,writeFileSync,mkdirSync,copyFileSync,rmSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const env=process.env.VERCEL_ENV || process.env.NEON_ENV || 'production';
if (!['preview','development','production'].includes(env)) throw new Error('Unknown build environment');
const profile=env==='production'?'production':'test';
rmSync('dist',{recursive:true,force:true});
mkdirSync('dist/experimental',{recursive:true});
const files=['index.html','economy.js','experimental/sd2.js','manifest.webmanifest'];
for(const file of files) {
 const content=readFileSync(file,'utf8');
 if(content.includes('\ufffd') || content.length<50) throw new Error('Damaged source: '+file);
 if(file.endsWith('.js')) execFileSync(process.execPath,['--check',file]);
 if(file.endsWith('.html')) {
  if(!content.endsWith('</html>\n') && !content.endsWith('</html>\r\n')) throw new Error('Incomplete HTML');
  const inline=[...content.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
  new Function(inline);
 }
 copyFileSync(file,'dist/'+file);
}
writeFileSync('dist/runtime-config.js',`window.NEON_BUILD = Object.freeze(${JSON.stringify({profile,debug:profile==='test'})});\n`);
files.push('runtime-config.js');
const hashes=Object.fromEntries(files.map(f=>[f,createHash('sha256').update(readFileSync('dist/'+f)).digest('hex')]));
let commit='unknown';try{commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();}catch{}
writeFileSync('dist/integrity.json',JSON.stringify({environment:env,profile,commit,sha256:hashes},null,2)+'\n');
console.log(`Built ${env}: ${profile} economy; validated syntax and SHA-256 for ${files.length} files.`);

import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
const root=resolve('dist');
const types={'.html':'text/html','.js':'application/javascript','.json':'application/json','.webmanifest':'application/manifest+json'};
createServer((req,res)=>{
 try {
  const path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/\/$/,'/index.html'));
  if(!path.startsWith(root+sep)) {res.writeHead(403).end();return;}
  const data=readFileSync(path);res.writeHead(200,{'Content-Type':(types[extname(path)]||'application/octet-stream')+'; charset=utf-8'}).end(data);
 }catch{res.writeHead(404).end('Not found');}
}).listen(4173,'127.0.0.1',()=>console.log('Preview http://127.0.0.1:4173'));

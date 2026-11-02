import {defineConfig} from 'vite';import {createHash} from 'node:crypto';import {readFileSync} from 'node:fs';
const hash=value=>createHash('sha256').update(value).digest('hex').slice(0,16);
export default defineConfig({base:'./',build:{target:'es2020',assetsInlineLimit:0},server:{fs:{allow:['..']}},plugins:[{name:'studio-release',enforce:'post',generateBundle(_,bundle){
 const digest=createHash('sha256'),html=bundle['index.html'],oldManifest=Object.keys(bundle).find(name=>name.endsWith('.webmanifest')),manifest=JSON.parse(readFileSync(new URL('./manifest.webmanifest',import.meta.url),'utf8'));
 for(const icon of manifest.icons){const bytes=readFileSync(new URL(icon.src,import.meta.url)),name=`assets/website-logo-${icon.sizes.split('x')[0]}-${hash(bytes)}.png`;this.emitFile({type:'asset',fileName:name,source:bytes});icon.src='./'+name;digest.update(bytes);}
 if(oldManifest){delete bundle[oldManifest];if(html)html.source=html.source.replace(oldManifest,'manifest.webmanifest');}
 const manifestText=JSON.stringify(manifest);this.emitFile({type:'asset',fileName:'manifest.webmanifest',source:manifestText});digest.update(manifestText);
 for(const [name,file]of Object.entries(bundle).sort())digest.update(name+(file.code??file.source??''));const version=digest.digest('hex').slice(0,16);
 if(html)html.source=html.source.replace('<head>',`<head><script>window.STUDIO_RELEASE=${JSON.stringify({version,manifest:'./release.json'})};</script>`);this.emitFile({type:'asset',fileName:'release.json',source:JSON.stringify({version})});
}}]});

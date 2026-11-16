// Used only by the repository CI after verification. Never deploys Firebase or GoDaddy.
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {existsSync,writeFileSync,rmSync} from 'node:fs';
const [branch,directory]=process.argv.slice(2);
if(!process.env.GITHUB_ACTIONS||!['previews/millionaire-rewards','downloads/games-site'].includes(branch))throw Error('CI preview or tested-site publication only');
const root=resolve(directory);if(!existsSync(root))throw Error('missing generated files');
if(branch==='downloads/games-site'&&process.env.GITHUB_REF!=='refs/heads/main')throw Error('Only tested main may update built website');
const git=(args,options={})=>execFileSync('git',args,{encoding:'utf8',stdio:['ignore','pipe','pipe'],...options}).trim();
git(['config','user.name','github-actions[bot]']);git(['config','user.email','41898282+github-actions[bot]@users.noreply.github.com']);
let parent='';try{git(['fetch','--no-tags','origin','refs/heads/'+branch]);parent=git(['rev-parse','FETCH_HEAD']);}catch(e){if(!String(e.stderr).includes("couldn't find remote ref"))throw e;}
const index='/tmp/hkm-publish-'+branch.replaceAll('/','-')+'.index',env={...process.env,GIT_INDEX_FILE:index};
rmSync(index,{force:true});git(['read-tree','--empty'],{env});
writeFileSync(root+'/SOURCE-COMMIT.txt',git(['rev-parse','HEAD'])+'\n');
const gitDir=git(['rev-parse','--absolute-git-dir']);git(['--git-dir='+gitDir,'--work-tree='+root,'add','--all','.'],{env,cwd:root});const tree=git(['write-tree'],{env});
if(parent&&git(['rev-parse',parent+'^{tree}'])===tree){console.log(branch+': already current');process.exit(0);}
const sha=git(['commit-tree',tree,...(parent?['-p',parent]:[]),'-m','Verified Millionaire '+(branch.startsWith('previews/')?'UI previews':'website')+' from '+process.env.GITHUB_SHA]);
git(['push','origin',sha+':refs/heads/'+branch]);rmSync(index,{force:true});console.log('Published '+branch+' at '+sha);

import {closeReadings} from './reading-modal.js';
// Update changed nodes while preserving focus, details and unchanged SVG trees.
const rendered=new WeakMap();
function sync(old,node){
 if(old.nodeType!==node.nodeType||old.nodeName!==node.nodeName){old.replaceWith(node.cloneNode(true));return;}
 if(old.isEqualNode(node))return;
 if(old.nodeType===3){if(old.data!==node.data)old.data=node.data;return;}
 if(old.nodeType!==1)return;
 for(const a of [...old.attributes])if(!node.hasAttribute(a.name)&&!(old.tagName==='DETAILS'&&a.name==='open'))old.removeAttribute(a.name);
 for(const a of node.attributes)if(old.getAttribute(a.name)!==a.value)old.setAttribute(a.name,a.value);
 let i=0;while(i<node.childNodes.length||i<old.childNodes.length){let a=old.childNodes[i];const b=node.childNodes[i];if(b?.nodeType===1&&b.hasAttribute('data-frame')&&a?.getAttribute?.('data-frame')!==b.getAttribute('data-frame')){const found=[...old.children].find(n=>n.getAttribute('data-frame')===b.getAttribute('data-frame'));if(found){old.insertBefore(found,a??null);a=found;}}if(!b){a.remove();continue;}if(!a)old.append(b.cloneNode(true));else sync(a,b);i++;}
}
export function html(root,value){if(!root)return;value=String(value);if(rendered.get(root)===value)return;closeReadings(root);const t=document.createElement('template');t.innerHTML=value;let i=0;while(i<t.content.childNodes.length||i<root.childNodes.length){let a=root.childNodes[i];const b=t.content.childNodes[i];if(b?.nodeType===1&&b.hasAttribute('data-frame')&&a?.getAttribute?.('data-frame')!==b.getAttribute('data-frame')){const found=[...root.children].find(n=>n.getAttribute('data-frame')===b.getAttribute('data-frame'));if(found){root.insertBefore(found,a??null);a=found;}}if(!b){a.remove();continue;}if(!a)root.append(b.cloneNode(true));else sync(a,b);i++;}rendered.set(root,value);}

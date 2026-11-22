// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8210994de2dd.js');self.addEventListener('install',()=>self.skipWaiting());
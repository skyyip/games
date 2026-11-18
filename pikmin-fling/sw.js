// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-edda862372cc.js');self.addEventListener('install',()=>self.skipWaiting());
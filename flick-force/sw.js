// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0831bed2bbbe.js');self.addEventListener('install',()=>self.skipWaiting());
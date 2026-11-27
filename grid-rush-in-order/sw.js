// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-a186025882cd.js');self.addEventListener('install',()=>self.skipWaiting());
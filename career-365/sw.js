// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-44febf0391fe.js');self.addEventListener('install',()=>self.skipWaiting());
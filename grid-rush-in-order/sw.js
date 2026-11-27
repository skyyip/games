// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f19337739e17.js');self.addEventListener('install',()=>self.skipWaiting());
// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-11563008c20a.js');self.addEventListener('install',()=>self.skipWaiting());
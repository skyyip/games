// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ecd55b10edaf.js');self.addEventListener('install',()=>self.skipWaiting());
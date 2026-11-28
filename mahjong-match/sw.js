// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-546ddcf23a5f.js');self.addEventListener('install',()=>self.skipWaiting());
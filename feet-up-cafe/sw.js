// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7d8e34b06893.js');self.addEventListener('install',()=>self.skipWaiting());
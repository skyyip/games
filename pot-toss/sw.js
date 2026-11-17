// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ae03ad440d5a.js');self.addEventListener('install',()=>self.skipWaiting());
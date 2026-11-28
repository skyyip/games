// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3dc1b5b88f32.js');self.addEventListener('install',()=>self.skipWaiting());
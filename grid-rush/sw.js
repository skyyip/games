// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8879a061184d.js');self.addEventListener('install',()=>self.skipWaiting());
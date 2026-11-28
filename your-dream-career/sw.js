// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3f869ec325d5.js');self.addEventListener('install',()=>self.skipWaiting());
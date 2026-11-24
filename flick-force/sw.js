// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f74279273033.js');self.addEventListener('install',()=>self.skipWaiting());
// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-79fa1f67968e.js');self.addEventListener('install',()=>self.skipWaiting());
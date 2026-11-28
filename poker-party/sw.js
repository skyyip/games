// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-80f04977c772.js');self.addEventListener('install',()=>self.skipWaiting());
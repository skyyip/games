// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2dd912d86f1b.js');self.addEventListener('install',()=>self.skipWaiting());
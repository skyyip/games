// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d8a9f667c62d.js');self.addEventListener('install',()=>self.skipWaiting());
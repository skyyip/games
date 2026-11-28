// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7ddd5d75cd96.js');self.addEventListener('install',()=>self.skipWaiting());
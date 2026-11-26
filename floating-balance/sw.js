// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e86c753ea5ed.js');self.addEventListener('install',()=>self.skipWaiting());
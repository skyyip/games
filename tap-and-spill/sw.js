// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-773fcb8bb519.js');self.addEventListener('install',()=>self.skipWaiting());
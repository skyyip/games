// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2e462226653f.js');self.addEventListener('install',()=>self.skipWaiting());
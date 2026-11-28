// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6183fe1aa447.js');self.addEventListener('install',()=>self.skipWaiting());
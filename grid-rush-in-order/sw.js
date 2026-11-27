// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6ae8b4998f88.js');self.addEventListener('install',()=>self.skipWaiting());
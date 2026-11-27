// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-986a8cc0f6ae.js');self.addEventListener('install',()=>self.skipWaiting());
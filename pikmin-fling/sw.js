// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-244fa5b49398.js');self.addEventListener('install',()=>self.skipWaiting());
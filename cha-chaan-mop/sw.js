// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8022ffdbffc9.js');self.addEventListener('install',()=>self.skipWaiting());
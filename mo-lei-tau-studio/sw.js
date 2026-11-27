// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-95a815eb8903.js');self.addEventListener('install',()=>self.skipWaiting());
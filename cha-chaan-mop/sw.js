// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8bd3ee6aba2b.js');self.addEventListener('install',()=>self.skipWaiting());
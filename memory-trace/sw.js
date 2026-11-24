// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ce2bfef1f8c8.js');self.addEventListener('install',()=>self.skipWaiting());
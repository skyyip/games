// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-571641fa4722.js');self.addEventListener('install',()=>self.skipWaiting());
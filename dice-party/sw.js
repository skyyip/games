// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-81222bf4534a.js');self.addEventListener('install',()=>self.skipWaiting());
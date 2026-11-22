// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4e6f3179ef2a.js');self.addEventListener('install',()=>self.skipWaiting());
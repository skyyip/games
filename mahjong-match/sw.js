// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2df6cfb5bd7d.js');self.addEventListener('install',()=>self.skipWaiting());
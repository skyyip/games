// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-772776fe3bca.js');self.addEventListener('install',()=>self.skipWaiting());
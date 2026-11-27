// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-87819c39d942.js');self.addEventListener('install',()=>self.skipWaiting());
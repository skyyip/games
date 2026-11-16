// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-480cd28f3a13.js');self.addEventListener('install',()=>self.skipWaiting());
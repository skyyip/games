// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-877e1456459e.js');self.addEventListener('install',()=>self.skipWaiting());
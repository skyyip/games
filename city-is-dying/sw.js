// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7d73db8b8b5e.js');self.addEventListener('install',()=>self.skipWaiting());
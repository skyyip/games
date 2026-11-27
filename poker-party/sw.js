// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ea189e950f4e.js');self.addEventListener('install',()=>self.skipWaiting());
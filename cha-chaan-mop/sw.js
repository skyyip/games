// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-592aeda9169c.js');self.addEventListener('install',()=>self.skipWaiting());
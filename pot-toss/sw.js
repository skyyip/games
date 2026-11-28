// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-fd151981274c.js');self.addEventListener('install',()=>self.skipWaiting());
// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-18526f97264c.js');self.addEventListener('install',()=>self.skipWaiting());
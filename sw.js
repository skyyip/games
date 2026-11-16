// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-98ef056ba02c.js');self.addEventListener('install',()=>self.skipWaiting());
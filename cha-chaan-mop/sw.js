// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-24ff05ccca5c.js');self.addEventListener('install',()=>self.skipWaiting());
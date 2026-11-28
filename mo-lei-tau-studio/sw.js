// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7928d281679c.js');self.addEventListener('install',()=>self.skipWaiting());
// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5ca2ec80dd2c.js');self.addEventListener('install',()=>self.skipWaiting());
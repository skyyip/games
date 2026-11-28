// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f4846913d47c.js');self.addEventListener('install',()=>self.skipWaiting());
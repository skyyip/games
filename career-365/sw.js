// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9b42e58c0fac.js');self.addEventListener('install',()=>self.skipWaiting());
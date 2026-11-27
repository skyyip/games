// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0310e42e16a6.js');self.addEventListener('install',()=>self.skipWaiting());
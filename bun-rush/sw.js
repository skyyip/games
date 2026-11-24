// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-b16e5e42e81d.js');self.addEventListener('install',()=>self.skipWaiting());
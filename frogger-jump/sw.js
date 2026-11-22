// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0ee7b8ccaf4c.js');self.addEventListener('install',()=>self.skipWaiting());
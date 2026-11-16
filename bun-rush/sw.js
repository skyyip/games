// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-bd888dad0814.js');self.addEventListener('install',()=>self.skipWaiting());
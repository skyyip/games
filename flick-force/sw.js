// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8c1a38ae3814.js');self.addEventListener('install',()=>self.skipWaiting());
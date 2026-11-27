// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0722db1734d6.js');self.addEventListener('install',()=>self.skipWaiting());
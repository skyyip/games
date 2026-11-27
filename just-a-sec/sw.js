// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2178d53f811d.js');self.addEventListener('install',()=>self.skipWaiting());
// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-16f47857bd51.js');self.addEventListener('install',()=>self.skipWaiting());
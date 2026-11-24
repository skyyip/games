// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-75f69d463084.js');self.addEventListener('install',()=>self.skipWaiting());
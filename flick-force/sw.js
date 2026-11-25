// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2ace9d7ae279.js');self.addEventListener('install',()=>self.skipWaiting());
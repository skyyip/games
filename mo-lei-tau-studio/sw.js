// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-bf49632e11d7.js');self.addEventListener('install',()=>self.skipWaiting());
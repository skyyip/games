// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-b9154819419f.js');self.addEventListener('install',()=>self.skipWaiting());
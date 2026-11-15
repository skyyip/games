// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-c043b423151b.js');self.addEventListener('install',()=>self.skipWaiting());
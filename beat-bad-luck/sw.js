// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3aca24f22117.js');self.addEventListener('install',()=>self.skipWaiting());
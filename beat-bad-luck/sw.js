// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-b15c2aa221eb.js');self.addEventListener('install',()=>self.skipWaiting());
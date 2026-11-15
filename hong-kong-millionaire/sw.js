// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d99f62bb9331.js');self.addEventListener('install',()=>self.skipWaiting());
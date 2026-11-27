// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-999cc9b02d5d.js');self.addEventListener('install',()=>self.skipWaiting());
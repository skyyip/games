// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-abac7679cf19.js');self.addEventListener('install',()=>self.skipWaiting());
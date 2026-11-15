// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9dc9834c6e98.js');self.addEventListener('install',()=>self.skipWaiting());
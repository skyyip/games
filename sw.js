// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-67ba137f7edd.js');self.addEventListener('install',()=>self.skipWaiting());
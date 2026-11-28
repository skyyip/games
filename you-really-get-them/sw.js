// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-79b4b5c7e883.js');self.addEventListener('install',()=>self.skipWaiting());
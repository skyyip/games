// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7b607a012144.js');self.addEventListener('install',()=>self.skipWaiting());
// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4fe7cfee6328.js');self.addEventListener('install',()=>self.skipWaiting());
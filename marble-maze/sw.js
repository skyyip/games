// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2030f4ad7e42.js');self.addEventListener('install',()=>self.skipWaiting());
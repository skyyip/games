// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ae051e478508.js');self.addEventListener('install',()=>self.skipWaiting());
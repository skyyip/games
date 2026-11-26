// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-26d93114e53d.js');self.addEventListener('install',()=>self.skipWaiting());
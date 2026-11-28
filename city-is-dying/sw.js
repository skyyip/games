// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2c25aecc804a.js');self.addEventListener('install',()=>self.skipWaiting());
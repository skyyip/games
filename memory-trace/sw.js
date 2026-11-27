// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-62791d4d498c.js');self.addEventListener('install',()=>self.skipWaiting());
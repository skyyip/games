// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-748a79f22f8d.js');self.addEventListener('install',()=>self.skipWaiting());
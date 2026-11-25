// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-37589787a867.js');self.addEventListener('install',()=>self.skipWaiting());
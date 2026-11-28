// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-678d02f707e9.js');self.addEventListener('install',()=>self.skipWaiting());
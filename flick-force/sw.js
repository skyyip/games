// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-143071a4a143.js');self.addEventListener('install',()=>self.skipWaiting());
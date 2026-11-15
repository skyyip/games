// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2f31ca89359b.js');self.addEventListener('install',()=>self.skipWaiting());
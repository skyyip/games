// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-a27688dd38ea.js');self.addEventListener('install',()=>self.skipWaiting());
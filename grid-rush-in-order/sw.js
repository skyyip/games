// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-37b262d76ca0.js');self.addEventListener('install',()=>self.skipWaiting());
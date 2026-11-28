// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-62e1aab7cf5b.js');self.addEventListener('install',()=>self.skipWaiting());
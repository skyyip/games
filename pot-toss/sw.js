// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-02a4e08c771b.js');self.addEventListener('install',()=>self.skipWaiting());
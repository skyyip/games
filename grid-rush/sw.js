// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-02f7da26d24a.js');self.addEventListener('install',()=>self.skipWaiting());
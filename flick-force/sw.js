// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-02d4d0d02eef.js');self.addEventListener('install',()=>self.skipWaiting());
// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-02c4f20e3a32.js');self.addEventListener('install',()=>self.skipWaiting());
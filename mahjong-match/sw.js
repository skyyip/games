// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-02057dda071e.js');self.addEventListener('install',()=>self.skipWaiting());
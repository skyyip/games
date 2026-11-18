// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-02c229022d7c.js');self.addEventListener('install',()=>self.skipWaiting());
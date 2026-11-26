// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-02e1eedea365.js');self.addEventListener('install',()=>self.skipWaiting());
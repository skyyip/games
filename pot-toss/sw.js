// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-02e784a11faa.js');self.addEventListener('install',()=>self.skipWaiting());
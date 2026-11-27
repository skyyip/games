// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-818b75bce3ba.js');self.addEventListener('install',()=>self.skipWaiting());
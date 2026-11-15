// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-31b3a60ac718.js');self.addEventListener('install',()=>self.skipWaiting());
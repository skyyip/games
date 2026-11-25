// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9d513e674043.js');self.addEventListener('install',()=>self.skipWaiting());
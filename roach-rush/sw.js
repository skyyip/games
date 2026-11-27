// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7f1a345da5d0.js');self.addEventListener('install',()=>self.skipWaiting());
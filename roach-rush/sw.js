// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-87dd26968824.js');self.addEventListener('install',()=>self.skipWaiting());
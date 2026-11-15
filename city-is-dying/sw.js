// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-625516bf100d.js');self.addEventListener('install',()=>self.skipWaiting());
// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-477049d634b5.js');self.addEventListener('install',()=>self.skipWaiting());
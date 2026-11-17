// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-89370272a827.js');self.addEventListener('install',()=>self.skipWaiting());
// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-58016e559ce2.js');self.addEventListener('install',()=>self.skipWaiting());
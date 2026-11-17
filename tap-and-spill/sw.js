// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6d5836a246f9.js');self.addEventListener('install',()=>self.skipWaiting());
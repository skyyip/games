// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9a5b960489b2.js');self.addEventListener('install',()=>self.skipWaiting());
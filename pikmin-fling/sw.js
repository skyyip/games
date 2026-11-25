// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ba9b08631beb.js');self.addEventListener('install',()=>self.skipWaiting());
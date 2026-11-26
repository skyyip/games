// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4400c9f9591f.js');self.addEventListener('install',()=>self.skipWaiting());
// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7cc4f042ffb2.js');self.addEventListener('install',()=>self.skipWaiting());
// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-30bf4315b4c5.js');self.addEventListener('install',()=>self.skipWaiting());
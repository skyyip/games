// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0b1be550e706.js');self.addEventListener('install',()=>self.skipWaiting());
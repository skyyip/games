// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1710d65454af.js');self.addEventListener('install',()=>self.skipWaiting());
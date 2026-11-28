// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-69de2c1662b1.js');self.addEventListener('install',()=>self.skipWaiting());
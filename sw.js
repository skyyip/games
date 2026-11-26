// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4548c14eccf1.js');self.addEventListener('install',()=>self.skipWaiting());
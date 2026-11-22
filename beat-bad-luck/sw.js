// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-30cca2bbfd11.js');self.addEventListener('install',()=>self.skipWaiting());
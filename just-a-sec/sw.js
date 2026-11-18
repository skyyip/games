// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e46482ca2c16.js');self.addEventListener('install',()=>self.skipWaiting());
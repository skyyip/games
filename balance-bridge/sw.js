// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8ccb2c98cdc0.js');self.addEventListener('install',()=>self.skipWaiting());
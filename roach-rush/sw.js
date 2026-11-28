// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4f8ef3eb3a53.js');self.addEventListener('install',()=>self.skipWaiting());
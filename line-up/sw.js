// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4c785e190568.js');self.addEventListener('install',()=>self.skipWaiting());
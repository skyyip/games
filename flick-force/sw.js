// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e93610dc4319.js');self.addEventListener('install',()=>self.skipWaiting());
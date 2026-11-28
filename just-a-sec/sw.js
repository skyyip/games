// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8a33e19b9d42.js');self.addEventListener('install',()=>self.skipWaiting());
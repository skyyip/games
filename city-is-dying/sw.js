// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d18b60ec8666.js');self.addEventListener('install',()=>self.skipWaiting());
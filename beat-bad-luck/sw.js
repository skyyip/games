// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-cd8818cdf325.js');self.addEventListener('install',()=>self.skipWaiting());
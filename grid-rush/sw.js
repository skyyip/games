// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1842671d8ef0.js');self.addEventListener('install',()=>self.skipWaiting());
// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8faf0c53b9e8.js');self.addEventListener('install',()=>self.skipWaiting());
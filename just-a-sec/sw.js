// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-06a7c52846f6.js');self.addEventListener('install',()=>self.skipWaiting());
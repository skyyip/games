// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-97493ac57598.js');self.addEventListener('install',()=>self.skipWaiting());
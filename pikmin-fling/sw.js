// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d7d29b44a349.js');self.addEventListener('install',()=>self.skipWaiting());
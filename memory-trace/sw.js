// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6a3765f63f5d.js');self.addEventListener('install',()=>self.skipWaiting());
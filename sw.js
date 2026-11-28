// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-67e651563d12.js');self.addEventListener('install',()=>self.skipWaiting());
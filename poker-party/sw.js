// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8111a9861012.js');self.addEventListener('install',()=>self.skipWaiting());
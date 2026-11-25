// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2771de826666.js');self.addEventListener('install',()=>self.skipWaiting());
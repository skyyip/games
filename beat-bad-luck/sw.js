// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-71b289d4e635.js');self.addEventListener('install',()=>self.skipWaiting());
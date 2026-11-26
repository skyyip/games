// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-66ded013240e.js');self.addEventListener('install',()=>self.skipWaiting());
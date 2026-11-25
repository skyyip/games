// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-504f85ede02d.js');self.addEventListener('install',()=>self.skipWaiting());
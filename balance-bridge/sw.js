// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-16e90bb27ad1.js');self.addEventListener('install',()=>self.skipWaiting());
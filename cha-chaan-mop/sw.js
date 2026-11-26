// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-a010aa87c7f8.js');self.addEventListener('install',()=>self.skipWaiting());
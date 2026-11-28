// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-b6e587c1abdd.js');self.addEventListener('install',()=>self.skipWaiting());
// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7769aa9e1022.js');self.addEventListener('install',()=>self.skipWaiting());
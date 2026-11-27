// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-80ff04e04043.js');self.addEventListener('install',()=>self.skipWaiting());
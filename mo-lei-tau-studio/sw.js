// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5042420f1d05.js');self.addEventListener('install',()=>self.skipWaiting());
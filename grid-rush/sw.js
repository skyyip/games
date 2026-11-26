// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f1cf96115bbd.js');self.addEventListener('install',()=>self.skipWaiting());
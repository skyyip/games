// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2f90d947cddc.js');self.addEventListener('install',()=>self.skipWaiting());
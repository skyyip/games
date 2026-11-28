// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-b14890409ddc.js');self.addEventListener('install',()=>self.skipWaiting());
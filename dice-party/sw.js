// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7897defe49cd.js');self.addEventListener('install',()=>self.skipWaiting());
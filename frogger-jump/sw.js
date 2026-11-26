// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f226f874ad5d.js');self.addEventListener('install',()=>self.skipWaiting());
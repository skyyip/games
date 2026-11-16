// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-648567976dcf.js');self.addEventListener('install',()=>self.skipWaiting());
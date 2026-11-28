// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-98b9886c1784.js');self.addEventListener('install',()=>self.skipWaiting());
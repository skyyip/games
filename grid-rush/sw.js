// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ccd9171939f6.js');self.addEventListener('install',()=>self.skipWaiting());
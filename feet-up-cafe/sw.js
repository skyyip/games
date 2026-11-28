// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-b2063c3b6bf5.js');self.addEventListener('install',()=>self.skipWaiting());
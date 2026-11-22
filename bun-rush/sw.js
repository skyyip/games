// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-40a11b91fad3.js');self.addEventListener('install',()=>self.skipWaiting());
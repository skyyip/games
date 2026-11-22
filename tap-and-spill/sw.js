// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2f74816abb33.js');self.addEventListener('install',()=>self.skipWaiting());
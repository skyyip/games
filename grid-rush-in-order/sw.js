// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6602e18e3f15.js');self.addEventListener('install',()=>self.skipWaiting());
// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-b8d1f90f31a3.js');self.addEventListener('install',()=>self.skipWaiting());
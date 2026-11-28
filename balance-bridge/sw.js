// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2378a4fb844f.js');self.addEventListener('install',()=>self.skipWaiting());
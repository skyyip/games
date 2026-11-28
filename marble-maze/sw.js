// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-69ee8ff17bc9.js');self.addEventListener('install',()=>self.skipWaiting());
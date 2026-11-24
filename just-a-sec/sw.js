// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-54743dd1d0f6.js');self.addEventListener('install',()=>self.skipWaiting());
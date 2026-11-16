// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ce56a926f909.js');self.addEventListener('install',()=>self.skipWaiting());
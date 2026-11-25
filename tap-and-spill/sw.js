// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-93bd5d038393.js');self.addEventListener('install',()=>self.skipWaiting());
// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6d011db49fc7.js');self.addEventListener('install',()=>self.skipWaiting());
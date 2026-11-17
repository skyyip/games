// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-68d3ae5d3040.js');self.addEventListener('install',()=>self.skipWaiting());
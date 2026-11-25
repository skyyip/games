// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ed1d3abd0cf4.js');self.addEventListener('install',()=>self.skipWaiting());
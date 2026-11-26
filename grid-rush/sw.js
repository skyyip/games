// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2643d3e544c6.js');self.addEventListener('install',()=>self.skipWaiting());
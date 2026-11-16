// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8bd423f963e5.js');self.addEventListener('install',()=>self.skipWaiting());
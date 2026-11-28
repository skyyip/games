// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-11056bf71988.js');self.addEventListener('install',()=>self.skipWaiting());
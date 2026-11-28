// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-21bef2655592.js');self.addEventListener('install',()=>self.skipWaiting());
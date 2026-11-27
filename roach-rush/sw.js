// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7518fed84be3.js');self.addEventListener('install',()=>self.skipWaiting());
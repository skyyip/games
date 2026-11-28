// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7b7cc80aaec1.js');self.addEventListener('install',()=>self.skipWaiting());
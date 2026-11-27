// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-765acd9b4e3f.js');self.addEventListener('install',()=>self.skipWaiting());
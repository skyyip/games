// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f57d1ddaf4bb.js');self.addEventListener('install',()=>self.skipWaiting());
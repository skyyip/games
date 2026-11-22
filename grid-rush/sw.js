// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d5a917d80837.js');self.addEventListener('install',()=>self.skipWaiting());
// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4c2a75dffa87.js');self.addEventListener('install',()=>self.skipWaiting());
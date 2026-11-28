// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-074619d317b3.js');self.addEventListener('install',()=>self.skipWaiting());
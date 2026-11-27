// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-35f59175176f.js');self.addEventListener('install',()=>self.skipWaiting());
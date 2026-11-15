// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-cd186eb07b12.js');self.addEventListener('install',()=>self.skipWaiting());
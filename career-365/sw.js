// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f092dd8589ab.js');self.addEventListener('install',()=>self.skipWaiting());
// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d9eed703bddf.js');self.addEventListener('install',()=>self.skipWaiting());
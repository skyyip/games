// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-32ea745c8921.js');self.addEventListener('install',()=>self.skipWaiting());
// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-a165873f3db3.js');self.addEventListener('install',()=>self.skipWaiting());
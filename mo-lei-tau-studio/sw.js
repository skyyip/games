// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-eeb4560ddc25.js');self.addEventListener('install',()=>self.skipWaiting());
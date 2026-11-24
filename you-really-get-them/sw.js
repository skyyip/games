// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-88f633d34036.js');self.addEventListener('install',()=>self.skipWaiting());
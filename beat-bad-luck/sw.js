// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-324ce48a061d.js');self.addEventListener('install',()=>self.skipWaiting());
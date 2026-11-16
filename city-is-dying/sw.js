// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5bad3ac02436.js');self.addEventListener('install',()=>self.skipWaiting());
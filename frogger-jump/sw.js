// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6ac51437eb2b.js');self.addEventListener('install',()=>self.skipWaiting());
// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5c3fdd429470.js');self.addEventListener('install',()=>self.skipWaiting());
// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1db163ac6fad.js');self.addEventListener('install',()=>self.skipWaiting());
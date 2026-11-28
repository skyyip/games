// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-81f016953d78.js');self.addEventListener('install',()=>self.skipWaiting());
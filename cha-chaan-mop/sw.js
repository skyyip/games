// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e2e23ef5fe02.js');self.addEventListener('install',()=>self.skipWaiting());
// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-173b01cc20af.js');self.addEventListener('install',()=>self.skipWaiting());
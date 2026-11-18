// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9268bd552241.js');self.addEventListener('install',()=>self.skipWaiting());
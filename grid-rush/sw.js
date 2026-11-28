// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-c2fa5057bf42.js');self.addEventListener('install',()=>self.skipWaiting());
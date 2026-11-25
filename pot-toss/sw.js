// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3094bea4f3ae.js');self.addEventListener('install',()=>self.skipWaiting());
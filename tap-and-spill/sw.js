// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-77545e6526af.js');self.addEventListener('install',()=>self.skipWaiting());
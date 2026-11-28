// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-59cc302e9366.js');self.addEventListener('install',()=>self.skipWaiting());
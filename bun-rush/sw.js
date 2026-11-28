// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-eddb4edf3fbc.js');self.addEventListener('install',()=>self.skipWaiting());
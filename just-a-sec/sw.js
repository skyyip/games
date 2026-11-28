// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0e0dd0dad4e9.js');self.addEventListener('install',()=>self.skipWaiting());
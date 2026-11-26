// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7896302e9959.js');self.addEventListener('install',()=>self.skipWaiting());
// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8db35ac5a00a.js');self.addEventListener('install',()=>self.skipWaiting());
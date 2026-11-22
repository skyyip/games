// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-310b6e8e47d1.js');self.addEventListener('install',()=>self.skipWaiting());
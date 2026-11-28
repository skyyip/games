// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-180f3404b47f.js');self.addEventListener('install',()=>self.skipWaiting());
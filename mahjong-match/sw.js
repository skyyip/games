// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-78b6fa6b3ff7.js');self.addEventListener('install',()=>self.skipWaiting());
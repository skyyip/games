// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-39f97910f767.js');self.addEventListener('install',()=>self.skipWaiting());
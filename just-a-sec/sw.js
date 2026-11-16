// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6c16535edb0d.js');self.addEventListener('install',()=>self.skipWaiting());
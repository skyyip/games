// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-81ed7f9bc347.js');self.addEventListener('install',()=>self.skipWaiting());
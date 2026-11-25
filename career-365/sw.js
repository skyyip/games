// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ba23fe9aeb92.js');self.addEventListener('install',()=>self.skipWaiting());
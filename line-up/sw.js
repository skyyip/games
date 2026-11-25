// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1fff61a61bc6.js');self.addEventListener('install',()=>self.skipWaiting());
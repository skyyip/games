// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-73a01a769b50.js');self.addEventListener('install',()=>self.skipWaiting());
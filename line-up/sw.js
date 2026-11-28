// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-694da2d850fe.js');self.addEventListener('install',()=>self.skipWaiting());
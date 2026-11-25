// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-cc210dd527b1.js');self.addEventListener('install',()=>self.skipWaiting());
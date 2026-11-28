// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9508b7c04cbe.js');self.addEventListener('install',()=>self.skipWaiting());
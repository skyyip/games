// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-89ec1a6fb578.js');self.addEventListener('install',()=>self.skipWaiting());
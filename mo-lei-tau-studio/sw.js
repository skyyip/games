// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2702053b5939.js');self.addEventListener('install',()=>self.skipWaiting());
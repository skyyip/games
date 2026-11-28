// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5a993a9be2f7.js');self.addEventListener('install',()=>self.skipWaiting());
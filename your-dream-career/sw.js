// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-013e780d0f7e.js');self.addEventListener('install',()=>self.skipWaiting());
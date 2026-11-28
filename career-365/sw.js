// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-780d5615f779.js');self.addEventListener('install',()=>self.skipWaiting());
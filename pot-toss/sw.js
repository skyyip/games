// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3ef45060481d.js');self.addEventListener('install',()=>self.skipWaiting());
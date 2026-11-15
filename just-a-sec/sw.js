// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-12c782bb99bd.js');self.addEventListener('install',()=>self.skipWaiting());
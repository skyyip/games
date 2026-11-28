// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5dcc9417e35f.js');self.addEventListener('install',()=>self.skipWaiting());
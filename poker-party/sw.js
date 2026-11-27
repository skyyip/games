// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4cc5933f62ed.js');self.addEventListener('install',()=>self.skipWaiting());
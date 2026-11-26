// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ae1eec355d85.js');self.addEventListener('install',()=>self.skipWaiting());
// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6c4514af330a.js');self.addEventListener('install',()=>self.skipWaiting());
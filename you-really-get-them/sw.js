// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5e4e80b6d56f.js');self.addEventListener('install',()=>self.skipWaiting());
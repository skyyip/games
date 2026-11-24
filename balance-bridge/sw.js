// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-fe7cbaf12979.js');self.addEventListener('install',()=>self.skipWaiting());
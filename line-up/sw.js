// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-33d35157fe15.js');self.addEventListener('install',()=>self.skipWaiting());
// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-157b42d7650b.js');self.addEventListener('install',()=>self.skipWaiting());
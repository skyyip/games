// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f6ae604fbb10.js');self.addEventListener('install',()=>self.skipWaiting());
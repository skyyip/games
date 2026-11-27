// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-08bddf951ee6.js');self.addEventListener('install',()=>self.skipWaiting());
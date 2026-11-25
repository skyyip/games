// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-61629c30b209.js');self.addEventListener('install',()=>self.skipWaiting());
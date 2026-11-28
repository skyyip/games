// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-06e8be7f24c6.js');self.addEventListener('install',()=>self.skipWaiting());
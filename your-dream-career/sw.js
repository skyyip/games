// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3fd5167f6834.js');self.addEventListener('install',()=>self.skipWaiting());
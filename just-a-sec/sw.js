// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8056ead79222.js');self.addEventListener('install',()=>self.skipWaiting());
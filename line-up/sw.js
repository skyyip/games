// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6d7f85972ee5.js');self.addEventListener('install',()=>self.skipWaiting());
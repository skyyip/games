// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-22a47e7b5e4f.js');self.addEventListener('install',()=>self.skipWaiting());
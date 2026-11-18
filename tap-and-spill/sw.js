// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-90a6abd9e043.js');self.addEventListener('install',()=>self.skipWaiting());
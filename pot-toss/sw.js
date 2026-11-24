// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d7f27b06b22b.js');self.addEventListener('install',()=>self.skipWaiting());
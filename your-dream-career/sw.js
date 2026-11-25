// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-636f0d12e79f.js');self.addEventListener('install',()=>self.skipWaiting());
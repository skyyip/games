// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e3e7cec8ff2f.js');self.addEventListener('install',()=>self.skipWaiting());
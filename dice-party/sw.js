// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4fc1fee278e5.js');self.addEventListener('install',()=>self.skipWaiting());
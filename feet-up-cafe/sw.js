// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6ddad9df0f1b.js');self.addEventListener('install',()=>self.skipWaiting());
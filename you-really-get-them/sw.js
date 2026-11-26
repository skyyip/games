// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2516ce513b24.js');self.addEventListener('install',()=>self.skipWaiting());
// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4911fe897905.js');self.addEventListener('install',()=>self.skipWaiting());
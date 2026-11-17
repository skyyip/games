// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-073f7b0a0f4e.js');self.addEventListener('install',()=>self.skipWaiting());
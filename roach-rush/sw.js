// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-34d07c3fccec.js');self.addEventListener('install',()=>self.skipWaiting());
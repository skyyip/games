// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1f85155e4fce.js');self.addEventListener('install',()=>self.skipWaiting());
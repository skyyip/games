// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9086a03a6830.js');self.addEventListener('install',()=>self.skipWaiting());
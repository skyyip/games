// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7978ea462479.js');self.addEventListener('install',()=>self.skipWaiting());
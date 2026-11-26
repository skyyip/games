// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ce9ff31136bd.js');self.addEventListener('install',()=>self.skipWaiting());
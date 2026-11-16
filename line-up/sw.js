// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-af018ffbfb76.js');self.addEventListener('install',()=>self.skipWaiting());
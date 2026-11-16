// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2cd649ae8869.js');self.addEventListener('install',()=>self.skipWaiting());
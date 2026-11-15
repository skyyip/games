// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-b978fbe60e55.js');self.addEventListener('install',()=>self.skipWaiting());
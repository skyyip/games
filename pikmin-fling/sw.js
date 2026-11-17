// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6fa9325e05ee.js');self.addEventListener('install',()=>self.skipWaiting());
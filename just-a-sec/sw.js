// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-46e3f0a960ee.js');self.addEventListener('install',()=>self.skipWaiting());
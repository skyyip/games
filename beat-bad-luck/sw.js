// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-149a19b042ee.js');self.addEventListener('install',()=>self.skipWaiting());
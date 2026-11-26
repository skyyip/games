// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-58da1dd574ee.js');self.addEventListener('install',()=>self.skipWaiting());
// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-b7cfef431190.js');self.addEventListener('install',()=>self.skipWaiting());
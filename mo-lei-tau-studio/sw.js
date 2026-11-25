// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-454cf957a9b5.js');self.addEventListener('install',()=>self.skipWaiting());
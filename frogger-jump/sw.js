// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-aeb1f31ac953.js');self.addEventListener('install',()=>self.skipWaiting());
// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-37c3e0f5f9c0.js');self.addEventListener('install',()=>self.skipWaiting());
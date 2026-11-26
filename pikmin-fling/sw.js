// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6efcdeec9c23.js');self.addEventListener('install',()=>self.skipWaiting());
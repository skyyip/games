// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3098f86f5a86.js');self.addEventListener('install',()=>self.skipWaiting());
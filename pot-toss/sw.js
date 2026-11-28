// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-895c9045e78d.js');self.addEventListener('install',()=>self.skipWaiting());
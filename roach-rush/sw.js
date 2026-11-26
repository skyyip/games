// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2efceb41b423.js');self.addEventListener('install',()=>self.skipWaiting());
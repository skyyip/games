// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-689bb9449d44.js');self.addEventListener('install',()=>self.skipWaiting());
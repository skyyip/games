// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7bfbab2cb709.js');self.addEventListener('install',()=>self.skipWaiting());
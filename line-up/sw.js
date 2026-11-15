// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-04383d019743.js');self.addEventListener('install',()=>self.skipWaiting());
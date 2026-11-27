// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-159200ca5c1f.js');self.addEventListener('install',()=>self.skipWaiting());
// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-936e24016df3.js');self.addEventListener('install',()=>self.skipWaiting());
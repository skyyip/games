// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8350474c5074.js');self.addEventListener('install',()=>self.skipWaiting());
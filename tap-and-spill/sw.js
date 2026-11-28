// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-920f2ac317d1.js');self.addEventListener('install',()=>self.skipWaiting());
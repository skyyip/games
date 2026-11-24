// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5b38c7d189fb.js');self.addEventListener('install',()=>self.skipWaiting());
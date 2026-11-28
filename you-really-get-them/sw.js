// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-076848fb7b32.js');self.addEventListener('install',()=>self.skipWaiting());
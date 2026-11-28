// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9f59a05f9d27.js');self.addEventListener('install',()=>self.skipWaiting());
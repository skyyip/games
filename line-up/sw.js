// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-339fdc5771c5.js');self.addEventListener('install',()=>self.skipWaiting());
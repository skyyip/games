// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7d183cd464f6.js');self.addEventListener('install',()=>self.skipWaiting());
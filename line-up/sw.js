// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-00988207be57.js');self.addEventListener('install',()=>self.skipWaiting());
// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6179e355fc18.js');self.addEventListener('install',()=>self.skipWaiting());
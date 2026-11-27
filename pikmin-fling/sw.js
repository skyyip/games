// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-26961b38bcb6.js');self.addEventListener('install',()=>self.skipWaiting());
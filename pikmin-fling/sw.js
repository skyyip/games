// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-23c65a3f3059.js');self.addEventListener('install',()=>self.skipWaiting());
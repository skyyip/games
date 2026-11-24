// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5fd3791b474a.js');self.addEventListener('install',()=>self.skipWaiting());
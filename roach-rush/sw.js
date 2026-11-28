// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-b210283a80c2.js');self.addEventListener('install',()=>self.skipWaiting());
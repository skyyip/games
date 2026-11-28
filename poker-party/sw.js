// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5745696b6f37.js');self.addEventListener('install',()=>self.skipWaiting());
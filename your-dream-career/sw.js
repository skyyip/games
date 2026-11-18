// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-11f65d28b0d4.js');self.addEventListener('install',()=>self.skipWaiting());
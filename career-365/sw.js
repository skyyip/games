// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-47cd7f2866f6.js');self.addEventListener('install',()=>self.skipWaiting());
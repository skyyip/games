// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ffe3182a5db3.js');self.addEventListener('install',()=>self.skipWaiting());
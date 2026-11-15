// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4e2743d28040.js');self.addEventListener('install',()=>self.skipWaiting());
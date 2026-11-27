// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3edbaa8d861a.js');self.addEventListener('install',()=>self.skipWaiting());
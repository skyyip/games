// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-82341b5a7621.js');self.addEventListener('install',()=>self.skipWaiting());
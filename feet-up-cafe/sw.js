// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-46def09fa1fb.js');self.addEventListener('install',()=>self.skipWaiting());
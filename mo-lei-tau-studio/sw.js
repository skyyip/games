// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-488e6f41f79e.js');self.addEventListener('install',()=>self.skipWaiting());
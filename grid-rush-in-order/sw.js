// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2283d46dcee6.js');self.addEventListener('install',()=>self.skipWaiting());
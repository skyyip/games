// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f3b886d98a35.js');self.addEventListener('install',()=>self.skipWaiting());
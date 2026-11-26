// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0f6bdaebd352.js');self.addEventListener('install',()=>self.skipWaiting());
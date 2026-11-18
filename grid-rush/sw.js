// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-22e65106dad1.js');self.addEventListener('install',()=>self.skipWaiting());
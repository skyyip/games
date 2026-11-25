// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4634952f02d5.js');self.addEventListener('install',()=>self.skipWaiting());
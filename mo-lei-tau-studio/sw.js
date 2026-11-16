// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ebff56261ce1.js');self.addEventListener('install',()=>self.skipWaiting());
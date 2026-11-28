// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-30ba3100112a.js');self.addEventListener('install',()=>self.skipWaiting());
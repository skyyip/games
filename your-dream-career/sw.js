// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-79319e00ee7c.js');self.addEventListener('install',()=>self.skipWaiting());
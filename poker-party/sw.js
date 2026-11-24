// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7d521480352f.js');self.addEventListener('install',()=>self.skipWaiting());
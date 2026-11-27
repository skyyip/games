// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-66d259210f1f.js');self.addEventListener('install',()=>self.skipWaiting());
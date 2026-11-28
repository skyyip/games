// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-761ca7666738.js');self.addEventListener('install',()=>self.skipWaiting());
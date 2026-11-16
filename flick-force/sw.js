// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-145c539b4490.js');self.addEventListener('install',()=>self.skipWaiting());
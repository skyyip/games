// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3106629f3d46.js');self.addEventListener('install',()=>self.skipWaiting());
// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-05a70dce378f.js');self.addEventListener('install',()=>self.skipWaiting());
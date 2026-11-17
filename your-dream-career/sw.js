// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3ac42eba5e58.js');self.addEventListener('install',()=>self.skipWaiting());
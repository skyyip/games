// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0294a8191352.js');self.addEventListener('install',()=>self.skipWaiting());
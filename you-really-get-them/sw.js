// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d697acdf329a.js');self.addEventListener('install',()=>self.skipWaiting());
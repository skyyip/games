// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1a8309d7a565.js');self.addEventListener('install',()=>self.skipWaiting());
// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1816a28beba6.js');self.addEventListener('install',()=>self.skipWaiting());
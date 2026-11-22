// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-92dc65064b3e.js');self.addEventListener('install',()=>self.skipWaiting());
// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-53051858d7c5.js');self.addEventListener('install',()=>self.skipWaiting());
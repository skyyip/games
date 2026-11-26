// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f413de2dcb86.js');self.addEventListener('install',()=>self.skipWaiting());
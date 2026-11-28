// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6df59f107eb9.js');self.addEventListener('install',()=>self.skipWaiting());
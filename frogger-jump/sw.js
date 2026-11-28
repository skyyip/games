// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0b56f657aba7.js');self.addEventListener('install',()=>self.skipWaiting());
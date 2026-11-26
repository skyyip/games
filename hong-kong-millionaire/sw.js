// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7c0b52b6424f.js');self.addEventListener('install',()=>self.skipWaiting());
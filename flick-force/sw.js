// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-43dabcffeeee.js');self.addEventListener('install',()=>self.skipWaiting());
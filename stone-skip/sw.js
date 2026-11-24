// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4557776c16ba.js');self.addEventListener('install',()=>self.skipWaiting());
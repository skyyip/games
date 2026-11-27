// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9e6adce35d82.js');self.addEventListener('install',()=>self.skipWaiting());
// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5c438392d825.js');self.addEventListener('install',()=>self.skipWaiting());
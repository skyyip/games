// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-379cf8fb36e7.js');self.addEventListener('install',()=>self.skipWaiting());
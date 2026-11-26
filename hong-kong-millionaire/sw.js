// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3e9423f762a7.js');self.addEventListener('install',()=>self.skipWaiting());
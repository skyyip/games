// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3e980ad30c61.js');self.addEventListener('install',()=>self.skipWaiting());
// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0d69066431f4.js');self.addEventListener('install',()=>self.skipWaiting());
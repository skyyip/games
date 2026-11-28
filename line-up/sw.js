// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-76d40045e8e7.js');self.addEventListener('install',()=>self.skipWaiting());
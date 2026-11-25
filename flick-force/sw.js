// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1eba89a6be15.js');self.addEventListener('install',()=>self.skipWaiting());
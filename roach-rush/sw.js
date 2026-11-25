// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-50b62b608ffd.js');self.addEventListener('install',()=>self.skipWaiting());
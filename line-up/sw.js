// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7e593a8fe489.js');self.addEventListener('install',()=>self.skipWaiting());
// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-51e6d893ee70.js');self.addEventListener('install',()=>self.skipWaiting());
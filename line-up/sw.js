// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-72daf0541dd5.js');self.addEventListener('install',()=>self.skipWaiting());
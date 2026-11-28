// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e3155e1095cb.js');self.addEventListener('install',()=>self.skipWaiting());
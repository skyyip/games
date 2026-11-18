// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2f1563a20583.js');self.addEventListener('install',()=>self.skipWaiting());
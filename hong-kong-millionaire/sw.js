// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-358a85f5f073.js');self.addEventListener('install',()=>self.skipWaiting());
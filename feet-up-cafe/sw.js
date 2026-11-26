// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-95189b4787ca.js');self.addEventListener('install',()=>self.skipWaiting());
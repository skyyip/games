// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-95d47f599f67.js');self.addEventListener('install',()=>self.skipWaiting());
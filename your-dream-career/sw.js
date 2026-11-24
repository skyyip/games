// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6598efc1ec1a.js');self.addEventListener('install',()=>self.skipWaiting());
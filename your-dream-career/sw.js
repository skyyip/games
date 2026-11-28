// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-80c750b999fe.js');self.addEventListener('install',()=>self.skipWaiting());
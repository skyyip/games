// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4cf47350bc43.js');self.addEventListener('install',()=>self.skipWaiting());
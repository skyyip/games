// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e498be06ed4e.js');self.addEventListener('install',()=>self.skipWaiting());
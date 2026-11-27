// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6665cdab05aa.js');self.addEventListener('install',()=>self.skipWaiting());
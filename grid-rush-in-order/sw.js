// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-93b5aa764501.js');self.addEventListener('install',()=>self.skipWaiting());
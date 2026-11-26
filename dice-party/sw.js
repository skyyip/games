// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4467ef1082f6.js');self.addEventListener('install',()=>self.skipWaiting());
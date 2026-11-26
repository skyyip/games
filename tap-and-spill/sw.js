// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0657faeb6018.js');self.addEventListener('install',()=>self.skipWaiting());
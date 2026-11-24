// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2bcd47124324.js');self.addEventListener('install',()=>self.skipWaiting());
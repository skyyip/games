// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-fa309721d4a8.js');self.addEventListener('install',()=>self.skipWaiting());
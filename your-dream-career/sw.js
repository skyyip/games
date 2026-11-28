// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-73401c8eedc7.js');self.addEventListener('install',()=>self.skipWaiting());
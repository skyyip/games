// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0752f8ff3028.js');self.addEventListener('install',()=>self.skipWaiting());
// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0f5c7136cc1a.js');self.addEventListener('install',()=>self.skipWaiting());
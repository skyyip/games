// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-99fc294a0d22.js');self.addEventListener('install',()=>self.skipWaiting());
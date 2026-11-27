// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6563cf06ade9.js');self.addEventListener('install',()=>self.skipWaiting());
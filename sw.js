// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-75832d7c2902.js');self.addEventListener('install',()=>self.skipWaiting());
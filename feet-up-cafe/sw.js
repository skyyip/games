// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-440b5cc6c1bc.js');self.addEventListener('install',()=>self.skipWaiting());
// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7233edcd40e7.js');self.addEventListener('install',()=>self.skipWaiting());
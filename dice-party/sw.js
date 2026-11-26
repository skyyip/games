// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-52323b0f33d7.js');self.addEventListener('install',()=>self.skipWaiting());
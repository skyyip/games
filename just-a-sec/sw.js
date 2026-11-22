// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3e19b05243e3.js');self.addEventListener('install',()=>self.skipWaiting());
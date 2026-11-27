// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9522387608ca.js');self.addEventListener('install',()=>self.skipWaiting());
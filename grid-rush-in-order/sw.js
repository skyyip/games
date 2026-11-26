// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-49a0751edc56.js');self.addEventListener('install',()=>self.skipWaiting());
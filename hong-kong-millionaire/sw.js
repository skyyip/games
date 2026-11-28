// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-60e29fa1cb38.js');self.addEventListener('install',()=>self.skipWaiting());
// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5c3e493fb489.js');self.addEventListener('install',()=>self.skipWaiting());
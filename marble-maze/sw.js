// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-53b1bea65790.js');self.addEventListener('install',()=>self.skipWaiting());
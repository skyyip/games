// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-00873e468b48.js');self.addEventListener('install',()=>self.skipWaiting());
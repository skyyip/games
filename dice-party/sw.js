// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-b60f661ffc62.js');self.addEventListener('install',()=>self.skipWaiting());